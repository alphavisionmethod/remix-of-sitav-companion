// ═══════════════════════════════════════════════════════════════
// SITA OS — Update Daemon (updated)
// A/B slot management, atomic install, health validation, rollback
// ═══════════════════════════════════════════════════════════════

export type UpdateState =
  | "idle" | "checking" | "metadata_verified" | "preflight_failed"
  | "downloading" | "download_paused" | "download_verified"
  | "staging" | "staged" | "awaiting_reboot"
  | "boot_validation" | "health_validation"
  | "succeeded" | "failed" | "rolled_back";

export type UpdateChannel = "stable" | "beta" | "canary";
export type UpdateType = "full" | "delta" | "security" | "service" | "firmware";

export interface SystemSlot {
  id: "A" | "B";
  version: string;
  buildId: string;
  status: "active" | "inactive" | "staging" | "pending_boot" | "trial_boot" | "confirmed_good" | "rollback_target" | "invalid";
  bootCount: number;
  healthStatus: "healthy" | "degraded" | "failed" | "unknown";
  integrityVerified: boolean;
  lastBootAt: string | null;
  installedAt: string;
}

export interface CatalogEntry {
  id: string;
  version: string;
  buildId: string;
  channel: UpdateChannel;
  type: UpdateType;
  sizeBytes: number;
  critical: boolean;
  releaseNotes: string;
  components: string[];
  rolloutPercent: number;
  minVersion: string;
  signatureValid: boolean;
  publishedAt: string;
}

export interface PreflightResult {
  passed: boolean;
  batteryPercent: number;
  chargerConnected: boolean;
  freeStorageBytes: number;
  networkType: string;
  channelAllowed: boolean;
  policyAllowed: boolean;
  slotAvailable: boolean;
  reasonCode: string | null;
  checkedAt: string;
}

export interface HealthCheckResult {
  component: string;
  status: "pass" | "fail" | "running" | "pending";
  details: string;
  checkedAt: string;
}

export interface RollbackEvent {
  id: string;
  updateId: string;
  fromSlot: "A" | "B";
  toSlot: "A" | "B";
  triggerType: "auto" | "manual" | "health_failure" | "boot_failure";
  reasonCode: string;
  healthResults: HealthCheckResult[];
  detectedAt: string;
  completedAt: string;
}

export interface UpdateHistoryEntry {
  id: string;
  fromVersion: string;
  toVersion: string;
  action: "installed" | "failed" | "deferred" | "rolled_back";
  actor: "system" | "user" | "policy";
  reason: string;
  createdAt: string;
}

export interface DownloadProgress {
  bytesTotal: number;
  bytesDownloaded: number;
  speedBps: number;
  eta: number;
  percent: number;
}

export interface UpdateDaemonState {
  state: UpdateState;
  channel: UpdateChannel;
  currentVersion: string;
  activeSlot: SystemSlot;
  inactiveSlot: SystemSlot;
  catalog: CatalogEntry[];
  downloadProgress: DownloadProgress | null;
  preflightResult: PreflightResult | null;
  healthResults: HealthCheckResult[];
  rollbackHistory: RollbackEvent[];
  updateHistory: UpdateHistoryEntry[];
  lastCheckedAt: string | null;
  activeUpdateId: string | null;
  error: string | null;
}

// ── Health Check Components ──
const HEALTH_COMPONENTS = [
  "kernel", "root_fs", "policyd", "sessiond", "shell",
  "networking", "shieldd", "powerd", "controlcenterd", "auditd"
];

// ── Simulated delay ──
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Singleton Update Daemon ──
class UpdateDaemonEngine {
  private _state: UpdateDaemonState;
  private _listeners: Set<() => void> = new Set();
  private _downloadTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this._state = {
      state: "idle",
      channel: "stable",
      currentVersion: "v2.8.1",
      activeSlot: {
        id: "A", version: "v2.8.1", buildId: "2026.04.07.001",
        status: "active", bootCount: 47, healthStatus: "healthy",
        integrityVerified: true, lastBootAt: new Date().toISOString(),
        installedAt: "2026-04-07T14:30:00Z"
      },
      inactiveSlot: {
        id: "B", version: "v2.7.9", buildId: "2026.03.15.002",
        status: "inactive", bootCount: 32, healthStatus: "healthy",
        integrityVerified: true, lastBootAt: "2026-04-06T09:00:00Z",
        installedAt: "2026-03-15T10:00:00Z"
      },
      catalog: [],
      downloadProgress: null,
      preflightResult: null,
      healthResults: [],
      rollbackHistory: [
        {
          id: "rb-001", updateId: "upd-005",
          fromSlot: "B", toSlot: "A",
          triggerType: "health_failure",
          reasonCode: "sessiond_crash_loop",
          healthResults: [
            { component: "kernel", status: "pass", details: "Boot OK", checkedAt: "2026-03-10T03:05:00Z" },
            { component: "sessiond", status: "fail", details: "Crash loop detected (3 restarts in 60s)", checkedAt: "2026-03-10T03:05:12Z" },
          ],
          detectedAt: "2026-03-10T03:05:12Z",
          completedAt: "2026-03-10T03:05:45Z"
        }
      ],
      updateHistory: [
        { id: "h1", fromVersion: "v2.7.9", toVersion: "v2.8.0", action: "installed", actor: "user", reason: "Manual install", createdAt: "2026-03-28T10:00:00Z" },
        { id: "h2", fromVersion: "v2.8.0", toVersion: "v2.8.1", action: "installed", actor: "system", reason: "Auto-applied security patch", createdAt: "2026-04-07T03:00:00Z" },
        { id: "h3", fromVersion: "v2.7.0", toVersion: "v2.7.5", action: "rolled_back", actor: "system", reason: "sessiond crash loop after boot", createdAt: "2026-03-10T03:05:45Z" },
        { id: "h4", fromVersion: "v2.7.9", toVersion: "v2.8.0-beta.3", action: "deferred", actor: "policy", reason: "Beta channel not enabled", createdAt: "2026-03-25T12:00:00Z" },
      ],
      lastCheckedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      activeUpdateId: null,
      error: null,
    };
  }

  getState(): UpdateDaemonState { return this._state; }

  subscribe(fn: () => void) {
    this._listeners.add(fn);
    return () => { this._listeners.delete(fn); };
  }

  private emit() {
    this._state = { ...this._state };
    this._listeners.forEach(fn => fn());
  }

  private set(partial: Partial<UpdateDaemonState>) {
    Object.assign(this._state, partial);
    this.emit();
  }

  // ── Check for Updates ──
  async checkForUpdates() {
    this.set({ state: "checking", error: null });
    await delay(1500);

    const catalog: CatalogEntry[] = [
      {
        id: "upd-010", version: "v2.9.0", buildId: "2026.04.14.001",
        channel: "stable", type: "full", sizeBytes: 384_000_000,
        critical: false, releaseNotes: "New AI governance workspace, enhanced Boardroom flows, desktop surface refresh, Shield 2.0 smart rules.",
        components: ["shell", "boardroom", "shieldd", "policyd", "ai-runtime"],
        rolloutPercent: 45, minVersion: "v2.7.0", signatureValid: true,
        publishedAt: "2026-04-13T18:00:00Z"
      },
      {
        id: "upd-011", version: "v2.8.2", buildId: "2026.04.12.001",
        channel: "stable", type: "security", sizeBytes: 12_400_000,
        critical: true, releaseNotes: "Critical: TLS certificate chain validation fix. CVE-2026-1847 patched.",
        components: ["networking", "shieldd"],
        rolloutPercent: 100, minVersion: "v2.8.0", signatureValid: true,
        publishedAt: "2026-04-12T09:00:00Z"
      },
      {
        id: "upd-012", version: "v3.0.0-beta.1", buildId: "2026.04.14.beta",
        channel: "beta", type: "full", sizeBytes: 520_000_000,
        critical: false, releaseNotes: "SITA OS 3.0 preview: New kernel scheduler, redesigned compositor, spatial audio.",
        components: ["kernel", "compositor", "audio", "shell", "all-services"],
        rolloutPercent: 100, minVersion: "v2.8.0", signatureValid: true,
        publishedAt: "2026-04-14T06:00:00Z"
      },
    ];

    this.set({
      state: "metadata_verified",
      catalog: catalog.filter(u => u.channel === this._state.channel || u.critical),
      lastCheckedAt: new Date().toISOString(),
    });
  }

  // ── Run Preflight ──
  async runPreflight(updateId: string): Promise<PreflightResult> {
    await delay(800);
    const update = this._state.catalog.find(u => u.id === updateId);
    const batteryPercent = 72;
    const chargerConnected = false;
    const freeStorageBytes = 8_500_000_000;
    const networkType = "wifi";
    const channelAllowed = update ? update.channel === this._state.channel || update.critical : false;
    const policyAllowed = true;
    const slotAvailable = this._state.inactiveSlot.status === "inactive" || this._state.inactiveSlot.status === "confirmed_good";

    const needsCharger = update && update.sizeBytes > 200_000_000 && batteryPercent < 40;
    const passed = channelAllowed && policyAllowed && slotAvailable && !needsCharger && freeStorageBytes > (update?.sizeBytes || 0) * 2;

    const result: PreflightResult = {
      passed, batteryPercent, chargerConnected, freeStorageBytes,
      networkType, channelAllowed, policyAllowed, slotAvailable,
      reasonCode: !passed ? (needsCharger ? "low_battery" : !channelAllowed ? "channel_blocked" : !slotAvailable ? "no_slot" : "insufficient_storage") : null,
      checkedAt: new Date().toISOString(),
    };

    this.set({ preflightResult: result, state: passed ? "metadata_verified" : "preflight_failed" });
    return result;
  }

  // ── Download Update ──
  async downloadUpdate(updateId: string) {
    const update = this._state.catalog.find(u => u.id === updateId);
    if (!update) return;

    this.set({ state: "downloading", activeUpdateId: updateId, error: null });

    const totalBytes = update.sizeBytes;
    let downloaded = 0;
    const chunkSize = totalBytes / 20;
    const startTime = Date.now();

    return new Promise<void>((resolve) => {
      this._downloadTimer = setInterval(() => {
        downloaded = Math.min(downloaded + chunkSize + Math.random() * chunkSize * 0.3, totalBytes);
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = downloaded / elapsed;
        const remaining = totalBytes - downloaded;

        this.set({
          downloadProgress: {
            bytesTotal: totalBytes,
            bytesDownloaded: Math.round(downloaded),
            speedBps: Math.round(speed),
            eta: Math.round(remaining / speed),
            percent: Math.round((downloaded / totalBytes) * 100),
          }
        });

        if (downloaded >= totalBytes) {
          if (this._downloadTimer) clearInterval(this._downloadTimer);
          this._downloadTimer = null;
          this.set({ state: "download_verified", downloadProgress: { ...this._state.downloadProgress!, percent: 100, bytesDownloaded: totalBytes } });
          resolve();
        }
      }, 300);
    });
  }

  cancelDownload() {
    if (this._downloadTimer) { clearInterval(this._downloadTimer); this._downloadTimer = null; }
    this.set({ state: "idle", downloadProgress: null, activeUpdateId: null });
  }

  // ── Stage Update ──
  async stageUpdate() {
    this.set({ state: "staging" });
    await delay(2000);

    const update = this._state.catalog.find(u => u.id === this._state.activeUpdateId);
    if (!update) return;

    this.set({
      state: "staged",
      inactiveSlot: {
        ...this._state.inactiveSlot,
        version: update.version,
        buildId: update.buildId,
        status: "staging",
        integrityVerified: true,
        installedAt: new Date().toISOString(),
      }
    });

    await delay(500);
    this.set({
      state: "awaiting_reboot",
      inactiveSlot: { ...this._state.inactiveSlot, status: "pending_boot" }
    });
  }

  // ── Reboot + Validate ──
  async rebootAndValidate(): Promise<boolean> {
    this.set({ state: "boot_validation", healthResults: [] });
    await delay(1500);

    // Simulate health checks one by one
    const results: HealthCheckResult[] = [];
    for (const comp of HEALTH_COMPONENTS) {
      this.set({
        healthResults: [...results, { component: comp, status: "running", details: "Checking...", checkedAt: new Date().toISOString() }]
      });
      await delay(400 + Math.random() * 300);

      const passed = Math.random() > 0.03; // 97% pass rate per component
      const result: HealthCheckResult = {
        component: comp,
        status: passed ? "pass" : "fail",
        details: passed ? "Started successfully" : `${comp} failed to initialize`,
        checkedAt: new Date().toISOString(),
      };
      results.push(result);
      this.set({ healthResults: [...results] });
    }

    const allPassed = results.every(r => r.status === "pass");

    if (allPassed) {
      const update = this._state.catalog.find(u => u.id === this._state.activeUpdateId);
      this.set({
        state: "succeeded",
        currentVersion: update?.version || this._state.currentVersion,
        activeSlot: { ...this._state.inactiveSlot, status: "active", bootCount: 1, healthStatus: "healthy", lastBootAt: new Date().toISOString() },
        inactiveSlot: { ...this._state.activeSlot, status: "inactive" },
        downloadProgress: null,
        updateHistory: [
          { id: crypto.randomUUID(), fromVersion: this._state.currentVersion, toVersion: update?.version || "unknown", action: "installed", actor: "user", reason: "Update installed successfully", createdAt: new Date().toISOString() },
          ...this._state.updateHistory,
        ],
      });
      return true;
    } else {
      // Rollback
      const failedComponents = results.filter(r => r.status === "fail").map(r => r.component);
      const rollbackEvent: RollbackEvent = {
        id: crypto.randomUUID(),
        updateId: this._state.activeUpdateId || "unknown",
        fromSlot: this._state.inactiveSlot.id,
        toSlot: this._state.activeSlot.id,
        triggerType: "health_failure",
        reasonCode: `Failed components: ${failedComponents.join(", ")}`,
        healthResults: results,
        detectedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      this.set({
        state: "rolled_back",
        inactiveSlot: { ...this._state.inactiveSlot, status: "invalid", healthStatus: "failed" },
        rollbackHistory: [rollbackEvent, ...this._state.rollbackHistory],
        updateHistory: [
          { id: crypto.randomUUID(), fromVersion: this._state.currentVersion, toVersion: this._state.inactiveSlot.version, action: "rolled_back", actor: "system", reason: rollbackEvent.reasonCode, createdAt: new Date().toISOString() },
          ...this._state.updateHistory,
        ],
        downloadProgress: null,
        error: `Rollback triggered: ${rollbackEvent.reasonCode}`,
      });
      return false;
    }
  }

  // ── Manual Rollback ──
  async manualRollback() {
    if (this._state.inactiveSlot.healthStatus !== "healthy") return;
    this.set({ state: "boot_validation" });
    await delay(2000);

    const rollbackEvent: RollbackEvent = {
      id: crypto.randomUUID(),
      updateId: "manual",
      fromSlot: this._state.activeSlot.id,
      toSlot: this._state.inactiveSlot.id,
      triggerType: "manual",
      reasonCode: "User-initiated rollback",
      healthResults: [],
      detectedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    const oldActive = this._state.activeSlot;
    const oldInactive = this._state.inactiveSlot;

    this.set({
      state: "rolled_back",
      currentVersion: oldInactive.version,
      activeSlot: { ...oldInactive, status: "active", lastBootAt: new Date().toISOString() },
      inactiveSlot: { ...oldActive, status: "inactive" },
      rollbackHistory: [rollbackEvent, ...this._state.rollbackHistory],
      updateHistory: [
        { id: crypto.randomUUID(), fromVersion: oldActive.version, toVersion: oldInactive.version, action: "rolled_back", actor: "user", reason: "Manual rollback", createdAt: new Date().toISOString() },
        ...this._state.updateHistory,
      ],
    });
  }

  // ── Set Channel ──
  setChannel(channel: UpdateChannel) {
    this.set({ channel, catalog: [] });
  }

  // ── Reset to idle ──
  resetState() {
    this.set({ state: "idle", downloadProgress: null, preflightResult: null, healthResults: [], activeUpdateId: null, error: null });
  }
}

// Singleton
export const updateDaemon = new UpdateDaemonEngine();
