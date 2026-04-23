// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Canonical Data Hook (C-008 Resolved)
// Pulls REAL data from canonical post-C-007 tables:
//   - notifications (unread)
//   - ai_workforce_approval_queue (pending)
//   - ai_workforce_recommendations (status='new')
//   - boardroom_items (active session items)
//   - boardroom_decision_receipts (sealed decisions)
// Plus legacy helpers for goals/tasks (kept for backward compat).
//
// Demo mode → curated mock data.
// Live mode → real DB queries; errors surface as empty arrays + log,
//             never silent fallback to mocks (per reality-mode-wiring).
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";

export interface BoardroomDataShape {
  // Canonical (C-008)
  unreadNotifications: number;
  newRecommendations: number;
  notifications: any[];
  recommendations: any[];
  boardroomItems: any[];
  decisionReceipts: any[];

  // Backward-compatible (used by Boardroom.tsx, BoardroomPulseView, BoardroomApprovalView)
  pendingApprovals: any[];
  activeGoals: any[];
  overdueTasks: any[];
  recentProofs: any[];

  isLoading: boolean;
  isDemo: boolean;
}

// ─────────────────────────────────────────────────────────────
// Demo mock data (only used when isDemoMode === true)
// ─────────────────────────────────────────────────────────────

const notifications = [
  { id: "N-001", title: "Apex Corp viewed your proposal", body: "3 minutes ago", urgency: "high", domain: "business", read: false, created_at: new Date(Date.now() - 3 * 60_000).toISOString() },
  { id: "N-002", title: "Invoice #1042 cleared", body: "$2,400 received", urgency: "normal", domain: "money", read: false, created_at: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: "N-003", title: "Family dinner reminder", body: "7pm tonight", urgency: "low", domain: "concierge", read: false, created_at: new Date(Date.now() - 6 * 3600_000).toISOString() },
];

const recommendations = [
  { id: "R-001", title: "Send follow-up to 3 warming leads", summary: "REX detected pipeline cooling — re-engage now", domain: "business", severity: "medium", confidence: 0.84, status: "new", created_at: new Date(Date.now() - 4 * 3600_000).toISOString() },
  { id: "R-002", title: "Cancel unused Adobe CC seat", summary: "Zero usage for 47 days — $54/mo savings", domain: "money", severity: "low", confidence: 0.92, status: "new", created_at: new Date(Date.now() - 1 * 86_400_000).toISOString() },
  { id: "R-003", title: "Reschedule school enrollment call", summary: "Conflict with deposition — auto-propose new slot", domain: "concierge", severity: "medium", confidence: 0.78, status: "new", created_at: new Date(Date.now() - 2 * 86_400_000).toISOString() },
];

const pendingApprovals = [
  { id: "APR-001", title: "Auto-pay AWS hosting — $342", summary: "Recurring infra charge", priority: "medium", status: "pending", created_at: new Date(Date.now() - 1 * 3600_000).toISOString() },
  { id: "APR-002", title: "Send follow-up email to Sarah Chen", summary: "Warm lead, 4 days silent", priority: "low", status: "pending", created_at: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: "APR-003", title: "Cancel Adobe CC subscription", summary: "$54/mo, unused 47 days", priority: "high", status: "pending", created_at: new Date(Date.now() - 18 * 3600_000).toISOString() },
];

const boardroomItems = [
  { id: "BI-001", title: "Q2 Hiring Decision", description: "Hire contractor or defer?", domain: "business", severity: "high", recommendation_state: "deliberating", advisor_summaries: [{ advisor: "Business", position: "for" }, { advisor: "Money", position: "against" }] },
];

const decisionReceipts = [
  { id: "DR-001", approved_motion: "Adopt balanced execution strategy for Q2", rationale_summary: "Combined business+money advisor consensus", status: "sealed", created_at: new Date(Date.now() - 24 * 3600_000).toISOString() },
];

const activeGoals = [
  { id: "G-001", title: "Stabilize monthly cash flow", domain: "money", target_value: 10000, current_value: 7200, status: "active" },
  { id: "G-002", title: "Close 5 new clients this quarter", domain: "business", target_value: 5, current_value: 2, status: "active" },
  { id: "G-003", title: "Reduce household task overdue rate", domain: "concierge", target_value: 0, current_value: 3, status: "active" },
];

const overdueTasks = [
  { id: "T-001", title: "Follow up on Invoice #1035 — David Kim", domain: "business", due_at: new Date(Date.now() - 14 * 86_400_000).toISOString(), status: "overdue", priority: "high" },
  { id: "T-002", title: "School enrollment decision", domain: "concierge", due_at: new Date(Date.now() - 7 * 86_400_000).toISOString(), status: "overdue", priority: "medium" },
  { id: "T-003", title: "Reserve target shortfall review", domain: "money", due_at: new Date(Date.now() - 30 * 86_400_000).toISOString(), status: "overdue", priority: "high" },
];

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useBoardroomData(): BoardroomDataShape {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const enabled = !!user || isDemoMode;

  // 1) Notifications (unread)
  const notifications = useQuery({
    queryKey: ["boardroom-notifications", isDemoMode, user?.id],
    enabled,
    queryFn: async () => {
      if (isDemoMode) return notifications;
      if (!user) return [];
      const { data, error } = await fromTable("notifications").select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) {
        console.error("[useBoardroomData] notifications error:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 15_000,
  });

  // 2) AI Workforce Approval Queue (pending)
  const approvals = useQuery({
    queryKey: ["boardroom-approvals", isDemoMode, user?.id],
    enabled,
    queryFn: async () => {
      if (isDemoMode) return pendingApprovals;
      if (!user) return [];
      const { data, error } = await fromTable("ai_workforce_approval_queue").select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) {
        console.error("[useBoardroomData] approvals error:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 15_000,
  });

  // 3) AI Workforce Recommendations (status='new')
  const recommendations = useQuery({
    queryKey: ["boardroom-recommendations", isDemoMode, user?.id],
    enabled,
    queryFn: async () => {
      if (isDemoMode) return recommendations;
      if (!user) return [];
      const { data, error } = await fromTable("ai_workforce_recommendations").select("*")
        .eq("user_id", user.id)
        .eq("status", "new")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) {
        console.error("[useBoardroomData] recommendations error:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 15_000,
  });

  // 4) Boardroom Items (active deliberation)
  const boardroomItems = useQuery({
    queryKey: ["boardroom-items", isDemoMode, user?.id],
    enabled,
    queryFn: async () => {
      if (isDemoMode) return boardroomItems;
      if (!user) return [];
      const { data, error } = await fromTable("boardroom_items").select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) {
        console.error("[useBoardroomData] boardroom_items error:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 30_000,
  });

  // 5) Boardroom Decision Receipts (sealed decisions = canonical proof source)
  const decisionReceipts = useQuery({
    queryKey: ["boardroom-receipts", isDemoMode, user?.id],
    enabled,
    queryFn: async () => {
      if (isDemoMode) return decisionReceipts;
      if (!user) return [];
      const { data, error } = await fromTable("boardroom_decision_receipts").select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) {
        console.error("[useBoardroomData] decision_receipts error:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 30_000,
  });

  // 6) Goals (legacy backward-compat)
  const goals = useQuery({
    queryKey: ["boardroom-goals", isDemoMode, user?.id],
    enabled,
    queryFn: async () => {
      if (isDemoMode) return activeGoals;
      if (!user) return [];
      const { data, error } = await fromTable("goals").select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) {
        console.error("[useBoardroomData] goals error:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 30_000,
  });

  // 7) Overdue Tasks (legacy backward-compat)
  const overdue = useQuery({
    queryKey: ["boardroom-overdue", isDemoMode, user?.id],
    enabled,
    queryFn: async () => {
      if (isDemoMode) return overdueTasks;
      if (!user) return [];
      const { data, error } = await fromTable("tasks").select("*")
        .lt("due_at", new Date().toISOString())
        .neq("status", "completed")
        .order("due_at", { ascending: true })
        .limit(10);
      if (error) {
        console.error("[useBoardroomData] tasks error:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 30_000,
  });

  return {
    // Canonical
    unreadNotifications: notifications.data?.length || 0,
    newRecommendations: recommendations.data?.length || 0,
    notifications: notifications.data || [],
    recommendations: recommendations.data || [],
    boardroomItems: boardroomItems.data || [],
    decisionReceipts: decisionReceipts.data || [],

    // Backward-compat
    pendingApprovals: approvals.data || [],
    activeGoals: goals.data || [],
    overdueTasks: overdue.data || [],
    recentProofs: decisionReceipts.data || [], // canonical proof source = receipts

    isLoading:
      notifications.isLoading ||
      approvals.isLoading ||
      recommendations.isLoading ||
      boardroomItems.isLoading ||
      decisionReceipts.isLoading ||
      goals.isLoading ||
      overdue.isLoading,
    isDemo: isDemoMode,
  };
}
