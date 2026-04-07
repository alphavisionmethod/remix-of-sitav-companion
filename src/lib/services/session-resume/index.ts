// ═══════════════════════════════════════════════════════════════
// SITA OS — Session Resume Service
// Generates short-lived resume tokens for cross-device continuity
// ═══════════════════════════════════════════════════════════════

import type { SessionResumeToken } from "@/packages/contracts/graph/session-resume-token";
import { getDeviceId } from "@/lib/services/surface-detection";
import { detectSurfaceType } from "@/lib/services/surface-detection";
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export class SessionResumeService {
  private tokens = new Map<string, SessionResumeToken>();

  generateToken(
    userId: string,
    sessionId: string,
    context: Record<string, unknown> = {},
    ttlMinutes: number = 15
  ): SessionResumeToken {
    const token: SessionResumeToken = {
      tokenId: `srt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sessionId,
      userId,
      deviceId: getDeviceId(),
      surfaceType: detectSurfaceType(),
      context,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString(),
      isConsumed: false,
    };
    this.tokens.set(token.tokenId, token);
    return token;
  }

  consumeToken(tokenId: string, consumerId: string): SessionResumeToken | null {
    const token = this.tokens.get(tokenId);
    if (!token) return null;
    if (token.isConsumed) return null;
    if (new Date(token.expiresAt) < new Date()) {
      this.tokens.delete(tokenId);
      return null;
    }

    token.isConsumed = true;
    token.consumedAt = new Date().toISOString();
    token.consumedBy = consumerId;
    return token;
  }

  getActiveTokens(userId: string): SessionResumeToken[] {
    const now = new Date();
    return Array.from(this.tokens.values()).filter(
      (t) => t.userId === userId && !t.isConsumed && new Date(t.expiresAt) > now
    );
  }

  cleanExpired(): number {
    const now = new Date();
    let removed = 0;
    for (const [id, token] of this.tokens) {
      if (new Date(token.expiresAt) < now || token.isConsumed) {
        this.tokens.delete(id);
        removed++;
      }
    }
    return removed;
  }

  computeContinuityScore(userId: string): number {
    const active = this.getActiveTokens(userId);
    if (active.length === 0) return 100;
    const now = Date.now();
    const freshTokens = active.filter(
      (t) => now - new Date(t.createdAt).getTime() < 5 * 60 * 1000
    );
    return Math.round((freshTokens.length / active.length) * 100);
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("session-resume", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      tokens: Array.from(this.tokens.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.tokens) this.tokens = new Map(state.tokens as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("session-resume");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

// ── Factory ─────────────────────────────────────────────────────

let _instance: SessionResumeService | null = null;

export function getSessionResumeService(): SessionResumeService {
  if (!_instance) _instance = new SessionResumeService();
  return _instance;
}
