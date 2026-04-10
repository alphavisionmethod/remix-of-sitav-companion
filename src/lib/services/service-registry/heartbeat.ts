// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Registry Heartbeat
// Runtime health checks for registered services with periodic polling
// ═══════════════════════════════════════════════════════════════

import type { RegisteredService, ServiceStatus } from "./index";

export interface HeartbeatResult {
  serviceId: string;
  serviceName: string;
  status: ServiceStatus;
  latencyMs: number;
  checkedAt: string;
  error?: string;
}

export interface HeartbeatSummary {
  totalChecked: number;
  healthy: number;
  degraded: number;
  down: number;
  unknown: number;
  avgLatencyMs: number;
  lastRunAt: string;
  results: HeartbeatResult[];
}

type HeartbeatCheckFn = (service: RegisteredService) => Promise<{ ok: boolean; latencyMs: number; error?: string }>;

/**
 * ServiceHeartbeat — performs runtime health verification on registered services.
 * Can be called on-demand or polled on an interval.
 */
export class ServiceHeartbeat {
  private customChecks = new Map<string, HeartbeatCheckFn>();
  private lastSummary: HeartbeatSummary | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private history: HeartbeatSummary[] = [];
  private maxHistory = 100;

  /**
   * Register a custom health check for a specific service.
   */
  registerCheck(serviceId: string, check: HeartbeatCheckFn): void {
    this.customChecks.set(serviceId, check);
  }

  /**
   * Run heartbeat against all provided services.
   */
  async runHeartbeat(services: RegisteredService[]): Promise<HeartbeatSummary> {
    const results: HeartbeatResult[] = [];

    const checks = services.map(async (svc) => {
      const start = Date.now();
      const customCheck = this.customChecks.get(svc.id);

      try {
        if (customCheck) {
          const result = await customCheck(svc);
          results.push({
            serviceId: svc.id,
            serviceName: svc.name,
            status: result.ok ? "healthy" : "degraded",
            latencyMs: result.latencyMs,
            checkedAt: new Date().toISOString(),
            error: result.error,
          });
        } else {
          // Default check: verify the service object is well-formed and recent
          const timeSinceLastCheck = Date.now() - new Date(svc.lastHealthCheck).getTime();
          const isStale = timeSinceLastCheck > 5 * 60 * 1000; // 5 minutes
          const status: ServiceStatus = svc.status === "down"
            ? "down"
            : isStale
              ? "degraded"
              : svc.errorRate > 0.5
                ? "degraded"
                : "healthy";

          results.push({
            serviceId: svc.id,
            serviceName: svc.name,
            status,
            latencyMs: Date.now() - start,
            checkedAt: new Date().toISOString(),
            error: isStale ? "Last health check is stale" : undefined,
          });
        }
      } catch (err) {
        results.push({
          serviceId: svc.id,
          serviceName: svc.name,
          status: "down",
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
          error: err instanceof Error ? err.message : "Health check failed",
        });
      }
    });

    await Promise.allSettled(checks);

    const healthy = results.filter((r) => r.status === "healthy").length;
    const degraded = results.filter((r) => r.status === "degraded").length;
    const down = results.filter((r) => r.status === "down").length;
    const unknown = results.filter((r) => r.status === "unknown").length;
    const avgLatency = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length)
      : 0;

    const summary: HeartbeatSummary = {
      totalChecked: results.length,
      healthy,
      degraded,
      down,
      unknown,
      avgLatencyMs: avgLatency,
      lastRunAt: new Date().toISOString(),
      results,
    };

    this.lastSummary = summary;
    this.history.push(summary);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-Math.floor(this.maxHistory / 2));
    }

    return summary;
  }

  /**
   * Start periodic heartbeat polling.
   */
  startPolling(services: RegisteredService[], intervalMs: number = 60_000): void {
    this.stopPolling();
    this.intervalId = setInterval(() => {
      this.runHeartbeat(services);
    }, intervalMs);
    // Run immediately
    this.runHeartbeat(services);
  }

  /**
   * Stop periodic heartbeat polling.
   */
  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getLastSummary(): HeartbeatSummary | null {
    return this.lastSummary;
  }

  getHistory(limit?: number): HeartbeatSummary[] {
    const log = [...this.history].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  isPolling(): boolean {
    return this.intervalId !== null;
  }
}

export const serviceHeartbeat = new ServiceHeartbeat();
