// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel React Context
// Provides unified access to all kernel services via hooks
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useEffect, useMemo, useCallback, useState, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { resolveRouteLayer, resolveRouteDomain, type Layer } from "@/platform/architecture/layer-manifest";
import { SitaKernel, getSitaKernel } from "@/lib/sita-kernel";
import { useEntityContext } from "@/contexts/EntityContext";
import type { CanonicalChainResult } from "@/lib/core-services/index";
import type { Receipt } from "@/lib/core-services/receipt-service";
import type { MemoryEntry } from "@/lib/core-services/memory-service";
import type { CoreTrustState } from "@/lib/core-services/trust-state-service";
import {
  createSelfHealingService, createImmuneController, createFleetHealthService,
  HEALING_CAPABILITY_MAP, ESCALATION_RULES, DEGRADED_MODES,
} from "@/lib/core-services/self-healing";
import { LifeShockSimulator } from "@/lib/services/life-simulation";

// ── Context ─────────────────────────────────────────────────────

const KernelCtx = createContext<SitaKernel | null>(null);

// ── Provider ────────────────────────────────────────────────────

export function SitaKernelProvider({ children }: { children: ReactNode }) {
  const kernel = useMemo(() => getSitaKernel(), []);
  const { current: entity } = useEntityContext();

  // Sync entity context into kernel whenever it changes
  useEffect(() => {
    kernel.setActiveEntity(entity);
  }, [kernel, entity]);

  return <KernelCtx.Provider value={kernel}>{children}</KernelCtx.Provider>;
}

// ── Core Hook ───────────────────────────────────────────────────

export function useSitaKernel(): SitaKernel {
  const kernel = useContext(KernelCtx);
  if (!kernel) {
    // Fallback: return the singleton even outside provider (e.g. tests)
    return getSitaKernel();
  }
  return kernel;
}

// ── Canonical Action Hook ───────────────────────────────────────

export function useCanonicalAction() {
  const kernel = useSitaKernel();
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    domain: string,
    capabilityId: string,
    payload: Record<string, unknown>,
    options?: { amount?: number; isSimulation?: boolean; intent?: string }
  ): Promise<Record<string, unknown> | null> => {
    setIsExecuting(true);
    setError(null);
    try {
      const result = await kernel.executeAction({
        intent: options?.intent ?? capabilityId,
        domain,
        capabilityId,
        payload,
        amount: options?.amount,
        isSimulation: options?.isSimulation,
      });
      setLastResult(result as Record<string, unknown>);
      return result as Record<string, unknown>;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Execution failed";
      setError(msg);
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [kernel]);

  return { execute, isExecuting, lastResult, error };
}

// ── Shared Memory Hook ──────────────────────────────────────────

export function useSharedMemory(key?: string) {
  const kernel = useSitaKernel();
  const [entries, setEntries] = useState<MemoryEntry[]>([]);

  useEffect(() => {
    const refresh = () => {
      if (key) {
        const results = kernel.memory.query({ key });
        setEntries(results);
      } else {
        setEntries(kernel.memory.query({}));
      }
    };
    refresh();

    // Subscribe to memory-related events to auto-refresh
    const subId = kernel.eventBus.subscribe("memory.*", refresh, "shared-memory-hook");
    // Also refresh on any execution (which stores memory)
    const execSubId = kernel.eventBus.subscribe("execution.completed.v1", refresh, "shared-memory-exec");

    return () => {
      kernel.eventBus.unsubscribe(subId);
      kernel.eventBus.unsubscribe(execSubId);
    };
  }, [kernel, key]);

  const store = useCallback((k: string, value: unknown, options?: { tags?: string[]; confidence?: number }) => {
    kernel.storeMemory(k, value, options);
    // Trigger a refresh event
    kernel.emitEvent("memory.stored.v1", { key: k });
  }, [kernel]);

  return { entries, store };
}

// ── Shared Trust Hook ───────────────────────────────────────────

export function useSharedTrust(entityId?: string) {
  const kernel = useSitaKernel();
  const [trustState, setTrustState] = useState<CoreTrustState | null>(null);

  useEffect(() => {
    const id = entityId ?? kernel.tenantId;
    const state = kernel.trust.get(id);
    setTrustState(state ?? null);

    const subId = kernel.eventBus.subscribe("trust.*", () => {
      const updated = kernel.trust.get(id);
      setTrustState(updated ?? null);
    }, "shared-trust-hook");

    return () => {
      kernel.eventBus.unsubscribe(subId);
    };
  }, [kernel, entityId]);

  return { trustState, auditLog: kernel.trust.getAuditLog({ entityId: entityId ?? kernel.tenantId }) };
}

// ── Entity-Scoped Data Hook ─────────────────────────────────────

export function useEntityScoped() {
  const kernel = useSitaKernel();
  const { current } = useEntityContext();

  return {
    entityId: current.id,
    entityType: current.type,
    entityName: current.name,
    tenantId: kernel.tenantId,
    kernel,
  };
}

// ── Lease Hook ──────────────────────────────────────────────────

export function useCapabilityLease() {
  const kernel = useSitaKernel();
  const [activeLeases, setActiveLeases] = useState(kernel.leases.getActiveLeases());

  useEffect(() => {
    const subId = kernel.eventBus.subscribe("lease.*", () => {
      setActiveLeases(kernel.leases.getActiveLeases());
    }, "lease-hook");
    return () => { kernel.eventBus.unsubscribe(subId); };
  }, [kernel]);

  const issueLease = useCallback(async (request: Parameters<typeof kernel.leases.issueLease>[0]) => {
    const lease = await kernel.leases.issueLease(request);
    setActiveLeases(kernel.leases.getActiveLeases());
    return lease;
  }, [kernel]);

  const validateLease = useCallback((leaseId: string, action: string, system: string, amount?: number) => {
    return kernel.leases.validate(leaseId, action, system, amount);
  }, [kernel]);

  const revokeLease = useCallback(async (leaseId: string, reason: string) => {
    const result = await kernel.leases.revokeLease(leaseId, "user", reason);
    setActiveLeases(kernel.leases.getActiveLeases());
    return result;
  }, [kernel]);

  return { activeLeases, issueLease, validateLease, revokeLease, stats: kernel.leases.getLeaseStats(), leaseManager: kernel.leases };
}

// ── Constitution Hook ───────────────────────────────────────────

export function useConstitution() {
  const kernel = useSitaKernel();
  const [rules, setRules] = useState(kernel.constitution.getAllRules());

  useEffect(() => {
    const subId = kernel.eventBus.subscribe("constitution.*", () => {
      setRules(kernel.constitution.getAllRules());
    }, "constitution-hook");
    return () => { kernel.eventBus.unsubscribe(subId); };
  }, [kernel]);

  const compileRule = useCallback(async (naturalLanguage: string, options?: { priority?: number; enforcementMode?: "strict" | "advisory" | "learning" }) => {
    const rule = await kernel.constitution.compile({
      naturalLanguage,
      entityId: kernel.tenantId,
      createdBy: "owner",
      ...options,
    });
    setRules(kernel.constitution.getAllRules());
    return rule;
  }, [kernel]);

  const evaluate = useCallback((context: Parameters<typeof kernel.constitution.evaluate>[0]) => {
    return kernel.constitution.evaluate(context);
  }, [kernel]);

  const toggleRule = useCallback((id: string, active: boolean) => {
    kernel.constitution.toggleRule(id, active);
    setRules(kernel.constitution.getAllRules());
  }, [kernel]);

  const deleteRule = useCallback((id: string) => {
    kernel.constitution.deleteRule(id);
    setRules(kernel.constitution.getAllRules());
  }, [kernel]);

  return { rules, compileRule, evaluate, toggleRule, deleteRule, stats: kernel.constitution.getStats(), compiler: kernel.constitution };
}

// ── Kernel Status Hook ──────────────────────────────────────────

export function useKernelStatus() {
  const kernel = useSitaKernel();
  const [status, setStatus] = useState(kernel.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(kernel.getStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, [kernel]);

  return status;
}

// ── Workflow Recovery Hook ──────────────────────────────────

export function useWorkflowRecovery() {
  const kernel = useSitaKernel();

  const createCheckpoint = useCallback((workflowId: string, reason: string) => {
    const wf = kernel.workflows.getWorkflow(workflowId);
    if (!wf) return null;
    return kernel.workflowRecovery.createCheckpoint(wf, reason);
  }, [kernel]);

  const recoverFromCheckpoint = useCallback((checkpointId: string) => {
    return kernel.workflowRecovery.recoverFromCheckpoint(kernel.workflows, checkpointId);
  }, [kernel]);

  return {
    createCheckpoint,
    recoverFromCheckpoint,
    getCheckpoints: kernel.workflowRecovery.getCheckpoints.bind(kernel.workflowRecovery),
    deadLetterQueue: kernel.workflowRecovery.getDeadLetterQueue(),
    recoveryManager: kernel.workflowRecovery,
  };
}

// ── Workflow Replay Hook ────────────────────────────────────

export function useWorkflowReplay() {
  const kernel = useSitaKernel();

  const replay = useCallback((workflowId: string) => {
    return kernel.workflowReplay.replay(kernel.workflows, workflowId);
  }, [kernel]);

  return { replay, replayEngine: kernel.workflowReplay };
}

// ── Transition Validator Hook ───────────────────────────────

export function useTransitionValidator() {
  const kernel = useSitaKernel();
  const [guards, setGuards] = useState(kernel.transitionValidator.getGuards());

  const addGuard = useCallback((guard: Parameters<typeof kernel.transitionValidator.addGuard>[0]) => {
    kernel.transitionValidator.addGuard(guard);
    setGuards(kernel.transitionValidator.getGuards());
  }, [kernel]);

  const validate = useCallback((workflowId: string, toState: Parameters<typeof kernel.workflows.transition>[1]) => {
    const wf = kernel.workflows.getWorkflow(workflowId);
    if (!wf) return { allowed: false, blockers: ["Workflow not found"], warnings: [] };
    return kernel.transitionValidator.validate(wf, toState);
  }, [kernel]);

  return { guards, addGuard, validate, validator: kernel.transitionValidator };
}

// ── Receipt Verification Hook ───────────────────────────────

export function useReceiptVerification() {
  const kernel = useSitaKernel();
  return {
    verifyIntegrity: kernel.receiptVerification.verifyIntegrity.bind(kernel.receiptVerification),
    validateChain: kernel.receiptVerification.validateChain.bind(kernel.receiptVerification),
    createReceipt: kernel.receiptVerification.createReceipt.bind(kernel.receiptVerification),
    detectTamper: kernel.receiptVerification.detectTamper.bind(kernel.receiptVerification),
    service: kernel.receiptVerification,
  };
}

// ── Website Manager Hook ────────────────────────────────────

export function useWebsiteManager() {
  const kernel = useSitaKernel();
  const [pages, setPages] = useState(kernel.websiteManager.listPages());

  const refresh = useCallback(() => {
    setPages(kernel.websiteManager.listPages());
  }, [kernel]);

  const createPage = useCallback((...args: Parameters<typeof kernel.websiteManager.createPage>) => {
    const page = kernel.websiteManager.createPage(...args);
    refresh();
    return page;
  }, [kernel, refresh]);

  const updatePage = useCallback((...args: Parameters<typeof kernel.websiteManager.updatePage>) => {
    const page = kernel.websiteManager.updatePage(...args);
    refresh();
    return page;
  }, [kernel, refresh]);

  const publishPage = useCallback((pageId: string) => {
    const page = kernel.websiteManager.publishPage(pageId);
    refresh();
    return page;
  }, [kernel, refresh]);

  return {
    pages,
    createPage,
    updatePage,
    publishPage,
    archivePage: kernel.websiteManager.archivePage.bind(kernel.websiteManager),
    getStats: kernel.websiteManager.getStats.bind(kernel.websiteManager),
    auditSEO: kernel.websiteManager.auditSEO.bind(kernel.websiteManager),
    domains: kernel.websiteManager.listDomains(),
    manager: kernel.websiteManager,
    refresh,
  };
}

// ── Cloud Control Plane Hook ────────────────────────────────

export function useCloudControlPlane() {
  const kernel = useSitaKernel();
  return {
    registerRegion: kernel.cloudControlPlane.registerRegion.bind(kernel.cloudControlPlane),
    getRegion: kernel.cloudControlPlane.getRegion.bind(kernel.cloudControlPlane),
    listRegions: kernel.cloudControlPlane.listRegions.bind(kernel.cloudControlPlane),
    setRegionStatus: kernel.cloudControlPlane.setRegionStatus.bind(kernel.cloudControlPlane),
    getRoutingDecision: kernel.cloudControlPlane.getRoutingDecision.bind(kernel.cloudControlPlane),
    registerProvider: kernel.cloudControlPlane.registerProvider.bind(kernel.cloudControlPlane),
    getProviderHealth: kernel.cloudControlPlane.getProviderHealth.bind(kernel.cloudControlPlane),
    failoverRegion: kernel.cloudControlPlane.failoverRegion.bind(kernel.cloudControlPlane),
    getTopology: kernel.cloudControlPlane.getEnvironmentTopology.bind(kernel.cloudControlPlane),
    getCostByRegion: kernel.cloudControlPlane.getCostByRegion.bind(kernel.cloudControlPlane),
    getDemoTopology: kernel.cloudControlPlane.getDemoTopology.bind(kernel.cloudControlPlane),
    service: kernel.cloudControlPlane,
  };
}

// ── Edge Device Runtime Hook ────────────────────────────────

export function useEdgeDeviceRuntime() {
  const kernel = useSitaKernel();
  return {
    registerRuntime: kernel.edgeDeviceRuntime.registerRuntime.bind(kernel.edgeDeviceRuntime),
    heartbeat: kernel.edgeDeviceRuntime.heartbeat.bind(kernel.edgeDeviceRuntime),
    getRuntime: kernel.edgeDeviceRuntime.getRuntime.bind(kernel.edgeDeviceRuntime),
    listRuntimes: kernel.edgeDeviceRuntime.listRuntimes.bind(kernel.edgeDeviceRuntime),
    assignTask: kernel.edgeDeviceRuntime.assignTask.bind(kernel.edgeDeviceRuntime),
    reportTaskResult: kernel.edgeDeviceRuntime.reportTaskResult.bind(kernel.edgeDeviceRuntime),
    getSyncState: kernel.edgeDeviceRuntime.getSyncState.bind(kernel.edgeDeviceRuntime),
    markSynced: kernel.edgeDeviceRuntime.markSynced.bind(kernel.edgeDeviceRuntime),
    getOfflineDevices: kernel.edgeDeviceRuntime.getOfflineDevices.bind(kernel.edgeDeviceRuntime),
    getFleetSummary: kernel.edgeDeviceRuntime.getFleetSummary.bind(kernel.edgeDeviceRuntime),
    getDemoRuntimes: kernel.edgeDeviceRuntime.getDemoRuntimes.bind(kernel.edgeDeviceRuntime),
    service: kernel.edgeDeviceRuntime,
  };
}

// ── Fleet OTA Hook ──────────────────────────────────────────

export function useFleetOTA() {
  const kernel = useSitaKernel();
  return {
    createRelease: kernel.fleetOTA.createRelease.bind(kernel.fleetOTA),
    publishRelease: kernel.fleetOTA.publishRelease.bind(kernel.fleetOTA),
    getRelease: kernel.fleetOTA.getRelease.bind(kernel.fleetOTA),
    listReleases: kernel.fleetOTA.listReleases.bind(kernel.fleetOTA),
    createRolloutPlan: kernel.fleetOTA.createRolloutPlan.bind(kernel.fleetOTA),
    startRollout: kernel.fleetOTA.startRollout.bind(kernel.fleetOTA),
    pauseRollout: kernel.fleetOTA.pauseRollout.bind(kernel.fleetOTA),
    resumeRollout: kernel.fleetOTA.resumeRollout.bind(kernel.fleetOTA),
    rollbackRollout: kernel.fleetOTA.rollbackRollout.bind(kernel.fleetOTA),
    reportDeviceUpdate: kernel.fleetOTA.reportDeviceUpdate.bind(kernel.fleetOTA),
    getRolloutProgress: kernel.fleetOTA.getRolloutProgress.bind(kernel.fleetOTA),
    getVersionDistribution: kernel.fleetOTA.getVersionDistribution.bind(kernel.fleetOTA),
    getDemoData: kernel.fleetOTA.getDemoData.bind(kernel.fleetOTA),
    service: kernel.fleetOTA,
  };
}

// ── Incident Management Hook ────────────────────────────────

export function useIncidentManagement() {
  const kernel = useSitaKernel();
  return {
    declareIncident: kernel.incidentManagement.declareIncident.bind(kernel.incidentManagement),
    triageIncident: kernel.incidentManagement.triageIncident.bind(kernel.incidentManagement),
    updateStatus: kernel.incidentManagement.updateStatus.bind(kernel.incidentManagement),
    addTimelineEntry: kernel.incidentManagement.addTimelineEntry.bind(kernel.incidentManagement),
    resolveIncident: kernel.incidentManagement.resolveIncident.bind(kernel.incidentManagement),
    createPostmortem: kernel.incidentManagement.createPostmortem.bind(kernel.incidentManagement),
    getIncident: kernel.incidentManagement.getIncident.bind(kernel.incidentManagement),
    listIncidents: kernel.incidentManagement.listIncidents.bind(kernel.incidentManagement),
    getActiveIncidents: kernel.incidentManagement.getActiveIncidents.bind(kernel.incidentManagement),
    getIncidentMetrics: kernel.incidentManagement.getIncidentMetrics.bind(kernel.incidentManagement),
    getDemoIncidents: kernel.incidentManagement.getDemoIncidents.bind(kernel.incidentManagement),
    service: kernel.incidentManagement,
  };
}

// ── Fraud Sentinel Hook ─────────────────────────────────────────

export function useFraudSentinel() {
  const kernel = useSitaKernel();
  return kernel.fraudSentinel;
}

// ── Governance Simulator Hook ───────────────────────────────────

export function useGovernanceSimulator() {
  const kernel = useSitaKernel();
  return kernel.governanceSimulator;
}

// ── Search Fabric Hook ──────────────────────────────────────────

export function useSearchFabric() {
  const kernel = useSitaKernel();
  return kernel.searchFabric;
}

// ── Self-Healing Services Hook ──────────────────────────────────

export function useSelfHealingServices() {
  return useMemo(() => ({
    selfHealing: createSelfHealingService(),
    immune: createImmuneController(),
    fleet: createFleetHealthService(),
    capabilities: HEALING_CAPABILITY_MAP,
    escalation: ESCALATION_RULES,
    degradedModes: DEGRADED_MODES,
  }), []);
}

// ── Life Simulator Hook ─────────────────────────────────────────

export function useLifeSimulator(scenarioCount = 500) {
  return useMemo(() => new LifeShockSimulator(scenarioCount), [scenarioCount]);
}

// ── Emergency Halt Hook ─────────────────────────────────────────

export function useEmergencyHalt() {
  const kernel = useSitaKernel();
  return {
    issueHalt: kernel.emergencyHalt.issueHalt.bind(kernel.emergencyHalt),
    resolveHalt: kernel.emergencyHalt.resolveHalt.bind(kernel.emergencyHalt),
    checkHalt: kernel.emergencyHalt.checkHalt.bind(kernel.emergencyHalt),
    isSystemHalted: kernel.emergencyHalt.isSystemHalted.bind(kernel.emergencyHalt),
    getActiveOrders: kernel.emergencyHalt.getActiveOrders.bind(kernel.emergencyHalt),
    getAllOrders: kernel.emergencyHalt.getAllOrders.bind(kernel.emergencyHalt),
    service: kernel.emergencyHalt,
  };
}

// ── Layer Awareness Hook ────────────────────────────────────

export function useCurrentLayer(): { layer: Layer; domain?: string } {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const location = useLocation();
    return {
      layer: resolveRouteLayer(location.pathname),
      domain: resolveRouteDomain(location.pathname),
    };
  } catch {
    return { layer: "app" as Layer };
  }
}
