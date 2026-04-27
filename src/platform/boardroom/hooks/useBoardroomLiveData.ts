// ============================================================
// SITA OS — Boardroom Live Data Hook
// Queries 5 boardroom tables with demo-mode fallback
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useDataMode } from "@/contexts/DataModeContext";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────
export interface LiveSession {
  id: string;
  status: string;
  scope: string;
  session_type: string;
  session_mode: string;
  opened_at: string;
  closed_at: string | null;
  participating_advisors: string[];
  current_issue_id: string | null;
  decision_receipt_ids: string[];
}

export interface LiveItem {
  id: string;
  title: string;
  description: string;
  domain: string;
  severity: string;
  status: string;
  recommendation_state: string;
  simulation_state: string;
  confidence_state: Record<string, any>;
  evidence_refs: any[];
  freshness_state: Record<string, any>;
  blocking_conditions: any[];
  advisor_summaries: Record<string, any>;
  source_signals: any[];
  session_id: string | null;
  created_at: string;
}

export interface LiveEvidence {
  id: string;
  source_type: string;
  source_name: string;
  content: string;
  confidence: number;
  freshness: string;
  lineage_chain: any[];
  item_id: string | null;
  last_updated: string;
}

export interface LiveRecommendation {
  id: string;
  summary: string;
  rationale: string;
  confidence_score: number;
  urgency: string;
  reversibility: string;
  status: string;
  evidence_basis: any[];
  domain_impacts: any[];
  conditions_for_approval: any[];
  next_best_alternative: string | null;
  scenario_basis: string | null;
  item_id: string | null;
  session_id: string | null;
}

export interface LiveReceipt {
  id: string;
  approved_motion: string;
  rationale_summary: string;
  status: string;
  created_at: string;
  expected_outcome: string | null;
  follow_up_review_date: string | null;
  evidence_snapshot: any[];
  simulation_snapshot: Record<string, any>;
  approval_conditions: any[];
  linked_execution_items: any[];
  proof_trail: any[];
  session_id: string | null;
  item_id: string | null;
  recommendation_id: string | null;
}

// ── Demo fallbacks ─────────────────────────────────────────
const ITEMS: LiveItem[] = [
  {
    id: "demo-a1", title: "Collections action review — 3 overdue invoices",
    description: "David Kim ($4,200), Sarah Chen ($1,800), TechCorp ($12,500) — combined $18,500 overdue.",
    domain: "business", severity: "high", status: "active",
    recommendation_state: "pending", simulation_state: "complete",
    confidence_state: { overall: 72 }, evidence_refs: [],
    freshness_state: { last_check: "12 min ago" }, blocking_conditions: [],
    advisor_summaries: { revenue: "Phased outreach recommended", crm: "Preserve relationship" },
    source_signals: [{ type: "invoice_aging", signal: "3 accounts overdue" }],
    session_id: null, created_at: new Date().toISOString(),
  },
  {
    id: "demo-a2", title: "Reserve shortfall — $2,800 below target",
    description: "Current reserves at $7,200 vs $10,000 target.",
    domain: "finance", severity: "medium", status: "active",
    recommendation_state: "pending", simulation_state: "none",
    confidence_state: { overall: 65 }, evidence_refs: [],
    freshness_state: { last_check: "3 hours ago" }, blocking_conditions: [],
    advisor_summaries: { obligations: "Defer non-essential subscriptions" },
    source_signals: [], session_id: null, created_at: new Date().toISOString(),
  },
  {
    id: "demo-a3", title: "Travel prep decision — Q2 client visit",
    description: "NYC client visit Apr 22-24. All logistics ready.",
    domain: "concierge", severity: "low", status: "active",
    recommendation_state: "ready", simulation_state: "none",
    confidence_state: { overall: 88 }, evidence_refs: [],
    freshness_state: { last_check: "45 min ago" }, blocking_conditions: [],
    advisor_summaries: { travel: "All systems green" },
    source_signals: [], session_id: null, created_at: new Date().toISOString(),
  },
];

const RECEIPTS: LiveReceipt[] = [
  {
    id: "demo-r1", approved_motion: "Approved phased collections for Q1 receivables",
    rationale_summary: "Phased outreach to 4 overdue accounts segmented by relationship value",
    status: "sealed", created_at: "2026-03-15T10:14:00Z",
    expected_outcome: "Recover $22,400 within 18 days", follow_up_review_date: "2026-03-22T10:00:00Z",
    evidence_snapshot: [], simulation_snapshot: {}, approval_conditions: [],
    linked_execution_items: [], proof_trail: [], session_id: null, item_id: null, recommendation_id: null,
  },
  {
    id: "demo-r2", approved_motion: "Deferred subscription audit by 2 weeks",
    rationale_summary: "Review all subscriptions for redundancy",
    status: "sealed", created_at: "2026-03-08T09:30:00Z",
    expected_outcome: "Find $127/mo savings", follow_up_review_date: "2026-03-22T09:00:00Z",
    evidence_snapshot: [], simulation_snapshot: {}, approval_conditions: [],
    linked_execution_items: [], proof_trail: [], session_id: null, item_id: null, recommendation_id: null,
  },
];

// ── Hook ───────────────────────────────────────────────────
export function useBoardroomLiveData() {
  const { isDemoMode } = useDataMode();
  const qc = useQueryClient();

  // Sessions
  const sessionsQuery = useQuery({
    queryKey: ["boardroom-sessions"],
    queryFn: async () => {
      if (isDemoMode) return [] as LiveSession[];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await fromTable("boardroom_sessions")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return (data || []) as LiveSession[];
    },
    staleTime: 15_000,
  });

  // Items
  const itemsQuery = useQuery({
    queryKey: ["boardroom-items"],
    queryFn: async () => {
      if (isDemoMode) return ITEMS;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return ITEMS;
      const { data, error } = await fromTable("boardroom_items")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return (data && data.length > 0 ? data : ITEMS) as LiveItem[];
    },
    staleTime: 15_000,
  });

  // Evidence
  const evidenceQuery = useQuery({
    queryKey: ["boardroom-evidence"],
    queryFn: async () => {
      if (isDemoMode) return [] as LiveEvidence[];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await fromTable("boardroom_evidence")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return (data || []) as LiveEvidence[];
    },
    staleTime: 15_000,
  });

  // Recommendations
  const recsQuery = useQuery({
    queryKey: ["boardroom-recommendations"],
    queryFn: async () => {
      if (isDemoMode) return [] as LiveRecommendation[];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await fromTable("boardroom_recommendations")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return (data || []) as LiveRecommendation[];
    },
    staleTime: 15_000,
  });

  // Receipts
  const receiptsQuery = useQuery({
    queryKey: ["boardroom-receipts"],
    queryFn: async () => {
      if (isDemoMode) return RECEIPTS;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return RECEIPTS;
      const { data, error } = await fromTable("boardroom_decision_receipts")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return (data && data.length > 0 ? data : RECEIPTS) as LiveReceipt[];
    },
    staleTime: 15_000,
  });

  // ── Mutations ──────────────────────────────────────────────

  const createReceipt = useMutation({
    mutationFn: async (receipt: {
      approved_motion: string;
      rationale_summary: string;
      expected_outcome?: string;
      evidence_snapshot?: any[];
      simulation_snapshot?: Record<string, any>;
      session_id?: string;
      item_id?: string;
      recommendation_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await fromTable("boardroom_decision_receipts").insert({
        user_id: user.id,
        approved_motion: receipt.approved_motion,
        rationale_summary: receipt.rationale_summary,
        expected_outcome: receipt.expected_outcome || null,
        evidence_snapshot: receipt.evidence_snapshot || [],
        simulation_snapshot: receipt.simulation_snapshot || {},
        session_id: receipt.session_id || null,
        item_id: receipt.item_id || null,
        recommendation_id: receipt.recommendation_id || null,
        follow_up_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "sealed",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boardroom-receipts"] });
      toast.success("Decision receipt sealed");
    },
    onError: (e) => toast.error("Receipt creation failed: " + e.message),
  });

  const createActionItem = useMutation({
    mutationFn: async (item: {
      summary: string;
      domain: string;
      advisor_id: string;
      confidence: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await fromTable("advisor_action_queue").insert({
        user_id: user.id,
        summary: item.summary,
        domain: item.domain,
        advisor_id: item.advisor_id,
        confidence: item.confidence,
        action_type: "boardroom_follow_through",
        status: "proposed",
        requires_approval: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approval-queue"] });
    },
  });

  const submitEvidence = useMutation({
    mutationFn: async (ev: {
      source_name: string;
      source_type: string;
      content: string;
      confidence: number;
      item_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await fromTable("boardroom_evidence").insert({
        user_id: user.id,
        source_name: ev.source_name,
        source_type: ev.source_type,
        content: ev.content,
        confidence: ev.confidence,
        item_id: ev.item_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boardroom-evidence"] });
      toast.success("Evidence submitted");
    },
  });

  // ── Lifecycle transition mutation ───────────────────────────
  const transitionItem = useMutation({
    mutationFn: async ({ itemId, newStatus }: { itemId: string; newStatus: string }) => {
      // Sync in-memory lifecycle
      const { transitionState } = await import("@/lib/services/orchestration-pipeline/issue-lifecycle");
      const result = transitionState(itemId, newStatus as any, "User action from Boardroom");
      if (!result.success) throw new Error(result.error);

      // Sync to database
      if (!isDemoMode) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fromTable("boardroom_items")
            .update({ status: newStatus })
            .eq("id", itemId)
            .eq("user_id", user.id);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boardroom-items"] });
    },
    onError: (e) => toast.error("Transition failed: " + e.message),
  });

  return {
    sessions: sessionsQuery.data || [],
    items: itemsQuery.data || ITEMS,
    evidence: evidenceQuery.data || [],
    recommendations: recsQuery.data || [],
    receipts: receiptsQuery.data || RECEIPTS,
    isLoading: itemsQuery.isLoading || receiptsQuery.isLoading,
    createReceipt,
    createActionItem,
    submitEvidence,
    transitionItem,
    isDemoMode,
  };
}
