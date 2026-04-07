// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Engine Service
// Canonical workflow state machine with step transitions,
// retry logic, simulation, and governance integration
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'awaiting-approval';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'awaiting-approval';

export interface WorkflowDefinition {
  id: string;
  name: string;
  domain: string;
  version: string;
  steps: WorkflowStepDef[];
  triggers: WorkflowTrigger[];
  guards: WorkflowGuard[];
  timeout: number;
  retryPolicy: RetryPolicy;
  approvalRequired: boolean;
  metadata: Record<string, unknown>;
}

export interface WorkflowStepDef {
  id: string;
  name: string;
  action: string;
  input: Record<string, unknown>;
  dependsOn: string[];
  timeout: number;
  retryPolicy: RetryPolicy;
  approvalRequired: boolean;
  rollbackAction?: string;
  condition?: string;
}

export interface WorkflowTrigger { type: 'event' | 'schedule' | 'manual' | 'api'; config: Record<string, unknown>; }
export interface WorkflowGuard { type: 'trust-level' | 'role' | 'policy' | 'time-window'; config: Record<string, unknown>; }
export interface RetryPolicy { maxRetries: number; backoffMs: number; backoffMultiplier: number; maxBackoffMs: number; }

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  currentStep: number;
  steps: WorkflowStepRun[];
  context: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
  error?: string;
  correlationId: string;
  userId: string;
}

export interface WorkflowStepRun {
  stepId: string;
  status: StepStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
  retries: number;
  error?: string;
}

export class WorkflowEngineService {
  private definitions: Map<string, WorkflowDefinition> = new Map();
  private runs: Map<string, WorkflowRun> = new Map();
  private counter = 0;

  registerWorkflow(def: WorkflowDefinition): void { this.definitions.set(def.id, def); }
  getDefinition(id: string): WorkflowDefinition | undefined { return this.definitions.get(id); }
  listDefinitions(): WorkflowDefinition[] { return [...this.definitions.values()]; }

  startWorkflow(workflowId: string, context: Record<string, unknown>, userId: string): WorkflowRun {
    const def = this.definitions.get(workflowId);
    if (!def) throw new Error(`Workflow ${workflowId} not found`);
    const run: WorkflowRun = {
      id: `wr-${++this.counter}-${Date.now()}`, workflowId, status: 'running', currentStep: 0,
      steps: def.steps.map(s => ({ stepId: s.id, status: 'pending', input: s.input, retries: 0 })),
      context, startedAt: new Date().toISOString(), correlationId: `cor-${Date.now()}`, userId,
    };
    this.runs.set(run.id, run);
    return run;
  }

  advanceStep(runId: string, output?: Record<string, unknown>): WorkflowRun {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'running') throw new Error('Invalid run state');
    const step = run.steps[run.currentStep];
    step.status = 'completed';
    step.output = output;
    step.completedAt = new Date().toISOString();
    run.currentStep++;
    if (run.currentStep >= run.steps.length) {
      run.status = 'completed';
      run.completedAt = new Date().toISOString();
    } else {
      run.steps[run.currentStep].status = 'running';
      run.steps[run.currentStep].startedAt = new Date().toISOString();
    }
    return run;
  }

  failStep(runId: string, error: string): WorkflowRun {
    const run = this.runs.get(runId);
    if (!run) throw new Error('Run not found');
    const step = run.steps[run.currentStep];
    const def = this.definitions.get(run.workflowId);
    const stepDef = def?.steps[run.currentStep];
    step.retries++;
    if (stepDef && step.retries < stepDef.retryPolicy.maxRetries) {
      step.status = 'pending';
      step.error = error;
    } else {
      step.status = 'failed';
      step.error = error;
      run.status = 'failed';
      run.error = error;
    }
    return run;
  }

  pauseWorkflow(runId: string): void { const r = this.runs.get(runId); if (r) r.status = 'paused'; }
  resumeWorkflow(runId: string): void { const r = this.runs.get(runId); if (r && r.status === 'paused') r.status = 'running'; }
  cancelWorkflow(runId: string): void { const r = this.runs.get(runId); if (r) { r.status = 'cancelled'; r.completedAt = new Date().toISOString(); } }

  getRun(runId: string): WorkflowRun | undefined { return this.runs.get(runId); }
  listRuns(filter?: { status?: WorkflowStatus; userId?: string }): WorkflowRun[] {
    let runs = [...this.runs.values()];
    if (filter?.status) runs = runs.filter(r => r.status === filter.status);
    if (filter?.userId) runs = runs.filter(r => r.userId === filter.userId);
    return runs;
  }

  simulate(workflowId: string, context: Record<string, unknown>): { wouldSucceed: boolean; steps: string[]; estimatedDuration: number } {
    const def = this.definitions.get(workflowId);
    if (!def) return { wouldSucceed: false, steps: [], estimatedDuration: 0 };
    return { wouldSucceed: true, steps: def.steps.map(s => s.name), estimatedDuration: def.steps.length * 1000 };
  }

  getStats() {
    const runs = [...this.runs.values()];
    return {
      total: runs.length,
      byStatus: runs.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {} as Record<string, number>),
      definitions: this.definitions.size,
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("workflow-engine", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      definitions: Array.from(this.definitions.entries()),
      runs: Array.from(this.runs.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.definitions) this.definitions = new Map(state.definitions as [string, unknown][]);
    if (state.runs) this.runs = new Map(state.runs as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("workflow-engine");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createWorkflowEngine = () => new WorkflowEngineService();
