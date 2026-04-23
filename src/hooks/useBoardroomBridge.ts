// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Bridge Hook
// React wrapper for domain ↔ boardroom communication
// Now integrated with orchestration pipeline
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
import { createDomainSignal, emitDomainSignal } from "@/lib/services/orchestration-pipeline/signal-emitter";
import { getSynthesisForDomain } from "@/lib/services/orchestration-pipeline/app-board-synthesizer";
import { registerItem, transitionState } from "@/lib/services/orchestration-pipeline/issue-lifecycle";
import type { AppBoardSynthesis, Domain } from "@/lib/services/orchestration-pipeline/types";
import { useCallback, useMemo } from "react";

// Demo fallback data
const ESCALATIONS: Record<string, any[]> = {
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

const DECISIONS: Record<string, any[]> = {
  business: [
    { id: "demo-dec-1", summary: "Initiate phased collections outreach", domain: "business", status: "proposed", confidence: 0.72, created_at: "2026-04-02T10:14:00Z", payload: { approved_motion: "Phased collections for Q1 receivables" } },
  ],
  finance: [],
  concierge: [],
};

export function useBoardroomBridge(domain: Domain) {
  const { isDemoMode } = useDataMode();
  const qc = useQueryClient();

  const escalationsQuery = useQuery({
    queryKey: ["boardroom-escalations", domain],
    queryFn: async () => {
      if (isDemoMode) return ESCALATIONS[domain] || [];
      return getEscalationsByDomain(domain);
    },
    staleTime: 15_000,
  });

  const decisionsQuery = useQuery({
    queryKey: ["boardroom-decisions", domain],
    queryFn: async () => {
      if (isDemoMode) return DECISIONS[domain] || [];
      return getDecisionsForDomain(domain);
    },
    staleTime: 15_000,
  });

  const escalateMutation = useMutation({
    mutationFn: async (payload: EscalationPayload) => {
      // Emit a domain signal through the pipeline
      const signal = createDomainSignal({
        module: domain,
        domain: payload.domain,
        severity: payload.severity,
        summary: payload.title,
        source: `${domain}-app-shell`,
        trigger_type: "immediate",
      });
      emitDomainSignal(signal);

      if (isDemoMode) {
        toast.success(`Escalated to Boardroom: ${payload.title}`);
        return { success: true, id: `demo-${Date.now()}` };
      }
      return escalateToBoardroom(payload);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Register item in lifecycle state machine
        const itemId = (result as any).id || `esc-${Date.now()}`;
        registerItem(itemId);
        transitionState(itemId, "advisor_review", "Escalated from domain app");

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
        // Transition item to executed in lifecycle
        const itemId = (result as any).id || `dec-${Date.now()}`;
        transitionState(itemId, "executed", "Decision pushed to domain app");

        qc.invalidateQueries({ queryKey: ["boardroom-decisions", domain] });
        qc.invalidateQueries({ queryKey: ["approval-queue"] });
        if (!isDemoMode) toast.success(`Decision pushed to ${domain}`);
      }
    },
  });

  // Pipeline synthesis for this domain
  const synthesis: AppBoardSynthesis | null = useMemo(() => {
    return getSynthesisForDomain(domain);
  }, [domain]);

  // Emit a domain signal without full escalation
  const emitSignal = useCallback((module: string, severity: "low" | "medium" | "high" | "critical", summary: string) => {
    const signal = createDomainSignal({ module, domain, severity, summary, source: `${domain}-manual` });
    emitDomainSignal(signal);
  }, [domain]);

  return {
    escalations: escalationsQuery.data || [],
    decisions: decisionsQuery.data || [],
    pendingCount: (escalationsQuery.data || []).length,
    decisionCount: (decisionsQuery.data || []).length,
    escalate: escalateMutation.mutate,
    pushDecision: pushDecisionMutation.mutate,
    isLoading: escalationsQuery.isLoading || decisionsQuery.isLoading,
    isDemoMode,
    // Pipeline additions
    synthesis,
    emitSignal,
  };
}
