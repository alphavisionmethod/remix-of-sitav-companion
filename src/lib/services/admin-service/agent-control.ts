// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Agent Control Backend
// Pause/resume/promote/demote agents, force-trigger, cost override,
// suspension with audit trail
// ═══════════════════════════════════════════════════════════════

export type AgentControlAction = "pause" | "resume" | "promote" | "demote" | "suspend" | "unsuspend" | "force_trigger" | "cost_override" | "restart";

export interface AgentControlRecord {
  id: string;
  agentId: string;
  action: AgentControlAction;
  performedBy: string;
  reason: string;
  timestamp: string;
  previousState: Record<string, unknown>;
  newState: Record<string, unknown>;
  expiresAt?: string;          // for temporary overrides
  reverted: boolean;
  revertedAt?: string;
}

export interface AgentRuntimeState {
  agentId: string;
  name: string;
  status: "idle" | "assigned" | "executing" | "paused" | "suspended" | "retired";
  autonomyLevel: string;
  healthScore: number;
  taskQueueDepth: number;
  errorCount: number;
  lastActivityAt: string;
  costBudgetCents: number;
  costSpentCents: number;
  costOverride?: { budgetCents: number; expiresAt: string; reason: string };
  suspensionReason?: string;
  suspendedAt?: string;
}

export interface FleetControlSummary {
  totalAgents: number;
  active: number;
  paused: number;
  suspended: number;
  idle: number;
  recentActions: AgentControlRecord[];
  overridesActive: number;
}

export class AgentControlService {
  private auditLog: AgentControlRecord[] = [];
  private logCounter = 0;
  private runtimeStates = new Map<string, AgentRuntimeState>();
  private costOverrides = new Map<string, { budgetCents: number; expiresAt: string; reason: string }>();

  // ── Agent Registration ────────────────────────────────────────

  registerAgent(state: AgentRuntimeState): void {
    this.runtimeStates.set(state.agentId, { ...state });
  }

  updateState(agentId: string, partial: Partial<AgentRuntimeState>): AgentRuntimeState | null {
    const state = this.runtimeStates.get(agentId);
    if (!state) return null;
    Object.assign(state, partial);
    return state;
  }

  // ── Control Actions ───────────────────────────────────────────

  pauseAgent(agentId: string, performedBy: string, reason: string): AgentControlRecord | null {
    return this.executeAction(agentId, "pause", performedBy, reason, (state) => {
      state.status = "paused";
    });
  }

  resumeAgent(agentId: string, performedBy: string, reason: string): AgentControlRecord | null {
    return this.executeAction(agentId, "resume", performedBy, reason, (state) => {
      state.status = "idle";
      state.suspensionReason = undefined;
      state.suspendedAt = undefined;
    });
  }

  suspendAgent(agentId: string, performedBy: string, reason: string): AgentControlRecord | null {
    return this.executeAction(agentId, "suspend", performedBy, reason, (state) => {
      state.status = "suspended";
      state.suspensionReason = reason;
      state.suspendedAt = new Date().toISOString();
    });
  }

  unsuspendAgent(agentId: string, performedBy: string, reason: string): AgentControlRecord | null {
    return this.executeAction(agentId, "unsuspend", performedBy, reason, (state) => {
      state.status = "idle";
      state.suspensionReason = undefined;
      state.suspendedAt = undefined;
    });
  }

  promoteAgent(agentId: string, performedBy: string, newLevel: string, reason: string): AgentControlRecord | null {
    return this.executeAction(agentId, "promote", performedBy, reason, (state) => {
      state.autonomyLevel = newLevel;
    });
  }

  demoteAgent(agentId: string, performedBy: string, newLevel: string, reason: string): AgentControlRecord | null {
    return this.executeAction(agentId, "demote", performedBy, reason, (state) => {
      state.autonomyLevel = newLevel;
    });
  }

  forceTrigger(agentId: string, performedBy: string, reason: string): AgentControlRecord | null {
    return this.executeAction(agentId, "force_trigger", performedBy, reason, (state) => {
      state.status = "executing";
      state.lastActivityAt = new Date().toISOString();
    });
  }

  restartAgent(agentId: string, performedBy: string, reason: string): AgentControlRecord | null {
    return this.executeAction(agentId, "restart", performedBy, reason, (state) => {
      state.status = "idle";
      state.errorCount = 0;
      state.taskQueueDepth = 0;
      state.costSpentCents = 0;
      state.lastActivityAt = new Date().toISOString();
    });
  }

  setCostOverride(agentId: string, performedBy: string, budgetCents: number, durationMs: number, reason: string): AgentControlRecord | null {
    const expiresAt = new Date(Date.now() + durationMs).toISOString();
    const override = { budgetCents, expiresAt, reason };
    this.costOverrides.set(agentId, override);

    return this.executeAction(agentId, "cost_override", performedBy, reason, (state) => {
      state.costOverride = override;
      state.costBudgetCents = budgetCents;
    });
  }

  // ── Revert Action ─────────────────────────────────────────────

  revertAction(recordId: string, performedBy: string): boolean {
    const record = this.auditLog.find(r => r.id === recordId);
    if (!record || record.reverted) return false;

    const state = this.runtimeStates.get(record.agentId);
    if (!state) return false;

    // Restore previous state
    Object.assign(state, record.previousState);
    record.reverted = true;
    record.revertedAt = new Date().toISOString();

    // Log the revert
    this.auditLog.push({
      id: `ctrl-${++this.logCounter}`,
      agentId: record.agentId,
      action: record.action,
      performedBy,
      reason: `Reverted action ${recordId}`,
      timestamp: new Date().toISOString(),
      previousState: record.newState,
      newState: { ...state },
      reverted: false,
    });

    return true;
  }

  // ── Queries ───────────────────────────────────────────────────

  getAgentState(agentId: string): AgentRuntimeState | null {
    this.cleanExpiredOverrides(agentId);
    return this.runtimeStates.get(agentId) ?? null;
  }

  getAllAgentStates(): AgentRuntimeState[] {
    for (const id of this.runtimeStates.keys()) this.cleanExpiredOverrides(id);
    return Array.from(this.runtimeStates.values());
  }

  getAuditLog(agentId?: string, limit = 50): AgentControlRecord[] {
    let logs = [...this.auditLog];
    if (agentId) logs = logs.filter(l => l.agentId === agentId);
    return logs.slice(-limit);
  }

  getFleetSummary(): FleetControlSummary {
    const states = this.getAllAgentStates();
    return {
      totalAgents: states.length,
      active: states.filter(s => s.status === "executing" || s.status === "assigned").length,
      paused: states.filter(s => s.status === "paused").length,
      suspended: states.filter(s => s.status === "suspended").length,
      idle: states.filter(s => s.status === "idle").length,
      recentActions: this.auditLog.slice(-10),
      overridesActive: Array.from(this.costOverrides.values())
        .filter(o => new Date(o.expiresAt).getTime() > Date.now()).length,
    };
  }

  // ── Internals ─────────────────────────────────────────────────

  private executeAction(
    agentId: string,
    action: AgentControlAction,
    performedBy: string,
    reason: string,
    mutate: (state: AgentRuntimeState) => void,
  ): AgentControlRecord | null {
    const state = this.runtimeStates.get(agentId);
    if (!state) return null;

    const previousState = { ...state };
    mutate(state);

    const record: AgentControlRecord = {
      id: `ctrl-${++this.logCounter}`,
      agentId, action, performedBy, reason,
      timestamp: new Date().toISOString(),
      previousState: { status: previousState.status, autonomyLevel: previousState.autonomyLevel, costBudgetCents: previousState.costBudgetCents },
      newState: { status: state.status, autonomyLevel: state.autonomyLevel, costBudgetCents: state.costBudgetCents },
      reverted: false,
    };
    this.auditLog.push(record);
    return record;
  }

  private cleanExpiredOverrides(agentId: string): void {
    const override = this.costOverrides.get(agentId);
    if (!override) return;
    if (new Date(override.expiresAt).getTime() < Date.now()) {
      this.costOverrides.delete(agentId);
      const state = this.runtimeStates.get(agentId);
      if (state) {
        state.costOverride = undefined;
      }
    }
  }
}

export function createAgentControl(): AgentControlService {
  return new AgentControlService();
}

