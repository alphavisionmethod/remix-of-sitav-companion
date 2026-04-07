// ═══════════════════════════════════════════════════════════════
// SITA OS — Fleet OTA (Over-The-Air) Update Service
// Manages OTA release distribution, rollout strategies, and
// device version tracking for the SITA device fleet
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type RolloutStrategy = "immediate" | "canary-then-all" | "ring-based" | "scheduled";
export type RolloutStatus = "draft" | "active" | "paused" | "completed" | "rolled-back" | "failed";
export type DeviceUpdateStatus = "pending" | "downloading" | "installing" | "verifying" | "completed" | "failed" | "rolled-back";

export interface OTARelease {
  readonly id: string;
  readonly version: string;
  readonly changelog: string;
  readonly payload: { size: number; checksum: string; url: string; signature: string };
  readonly minRuntimeVersion: string;
  readonly requiredCapabilities: string[];
  readonly critical: boolean;
  status: "draft" | "published" | "deprecated";
  createdAt: number;
  publishedAt?: number;
}

export interface RolloutPlan {
  readonly id: string;
  readonly releaseId: string;
  strategy: RolloutStrategy;
  status: RolloutStatus;
  config: {
    canaryPercent: number;
    canaryDurationMs: number;
    rings: string[];
    ringDelayMs: number;
    scheduledAt?: number;
    maxFailureRate: number;
    requiresApproval: boolean;
  };
  progress: RolloutProgress;
  startedAt?: number;
  pausedAt?: number;
  completedAt?: number;
  rollbackReason?: string;
  createdAt: number;
}

export interface RolloutProgress {
  totalDevices: number;
  updatedDevices: number;
  failedDevices: number;
  pendingDevices: number;
  successRate: number;
  currentRing: string;
  estimatedCompletionMs: number;
}

export interface DeviceUpdateReport {
  readonly id: string;
  readonly deviceId: string;
  readonly releaseId: string;
  readonly planId: string;
  status: DeviceUpdateStatus;
  previousVersion: string;
  targetVersion: string;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  error?: string;
  retries: number;
}

export interface VersionDistribution {
  version: string;
  count: number;
  percentage: number;
  isLatest: boolean;
}

export class FleetOTAService {
  private releases = new Map<string, OTARelease>();
  private plans = new Map<string, RolloutPlan>();
  private reports: DeviceUpdateReport[] = [];
  private deviceVersions = new Map<string, string>();

  createRelease(version: string, payload: OTARelease["payload"], changelog: string, opts?: { minRuntimeVersion?: string; requiredCapabilities?: string[]; critical?: boolean }): OTARelease {
    const release: OTARelease = {
      id: `ota_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      version,
      changelog,
      payload,
      minRuntimeVersion: opts?.minRuntimeVersion ?? "1.0.0",
      requiredCapabilities: opts?.requiredCapabilities ?? [],
      critical: opts?.critical ?? false,
      status: "draft",
      createdAt: Date.now(),
    };
    this.releases.set(release.id, release);
    return release;
  }

  publishRelease(id: string): boolean {
    const r = this.releases.get(id);
    if (!r || r.status !== "draft") return false;
    r.status = "published";
    r.publishedAt = Date.now();
    return true;
  }

  getRelease(id: string): OTARelease | undefined { return this.releases.get(id); }
  listReleases(): OTARelease[] { return Array.from(this.releases.values()).sort((a, b) => b.createdAt - a.createdAt); }

  createRolloutPlan(releaseId: string, strategy: RolloutStrategy, config?: Partial<RolloutPlan["config"]>): RolloutPlan | null {
    const release = this.releases.get(releaseId);
    if (!release || release.status !== "published") return null;

    const totalDevices = this.deviceVersions.size || 10; // fallback for demo
    const plan: RolloutPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      releaseId,
      strategy,
      status: "draft",
      config: {
        canaryPercent: config?.canaryPercent ?? 5,
        canaryDurationMs: config?.canaryDurationMs ?? 3600_000,
        rings: config?.rings ?? ["canary", "early-adopter", "general"],
        ringDelayMs: config?.ringDelayMs ?? 7200_000,
        scheduledAt: config?.scheduledAt,
        maxFailureRate: config?.maxFailureRate ?? 5,
        requiresApproval: config?.requiresApproval ?? true,
      },
      progress: {
        totalDevices,
        updatedDevices: 0,
        failedDevices: 0,
        pendingDevices: totalDevices,
        successRate: 0,
        currentRing: strategy === "ring-based" ? "canary" : "all",
        estimatedCompletionMs: 0,
      },
      createdAt: Date.now(),
    };
    this.plans.set(plan.id, plan);
    return plan;
  }

  startRollout(planId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan || plan.status !== "draft") return false;
    plan.status = "active";
    plan.startedAt = Date.now();
    return true;
  }

  pauseRollout(planId: string, reason: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan || plan.status !== "active") return false;
    plan.status = "paused";
    plan.pausedAt = Date.now();
    plan.rollbackReason = reason;
    return true;
  }

  resumeRollout(planId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan || plan.status !== "paused") return false;
    plan.status = "active";
    plan.pausedAt = undefined;
    return true;
  }

  rollbackRollout(planId: string, reason?: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    plan.status = "rolled-back";
    plan.rollbackReason = reason ?? "Manual rollback";
    plan.completedAt = Date.now();

    // mark all pending device reports as rolled-back
    this.reports.filter(r => r.planId === planId && ["pending", "downloading", "installing"].includes(r.status))
      .forEach(r => { r.status = "rolled-back"; });

    return true;
  }

  reportDeviceUpdate(deviceId: string, releaseId: string, planId: string, status: DeviceUpdateStatus, meta?: { previousVersion?: string; error?: string }): DeviceUpdateReport {
    const release = this.releases.get(releaseId);
    const existing = this.reports.find(r => r.deviceId === deviceId && r.planId === planId);

    if (existing) {
      existing.status = status;
      if (status === "completed") {
        existing.completedAt = Date.now();
        existing.durationMs = existing.completedAt - existing.startedAt;
        this.deviceVersions.set(deviceId, release?.version ?? "unknown");
      }
      if (status === "failed") {
        existing.retries++;
        existing.error = meta?.error;
      }
      this.updatePlanProgress(planId);
      return existing;
    }

    const report: DeviceUpdateReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      deviceId,
      releaseId,
      planId,
      status,
      previousVersion: meta?.previousVersion ?? this.deviceVersions.get(deviceId) ?? "unknown",
      targetVersion: release?.version ?? "unknown",
      startedAt: Date.now(),
      retries: 0,
      error: meta?.error,
    };
    this.reports.push(report);
    this.updatePlanProgress(planId);
    return report;
  }

  private updatePlanProgress(planId: string): void {
    const plan = this.plans.get(planId);
    if (!plan) return;
    const planReports = this.reports.filter(r => r.planId === planId);
    const completed = planReports.filter(r => r.status === "completed").length;
    const failed = planReports.filter(r => r.status === "failed").length;
    plan.progress.updatedDevices = completed;
    plan.progress.failedDevices = failed;
    plan.progress.pendingDevices = plan.progress.totalDevices - completed - failed;
    plan.progress.successRate = planReports.length > 0 ? Math.round((completed / planReports.length) * 100) : 0;

    // auto-fail if failure rate exceeds threshold
    if (planReports.length >= 5 && (failed / planReports.length) * 100 > plan.config.maxFailureRate) {
      plan.status = "failed";
      plan.rollbackReason = `Failure rate ${Math.round((failed / planReports.length) * 100)}% exceeded threshold ${plan.config.maxFailureRate}%`;
      plan.completedAt = Date.now();
    }

    // auto-complete if all done
    if (plan.progress.pendingDevices === 0 && plan.status === "active") {
      plan.status = "completed";
      plan.completedAt = Date.now();
    }
  }

  getRolloutProgress(planId: string): RolloutProgress | null {
    return this.plans.get(planId)?.progress ?? null;
  }

  getDeviceVersion(deviceId: string): string {
    return this.deviceVersions.get(deviceId) ?? "unknown";
  }

  setDeviceVersion(deviceId: string, version: string): void {
    this.deviceVersions.set(deviceId, version);
  }

  getVersionDistribution(): VersionDistribution[] {
    const counts = new Map<string, number>();
    for (const v of this.deviceVersions.values()) {
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    const total = this.deviceVersions.size || 1;
    const latest = Array.from(this.releases.values()).find(r => r.status === "published")?.version;

    return Array.from(counts.entries()).map(([version, count]) => ({
      version,
      count,
      percentage: Math.round((count / total) * 100),
      isLatest: version === latest,
    })).sort((a, b) => b.count - a.count);
  }

  listPlans(): RolloutPlan[] { return Array.from(this.plans.values()).sort((a, b) => b.createdAt - a.createdAt); }

  getDemoData(): { releases: OTARelease[]; plans: RolloutPlan[]; distribution: VersionDistribution[] } {
    return {
      releases: [
        { id: "ota_demo_1", version: "2.1.0", changelog: "Security patch + edge sync improvements", payload: { size: 45_000_000, checksum: "sha256:abc123", url: "/releases/2.1.0", signature: "sig_valid" }, minRuntimeVersion: "1.9.0", requiredCapabilities: [], critical: true, status: "published", createdAt: Date.now() - 86400000 * 3, publishedAt: Date.now() - 86400000 * 2 },
        { id: "ota_demo_2", version: "2.2.0-rc1", changelog: "AI workforce agent v2, fleet health dashboard", payload: { size: 62_000_000, checksum: "sha256:def456", url: "/releases/2.2.0-rc1", signature: "sig_valid" }, minRuntimeVersion: "2.0.0", requiredCapabilities: ["compute"], critical: false, status: "draft", createdAt: Date.now() - 86400000 },
      ],
      plans: [
        { id: "plan_demo_1", releaseId: "ota_demo_1", strategy: "canary-then-all", status: "active", config: { canaryPercent: 10, canaryDurationMs: 7200000, rings: ["canary", "general"], ringDelayMs: 3600000, maxFailureRate: 5, requiresApproval: true }, progress: { totalDevices: 24, updatedDevices: 18, failedDevices: 1, pendingDevices: 5, successRate: 95, currentRing: "general", estimatedCompletionMs: 1800000 }, startedAt: Date.now() - 86400000, createdAt: Date.now() - 86400000 * 2 },
      ],
      distribution: [
        { version: "2.1.0", count: 18, percentage: 75, isLatest: true },
        { version: "2.0.3", count: 5, percentage: 21, isLatest: false },
        { version: "1.9.1", count: 1, percentage: 4, isLatest: false },
      ],
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("fleet-ota", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      releases: Array.from(this.releases.entries()),
      plans: Array.from(this.plans.entries()),
      reports: this.reports,
      deviceVersions: Array.from(this.deviceVersions.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.releases) this.releases = new Map(state.releases as Iterable<[string, never]>) as typeof this.releases;
    if (state.plans) this.plans = new Map(state.plans as Iterable<[string, never]>) as typeof this.plans;
    if (state.reports) this.reports = state.reports as never;
    if (state.deviceVersions) this.deviceVersions = new Map(state.deviceVersions as Iterable<[string, never]>) as typeof this.deviceVersions;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("fleet-ota");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createFleetOTA(): FleetOTAService {
  return new FleetOTAService();
}
