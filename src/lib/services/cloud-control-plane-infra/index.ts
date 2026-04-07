// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Control Plane Service
// Multi-cloud region management, provider abstraction, failover
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type RegionStatus = "active" | "degraded" | "offline" | "draining" | "provisioning";
export type CloudProviderType = "aws" | "azure" | "gcp" | "on-prem" | "edge";

export interface CloudRegion {
  readonly id: string;
  readonly name: string;
  readonly provider: CloudProviderType;
  readonly location: string;
  readonly latitude: number;
  readonly longitude: number;
  status: RegionStatus;
  latencyMs: number;
  capacity: { used: number; total: number };
  services: string[];
  isPrimary: boolean;
  costPerHour: number;
  lastHealthCheck: number;
  createdAt: number;
}

export interface CloudProvider {
  readonly id: string;
  readonly type: CloudProviderType;
  readonly name: string;
  readonly accountId: string;
  regions: string[];
  status: "healthy" | "degraded" | "unavailable";
  sla: number;
  monthlyCost: number;
  registeredAt: number;
}

export interface RoutingDecision {
  readonly userId: string;
  readonly selectedRegion: string;
  readonly reason: string;
  readonly latencyMs: number;
  readonly fallbacks: string[];
  readonly decidedAt: number;
}

export interface FailoverRecord {
  readonly id: string;
  readonly fromRegion: string;
  readonly toRegion: string;
  readonly reason: string;
  readonly initiatedBy: string;
  readonly startedAt: number;
  completedAt?: number;
  status: "in-progress" | "completed" | "failed" | "rolled-back";
  affectedServices: string[];
  migratedConnections: number;
}

export interface EnvironmentTopology {
  regions: CloudRegion[];
  providers: CloudProvider[];
  totalCapacity: { used: number; total: number };
  primaryRegion: string | null;
  failoverChain: string[];
  healthScore: number;
}

export class CloudControlPlaneService {
  private regions = new Map<string, CloudRegion>();
  private providers = new Map<string, CloudProvider>();
  private failoverHistory: FailoverRecord[] = [];
  private routingCache = new Map<string, RoutingDecision>();

  registerRegion(input: Omit<CloudRegion, "id" | "lastHealthCheck" | "createdAt">): CloudRegion {
    const region: CloudRegion = {
      ...input,
      id: `region_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      lastHealthCheck: Date.now(),
      createdAt: Date.now(),
    };
    this.regions.set(region.id, region);

    // auto-add to provider's region list
    const provider = Array.from(this.providers.values()).find(p => p.type === input.provider);
    if (provider) provider.regions.push(region.id);

    return region;
  }

  getRegion(id: string): CloudRegion | undefined {
    return this.regions.get(id);
  }

  listRegions(filter?: { provider?: CloudProviderType; status?: RegionStatus }): CloudRegion[] {
    let results = Array.from(this.regions.values());
    if (filter?.provider) results = results.filter(r => r.provider === filter.provider);
    if (filter?.status) results = results.filter(r => r.status === filter.status);
    return results.sort((a, b) => a.latencyMs - b.latencyMs);
  }

  setRegionStatus(id: string, status: RegionStatus): boolean {
    const region = this.regions.get(id);
    if (!region) return false;
    region.status = status;
    region.lastHealthCheck = Date.now();
    return true;
  }

  getRoutingDecision(userId: string): RoutingDecision {
    const cached = this.routingCache.get(userId);
    if (cached && Date.now() - cached.decidedAt < 300_000) return cached;

    const active = this.listRegions({ status: "active" });
    if (active.length === 0) {
      const degraded = this.listRegions({ status: "degraded" });
      const fallback = degraded[0];
      const decision: RoutingDecision = {
        userId,
        selectedRegion: fallback?.id ?? "none",
        reason: fallback ? "All active regions offline; using degraded fallback" : "No regions available",
        latencyMs: fallback?.latencyMs ?? 9999,
        fallbacks: [],
        decidedAt: Date.now(),
      };
      this.routingCache.set(userId, decision);
      return decision;
    }

    // hash userId to get consistent region assignment
    const hash = Array.from(userId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const primary = active[hash % active.length];
    const fallbacks = active.filter(r => r.id !== primary.id).slice(0, 2).map(r => r.id);

    const decision: RoutingDecision = {
      userId,
      selectedRegion: primary.id,
      reason: `Lowest latency active region (${primary.latencyMs}ms)`,
      latencyMs: primary.latencyMs,
      fallbacks,
      decidedAt: Date.now(),
    };
    this.routingCache.set(userId, decision);
    return decision;
  }

  registerProvider(input: Omit<CloudProvider, "id" | "registeredAt">): CloudProvider {
    const provider: CloudProvider = {
      ...input,
      id: `provider_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      registeredAt: Date.now(),
    };
    this.providers.set(provider.id, provider);
    return provider;
  }

  getProviderHealth(): Array<{ provider: CloudProvider; healthyRegions: number; totalRegions: number; avgLatency: number }> {
    return Array.from(this.providers.values()).map(provider => {
      const regions = provider.regions.map(id => this.regions.get(id)).filter(Boolean) as CloudRegion[];
      const healthy = regions.filter(r => r.status === "active").length;
      const avgLatency = regions.length > 0
        ? regions.reduce((sum, r) => sum + r.latencyMs, 0) / regions.length
        : 0;
      return { provider, healthyRegions: healthy, totalRegions: regions.length, avgLatency: Math.round(avgLatency) };
    });
  }

  failoverRegion(fromId: string, toId: string, reason: string, initiatedBy = "system"): FailoverRecord | null {
    const from = this.regions.get(fromId);
    const to = this.regions.get(toId);
    if (!from || !to) return null;

    const record: FailoverRecord = {
      id: `fo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fromRegion: fromId,
      toRegion: toId,
      reason,
      initiatedBy,
      startedAt: Date.now(),
      status: "in-progress",
      affectedServices: [...from.services],
      migratedConnections: 0,
    };

    // execute failover
    from.status = "draining";
    to.services = [...new Set([...to.services, ...from.services])];
    record.migratedConnections = from.services.length;
    record.completedAt = Date.now();
    record.status = "completed";
    from.status = "offline";

    // invalidate routing cache
    this.routingCache.clear();
    this.failoverHistory.push(record);
    return record;
  }

  getEnvironmentTopology(): EnvironmentTopology {
    const regions = Array.from(this.regions.values());
    const providers = Array.from(this.providers.values());
    const totalUsed = regions.reduce((s, r) => s + r.capacity.used, 0);
    const totalCap = regions.reduce((s, r) => s + r.capacity.total, 0);
    const primary = regions.find(r => r.isPrimary);
    const active = regions.filter(r => r.status === "active");
    const healthScore = regions.length > 0
      ? Math.round((active.length / regions.length) * 100)
      : 0;

    return {
      regions,
      providers,
      totalCapacity: { used: totalUsed, total: totalCap },
      primaryRegion: primary?.id ?? null,
      failoverChain: active.sort((a, b) => a.latencyMs - b.latencyMs).map(r => r.id),
      healthScore,
    };
  }

  getCostByRegion(): Array<{ regionId: string; name: string; provider: CloudProviderType; hourly: number; monthly: number }> {
    return Array.from(this.regions.values()).map(r => ({
      regionId: r.id,
      name: r.name,
      provider: r.provider,
      hourly: r.costPerHour,
      monthly: Math.round(r.costPerHour * 730 * 100) / 100,
    }));
  }

  getFailoverHistory(): FailoverRecord[] {
    return [...this.failoverHistory].sort((a, b) => b.startedAt - a.startedAt);
  }

  getDemoTopology(): EnvironmentTopology {
    return {
      regions: [
        { id: "reg_us_east", name: "US East (Virginia)", provider: "aws", location: "us-east-1", latitude: 39.04, longitude: -77.49, status: "active", latencyMs: 12, capacity: { used: 340, total: 500 }, services: ["brain-core", "event-bus", "api-gateway", "policy-engine"], isPrimary: true, costPerHour: 2.40, lastHealthCheck: Date.now(), createdAt: Date.now() - 86400000 * 30 },
        { id: "reg_eu_west", name: "EU West (Frankfurt)", provider: "aws", location: "eu-west-1", latitude: 50.11, longitude: 8.68, status: "active", latencyMs: 28, capacity: { used: 180, total: 300 }, services: ["brain-core", "event-bus", "api-gateway"], isPrimary: false, costPerHour: 2.60, lastHealthCheck: Date.now(), createdAt: Date.now() - 86400000 * 30 },
        { id: "reg_on_prem", name: "On-Premises (DC1)", provider: "on-prem", location: "headquarters", latitude: 37.77, longitude: -122.42, status: "active", latencyMs: 3, capacity: { used: 90, total: 200 }, services: ["keyvault", "trust-state", "receipt-service"], isPrimary: false, costPerHour: 1.10, lastHealthCheck: Date.now(), createdAt: Date.now() - 86400000 * 90 },
      ],
      providers: [
        { id: "prov_aws", type: "aws", name: "Amazon Web Services", accountId: "***-redacted", regions: ["reg_us_east", "reg_eu_west"], status: "healthy", sla: 99.99, monthlyCost: 3650, registeredAt: Date.now() - 86400000 * 90 },
        { id: "prov_onprem", type: "on-prem", name: "On-Premises DC", accountId: "dc-001", regions: ["reg_on_prem"], status: "healthy", sla: 99.95, monthlyCost: 800, registeredAt: Date.now() - 86400000 * 90 },
      ],
      totalCapacity: { used: 610, total: 1000 },
      primaryRegion: "reg_us_east",
      failoverChain: ["reg_on_prem", "reg_us_east", "reg_eu_west"],
      healthScore: 100,
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("cloud-control-plane-infra", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      regions: Array.from(this.regions.entries()),
      providers: Array.from(this.providers.entries()),
      failoverHistory: this.failoverHistory,
      routingCache: Array.from(this.routingCache.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.regions) this.regions = new Map(state.regions as [string, unknown][]);
    if (state.providers) this.providers = new Map(state.providers as [string, unknown][]);
    if (state.failoverHistory) this.failoverHistory = state.failoverHistory as never;
    if (state.routingCache) this.routingCache = new Map(state.routingCache as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("cloud-control-plane-infra");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createCloudControlPlaneInfra(): CloudControlPlaneService {
  return new CloudControlPlaneService();
}
