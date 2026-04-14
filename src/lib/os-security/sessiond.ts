// ═══════════════════════════════════════════════════════════════
// SITA OS — sessiond: Session Manager Daemon
// Session lifecycle, idle tracking, lock/unlock,
// auth freshness, guest sessions
// ═══════════════════════════════════════════════════════════════

import {
  type OSSession, type SessionState, type OSAuthMethod, type IPCResult,
  SESSION_IDLE_TIMEOUT_MS, AUTH_FRESHNESS_WINDOW_MS,
} from "./types";
import { getAuthDaemon } from "./authd";

// ── Lock Screen Rules ───────────────────────────────────────

export interface LockedScreenCapabilities {
  viewBattery: boolean;
  viewTime: boolean;
  emergencyControls: boolean;
  toggleWifi: boolean;        // policy-driven
  toggleBluetooth: boolean;   // usually no
  viewNotifications: boolean; // limited
  mediaControls: boolean;     // yes
}

export const DEFAULT_LOCKED_CAPABILITIES: LockedScreenCapabilities = {
  viewBattery: true,
  viewTime: true,
  emergencyControls: true,
  toggleWifi: true,    // policy allows
  toggleBluetooth: false,
  viewNotifications: true,
  mediaControls: true,
};

// ── SessionD Service ────────────────────────────────────────

export class SessionDaemon {
  private sessions: Map<string, OSSession> = new Map();
  private idleTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private lockedCapabilities: LockedScreenCapabilities = { ...DEFAULT_LOCKED_CAPABILITIES };
  private listeners: Array<(event: SessionEvent) => void> = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  // ── Login ───────────────────────────────────────────────

  async login(
    userId: string, method: OSAuthMethod, credential: string
  ): Promise<IPCResult<OSSession>> {
    const authd = getAuthDaemon();
    const result = await authd.createSession(userId, method, credential);
    if (result.status !== "ok" || !result.data) return result;

    const session = result.data;
    this.sessions.set(session.sessionId, session);
    this.startIdleTimer(session.sessionId);
    this.emit({ type: "login", sessionId: session.sessionId, userId });
    return result;
  }

  // ── Guest Session ───────────────────────────────────────

  createGuestSession(): OSSession {
    const session: OSSession = {
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
    };
    this.sessions.set(session.sessionId, session);
    this.startIdleTimer(session.sessionId);
    this.emit({ type: "guest-login", sessionId: session.sessionId, userId: session.userId });
    return session;
  }

  teardownGuestSession(sessionId: string): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session || session.role !== "guest") return { status: "error", error: "Not a guest session" };
    this.clearIdleTimer(sessionId);
    this.sessions.delete(sessionId);
    this.emit({ type: "guest-teardown", sessionId, userId: session.userId });
    return { status: "ok" };
  }

  // ── Lock / Unlock ───────────────────────────────────────

  lock(sessionId: string): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };
    session.state = "locked";
    session.locked = true;
    this.clearIdleTimer(sessionId);
    this.emit({ type: "lock", sessionId, userId: session.userId });
    return { status: "ok" };
  }

  async unlock(sessionId: string, method: OSAuthMethod, credential: string): Promise<IPCResult> {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };

    session.state = "authenticating";
    const authd = getAuthDaemon();
    const result = await authd.unlockSession(sessionId, method, credential);

    if (result.status === "ok") {
      session.state = "active";
      session.locked = false;
      session.lastActivityAt = Date.now();
      session.authFreshUntil = Date.now() + AUTH_FRESHNESS_WINDOW_MS;
      this.startIdleTimer(sessionId);
      this.emit({ type: "unlock", sessionId, userId: session.userId });
    } else {
      session.state = "locked";
    }

    return result;
  }

  // ── Logout ──────────────────────────────────────────────

  logout(sessionId: string): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };

    this.clearIdleTimer(sessionId);
    session.state = "terminating";
    const authd = getAuthDaemon();
    authd.terminateSession(sessionId);
    this.sessions.delete(sessionId);
    this.emit({ type: "logout", sessionId, userId: session.userId });
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
    const timer = setTimeout(() => {
      this.onIdle(sessionId);
    }, SESSION_IDLE_TIMEOUT_MS);
    this.idleTimers.set(sessionId, timer);
  }

  private resetIdleTimer(sessionId: string): void {
    this.startIdleTimer(sessionId);
  }

  private clearIdleTimer(sessionId: string): void {
    const timer = this.idleTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.idleTimers.delete(sessionId);
    }
  }

  private onIdle(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.state !== "active") return;
    session.state = "inactive";
    this.emit({ type: "idle", sessionId, userId: session.userId });
    // Auto-lock after idle
    this.lock(sessionId);
  }

  // ── Query ───────────────────────────────────────────────

  getSession(sessionId: string): OSSession | undefined {
    return this.sessions.get(sessionId);
  }

  getActiveSession(): OSSession | undefined {
    return Array.from(this.sessions.values()).find(s => s.state === "active" || s.state === "locked");
  }

  getAllSessions(): OSSession[] {
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
    return {
      totalSessions: all.length,
      active: all.filter(s => s.state === "active").length,
      locked: all.filter(s => s.state === "locked").length,
      guest: all.filter(s => s.role === "guest").length,
    };
  }
}

export interface SessionEvent {
  type: "login" | "logout" | "lock" | "unlock" | "idle" | "guest-login" | "guest-teardown";
  sessionId: string;
  userId: string;
}

// ── Singleton ──────────────────────────────────────────────

let _sessiond: SessionDaemon | null = null;
export function getSessionDaemon(): SessionDaemon {
  if (!_sessiond) _sessiond = new SessionDaemon();
  return _sessiond;
}
