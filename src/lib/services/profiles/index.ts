// SITA OS — Profiles Service (merge: owner-control-room)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface UserProfile { userId: string; displayName: string; avatarUrl?: string; bio?: string; role?: string; onboardingCompleted: boolean; demoMode: boolean; createdAt: string; updatedAt: string; }
export class ProfilesService {
  private profiles: Map<string, UserProfile> = new Map();
  create(profile: UserProfile): void { this.profiles.set(profile.userId, profile); }
  get(userId: string): UserProfile | undefined { return this.profiles.get(userId); }
  update(userId: string, updates: Partial<UserProfile>): UserProfile | undefined { const p = this.profiles.get(userId); if (p) { Object.assign(p, updates, { updatedAt: new Date().toISOString() }); return p; } return undefined; }
  completeOnboarding(userId: string): void { const p = this.profiles.get(userId); if (p) { p.onboardingCompleted = true; p.updatedAt = new Date().toISOString(); } }
  toggleDemoMode(userId: string): void { const p = this.profiles.get(userId); if (p) { p.demoMode = !p.demoMode; p.updatedAt = new Date().toISOString(); } }
  list(): UserProfile[] { return [...this.profiles.values()]; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("profiles", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      profiles: Array.from(this.profiles.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.profiles) this.profiles = new Map(state.profiles as Iterable<[string, never]>) as typeof this.profiles;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("profiles");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createProfiles = () => new ProfilesService();

