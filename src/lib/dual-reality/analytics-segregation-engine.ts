// ═══════════════════════════════════════════════════════════════
// SITA OS — Mode-Aware Analytics Tracker
// Full analytics segregation by mode, surface, capability
// ═══════════════════════════════════════════════════════════════

import type { RealityModeKey } from "../reality-mode-registry";
import type { SurfaceClass } from "../surface-class-registry";
import { classifyRoute } from "../surface-class-registry";
import { resolveMode } from "../reality-mode-resolver";

// ── Analytics Event Schema ──────────────────────────────────────

export interface SegregatedAnalyticsEvent {
  eventFamily: AnalyticsEventFamily;
  eventName: string;
  mode: RealityModeKey;
  surfaceClass: SurfaceClass;
  shell?: string;
  routeKey: string;
  capabilityKey?: string;
  providerSourceType?: string;
  launchHonestyClass?: string;
  actorType: "user" | "operator" | "internal_system";
  environment: "production" | "staging" | "development";
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export type AnalyticsEventFamily =
  | "route_view"
  | "ai_invocation"
  | "connector_interaction"
  | "approval_action"
  | "boardroom_generation"
  | "pulse_generation"
  | "demo_scenario_usage"
  | "admin_governance"
  | "capability_usage"
  | "side_effect_attempt";

// ── Analytics Bucket Rules ──────────────────────────────────────

const BUCKET_MAP: Record<RealityModeKey, string> = {
  real: "real",
  demo: "demo",
  sandbox: "discard",
  dev_demo: "internal_test",
};

const CONTAMINATION_RULES: Record<string, boolean> = {
  "demo→real": false,
  "internal_test→real": false,
  "internal_test→demo": false,
  "discard→real": false,
  "discard→demo": false,
};

// ── Event Buffer ────────────────────────────────────────────────

const eventBuffer: SegregatedAnalyticsEvent[] = [];
const FLUSH_INTERVAL = 10_000; // 10s
const MAX_BUFFER = 50;

let flushTimer: ReturnType<typeof setInterval> | null = null;

function startFlushTimer() {
  if (flushTimer) return;
  flushTimer = setInterval(() => flushEvents(), FLUSH_INTERVAL);
}

// ── Public API ──────────────────────────────────────────────────

export function trackSegregatedEvent(event: Omit<SegregatedAnalyticsEvent, "mode" | "surfaceClass" | "routeKey" | "timestamp" | "environment" | "actorType"> & {
  actorType?: "user" | "operator" | "internal_system";
}): void {
  const route = window.location.pathname;
  const resolution = resolveMode({ route });
  const classification = classifyRoute(route);

  const fullEvent: SegregatedAnalyticsEvent = {
    ...event,
    mode: resolution.mode,
    surfaceClass: classification.surfaceClass,
    routeKey: route,
    actorType: event.actorType ?? (classification.surfaceClass === "admin_os" ? "operator" : "user"),
    environment: import.meta.env.PROD ? "production" : "development",
    timestamp: new Date().toISOString(),
  };

  // Validate no contamination
  const bucket = BUCKET_MAP[fullEvent.mode];
  if (bucket !== "real" && CONTAMINATION_RULES[`${bucket}→real`] === false) {
    fullEvent.metadata = { ...fullEvent.metadata, _bucket: bucket, _segregated: true };
  }

  eventBuffer.push(fullEvent);
  startFlushTimer();

  if (eventBuffer.length >= MAX_BUFFER) {
    flushEvents();
  }
}

export function trackRouteView(route?: string): void {
  trackSegregatedEvent({
    eventFamily: "route_view",
    eventName: "page_view",
    capabilityKey: undefined,
  });
}

export function trackCapabilityUsage(capabilityKey: string, eventName: string, metadata?: Record<string, unknown>): void {
  trackSegregatedEvent({
    eventFamily: "capability_usage",
    eventName,
    capabilityKey,
    metadata,
  });
}

export function trackAIInvocation(capabilityKey: string, providerSource: string, metadata?: Record<string, unknown>): void {
  trackSegregatedEvent({
    eventFamily: "ai_invocation",
    eventName: "ai_call",
    capabilityKey,
    providerSourceType: providerSource,
    metadata,
  });
}

export function trackSideEffectAttempt(capabilityKey: string, allowed: boolean, reason: string): void {
  trackSegregatedEvent({
    eventFamily: "side_effect_attempt",
    eventName: allowed ? "side_effect_allowed" : "side_effect_blocked",
    capabilityKey,
    metadata: { allowed, reason },
  });
}

export function trackDemoScenarioUsage(scenarioKey: string, providerKey: string): void {
  trackSegregatedEvent({
    eventFamily: "demo_scenario_usage",
    eventName: "scenario_activated",
    metadata: { scenarioKey, providerKey },
  });
}

// ── Flush to Console / Future Backend ───────────────────────────

function flushEvents(): void {
  if (eventBuffer.length === 0) return;

  const events = eventBuffer.splice(0, eventBuffer.length);

  // Group by bucket
  const buckets: Record<string, SegregatedAnalyticsEvent[]> = {};
  for (const e of events) {
    const bucket = BUCKET_MAP[e.mode];
    if (!buckets[bucket]) buckets[bucket] = [];
    buckets[bucket].push(e);
  }

  // In development, log to console
  if (!import.meta.env.PROD) {
    for (const [bucket, bEvents] of Object.entries(buckets)) {
      console.debug(`[analytics:${bucket}]`, `${bEvents.length} events`, bEvents.map(e => e.eventName));
    }
  }

  // Future: POST to analytics endpoint with bucket segregation
}

// ── Contamination Detection ─────────────────────────────────────

export function detectContamination(events: SegregatedAnalyticsEvent[]): {
  contaminated: boolean;
  violations: Array<{ event: string; fromBucket: string; reason: string }>;
} {
  const violations: Array<{ event: string; fromBucket: string; reason: string }> = [];

  for (const e of events) {
    const bucket = BUCKET_MAP[e.mode];
    if (bucket !== "real" && !e.metadata?._segregated) {
      violations.push({
        event: e.eventName,
        fromBucket: bucket,
        reason: `Event from ${bucket} bucket missing segregation tag`,
      });
    }
  }

  return { contaminated: violations.length > 0, violations };
}

// ── Query Helpers ───────────────────────────────────────────────

export function getRealEventsOnly(events: SegregatedAnalyticsEvent[]): SegregatedAnalyticsEvent[] {
  return events.filter(e => e.mode === "real");
}

export function getDemoEventsOnly(events: SegregatedAnalyticsEvent[]): SegregatedAnalyticsEvent[] {
  return events.filter(e => e.mode === "demo" || e.mode === "dev_demo");
}

export function getAdminEventsOnly(events: SegregatedAnalyticsEvent[]): SegregatedAnalyticsEvent[] {
  return events.filter(e => e.surfaceClass === "admin_os");
}

export function getUserAppEventsOnly(events: SegregatedAnalyticsEvent[]): SegregatedAnalyticsEvent[] {
  return events.filter(e => e.surfaceClass === "user_app" || e.surfaceClass === "mobile_app");
}
