// ═══════════════════════════════════════════════════════════════
// SITA OS — Auth Service
// Session management, token validation, MFA coordination
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface AuthSession { userId: string; email: string; role: string; deviceId: string; createdAt: string; expiresAt: string; mfaVerified: boolean; trustLevel: string; }
export interface AuthChallenge { type: 'password' | 'otp' | 'biometric' | 'device-attestation'; issuedAt: string; expiresAt: string; verified: boolean; }

export class AuthService {
  private sessions: Map<string, AuthSession> = new Map();

  createSession(userId: string, email: string, role: string, deviceId: string): AuthSession {
    const session: AuthSession = { userId, email, role, deviceId, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), mfaVerified: false, trustLevel: 'standard' };
    this.sessions.set(userId, session);
    return session;
  }

  getSession(userId: string): AuthSession | undefined { return this.sessions.get(userId); }
  validateSession(userId: string): boolean { const s = this.sessions.get(userId); return !!s && new Date(s.expiresAt) > new Date(); }
  revokeSession(userId: string): boolean { return this.sessions.delete(userId); }
  verifyMFA(userId: string): boolean { const s = this.sessions.get(userId); if (s) { s.mfaVerified = true; s.trustLevel = 'elevated'; return true; } return false; }
  elevateTrust(userId: string, level: string): void { const s = this.sessions.get(userId); if (s) s.trustLevel = level; }
  getActiveSessions(): AuthSession[] { return [...this.sessions.values()].filter(s => new Date(s.expiresAt) > new Date()); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("auth", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      sessions: Array.from(this.sessions.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.sessions) this.sessions = new Map(state.sessions as Iterable<[string, never]>) as typeof this.sessions;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("auth");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createAuthService = () => new AuthService();
