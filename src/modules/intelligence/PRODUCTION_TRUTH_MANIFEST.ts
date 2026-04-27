// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Production-Truth Manifest (Phase 6.4a)
//
// Single source of truth for the production state of every
// Intelligence page under src/platform/intelligence/pages/.
// ═══════════════════════════════════════════════════════════════

export type TruthState = "fully-wired" | "degraded" | "hidden";

export interface PageTruthEntry {
  page: string;
  subdir: "";
  state: TruthState;
  sources?: ReadonlyArray<string>;
  degradedReason?: string;
  hiddenReason?: string;
  bannerState?: "live" | "demo" | "partial" | "degraded" | "connecting";
}

export const INTELLIGENCE_TRUTH_MANIFEST: ReadonlyArray<PageTruthEntry> = [
  { page: "IntelligenceDashboard", subdir: "", state: "fully-wired", sources: ["useIntelligenceFeed", "ambient-context-engine"],  bannerState: "live" },
  { page: "DeviceMeshPanel",       subdir: "", state: "fully-wired", sources: ["useDeviceMesh", "device_mesh tables"],            bannerState: "live" },
  { page: "PrivacyControlCenter",  subdir: "", state: "fully-wired", sources: ["usePrivacyControls", "user_settings"],            bannerState: "live" },
] as const;

export function getTruthEntry(page: string): PageTruthEntry | undefined {
  return INTELLIGENCE_TRUTH_MANIFEST.find((e) => e.page === page);
}
export function getPagesByState(state: TruthState): ReadonlyArray<PageTruthEntry> {
  return INTELLIGENCE_TRUTH_MANIFEST.filter((e) => e.state === state);
}
export function summarizeManifest() {
  const total = INTELLIGENCE_TRUTH_MANIFEST.length;
  const fullyWired = getPagesByState("fully-wired").length;
  const degraded = getPagesByState("degraded").length;
  const hidden = getPagesByState("hidden").length;
  return { total, fullyWired, degraded, hidden };
}