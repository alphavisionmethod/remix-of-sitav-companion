// ═══════════════════════════════════════════════════════════════
// SITA OS — sessiond: Session Manager Daemon
// Session lifecycle, idle tracking, lock/unlock,
// auth freshness, guest sessions, session tokens,
// fast user switching, suspend/resume policy
// ═══════════════════════════════════════════════════════════════

import {
  type OSSession, type SessionState, type OSAuthMethod, type IPCResult,
  type ExtendedSessionState, type SessionType, type SessionToken,
  type SessionTokenClass, type SuspendLockPolicy, type IdlePolicy,
  type LockscreenActionRule, LOCKSCREEN_ACTION_MATRIX,
  SESSION_IDLE_TIMEOUT_MS, AUTH_FRESHNESS_WINDOW_MS,
} from "./types";
import { getAuthDaemon } from "./authd";

// ── Lock Screen Rules ───────────────────────────────────────

export interface LockedScreenCapabilities {
  viewBattery: boolean;
  viewTime: boolean;
  emergencyControls: boolean;
  toggleWifi: boolean;
  toggleBluetooth: boolean;
  viewNotifications: boolean;
  mediaControls: boolean;
}

export const DEFAULT_LOCKED_CAPABILITIES: LockedScreenCapabilities = {
  viewBattery: true,
  viewTime: true,
  emergencyControls: true,
  toggleWifi: true,
  toggleBluetooth: false,
  viewNotifications: true,
  mediaControls: true,
};

// ── Extended Session ────────────────────────────────────────

export interface ExtendedOSSession extends OSSession {
  sessionType: SessionType;
  extendedState: ExtendedSessionState;
  suspendPolicy: SuspendLockPolicy;
  idlePolicy: IdlePolicy;
  suspendedAt?: number;
  tokenIds: string[];
  foreground: boolean;
}

// ── Session Token Issuer ────────────────────────────────────

export class SessionTokenIssuer {
  private tokens: Map<string, SessionToken> = new Map();
  private keyId = `stk-${crypto.randomUUID().slice(0, 8)}`;

  issue(
    sessionId: string,
    userId: string,
    tokenClass: SessionTokenClass,
    scopes: string[],
    audience: string = "os-session",
    ttlMs: number = 15 * 60 * 1000
  ): SessionToken {
    const now = Date.now();
    const nonce = crypto.randomUUID();
    const token: SessionToken = {
      tokenId: crypto.randomUUID(),
      sessionId, userId, audience, scopes,
      issuedAt: now,
      expiresAt: now + ttlMs,
      sensitive: tokenClass === "privileged_action" || tokenClass === "fresh_auth",
      revoked: false,
      keyId: this.keyId,
      signature: this.sign(sessionId, nonce),
      tokenClass,
      nonce,
    };
    this.tokens.set(token.tokenId, token);
    return token;
  }

  rotate(tokenId: string): SessionToken | null {
    const old = this.tokens.get(tokenId);
    if (!old || old.revoked) return null;
    old.revoked = true;
    old.revokedAt = Date.now();
    return this.issue(old.sessionId, old.userId, old.tokenClass, old.scopes, old.audience);
  }

  revoke(tokenId: string): boolean {
    const token = this.tokens.get(tokenId);
    if (!token) return false;
    token.revoked = true;
    token.revokedAt = Date.now();
    return true;
  }

  revokeAllForSession(sessionId: string): number {
    let count = 0;
    for (const token of this.tokens.values()) {
      if (token.sessionId === sessionId && !token.revoked) {
        token.revoked = true;
        token.revokedAt = Date.now();
        count++;
      }
    }
    return count;
  }

  revokeSensitiveForSession(sessionId: string): number {
    let count = 0;
    for (const token of this.tokens.values()) {
      if (token.sessionId === sessionId && token.sensitive && !token.revoked) {
        token.revoked = true;
        token.revokedAt = Date.now();
        count++;
      }
    }
    return count;
  }

  getTokensForSession(sessionId: string): SessionToken[] {
    return Array.from(this.tokens.values()).filter(t => t.sessionId === sessionId);
  }

  getActiveTokensForSession(sessionId: string): SessionToken[] {
    const now = Date.now();
    return Array.from(this.tokens.values()).filter(
      t => t.sessionId === sessionId && !t.revoked && t.expiresAt > now
    );
  }

  validate(tokenId: string, requiredScope?: string): boolean {
    const token = this.tokens.get(tokenId);
    if (!token || token.revoked || Date.now() > token.expiresAt) return false;
    if (requiredScope && !token.scopes.includes(requiredScope)) return false;
    return true;
  }

  getAllTokens(): SessionToken[] {
    return Array.from(this.tokens.values());
  }

  getStats() {
    const all = Array.from(this.tokens.values());
    const now = Date.now();
    return {
      total: all.length,
      active: all.filter(t => !t.revoked && t.expiresAt > now).length,
      revoked: all.filter(t => t.revoked).length,
      expired: all.filter(t => !t.revoked && t.expiresAt <= now).length,
      byClass: Object.fromEntries(
        (["ui_session", "privileged_action", "broker", "service_delegation", "lockscreen_limited", "fresh_auth"] as SessionTokenClass[])
          .map(c => [c, all.filter(t => t.tokenClass === c && !t.revoked && t.expiresAt > now).length])
      ),
    };
  }

  private sign(sessionId: string, nonce: string): string {
    // ECDSA simulation — hash-based signature
    const payload = `${sessionId}:${nonce}:${this.keyId}`;
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const chr = payload.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return `sig-${Math.abs(hash).toString(36)}`;
  }
}

// ── SessionD Service ────────────────────────────────────────

export class SessionDaemon {
  private sessions: Map<string, ExtendedOSSession> = new Map();
  private idleTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private screensaverTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private lockedCapabilities: LockedScreenCapabilities = { ...DEFAULT_LOCKED_CAPABILITIES };
  private listeners: Array<(event: SessionEvent) => void> = [];
  private initialized = false;
  readonly tokenIssuer = new SessionTokenIssuer();

  private defaultSuspendPolicy: SuspendLockPolicy = {
    mode: "always_lock",
    thresholdMs: 60000,
    forceReauthSensitive: true,
  };

  private defaultIdlePolicy: IdlePolicy = {
    idleTimeoutMs: SESSION_IDLE_TIMEOUT_MS,
    screensaverDelayMs: 5 * 60 * 1000,
    graceIntervalMs: 30 * 1000,
    autoLock: true,
  };

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  // ── Login ───────────────────────────────────────────────

  async login(
    userId: string, method: OSAuthMethod, credential: string,
    sessionType: SessionType = "local"
  ): Promise<IPCResult<ExtendedOSSession>> {
    const authd = getAuthDaemon();
    const result = await authd.createSession(userId, method, credential);
    if (result.status !== "ok" || !result.data) return result as IPCResult<ExtendedOSSession>;

    const base = result.data;
    const session: ExtendedOSSession = {
      ...base,
      sessionType,
      extendedState: "active",
      suspendPolicy: { ...this.defaultSuspendPolicy },
      idlePolicy: { ...this.defaultIdlePolicy },
      tokenIds: [],
      foreground: true,
    };

    this.sessions.set(session.sessionId, session);

    // Issue initial tokens
    const uiToken = this.tokenIssuer.issue(session.sessionId, userId, "ui_session", base.capabilities);
    const freshToken = this.tokenIssuer.issue(session.sessionId, userId, "fresh_auth", ["elevation", "sensitive"], "auth-service", AUTH_FRESHNESS_WINDOW_MS);
    session.tokenIds.push(uiToken.tokenId, freshToken.tokenId);

    this.startIdleTimer(session.sessionId);
    this.emit({ type: "login", sessionId: session.sessionId, userId, data: { sessionType, tokenCount: 2 } });
    return { status: "ok", data: session };
  }

  // ── Guest Session ───────────────────────────────────────

  createGuestSession(): ExtendedOSSession {
    const session: ExtendedOSSession = {
      sessionId: crypto.randomUUID(),
      userId: `guest-${crypto.randomUUID().slice(0, 8)}`,
      role: "guest",
      state: "active",
      locked: false,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      authFreshUntil: Date.now() + AUTH_FRESHNESS_WINDOW_MS,
      capabilities: ["session.lock", "session.unlock", "power.profile.set"],
      enrolledMethods: [],
      displayId: ":0",
      seatId: "seat0",
      sessionType: "guest",
      extendedState: "active",
      suspendPolicy: { mode: "always_lock", thresholdMs: 0, forceReauthSensitive: true },
      idlePolicy: { ...this.defaultIdlePolicy, idleTimeoutMs: 5 * 60 * 1000 },
      tokenIds: [],
      foreground: true,
    };

    const token = this.tokenIssuer.issue(session.sessionId, session.userId, "lockscreen_limited", session.capabilities, "guest-session", 30 * 60 * 1000);
    session.tokenIds.push(token.tokenId);

    this.sessions.set(session.sessionId, session);
    this.startIdleTimer(session.sessionId);
    this.emit({ type: "guest-login", sessionId: session.sessionId, userId: session.userId });
    return session;
  }

  teardownGuestSession(sessionId: string): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session || session.role !== "guest") return { status: "error", error: "Not a guest session" };

    session.extendedState = "terminating";
    this.tokenIssuer.revokeAllForSession(sessionId);
    this.clearIdleTimer(sessionId);
    this.clearScreensaverTimer(sessionId);
    this.sessions.delete(sessionId);
    this.emit({ type: "guest-teardown", sessionId, userId: session.userId, data: { tokensRevoked: session.tokenIds.length } });
    return { status: "ok" };
  }

  // ── Lock / Unlock ───────────────────────────────────────

  lock(sessionId: string): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };
    session.state = "locked";
    session.extendedState = "locked";
    session.locked = true;
    this.clearIdleTimer(sessionId);
    this.clearScreensaverTimer(sessionId);

    // Revoke sensitive tokens on lock
    const revokedCount = this.tokenIssuer.revokeSensitiveForSession(sessionId);

    this.emit({ type: "lock", sessionId, userId: session.userId, data: { sensitiveTokensRevoked: revokedCount } });
    return { status: "ok" };
  }

  async unlock(sessionId: string, method: OSAuthMethod, credential: string): Promise<IPCResult> {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };

    session.state = "authenticating";
    session.extendedState = "authenticating";
    const authd = getAuthDaemon();
    const result = await authd.unlockSession(sessionId, method, credential);

    if (result.status === "ok") {
      session.state = "active";
      session.extendedState = "active";
      session.locked = false;
      session.lastActivityAt = Date.now();
      session.authFreshUntil = Date.now() + AUTH_FRESHNESS_WINDOW_MS;

      // Reissue fresh-auth token
      const freshToken = this.tokenIssuer.issue(session.sessionId, session.userId, "fresh_auth", ["elevation", "sensitive"], "auth-service", AUTH_FRESHNESS_WINDOW_MS);
      session.tokenIds.push(freshToken.tokenId);

      this.startIdleTimer(sessionId);
      this.emit({ type: "unlock", sessionId, userId: session.userId });
    } else {
      session.state = "locked";
      session.extendedState = "locked";
    }

    return result;
  }

  // ── Logout ──────────────────────────────────────────────

  logout(sessionId: string): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };

    this.clearIdleTimer(sessionId);
    this.clearScreensaverTimer(sessionId);
    session.state = "terminating";
    session.extendedState = "terminating";

    const revokedCount = this.tokenIssuer.revokeAllForSession(sessionId);

    const authd = getAuthDaemon();
    authd.terminateSession(sessionId);
    this.sessions.delete(sessionId);
    this.emit({ type: "logout", sessionId, userId: session.userId, data: { tokensRevoked: revokedCount } });
    return { status: "ok" };
  }

  // ── Fast User Switching ─────────────────────────────────

  switchSession(fromSessionId: string, toSessionId: string): IPCResult {
    const from = this.sessions.get(fromSessionId);
    const to = this.sessions.get(toSessionId);
    if (!from) return { status: "error", error: "Source session not found" };
    if (!to) return { status: "error", error: "Target session not found" };
    if (from.sessionId === to.sessionId) return { status: "error", error: "Cannot switch to same session" };

    // Deactivate source
    from.foreground = false;
    from.extendedState = "inactive";
    from.state = "inactive";
    this.clearIdleTimer(fromSessionId);

    // Activate target
    to.foreground = true;
    to.extendedState = to.locked ? "locked" : "active";
    to.state = to.locked ? "locked" : "active";
    if (!to.locked) this.startIdleTimer(toSessionId);

    this.emit({
      type: "switch",
      sessionId: toSessionId,
      userId: to.userId,
      data: { fromSession: fromSessionId, fromUser: from.userId },
    });
    return { status: "ok" };
  }

  // ── Suspend / Resume ────────────────────────────────────

  suspendSession(sessionId: string): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };

    session.extendedState = "suspended";
    session.suspendedAt = Date.now();
    this.clearIdleTimer(sessionId);
    this.clearScreensaverTimer(sessionId);

    if (session.suspendPolicy.mode === "always_lock") {
      session.state = "locked";
      session.locked = true;
      this.tokenIssuer.revokeSensitiveForSession(sessionId);
    }

    this.emit({ type: "suspend", sessionId, userId: session.userId });
    return { status: "ok" };
  }

  resumeSession(sessionId: string): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };

    const elapsedMs = session.suspendedAt ? Date.now() - session.suspendedAt : 0;
    session.suspendedAt = undefined;

    if (session.suspendPolicy.mode === "always_lock") {
      session.extendedState = "locked";
      session.state = "locked";
      session.locked = true;
      this.emit({ type: "resume", sessionId, userId: session.userId, data: { lockRequired: true, elapsedMs } });
      return { status: "ok", data: { lockRequired: true } };
    }

    if (session.suspendPolicy.mode === "lock_after_threshold" && elapsedMs > session.suspendPolicy.thresholdMs) {
      session.extendedState = "locked";
      session.state = "locked";
      session.locked = true;
      this.tokenIssuer.revokeSensitiveForSession(sessionId);
      this.emit({ type: "resume", sessionId, userId: session.userId, data: { lockRequired: true, elapsedMs } });
      return { status: "ok", data: { lockRequired: true } };
    }

    // No lock required
    session.extendedState = "active";
    session.state = "active";
    this.startIdleTimer(sessionId);
    this.emit({ type: "resume", sessionId, userId: session.userId, data: { lockRequired: false, elapsedMs } });
    return { status: "ok", data: { lockRequired: false } };
  }

  // ── Idle Policy ─────────────────────────────────────────

  setIdlePolicy(sessionId: string, policy: Partial<IdlePolicy>): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };
    session.idlePolicy = { ...session.idlePolicy, ...policy };
    this.resetIdleTimer(sessionId);
    return { status: "ok" };
  }

  setSuspendPolicy(sessionId: string, policy: Partial<SuspendLockPolicy>): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };
    session.suspendPolicy = { ...session.suspendPolicy, ...policy };
    return { status: "ok" };
  }

  // ── Activity & Idle ─────────────────────────────────────

  recordActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.state === "active") {
      session.lastActivityAt = Date.now();
      this.resetIdleTimer(sessionId);
    }
  }

  private startIdleTimer(sessionId: string): void {
    this.clearIdleTimer(sessionId);
    const session = this.sessions.get(sessionId);
    const delay = session?.idlePolicy?.screensaverDelayMs ?? SESSION_IDLE_TIMEOUT_MS;

    const timer = setTimeout(() => {
      this.onScreensaver(sessionId);
    }, delay);
    this.idleTimers.set(sessionId, timer);
  }

  private resetIdleTimer(sessionId: string): void {
    this.clearScreensaverTimer(sessionId);
    this.startIdleTimer(sessionId);
  }

  private clearIdleTimer(sessionId: string): void {
    const timer = this.idleTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.idleTimers.delete(sessionId);
    }
  }

  private clearScreensaverTimer(sessionId: string): void {
    const timer = this.screensaverTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.screensaverTimers.delete(sessionId);
    }
  }

  private onScreensaver(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.state !== "active") return;

    session.state = "inactive";
    session.extendedState = "inactive";
    this.emit({ type: "screensaver", sessionId, userId: session.userId });

    // Grace interval before lock
    const grace = session.idlePolicy?.graceIntervalMs ?? 30000;
    const lockTimer = setTimeout(() => {
      if (session.state === "inactive" && session.idlePolicy.autoLock) {
        this.lock(sessionId);
      }
    }, grace);
    this.screensaverTimers.set(sessionId, lockTimer);
  }

  // ── Lockscreen Action Matrix ────────────────────────────

  getLockscreenMatrix(): LockscreenActionRule[] {
    return [...LOCKSCREEN_ACTION_MATRIX];
  }

  evaluateLockscreenAction(action: string): LockscreenActionRule | undefined {
    return LOCKSCREEN_ACTION_MATRIX.find(r => r.action === action);
  }

  // ── Query ───────────────────────────────────────────────

  getSession(sessionId: string): ExtendedOSSession | undefined {
    return this.sessions.get(sessionId);
  }

  getActiveSession(): ExtendedOSSession | undefined {
    return Array.from(this.sessions.values()).find(s => s.foreground && (s.state === "active" || s.state === "locked"));
  }

  getAllSessions(): ExtendedOSSession[] {
    return Array.from(this.sessions.values());
  }

  getLockedCapabilities(): LockedScreenCapabilities {
    return { ...this.lockedCapabilities };
  }

  setLockedCapabilities(caps: Partial<LockedScreenCapabilities>): void {
    this.lockedCapabilities = { ...this.lockedCapabilities, ...caps };
  }

  isAuthFresh(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    return !!session && Date.now() < session.authFreshUntil;
  }

  // ── Events ──────────────────────────────────────────────

  onSessionEvent(listener: (event: SessionEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(event: SessionEvent): void {
    for (const l of this.listeners) {
      try { l(event); } catch {}
    }
  }

  getStats() {
    const all = this.getAllSessions();
    const tokenStats = this.tokenIssuer.getStats();
    return {
      totalSessions: all.length,
      active: all.filter(s => s.extendedState === "active").length,
      locked: all.filter(s => s.extendedState === "locked").length,
      suspended: all.filter(s => s.extendedState === "suspended").length,
      guest: all.filter(s => s.role === "guest").length,
      remote: all.filter(s => s.sessionType === "remote").length,
      tokens: tokenStats,
    };
  }
}

export interface SessionEvent {
  type: "login" | "logout" | "lock" | "unlock" | "idle" | "guest-login" | "guest-teardown"
    | "switch" | "suspend" | "resume" | "screensaver" | "token-issued" | "token-revoked";
  sessionId: string;
  userId: string;
  data?: Record<string, unknown>;
}

// ── Singleton ──────────────────────────────────────────────

let _sessiond: SessionDaemon | null = null;
export function getSessionDaemon(): SessionDaemon {
  if (!_sessiond) _sessiond = new SessionDaemon();
  return _sessiond;
}
