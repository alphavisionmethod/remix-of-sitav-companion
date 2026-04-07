// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Real Data Hook
// Pulls priorities from approval_queue, goals, and overdue tasks
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";
export interface BoardroomPrepData {
  pendingApprovals: any[];
  activeGoals: any[];
  overdueTasks: any[];
  recentProofs: any[];
  isLoading: boolean;
}

// Mock data for demo mode
const mockPendingApprovals = [
  { id: "APR-001", title: "Auto-pay AWS hosting — $342", domain: "money", risk_level: "medium", created_at: "2026-04-02T10:00:00Z" },
  { id: "APR-002", title: "Send follow-up email to Sarah Chen", domain: "business", risk_level: "low", created_at: "2026-04-02T09:00:00Z" },
  { id: "APR-003", title: "Cancel Adobe CC subscription", domain: "money", risk_level: "high", created_at: "2026-04-01T15:00:00Z" },
];

const mockActiveGoals = [
  { id: "G-001", title: "Stabilize monthly cash flow", domain: "money", target_value: 10000, current_value: 7200, status: "active" },
  { id: "G-002", title: "Close 5 new clients this quarter", domain: "business", target_value: 5, current_value: 2, status: "active" },
  { id: "G-003", title: "Reduce household task overdue rate", domain: "concierge", target_value: 0, current_value: 3, status: "active" },
];

const mockOverdueTasks = [
  { id: "T-001", title: "Follow up on Invoice #1035 — David Kim", domain: "business", due_at: "2026-03-20T00:00:00Z", status: "overdue", priority: "high" },
  { id: "T-002", title: "School enrollment decision", domain: "concierge", due_at: "2026-03-28T00:00:00Z", status: "overdue", priority: "medium" },
  { id: "T-003", title: "Reserve target shortfall review", domain: "money", due_at: "2026-03-10T00:00:00Z", status: "overdue", priority: "high" },
];

const mockRecentProofs = [
  { id: "P-001", proof_type: "payment_received", verification_status: "verified", created_at: "2026-04-02T08:00:00Z", correlation_id: "INV-1038" },
  { id: "P-002", proof_type: "email_sent", verification_status: "verified", created_at: "2026-04-02T06:00:00Z", correlation_id: "QUOTE-1042" },
  { id: "P-003", proof_type: "call_completed", verification_status: "verified", created_at: "2026-04-01T12:00:00Z", correlation_id: "CALL-001" },
];

export function useBoardroomData(): BoardroomPrepData {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  const approvals = useQuery({
    queryKey: ["boardroom-approvals", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockPendingApprovals;
      if (!user) return [];
      const { data, error } = await fromTable("approval_queue").select("*")
        .eq("status", "pending").order("created_at", { ascending: false }).limit(10);
      if (error) return mockPendingApprovals;
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 15000,
  });

  const goals = useQuery({
    queryKey: ["boardroom-goals", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockActiveGoals;
      if (!user) return [];
      const { data, error } = await fromTable("goals").select("*")
        .eq("status", "active").order("created_at", { ascending: false }).limit(10);
      if (error) return mockActiveGoals;
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });

  const overdue = useQuery({
    queryKey: ["boardroom-overdue", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockOverdueTasks;
      if (!user) return [];
      const { data, error } = await fromTable("tasks").select("*")
        .lt("due_at", new Date().toISOString())
        .neq("status", "completed")
        .order("due_at", { ascending: true }).limit(10);
      if (error) return mockOverdueTasks;
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });

  const proofs = useQuery({
    queryKey: ["boardroom-proofs", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockRecentProofs;
      if (!user) return [];
      const { data, error } = await fromTable("sita_proof_records").select("*")
        .order("created_at", { ascending: false }).limit(20);
      if (error) return mockRecentProofs;
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });

  return {
    pendingApprovals: approvals.data || [],
    activeGoals: goals.data || [],
    overdueTasks: overdue.data || [],
    recentProofs: proofs.data || [],
    isLoading: approvals.isLoading || goals.isLoading || overdue.isLoading || proofs.isLoading,
  };
}
