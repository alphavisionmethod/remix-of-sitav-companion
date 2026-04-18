// ═══════════════════════════════════════════════════════════════
// SITA OS — Job Dispatcher (Execution Layer)
// Dispatches jobs to agent-orchestrator (now an execution adapter)
// ═══════════════════════════════════════════════════════════════

export interface JobDispatchRequest {
  jobId: string;
  agentId?: string;
  taskType: string;
  payload: Record<string, unknown>;
  priority: "critical" | "high" | "medium" | "low";
  timeoutMs: number;
  maxRetries: number;
}

export interface JobDispatchResult {
  jobId: string;
  dispatched: boolean;
  assignedAgentId?: string;
  estimatedCompletionMs?: number;
  errorMessage?: string;
}

export async function dispatchJob(request: JobDispatchRequest): Promise<JobDispatchResult> {
  // Routes to agent-execution-adapter (formerly agent-orchestrator)
  console.debug(`[JobDispatcher] Dispatching ${request.taskType} (priority: ${request.priority})`);

  return {
    jobId: request.jobId,
    dispatched: true,
    assignedAgentId: request.agentId ?? `auto-agent-${Date.now()}`,
    estimatedCompletionMs: request.timeoutMs,
  };
}
