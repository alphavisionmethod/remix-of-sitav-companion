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
  ExecutionDebtEngine, InvisibleLaborEngine, DragEngine, FounderBottleneckEngine,
} from "@/domains/engines";
import { ReplayRecoveryEngine } from "@/domains/engines/replay-recovery";
import type { OSRuntimeContext } from "@/packages/contracts";
import { createOSUnificationService } from "@/lib/services/os-unification";
import { buildActiveSurface } from "@/lib/services/surface-detection";
import { getOfflineQueueService } from "@/lib/services/offline-queue";
import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

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
    executionDebt: ExecutionDebtEngine;
    invisibleLabor: InvisibleLaborEngine;
    drag: DragEngine;
    bottleneck: FounderBottleneckEngine;
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
  const executionDebt = new ExecutionDebtEngine();
  const invisibleLabor = new InvisibleLaborEngine();
  const drag = new DragEngine();
  const bottleneck = new FounderBottleneckEngine();

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
      executionDebt, invisibleLabor, drag, bottleneck,
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
        const table = fromDynamicTable(mutation.table);
        let result;
        switch (mutation.operation) {
          case "insert":
            result = await table.insert(mutation.payload);
            break;
          case "update":
            result = await table.update(mutation.payload).eq("id", (mutation.payload as Record<string, unknown>).id as string);
            break;
          case "delete":
            result = await table.delete().eq("id", (mutation.payload as Record<string, unknown>).id as string);
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

  // ── Engine State Persistence ────────────────────────────────
  // Load persisted engine states on mount & auto-save real state periodically
  useEffect(() => {
    let cancelled = false;

    const ENGINE_MAP: Record<string, { serialize: () => Record<string, unknown>; hydrate: (s: Record<string, unknown>) => void }> = {
      "entity-graph": runtime.engines.entityGraph,
      "memory-governance": runtime.engines.memory,
      "advisor-orchestration": runtime.engines.advisors,
      "policy-depth": runtime.engines.policy,
      "revenue-opportunity": runtime.engines.revenue,
      "digital-twin": runtime.engines.twins,
      "boardroom-intelligence": runtime.engines.boardroom,
      "scenario-intelligence": runtime.engines.scenarios,
      "token-governance": runtime.engines.tokens,
      "replay-recovery": runtime.engines.replay,
      "enterprise-control": runtime.engines.enterprise,
      "support-diagnostics": runtime.engines.support,
      "observability": runtime.engines.observability,
      "release-safety": runtime.engines.releases,
      "trust-device": runtime.engines.trustDevice,
      "compliance-audit": runtime.engines.compliance,
    };

    // Load persisted states for all engines
    import("@/data/persistence/engine-persistence-adapter").then(
      async ({ loadAllEngineStates, debouncedPersistEngineState }) => {
        if (cancelled) return;
        const states = await loadAllEngineStates();
        if (cancelled) return;

        // Hydrate each engine from its persisted state
        let hydratedCount = 0;
        for (const [name, engine] of Object.entries(ENGINE_MAP)) {
          const persisted = states[name];
          if (persisted && typeof engine.hydrate === "function") {
            try {
              engine.hydrate(persisted);
              hydratedCount++;
            } catch (e) {
              console.warn(`[OS Runtime] Failed to hydrate ${name}:`, e);
            }
          }
        }
        if (hydratedCount > 0) {
          console.debug(`[OS Runtime] Hydrated ${hydratedCount}/${Object.keys(ENGINE_MAP).length} engines from persisted state`);
        }

        // Auto-save real engine state every 30s
        const saveInterval = setInterval(() => {
          for (const [name, engine] of Object.entries(ENGINE_MAP)) {
            if (typeof engine.serialize === "function") {
              try {
                const state = engine.serialize();
                debouncedPersistEngineState(name, {
                  ...state,
                  _lastPersisted: new Date().toISOString(),
                  _sessionId: runtime.context.sessionId,
                });
              } catch (e) {
                console.warn(`[OS Runtime] Failed to serialize ${name}:`, e);
              }
            }
          }
        }, 30_000);

        // Store cleanup ref
        (window as unknown as Record<string, unknown>).__sitaEngineSaveInterval = saveInterval;
      },
    ).catch(console.error);

    // Also save immediately before unload
    const handleBeforeUnload = () => {
      for (const [name, engine] of Object.entries(ENGINE_MAP)) {
        if (typeof engine.serialize === "function") {
          try {
            import("@/data/persistence/engine-persistence-adapter").then(({ persistEngineState }) => {
              persistEngineState(name, {
                ...engine.serialize(),
                _lastPersisted: new Date().toISOString(),
                _sessionId: runtime.context.sessionId,
              });
            });
          } catch { /* best-effort */ }
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      const saveInterval = (window as unknown as Record<string, unknown>).__sitaEngineSaveInterval;
      if (saveInterval) clearInterval(saveInterval as number);
    };
  }, [userId, runtime]);

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
