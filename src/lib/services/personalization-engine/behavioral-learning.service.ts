// ═══════════════════════════════════════════════════════════════
// SITA OS — Behavioral Learning Engine
// Tracks user interactions, detects patterns, infers preferences
// ═══════════════════════════════════════════════════════════════

export type BehavioralEventType =
  | "navigation"
  | "click"
  | "approval"
  | "dismissal"
  | "dwell"
  | "search"
  | "advisor-interaction"
  | "command-palette"
  | "notification-action"
  | "preference-change";

export interface BehavioralEvent {
  type: BehavioralEventType;
  surface: string;
  metadata: Record<string, unknown>;
  timestamp: number;
}

export interface InferredPattern {
  id: string;
  dimension: string;
  label: string;
  inferredValue: unknown;
  confidence: number;
  sampleCount: number;
  consistencyRatio: number;
  source: string;
  firstSeen: number;
  lastSeen: number;
  dismissed: boolean;
  confirmed: boolean;
}

interface TimeSlot {
  hour: number;
  count: number;
}

interface SurfaceUsage {
  surface: string;
  count: number;
  totalDwellMs: number;
  lastVisit: number;
}

const WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MIN_SAMPLES = 5;
const HIGH_CONFIDENCE = 0.85;

export class BehavioralLearningEngine {
  private events: Map<string, BehavioralEvent[]> = new Map();
  private patterns: Map<string, InferredPattern[]> = new Map();
  private flushCallbacks: Array<(userId: string, patterns: InferredPattern[]) => void> = [];

  /** Register a callback for when patterns should be persisted */
  onFlush(cb: (userId: string, patterns: InferredPattern[]) => void): void {
    this.flushCallbacks.push(cb);
  }

  /** Ingest a behavioral event */
  trackEvent(userId: string, event: BehavioralEvent): void {
    if (!this.events.has(userId)) this.events.set(userId, []);
    const userEvents = this.events.get(userId)!;
    userEvents.push(event);

    // Prune events outside window
    const cutoff = Date.now() - WINDOW_MS;
    const pruned = userEvents.filter((e) => e.timestamp > cutoff);
    this.events.set(userId, pruned);

    // Re-analyze after every 10 events
    if (pruned.length % 10 === 0) {
      this.analyze(userId);
    }
  }

  /** Force analysis and return current patterns */
  analyze(userId: string): InferredPattern[] {
    const events = this.events.get(userId) || [];
    if (events.length < MIN_SAMPLES) return this.patterns.get(userId) || [];

    const existing = this.patterns.get(userId) || [];
    const preservedState = new Map(existing.map((p) => [p.id, { dismissed: p.dismissed, confirmed: p.confirmed }]));

    const newPatterns: InferredPattern[] = [
      ...this.detectTimePatterns(events),
      ...this.detectNavigationPatterns(events),
      ...this.detectApprovalPatterns(events),
      ...this.detectDensityPatterns(events),
      ...this.detectCommunicationPatterns(events),
    ];

    // Restore dismissed/confirmed state
    for (const p of newPatterns) {
      const prev = preservedState.get(p.id);
      if (prev) {
        p.dismissed = prev.dismissed;
        p.confirmed = prev.confirmed;
      }
    }

    this.patterns.set(userId, newPatterns);
    return newPatterns;
  }

  /** Get all current inferred patterns for a user */
  getPatterns(userId: string): InferredPattern[] {
    return this.patterns.get(userId) || [];
  }

  /** Get only high-confidence, non-dismissed patterns */
  getActionablePatterns(userId: string): InferredPattern[] {
    return this.getPatterns(userId).filter(
      (p) => p.confidence >= HIGH_CONFIDENCE && !p.dismissed
    );
  }

  /** User confirms a pattern — promotes it to explicit preference */
  confirmPattern(userId: string, patternId: string): void {
    const patterns = this.patterns.get(userId) || [];
    const p = patterns.find((x) => x.id === patternId);
    if (p) p.confirmed = true;
  }

  /** User dismisses a pattern — suppresses future inference */
  dismissPattern(userId: string, patternId: string): void {
    const patterns = this.patterns.get(userId) || [];
    const p = patterns.find((x) => x.id === patternId);
    if (p) p.dismissed = true;
  }

  /** Flush patterns to persistence layer */
  flush(userId: string): void {
    const patterns = this.patterns.get(userId) || [];
    for (const cb of this.flushCallbacks) {
      cb(userId, patterns);
    }
  }

  /** Clear all data for a user */
  clear(userId: string): void {
    this.events.delete(userId);
    this.patterns.delete(userId);
  }

  // ─── Pattern Detectors ───────────────────────────────────

  private detectTimePatterns(events: BehavioralEvent[]): InferredPattern[] {
    const results: InferredPattern[] = [];
    const hourBuckets = new Array(24).fill(0) as number[];

    for (const e of events) {
      const hour = new Date(e.timestamp).getHours();
      hourBuckets[hour]++;
    }

    // Peak activity hours
    const total = events.length;
    const morningActivity = hourBuckets.slice(6, 12).reduce((a, b) => a + b, 0);
    const eveningActivity = hourBuckets.slice(18, 23).reduce((a, b) => a + b, 0);

    if (morningActivity > eveningActivity * 1.5) {
      const confidence = this.calcConfidence(morningActivity, total, 0.7);
      results.push({
        id: "time-preference-morning",
        dimension: "schedule.peakHours",
        label: "Most active in the morning (6 AM – 12 PM)",
        inferredValue: "morning",
        confidence,
        sampleCount: morningActivity,
        consistencyRatio: morningActivity / total,
        source: "Activity Timing",
        firstSeen: events[0]?.timestamp || Date.now(),
        lastSeen: Date.now(),
        dismissed: false,
        confirmed: false,
      });
    } else if (eveningActivity > morningActivity * 1.5) {
      const confidence = this.calcConfidence(eveningActivity, total, 0.7);
      results.push({
        id: "time-preference-evening",
        dimension: "schedule.peakHours",
        label: "Most active in the evening (6 PM – 11 PM)",
        inferredValue: "evening",
        confidence,
        sampleCount: eveningActivity,
        consistencyRatio: eveningActivity / total,
        source: "Activity Timing",
        firstSeen: events[0]?.timestamp || Date.now(),
        lastSeen: Date.now(),
        dismissed: false,
        confirmed: false,
      });
    }

    // Detect quiet hours
    const nightActivity = hourBuckets.slice(22, 24).reduce((a, b) => a + b, 0) +
      hourBuckets.slice(0, 6).reduce((a, b) => a + b, 0);
    if (nightActivity < total * 0.05 && total > 20) {
      results.push({
        id: "quiet-hours-detected",
        dimension: "schedule.quietHours",
        label: "Rarely active 10 PM – 6 AM (quiet hours candidate)",
        inferredValue: { start: 22, end: 6 },
        confidence: this.calcConfidence(total - nightActivity, total, 0.9),
        sampleCount: total,
        consistencyRatio: 1 - nightActivity / total,
        source: "Activity Timing",
        firstSeen: events[0]?.timestamp || Date.now(),
        lastSeen: Date.now(),
        dismissed: false,
        confirmed: false,
      });
    }

    return results;
  }

  private detectNavigationPatterns(events: BehavioralEvent[]): InferredPattern[] {
    const results: InferredPattern[] = [];
    const navEvents = events.filter((e) => e.type === "navigation");
    if (navEvents.length < MIN_SAMPLES) return results;

    // Surface frequency
    const surfaceCount = new Map<string, number>();
    for (const e of navEvents) {
      surfaceCount.set(e.surface, (surfaceCount.get(e.surface) || 0) + 1);
    }

    const sorted = [...surfaceCount.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const [topSurface, topCount] = sorted[0];
      const ratio = topCount / navEvents.length;
      if (ratio > 0.25) {
        results.push({
          id: `nav-primary-${topSurface}`,
          dimension: "navigation.primarySurface",
          label: `Most visited surface: ${topSurface}`,
          inferredValue: topSurface,
          confidence: this.calcConfidence(topCount, navEvents.length, ratio),
          sampleCount: topCount,
          consistencyRatio: ratio,
          source: "Navigation History",
          firstSeen: navEvents[0]?.timestamp || Date.now(),
          lastSeen: Date.now(),
          dismissed: false,
          confirmed: false,
        });
      }
    }

    // First-surface-of-session detection
    const sessions = this.groupIntoSessions(navEvents);
    const firstSurface = new Map<string, number>();
    for (const session of sessions) {
      const first = session[0]?.surface;
      if (first) firstSurface.set(first, (firstSurface.get(first) || 0) + 1);
    }

    const sortedFirst = [...firstSurface.entries()].sort((a, b) => b[1] - a[1]);
    if (sortedFirst.length > 0 && sessions.length >= MIN_SAMPLES) {
      const [surface, count] = sortedFirst[0];
      const ratio = count / sessions.length;
      if (ratio > 0.4) {
        results.push({
          id: `nav-first-surface-${surface}`,
          dimension: "navigation.firstSurface",
          label: `Usually starts sessions on ${surface}`,
          inferredValue: surface,
          confidence: this.calcConfidence(count, sessions.length, ratio),
          sampleCount: count,
          consistencyRatio: ratio,
          source: "Session Analysis",
          firstSeen: navEvents[0]?.timestamp || Date.now(),
          lastSeen: Date.now(),
          dismissed: false,
          confirmed: false,
        });
      }
    }

    return results;
  }

  private detectApprovalPatterns(events: BehavioralEvent[]): InferredPattern[] {
    const results: InferredPattern[] = [];
    const approvals = events.filter((e) => e.type === "approval");
    if (approvals.length < MIN_SAMPLES) return results;

    // Auto-approve threshold detection
    const amounts = approvals
      .map((e) => e.metadata.amount as number)
      .filter((a) => typeof a === "number" && !isNaN(a));

    if (amounts.length >= MIN_SAMPLES) {
      const sorted = [...amounts].sort((a, b) => a - b);
      const p75 = sorted[Math.floor(sorted.length * 0.75)];
      const allUnderThreshold = amounts.filter((a) => a <= p75).length;
      const ratio = allUnderThreshold / amounts.length;

      results.push({
        id: "approval-auto-threshold",
        dimension: "trust.autoApproveThreshold",
        label: `Approves amounts under $${p75} without hesitation`,
        inferredValue: p75,
        confidence: this.calcConfidence(allUnderThreshold, amounts.length, ratio),
        sampleCount: amounts.length,
        consistencyRatio: ratio,
        source: "Approval History",
        firstSeen: approvals[0]?.timestamp || Date.now(),
        lastSeen: Date.now(),
        dismissed: false,
        confirmed: false,
      });
    }

    // Speed of approval — fast approver detection
    const reviewTimes = approvals
      .map((e) => e.metadata.reviewTimeMs as number)
      .filter((t) => typeof t === "number" && !isNaN(t));

    if (reviewTimes.length >= MIN_SAMPLES) {
      const avgReview = reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length;
      if (avgReview < 5000) {
        results.push({
          id: "approval-fast-reviewer",
          dimension: "trust.reviewSpeed",
          label: "Quick decision-maker — reviews in under 5 seconds on average",
          inferredValue: "fast",
          confidence: this.calcConfidence(reviewTimes.length, reviewTimes.length, 0.8),
          sampleCount: reviewTimes.length,
          consistencyRatio: 0.8,
          source: "Approval Timing",
          firstSeen: approvals[0]?.timestamp || Date.now(),
          lastSeen: Date.now(),
          dismissed: false,
          confirmed: false,
        });
      }
    }

    return results;
  }

  private detectDensityPatterns(events: BehavioralEvent[]): InferredPattern[] {
    const results: InferredPattern[] = [];
    const dwellEvents = events.filter((e) => e.type === "dwell" && typeof e.metadata.scrollDepth === "number");
    if (dwellEvents.length < MIN_SAMPLES) return results;

    const avgScroll = dwellEvents.reduce(
      (acc, e) => acc + (e.metadata.scrollDepth as number), 0
    ) / dwellEvents.length;

    let densityPref: string;
    if (avgScroll < 0.3) densityPref = "minimal";
    else if (avgScroll < 0.7) densityPref = "balanced";
    else densityPref = "detailed";

    results.push({
      id: "density-preference",
      dimension: "display.contentDensity",
      label: `Prefers ${densityPref} content density (avg scroll: ${Math.round(avgScroll * 100)}%)`,
      inferredValue: densityPref,
      confidence: this.calcConfidence(dwellEvents.length, 20, avgScroll < 0.3 || avgScroll > 0.7 ? 0.8 : 0.6),
      sampleCount: dwellEvents.length,
      consistencyRatio: avgScroll < 0.3 || avgScroll > 0.7 ? 0.8 : 0.6,
      source: "Scroll Behavior",
      firstSeen: dwellEvents[0]?.timestamp || Date.now(),
      lastSeen: Date.now(),
      dismissed: false,
      confirmed: false,
    });

    return results;
  }

  private detectCommunicationPatterns(events: BehavioralEvent[]): InferredPattern[] {
    const results: InferredPattern[] = [];
    const advisorEvents = events.filter((e) => e.type === "advisor-interaction");
    if (advisorEvents.length < MIN_SAMPLES) return results;

    // Message length preference
    const lengths = advisorEvents
      .map((e) => e.metadata.messageLength as number)
      .filter((l) => typeof l === "number");

    if (lengths.length >= MIN_SAMPLES) {
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      let style: string;
      if (avg < 30) style = "direct";
      else if (avg < 100) style = "balanced";
      else style = "detailed";

      results.push({
        id: "communication-style",
        dimension: "communication.style",
        label: `Communication style: ${style} (avg ${Math.round(avg)} chars)`,
        inferredValue: style,
        confidence: this.calcConfidence(lengths.length, 15, 0.7),
        sampleCount: lengths.length,
        consistencyRatio: 0.7,
        source: "Advisor Interactions",
        firstSeen: advisorEvents[0]?.timestamp || Date.now(),
        lastSeen: Date.now(),
        dismissed: false,
        confirmed: false,
      });
    }

    return results;
  }

  // ─── Utilities ───────────────────────────────────────────

  private calcConfidence(sampleCount: number, requiredSamples: number, consistencyRatio: number): number {
    return Math.min(1, sampleCount / Math.max(requiredSamples, MIN_SAMPLES)) * consistencyRatio;
  }

  private groupIntoSessions(events: BehavioralEvent[], gapMs = 30 * 60 * 1000): BehavioralEvent[][] {
    if (events.length === 0) return [];
    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const sessions: BehavioralEvent[][] = [[sorted[0]]];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].timestamp - sorted[i - 1].timestamp > gapMs) {
        sessions.push([sorted[i]]);
      } else {
        sessions[sessions.length - 1].push(sorted[i]);
      }
    }

    return sessions;
  }
}

export const createBehavioralLearningEngine = () => new BehavioralLearningEngine();

