// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Workforce Service (In-Memory)
// Agent lifecycle, task assignment, capability matching, teams
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type {
  AgentDefinition, AgentTask, AgentTeam, AgentCapability,
  AgentStatus, AgentAutonomyLevel, CouncilDefinition, AgentKPI,
} from "@/packages/contracts/domain-types/ai-workforce";

export type { AgentDefinition, AgentTask, AgentTeam, AgentCapability, AgentStatus, AgentAutonomyLevel, CouncilDefinition, AgentKPI };

export interface AgentAssignmentResult {
  taskId: string;
  agentId: string;
  matched: boolean;
  reason: string;
  estimatedCost: number;
  estimatedDuration: number;
}

const AUTONOMY_LEVELS_ORDERED: AgentAutonomyLevel[] = [
  "L0-observe", "L1-suggest", "L2-draft", "L3-simulate", "L4-auto-reversible", "L5-auto-irreversible", "L6-constrained-action",
];

export class AIWorkforceService {
  private agents: Map<string, AgentDefinition> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private teams: Map<string, AgentTeam> = new Map();
  private councils: Map<string, CouncilDefinition> = new Map();

  registerAgent(agent: AgentDefinition): AgentDefinition {
    this.agents.set(agent.id, agent);
    return agent;
  }

  getAgent(id: string): AgentDefinition | null {
    return this.agents.get(id) ?? null;
  }

  updateAgentStatus(id: string, status: AgentStatus): AgentDefinition | null {
    const agent = this.agents.get(id);
    if (!agent) return null;
    agent.status = status;
    agent.updatedAt = new Date().toISOString();
    return agent;
  }

  listAgents(filters?: { domain?: string; status?: AgentStatus; autonomyLevel?: AgentAutonomyLevel }): AgentDefinition[] {
    let agents = Array.from(this.agents.values());
    if (filters?.domain) agents = agents.filter(a => a.domain === filters.domain);
    if (filters?.status) agents = agents.filter(a => a.status === filters.status);
    if (filters?.autonomyLevel) agents = agents.filter(a => a.autonomyLevel === filters.autonomyLevel);
    return agents;
  }

  createTask(task: AgentTask): AgentTask {
    this.tasks.set(task.id, task);
    return task;
  }

  assignTask(taskId: string, requiredCapability?: string): AgentAssignmentResult {
    const task = this.tasks.get(taskId);
    if (!task) return { taskId, agentId: "", matched: false, reason: "Task not found", estimatedCost: 0, estimatedDuration: 0 };

    const available = Array.from(this.agents.values()).filter(a =>
      a.status === "idle" &&
      (!requiredCapability || a.capabilities.some(c => c.name === requiredCapability)) &&
      this.getActiveTaskCount(a.id) < a.maxConcurrentTasks
    );

    if (available.length === 0) {
      return { taskId, agentId: "", matched: false, reason: "No available agents", estimatedCost: 0, estimatedDuration: 0 };
    }

    available.sort((a, b) => (a.costBudgetPerHour - b.costBudgetPerHour) || (b.maturityScore - a.maturityScore));
    const chosen = available[0];
    task.agentId = chosen.id;
    task.status = "assigned";
    task.updatedAt = new Date().toISOString();
    chosen.status = "assigned";

    const cap = requiredCapability ? chosen.capabilities.find(c => c.name === requiredCapability) : chosen.capabilities[0];
    return {
      taskId, agentId: chosen.id, matched: true,
      reason: `Assigned to ${chosen.name} (maturity: ${chosen.maturityScore})`,
      estimatedCost: cap?.costPerInvocation ?? 0, estimatedDuration: 60,
    };
  }

  completeTask(taskId: string, output: Record<string, unknown>, cost: number, tokens: number): AgentTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    task.status = "completed";
    task.output = output;
    task.costIncurred = cost;
    task.tokensUsed = tokens;
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    const agent = this.agents.get(task.agentId);
    if (agent && this.getActiveTaskCount(agent.id) === 0) agent.status = "idle";
    return task;
  }

  failTask(taskId: string, _reason: string): AgentTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    if (task.retryCount < task.maxRetries) { task.retryCount++; task.status = "queued"; }
    else { task.status = "failed"; }
    task.updatedAt = new Date().toISOString();
    return task;
  }

  getTasksByAgent(agentId: string): AgentTask[] {
    return Array.from(this.tasks.values()).filter(t => t.agentId === agentId);
  }

  createTeam(team: AgentTeam): AgentTeam { this.teams.set(team.id, team); return team; }
  getTeam(id: string): AgentTeam | null { return this.teams.get(id) ?? null; }
  listTeams(): AgentTeam[] { return Array.from(this.teams.values()); }
  registerCouncil(council: CouncilDefinition): CouncilDefinition { this.councils.set(council.id, council); return council; }
  listCouncils(): CouncilDefinition[] { return Array.from(this.councils.values()); }

  getWorkforceStats() {
    const agents = Array.from(this.agents.values());
    const tasks = Array.from(this.tasks.values());
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === "assigned" || a.status === "executing").length,
      idleAgents: agents.filter(a => a.status === "idle").length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === "queued" || t.status === "assigned").length,
      completedTasks: tasks.filter(t => t.status === "completed").length,
      totalCost: tasks.reduce((s, t) => s + t.costIncurred, 0),
      totalTokens: tasks.reduce((s, t) => s + t.tokensUsed, 0),
      teamCount: this.teams.size,
      councilCount: this.councils.size,
    };
  }

  getAutonomyLevel(agentId: string): number {
    const agent = this.agents.get(agentId);
    if (!agent) return 0;
    return AUTONOMY_LEVELS_ORDERED.indexOf(agent.autonomyLevel);
  }

  private getActiveTaskCount(agentId: string): number {
    return Array.from(this.tasks.values()).filter(t => t.agentId === agentId && (t.status === "assigned" || t.status === "executing")).length;
  }

  private _persist = () => debouncedSaveServiceState("ai-workforce", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      agents: Array.from(this.agents.entries()),
      tasks: Array.from(this.tasks.entries()),
      teams: Array.from(this.teams.entries()),
      councils: Array.from(this.councils.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.agents) this.agents = new Map(state.agents as Iterable<[string, never]>) as typeof this.agents;
    if (state.tasks) this.tasks = new Map(state.tasks as Iterable<[string, never]>) as typeof this.tasks;
    if (state.teams) this.teams = new Map(state.teams as Iterable<[string, never]>) as typeof this.teams;
    if (state.councils) this.councils = new Map(state.councils as Iterable<[string, never]>) as typeof this.councils;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("ai-workforce");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createAIWorkforce(): AIWorkforceService {
  return new AIWorkforceService();
}
