// ═══════════════════════════════════════════════════════════════
// SITA OS — Identity Service
// User identity resolution, profiles, and federation
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface IdentityRecord { userId: string; email: string; displayName: string; providers: string[]; verified: boolean; createdAt: string; lastLoginAt: string; metadata: Record<string, unknown>; }

export class IdentityService {
  private identities: Map<string, IdentityRecord> = new Map();
  createIdentity(record: IdentityRecord): void { this.identities.set(record.userId, record); }
  getIdentity(userId: string): IdentityRecord | undefined { return this.identities.get(userId); }
  resolveByEmail(email: string): IdentityRecord | undefined { return [...this.identities.values()].find(i => i.email === email); }
  updateLastLogin(userId: string): void { const i = this.identities.get(userId); if (i) i.lastLoginAt = new Date().toISOString(); }
  listIdentities(): IdentityRecord[] { return [...this.identities.values()]; }
  deleteIdentity(userId: string): boolean { return this.identities.delete(userId); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("identity", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      identities: Array.from(this.identities.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.identities) this.identities = new Map(state.identities as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("identity");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createIdentityService = () => new IdentityService();
