// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Runners
// Sandboxed execution of connector adapters with circuit breaker
// Canonical contracts: ExecutionMode from contracts, merged into connector-control-plane
// ═══════════════════════════════════════════════════════════════

import type { ExecutionMode as CanonicalExecutionMode } from "@/packages/contracts";

export type { CanonicalExecutionMode };

export type RunnerMode = "real" | "sandbox" | "simulation" | "test";
export type RunnerStatus = "idle" | "running" | "completed" | "failed" | "circuit-open";

export interface ConnectorRunner {
  id: string;
  connectorId: string;
  mode: RunnerMode;
  status: RunnerStatus;
  lastExecutionMs?: number;
  healthScore: number;
  failureCount: number;
  maxFailures: number;
  cooldownMs: number;
  lastFailureAt?: number;
}

export interface RunnerExecution {
  runnerId: string;
  connectorId: string;
  action: string;
  payload: Record<string, unknown>;
  mode: RunnerMode;
  result?: Record<string, unknown>;
  error?: string;
  durationMs: number;
  timestamp: number;
}

// ── Connector Runners Service ───────────────────────────────────

export class ConnectorRunnersService {
  private runners = new Map<string, ConnectorRunner>();
  private executions: RunnerExecution[] = [];

  registerRunner(connectorId: string, options?: { maxFailures?: number; cooldownMs?: number }): ConnectorRunner {
    const runner: ConnectorRunner = {
      id: `runner-${connectorId}-${Date.now()}`,
      connectorId,
      mode: "sandbox",
      status: "idle",
      healthScore: 100,
      failureCount: 0,
      maxFailures: options?.maxFailures ?? 5,
      cooldownMs: options?.cooldownMs ?? 30_000,
    };
    this.runners.set(runner.id, runner);
    return runner;
  }

  getRunner(runnerId: string): ConnectorRunner | undefined {
    return this.runners.get(runnerId);
  }

  getRunnerByConnector(connectorId: string): ConnectorRunner | undefined {
    return Array.from(this.runners.values()).find(r => r.connectorId === connectorId);
  }

  listRunners(): ConnectorRunner[] {
    return Array.from(this.runners.values());
  }

  async execute(runnerId: string, action: string, payload: Record<string, unknown>): Promise<RunnerExecution> {
    const runner = this.runners.get(runnerId);
    if (!runner) throw new Error(`Runner not found: ${runnerId}`);

    // Circuit breaker check
    if (runner.status === "circuit-open") {
      if (runner.lastFailureAt && Date.now() - runner.lastFailureAt > runner.cooldownMs) {
        runner.status = "idle";
        runner.failureCount = 0;
        runner.healthScore = Math.min(runner.healthScore + 20, 100);
      } else {
        const exec: RunnerExecution = { runnerId, connectorId: runner.connectorId, action, payload, mode: runner.mode, error: "Circuit breaker open", durationMs: 0, timestamp: Date.now() };
        this.executions.push(exec);
        return exec;
      }
    }

    const start = performance.now();
    runner.status = "running";

    // Sandbox/simulation mode returns mock data
    if (runner.mode === "sandbox" || runner.mode === "simulation" || runner.mode === "test") {
      const durationMs = Math.round(performance.now() - start);
      runner.status = "completed";
      runner.lastExecutionMs = durationMs;

      const exec: RunnerExecution = {
        runnerId, connectorId: runner.connectorId, action, payload, mode: runner.mode,
        result: { simulated: true, action, connectorId: runner.connectorId, payload },
        durationMs, timestamp: Date.now(),
      };
      this.executions.push(exec);
      return exec;
    }

    // Real mode — would call actual connector
    const durationMs = Math.round(performance.now() - start);
    runner.status = "completed";
    runner.lastExecutionMs = durationMs;

    const exec: RunnerExecution = {
      runnerId, connectorId: runner.connectorId, action, payload, mode: runner.mode,
      result: { executed: true, action, connectorId: runner.connectorId },
      durationMs, timestamp: Date.now(),
    };
    this.executions.push(exec);
    return exec;
  }

  recordFailure(runnerId: string, error: string): void {
    const runner = this.runners.get(runnerId);
    if (!runner) return;

    runner.failureCount++;
    runner.lastFailureAt = Date.now();
    runner.healthScore = Math.max(0, runner.healthScore - 20);

    if (runner.failureCount >= runner.maxFailures) {
      runner.status = "circuit-open";
    }
  }

  getExecutionHistory(connectorId?: string): RunnerExecution[] {
    const all = [...this.executions];
    return connectorId ? all.filter(e => e.connectorId === connectorId) : all;
  }

  getHealth(): { status: "healthy" | "degraded"; runnerCount: number; openCircuits: number } {
    const runners = this.listRunners();
    const openCircuits = runners.filter(r => r.status === "circuit-open").length;
    return {
      status: openCircuits > 0 ? "degraded" : "healthy",
      runnerCount: runners.length,
      openCircuits,
    };
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createConnectorRunners(): ConnectorRunnersService {
  return new ConnectorRunnersService();
}
