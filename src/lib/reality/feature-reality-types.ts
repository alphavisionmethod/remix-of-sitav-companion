// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Reality Types
// Anti-drift: every feature must declare its honest reality state.
// ═══════════════════════════════════════════════════════════════

import type { BoundedContextId } from "@/lib/architecture/bounded-context-types";

export type RealityState =
  | "real"          // production implementation, real backend, real data
  | "simulated"     // visible UX backed by simulation/mock — must be banner-marked
  | "degraded"      // available with reduced functionality
  | "unsupported"   // surface cannot host this feature — must not appear
  | "roadmap";      // planned, not yet implemented

export type SurfaceId =
  | "web"
  | "electron"
  | "appliance"
  | "ios"
  | "android"
  | "mobile-pwa"
  | "admin";

export interface FeatureRealityEntry {
  readonly featureId: string;
  readonly featureName: string;
  readonly contextId: BoundedContextId;
  readonly perSurface: Readonly<Record<SurfaceId, RealityState>>;
  readonly evidence: readonly string[]; // file paths proving the claim
  readonly notes?: string;
}

export interface FeatureRealityCoverageReport {
  readonly checkedAt: string;
  readonly featureCount: number;
  readonly realPct: number;
  readonly simulatedPct: number;
  readonly issues: readonly { featureId: string; reason: string }[];
  readonly ok: boolean;
}
