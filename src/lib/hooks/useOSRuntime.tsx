// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Runtime Context Provider
// Single React context for all platform engines — replaces per-component
// instantiation with tree-level shared state.
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useMemo, useEffect } from "react";
import {
  ActionStateMachine, EntityRoleGraph, MemoryGovernanceEngine,
  AdvisorOrchestrationEngine, PolicyDepthEngine, RevenueOpportunityEngine,
  DigitalTwinEngine, BoardroomIntelligenceEngine, ScenarioIntelligenceEngine,
  TokenGovernanceEngine, IntegrationConciergeEngine,
  EnterpriseControlPlaneEngine, SupportDiagnosticsEngine, ObservabilityEngine,
  ReleaseSafetyEngine, TrustDeviceEngine, ComplianceAuditEngine,
} from "@/lib/engines";
import { ReplayRecoveryEngine } from "@/lib/engines/replay-recovery";
import type { OSRuntimeContext } from "@/packages/contracts";
import { createOSUnificationService } from "@/lib/services/os-unification";
import { buildActiveSurface } from "@/lib/services/surface-detection";
import { getOfflineQueueService } from "@/lib/services/offline-queue";
import { supabase } from "@/integrations/supabase/client";

export interface OSRuntime {
  context: OSRuntimeContext;
  engines: {
    entityGraph: EntityRoleGraph;
    memory: MemoryGovernanceEngine;
    advisors: AdvisorOrchestrationEngine;
    policy: PolicyDepthEngine;
    revenue: RevenueOpportunityEngine;
    twins: DigitalTwinEngine;
    boardroom: BoardroomIntelligenceEngine;
    scenarios: ScenarioIntelligenceEngine;
    tokens: TokenGovernanceEngine;
    integrations: IntegrationConciergeEngine;
    replay: ReplayRecoveryEngine;
    enterprise: EnterpriseControlPlaneEngine;
    support: SupportDiagnosticsEngine;
    observability: ObservabilityEngine;
    releases: ReleaseSafetyEngine;
    trustDevice: TrustDeviceEngine;
    compliance: ComplianceAuditEngine;
  };
  createAction: typeof ActionStateMachine;
}

const OSRuntimeCtx = createContext<OSRuntime | null>(null);

function buildRuntime(userId: string): OSRuntime {
  const entityGraph = new EntityRoleGraph();
  const memory = new MemoryGovernanceEngine();
  const advisors = new AdvisorOrchestrationEngine();
  const policy = new PolicyDepthEngine();
  const revenue = new RevenueOpportunityEngine();
  const twins = new DigitalTwinEngine();
  const boardroom = new BoardroomIntelligenceEngine();
  const scenarios = new ScenarioIntelligenceEngine();
  const tokens = new TokenGovernanceEngine();
  const integrations = new IntegrationConciergeEngine();
  const replay = new ReplayRecoveryEngine();
  const enterprise = new EnterpriseControlPlaneEngine();
  const support = new SupportDiagnosticsEngine();
  const observability = new ObservabilityEngine();
  const releases = new ReleaseSafetyEngine();
  const trustDevice = new TrustDeviceEngine();
  const compliance = new ComplianceAuditEngine();

  const context: OSRuntimeContext = {
    userId,
    sessionId: `session_${Date.now()}`,
    activeEntity: { ownerId: userId, visibility: "private" },
    trustState: {
      entityId: userId,
      posture: "verified",
      score: 94,
      dimensions: {
        policyCompliance: 98,
        proofCompleteness: 96,
        verificationHealth: 92,
        rollbackReadiness: 100,
        memoryIntegrity: 94,
        connectorHealth: 78,
        advisorGovernance: 97,
      },
      incidents: [],
      lastEvaluated: new Date().toISOString(),
    },
    activePolicies: [],
    activeLeases: [],
    displayMode: "calm",
    deviceTrust: "trusted",
  };

  return {
    context,
    engines: {
      entityGraph, memory, advisors, policy, revenue,
      twins, boardroom, scenarios, tokens, integrations, replay,
      enterprise, support, observability, releases, trustDevice, compliance,
    },
    createAction: ActionStateMachine,
  };
}

export function OSRuntimeProvider({
  userId = "default-user",
  children,
}: {
  userId?: string;
  children: React.ReactNode;
}) {
  const runtime = useMemo(() => buildRuntime(userId), [userId]);

  // Wire surface detection into OSUnificationService on mount
  useEffect(() => {
    const unification = createOSUnificationService();
    const surface = buildActiveSurface(userId);
    unification.connectSurface(surface);

    // Wire offline queue replay handler
    const offlineQueue = getOfflineQueueService();
    offlineQueue.setReplayHandler(async (mutation) => {
      try {
        const table = (supabase as any).from(mutation.table);
        let result;
        switch (mutation.operation) {
          case "insert":
            result = await table.insert(mutation.payload);
            break;
          case "update":
            result = await table.update(mutation.payload).eq("id", (mutation.payload as any).id);
            break;
          case "delete":
            result = await table.delete().eq("id", (mutation.payload as any).id);
            break;
        }
        return !result?.error;
      } catch {
        return false;
      }
    });

    // Update surface activity periodically
    const interval = setInterval(() => {
      unification.updateActivity(surface.surfaceId);
    }, 60_000);

    return () => {
      clearInterval(interval);
      unification.disconnectSurface(surface.surfaceId);
    };
  }, [userId]);

  return (
    <OSRuntimeCtx.Provider value={runtime}>
      {children}
    </OSRuntimeCtx.Provider>
  );
}

/**
 * Access the OS runtime from any component in the tree.
 * Must be used inside an <OSRuntimeProvider>.
 * Backward-compatible: accepts optional userId but ignores it
 * when consumed from context.
 */
export function useOSRuntime(_userId?: string): OSRuntime {
  const ctx = useContext(OSRuntimeCtx);
  if (ctx) return ctx;

  // Fallback for components not yet inside the provider —
  // preserves backward compat during migration.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(() => buildRuntime(_userId ?? "default-user"), [_userId]);
}
