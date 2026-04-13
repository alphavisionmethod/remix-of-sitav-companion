// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Bridge Hook
// React wrapper for domain ↔ boardroom communication
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataMode } from "@/contexts/DataModeContext";
import { toast } from "sonner";
import {
  escalateToBoardroom,
  pushDecisionToApp,
  getEscalationsByDomain,
  getDecisionsForDomain,
  type EscalationPayload,
  type DecisionPush,
} from "@/lib/services/boardroom-bridge";

// Demo fallback data
const DEMO_ESCALATIONS: Record<string, any[]> = {
  business: [
    { id: "demo-esc-1", title: "Collections action review — 3 overdue invoices", domain: "business", severity: "high", status: "active", created_at: new Date().toISOString() },
  ],
  finance: [
    { id: "demo-esc-2", title: "Reserve shortfall — $2,800 below target", domain: "finance", severity: "medium", status: "active", created_at: new Date().toISOString() },
  ],
  concierge: [
    { id: "demo-esc-3", title: "Travel prep decision — Q2 client visit", domain: "concierge", severity: "low", status: "new", created_at: new Date().toISOString() },
  ],
};

const DEMO_DECISIONS: Record<string, any[]> = {
  business: [
    { id: "demo-dec-1", summary: "Initiate phased collections outreach", domain: "business", status: "proposed", confidence: 0.72, created_at: "2026-04-02T10:14:00Z", payload: { approved_motion: "Phased collections for Q1 receivables" } },
  ],
  finance: [],
  concierge: [],
};

export function useBoardroomBridge(domain: "business" | "finance" | "concierge") {
  const { isDemoMode } = useDataMode();
  const qc = useQueryClient();

  const escalationsQuery = useQuery({
    queryKey: ["boardroom-escalations", domain],
    queryFn: async () => {
      if (isDemoMode) return DEMO_ESCALATIONS[domain] || [];
      return getEscalationsByDomain(domain);
    },
    staleTime: 15_000,
  });

  const decisionsQuery = useQuery({
    queryKey: ["boardroom-decisions", domain],
    queryFn: async () => {
      if (isDemoMode) return DEMO_DECISIONS[domain] || [];
      return getDecisionsForDomain(domain);
    },
    staleTime: 15_000,
  });

  const escalateMutation = useMutation({
    mutationFn: async (payload: EscalationPayload) => {
      if (isDemoMode) {
        toast.success(`Escalated to Boardroom: ${payload.title}`);
        return { success: true };
      }
      return escalateToBoardroom(payload);
    },
    onSuccess: (result) => {
      if (result.success) {
        qc.invalidateQueries({ queryKey: ["boardroom-escalations", domain] });
        qc.invalidateQueries({ queryKey: ["boardroom-items"] });
        if (!isDemoMode) toast.success("Issue escalated to Boardroom");
      } else {
        toast.error("Escalation failed: " + (result as any).error);
      }
    },
  });

  const pushDecisionMutation = useMutation({
    mutationFn: async (push: DecisionPush) => {
      if (isDemoMode) {
        toast.success(`Decision sent to ${domain} app`);
        return { success: true };
      }
      return pushDecisionToApp(push);
    },
    onSuccess: (result) => {
      if (result.success) {
        qc.invalidateQueries({ queryKey: ["boardroom-decisions", domain] });
        qc.invalidateQueries({ queryKey: ["approval-queue"] });
        if (!isDemoMode) toast.success(`Decision pushed to ${domain}`);
      }
    },
  });

  return {
    escalations: escalationsQuery.data || [],
    decisions: decisionsQuery.data || [],
    pendingCount: (escalationsQuery.data || []).length,
    decisionCount: (decisionsQuery.data || []).length,
    escalate: escalateMutation.mutate,
    pushDecision: pushDecisionMutation.mutate,
    isLoading: escalationsQuery.isLoading || decisionsQuery.isLoading,
    isDemoMode,
  };
}
