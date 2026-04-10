// ═══════════════════════════════════════════════════════════════
// SITA OS — Proactive Timing Intelligence
// When-to-help subsystem: perfect timing for every interaction
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";

// ── Types ────────────────────────────────────────────────────────

export type TimingDecision = "act_now" | "defer" | "schedule" | "suppress" | "escalate_despite_quiet";

export type UserState = "active" | "idle" | "focused" | "sleeping" | "exercising" | "commuting" | "meeting" | "socializing" | "unknown";

export interface TimingContext {
  userState: UserState;
  currentMode: string;          // SitaMode
  cognitiveLoad: number;        // 0–100
  timeOfDay: number;            // 0–23
  dayOfWeek: number;            // 0–6
  activeSurface: string;
  lastInteraction: string;
  meetingInMinutes?: number;
  focusSessionActive: boolean;
  quietHoursActive: boolean;
}

export interface TimingEvaluation {
  decision: TimingDecision;
  bestTime: string | null;      // ISO timestamp or null if now
  reason: string;
  confidence: number;           // 0–1
  alternativeTimings: { time: string; reason: string }[];
  overrideAllowed: boolean;
}

export interface TimingPreference {
  preferredSummaryTime: number;       // hour of day (0–23)
  preferredApprovalTime: number;
  preferredReminderLeadMinutes: number;
  quietHoursStart: number;            // hour
  quietHoursEnd: number;
  deferDuringFocus: boolean;
  deferDuringExercise: boolean;
  urgencyOverrideThreshold: number;   // 0–10
}

export interface TimingPattern {
  action: string;
  bestHours: number[];
  bestDays: number[];
  avgResponseTimeMs: number;
  completionRate: number;
  sampleSize: number;
}

// ── Default Preferences ──────────────────────────────────────────

const DEFAULT_PREFERENCES: TimingPreference = {
  preferredSummaryTime: 7,
  preferredApprovalTime: 9,
  preferredReminderLeadMinutes: 15,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  deferDuringFocus: true,
  deferDuringExercise: true,
  urgencyOverrideThreshold: 8,
};

// ── Service ──────────────────────────────────────────────────────

export class TimingIntelligenceService {
  private preferences: TimingPreference = { ...DEFAULT_PREFERENCES };
  private patterns: Map<string, TimingPattern> = new Map();
  private interactionLog: { action: string; timestamp: string; responseTimeMs: number; completed: boolean }[] = [];

  // ── Core Decision ──────────────────────────────────────────

  shouldActNow(action: string, urgency: number, context: TimingContext): TimingEvaluation {
    // Critical urgency overrides everything
    if (urgency >= this.preferences.urgencyOverrideThreshold) {
      if (context.quietHoursActive || context.userState === "sleeping") {
        return { decision: "escalate_despite_quiet", bestTime: null, reason: "Urgency exceeds quiet threshold", confidence: 0.95, alternativeTimings: [], overrideAllowed: true };
      }
      return { decision: "act_now", bestTime: null, reason: "High urgency", confidence: 0.9, alternativeTimings: [], overrideAllowed: true };
    }

    // Quiet hours
    if (context.quietHoursActive) {
      const nextActive = this.nextActiveTime(context.timeOfDay);
      return { decision: "defer", bestTime: nextActive, reason: "Quiet hours active", confidence: 0.85, alternativeTimings: [{ time: nextActive, reason: "After quiet hours" }], overrideAllowed: true };
    }

    // Sleeping
    if (context.userState === "sleeping") {
      const wakeTime = this.estimateWakeTime();
      return { decision: "defer", bestTime: wakeTime, reason: "User is sleeping", confidence: 0.9, alternativeTimings: [], overrideAllowed: false };
    }

    // Focus session
    if (context.focusSessionActive && this.preferences.deferDuringFocus && urgency < 7) {
      return { decision: "defer", bestTime: null, reason: "Focus session active", confidence: 0.8, alternativeTimings: [{ time: new Date(Date.now() + 1800_000).toISOString(), reason: "After focus session" }], overrideAllowed: true };
    }

    // Exercising
    if (context.userState === "exercising" && this.preferences.deferDuringExercise) {
      return { decision: "defer", bestTime: new Date(Date.now() + 3600_000).toISOString(), reason: "User is exercising", confidence: 0.75, alternativeTimings: [], overrideAllowed: true };
    }

    // Meeting imminent
    if (context.meetingInMinutes !== undefined && context.meetingInMinutes < 5 && urgency < 6) {
      return { decision: "defer", bestTime: new Date(Date.now() + (context.meetingInMinutes + 30) * 60_000).toISOString(), reason: "Meeting about to start", confidence: 0.7, alternativeTimings: [], overrideAllowed: true };
    }

    // Cognitive overload
    if (context.cognitiveLoad > 75 && urgency < 6) {
      return { decision: "defer", bestTime: null, reason: "Cognitive load too high", confidence: 0.65, alternativeTimings: [{ time: new Date(Date.now() + 1200_000).toISOString(), reason: "After load decreases" }], overrideAllowed: true };
    }

    // Check learned patterns for optimal timing
    const pattern = this.patterns.get(action);
    if (pattern && pattern.sampleSize >= 5) {
      const isOptimalHour = pattern.bestHours.includes(context.timeOfDay);
      const isOptimalDay = pattern.bestDays.includes(context.dayOfWeek);
      if (!isOptimalHour && urgency < 5) {
        const bestHour = pattern.bestHours[0] ?? context.timeOfDay + 1;
        const bestTime = this.nextOccurrenceOfHour(bestHour);
        return { decision: "schedule", bestTime, reason: `Better response rate at ${bestHour}:00`, confidence: 0.6, alternativeTimings: pattern.bestHours.slice(0, 3).map(h => ({ time: this.nextOccurrenceOfHour(h), reason: `Historical best: ${h}:00` })), overrideAllowed: true };
      }
    }

    // Default: act now
    return { decision: "act_now", bestTime: null, reason: "No timing conflicts", confidence: 0.7, alternativeTimings: [], overrideAllowed: true };
  }

  // ── Specific Timing Queries ────────────────────────────────

  getBestTimeForSummary(): string { return this.nextOccurrenceOfHour(this.preferences.preferredSummaryTime); }
  getBestTimeForApproval(): string { return this.nextOccurrenceOfHour(this.preferences.preferredApprovalTime); }
  getReminderLeadTime(): number { return this.preferences.preferredReminderLeadMinutes; }

  // ── Pattern Learning ───────────────────────────────────────

  recordInteraction(action: string, responseTimeMs: number, completed: boolean): void {
    const now = new Date();
    this.interactionLog.push({ action, timestamp: now.toISOString(), responseTimeMs, completed });
    if (this.interactionLog.length > 1000) this.interactionLog.shift();

    // Update patterns
    const existing = this.patterns.get(action) ?? { action, bestHours: [], bestDays: [], avgResponseTimeMs: 0, completionRate: 0, sampleSize: 0 };
    const actionLogs = this.interactionLog.filter(l => l.action === action);
    existing.sampleSize = actionLogs.length;
    existing.avgResponseTimeMs = actionLogs.reduce((s, l) => s + l.responseTimeMs, 0) / actionLogs.length;
    existing.completionRate = actionLogs.filter(l => l.completed).length / actionLogs.length;

    // Find best hours/days
    const hourCounts: Record<number, { total: number; completed: number }> = {};
    const dayCounts: Record<number, { total: number; completed: number }> = {};
    for (const log of actionLogs) {
      const d = new Date(log.timestamp);
      const h = d.getHours();
      const day = d.getDay();
      if (!hourCounts[h]) hourCounts[h] = { total: 0, completed: 0 };
      if (!dayCounts[day]) dayCounts[day] = { total: 0, completed: 0 };
      hourCounts[h].total++; if (log.completed) hourCounts[h].completed++;
      dayCounts[day].total++; if (log.completed) dayCounts[day].completed++;
    }
    existing.bestHours = Object.entries(hourCounts).sort((a, b) => (b[1].completed / b[1].total) - (a[1].completed / a[1].total)).slice(0, 3).map(([h]) => parseInt(h));
    existing.bestDays = Object.entries(dayCounts).sort((a, b) => (b[1].completed / b[1].total) - (a[1].completed / a[1].total)).slice(0, 3).map(([d]) => parseInt(d));
    this.patterns.set(action, existing);
    this._persist();
  }

  // ── Preference Management ──────────────────────────────────

  updatePreferences(updates: Partial<TimingPreference>): void {
    Object.assign(this.preferences, updates);
    this._persist();
  }
  getPreferences(): TimingPreference { return { ...this.preferences }; }
  getPatterns(): TimingPattern[] { return [...this.patterns.values()]; }

  // ── Helpers ────────────────────────────────────────────────

  private nextActiveTime(currentHour: number): string {
    const wakeHour = this.preferences.quietHoursEnd;
    const now = new Date();
    if (currentHour >= this.preferences.quietHoursStart || currentHour < wakeHour) {
      const target = new Date(now); target.setHours(wakeHour, 0, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      return target.toISOString();
    }
    return now.toISOString();
  }

  private estimateWakeTime(): string {
    const target = new Date();
    target.setHours(this.preferences.quietHoursEnd, 0, 0, 0);
    if (target <= new Date()) target.setDate(target.getDate() + 1);
    return target.toISOString();
  }

  private nextOccurrenceOfHour(hour: number): string {
    const target = new Date();
    target.setHours(hour, 0, 0, 0);
    if (target <= new Date()) target.setDate(target.getDate() + 1);
    return target.toISOString();
  }

  // ── Persistence ────────────────────────────────────────────

  private _persist = () => debouncedSaveServiceState("timing-intelligence", this.serialize());
  serialize(): Record<string, unknown> { return { preferences: this.preferences, patterns: Array.from(this.patterns.entries()), interactionLog: this.interactionLog.slice(-500) }; }
  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.preferences) this.preferences = state.preferences as TimingPreference;
    if (state.patterns) this.patterns = new Map(state.patterns as [string, TimingPattern][]);
    if (state.interactionLog) this.interactionLog = state.interactionLog as typeof this.interactionLog;
  }
  async loadPersistedState(): Promise<void> { const s = await loadServiceState("timing-intelligence"); if (s) this.hydrate(s as Record<string, unknown>); }
}

export const createTimingIntelligence = () => new TimingIntelligenceService();
