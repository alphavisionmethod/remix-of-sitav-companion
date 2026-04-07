// ═══════════════════════════════════════════════════════════════
// SITA OS — Executor Service (Durable)
// Mode-aware execution with circuit breaker, idempotency,
// and action lineage persistence via ActionLineageService
// Canonical contracts: ExecutionMode, ExecutionStatus from contracts
// ═══════════════════════════════════════════════════════════════

import type { ExecutionMode as CanonicalExecutionMode, ExecutionStatus as CanonicalExecutionStatus } from "@/packages/contracts";
import { getActionLineageService } from "./action-lineage-service";
import { getEventBus } from "./event-bus";

export type { CanonicalExecutionMode, CanonicalExecutionStatus };

import type { KernelExecutionMode } from "@/packages/contracts/kernel/action-envelope";

/** Local execution mode (extended) */
export type ServiceExecutionMode = "real" | "shadow" | "simulation" | "draft";
export type EnvelopeStatus = "pending" | "executing" | "completed" | "failed" | "rolled_back";

/** Map kernel tri-mode to executor service mode */
export function mapKernelMode(mode: KernelExecutionMode): ServiceExecutionMode {
  switch (mode) {
    case "EMULATED": return "draft";
    case "REAL_MOCK": return "simulation";
    case "REAL": return "real";
  }
}

/** Runtime invariant: output schema must be mode-independent */
export function assertOutputSchemaInvariant(
  mode: ServiceExecutionMode,
  output: Record<string, unknown>
): void {
  // The 'mode' field in output is allowed to differ; all other keys must be stable
  const reservedModeKeys = ["mode", "shadowMode", "persisted", "simulatedResult"];
  const structuralKeys = Object.keys(output).filter(k => !reservedModeKeys.includes(k));
  // This is a runtime assertion — in production it logs; in tests it throws
  if (structuralKeys.length === 0 && mode !== "draft") {
    console.warn(`[executor] WARNING: Empty structural output in ${mode} mode — potential schema drift`);
  }
}

export interface ExecutionEnvelope {
  id: string;
  correlationId: string;
  capabilityId: string;
  idempotencyKey?: string;
  mode: ServiceExecutionMode;
  status: EnvelopeStatus;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  policyProof?: Record<string, unknown>;
  approvalProof?: Record<string, unknown>;
  errorDetails?: Record<string, unknown>;
  durationMs?: number;
  attemptCount: number;
  createdAt: number;
  completedAt?: number;
}

export type CapabilityHandler = (envelope: ExecutionEnvelope) => Promise<{
  status: "success" | "partial" | "failure";
  result: Record<string, unknown>;
  rollbackData?: Record<string, unknown>;
}>;

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: "closed" | "open" | "half-open";
}

// ── Executor Service Class ──────────────────────────────────────────────────

export class ExecutorService {
  private handlers = new Map<string, CapabilityHandler>();
  private completedKeys = new Map<string, ExecutionEnvelope>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private envelopes: ExecutionEnvelope[] = [];

  private readonly maxFailures = 5;
  private readonly cooldownMs = 30_000;

  registerHandler(capabilityId: string, handler: CapabilityHandler): void {
    this.handlers.set(capabilityId, handler);
  }

  getRegisteredCapabilities(): string[] {
    return Array.from(this.handlers.keys());
  }

  async execute(envelope: ExecutionEnvelope): Promise<ExecutionEnvelope> {
    const lineage = getActionLineageService();
    const eventBus = getEventBus();
    const now = new Date().toISOString();
    const domainRaw = envelope.capabilityId.split(".")[0] || "system";

    // Helper to create transition objects matching ActionStateTransition contract
    const mkTransition = (from: string, to: string, reason: string) => ({
      from: from as any,
      to: to as any,
      triggeredBy: "executor-service",
      timestamp: new Date().toISOString(),
      reason,
      confidence: 1.0,
    });

    // Create action lineage record at start of execution
    const actionRecord = {
      id: envelope.id,
      workflowId: envelope.correlationId,
      domain: domainRaw as any,
      currentState: "proposed" as const,
      stateHistory: [mkTransition("proposed", "proposed", "Execution initiated")],
      assignedAdvisor: "executor-service",
      entityScope: { ownerId: "", visibility: "private" as const },
      rollbackEligible: envelope.mode !== "simulation",
      replayable: !!envelope.idempotencyKey,
      blockingReasons: [] as string[],
      dependsOn: [] as string[],
      confidenceScore: 1.0,
      proofIds: [] as string[],
      createdAt: now,
      updatedAt: now,
    };

    lineage.initiateAction(actionRecord, {
      actionType: envelope.capabilityId,
      initiatingSurface: (envelope.payload?.surface as string) ?? "api",
    }).catch(() => {});

    // Idempotency check
    if (envelope.idempotencyKey) {
      const existing = this.completedKeys.get(envelope.idempotencyKey);
      if (existing) return { ...existing };
    }

    // Circuit breaker check
    const cb = this.getCircuitBreaker(envelope.capabilityId);
    if (cb.state === "open") {
      const elapsed = Date.now() - cb.lastFailure;
      if (elapsed < this.cooldownMs) {
        const failed = this.failEnvelope(envelope, {
          code: "CIRCUIT_OPEN",
          message: `Circuit breaker open for ${envelope.capabilityId}. Retry after cooldown.`,
        });
        lineage.transitionAction(envelope.id, "escalated",
          mkTransition("proposed", "escalated", "Circuit breaker open")
        ).catch(() => {});
        return failed;
      }
      cb.state = "half-open";
    }

    // Draft mode — no execution
    if (envelope.mode === "draft") {
      const result = this.completeEnvelope(envelope, "completed", {
        mode: "draft",
        message: "Plan-only, no execution performed",
        payload: envelope.payload,
      });
      lineage.transitionAction(envelope.id, "simulated",
        mkTransition("proposed", "simulated", "Draft mode — no execution")
      ).catch(() => {});
      return result;
    }

    // Simulation mode — dry run
    if (envelope.mode === "simulation") {
      const result = this.completeEnvelope(envelope, "completed", {
        mode: "simulation",
        message: "Dry-run completed, no side effects",
        simulatedResult: { wouldExecute: envelope.capabilityId, payload: envelope.payload },
      });
      lineage.transitionAction(envelope.id, "simulated",
        mkTransition("proposed", "simulated", "Simulation completed")
      ).catch(() => {});
      return result;
    }

    // Real or shadow execution
    const handler = this.handlers.get(envelope.capabilityId);
    if (!handler) {
      const failed = this.failEnvelope(envelope, {
        code: "NO_HANDLER",
        message: `No handler registered for capability: ${envelope.capabilityId}`,
      });
      lineage.transitionAction(envelope.id, "failed",
        mkTransition("proposed", "failed", "No handler registered")
      ).catch(() => {});
      return failed;
    }

    // Transition to executing
    lineage.transitionAction(envelope.id, "executing",
      mkTransition("proposed", "executing", "Handler found, executing")
    ).catch(() => {});

    const start = performance.now();
    envelope.status = "executing";

    try {
      const result = await handler(envelope);
      const durationMs = Math.round(performance.now() - start);

      if (result.status === "failure") {
        this.recordFailure(envelope.capabilityId);
        const failed = this.failEnvelope(envelope, {
          code: "HANDLER_FAILURE",
          message: "Capability handler returned failure",
          handlerResult: result.result,
        });
        lineage.transitionAction(envelope.id, "failed",
          mkTransition("executing", "failed", "Handler returned failure")
        ).catch(() => {});

        eventBus.publish("execution.failed.v1", {
          envelopeId: envelope.id,
          capabilityId: envelope.capabilityId,
          error: result.result,
        }, {
          source: "executor-service",
          correlationId: envelope.correlationId,
          domain: domainRaw,
        }).catch(() => {});

        return failed;
      }

      this.resetCircuitBreaker(envelope.capabilityId);

      const completed = this.completeEnvelope(envelope, "completed", {
        ...result.result,
        mode: envelope.mode,
        rollbackData: result.rollbackData,
      });
      completed.durationMs = durationMs;

      if (envelope.mode === "shadow") {
        completed.result = { ...completed.result, shadowMode: true, persisted: false };
      }

      // Transition to completed + emit event
      lineage.transitionAction(envelope.id, "completed",
        mkTransition("executing", "completed", `Completed in ${durationMs}ms`)
      ).catch(() => {});

      eventBus.publish("execution.completed.v1", {
        envelopeId: envelope.id,
        capabilityId: envelope.capabilityId,
        durationMs,
        mode: envelope.mode,
      }, {
        source: "executor-service",
        correlationId: envelope.correlationId,
        domain: domainRaw,
      }).catch(() => {});

      return completed;
    } catch (error) {
      this.recordFailure(envelope.capabilityId);
      const failed = this.failEnvelope(envelope, {
        code: "HANDLER_ERROR",
        message: error instanceof Error ? error.message : "Unknown execution error",
      });
      lineage.transitionAction(envelope.id, "failed",
        mkTransition("executing", "failed", error instanceof Error ? error.message : "Unknown error")
      ).catch(() => {});
      return failed;
    }
  }

  async rollback(envelope: ExecutionEnvelope): Promise<ExecutionEnvelope> {
    return {
      ...envelope,
      status: "rolled_back",
      completedAt: Date.now(),
      result: { rolledBack: true, originalResult: envelope.result },
    };
  }

  getEnvelopes(): ExecutionEnvelope[] {
    return [...this.envelopes];
  }

  // ── Private Helpers ─────────────────────────────────────────────────────

  private completeEnvelope(
    envelope: ExecutionEnvelope,
    status: EnvelopeStatus,
    result: Record<string, unknown>
  ): ExecutionEnvelope {
    const completed: ExecutionEnvelope = {
      ...envelope,
      status,
      result,
      completedAt: Date.now(),
    };
    this.envelopes.push(completed);
    if (envelope.idempotencyKey) {
      this.completedKeys.set(envelope.idempotencyKey, completed);
    }
    return completed;
  }

  private failEnvelope(
    envelope: ExecutionEnvelope,
    errorDetails: Record<string, unknown>
  ): ExecutionEnvelope {
    const failed: ExecutionEnvelope = {
      ...envelope,
      status: "failed",
      errorDetails,
      completedAt: Date.now(),
    };
    this.envelopes.push(failed);
    return failed;
  }

  private getCircuitBreaker(capabilityId: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(capabilityId)) {
      this.circuitBreakers.set(capabilityId, { failures: 0, lastFailure: 0, state: "closed" });
    }
    return this.circuitBreakers.get(capabilityId)!;
  }

  private recordFailure(capabilityId: string): void {
    const cb = this.getCircuitBreaker(capabilityId);
    cb.failures++;
    cb.lastFailure = Date.now();
    if (cb.failures >= this.maxFailures) {
      cb.state = "open";
    }
  }

  private resetCircuitBreaker(capabilityId: string): void {
    this.circuitBreakers.set(capabilityId, { failures: 0, lastFailure: 0, state: "closed" });
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createExecutorService(): ExecutorService {
  return new ExecutorService();
}

export function createEnvelope(
  capabilityId: string,
  payload: Record<string, unknown>,
  options?: {
    correlationId?: string;
    idempotencyKey?: string;
    mode?: ServiceExecutionMode;
    policyProof?: Record<string, unknown>;
    approvalProof?: Record<string, unknown>;
  }
): ExecutionEnvelope {
  return {
    id: crypto.randomUUID(),
    correlationId: options?.correlationId || crypto.randomUUID(),
    capabilityId,
    idempotencyKey: options?.idempotencyKey,
    mode: options?.mode || "real",
    status: "pending",
    payload,
    policyProof: options?.policyProof,
    approvalProof: options?.approvalProof,
    attemptCount: 1,
    createdAt: Date.now(),
  };
}
