// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Trust Scoring Engine
// 7-state trust model, scoring algorithm, access control
// ═══════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────

export type TrustState = "trusted" | "limited" | "pending" | "revoked" | "high-risk" | "managed" | "guest";

export interface TrustScore {
  deviceId: string;
  state: TrustState;
  numericScore: number; // 0-100
  factors: TrustFactor[];
  lastEvaluatedAt: string;
  history: Array<{ state: TrustState; score: number; at: string; reason: string }>;
  capabilities: TrustCapabilities;
}

export interface TrustFactor {
  name: string;
  weight: number;
  score: number; // 0-100
  description: string;
  lastUpdated: string;
}

export interface TrustCapabilities {
  canSyncNamespaces: string[];
  blockedNamespaces: string[];
  canReceiveE2EEKeys: boolean;
  canRestoreSessions: boolean;
  canUseNearbySync: boolean;
  canPerformDestructiveActions: boolean;
  canAccessSensitiveData: boolean;
  maxSyncFrequency: "realtime" | "hourly" | "daily" | "manual";
}

export interface TrustPolicy {
  state: TrustState;
  minScore: number;
  maxScore: number;
  capabilities: TrustCapabilities;
  autoDowngradeAfterDays?: number;
  requiresReauth: boolean;
}

export interface TrustEvent {
  id: string;
  deviceId: string;
  type: "upgrade" | "downgrade" | "factor-change" | "manual-override" | "auto-review";
  fromState: TrustState;
  toState: TrustState;
  fromScore: number;
  toScore: number;
  reason: string;
  timestamp: string;
}

// ─── Trust Scoring Engine ─────────────────────────────────────

class TrustScoringEngine {
  private scores = new Map<string, TrustScore>();
  private events: TrustEvent[] = [];
  private policies: TrustPolicy[];

  constructor() {
    this.policies = this.initDefaultPolicies();
  }

  // ─── Scoring ───────────────────────────────────────

  initDevice(deviceId: string, initialState: TrustState = "pending"): TrustScore {
    const factors = this.getDefaultFactors();
    const numericScore = this.computeScore(factors);
    const state = initialState === "pending" ? "pending" : this.scoreToState(numericScore);

    const score: TrustScore = {
      deviceId, state, numericScore, factors,
      lastEvaluatedAt: new Date().toISOString(),
      history: [{ state, score: numericScore, at: new Date().toISOString(), reason: "Initial enrollment" }],
      capabilities: this.getCapabilitiesForState(state),
    };
    this.scores.set(deviceId, score);
    return score;
  }

  getScore(deviceId: string): TrustScore | null {
    return this.scores.get(deviceId) ?? null;
  }

  getAllScores(): TrustScore[] {
    return Array.from(this.scores.values());
  }

  updateFactor(deviceId: string, factorName: string, newScore: number, description?: string): TrustScore | null {
    const ts = this.scores.get(deviceId);
    if (!ts) return null;

    const factor = ts.factors.find(f => f.name === factorName);
    if (factor) {
      factor.score = Math.max(0, Math.min(100, newScore));
      factor.lastUpdated = new Date().toISOString();
      if (description) factor.description = description;
    }

    const oldState = ts.state;
    const oldScore = ts.numericScore;
    ts.numericScore = this.computeScore(ts.factors);
    ts.state = this.scoreToState(ts.numericScore);
    ts.capabilities = this.getCapabilitiesForState(ts.state);
    ts.lastEvaluatedAt = new Date().toISOString();

    if (oldState !== ts.state) {
      ts.history.push({ state: ts.state, score: ts.numericScore, at: ts.lastEvaluatedAt, reason: `Factor ${factorName} changed` });
      this.emitEvent(deviceId, oldState !== ts.state ? (ts.numericScore > oldScore ? "upgrade" : "downgrade") : "factor-change",
        oldState, ts.state, oldScore, ts.numericScore, `Factor ${factorName}: ${oldScore} → ${newScore}`);
    }

    return ts;
  }

  // ─── Manual Overrides ──────────────────────────────

  setTrustState(deviceId: string, state: TrustState, reason: string): TrustScore | null {
    const ts = this.scores.get(deviceId);
    if (!ts) return null;

    const oldState = ts.state;
    const oldScore = ts.numericScore;
    ts.state = state;
    ts.capabilities = this.getCapabilitiesForState(state);
    ts.lastEvaluatedAt = new Date().toISOString();
    ts.history.push({ state, score: ts.numericScore, at: ts.lastEvaluatedAt, reason });

    this.emitEvent(deviceId, "manual-override", oldState, state, oldScore, ts.numericScore, reason);
    return ts;
  }

  revokeDevice(deviceId: string, reason: string): void {
    this.setTrustState(deviceId, "revoked", reason);
  }

  promoteToTrusted(deviceId: string, approvedBy: string): void {
    this.setTrustState(deviceId, "trusted", `Promoted by device ${approvedBy}`);
  }

  // ─── Evaluation ────────────────────────────────────

  evaluateAll(): TrustEvent[] {
    const newEvents: TrustEvent[] = [];
    for (const [deviceId, ts] of this.scores) {
      if (ts.state === "revoked") continue;
      const oldState = ts.state;
      const oldScore = ts.numericScore;
      ts.numericScore = this.computeScore(ts.factors);
      ts.state = this.scoreToState(ts.numericScore);
      ts.capabilities = this.getCapabilitiesForState(ts.state);
      ts.lastEvaluatedAt = new Date().toISOString();

      if (oldState !== ts.state) {
        const event = this.emitEvent(deviceId, "auto-review", oldState, ts.state, oldScore, ts.numericScore, "Periodic re-evaluation");
        newEvents.push(event);
      }
    }
    return newEvents;
  }

  canAccessNamespace(deviceId: string, namespace: string): boolean {
    const ts = this.scores.get(deviceId);
    if (!ts) return false;
    if (ts.capabilities.blockedNamespaces.some(n => namespace.startsWith(n))) return false;
    if (ts.capabilities.canSyncNamespaces.includes("*")) return true;
    return ts.capabilities.canSyncNamespaces.some(n => namespace.startsWith(n));
  }

  canPerformAction(deviceId: string, action: "e2ee-key" | "session-restore" | "nearby" | "destructive" | "sensitive"): boolean {
    const ts = this.scores.get(deviceId);
    if (!ts) return false;
    switch (action) {
      case "e2ee-key": return ts.capabilities.canReceiveE2EEKeys;
      case "session-restore": return ts.capabilities.canRestoreSessions;
      case "nearby": return ts.capabilities.canUseNearbySync;
      case "destructive": return ts.capabilities.canPerformDestructiveActions;
      case "sensitive": return ts.capabilities.canAccessSensitiveData;
    }
  }

  // ─── Events ────────────────────────────────────────

  getEvents(deviceId?: string, limit = 50): TrustEvent[] {
    let results = [...this.events];
    if (deviceId) results = results.filter(e => e.deviceId === deviceId);
    return results.slice(-limit).reverse();
  }

  // ─── Stats ─────────────────────────────────────────

  getStats() {
    const byState: Record<TrustState, number> = { trusted: 0, limited: 0, pending: 0, revoked: 0, "high-risk": 0, managed: 0, guest: 0 };
    let totalScore = 0;
    for (const ts of this.scores.values()) {
      byState[ts.state]++;
      totalScore += ts.numericScore;
    }
    return {
      totalDevices: this.scores.size,
      byState,
      averageScore: this.scores.size > 0 ? Math.round(totalScore / this.scores.size) : 0,
      totalEvents: this.events.length,
    };
  }

  // ─── Internal ──────────────────────────────────────

  private getDefaultFactors(): TrustFactor[] {
    const now = new Date().toISOString();
    return [
      { name: "enrollment-age", weight: 0.15, score: 30, description: "How long device has been enrolled", lastUpdated: now },
      { name: "auth-method", weight: 0.2, score: 50, description: "Authentication strength (password, biometric, hardware key)", lastUpdated: now },
      { name: "os-security", weight: 0.15, score: 70, description: "OS version and security patches", lastUpdated: now },
      { name: "network-history", weight: 0.1, score: 60, description: "History of trusted vs untrusted networks", lastUpdated: now },
      { name: "behavior-pattern", weight: 0.15, score: 50, description: "Normal vs anomalous usage patterns", lastUpdated: now },
      { name: "compliance", weight: 0.15, score: 80, description: "Policy compliance (encryption, updates)", lastUpdated: now },
      { name: "user-confirmation", weight: 0.1, score: 0, description: "Explicit user trust confirmation", lastUpdated: now },
    ];
  }

  private computeScore(factors: TrustFactor[]): number {
    let total = 0;
    let weightSum = 0;
    for (const f of factors) {
      total += f.score * f.weight;
      weightSum += f.weight;
    }
    return weightSum > 0 ? Math.round(total / weightSum) : 0;
  }

  private scoreToState(score: number): TrustState {
    if (score >= 80) return "trusted";
    if (score >= 60) return "managed";
    if (score >= 40) return "limited";
    if (score >= 20) return "guest";
    return "high-risk";
  }

  private getCapabilitiesForState(state: TrustState): TrustCapabilities {
    const policy = this.policies.find(p => p.state === state);
    return policy?.capabilities ?? {
      canSyncNamespaces: [], blockedNamespaces: ["*"],
      canReceiveE2EEKeys: false, canRestoreSessions: false,
      canUseNearbySync: false, canPerformDestructiveActions: false,
      canAccessSensitiveData: false, maxSyncFrequency: "manual",
    };
  }

  private emitEvent(deviceId: string, type: TrustEvent["type"], fromState: TrustState, toState: TrustState, fromScore: number, toScore: number, reason: string): TrustEvent {
    const event: TrustEvent = {
      id: `te_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      deviceId, type, fromState, toState, fromScore, toScore, reason,
      timestamp: new Date().toISOString(),
    };
    this.events.push(event);
    if (this.events.length > 2000) this.events = this.events.slice(-1500);
    return event;
  }

  private initDefaultPolicies(): TrustPolicy[] {
    return [
      { state: "trusted", minScore: 80, maxScore: 100, requiresReauth: false, capabilities: {
        canSyncNamespaces: ["*"], blockedNamespaces: [],
        canReceiveE2EEKeys: true, canRestoreSessions: true,
        canUseNearbySync: true, canPerformDestructiveActions: true,
        canAccessSensitiveData: true, maxSyncFrequency: "realtime",
      }},
      { state: "managed", minScore: 60, maxScore: 79, requiresReauth: false, capabilities: {
        canSyncNamespaces: ["files", "settings", "session"], blockedNamespaces: ["admin"],
        canReceiveE2EEKeys: true, canRestoreSessions: true,
        canUseNearbySync: true, canPerformDestructiveActions: false,
        canAccessSensitiveData: true, maxSyncFrequency: "realtime",
      }},
      { state: "limited", minScore: 40, maxScore: 59, requiresReauth: true, capabilities: {
        canSyncNamespaces: ["files.documents", "settings"], blockedNamespaces: ["session", "admin"],
        canReceiveE2EEKeys: false, canRestoreSessions: false,
        canUseNearbySync: false, canPerformDestructiveActions: false,
        canAccessSensitiveData: false, maxSyncFrequency: "hourly",
      }},
      { state: "guest", minScore: 20, maxScore: 39, requiresReauth: true, capabilities: {
        canSyncNamespaces: ["files.shared"], blockedNamespaces: ["settings", "session", "admin"],
        canReceiveE2EEKeys: false, canRestoreSessions: false,
        canUseNearbySync: false, canPerformDestructiveActions: false,
        canAccessSensitiveData: false, maxSyncFrequency: "daily",
      }},
      { state: "pending", minScore: 0, maxScore: 100, requiresReauth: true, capabilities: {
        canSyncNamespaces: [], blockedNamespaces: ["*"],
        canReceiveE2EEKeys: false, canRestoreSessions: false,
        canUseNearbySync: false, canPerformDestructiveActions: false,
        canAccessSensitiveData: false, maxSyncFrequency: "manual",
      }},
      { state: "revoked", minScore: 0, maxScore: 0, requiresReauth: true, capabilities: {
        canSyncNamespaces: [], blockedNamespaces: ["*"],
        canReceiveE2EEKeys: false, canRestoreSessions: false,
        canUseNearbySync: false, canPerformDestructiveActions: false,
        canAccessSensitiveData: false, maxSyncFrequency: "manual",
      }},
      { state: "high-risk", minScore: 0, maxScore: 19, requiresReauth: true, autoDowngradeAfterDays: 7, capabilities: {
        canSyncNamespaces: [], blockedNamespaces: ["*"],
        canReceiveE2EEKeys: false, canRestoreSessions: false,
        canUseNearbySync: false, canPerformDestructiveActions: false,
        canAccessSensitiveData: false, maxSyncFrequency: "manual",
      }},
    ];
  }
}

export const trustScoring = new TrustScoringEngine();
