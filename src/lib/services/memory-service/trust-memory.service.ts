// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Memory Service
// Trust score history and flag tracking
// ═══════════════════════════════════════════════════════════════

export interface TrustState {
  userId: string;
  overallScore: number;
  factors: TrustFactor[];
  flags: TrustFlag[];
  lastUpdated: string;
  history: TrustSnapshot[];
}

export interface TrustFactor {
  name: string;
  weight: number;
  score: number;
  source: string;
}

export interface TrustFlag {
  type: "warning" | "violation" | "anomaly";
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface TrustSnapshot {
  score: number;
  timestamp: string;
  reason: string;
}

const trustStates = new Map<string, TrustState>();

export function initializeTrust(userId: string): TrustState {
  const state: TrustState = {
    userId,
    overallScore: 100,
    factors: [
      { name: "verification-accuracy", weight: 0.3, score: 100, source: "verification-engine" },
      { name: "approval-compliance", weight: 0.25, score: 100, source: "approval-engine" },
      { name: "data-freshness", weight: 0.2, score: 100, source: "connector-health" },
      { name: "correction-frequency", weight: 0.15, score: 100, source: "correction-service" },
      { name: "policy-adherence", weight: 0.1, score: 100, source: "policy-engine" },
    ],
    flags: [],
    lastUpdated: new Date().toISOString(),
    history: [{ score: 100, timestamp: new Date().toISOString(), reason: "Initial trust state" }],
  };
  trustStates.set(userId, state);
  return state;
}

export function updateTrustFactor(userId: string, factorName: string, newScore: number, reason: string): TrustState | null {
  const state = trustStates.get(userId);
  if (!state) return null;

  const factor = state.factors.find((f) => f.name === factorName);
  if (factor) {
    factor.score = Math.max(0, Math.min(100, newScore));
  }

  state.overallScore = state.factors.reduce((acc, f) => acc + f.score * f.weight, 0);
  state.lastUpdated = new Date().toISOString();
  state.history.push({ score: state.overallScore, timestamp: state.lastUpdated, reason });

  if (state.overallScore < 60) {
    state.flags.push({ type: "warning", message: `Trust score dropped to ${Math.round(state.overallScore)}`, timestamp: state.lastUpdated, resolved: false });
  }

  return state;
}

export function getTrustState(userId: string): TrustState | undefined {
  return trustStates.get(userId);
}

export function addTrustFlag(userId: string, flag: Omit<TrustFlag, "timestamp" | "resolved">): void {
  const state = trustStates.get(userId);
  if (state) state.flags.push({ ...flag, timestamp: new Date().toISOString(), resolved: false });
}

export function resolveFlag(userId: string, index: number): boolean {
  const state = trustStates.get(userId);
  if (!state || !state.flags[index]) return false;
  state.flags[index].resolved = true;
  return true;
}
