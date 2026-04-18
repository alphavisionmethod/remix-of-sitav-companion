// ═══════════════════════════════════════════════════════════════
// SITA OS — Elevation Engine
// PolicyKit-style elevation flow with signed approval tokens,
// rate limiting, replay protection, audit integration
// ═══════════════════════════════════════════════════════════════

import {
  type ElevationRequest, type ElevationApprovalToken, type OSAuthMethod,
  type IPCResult, type AuditSeverity,
  ACTION_AUTHORIZATION_TABLE, ELEVATION_TOKEN_TTL_MS,
} from "./types";
import { getAuthDaemon } from "./authd";
import { getAuditDaemon } from "./auditd";
import { getSessionDaemon } from "./sessiond";

// ── Elevation Queue ─────────────────────────────────────────

interface PendingElevation {
  request: ElevationRequest;
  resolve: (result: ElevationResult) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface ElevationResult {
  approved: boolean;
  token?: ElevationApprovalToken;
  error?: string;
}

export class ElevationEngine {
  private pendingQueue: Map<string, PendingElevation> = new Map();
  private recentRequests: Map<string, number[]> = new Map(); // userId -> timestamps
  private rateLimit = { maxPerMinute: 5, windowMs: 60000 };

  // ── Request Elevation ───────────────────────────────────

  async requestElevation(
    sessionId: string,
    action: string,
    requesterApp?: string
  ): Promise<ElevationRequest | null> {
    const sessiond = getSessionDaemon();
    const session = sessiond.getSession(sessionId);
    if (!session) return null;

    // Rate limit check
    if (!this.checkRateLimit(session.userId)) {
      return null;
    }

    const policy = ACTION_AUTHORIZATION_TABLE.find(p => p.action === action);
    const riskLevel = policy?.auditSeverity === "critical" ? "critical"
      : policy?.auditSeverity === "high" ? "high"
      : "medium";

    const request: ElevationRequest = {
      requestId: crypto.randomUUID(),
      sessionId,
      userId: session.userId,
      action,
      targetService: action.split(".")[0] + "d",
      requestedAt: Date.now(),
      riskLevel: riskLevel as ElevationRequest["riskLevel"],
      impactDescription: policy?.description || `Privileged action: ${action}`,
      requesterApp,
    };

    return request;
  }

  // ── Process Approval ────────────────────────────────────

  async processApproval(
    request: ElevationRequest,
    credential: string,
    method: OSAuthMethod = "password"
  ): Promise<ElevationResult> {
    const authd = getAuthDaemon();
    const auditd = getAuditDaemon();

    // Verify credential and issue token
    const tokenResult = await authd.beginElevation(
      request.sessionId,
      request.action,
      request.targetService,
      credential,
      method
    );

    if (tokenResult.status !== "ok" || !tokenResult.data) {
      await auditd.logElevation(request.userId, request.sessionId, request.action, false, method);
      return { approved: false, error: tokenResult.error || "Authentication failed" };
    }

    await auditd.logElevation(request.userId, request.sessionId, request.action, true, method);
    return { approved: true, token: tokenResult.data };
  }

  // ── Token Validation (for target services) ──────────────

  async validateToken(
    tokenId: string, action: string, targetService: string
  ): Promise<boolean> {
    const authd = getAuthDaemon();
    const result = await authd.validateElevationToken(tokenId, action, targetService);
    return result.status === "ok" && result.data === true;
  }

  // ── Rate Limiting ───────────────────────────────────────

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const timestamps = this.recentRequests.get(userId) || [];
    const recent = timestamps.filter(t => now - t < this.rateLimit.windowMs);

    if (recent.length >= this.rateLimit.maxPerMinute) {
      return false;
    }

    recent.push(now);
    this.recentRequests.set(userId, recent);
    return true;
  }

  // ── Pending Queue Management ────────────────────────────

  enqueue(request: ElevationRequest): Promise<ElevationResult> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        this.pendingQueue.delete(request.requestId);
        resolve({ approved: false, error: "Elevation request timed out" });
      }, ELEVATION_TOKEN_TTL_MS);

      this.pendingQueue.set(request.requestId, { request, resolve, timeoutId });
    });
  }

  async resolveElevation(
    requestId: string, credential: string, method: OSAuthMethod = "password"
  ): Promise<ElevationResult> {
    const pending = this.pendingQueue.get(requestId);
    if (!pending) return { approved: false, error: "Request not found or expired" };

    clearTimeout(pending.timeoutId);
    this.pendingQueue.delete(requestId);

    const result = await this.processApproval(pending.request, credential, method);
    pending.resolve(result);
    return result;
  }

  cancelElevation(requestId: string): void {
    const pending = this.pendingQueue.get(requestId);
    if (pending) {
      clearTimeout(pending.timeoutId);
      this.pendingQueue.delete(requestId);
      pending.resolve({ approved: false, error: "Cancelled by user" });
    }
  }

  getPendingRequests(): ElevationRequest[] {
    return Array.from(this.pendingQueue.values()).map(p => p.request);
  }

  getStats() {
    return {
      pendingRequests: this.pendingQueue.size,
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _engine: ElevationEngine | null = null;
export function getElevationEngine(): ElevationEngine {
  if (!_engine) _engine = new ElevationEngine();
  return _engine;
}
