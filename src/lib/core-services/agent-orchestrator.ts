// ═══════════════════════════════════════════════════════════════
// SITA OS — Agent Runtime Orchestrator
// Lifecycle manager, scheduler, and task queue for the 40-agent fleet
// ═══════════════════════════════════════════════════════════════

import type { InternalAgentDefinition, AgentRuntimeState, AgentScheduleType } from "@/lib/internal-agents/types";
import { ALL_DETAILED_AGENTS } from "@/lib/internal-agents/agents";
import {
  AUTONOMY_TIERS,
  NEVER_ALLOWED,
  MUST_REQUIRE_HUMAN_APPROVAL,
  MUST_SIMULATE_FIRST,
  PROMOTION_RULES,
  DEMOTION_TRIGGERS,
  getAutonomyLevel,
  type PromotionRule,
  type DemotionTrigger,
} from "@/lib/internal-agents/rights";
import { EventBus } from "./event-bus";
import { ReceiptService, createReceiptService } from "./receipt-service";

// ── Types ───────────────────────────────────────────────────────

export interface AgentWorkItem {
  id: string;
  agentId: string;
  trigger: string;
  priority: number;
  createdAt: number;
  status: "queued" | "running" | "completed" | "failed";
  result?: unknown;
  error?: string;
  durationMs?: number;
}

export interface FleetStatus {
  totalAgents: number;
  active: number;
  paused: number;
  cooldown: number;
  error: number;
  totalInvocations: number;
  totalCostTokens: number;
  totalCostCompute: number;
  totalEscalations: number;
  totalFailures: number;
  queueDepth: number;
  uptimeMs: number;
  lastTickAt: number;
}

export interface OrchestratorConfig {
  tickIntervalMs: number;
  maxConcurrentAgents: number;
  costBudgetUsd: number;
  enableAutoPromotion: boolean;
  enableAutoDemotion: boolean;
}

// ── Schedule tracking ───────────────────────────────────────────

interface ScheduleState {
  lastRun: number;
  nextRun: number;
  schedule: AgentScheduleType;
}

function getIntervalMs(schedule: AgentScheduleType): number {
  switch (schedule) {
    case "continuous": return 60_000;
    case "hourly": return 3_600_000;
    case "daily": return 86_400_000;
    case "on-event": return Infinity;
  }
}

// ── Agent Orchestrator ──────────────────────────────────────────

export class AgentOrchestrator {
  private runtimeStates = new Map<string, AgentRuntimeState>();
  private schedules = new Map<string, ScheduleState>();
  private workQueue: AgentWorkItem[] = [];
  private completedWork: AgentWorkItem[] = [];
  private agents: InternalAgentDefinition[];
  private config: OrchestratorConfig;
  private eventBus: EventBus;
  private receipts: ReceiptService;
  private tickHandle: ReturnType<typeof setInterval> | null = null;
  private bootedAt = 0;
  private lastTickAt = 0;

  constructor(options?: {
    eventBus?: EventBus;
    receipts?: ReceiptService;
    config?: Partial<OrchestratorConfig>;
  }) {
    this.agents = ALL_DETAILED_AGENTS;
    this.eventBus = options?.eventBus ?? new EventBus();
    this.receipts = options?.receipts ?? createReceiptService();
    this.config = {
      tickIntervalMs: 60_000,
      maxConcurrentAgents: 10,
      costBudgetUsd: 50,
      enableAutoPromotion: true,
      enableAutoDemotion: true,
      ...options?.config,
    };
  }

  // ── Boot ────────────────────────────────────────────────────

  boot(): void {
    this.bootedAt = Date.now();
    const now = this.bootedAt;

    for (const agent of this.agents) {
      // Initialize runtime state
      this.runtimeStates.set(agent.agentId, {
        agentId: agent.agentId,
        status: "active",
        invocationCount: Math.floor(Math.random() * 200) + 10,
        lastAction: "System boot — agent initialized",
        lastActionTimestamp: new Date(now).toISOString(),
        confidenceAvg: 0.7 + Math.random() * 0.25,
        costTokens: Math.floor(Math.random() * 5000),
        costCompute: parseFloat((Math.random() * 2).toFixed(4)),
        escalationCount: Math.floor(Math.random() * 5),
        failureCount: Math.floor(Math.random() * 3),
        simulationOnly: getAutonomyLevel(agent.maxAutonomyLevel) < 3,
      });

      // Initialize schedule
      const intervalMs = getIntervalMs(agent.schedule);
      this.schedules.set(agent.agentId, {
        lastRun: now,
        nextRun: intervalMs === Infinity ? Infinity : now + intervalMs,
        schedule: agent.schedule,
      });
    }

    // Register event-driven agents with EventBus
    for (const agent of this.agents) {
      if (agent.schedule === "on-event" && agent.triggerEvents.length > 0) {
        for (const eventTopic of agent.triggerEvents) {
          this.eventBus.subscribe(eventTopic, async () => {
            this.enqueueWork(agent.agentId, `event:${eventTopic}`);
          }, `agent:${agent.agentId}`);
        }
      }
    }

    // Start tick loop
    this.tickHandle = setInterval(() => this.tick(), this.config.tickIntervalMs);

    this.eventBus.publish("orchestrator.booted.v1", {
      agentCount: this.agents.length,
      timestamp: now,
    }, { source: "agent-orchestrator" });
  }

  shutdown(): void {
    if (this.tickHandle) {
      clearInterval(this.tickHandle);
      this.tickHandle = null;
    }
  }

  // ── Tick ────────────────────────────────────────────────────

  tick(): void {
    const now = Date.now();
    this.lastTickAt = now;

    for (const agent of this.agents) {
      const state = this.runtimeStates.get(agent.agentId);
      const schedule = this.schedules.get(agent.agentId);
      if (!state || !schedule) continue;

      // Skip paused/error agents
      if (state.status !== "active") continue;

      // Check schedule
      if (schedule.schedule === "on-event") continue; // event-driven only
      if (now < schedule.nextRun) continue;

      // Enqueue work
      this.enqueueWork(agent.agentId, `schedule:${schedule.schedule}`);

      // Update next run
      const intervalMs = getIntervalMs(schedule.schedule);
      schedule.lastRun = now;
      schedule.nextRun = now + intervalMs;
    }

    // Process queue
    this.processQueue();
  }

  // ── Work Queue ──────────────────────────────────────────────

  private enqueueWork(agentId: string, trigger: string): void {
    const agent = this.agents.find(a => a.agentId === agentId);
    if (!agent) return;

    const autonomyLevel = getAutonomyLevel(agent.maxAutonomyLevel);

    this.workQueue.push({
      id: crypto.randomUUID(),
      agentId,
      trigger,
      priority: autonomyLevel,
      createdAt: Date.now(),
      status: "queued",
    });
  }

  private processQueue(): void {
    // Sort by priority (higher autonomy = lower priority number = processed first? No, higher = more capable)
    this.workQueue.sort((a, b) => b.priority - a.priority);

    const running = this.workQueue.filter(w => w.status === "running").length;
    const available = this.config.maxConcurrentAgents - running;

    for (let i = 0; i < available; i++) {
      const next = this.workQueue.find(w => w.status === "queued");
      if (!next) break;
      this.executeWorkItem(next);
    }
  }

  private executeWorkItem(item: AgentWorkItem): void {
    const agent = this.agents.find(a => a.agentId === item.agentId);
    const state = this.runtimeStates.get(item.agentId);
    if (!agent || !state) {
      item.status = "failed";
      item.error = "Agent not found";
      return;
    }

    item.status = "running";
    const startTime = Date.now();

    // Confidence check
    if (state.confidenceAvg < agent.confidenceRules.minConfidenceToAct) {
      // Can only observe
      item.status = "completed";
      item.result = { action: "observe-only", reason: "Below confidence threshold" };
      item.durationMs = Date.now() - startTime;
      this.completedWork.push(item);
      return;
    }

    // Simulate execution
    const autonomyLevel = getAutonomyLevel(agent.maxAutonomyLevel);
    const simulated = autonomyLevel < 3 || state.simulationOnly;

    // Update runtime state
    state.invocationCount++;
    state.lastAction = simulated
      ? `Simulated: ${item.trigger}`
      : `Executed: ${item.trigger}`;
    state.lastActionTimestamp = new Date().toISOString();
    state.costTokens += Math.floor(Math.random() * 100);
    state.costCompute += parseFloat((Math.random() * 0.05).toFixed(4));

    // Random success (95% success rate)
    const succeeded = Math.random() > 0.05;
    if (!succeeded) {
      state.failureCount++;
      item.status = "failed";
      item.error = "Agent execution failed (simulated failure)";

      // Auto-demotion check
      if (this.config.enableAutoDemotion && state.failureCount > 5) {
        this.demoteAgent(agent.agentId);
      }
    } else {
      item.status = "completed";
      item.result = {
        action: simulated ? "simulation" : "execution",
        trigger: item.trigger,
        agentId: item.agentId,
        autonomyLevel,
      };
    }

    item.durationMs = Date.now() - startTime;
    this.completedWork.push(item);

    // Generate receipt
    this.receipts.createReceipt(item.id, "execution-summary", {
      agentId: item.agentId,
      trigger: item.trigger,
      status: item.status,
      simulated,
      durationMs: item.durationMs,
    });

    // Remove from queue
    const idx = this.workQueue.indexOf(item);
    if (idx !== -1) this.workQueue.splice(idx, 1);
  }

  // ── Agent Lifecycle ─────────────────────────────────────────

  runAgent(agentId: string): AgentWorkItem | null {
    const agent = this.agents.find(a => a.agentId === agentId);
    if (!agent) return null;
    this.enqueueWork(agentId, "manual:run");
    this.processQueue();
    return this.completedWork.find(w => w.agentId === agentId && w.trigger === "manual:run") ?? null;
  }

  pauseAgent(agentId: string): boolean {
    const state = this.runtimeStates.get(agentId);
    if (!state) return false;
    state.status = "paused";
    this.eventBus.publish("agent.paused.v1", { agentId }, { source: "agent-orchestrator" });
    return true;
  }

  resumeAgent(agentId: string): boolean {
    const state = this.runtimeStates.get(agentId);
    if (!state) return false;
    state.status = "active";
    this.eventBus.publish("agent.resumed.v1", { agentId }, { source: "agent-orchestrator" });
    return true;
  }

  promoteAgent(agentId: string): boolean {
    const agent = this.agents.find(a => a.agentId === agentId);
    if (!agent) return false;
    const currentLevel = getAutonomyLevel(agent.maxAutonomyLevel);
    const rule = PROMOTION_RULES.find(r => r.fromLevel === currentLevel);
    if (!rule) return false;

    // In a real system, this would check all requirements
    this.eventBus.publish("agent.promoted.v1", {
      agentId,
      from: currentLevel,
      to: rule.toLevel,
    }, { source: "agent-orchestrator" });
    return true;
  }

  demoteAgent(agentId: string): boolean {
    const state = this.runtimeStates.get(agentId);
    if (!state) return false;

    state.status = "cooldown";
    this.eventBus.publish("agent.demoted.v1", {
      agentId,
      reason: "automatic-demotion",
    }, { source: "agent-orchestrator" });
    return true;
  }

  // ── Status Queries ──────────────────────────────────────────

  getAgentStatus(agentId: string): AgentRuntimeState | undefined {
    return this.runtimeStates.get(agentId);
  }

  getAllAgentStates(): AgentRuntimeState[] {
    return Array.from(this.runtimeStates.values());
  }

  getFleetStatus(): FleetStatus {
    const states = Array.from(this.runtimeStates.values());
    return {
      totalAgents: states.length,
      active: states.filter(s => s.status === "active").length,
      paused: states.filter(s => s.status === "paused").length,
      cooldown: states.filter(s => s.status === "cooldown").length,
      error: states.filter(s => s.status === "error").length,
      totalInvocations: states.reduce((sum, s) => sum + s.invocationCount, 0),
      totalCostTokens: states.reduce((sum, s) => sum + s.costTokens, 0),
      totalCostCompute: states.reduce((sum, s) => sum + s.costCompute, 0),
      totalEscalations: states.reduce((sum, s) => sum + s.escalationCount, 0),
      totalFailures: states.reduce((sum, s) => sum + s.failureCount, 0),
      queueDepth: this.workQueue.length,
      uptimeMs: this.bootedAt ? Date.now() - this.bootedAt : 0,
      lastTickAt: this.lastTickAt,
    };
  }

  getWorkQueue(): AgentWorkItem[] {
    return [...this.workQueue];
  }

  getRecentWork(limit = 20): AgentWorkItem[] {
    return this.completedWork.slice(-limit);
  }

  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }

  updateConfig(partial: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...partial };
    if (partial.tickIntervalMs && this.tickHandle) {
      clearInterval(this.tickHandle);
      this.tickHandle = setInterval(() => this.tick(), this.config.tickIntervalMs);
    }
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createAgentOrchestrator(options?: {
  eventBus?: EventBus;
  receipts?: ReceiptService;
  config?: Partial<OrchestratorConfig>;
}): AgentOrchestrator {
  const orchestrator = new AgentOrchestrator(options);
  orchestrator.boot();
  return orchestrator;
}
