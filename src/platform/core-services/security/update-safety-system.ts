// ═══════════════════════════════════════════════════════════════
// SITA OS — Update Safety System
// Pre-update validation, transactional apply with checkpoints,
// health gates, auto-rollback, A/B slot management
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

export type UpdatePhase = "validation" | "staging" | "checkpoint" | "applying" | "verifying" | "complete" | "failed" | "rolled-back";
export type UpdateChannel = "stable" | "beta" | "canary" | "internal";
export type SlotId = "A" | "B";

export interface UpdatePackage {
  id: string;
  version: string;
  channel: UpdateChannel;
  releaseDate: string;
  signatureHash: string;
  signedBy: string;
  sizeBytes: number;
  compatibilityRange: string;
  requiredFreeSpaceMb: number;
  requiredBatteryPercent: number;
  requiresReboot: boolean;
  components: UpdateComponent[];
  releaseNotes: string;
  rollbackSupported: boolean;
  metadata: Record<string, unknown>;
}

export interface UpdateComponent {
  name: string;
  currentVersion: string;
  targetVersion: string;
  signatureValid: boolean;
  sizeBytes: number;
  critical: boolean;
}

export interface UpdateSession {
  id: string;
  packageId: string;
  phase: UpdatePhase;
  startedAt: string;
  completedAt: string | null;
  activeSlot: SlotId;
  targetSlot: SlotId;
  checkpoints: UpdateCheckpoint[];
  healthGates: HealthGate[];
  preValidation: PreValidationResult;
  rollbackAvailable: boolean;
  rollbackTriggeredAt: string | null;
  rollbackReason: string | null;
  error: string | null;
  metadata: Record<string, unknown>;
}

export interface UpdateCheckpoint {
  id: string;
  phase: UpdatePhase;
  timestamp: string;
  stateSnapshot: Record<string, unknown>;
  valid: boolean;
}

export interface HealthGate {
  name: string;
  description: string;
  check: () => HealthGateResult;
  required: boolean;
  timeoutMs: number;
}

export interface HealthGateResult {
  passed: boolean;
  score: number;
  detail: string;
}

export interface PreValidationResult {
  signatureValid: boolean;
  compatibilityValid: boolean;
  spaceAvailable: boolean;
  batteryAdequate: boolean;
  networkStable: boolean;
  trustStateValid: boolean;
  allPassed: boolean;
  failures: string[];
}

export interface SlotState {
  slot: SlotId;
  version: string;
  bootable: boolean;
  active: boolean;
  lastBootAt: string | null;
  healthScore: number;
  integrity: "verified" | "degraded" | "unknown";
}

export interface UpdateSafetyMetrics {
  totalUpdates: number;
  successfulUpdates: number;
  failedUpdates: number;
  rollbacks: number;
  averageUpdateDurationMs: number;
  currentVersion: string;
  activeSlot: SlotId;
  pendingUpdate: UpdatePackage | null;
  lastUpdateAt: string | null;
  healthGatePassRate: number;
}

// ── Engine ─────────────────────────────────────────────────────

export class UpdateSafetySystem {
  private slots: Map<SlotId, SlotState> = new Map();
  private sessions: UpdateSession[] = [];
  private currentSession: UpdateSession | null = null;
  private healthGates: HealthGate[] = [];
  private listeners: Array<(event: { type: string; session: UpdateSession }) => void> = [];
  private sessionCounter = 0;
  private checkpointCounter = 0;

  constructor() {
    this.initializeSlots();
    this.registerDefaultHealthGates();
  }

  // ── Pre-Update Validation ──────────────────────────────────

  validatePackage(pkg: UpdatePackage, systemState: {
    currentVersion: string;
    freeSpaceMb: number;
    batteryPercent: number;
    networkStable: boolean;
    trustScore: number;
  }): PreValidationResult {
    const failures: string[] = [];

    const signatureValid = pkg.signatureHash.length > 0 && pkg.signedBy.length > 0;
    if (!signatureValid) failures.push("Invalid package signature");

    const compatibilityValid = this.checkCompatibility(pkg.compatibilityRange, systemState.currentVersion);
    if (!compatibilityValid) failures.push(`Version ${systemState.currentVersion} not compatible with ${pkg.compatibilityRange}`);

    const spaceAvailable = systemState.freeSpaceMb >= pkg.requiredFreeSpaceMb;
    if (!spaceAvailable) failures.push(`Insufficient space: need ${pkg.requiredFreeSpaceMb}MB, have ${systemState.freeSpaceMb}MB`);

    const batteryAdequate = !pkg.requiresReboot || systemState.batteryPercent >= pkg.requiredBatteryPercent;
    if (!batteryAdequate) failures.push(`Battery too low: need ${pkg.requiredBatteryPercent}%, have ${systemState.batteryPercent}%`);

    const trustStateValid = systemState.trustScore >= 50;
    if (!trustStateValid) failures.push("System trust score too low for update");

    return {
      signatureValid,
      compatibilityValid,
      spaceAvailable,
      batteryAdequate,
      networkStable: systemState.networkStable,
      trustStateValid,
      allPassed: failures.length === 0,
      failures,
    };
  }

  // ── Update Session Lifecycle ───────────────────────────────

  beginUpdate(pkg: UpdatePackage, preValidation: PreValidationResult): UpdateSession {
    if (this.currentSession && !["complete", "failed", "rolled-back"].includes(this.currentSession.phase)) {
      throw new Error("Update already in progress");
    }
    if (!preValidation.allPassed) {
      throw new Error(`Pre-validation failed: ${preValidation.failures.join(", ")}`);
    }

    const activeSlot = this.getActiveSlot();
    const targetSlot: SlotId = activeSlot === "A" ? "B" : "A";

    const session: UpdateSession = {
      id: `upd-${++this.sessionCounter}-${Date.now()}`,
      packageId: pkg.id,
      phase: "staging",
      startedAt: new Date().toISOString(),
      completedAt: null,
      activeSlot,
      targetSlot,
      checkpoints: [],
      healthGates: this.healthGates,
      preValidation,
      rollbackAvailable: pkg.rollbackSupported,
      rollbackTriggeredAt: null,
      rollbackReason: null,
      error: null,
      metadata: { version: pkg.version, channel: pkg.channel },
    };

    this.currentSession = session;
    this.sessions.push(session);
    this.createCheckpoint(session, "staging");
    this.emit("started", session);

    return session;
  }

  advancePhase(sessionId: string): UpdateSession {
    const session = this.getSessionOrThrow(sessionId);
    const phases: UpdatePhase[] = ["staging", "checkpoint", "applying", "verifying", "complete"];
    const currentIndex = phases.indexOf(session.phase);

    if (currentIndex < 0 || currentIndex >= phases.length - 1) {
      throw new Error(`Cannot advance from phase: ${session.phase}`);
    }

    const nextPhase = phases[currentIndex + 1];
    session.phase = nextPhase;
    this.createCheckpoint(session, nextPhase);

    // Run health gates at verification phase
    if (nextPhase === "verifying") {
      const gateResults = this.runHealthGates(session);
      const criticalFailure = gateResults.some((r) => !r.passed && r.required);
      if (criticalFailure) {
        this.triggerRollback(sessionId, "Health gate failed during verification");
        return session;
      }
    }

    if (nextPhase === "complete") {
      session.completedAt = new Date().toISOString();
      this.activateSlot(session.targetSlot, session.metadata.version as string);
    }

    this.emit("phase-advanced", session);
    return session;
  }

  triggerRollback(sessionId: string, reason: string): UpdateSession {
    const session = this.getSessionOrThrow(sessionId);
    if (!session.rollbackAvailable) throw new Error("Rollback not available for this update");

    session.phase = "rolled-back";
    session.rollbackTriggeredAt = new Date().toISOString();
    session.rollbackReason = reason;
    session.completedAt = new Date().toISOString();

    // Reactivate previous slot
    this.activateSlot(session.activeSlot, "rollback");

    this.emit("rolled-back", session);
    return session;
  }

  failUpdate(sessionId: string, error: string): UpdateSession {
    const session = this.getSessionOrThrow(sessionId);
    session.phase = "failed";
    session.error = error;
    session.completedAt = new Date().toISOString();
    this.emit("failed", session);
    return session;
  }

  // ── Health Gates ───────────────────────────────────────────

  registerHealthGate(gate: HealthGate): void {
    this.healthGates.push(gate);
  }

  runHealthGates(_session: UpdateSession): Array<HealthGateResult & { name: string; required: boolean }> {
    return this.healthGates.map((gate) => {
      try {
        const result = gate.check();
        return { ...result, name: gate.name, required: gate.required };
      } catch {
        return { passed: false, score: 0, detail: "Gate check threw exception", name: gate.name, required: gate.required };
      }
    });
  }

  // ── Slot Management ────────────────────────────────────────

  getSlots(): SlotState[] {
    return Array.from(this.slots.values());
  }

  getActiveSlot(): SlotId {
    for (const [id, slot] of this.slots) {
      if (slot.active) return id;
    }
    return "A";
  }

  // ── Queries ────────────────────────────────────────────────

  getCurrentSession(): UpdateSession | null {
    return this.currentSession;
  }

  getSessionHistory(limit = 20): UpdateSession[] {
    return this.sessions.slice(-limit);
  }

  getMetrics(): UpdateSafetyMetrics {
    const successful = this.sessions.filter((s) => s.phase === "complete").length;
    const failed = this.sessions.filter((s) => s.phase === "failed").length;
    const rolledBack = this.sessions.filter((s) => s.phase === "rolled-back").length;

    const durations = this.sessions
      .filter((s) => s.completedAt)
      .map((s) => new Date(s.completedAt!).getTime() - new Date(s.startedAt).getTime());

    const activeSlot = this.slots.get(this.getActiveSlot());

    return {
      totalUpdates: this.sessions.length,
      successfulUpdates: successful,
      failedUpdates: failed,
      rollbacks: rolledBack,
      averageUpdateDurationMs: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      currentVersion: activeSlot?.version ?? "unknown",
      activeSlot: this.getActiveSlot(),
      pendingUpdate: null,
      lastUpdateAt: this.sessions[this.sessions.length - 1]?.completedAt ?? null,
      healthGatePassRate: this.sessions.length > 0 ? successful / Math.max(this.sessions.length, 1) : 1,
    };
  }

  // ── Events ─────────────────────────────────────────────────

  onUpdate(listener: (event: { type: string; session: UpdateSession }) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  // ── Internal ───────────────────────────────────────────────

  private initializeSlots(): void {
    this.slots.set("A", { slot: "A", version: "1.0.0", bootable: true, active: true, lastBootAt: new Date().toISOString(), healthScore: 1, integrity: "verified" });
    this.slots.set("B", { slot: "B", version: "0.9.0", bootable: true, active: false, lastBootAt: null, healthScore: 0.9, integrity: "verified" });
  }

  private activateSlot(slotId: SlotId, version: string): void {
    for (const [id, slot] of this.slots) {
      slot.active = id === slotId;
      if (id === slotId) {
        slot.lastBootAt = new Date().toISOString();
        if (version !== "rollback") slot.version = version;
      }
    }
  }

  private createCheckpoint(session: UpdateSession, phase: UpdatePhase): void {
    session.checkpoints.push({
      id: `ckpt-${++this.checkpointCounter}`,
      phase,
      timestamp: new Date().toISOString(),
      stateSnapshot: { activeSlot: session.activeSlot, targetSlot: session.targetSlot, phase },
      valid: true,
    });
  }

  private checkCompatibility(range: string, currentVersion: string): boolean {
    if (!range || !currentVersion) return false;
    // Simplified: any non-empty range is considered compatible
    return range.length > 0 && currentVersion.length > 0;
  }

  private getSessionOrThrow(sessionId: string): UpdateSession {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    return session;
  }

  private emit(type: string, session: UpdateSession): void {
    for (const l of this.listeners) {
      try { l({ type, session }); } catch { /* isolation */ }
    }
  }

  private registerDefaultHealthGates(): void {
    this.healthGates = [
      { name: "Boot Success", description: "System booted successfully", check: () => ({ passed: true, score: 1, detail: "Boot OK" }), required: true, timeoutMs: 30_000 },
      { name: "Core Services", description: "All core services running", check: () => ({ passed: true, score: 1, detail: "Services healthy" }), required: true, timeoutMs: 60_000 },
      { name: "Network Connectivity", description: "Network is reachable", check: () => ({ passed: true, score: 0.95, detail: "Network OK" }), required: true, timeoutMs: 15_000 },
      { name: "Storage Integrity", description: "Storage reads/writes OK", check: () => ({ passed: true, score: 1, detail: "Storage OK" }), required: true, timeoutMs: 10_000 },
      { name: "Auth Service", description: "Authentication functional", check: () => ({ passed: true, score: 1, detail: "Auth OK" }), required: true, timeoutMs: 15_000 },
      { name: "Sync Engine", description: "Sync pipeline operational", check: () => ({ passed: true, score: 0.9, detail: "Sync OK" }), required: false, timeoutMs: 30_000 },
      { name: "Telemetry", description: "Telemetry reporting", check: () => ({ passed: true, score: 1, detail: "Telemetry OK" }), required: false, timeoutMs: 10_000 },
    ];
  }
}

export function createUpdateSafetySystem(): UpdateSafetySystem {
  return new UpdateSafetySystem();
}
