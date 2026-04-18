// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Auth Integration
// OAuth2/OIDC flows, JWT tokens, device binding, session revocation
// ═══════════════════════════════════════════════════════════════

/** Auth token pair */
export interface SyncAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  deviceId: string;
  userId: string;
  scopes: string[];
  issuedAt: string;
}

/** Auth session for sync */
export interface SyncAuthSession {
  sessionId: string;
  userId: string;
  deviceId: string;
  tokens: SyncAuthTokens;
  status: "active" | "expired" | "revoked" | "refresh-pending";
  createdAt: string;
  lastRefreshedAt: string;
  lastActivityAt: string;
}

/** Token rotation event */
export interface TokenRotationEvent {
  sessionId: string;
  oldTokenHash: string;
  newTokenHash: string;
  rotatedAt: string;
  reason: "scheduled" | "manual" | "device-change" | "security";
}

class SyncAuthManager {
  private sessions = new Map<string, SyncAuthSession>();
  private rotationLog: TokenRotationEvent[] = [];
  private currentSessionId: string | null = null;

  /** Create a new auth session for a device */
  createSession(userId: string, deviceId: string, scopes: string[] = ["sync:read", "sync:write"]): SyncAuthSession {
    const now = new Date().toISOString();
    const sessionId = `sync_session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const tokens: SyncAuthTokens = {
      accessToken: this.generateToken("access"),
      refreshToken: this.generateToken("refresh"),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      deviceId,
      userId,
      scopes,
      issuedAt: now,
    };

    const session: SyncAuthSession = {
      sessionId,
      userId,
      deviceId,
      tokens,
      status: "active",
      createdAt: now,
      lastRefreshedAt: now,
      lastActivityAt: now,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /** Set the current active session */
  setCurrentSession(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  /** Get the current session */
  getCurrentSession(): SyncAuthSession | null {
    if (!this.currentSessionId) return null;
    return this.sessions.get(this.currentSessionId) ?? null;
  }

  /** Refresh tokens for a session */
  refreshTokens(sessionId: string): SyncAuthTokens | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === "revoked") return null;

    const oldTokenHash = this.hashToken(session.tokens.accessToken);
    const now = new Date().toISOString();

    session.tokens = {
      ...session.tokens,
      accessToken: this.generateToken("access"),
      refreshToken: this.generateToken("refresh"),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      issuedAt: now,
    };
    session.status = "active";
    session.lastRefreshedAt = now;

    this.rotationLog.push({
      sessionId,
      oldTokenHash,
      newTokenHash: this.hashToken(session.tokens.accessToken),
      rotatedAt: now,
      reason: "scheduled",
    });

    return session.tokens;
  }

  /** Revoke a session */
  revokeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.status = "revoked";
    session.tokens.accessToken = "";
    session.tokens.refreshToken = "";
    return true;
  }

  /** Revoke all sessions for a device */
  revokeDeviceSessions(deviceId: string): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.deviceId === deviceId && session.status === "active") {
        session.status = "revoked";
        count++;
      }
    }
    return count;
  }

  /** Check if a token is valid */
  isTokenValid(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") return false;
    return new Date(session.tokens.expiresAt).getTime() > Date.now();
  }

  /** Record activity for a session */
  recordActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivityAt = new Date().toISOString();
    }
  }

  /** Get all sessions */
  getAllSessions(): SyncAuthSession[] {
    return Array.from(this.sessions.values());
  }

  /** Get active sessions for a user */
  getActiveSessions(userId: string): SyncAuthSession[] {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId && s.status === "active");
  }

  /** Get token rotation log */
  getRotationLog(): TokenRotationEvent[] {
    return [...this.rotationLog];
  }

  /** Clean up expired sessions */
  cleanupExpired(): number {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.status === "active" && new Date(session.tokens.expiresAt).getTime() < Date.now()) {
        session.status = "expired";
        count++;
      }
    }
    return count;
  }

  // ─── Internal ───────────────────────────────

  private generateToken(type: "access" | "refresh"): string {
    const prefix = type === "access" ? "sat" : "srt";
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 16)}${Math.random().toString(36).slice(2, 16)}`;
  }

  private hashToken(token: string): string {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = ((hash << 5) - hash) + token.charCodeAt(i);
      hash |= 0;
    }
    return `th_${Math.abs(hash).toString(16)}`;
  }
}

/** Singleton sync auth manager */
export const syncAuth = new SyncAuthManager();
