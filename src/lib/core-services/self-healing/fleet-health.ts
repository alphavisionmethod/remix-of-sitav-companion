// ═══════════════════════════════════════════════════════════════
// SITA OS — Fleet Health Service
// Fleet-wide health aggregation, degraded mode, dependency graph,
// recovery sequencing, cascade prediction
// ═══════════════════════════════════════════════════════════════

import type {
  ServiceHealthRecord, ServiceHealthStatus, ServiceMetrics,
  DegradedService, RecoverySequence, RecoveryStep, HealingCapability,
} from "./types";

// ── Constants ───────────────────────────────────────────────────

const CONSECUTIVE_HEALTHY_TO_EXIT = 3;
const DEFAULT_CHECK_INTERVAL_MS = 30_000;

// ── Fleet Health Service ────────────────────────────────────────

export type HealthDegradedCallback = (serviceId: string, status: ServiceHealthStatus, healthScore: number, metrics: ServiceMetrics) => void;

export class FleetHealthService {
  private services = new Map<string, ServiceHealthRecord>();
  private degradedServices = new Map<string, DegradedService>();
  private healthDegradedCallbacks: HealthDegradedCallback[] = [];

  /** Register a callback fired when any service transitions to degraded/unhealthy */
  onHealthDegraded(cb: HealthDegradedCallback): void {
    this.healthDegradedCallbacks.push(cb);
  }

  // ── Service Registration ──────────────────────────────────

  registerService(serviceId: string, name: string, dependencies?: string[]): ServiceHealthRecord {
    const record: ServiceHealthRecord = {
      serviceId,
      name,
      status: "healthy",
      healthScore: 100,
      lastCheckAt: Date.now(),
      checkIntervalMs: DEFAULT_CHECK_INTERVAL_MS,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      dependencies: dependencies ?? [],
      dependents: [],
      metrics: {
        uptimePercent: 100,
        avgLatencyMs: 0,
        p99LatencyMs: 0,
        errorRate: 0,
        requestsPerMinute: 0,
      },
    };
    this.services.set(serviceId, record);

    // Update dependents on existing services
    for (const depId of record.dependencies) {
      const dep = this.services.get(depId);
      if (dep && !dep.dependents.includes(serviceId)) {
        this.services.set(depId, {
          ...dep,
          dependents: [...dep.dependents, serviceId],
        });
      }
    }

    return record;
  }

  // ── Health Checks ─────────────────────────────────────────

  recordHealthCheck(serviceId: string, passed: boolean, metrics?: Partial<ServiceMetrics>): ServiceHealthRecord | null {
    const service = this.services.get(serviceId);
    if (!service) return null;

    const newMetrics = metrics ? { ...service.metrics, ...metrics } : service.metrics;
    const consecutiveFailures = passed ? 0 : service.consecutiveFailures + 1;
    const consecutiveSuccesses = passed ? service.consecutiveSuccesses + 1 : 0;
    const healthScore = this.calculateHealthScore(newMetrics, consecutiveFailures);
    const status = this.scoreToStatus(healthScore, consecutiveFailures);

    const updated: ServiceHealthRecord = {
      ...service,
      status,
      healthScore,
      lastCheckAt: Date.now(),
      consecutiveFailures,
      consecutiveSuccesses,
      metrics: newMetrics,
    };
    this.services.set(serviceId, updated);

    // Handle degraded mode transitions
    if (status === "degraded" || status === "unhealthy") {
      this.enterDegradedMode(serviceId, `Health check: ${status}, score=${healthScore}`);
      // Fire degraded callbacks for auto-incident declaration
      for (const cb of this.healthDegradedCallbacks) {
        try { cb(serviceId, status, healthScore, newMetrics); } catch { /* don't break health checks */ }
      }
    } else if (status === "healthy") {
      this.checkDegradedExit(serviceId, consecutiveSuccesses);
    }

    return updated;
  }

  // ── Degraded Mode ─────────────────────────────────────────

  enterDegradedMode(serviceId: string, reason: string, incidentId?: string, disabledFeatures?: string[]): DegradedService {
    const existing = this.degradedServices.get(serviceId);
    if (existing) return existing;

    const degraded: DegradedService = {
      serviceId,
      reason,
      enteredAt: Date.now(),
      consecutiveHealthyChecks: 0,
      requiredHealthyChecks: CONSECUTIVE_HEALTHY_TO_EXIT,
      disabledFeatures: disabledFeatures ?? [],
      incidentId: incidentId ?? "",
    };
    this.degradedServices.set(serviceId, degraded);
    return degraded;
  }

  exitDegradedMode(serviceId: string): boolean {
    return this.degradedServices.delete(serviceId);
  }

  isDegraded(serviceId: string): boolean {
    return this.degradedServices.has(serviceId);
  }

  getDegradedServices(): DegradedService[] {
    return Array.from(this.degradedServices.values());
  }

  // ── Dependency Graph ──────────────────────────────────────

  getDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    for (const [id, svc] of this.services) {
      graph.set(id, svc.dependencies);
    }
    return graph;
  }

  getUpstreamDependencies(serviceId: string): string[] {
    const service = this.services.get(serviceId);
    return service?.dependencies ?? [];
  }

  getDownstreamDependents(serviceId: string): string[] {
    const service = this.services.get(serviceId);
    return service?.dependents ?? [];
  }

  // ── Recovery Sequencing ───────────────────────────────────

  buildRecoverySequence(affectedServices: string[], incidentId: string, defaultAction: HealingCapability = "service-restart"): RecoverySequence {
    // Sort: heal upstream first
    const sorted = this.topologicalSort(affectedServices);

    const steps: RecoveryStep[] = sorted.map((svcId, _i) => ({
      serviceId: svcId,
      action: defaultAction,
      dependsOn: this.getUpstreamDependencies(svcId).filter(d => affectedServices.includes(d)),
      cooldownAfterMs: 5_000,
      verifyHealthAfter: true,
    }));

    return {
      id: crypto.randomUUID(),
      incidentId,
      steps,
      currentStep: 0,
      status: "pending",
      createdAt: Date.now(),
    };
  }

  // ── Cascade Prediction ────────────────────────────────────

  predictCascade(failingServiceId: string): string[] {
    const affected = new Set<string>();
    const queue = [failingServiceId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = this.getDownstreamDependents(current);
      for (const dep of dependents) {
        if (!affected.has(dep)) {
          affected.add(dep);
          queue.push(dep);
        }
      }
    }

    return Array.from(affected);
  }

  // ── Queries ───────────────────────────────────────────────

  getService(serviceId: string): ServiceHealthRecord | null {
    return this.services.get(serviceId) ?? null;
  }

  getAllServices(): ServiceHealthRecord[] {
    return Array.from(this.services.values());
  }

  getServicesByStatus(status: ServiceHealthStatus): ServiceHealthRecord[] {
    return Array.from(this.services.values()).filter(s => s.status === status);
  }

  getUnhealthyServices(): ServiceHealthRecord[] {
    return Array.from(this.services.values()).filter(s =>
      s.status === "unhealthy" || s.status === "quarantined"
    );
  }

  getFleetSummary(): {
    total: number; healthy: number; degraded: number; unhealthy: number; quarantined: number;
    avgHealthScore: number; degradedModeCount: number;
  } {
    const services = Array.from(this.services.values());
    return {
      total: services.length,
      healthy: services.filter(s => s.status === "healthy").length,
      degraded: services.filter(s => s.status === "degraded").length,
      unhealthy: services.filter(s => s.status === "unhealthy").length,
      quarantined: services.filter(s => s.status === "quarantined").length,
      avgHealthScore: services.length > 0
        ? Math.round(services.reduce((s, svc) => s + svc.healthScore, 0) / services.length)
        : 0,
      degradedModeCount: this.degradedServices.size,
    };
  }

  // ── Manual Status ─────────────────────────────────────────

  setServiceStatus(serviceId: string, status: ServiceHealthStatus): boolean {
    const service = this.services.get(serviceId);
    if (!service) return false;
    this.services.set(serviceId, { ...service, status, lastCheckAt: Date.now() });
    if (status === "healthy") {
      this.degradedServices.delete(serviceId);
    }
    return true;
  }

  // ── Private ───────────────────────────────────────────────

  private checkDegradedExit(serviceId: string, consecutiveSuccesses: number): void {
    const degraded = this.degradedServices.get(serviceId);
    if (!degraded) return;

    if (consecutiveSuccesses >= CONSECUTIVE_HEALTHY_TO_EXIT) {
      this.degradedServices.delete(serviceId);
    } else {
      this.degradedServices.set(serviceId, {
        ...degraded,
        consecutiveHealthyChecks: consecutiveSuccesses,
      });
    }
  }

  private calculateHealthScore(metrics: ServiceMetrics, consecutiveFailures: number): number {
    let score = 100;
    score -= Math.max(0, (100 - metrics.uptimePercent) * 2);
    score -= Math.min(30, metrics.errorRate * 100);
    score -= Math.min(20, Math.max(0, (metrics.p99LatencyMs - 500) / 100));
    score -= consecutiveFailures * 10;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private scoreToStatus(score: number, consecutiveFailures: number): ServiceHealthStatus {
    if (consecutiveFailures >= 5) return "unhealthy";
    if (score >= 80) return "healthy";
    if (score >= 50) return "degraded";
    return "unhealthy";
  }

  private topologicalSort(serviceIds: string[]): string[] {
    const inSet = new Set(serviceIds);
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (id: string) => {
      if (visited.has(id) || !inSet.has(id)) return;
      visited.add(id);
      const deps = this.getUpstreamDependencies(id).filter(d => inSet.has(d));
      for (const dep of deps) visit(dep);
      result.push(id);
    };

    for (const id of serviceIds) visit(id);
    return result;
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createFleetHealthService(): FleetHealthService {
  return new FleetHealthService();
}
