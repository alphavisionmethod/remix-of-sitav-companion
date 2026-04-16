// ═══════════════════════════════════════════════════════════════
// SITA OS — Web Release Barrel (Phase 13)
// ═══════════════════════════════════════════════════════════════

export {
  WEB_DEPLOYABILITY_READINESS,
  webReadinessSummary,
} from "./web-deployability-readiness";
export type {
  WebReadinessItem,
  WebReadinessStatus,
  WebReadinessSummary,
} from "./web-deployability-readiness";

export {
  MIN_BROWSER_VERSION,
  checkMinBrowserVersion,
} from "./web-runtime-min-contract";
export type {
  MinBrowserVersion,
  BrowserCheckResult,
} from "./web-runtime-min-contract";
