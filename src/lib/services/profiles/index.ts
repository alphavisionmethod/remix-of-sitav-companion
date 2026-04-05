// SITA OS — Profiles Service (merge: owner-control-room)
export interface UserProfile { userId: string; displayName: string; avatarUrl?: string; bio?: string; role?: string; onboardingCompleted: boolean; demoMode: boolean; createdAt: string; updatedAt: string; }
export class ProfilesService {
  private profiles: Map<string, UserProfile> = new Map();
  create(profile: UserProfile): void { this.profiles.set(profile.userId, profile); }
  get(userId: string): UserProfile | undefined { return this.profiles.get(userId); }
  update(userId: string, updates: Partial<UserProfile>): UserProfile | undefined { const p = this.profiles.get(userId); if (p) { Object.assign(p, updates, { updatedAt: new Date().toISOString() }); return p; } return undefined; }
  completeOnboarding(userId: string): void { const p = this.profiles.get(userId); if (p) { p.onboardingCompleted = true; p.updatedAt = new Date().toISOString(); } }
  toggleDemoMode(userId: string): void { const p = this.profiles.get(userId); if (p) { p.demoMode = !p.demoMode; p.updatedAt = new Date().toISOString(); } }
  list(): UserProfile[] { return [...this.profiles.values()]; }
}
export const createProfiles = () => new ProfilesService();
