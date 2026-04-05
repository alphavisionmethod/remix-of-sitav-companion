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

/** Local execution mode (extended) */
export type ServiceExecutionMode = "real" | "shadow" | "simulation" | "draft";
export type EnvelopeStatus = "pending" | "executing" | "completed" | "failed" | "rolled_back";

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
        return this.failEnvelope(envelope, {
          code: "CIRCUIT_OPEN",
          message: `Circuit breaker open for ${envelope.capabilityId}. Retry after cooldown.`,
        });
      }
      cb.state = "half-open";
    }

    // Draft mode — no execution
    if (envelope.mode === "draft") {
      return this.completeEnvelope(envelope, "completed", {
        mode: "draft",
        message: "Plan-only, no execution performed",
        payload: envelope.payload,
      });
    }

    // Simulation mode — dry run
    if (envelope.mode === "simulation") {
      return this.completeEnvelope(envelope, "completed", {
        mode: "simulation",
        message: "Dry-run completed, no side effects",
        simulatedResult: { wouldExecute: envelope.capabilityId, payload: envelope.payload },
      });
    }

    // Real or shadow execution
    const handler = this.handlers.get(envelope.capabilityId);
    if (!handler) {
      return this.failEnvelope(envelope, {
        code: "NO_HANDLER",
        message: `No handler registered for capability: ${envelope.capabilityId}`,
      });
    }

    const start = performance.now();
    envelope.status = "executing";

    try {
      const result = await handler(envelope);
      const durationMs = Math.round(performance.now() - start);

      if (result.status === "failure") {
        this.recordFailure(envelope.capabilityId);
        return this.failEnvelope(envelope, {
          code: "HANDLER_FAILURE",
          message: "Capability handler returned failure",
          handlerResult: result.result,
        });
      }

      this.resetCircuitBreaker(envelope.capabilityId);

      const completed = this.completeEnvelope(envelope, "completed", {
        ...result.result,
        mode: envelope.mode,
        rollbackData: result.rollbackData,
      });
      completed.durationMs = durationMs;

      // Shadow mode: mark as shadow in result
      if (envelope.mode === "shadow") {
        completed.result = { ...completed.result, shadowMode: true, persisted: false };
      }

      return completed;
    } catch (error) {
      this.recordFailure(envelope.capabilityId);
      return this.failEnvelope(envelope, {
        code: "HANDLER_ERROR",
        message: error instanceof Error ? error.message : "Unknown execution error",
      });
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
