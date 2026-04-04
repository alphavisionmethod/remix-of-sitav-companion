// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Registry
// Dynamic service discovery, health aggregation, dependency graph
// ═══════════════════════════════════════════════════════════════

export type ServiceStatus = "healthy" | "degraded" | "down" | "unknown";
export type ServiceTierLevel = "tier-1" | "tier-2" | "tier-3" | "isolated";

export interface RegisteredService {
  id: string;
  name: string;
  tier: ServiceTierLevel;
  status: ServiceStatus;
  version: string;
  dependencies: string[];
  capabilities: string[];
  healthCheckUrl?: string;
  lastHealthCheck: string;
  errorRate: number;
  latencyMs: number;
  uptime: number;
  metadata?: Record<string, unknown>;
}

export interface ServiceDependencyEdge {
  from: string;
  to: string;
  type: "required" | "optional" | "event-driven";
  isHealthy: boolean;
}

export interface RegistryHealthSummary {
  totalServices: number;
  healthy: number;
  degraded: number;
  down: number;
  overallStatus: ServiceStatus;
  dependencyGraph: ServiceDependencyEdge[];
  lastUpdated: string;
}

export class ServiceRegistryService {
  private services = new Map<string, RegisteredService>();

  register(service: RegisteredService): void {
    this.services.set(service.id, service);
  }

  deregister(serviceId: string): boolean {
    return this.services.delete(serviceId);
  }

  get(serviceId: string): RegisteredService | undefined {
    return this.services.get(serviceId);
  }

  getAll(): RegisteredService[] {
    return Array.from(this.services.values());
  }

  getByTier(tier: ServiceTierLevel): RegisteredService[] {
    return this.getAll().filter(s => s.tier === tier);
  }

  getByStatus(status: ServiceStatus): RegisteredService[] {
    return this.getAll().filter(s => s.status === status);
  }

  updateHealth(serviceId: string, status: ServiceStatus, latencyMs: number, errorRate: number): void {
    const svc = this.services.get(serviceId);
    if (!svc) return;
    svc.status = status;
    svc.latencyMs = latencyMs;
    svc.errorRate = errorRate;
    svc.lastHealthCheck = new Date().toISOString();
  }

  getDependents(serviceId: string): RegisteredService[] {
    return this.getAll().filter(s => s.dependencies.includes(serviceId));
  }

  getDependencies(serviceId: string): RegisteredService[] {
    const svc = this.services.get(serviceId);
    if (!svc) return [];
    return svc.dependencies.map(d => this.services.get(d)).filter(Boolean) as RegisteredService[];
  }

  buildDependencyGraph(): ServiceDependencyEdge[] {
    const edges: ServiceDependencyEdge[] = [];
    for (const svc of this.services.values()) {
      for (const dep of svc.dependencies) {
        const target = this.services.get(dep);
        edges.push({
          from: svc.id,
          to: dep,
          type: "required",
          isHealthy: target?.status === "healthy" || target?.status === "degraded",
        });
      }
    }
    return edges;
  }

  findCapability(capability: string): RegisteredService[] {
    return this.getAll().filter(s => s.capabilities.includes(capability));
  }

  getHealthSummary(): RegistryHealthSummary {
    const all = this.getAll();
    const healthy = all.filter(s => s.status === "healthy").length;
    const degraded = all.filter(s => s.status === "degraded").length;
    const down = all.filter(s => s.status === "down").length;

    return {
      totalServices: all.length,
      healthy,
      degraded,
      down,
      overallStatus: down > 0 ? "down" : degraded > 0 ? "degraded" : "healthy",
      dependencyGraph: this.buildDependencyGraph(),
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function createServiceRegistry(): ServiceRegistryService {
  return new ServiceRegistryService();
}
