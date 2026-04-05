// ═══════════════════════════════════════════════════════════════
// SITA OS — Identity Service
// User identity resolution, profiles, and federation
// ═══════════════════════════════════════════════════════════════

export interface IdentityRecord { userId: string; email: string; displayName: string; providers: string[]; verified: boolean; createdAt: string; lastLoginAt: string; metadata: Record<string, unknown>; }

export class IdentityService {
  private identities: Map<string, IdentityRecord> = new Map();
  createIdentity(record: IdentityRecord): void { this.identities.set(record.userId, record); }
  getIdentity(userId: string): IdentityRecord | undefined { return this.identities.get(userId); }
  resolveByEmail(email: string): IdentityRecord | undefined { return [...this.identities.values()].find(i => i.email === email); }
  updateLastLogin(userId: string): void { const i = this.identities.get(userId); if (i) i.lastLoginAt = new Date().toISOString(); }
  listIdentities(): IdentityRecord[] { return [...this.identities.values()]; }
  deleteIdentity(userId: string): boolean { return this.identities.delete(userId); }
}

export const createIdentityService = () => new IdentityService();
