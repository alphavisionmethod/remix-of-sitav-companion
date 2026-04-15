// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Enrollment & Recovery Engine
// Bootstrap, trust confirmation, key sync, account recovery
// ═══════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────

export type EnrollmentStep =
  | "sign-in" | "device-naming" | "trust-confirmation"
  | "key-bootstrap" | "selective-sync-setup" | "restore-choice"
  | "initial-hydration" | "completed" | "failed";

export interface EnrollmentFlow {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  currentStep: EnrollmentStep;
  completedSteps: EnrollmentStep[];
  startedAt: string;
  completedAt?: string;
  trustedByDeviceId?: string;
  syncProfile: SyncProfile;
  restoreChoice: RestoreChoice;
  errors: Array<{ step: EnrollmentStep; error: string; at: string }>;
}

export interface SyncProfile {
  namespacesToSync: string[];
  offlineEnabled: boolean;
  nearbyEnabled: boolean;
  predictiveEnabled: boolean;
  encryptionVerified: boolean;
  quotaAcknowledged: boolean;
}

export interface RestoreChoice {
  type: "full-restore" | "selective-restore" | "fresh-start";
  restoreSettings: boolean;
  restorePinnedFiles: boolean;
  restoreAppState: boolean;
  restoreSessionMetadata: boolean;
  sourceDeviceId?: string;
}

export interface RecoveryRequest {
  id: string;
  userId: string;
  type: "lost-device" | "account-recovery" | "e2ee-key-recovery" | "trust-reset" | "session-revocation";
  status: "pending" | "awaiting-approval" | "approved" | "completed" | "denied" | "expired";
  requestedAt: string;
  completedAt?: string;
  approvedByDeviceId?: string;
  recoveryMethod: "trusted-device" | "recovery-key" | "email-verification" | "admin-override";
  affectedDeviceIds: string[];
  metadata: Record<string, unknown>;
}

export interface RecoveryKey {
  id: string;
  userId: string;
  keyHash: string;
  createdAt: string;
  usedAt?: string;
  isValid: boolean;
  type: "e2ee-recovery" | "account-recovery" | "device-unlock";
}

export interface DeviceRevocation {
  deviceId: string;
  revokedAt: string;
  revokedBy: string;
  reason: "lost" | "stolen" | "compromised" | "decommissioned" | "user-request";
  keysInvalidated: boolean;
  sessionsRevoked: boolean;
  dataWiped: boolean;
  notificationsSent: boolean;
}

export interface HydrationPlan {
  deviceId: string;
  phases: HydrationPhase[];
  totalSizeBytes: number;
  estimatedDurationMs: number;
  currentPhase: number;
  status: "planning" | "hydrating" | "completed" | "paused" | "failed";
}

export interface HydrationPhase {
  order: number;
  label: string;
  namespaces: string[];
  priority: "critical" | "high" | "normal" | "low";
  sizeBytes: number;
  status: "pending" | "active" | "completed" | "skipped";
}

// ─── Device Enrollment Engine ─────────────────────────────────

class DeviceEnrollmentEngine {
  private flows = new Map<string, EnrollmentFlow>();
  private recoveryRequests = new Map<string, RecoveryRequest>();
  private recoveryKeys = new Map<string, RecoveryKey>();
  private revocations = new Map<string, DeviceRevocation>();
  private hydrationPlans = new Map<string, HydrationPlan>();

  // ─── Enrollment Flow ───────────────────────────────

  startEnrollment(userId: string, deviceId: string, deviceName: string, platform: string): EnrollmentFlow {
    const flow: EnrollmentFlow = {
      id: `ef_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId, deviceId, deviceName, platform,
      currentStep: "sign-in",
      completedSteps: [],
      startedAt: new Date().toISOString(),
      syncProfile: {
        namespacesToSync: ["files.documents", "settings.all", "session.desktop"],
        offlineEnabled: true,
        nearbyEnabled: false,
        predictiveEnabled: true,
        encryptionVerified: false,
        quotaAcknowledged: false,
      },
      restoreChoice: {
        type: "fresh-start",
        restoreSettings: true,
        restorePinnedFiles: true,
        restoreAppState: false,
        restoreSessionMetadata: false,
      },
      errors: [],
    };
    this.flows.set(flow.id, flow);
    return flow;
  }

  advanceStep(flowId: string): EnrollmentStep | null {
    const flow = this.flows.get(flowId);
    if (!flow) return null;

    const steps: EnrollmentStep[] = [
      "sign-in", "device-naming", "trust-confirmation",
      "key-bootstrap", "selective-sync-setup", "restore-choice",
      "initial-hydration", "completed",
    ];

    flow.completedSteps.push(flow.currentStep);
    const nextIdx = steps.indexOf(flow.currentStep) + 1;
    if (nextIdx >= steps.length) {
      flow.currentStep = "completed";
      flow.completedAt = new Date().toISOString();
    } else {
      flow.currentStep = steps[nextIdx];
    }
    return flow.currentStep;
  }

  failStep(flowId: string, error: string): void {
    const flow = this.flows.get(flowId);
    if (flow) {
      flow.errors.push({ step: flow.currentStep, error, at: new Date().toISOString() });
      flow.currentStep = "failed";
    }
  }

  updateSyncProfile(flowId: string, profile: Partial<SyncProfile>): void {
    const flow = this.flows.get(flowId);
    if (flow) flow.syncProfile = { ...flow.syncProfile, ...profile };
  }

  updateRestoreChoice(flowId: string, choice: Partial<RestoreChoice>): void {
    const flow = this.flows.get(flowId);
    if (flow) flow.restoreChoice = { ...flow.restoreChoice, ...choice };
  }

  confirmTrust(flowId: string, trustedByDeviceId: string): void {
    const flow = this.flows.get(flowId);
    if (flow) flow.trustedByDeviceId = trustedByDeviceId;
  }

  getFlow(flowId: string): EnrollmentFlow | null {
    return this.flows.get(flowId) ?? null;
  }

  getActiveFlows(): EnrollmentFlow[] {
    return Array.from(this.flows.values()).filter(f => f.currentStep !== "completed" && f.currentStep !== "failed");
  }

  // ─── Recovery ──────────────────────────────────────

  requestRecovery(userId: string, type: RecoveryRequest["type"], method: RecoveryRequest["recoveryMethod"], affectedDeviceIds: string[]): RecoveryRequest {
    const req: RecoveryRequest = {
      id: `rr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId, type,
      status: method === "trusted-device" ? "awaiting-approval" : "pending",
      requestedAt: new Date().toISOString(),
      recoveryMethod: method,
      affectedDeviceIds,
      metadata: {},
    };
    this.recoveryRequests.set(req.id, req);
    return req;
  }

  approveRecovery(requestId: string, approverDeviceId: string): boolean {
    const req = this.recoveryRequests.get(requestId);
    if (!req || req.status !== "awaiting-approval") return false;
    req.status = "approved";
    req.approvedByDeviceId = approverDeviceId;
    return true;
  }

  completeRecovery(requestId: string): boolean {
    const req = this.recoveryRequests.get(requestId);
    if (!req || (req.status !== "approved" && req.status !== "pending")) return false;
    req.status = "completed";
    req.completedAt = new Date().toISOString();
    return true;
  }

  denyRecovery(requestId: string): void {
    const req = this.recoveryRequests.get(requestId);
    if (req) req.status = "denied";
  }

  getRecoveryRequests(userId?: string): RecoveryRequest[] {
    let results = Array.from(this.recoveryRequests.values());
    if (userId) results = results.filter(r => r.userId === userId);
    return results;
  }

  // ─── Recovery Keys ─────────────────────────────────

  generateRecoveryKey(userId: string, type: RecoveryKey["type"]): RecoveryKey {
    const key: RecoveryKey = {
      id: `rk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId, type,
      keyHash: `rkh_${Math.random().toString(36).slice(2, 18)}${Math.random().toString(36).slice(2, 18)}`,
      createdAt: new Date().toISOString(),
      isValid: true,
    };
    this.recoveryKeys.set(key.id, key);
    return key;
  }

  validateRecoveryKey(keyId: string, keyHash: string): boolean {
    const key = this.recoveryKeys.get(keyId);
    if (!key || !key.isValid || key.keyHash !== keyHash) return false;
    key.usedAt = new Date().toISOString();
    key.isValid = false; // one-time use
    return true;
  }

  getUserRecoveryKeys(userId: string): RecoveryKey[] {
    return Array.from(this.recoveryKeys.values()).filter(k => k.userId === userId && k.isValid);
  }

  // ─── Device Revocation ─────────────────────────────

  revokeDevice(deviceId: string, revokedBy: string, reason: DeviceRevocation["reason"]): DeviceRevocation {
    const revocation: DeviceRevocation = {
      deviceId, revokedBy, reason,
      revokedAt: new Date().toISOString(),
      keysInvalidated: true,
      sessionsRevoked: true,
      dataWiped: reason === "stolen" || reason === "compromised",
      notificationsSent: true,
    };
    this.revocations.set(deviceId, revocation);
    return revocation;
  }

  isDeviceRevoked(deviceId: string): boolean {
    return this.revocations.has(deviceId);
  }

  getRevocations(): DeviceRevocation[] {
    return Array.from(this.revocations.values());
  }

  // ─── Hydration Plans ───────────────────────────────

  createHydrationPlan(deviceId: string, namespaces: string[]): HydrationPlan {
    const phases: HydrationPhase[] = [
      { order: 0, label: "Settings & Preferences", namespaces: namespaces.filter(n => n.startsWith("settings")), priority: "critical", sizeBytes: 51200, status: "pending" },
      { order: 1, label: "Session & Continuity", namespaces: namespaces.filter(n => n.startsWith("session")), priority: "critical", sizeBytes: 204800, status: "pending" },
      { order: 2, label: "Pinned Files", namespaces: ["files.pinned"], priority: "high", sizeBytes: 5242880, status: "pending" },
      { order: 3, label: "Recent Documents", namespaces: namespaces.filter(n => n.startsWith("files.documents")), priority: "high", sizeBytes: 52428800, status: "pending" },
      { order: 4, label: "Photos & Media", namespaces: namespaces.filter(n => n.startsWith("files.photos") || n.startsWith("files.videos")), priority: "normal", sizeBytes: 524288000, status: "pending" },
      { order: 5, label: "App State", namespaces: namespaces.filter(n => n.startsWith("app.")), priority: "low", sizeBytes: 1048576, status: "pending" },
    ].filter(p => p.namespaces.length > 0);

    const plan: HydrationPlan = {
      deviceId,
      phases,
      totalSizeBytes: phases.reduce((s, p) => s + p.sizeBytes, 0),
      estimatedDurationMs: phases.reduce((s, p) => s + p.sizeBytes / 1048576 * 1000, 0),
      currentPhase: 0,
      status: "planning",
    };
    this.hydrationPlans.set(deviceId, plan);
    return plan;
  }

  advanceHydration(deviceId: string): boolean {
    const plan = this.hydrationPlans.get(deviceId);
    if (!plan || plan.status === "completed") return false;

    if (plan.currentPhase < plan.phases.length) {
      plan.phases[plan.currentPhase].status = "completed";
      plan.currentPhase++;
    }

    if (plan.currentPhase >= plan.phases.length) {
      plan.status = "completed";
    } else {
      plan.phases[plan.currentPhase].status = "active";
      plan.status = "hydrating";
    }
    return true;
  }

  getHydrationPlan(deviceId: string): HydrationPlan | null {
    return this.hydrationPlans.get(deviceId) ?? null;
  }

  // ─── Stats ─────────────────────────────────────────

  getStats() {
    return {
      activeEnrollments: this.getActiveFlows().length,
      completedEnrollments: Array.from(this.flows.values()).filter(f => f.currentStep === "completed").length,
      pendingRecoveries: Array.from(this.recoveryRequests.values()).filter(r => r.status === "pending" || r.status === "awaiting-approval").length,
      revokedDevices: this.revocations.size,
      activeRecoveryKeys: Array.from(this.recoveryKeys.values()).filter(k => k.isValid).length,
      activeHydrations: Array.from(this.hydrationPlans.values()).filter(p => p.status === "hydrating").length,
    };
  }
}

export const deviceEnrollment = new DeviceEnrollmentEngine();
