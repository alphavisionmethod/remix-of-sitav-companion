// SITA OS — Onboarding Service (merge: enterprise-control-plane)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface OnboardingSession { id: string; userId: string; currentStep: string; completedSteps: string[]; preferences: Record<string, unknown>; startedAt: string; completedAt?: string; }
export class OnboardingService {
  private sessions: Map<string, OnboardingSession> = new Map();
  private counter = 0;
  startSession(userId: string): OnboardingSession { const s: OnboardingSession = { id: `onb-${++this.counter}`, userId, currentStep: 'welcome', completedSteps: [], preferences: {}, startedAt: new Date().toISOString() }; this.sessions.set(s.id, s); return s; }
  advanceStep(sessionId: string, nextStep: string): void { const s = this.sessions.get(sessionId); if (s) { s.completedSteps.push(s.currentStep); s.currentStep = nextStep; } }
  complete(sessionId: string): void { const s = this.sessions.get(sessionId); if (s) { s.completedSteps.push(s.currentStep); s.completedAt = new Date().toISOString(); } }
  setPreference(sessionId: string, key: string, value: unknown): void { const s = this.sessions.get(sessionId); if (s) s.preferences[key] = value; }
  getSession(sessionId: string): OnboardingSession | undefined { return this.sessions.get(sessionId); }
  getByUser(userId: string): OnboardingSession | undefined { return [...this.sessions.values()].find(s => s.userId === userId); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("onboarding", this.serialize());

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
    const state = await loadServiceState("onboarding");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createOnboarding = () => new OnboardingService();

