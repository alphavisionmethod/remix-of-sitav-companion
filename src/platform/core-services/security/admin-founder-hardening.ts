// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin & Founder Plane Hardening
// Short-lived sessions, two-person approval, blast-radius preview,
// environment restrictions, MFA step-up, no hidden bypass
// Covers: Master Prompt Section 30
// ═══════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────

export type AdminRiskTier = "low" | "medium" | "high" | "critical" | "catastrophic";
export type SessionPlane = "admin" | "founder" | "operator";
export type ApprovalRequirement = "none" | "single" | "dual" | "quorum";

export interface AdminSessionPolicy {
  plane: SessionPlane;
  maxTTLMs: number;
  idleTimeoutMs: number;
  requiresMFA: boolean;
  requiresDeviceTrust: boolean;
  ipAllowlist: string[];
  maxConcurrentSessions: number;
}

export interface AdminSession {
  id: string;
  userId: string;
  plane: SessionPlane;
  createdAt: string;
  expiresAt: string;
  lastActivityAt: string;
  mfaVerified: boolean;
  deviceTrusted: boolean;
  ipAddress: string;
  actionsPerformed: number;
  expired: boolean;
}

export interface TwoPersonApprovalRequest {
  id: string;
  actionKey: string;
  riskTier: AdminRiskTier;
  requesterId: string;
  requesterName: string;
  approverId: string | null;
  approverName: string | null;
  status: "pending" | "approved" | "rejected" | "expired";
  justification: string;
  blastRadiusPreview: BlastRadiusPreview | null;
  createdAt: string;
  decidedAt: string | null;
  expiresAt: string;
}

export interface BlastRadiusPreview {
  affectedUsers: number;
  affectedServices: string[];
  affectedData: string[];
  reversible: boolean;
  estimatedDowntimeMs: number;
  riskScore: number; // 0–100
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  warnings: string[];
}

export interface ActionRiskClassification {
  actionKey: string;
  displayName: string;
  riskTier: AdminRiskTier;
  approvalRequirement: ApprovalRequirement;
  requiresMFA: boolean;
  requiresBlastRadiusReview: boolean;
  requiresJustification: boolean;
  cooldownMs: number;
  maxFrequencyPerHour: number;
}

export interface AdminHardeningEvent {
  id: string;
  timestamp: string;
  type: "session-created" | "session-expired" | "mfa-step-up" | "dual-approval-requested" | "dual-approval-decided" | "blast-radius-computed" | "bypass-attempt-blocked" | "ip-restricted" | "action-classified";
  plane: SessionPlane;
  userId: string;
  severity: "info" | "warn" | "error" | "critical";
  description: string;
  context: Record<string, unknown>;
}

// ── Engine ────────────────────────────────────────────────────

export class AdminFounderHardening {
  private sessionPolicies: Map<SessionPlane, AdminSessionPolicy>;
  private sessions = new Map<string, AdminSession>();
  private approvalRequests = new Map<string, TwoPersonApprovalRequest>();
  private riskClassifications = new Map<string, ActionRiskClassification>();
  private events: AdminHardeningEvent[] = [];
  private listeners: Array<(event: AdminHardeningEvent) => void> = [];
  private readonly maxEvents = 500;

  constructor() {
    this.sessionPolicies = new Map([
      ["admin", { plane: "admin" as SessionPlane, maxTTLMs: 3600000, idleTimeoutMs: 900000, requiresMFA: true, requiresDeviceTrust: true, ipAllowlist: [], maxConcurrentSessions: 2 }],
      ["founder", { plane: "founder" as SessionPlane, maxTTLMs: 1800000, idleTimeoutMs: 600000, requiresMFA: true, requiresDeviceTrust: true, ipAllowlist: [], maxConcurrentSessions: 1 }],
      ["operator", { plane: "operator" as SessionPlane, maxTTLMs: 7200000, idleTimeoutMs: 1800000, requiresMFA: true, requiresDeviceTrust: false, ipAllowlist: [], maxConcurrentSessions: 3 }],
    ]);

    this.registerDefaultClassifications();
  }

  private registerDefaultClassifications(): void {
    const defaults: ActionRiskClassification[] = [
      { actionKey: "policy.update", displayName: "Update Security Policy", riskTier: "critical", approvalRequirement: "dual", requiresMFA: true, requiresBlastRadiusReview: true, requiresJustification: true, cooldownMs: 300000, maxFrequencyPerHour: 3 },
      { actionKey: "key.rotate", displayName: "Rotate Encryption Keys", riskTier: "catastrophic", approvalRequirement: "dual", requiresMFA: true, requiresBlastRadiusReview: true, requiresJustification: true, cooldownMs: 600000, maxFrequencyPerHour: 1 },
      { actionKey: "data.delete-bulk", displayName: "Bulk Data Deletion", riskTier: "catastrophic", approvalRequirement: "dual", requiresMFA: true, requiresBlastRadiusReview: true, requiresJustification: true, cooldownMs: 900000, maxFrequencyPerHour: 1 },
      { actionKey: "user.revoke-all", displayName: "Revoke All User Sessions", riskTier: "critical", approvalRequirement: "dual", requiresMFA: true, requiresBlastRadiusReview: true, requiresJustification: true, cooldownMs: 300000, maxFrequencyPerHour: 2 },
      { actionKey: "service.restart", displayName: "Restart Service", riskTier: "high", approvalRequirement: "single", requiresMFA: true, requiresBlastRadiusReview: true, requiresJustification: true, cooldownMs: 120000, maxFrequencyPerHour: 5 },
      { actionKey: "flag.rollout", displayName: "Feature Flag Rollout", riskTier: "medium", approvalRequirement: "single", requiresMFA: false, requiresBlastRadiusReview: false, requiresJustification: true, cooldownMs: 60000, maxFrequencyPerHour: 10 },
      { actionKey: "config.update", displayName: "Update Configuration", riskTier: "medium", approvalRequirement: "single", requiresMFA: false, requiresBlastRadiusReview: false, requiresJustification: true, cooldownMs: 30000, maxFrequencyPerHour: 20 },
      { actionKey: "audit.export", displayName: "Export Audit Logs", riskTier: "low", approvalRequirement: "none", requiresMFA: false, requiresBlastRadiusReview: false, requiresJustification: false, cooldownMs: 0, maxFrequencyPerHour: 50 },
      { actionKey: "trust.downgrade", displayName: "Downgrade Trust Level", riskTier: "critical", approvalRequirement: "dual", requiresMFA: true, requiresBlastRadiusReview: true, requiresJustification: true, cooldownMs: 300000, maxFrequencyPerHour: 3 },
      { actionKey: "device.revoke", displayName: "Revoke Device Trust", riskTier: "high", approvalRequirement: "single", requiresMFA: true, requiresBlastRadiusReview: false, requiresJustification: true, cooldownMs: 60000, maxFrequencyPerHour: 10 },
    ];

    for (const c of defaults) this.riskClassifications.set(c.actionKey, c);
  }

  // ── Session Management ────────────────────────────────────

  createSession(userId: string, plane: SessionPlane, ipAddress: string, mfaVerified: boolean, deviceTrusted: boolean): { session: AdminSession | null; blocked: boolean; reason?: string } {
    const policy = this.sessionPolicies.get(plane)!;

    // IP allowlist check
    if (policy.ipAllowlist.length > 0 && !policy.ipAllowlist.includes(ipAddress)) {
      this.emit("ip-restricted", plane, userId, "error", `IP ${ipAddress} not in allowlist for ${plane}`, { ipAddress });
      return { session: null, blocked: true, reason: "IP address not in allowlist" };
    }

    // MFA check
    if (policy.requiresMFA && !mfaVerified) {
      this.emit("mfa-step-up", plane, userId, "warn", `MFA required for ${plane} session`, {});
      return { session: null, blocked: true, reason: "MFA verification required" };
    }

    // Device trust check
    if (policy.requiresDeviceTrust && !deviceTrusted) {
      return { session: null, blocked: true, reason: "Trusted device required" };
    }

    // Concurrent session limit
    const activeSessions = Array.from(this.sessions.values()).filter((s) => s.userId === userId && s.plane === plane && !s.expired);
    if (activeSessions.length >= policy.maxConcurrentSessions) {
      // Expire oldest
      activeSessions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      activeSessions[0].expired = true;
    }

    const session: AdminSession = {
      id: `as-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId, plane, createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + policy.maxTTLMs).toISOString(),
      lastActivityAt: new Date().toISOString(),
      mfaVerified, deviceTrusted, ipAddress, actionsPerformed: 0, expired: false,
    };

    this.sessions.set(session.id, session);
    this.emit("session-created", plane, userId, "info", `${plane} session created`, { sessionId: session.id, ttlMs: policy.maxTTLMs });
    return { session, blocked: false };
  }

  validateSession(sessionId: string): { valid: boolean; reason?: string } {
    const session = this.sessions.get(sessionId);
    if (!session) return { valid: false, reason: "Session not found" };
    if (session.expired) return { valid: false, reason: "Session expired" };
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      session.expired = true;
      this.emit("session-expired", session.plane, session.userId, "info", "Session TTL expired", { sessionId });
      return { valid: false, reason: "Session TTL expired" };
    }
    const policy = this.sessionPolicies.get(session.plane)!;
    if (Date.now() - new Date(session.lastActivityAt).getTime() > policy.idleTimeoutMs) {
      session.expired = true;
      this.emit("session-expired", session.plane, session.userId, "info", "Session idle timeout", { sessionId });
      return { valid: false, reason: "Idle timeout" };
    }
    session.lastActivityAt = new Date().toISOString();
    return { valid: true };
  }

  // ── Action Classification ─────────────────────────────────

  classifyAction(actionKey: string): ActionRiskClassification | null {
    return this.riskClassifications.get(actionKey) ?? null;
  }

  getAllClassifications(): ActionRiskClassification[] {
    return Array.from(this.riskClassifications.values());
  }

  // ── Two-Person Approval ───────────────────────────────────

  requestDualApproval(actionKey: string, requesterId: string, requesterName: string, justification: string): TwoPersonApprovalRequest | null {
    const classification = this.riskClassifications.get(actionKey);
    if (!classification || classification.approvalRequirement !== "dual") return null;

    const blastRadius = classification.requiresBlastRadiusReview ? this.computeBlastRadius(actionKey) : null;

    const request: TwoPersonApprovalRequest = {
      id: `da-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actionKey, riskTier: classification.riskTier, requesterId, requesterName,
      approverId: null, approverName: null, status: "pending",
      justification, blastRadiusPreview: blastRadius,
      createdAt: new Date().toISOString(), decidedAt: null,
      expiresAt: new Date(Date.now() + 1800000).toISOString(), // 30 min
    };

    this.approvalRequests.set(request.id, request);
    this.emit("dual-approval-requested", "admin", requesterId, "warn", `Dual approval requested: ${classification.displayName}`, { actionKey, requestId: request.id });
    return request;
  }

  decideDualApproval(requestId: string, approverId: string, approverName: string, approved: boolean): boolean {
    const request = this.approvalRequests.get(requestId);
    if (!request || request.status !== "pending") return false;

    // Approver must not be requester (no self-approval)
    if (request.requesterId === approverId) {
      this.emit("bypass-attempt-blocked", "admin", approverId, "critical", "Self-approval attempt blocked", { requestId });
      return false;
    }

    request.approverId = approverId;
    request.approverName = approverName;
    request.status = approved ? "approved" : "rejected";
    request.decidedAt = new Date().toISOString();

    this.emit("dual-approval-decided", "admin", approverId, approved ? "info" : "warn", `Dual approval ${request.status}: ${request.actionKey}`, { requestId, approved });
    return true;
  }

  getPendingApprovals(): TwoPersonApprovalRequest[] {
    return Array.from(this.approvalRequests.values()).filter((r) => r.status === "pending");
  }

  // ── Blast Radius Preview ──────────────────────────────────

  computeBlastRadius(actionKey: string): BlastRadiusPreview {
    // Simulated blast radius computation
    const riskMap: Record<string, Partial<BlastRadiusPreview>> = {
      "policy.update": { affectedUsers: 1000, affectedServices: ["auth", "approval", "ai-gateway"], reversible: true, estimatedDowntimeMs: 0, riskScore: 65 },
      "key.rotate": { affectedUsers: 5000, affectedServices: ["auth", "storage", "sync", "ai-gateway"], reversible: false, estimatedDowntimeMs: 30000, riskScore: 90 },
      "data.delete-bulk": { affectedUsers: 500, affectedServices: ["storage", "sync"], reversible: false, estimatedDowntimeMs: 0, riskScore: 95 },
      "user.revoke-all": { affectedUsers: 5000, affectedServices: ["auth", "notification"], reversible: true, estimatedDowntimeMs: 0, riskScore: 75 },
      "trust.downgrade": { affectedUsers: 100, affectedServices: ["auth", "approval"], reversible: true, estimatedDowntimeMs: 0, riskScore: 70 },
    };

    const specific = riskMap[actionKey] ?? {};
    const warnings: string[] = [];
    const riskScore = (specific.riskScore as number) ?? 50;
    if (riskScore > 80) warnings.push("⚠️ This action has a very high blast radius");
    if (!(specific.reversible ?? true)) warnings.push("⚠️ This action is NOT reversible");
    if ((specific.estimatedDowntimeMs ?? 0) > 0) warnings.push(`⚠️ Estimated downtime: ${((specific.estimatedDowntimeMs as number) / 1000).toFixed(0)}s`);

    return {
      affectedUsers: (specific.affectedUsers as number) ?? 0,
      affectedServices: (specific.affectedServices as string[]) ?? [],
      affectedData: [actionKey],
      reversible: (specific.reversible as boolean) ?? true,
      estimatedDowntimeMs: (specific.estimatedDowntimeMs as number) ?? 0,
      riskScore,
      beforeState: { action: actionKey, status: "current" },
      afterState: { action: actionKey, status: "applied" },
      warnings,
    };
  }

  // ── Bypass Detection ──────────────────────────────────────

  detectBypassAttempt(userId: string, action: string, context: Record<string, unknown>): boolean {
    const suspiciousPatterns = ["super-admin", "bypass", "override-all", "skip-approval", "god-mode"];
    const isSuspicious = suspiciousPatterns.some((p) => action.toLowerCase().includes(p) || JSON.stringify(context).toLowerCase().includes(p));
    if (isSuspicious) {
      this.emit("bypass-attempt-blocked", "admin", userId, "critical", `Hidden bypass attempt detected: ${action}`, { action, context });
    }
    return isSuspicious;
  }

  // ── Events ────────────────────────────────────────────────

  private emit(type: AdminHardeningEvent["type"], plane: SessionPlane, userId: string, severity: AdminHardeningEvent["severity"], description: string, context: Record<string, unknown>): void {
    const event: AdminHardeningEvent = { id: `ah-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString(), type, plane, userId, severity, description, context };
    this.events.push(event);
    if (this.events.length > this.maxEvents) this.events = this.events.slice(-this.maxEvents);
    for (const l of this.listeners) { try { l(event); } catch { /* swallow */ } }
  }

  getEvents(limit = 50): AdminHardeningEvent[] { return this.events.slice(-limit); }

  onEvent(listener: (event: AdminHardeningEvent) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  // ── Metrics ───────────────────────────────────────────────

  getMetrics() {
    const sessions = Array.from(this.sessions.values());
    const approvals = Array.from(this.approvalRequests.values());
    return {
      activeSessions: sessions.filter((s) => !s.expired).length,
      expiredSessions: sessions.filter((s) => s.expired).length,
      pendingApprovals: approvals.filter((a) => a.status === "pending").length,
      approvedActions: approvals.filter((a) => a.status === "approved").length,
      rejectedActions: approvals.filter((a) => a.status === "rejected").length,
      bypassAttempts: this.events.filter((e) => e.type === "bypass-attempt-blocked").length,
      totalClassifications: this.riskClassifications.size,
      totalEvents: this.events.length,
    };
  }
}

// ── Factory ───────────────────────────────────────────────────

export function createAdminFounderHardening(): AdminFounderHardening {
  return new AdminFounderHardening();
}
