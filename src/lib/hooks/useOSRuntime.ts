// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified OS Runtime Hook
// Single entry point to all platform engines for any surface
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import {
  ActionStateMachine, EntityRoleGraph, MemoryGovernanceEngine,
  AdvisorOrchestrationEngine, PolicyDepthEngine, RevenueOpportunityEngine,
  DigitalTwinEngine, BoardroomIntelligenceEngine, ScenarioIntelligenceEngine,
  TokenGovernanceEngine, IntegrationConciergeEngine,
} from "@/lib/engines";
import { ReplayRecoveryEngine } from "@/lib/engines/replay-recovery";
import type { OSRuntimeContext } from "@/lib/types/os-unified.types";

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
  };
  /** Create a new action-state machine for a workflow */
  createAction: typeof ActionStateMachine;
}

/**
 * Singleton OS runtime — all engines share one instance per session.
 * Every surface (business, money, concierge, boardroom, admin, etc.)
 * MUST use this hook instead of instantiating engines directly.
 */
export function useOSRuntime(userId: string = "default-user"): OSRuntime {
  return useMemo(() => {
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
      },
      createAction: ActionStateMachine,
    };
  }, [userId]);
}
