// ═══════════════════════════════════════════════════════════════
// SITA OS — updated: Atomic Update Daemon
// A/B slot model, signature verification, health validation,
// preflight policy checks, rollback state machine
// ═══════════════════════════════════════════════════════════════

import { getAuditDaemon } from "./auditd";
import { getContextualDecisionEngine, type EnhancedPolicyContext } from "./policyd-decisions";
import { getPolicyBundleManager } from "./policyd-bundles";

// ── Types ───────────────────────────────────────────────────

export type UpdateChannel = "stable" | "beta" | "dev";
export type UpdateType = "full" | "delta" | "security" | "firmware";

export type UpdateState =
  | "idle"
  | "checking"
  | "downloading"
  | "staging"
  | "awaiting_reboot"
  | "validating"
  | "succeeded"
  | "failed"
  | "rolled_back";

export type SlotStatus = "active" | "inactive" | "pending" | "failed" | "uninitialized";

export interface SystemSlot {
  slotId: "A" | "B";
  status: SlotStatus;
  version: string;
  buildId: string;
  bootCount: number;
  lastBootAt: number;
  integrityVerified: boolean;
  healthPassed: boolean;
  markedGood: boolean;
}

export interface UpdateCatalogEntry {
  updateId: string;
  version: string;
  buildId: string;
  channel: UpdateChannel;
  type: UpdateType;
  sizeBytes: number;
  minSupportedVersion: string;
  metadataHash: string;
  signatureRef: string;
  publishedAt: number;
  critical: boolean;
  rolloutPercentage: number;
  releaseNotes: string;
  components: string[];
}

export interface UpdatePreflightResult {
  eligible: boolean;
  blockers: Array<{ code: string; message: string; severity: string }>;
  warnings: Array<{ code: string; message: string }>;
  batteryOk: boolean;
  storageOk: boolean;
  networkOk: boolean;
  policyApproved: boolean;
  channelAllowed: boolean;
}

export interface HealthValidationResult {
  component: string;
  status: "pass" | "fail" | "skip";
  details: string;
  checkedAt: number;
  durationMs: number;
}

export interface RollbackEvent {
  eventId: string;
  updateId: string;
  sourceSlot: "A" | "B";
  rollbackToSlot: "A" | "B";
  triggerType: "health_failure" | "boot_failure" | "service_failure" | "manual" | "policy_mismatch";
  reasonCode: string;
  detectedAt: number;
  completedAt?: number;
  healthResults: HealthValidationResult[];
}

export interface UpdateProgress {
  state: UpdateState;
  updateId?: string;
  version?: string;
  bytesTotal: number;
  bytesDownloaded: number;
  percentComplete: number;
  currentStep: string;
  estimatedSecondsRemaining: number;
  canCancel: boolean;
}

// ── Update Daemon ───────────────────────────────────────────

export class UpdateDaemon {
  private state: UpdateState = "idle";
  private slots: Record<"A" | "B", SystemSlot>;
  private activeSlot: "A" | "B" = "A";
  private channel: UpdateChannel = "stable";
  private catalog: UpdateCatalogEntry[] = [];
  private currentUpdate: UpdateCatalogEntry | null = null;
  private progress: UpdateProgress;
  private bootAttempts: number = 0;
  private readonly MAX_BOOT_ATTEMPTS = 3;
  private healthResults: HealthValidationResult[] = [];
  private rollbackHistory: RollbackEvent[] = [];
  private updateHistory: Array<{ updateId: string; fromVersion: string; toVersion: string; action: string; timestamp: number; reason?: string }> = [];
  private downloadResumeState: { bytesDownloaded: number; totalBytes: number } | null = null;
  private initialized = false;

  constructor() {
    this.slots = {
      A: { slotId: "A", status: "active", version: "2026.4.0", buildId: "sita-2026.4.0-stable", bootCount: 1, lastBootAt: Date.now(), integrityVerified: true, healthPassed: true, markedGood: true },
      B: { slotId: "B", status: "inactive", version: "2026.3.2", buildId: "sita-2026.3.2-stable", bootCount: 0, lastBootAt: 0, integrityVerified: true, healthPassed: true, markedGood: true },
    };
    this.progress = this.idleProgress();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    // Seed demo catalog
    this.catalog = [
      {
        updateId: "update-2026.4.1", version: "2026.4.1", buildId: "sita-2026.4.1-stable",
        channel: "stable", type: "security", sizeBytes: 256 * 1024 * 1024,
        minSupportedVersion: "2026.3.0", metadataHash: "sha256-a1b2c3d4",
        signatureRef: "ed25519-platform-2026Q2", publishedAt: Date.now() - 86400000,
        critical: true, rolloutPercentage: 100,
        releaseNotes: "Security patches for kernel and networking stack.\n• CVE-2026-1234 fix\n• TLS 1.3 hardening\n• Firewall rule optimization",
        components: ["kernel", "networkd", "shieldd"],
      },
      {
        updateId: "update-2026.5.0-beta", version: "2026.5.0-beta.1", buildId: "sita-2026.5.0-b1",
        channel: "beta", type: "full", sizeBytes: 1024 * 1024 * 1024,
        minSupportedVersion: "2026.4.0", metadataHash: "sha256-e5f6g7h8",
        signatureRef: "ed25519-platform-2026Q2", publishedAt: Date.now() - 3600000,
        critical: false, rolloutPercentage: 25,
        releaseNotes: "SITA OS 2026.5 Beta — New features:\n• Redesigned notification center\n• Improved power management\n• New accessibility options",
        components: ["kernel", "shell", "powerd", "notifyd", "a11y"],
      },
    ];
    this.initialized = true;
  }

  // ── State ─────────────────────────────────────────────────

  getState(): UpdateState { return this.state; }
  getProgress(): UpdateProgress { return { ...this.progress }; }
  getActiveSlot(): SystemSlot { return { ...this.slots[this.activeSlot] }; }
  getInactiveSlot(): SystemSlot { return { ...this.slots[this.activeSlot === "A" ? "B" : "A"] }; }
  getSlots(): Record<"A" | "B", SystemSlot> { return { A: { ...this.slots.A }, B: { ...this.slots.B } }; }
  getChannel(): UpdateChannel { return this.channel; }
  getCurrentUpdate(): UpdateCatalogEntry | null { return this.currentUpdate; }
  getHealthResults(): HealthValidationResult[] { return [...this.healthResults]; }
  getRollbackHistory(): RollbackEvent[] { return [...this.rollbackHistory]; }
  getUpdateHistory() { return [...this.updateHistory]; }

  // ── Channel Management ────────────────────────────────────

  setChannel(channel: UpdateChannel): { success: boolean; error?: string } {
    const bundleManager = getPolicyBundleManager();
    const policy = bundleManager.getEffective();

    if (channel === "beta" && !policy.updates.allow_beta_channel) {
      return { success: false, error: "Beta channel is disabled by device policy" };
    }
    if (channel === "dev" && !policy.updates.allow_beta_channel) {
      return { success: false, error: "Dev channel is disabled by device policy" };
    }

    this.channel = channel;
    this.auditLog("update.channel.switch", `Channel changed to ${channel}`);
    return { success: true };
  }

  // ── Check for Updates ─────────────────────────────────────

  async checkForUpdates(): Promise<UpdateCatalogEntry[]> {
    this.setState("checking");
    this.progress = { ...this.idleProgress(), state: "checking", currentStep: "Checking for updates..." };

    // Simulate network check
    await this.delay(800);

    const available = this.catalog.filter(u =>
      u.channel === this.channel &&
      this.isVersionNewer(u.version, this.slots[this.activeSlot].version)
    );

    this.setState("idle");
    this.progress = this.idleProgress();
    this.auditLog("update.check", `Found ${available.length} updates on ${this.channel} channel`);
    return available;
  }

  // ── Preflight ─────────────────────────────────────────────

  runPreflight(update: UpdateCatalogEntry, context: Partial<EnhancedPolicyContext> = {}): UpdatePreflightResult {
    const bundleManager = getPolicyBundleManager();
    const policy = bundleManager.getEffective();
    const engine = getContextualDecisionEngine();

    const ctx: EnhancedPolicyContext = {
      actorId: "system",
      actorType: "system",
      action: "update.install",
      deviceMode: bundleManager.getCurrentMode(),
      sessionLocked: false,
      onBattery: true,
      batteryPercent: 85,
      charging: false,
      presentationActive: false,
      managedDevice: false,
      networkType: "wifi_secure",
      threatPosture: "normal",
      updateState: (["idle", "downloading", "staging", "validating"].includes(this.state) ? this.state : "idle") as "idle" | "downloading" | "staging" | "validating",
      vpnActive: false,
      guestSession: false,
      ...context,
    };

    const policyResult = engine.evaluateUpdatePreflight(ctx);
    const blockers = [...policyResult.blockers];
    const warnings = [...policyResult.warnings];

    // Version compatibility
    if (!this.isVersionNewer(update.version, this.slots[this.activeSlot].version)) {
      blockers.push({ code: "VERSION_NOT_NEWER", message: "Update version is not newer than current", severity: "warning" });
    }

    // Storage check (simulated)
    const freeStorage = 2 * 1024 * 1024 * 1024; // 2GB simulated
    if (update.sizeBytes > freeStorage * 0.8) {
      blockers.push({ code: "INSUFFICIENT_STORAGE", message: "Not enough free storage for update", severity: "high" });
    }

    // Channel check
    const channelAllowed = update.channel === "stable" || policy.updates.allow_beta_channel;

    if (!channelAllowed) {
      blockers.push({ code: "CHANNEL_BLOCKED", message: `${update.channel} channel not allowed by policy`, severity: "warning" });
    }

    return {
      eligible: blockers.length === 0,
      blockers,
      warnings,
      batteryOk: ctx.batteryPercent >= policy.updates.require_battery_percent_min || ctx.charging,
      storageOk: update.sizeBytes < freeStorage * 0.8,
      networkOk: ctx.networkType !== "none",
      policyApproved: policyResult.eligible,
      channelAllowed,
    };
  }

  // ── Download ──────────────────────────────────────────────

  async downloadUpdate(update: UpdateCatalogEntry): Promise<{ success: boolean; error?: string }> {
    if (this.state !== "idle") return { success: false, error: "Update daemon is busy" };

    this.currentUpdate = update;
    this.setState("downloading");
    const startBytes = this.downloadResumeState?.bytesDownloaded || 0;

    // Simulate download with progress
    const steps = 20;
    const bytesPerStep = (update.sizeBytes - startBytes) / steps;

    for (let i = 0; i <= steps; i++) {
      const downloaded = Math.min(startBytes + bytesPerStep * i, update.sizeBytes);
      this.progress = {
        state: "downloading",
        updateId: update.updateId,
        version: update.version,
        bytesTotal: update.sizeBytes,
        bytesDownloaded: downloaded,
        percentComplete: (downloaded / update.sizeBytes) * 100,
        currentStep: `Downloading ${update.version}...`,
        estimatedSecondsRemaining: Math.ceil((steps - i) * 0.15),
        canCancel: true,
      };
      await this.delay(150);
    }

    // Verify signature
    this.progress.currentStep = "Verifying signature...";
    await this.delay(400);

    const sigValid = this.verifySignature(update);
    if (!sigValid) {
      this.setState("failed");
      this.auditLog("update.download.signature_fail", `Signature verification failed for ${update.updateId}`, "critical");
      return { success: false, error: "Signature verification failed" };
    }

    this.downloadResumeState = null;
    this.auditLog("update.download.complete", `Downloaded and verified ${update.version}`);
    return { success: true };
  }

  // ── Stage ─────────────────────────────────────────────────

  async stageUpdate(): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUpdate) return { success: false, error: "No update downloaded" };

    this.setState("staging");
    const targetSlot = this.activeSlot === "A" ? "B" : "A";

    this.progress = {
      ...this.progress,
      state: "staging",
      currentStep: `Staging to Slot ${targetSlot}...`,
      percentComplete: 0,
      canCancel: false,
    };

    // Simulate staging
    for (let i = 0; i <= 10; i++) {
      this.progress.percentComplete = i * 10;
      this.progress.currentStep = i < 5 ? `Writing to Slot ${targetSlot}...` : `Verifying Slot ${targetSlot} integrity...`;
      await this.delay(200);
    }

    // Update target slot
    this.slots[targetSlot] = {
      slotId: targetSlot,
      status: "pending",
      version: this.currentUpdate.version,
      buildId: this.currentUpdate.buildId,
      bootCount: 0,
      lastBootAt: 0,
      integrityVerified: true,
      healthPassed: false,
      markedGood: false,
    };

    this.setState("awaiting_reboot");
    this.progress = {
      ...this.progress,
      state: "awaiting_reboot",
      currentStep: "Ready to reboot into new version",
      percentComplete: 100,
      canCancel: true,
    };

    this.auditLog("update.staged", `Staged ${this.currentUpdate.version} to Slot ${targetSlot}`);
    return { success: true };
  }

  // ── Reboot & Validate ─────────────────────────────────────

  async simulateRebootAndValidate(): Promise<{ success: boolean; rollback: boolean; reason?: string }> {
    const targetSlot = this.activeSlot === "A" ? "B" : "A";

    if (this.slots[targetSlot].status !== "pending") {
      return { success: false, rollback: false, reason: "No pending update in target slot" };
    }

    this.setState("validating");
    this.bootAttempts++;
    this.slots[targetSlot].bootCount++;
    this.slots[targetSlot].lastBootAt = Date.now();

    this.progress = {
      ...this.progress,
      state: "validating",
      currentStep: "Booting into new version...",
      percentComplete: 0,
      canCancel: false,
    };

    // Run health validation
    this.healthResults = [];
    const checks = [
      { component: "kernel", weight: 20 },
      { component: "root_filesystem", weight: 15 },
      { component: "policyd", weight: 15 },
      { component: "sessiond", weight: 10 },
      { component: "ui_shell", weight: 15 },
      { component: "networking", weight: 10 },
      { component: "shieldd", weight: 10 },
      { component: "powerd", weight: 5 },
    ];

    let totalWeight = 0;
    let passedWeight = 0;

    for (const check of checks) {
      this.progress.currentStep = `Validating ${check.component}...`;
      const startTime = Date.now();
      await this.delay(300);

      // Simulate: 95% chance of passing each check
      const passed = Math.random() > 0.05;

      const result: HealthValidationResult = {
        component: check.component,
        status: passed ? "pass" : "fail",
        details: passed ? `${check.component} started successfully` : `${check.component} failed health check`,
        checkedAt: Date.now(),
        durationMs: Date.now() - startTime,
      };

      this.healthResults.push(result);
      totalWeight += check.weight;
      if (passed) passedWeight += check.weight;

      this.progress.percentComplete = (totalWeight / 100) * 100;
    }

    const allPassed = this.healthResults.every(r => r.status === "pass");
    const bundleManager = getPolicyBundleManager();
    const policy = bundleManager.getEffective();

    if (allPassed) {
      // Mark success
      this.slots[targetSlot].status = "active";
      this.slots[targetSlot].healthPassed = true;
      this.slots[targetSlot].markedGood = true;
      this.slots[this.activeSlot].status = "inactive";
      this.activeSlot = targetSlot;
      this.bootAttempts = 0;

      this.setState("succeeded");
      this.progress = {
        ...this.progress,
        state: "succeeded",
        currentStep: "Update successful!",
        percentComplete: 100,
      };

      if (this.currentUpdate) {
        this.updateHistory.push({
          updateId: this.currentUpdate.updateId,
          fromVersion: this.slots[this.activeSlot === "A" ? "B" : "A"].version,
          toVersion: this.currentUpdate.version,
          action: "installed",
          timestamp: Date.now(),
        });
      }

      this.auditLog("update.boot.success", `Successfully booted ${this.slots[targetSlot].version}`);
      return { success: true, rollback: false };
    }

    // Health check failed — trigger rollback
    if (policy.updates.rollback_on_health_failure || this.bootAttempts >= this.MAX_BOOT_ATTEMPTS) {
      return this.triggerRollback(targetSlot, "health_failure",
        `Health validation failed: ${this.healthResults.filter(r => r.status === "fail").map(r => r.component).join(", ")}`);
    }

    this.setState("failed");
    return { success: false, rollback: false, reason: "Health validation failed but rollback not triggered" };
  }

  // ── Rollback ──────────────────────────────────────────────

  async triggerRollback(
    failedSlot: "A" | "B",
    triggerType: RollbackEvent["triggerType"],
    reason: string
  ): Promise<{ success: boolean; rollback: boolean; reason?: string }> {
    const rollbackTo = failedSlot === "A" ? "B" : "A";

    const event: RollbackEvent = {
      eventId: crypto.randomUUID(),
      updateId: this.currentUpdate?.updateId || "unknown",
      sourceSlot: failedSlot,
      rollbackToSlot: rollbackTo,
      triggerType,
      reasonCode: reason,
      detectedAt: Date.now(),
      healthResults: [...this.healthResults],
    };

    // Perform rollback
    this.slots[failedSlot].status = "failed";
    this.slots[failedSlot].healthPassed = false;
    this.slots[failedSlot].markedGood = false;
    this.slots[rollbackTo].status = "active";
    this.activeSlot = rollbackTo;

    event.completedAt = Date.now();
    this.rollbackHistory.push(event);
    this.bootAttempts = 0;

    this.setState("rolled_back");
    this.progress = {
      ...this.progress,
      state: "rolled_back",
      currentStep: `Rolled back to ${this.slots[rollbackTo].version}`,
      percentComplete: 100,
      canCancel: false,
    };

    if (this.currentUpdate) {
      this.updateHistory.push({
        updateId: this.currentUpdate.updateId,
        fromVersion: this.currentUpdate.version,
        toVersion: this.slots[rollbackTo].version,
        action: "rolled_back",
        timestamp: Date.now(),
        reason,
      });
    }

    this.auditLog("update.rollback", `Rolled back to Slot ${rollbackTo} (${this.slots[rollbackTo].version}): ${reason}`, "high");
    return { success: true, rollback: true, reason };
  }

  manualRollback(): Promise<{ success: boolean; rollback: boolean; reason?: string }> {
    const inactiveSlot = this.activeSlot === "A" ? "B" : "A";
    if (!this.slots[inactiveSlot].markedGood) {
      return Promise.resolve({ success: false, rollback: false, reason: "Inactive slot not marked as good" });
    }
    return this.triggerRollback(this.activeSlot, "manual", "User-requested rollback");
  }

  // ── Cancel ────────────────────────────────────────────────

  cancelUpdate(): boolean {
    if (this.state === "downloading") {
      this.downloadResumeState = { bytesDownloaded: this.progress.bytesDownloaded, totalBytes: this.progress.bytesTotal };
      this.setState("idle");
      this.progress = this.idleProgress();
      this.auditLog("update.cancelled", "Update download cancelled by user");
      return true;
    }
    if (this.state === "awaiting_reboot") {
      const targetSlot = this.activeSlot === "A" ? "B" : "A";
      this.slots[targetSlot].status = "inactive";
      this.setState("idle");
      this.progress = this.idleProgress();
      this.auditLog("update.cancelled", "Staged update cancelled by user");
      return true;
    }
    return false;
  }

  resetState(): void {
    this.setState("idle");
    this.currentUpdate = null;
    this.progress = this.idleProgress();
    this.healthResults = [];
  }

  // ── Helpers ───────────────────────────────────────────────

  private setState(state: UpdateState): void {
    this.state = state;
  }

  private idleProgress(): UpdateProgress {
    return { state: "idle", bytesTotal: 0, bytesDownloaded: 0, percentComplete: 0, currentStep: "System is up to date", estimatedSecondsRemaining: 0, canCancel: false };
  }

  private verifySignature(update: UpdateCatalogEntry): boolean {
    // Stub: In production, verify Ed25519 signature against trusted keyring
    return !!update.signatureRef && update.signatureRef.startsWith("ed25519-");
  }

  private isVersionNewer(candidate: string, current: string): boolean {
    const parse = (v: string) => v.replace(/-.*$/, "").split(".").map(Number);
    const a = parse(candidate);
    const b = parse(current);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if ((a[i] || 0) > (b[i] || 0)) return true;
      if ((a[i] || 0) < (b[i] || 0)) return false;
    }
    return false;
  }

  private async auditLog(action: string, reason: string, severity: "info" | "warning" | "high" | "critical" = "info"): Promise<void> {
    try {
      const auditd = getAuditDaemon();
      await auditd.record({ actorUserId: "system", actorSessionId: "updated", actorService: "updated", action, decision: "allowed", severity, reason });
    } catch { /* audit daemon may not be ready */ }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      state: this.state,
      activeSlot: this.activeSlot,
      channel: this.channel,
      catalogSize: this.catalog.length,
      bootAttempts: this.bootAttempts,
      rollbackCount: this.rollbackHistory.length,
      updateCount: this.updateHistory.length,
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _updated: UpdateDaemon | null = null;
export function getUpdateDaemon(): UpdateDaemon {
  if (!_updated) _updated = new UpdateDaemon();
  return _updated;
}
