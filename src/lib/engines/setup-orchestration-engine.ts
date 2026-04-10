// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Orchestration Engine
// DAG-based phase orchestration with state machine, background
// tasks, branching, rollback, persistence, and recovery
// ═══════════════════════════════════════════════════════════════

import type {
  SetupPhaseId, SetupPhaseStatus, SetupPhaseDefinition,
  SetupSession, SetupSessionSnapshot, SetupBackgroundTask,
  SetupBranchCondition, SetupBranchPath, SetupRollbackPoint,
  SetupPhaseState, HardwareCapabilities, PhaseTimeoutConfig,
} from "@/packages/contracts/specialized/setup-orchestration";
import { VALID_PHASE_TRANSITIONS, RESOLVED_STATUSES } from "@/packages/contracts/specialized/setup-orchestration";
import { PHASE_DEFINITION_MAP, SETUP_PHASE_DEFINITIONS, BACKGROUND_TASK_FACTORIES } from "./setup-phase-definitions";

// ── Types ───────────────────────────────────────────────────

export type PhaseTransitionListener = (phaseId: SetupPhaseId, from: SetupPhaseStatus, to: SetupPhaseStatus) => void;
export type SessionChangeListener = (session: SetupSession) => void;

interface BranchEvaluator {
  (session: SetupSession): boolean;
}

const STORAGE_KEY = "sita-setup-session";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

// ── Engine ──────────────────────────────────────────────────

export class SetupOrchestrationEngine {
  private session: SetupSession;
  private definitions: Map<SetupPhaseId, SetupPhaseDefinition>;
  private branchEvaluators: Map<string, BranchEvaluator> = new Map();
  private transitionListeners: Set<PhaseTransitionListener> = new Set();
  private sessionListeners: Set<SessionChangeListener> = new Set();
  private timeoutHandles: Map<SetupPhaseId, ReturnType<typeof setTimeout>> = new Map();
  private warningHandles: Map<SetupPhaseId, ReturnType<typeof setTimeout>> = new Map();

  constructor(userId: string, deviceId: string) {
    this.definitions = new Map(SETUP_PHASE_DEFINITIONS.map(d => [d.id, d]));
    this.session = this.createFreshSession(userId, deviceId);
    this.registerDefaultBranchEvaluators();
  }

  // ── Initialization ──────────────────────────────────────

  private createFreshSession(userId: string, deviceId: string): SetupSession {
    const phaseStates: Record<string, SetupPhaseState> = {};
    for (const def of SETUP_PHASE_DEFINITIONS) {
      phaseStates[def.id] = {
        phaseId: def.id,
        status: "idle",
        enteredAt: 0,
        retryCount: 0,
      };
    }

    return {
      id: crypto.randomUUID?.() ?? `setup-${Date.now()}`,
      userId,
      deviceId,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      currentPhaseId: "boot",
      phaseStates,
      completedPhases: [],
      skippedPhases: [],
      rollbackStack: [],
      branchPath: "personal",
      hardwareCapabilities: this.detectHardwareCapabilities(),
      interrupted: false,
      resumable: true,
      completionPct: 0,
      backgroundTasks: [],
    };
  }

  private detectHardwareCapabilities(): HardwareCapabilities {
    if (typeof navigator === "undefined") {
      return { hasCamera: false, hasBiometric: false, hasGeolocation: false, screenSize: "large", connectionType: "fast", storageAvailable: true, notificationsSupported: false, performanceTier: "high" };
    }
    const w = window.innerWidth;
    const cores = navigator.hardwareConcurrency ?? 4;
    const memoryGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
    const performanceTier: "low" | "medium" | "high" =
      (cores <= 2 || memoryGb <= 2 || w < 768) ? "low" :
      (cores <= 4 || memoryGb <= 4) ? "medium" : "high";
    return {
      hasCamera: !!(navigator.mediaDevices?.getUserMedia),
      hasBiometric: !!(window as unknown as Record<string, unknown>).PublicKeyCredential,
      hasGeolocation: !!navigator.geolocation,
      screenSize: w < 768 ? "small" : w < 1200 ? "medium" : "large",
      connectionType: navigator.onLine ? "fast" : "offline",
      storageAvailable: (() => { try { localStorage.setItem("__test", "1"); localStorage.removeItem("__test"); return true; } catch { return false; } })(),
      notificationsSupported: "Notification" in window,
      performanceTier,
    };
  }

  private registerDefaultBranchEvaluators(): void {
    // Role-based
    this.branchEvaluators.set("role:family-office,personal", (s) => {
      const role = this.getSessionData<string>("role");
      return role === "family-office" || role === "personal";
    });

    // Setup style based — register all combos used in phase definitions
    for (const combo of ["style:express,guided,advanced", "style:guided,advanced", "style:advanced"]) {
      const styles = combo.replace("style:", "").split(",");
      this.branchEvaluators.set(combo, () => {
        const style = this.getSessionData<string>("setupStyle") ?? "guided";
        return styles.includes(style);
      });
    }

    // Domain-based evaluators — check enabledDomains OR quickIdentity signals
    const domainEvaluator = (domainKeys: string[]) => () => {
      const domains = this.getSessionData<string[]>("enabledDomains") ?? [];
      const painPoints = this.getSessionData<string[]>("painPoints") ?? [];
      const focusAreas = this.getSessionData<string[]>("focusAreas") ?? [];
      return domainKeys.some(k =>
        domains.includes(k) || painPoints.includes(k) || focusAreas.includes(k)
      );
    };

    this.branchEvaluators.set("domain:household", domainEvaluator(["household", "family", "home", "shared-living"]));
    this.branchEvaluators.set("domain:work", domainEvaluator(["business", "work", "clients", "team", "leads", "ops"]));
    this.branchEvaluators.set("domain:money", domainEvaluator(["money", "bills", "spending", "approvals", "budget"]));
    this.branchEvaluators.set("domain:communications", domainEvaluator(["communications", "messages", "replies", "follow-up", "email"]));

    // Tone branching — overwhelmed indicator
    this.branchEvaluators.set("tone:overwhelmed", () => {
      const stressAreas = this.getSessionData<string[]>("stressAreas") ?? [];
      const operatingContext = this.getSessionData<string>("operatingContext") ?? "";
      return stressAreas.length >= 4 || operatingContext === "regaining-control" || operatingContext === "overwhelmed";
    });

    // Custom: restore-path checks accountPath
    this.branchEvaluators.set("custom:restore-path", () => {
      const accountPath = this.getSessionData<string>("accountPath") ?? "";
      return accountPath === "restore" || accountPath === "restore-lookup";
    });

    // Custom: enterprise is manual override
    this.branchEvaluators.set("user-chose-enterprise", () => false);
  }

  // ── Session Data (external state from OSSetupExperience) ──

  private externalData: Record<string, any> = {};

  setSessionData(key: string, value: any): void {
    this.externalData[key] = value;
    this.recalculateActivePath();
    this.notifySessionChange();
  }

  getSessionData<T = any>(key: string): T | undefined {
    return this.externalData[key] as T | undefined;
  }

  // ── Dependency Graph ──────────────────────────────────────

  /** Check if all dependencies for a phase are resolved */
  canEnterPhase(phaseId: SetupPhaseId): boolean {
    const def = this.definitions.get(phaseId);
    if (!def) return false;

    // Check dependencies
    for (const depId of def.dependencies) {
      const depState = this.session.phaseStates[depId];
      if (!depState || !RESOLVED_STATUSES.includes(depState.status)) {
        return false;
      }
    }

    // Check branch conditions
    if (!this.evaluateBranchConditions(def)) return false;

    // Check hardware requirements
    for (const hw of def.requiredHardware) {
      const cap = this.session.hardwareCapabilities;
      if (hw === "camera" && !cap.hasCamera) return false;
      if (hw === "biometric" && !cap.hasBiometric) return false;
      if (hw === "geolocation" && !cap.hasGeolocation) return false;
    }

    return true;
  }

  /** Get all phases whose dependencies are met and that aren't completed */
  getNextAvailablePhases(): SetupPhaseId[] {
    return this.getActivePhaseIds().filter(id => {
      const state = this.session.phaseStates[id];
      return state && state.status === "idle" && this.canEnterPhase(id);
    });
  }

  /** Topologically sorted active phases */
  getActivePhaseIds(): SetupPhaseId[] {
    const active = SETUP_PHASE_DEFINITIONS
      .filter(def => this.evaluateBranchConditions(def))
      .sort((a, b) => a.order - b.order);
    return active.map(d => d.id);
  }

  /** Get steppable phases (for progress rail) */
  getSteppablePhases(): SetupPhaseId[] {
    return this.getActivePhaseIds().filter(id => {
      const def = this.definitions.get(id);
      return def && !def.excludedFromSteps;
    });
  }

  /** Check if arrival-prep can start (all non-terminal phases done) */
  private canStartArrivalPrep(): boolean {
    const active = this.getActivePhaseIds().filter(id => id !== "arrival-prep" && id !== "system-check" && id !== "trust-certificate");
    return active.every(id => {
      const state = this.session.phaseStates[id];
      return state && RESOLVED_STATUSES.includes(state.status);
    });
  }

  // ── Branch Evaluation ─────────────────────────────────────

  private evaluateBranchConditions(def: SetupPhaseDefinition): boolean {
    if (def.branchConditions.length === 0) return true;

    // Group conditions: same orGroup → OR'd; different groups → AND'd
    const groups = new Map<string, SetupBranchCondition[]>();
    let ungroupedIdx = 0;
    for (const cond of def.branchConditions) {
      const key = cond.orGroup ?? `__ungrouped_${ungroupedIdx++}`;
      const arr = groups.get(key) ?? [];
      arr.push(cond);
      groups.set(key, arr);
    }

    // Every group must have at least one passing condition (AND of ORs)
    for (const [, conditions] of groups) {
      const groupPasses = conditions.some(cond => {
        const evaluator = this.branchEvaluators.get(cond.evaluatorKey);
        if (!evaluator) return true;
        const result = evaluator(this.session);
        return cond.includeWhen ? result : !result;
      });
      if (!groupPasses) return false;
    }
    return true;
  }

  registerBranchEvaluator(key: string, evaluator: BranchEvaluator): void {
    this.branchEvaluators.set(key, evaluator);
  }

  // ── Phase State Machine ───────────────────────────────────

  transitionPhaseStatus(phaseId: SetupPhaseId, newStatus: SetupPhaseStatus): boolean {
    const state = this.session.phaseStates[phaseId];
    if (!state) return false;

    const allowed = VALID_PHASE_TRANSITIONS[state.status];
    if (!allowed.includes(newStatus)) {
      console.warn(`[SetupOrchestration] Invalid transition: ${phaseId} ${state.status} → ${newStatus}`);
      return false;
    }

    const oldStatus = state.status;
    state.status = newStatus;
    state.enteredAt = Date.now();

    if (RESOLVED_STATUSES.includes(newStatus)) {
      state.exitedAt = Date.now();
    }

    // Track completed/skipped
    if (newStatus === "completed" && !this.session.completedPhases.includes(phaseId)) {
      this.session.completedPhases.push(phaseId);
    }
    if (newStatus === "skipped" && !this.session.skippedPhases.includes(phaseId)) {
      this.session.skippedPhases.push(phaseId);
    }

    // Handle timeouts
    this.clearPhaseTimeout(phaseId);
    if (newStatus === "active" || newStatus === "preparing") {
      this.startPhaseTimeout(phaseId);
    }

    // Save rollback point on completion
    if (newStatus === "completed") {
      this.pushRollbackPoint(phaseId);
    }

    // Recalculate progress
    this.recalculateProgress();

    // Notify listeners
    for (const listener of this.transitionListeners) {
      listener(phaseId, oldStatus, newStatus);
    }

    this.session.updatedAt = Date.now();
    this.notifySessionChange();

    return true;
  }

  getPhaseStatus(phaseId: SetupPhaseId): SetupPhaseStatus {
    return this.session.phaseStates[phaseId]?.status ?? "idle";
  }

  getPhaseState(phaseId: SetupPhaseId): SetupPhaseState | undefined {
    return this.session.phaseStates[phaseId];
  }

  // ── Phase Navigation ──────────────────────────────────────

  getCurrentPhase(): SetupPhaseId {
    return this.session.currentPhaseId;
  }

  setCurrentPhase(phaseId: SetupPhaseId): void {
    this.session.currentPhaseId = phaseId;
    const state = this.session.phaseStates[phaseId];
    if (state && state.status === "idle") {
      this.transitionPhaseStatus(phaseId, "preparing");
      // Auto-transition from preparing to active for user-interactive phases
      const def = this.definitions.get(phaseId);
      if (def && def.backgroundTaskIds.length === 0) {
        this.transitionPhaseStatus(phaseId, "active");
      }
    }
    this.notifySessionChange();
  }

  /** Complete current phase and advance to next */
  completeCurrentAndAdvance(): SetupPhaseId | null {
    const current = this.session.currentPhaseId;
    const status = this.getPhaseStatus(current);

    // Force-activate if still in a non-resolved, non-active state
    if (!RESOLVED_STATUSES.includes(status) && status !== "active" && status !== "validating" && status !== "success") {
      // blocked/degraded/warning need resumed first
      if (status === "blocked" || status === "degraded" || status === "warning") {
        this.transitionPhaseStatus(current, "resumed");
      }
      // idle needs preparing first
      if (this.getPhaseStatus(current) === "idle") {
        this.transitionPhaseStatus(current, "preparing");
      }
      // preparing/resumed → active
      this.transitionPhaseStatus(current, "active");
    }

    // Transition through validation → success → completed
    if (this.getPhaseStatus(current) === "active") {
      this.transitionPhaseStatus(current, "validating");
    }
    if (this.getPhaseStatus(current) === "validating") {
      this.transitionPhaseStatus(current, "success");
    }
    if (this.getPhaseStatus(current) === "success") {
      this.transitionPhaseStatus(current, "completed");
    }

    return this.advanceToNextPhase();
  }

  /** Skip current phase */
  skipCurrentPhase(): SetupPhaseId | null {
    const current = this.session.currentPhaseId;
    const def = this.definitions.get(current);
    if (def?.required) return null; // Can't skip required phases

    this.transitionPhaseStatus(current, "skipped");
    // Mark as completed for dependency resolution
    this.transitionPhaseStatus(current, "completed");
    return this.advanceToNextPhase();
  }

  private advanceToNextPhase(): SetupPhaseId | null {
    const active = this.getActivePhaseIds();
    const currentIdx = active.indexOf(this.session.currentPhaseId);

    // Find next unresolved phase
    for (let i = currentIdx + 1; i < active.length; i++) {
      const id = active[i];
      const state = this.session.phaseStates[id];
      if (state && !RESOLVED_STATUSES.includes(state.status) && this.canEnterPhase(id)) {
        // Special handling for arrival-prep
        if (id === "arrival-prep" && !this.canStartArrivalPrep()) continue;
        this.setCurrentPhase(id);
        return id;
      }
    }

    return null; // No more phases
  }

  /** Navigate backward — navigates to ANY previous phase (including excluded-from-steps) */
  goToPreviousPhase(): SetupPhaseId | null {
    const active = this.getActivePhaseIds();
    const currentIdx = active.indexOf(this.session.currentPhaseId);

    if (currentIdx > 0) {
      const id = active[currentIdx - 1];
      this.session.currentPhaseId = id;
      // Reset status so user can interact again
      const state = this.session.phaseStates[id];
      if (state && (state.status === "completed" || state.status === "success")) {
        state.status = "active";
      }
      this.notifySessionChange();
      return id;
    }
    return null;
  }

  // ── Timeout Handling ──────────────────────────────────────

  private startPhaseTimeout(phaseId: SetupPhaseId): void {
    const def = this.definitions.get(phaseId);
    if (!def) return;
    const { timeoutMs, autoRetry, maxRetries, backoffBaseMs, backoffCap } = def.timeout;

    // Warning at 80%
    const warningHandle = setTimeout(() => {
      const state = this.session.phaseStates[phaseId];
      if (state && state.status === "active") {
        this.transitionPhaseStatus(phaseId, "warning");
      }
    }, timeoutMs * 0.8);
    this.warningHandles.set(phaseId, warningHandle);

    // Timeout
    const handle = setTimeout(() => {
      const state = this.session.phaseStates[phaseId];
      if (!state || RESOLVED_STATUSES.includes(state.status)) return;

      if (autoRetry && state.retryCount < maxRetries) {
        state.retryCount++;
        const backoff = Math.min(backoffBaseMs * Math.pow(2, state.retryCount - 1), backoffCap);
        setTimeout(() => {
          this.transitionPhaseStatus(phaseId, "resumed");
          this.transitionPhaseStatus(phaseId, "preparing");
        }, backoff);
      } else {
        this.transitionPhaseStatus(phaseId, "blocked");
        state.lastError = `Phase timed out after ${timeoutMs}ms (${state.retryCount} retries)`;
      }
    }, timeoutMs);
    this.timeoutHandles.set(phaseId, handle);
  }

  private clearPhaseTimeout(phaseId: SetupPhaseId): void {
    const handle = this.timeoutHandles.get(phaseId);
    if (handle) { clearTimeout(handle); this.timeoutHandles.delete(phaseId); }
    const warning = this.warningHandles.get(phaseId);
    if (warning) { clearTimeout(warning); this.warningHandles.delete(phaseId); }
  }

  // ── Background Tasks ─────────────────────────────────────

  async runBackgroundTasks(phaseId: SetupPhaseId): Promise<boolean> {
    const def = this.definitions.get(phaseId);
    if (!def || def.backgroundTaskIds.length === 0) return true;

    const tasks: SetupBackgroundTask[] = def.backgroundTaskIds.map(taskId => {
      const factory = BACKGROUND_TASK_FACTORIES[taskId];
      return {
        id: taskId,
        phaseId,
        label: factory?.label ?? taskId,
        status: "pending" as const,
        progress: 0,
        blocking: factory?.blocking ?? true,
      };
    });

    // Add to session
    this.session.backgroundTasks = [
      ...this.session.backgroundTasks.filter(t => t.phaseId !== phaseId),
      ...tasks,
    ];
    this.notifySessionChange();

    // Run all in parallel
    const results = await Promise.allSettled(
      tasks.map(async (task) => {
        const factory = BACKGROUND_TASK_FACTORIES[task.id];
        if (!factory) {
          task.status = "completed";
          task.progress = 100;
          return;
        }

        task.status = "running";
        this.notifySessionChange();

        try {
          await factory.execute((pct) => {
            task.progress = pct;
            this.notifySessionChange();
          });
          task.status = "completed";
          task.progress = 100;
        } catch (err) {
          task.status = "failed";
          task.error = err instanceof Error ? err.message : "Unknown error";
          throw err;
        }
        this.notifySessionChange();
      })
    );

    const blockingFailed = results.some((r, i) => r.status === "rejected" && tasks[i].blocking);
    if (blockingFailed) {
      this.transitionPhaseStatus(phaseId, "degraded");
      return false;
    }

    // Transition to active after background tasks complete
    const currentStatus = this.getPhaseStatus(phaseId);
    if (currentStatus === "preparing") {
      this.transitionPhaseStatus(phaseId, "active");
    }

    return true;
  }

  getBackgroundTasks(phaseId?: SetupPhaseId): SetupBackgroundTask[] {
    if (phaseId) return this.session.backgroundTasks.filter(t => t.phaseId === phaseId);
    return this.session.backgroundTasks;
  }

  // ── Rollback ──────────────────────────────────────────────

  private pushRollbackPoint(phaseId: SetupPhaseId): void {
    const snapshot: Record<string, SetupPhaseState> = {};
    for (const [key, val] of Object.entries(this.session.phaseStates)) {
      snapshot[key] = { ...val, timeoutHandle: undefined };
    }
    this.session.rollbackStack.push({
      phaseId,
      timestamp: Date.now(),
      phaseStates: snapshot,
    });
  }

  rollbackTo(targetPhaseId: SetupPhaseId): boolean {
    const targetIdx = this.session.rollbackStack.findIndex(rp => rp.phaseId === targetPhaseId);
    if (targetIdx === -1) return false;

    const rollbackPoint = this.session.rollbackStack[targetIdx];
    // Remove all points after the target
    this.session.rollbackStack = this.session.rollbackStack.slice(0, targetIdx);

    // Reset downstream phases to idle
    const active = this.getActivePhaseIds();
    const targetOrder = this.definitions.get(targetPhaseId)?.order ?? 0;
    for (const id of active) {
      const def = this.definitions.get(id);
      if (def && def.order > targetOrder) {
        this.clearPhaseTimeout(id);
        this.session.phaseStates[id] = {
          phaseId: id,
          status: "idle",
          enteredAt: 0,
          retryCount: 0,
        };
        this.session.completedPhases = this.session.completedPhases.filter(p => p !== id);
        this.session.skippedPhases = this.session.skippedPhases.filter(p => p !== id);
      }
    }

    this.session.currentPhaseId = targetPhaseId;
    this.recalculateProgress();
    this.notifySessionChange();
    return true;
  }

  retryPhase(phaseId: SetupPhaseId): boolean {
    const state = this.session.phaseStates[phaseId];
    if (!state) return false;
    if (!["blocked", "degraded", "warning"].includes(state.status)) return false;

    this.transitionPhaseStatus(phaseId, "resumed");
    this.transitionPhaseStatus(phaseId, "preparing");
    return true;
  }

  // ── Session Persistence ───────────────────────────────────

  toSnapshot(): SetupSessionSnapshot {
    const phaseStates: Record<string, Omit<SetupPhaseState, "timeoutHandle">> = {};
    for (const [key, val] of Object.entries(this.session.phaseStates)) {
      const { timeoutHandle, ...rest } = val;
      phaseStates[key] = rest;
    }

    return {
      id: this.session.id,
      userId: this.session.userId,
      deviceId: this.session.deviceId,
      startedAt: this.session.startedAt,
      updatedAt: Date.now(),
      currentPhaseId: this.session.currentPhaseId,
      phaseStates,
      completedPhases: [...this.session.completedPhases],
      skippedPhases: [...this.session.skippedPhases],
      rollbackStack: [...this.session.rollbackStack],
      branchPath: this.session.branchPath,
      hardwareCapabilities: this.session.hardwareCapabilities,
      interrupted: this.session.interrupted,
      interruptionReason: this.session.interruptionReason,
      completionPct: this.session.completionPct,
    };
  }

  persistToLocalStorage(): void {
    try {
      const snapshot = this.toSnapshot();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch { /* storage full or unavailable */ }
  }

  static loadFromLocalStorage(): SetupSessionSnapshot | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const snapshot = JSON.parse(raw) as SetupSessionSnapshot;
      if (Date.now() - snapshot.startedAt > SESSION_EXPIRY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return snapshot;
    } catch { return null; }
  }

  restoreFromSnapshot(snapshot: SetupSessionSnapshot): void {
    this.session.id = snapshot.id;
    this.session.userId = snapshot.userId;
    this.session.deviceId = snapshot.deviceId;
    this.session.startedAt = snapshot.startedAt;
    this.session.updatedAt = snapshot.updatedAt;
    this.session.currentPhaseId = snapshot.currentPhaseId;
    this.session.completedPhases = [...snapshot.completedPhases];
    this.session.skippedPhases = [...snapshot.skippedPhases];
    this.session.rollbackStack = [...snapshot.rollbackStack];
    this.session.branchPath = snapshot.branchPath;
    this.session.hardwareCapabilities = snapshot.hardwareCapabilities;
    this.session.completionPct = snapshot.completionPct;
    this.session.interrupted = false; // we're resuming

    // Restore phase states
    for (const [key, val] of Object.entries(snapshot.phaseStates)) {
      this.session.phaseStates[key] = { ...val } as SetupPhaseState;
    }

    this.notifySessionChange();
  }

  static clearLocalStorage(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  markInterrupted(reason: "reload" | "network-loss" | "timeout" | "unknown"): void {
    this.session.interrupted = true;
    this.session.interruptionReason = reason;
    this.persistToLocalStorage();
  }

  // ── Branching ─────────────────────────────────────────────

  setBranchPath(path: SetupBranchPath): void {
    this.session.branchPath = path;
    this.recalculateActivePath();
    this.notifySessionChange();
  }

  getBranchPath(): SetupBranchPath {
    return this.session.branchPath;
  }

  // ── Progress ──────────────────────────────────────────────

  private recalculateProgress(): void {
    const active = this.getActivePhaseIds();
    if (active.length === 0) { this.session.completionPct = 0; return; }
    const resolved = active.filter(id => {
      const state = this.session.phaseStates[id];
      return state && RESOLVED_STATUSES.includes(state.status);
    });
    this.session.completionPct = Math.round((resolved.length / active.length) * 100);
  }

  private recalculateActivePath(): void {
    // Re-evaluate which phases are active based on current branch conditions
    this.recalculateProgress();
  }

  getCompletionPct(): number {
    return this.session.completionPct;
  }

  // ── Listeners ─────────────────────────────────────────────

  onPhaseTransition(listener: PhaseTransitionListener): () => void {
    this.transitionListeners.add(listener);
    return () => { this.transitionListeners.delete(listener); };
  }

  onSessionChange(listener: SessionChangeListener): () => void {
    this.sessionListeners.add(listener);
    return () => { this.sessionListeners.delete(listener); };
  }

  private notifySessionChange(): void {
    for (const listener of this.sessionListeners) {
      listener(this.session);
    }
  }

  // ── Accessors ─────────────────────────────────────────────

  getSession(): SetupSession {
    return this.session;
  }

  /** Compute global setup state based on phase progress */
  getGlobalSetupState(): string {
    const current = this.session.currentPhaseId;
    const allActive = this.getActivePhaseIds();
    const resolvedCount = allActive.filter(id => {
      const s = this.session.phaseStates[id];
      return s && RESOLVED_STATUSES.includes(s.status);
    }).length;

    if (this.session.interrupted) return "resumed_from_restart";
    if (current === "boot") return "boot_preparing";
    if (["secure-foundation", "language-region", "network-setup", "device-readiness"].includes(current)) return "machine_foundation_in_progress";
    if (current === "desktop-transition" || current === "arrival-prep") return "setup_ready_for_arrival";
    if (resolvedCount === allActive.length) {
      const hasDeferred = this.getSessionData<string[]>("deferredItems")?.length ?? 0;
      return hasDeferred > 0 ? "completed_with_deferred_items" : "completed";
    }
    return "user_setup_in_progress";
  }

  getPhaseDefinition(phaseId: SetupPhaseId): SetupPhaseDefinition | undefined {
    return this.definitions.get(phaseId);
  }

  isPhaseRequired(phaseId: SetupPhaseId): boolean {
    return this.definitions.get(phaseId)?.required ?? false;
  }

  /** Cleanup all timers */
  destroy(): void {
    for (const [, handle] of this.timeoutHandles) clearTimeout(handle);
    for (const [, handle] of this.warningHandles) clearTimeout(handle);
    this.timeoutHandles.clear();
    this.warningHandles.clear();
    this.transitionListeners.clear();
    this.sessionListeners.clear();
  }
}

// ── Factory ─────────────────────────────────────────────────

export function createSetupOrchestrationEngine(userId: string, deviceId: string): SetupOrchestrationEngine {
  return new SetupOrchestrationEngine(userId, deviceId);
}

