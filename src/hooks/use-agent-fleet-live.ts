// ═══════════════════════════════════════════════════════════════
// SITA OS — Live Agent Fleet Hook
// Replaces mock data in Mission Control with real service data
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { AgentHealthMonitorService, createAgentHealthMonitor } from "@/lib/services/ai-workforce/agent-health-monitor";
import { AgentControlService, createAgentControl } from "@/lib/services/admin-service/agent-control";
import { CostCircuitBreakerService, createCostCircuitBreaker } from "@/lib/services/ai-economics/cost-circuit-breaker";
import { HealthAggregatorService, createHealthAggregator } from "@/lib/services/observability/health-aggregator";
import type { AgentHealthSnapshot, HealthIncident } from "@/lib/services/ai-workforce/agent-health-monitor";
import type { AgentRuntimeState, FleetControlSummary } from "@/lib/services/admin-service/agent-control";
import type { SystemHealthReport } from "@/lib/services/observability/health-aggregator";
import type { FleetBudgetSummary } from "@/lib/services/ai-economics/cost-circuit-breaker";

export interface AgentFleetLiveState {
  agents: AgentRuntimeState[];
  healthSnapshots: AgentHealthSnapshot[];
  activeIncidents: HealthIncident[];
  fleetSummary: FleetControlSummary;
  systemHealth: SystemHealthReport;
  costSummary: FleetBudgetSummary;
  isLoading: boolean;
  // Actions
  pauseAgent: (agentId: string, reason: string) => void;
  resumeAgent: (agentId: string, reason: string) => void;
  suspendAgent: (agentId: string, reason: string) => void;
  restartAgent: (agentId: string, reason: string) => void;
  promoteAgent: (agentId: string, newLevel: string, reason: string) => void;
  demoteAgent: (agentId: string, newLevel: string, reason: string) => void;
  refreshHealth: () => void;
}

// Singleton services (shared across hook instances)
let _healthMonitor: AgentHealthMonitorService | null = null;
let _agentControl: AgentControlService | null = null;
let _costBreaker: CostCircuitBreakerService | null = null;
let _healthAggregator: HealthAggregatorService | null = null;
let _initialized = false;

function getServices() {
  if (!_healthMonitor) _healthMonitor = createAgentHealthMonitor();
  if (!_agentControl) _agentControl = createAgentControl();
  if (!_costBreaker) _costBreaker = createCostCircuitBreaker();
  if (!_healthAggregator) _healthAggregator = createHealthAggregator();
  return { healthMonitor: _healthMonitor, agentControl: _agentControl, costBreaker: _costBreaker, healthAggregator: _healthAggregator };
}

// Seed default agents on first initialization
function seedDefaults() {
  if (_initialized) return;
  _initialized = true;
  const { healthMonitor, agentControl, costBreaker } = getServices();

  const defaultAgents = [
    { id: "agent-arch-gov", name: "Architecture Governance", level: "L1-suggest" },
    { id: "agent-knowledge", name: "Knowledge Coordination", level: "L1-suggest" },
    { id: "agent-product", name: "Product Build", level: "L2-draft" },
    { id: "agent-reliability", name: "Reliability Ops", level: "L3-simulate" },
    { id: "agent-cost", name: "Runtime Cost", level: "L2-draft" },
    { id: "agent-security", name: "Security Trust", level: "L4-auto-reversible" },
  ];

  for (const a of defaultAgents) {
    healthMonitor.registerAgent(a.id, 100);
    healthMonitor.recordHeartbeat(a.id);
    agentControl.registerAgent({
      agentId: a.id, name: a.name,
      status: "idle", autonomyLevel: a.level,
      healthScore: 100, taskQueueDepth: 0,
      errorCount: 0, lastActivityAt: new Date().toISOString(),
      costBudgetCents: 500, costSpentCents: 0,
    });
    costBreaker.configureBudget({
      agentId: a.id, period: "hourly", budgetCents: 500,
      warnThreshold: 0.7, throttleThreshold: 0.85,
      pauseThreshold: 0.95, haltThreshold: 1.0,
      autoDowngradeModel: true,
    });
  }
}

export function useAgentFleetLive(): AgentFleetLiveState {
  const { healthMonitor, agentControl, costBreaker, healthAggregator } = getServices();
  seedDefaults();

  const [state, setState] = useState<{
    agents: AgentRuntimeState[];
    healthSnapshots: AgentHealthSnapshot[];
    activeIncidents: HealthIncident[];
    fleetSummary: FleetControlSummary;
    systemHealth: SystemHealthReport;
    costSummary: FleetBudgetSummary;
    isLoading: boolean;
  }>({
    agents: [],
    healthSnapshots: [],
    activeIncidents: [],
    fleetSummary: { totalAgents: 0, active: 0, paused: 0, suspended: 0, idle: 0, recentActions: [], overridesActive: 0 },
    systemHealth: { overallScore: 100, level: "nominal", trend: "stable", signals: [], degradedComponents: [], criticalComponents: [], recommendations: [], computedAt: new Date().toISOString(), historyWindow: [] },
    costSummary: { totalBudgetCents: 0, totalSpentCents: 0, utilizationPercent: 0, agentCount: 0, breakerStates: { closed: 0, warn: 0, throttle: 0, pause: 0, halt: 0 }, violations24h: 0, projectedOverrunCents: 0 },
    isLoading: true,
  });

  const refreshHealth = useCallback(() => {
    // Feed health aggregator
    const fleetSummary = agentControl.getFleetSummary();
    const healthSnaps = healthMonitor.getAllSnapshots();
    const fleetScore = healthMonitor.getFleetHealthScore();
    const costSummary = costBreaker.getFleetSummary();

    healthAggregator.reportAgentHealth(
      fleetScore,
      healthSnaps.filter(s => s.status !== "healthy").length,
      healthSnaps.length
    );
    healthAggregator.reportCostBreaker(
      costSummary.utilizationPercent,
      costSummary.breakerStates.halt
    );

    const systemHealth = healthAggregator.computeHealth();

    setState({
      agents: agentControl.getAllAgentStates(),
      healthSnapshots: healthSnaps,
      activeIncidents: healthMonitor.getActiveIncidents(),
      fleetSummary,
      systemHealth,
      costSummary,
      isLoading: false,
    });
  }, [healthMonitor, agentControl, costBreaker, healthAggregator]);

  // Initial load + periodic refresh
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    refreshHealth();
    intervalRef.current = setInterval(refreshHealth, 10_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [refreshHealth]);

  const pauseAgent = useCallback((agentId: string, reason: string) => {
    agentControl.pauseAgent(agentId, "admin", reason);
    refreshHealth();
  }, [agentControl, refreshHealth]);

  const resumeAgent = useCallback((agentId: string, reason: string) => {
    agentControl.resumeAgent(agentId, "admin", reason);
    refreshHealth();
  }, [agentControl, refreshHealth]);

  const suspendAgent = useCallback((agentId: string, reason: string) => {
    agentControl.suspendAgent(agentId, "admin", reason);
    refreshHealth();
  }, [agentControl, refreshHealth]);

  const restartAgent = useCallback((agentId: string, reason: string) => {
    agentControl.restartAgent(agentId, "admin", reason);
    refreshHealth();
  }, [agentControl, refreshHealth]);

  const promoteAgent = useCallback((agentId: string, newLevel: string, reason: string) => {
    agentControl.promoteAgent(agentId, "admin", newLevel, reason);
    refreshHealth();
  }, [agentControl, refreshHealth]);

  const demoteAgent = useCallback((agentId: string, newLevel: string, reason: string) => {
    agentControl.demoteAgent(agentId, "admin", newLevel, reason);
    refreshHealth();
  }, [agentControl, refreshHealth]);

  return {
    ...state,
    pauseAgent, resumeAgent, suspendAgent, restartAgent,
    promoteAgent, demoteAgent, refreshHealth,
  };
}
