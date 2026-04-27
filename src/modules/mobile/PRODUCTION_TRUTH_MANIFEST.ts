// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile App Production-Truth Manifest (Phase 6.3)
//
// Single source of truth for the production state of every Mobile
// page under src/platform/experience/pages/mobile/.
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

export const MOBILE_TRUTH_MANIFEST: ReadonlyArray<PageTruthEntry> = [
  // ── Wired (use real hooks / supabase / context) ───────────────
  { page: "MobileHome",                  subdir: "", state: "fully-wired", sources: ["useMobileHomePulse", "useMobileHomeQuickActions", "useMobileHomeActivity"], bannerState: "live" },
  { page: "MobileAlerts",                subdir: "", state: "fully-wired", sources: ["useMobileAlerts"],   bannerState: "live" },
  { page: "MobileApprovals",             subdir: "", state: "fully-wired", sources: ["useApprovalQueue"],  bannerState: "live" },
  { page: "MobileConcierge",             subdir: "", state: "fully-wired", sources: ["concierge mobile hooks"], bannerState: "live" },
  { page: "MobileFiles",                 subdir: "", state: "fully-wired", sources: ["useFiles namespace"], bannerState: "live" },
  { page: "MobileMoney",                 subdir: "", state: "fully-wired", sources: ["useMoneyOverview"],   bannerState: "live" },
  { page: "MobileProof",                 subdir: "", state: "fully-wired", sources: ["useReceipts"],        bannerState: "live" },
  { page: "MobileSettings",              subdir: "", state: "fully-wired", sources: ["useUserSettings"],    bannerState: "live" },
  { page: "MobileWorkflowDetail",        subdir: "", state: "fully-wired", sources: ["useWorkflow"],        bannerState: "live" },

  // ── Degraded (presentational shells / unwired pipelines) ──────
  { page: "MobileAIChat",                subdir: "", state: "degraded",   degradedReason: "Mobile chat surface — pipeline to AI gateway not yet wired into this page.", bannerState: "partial" },
  { page: "MobileApprovalDetail",        subdir: "", state: "degraded",   degradedReason: "Approval detail viewer renders from route params; full action pipeline TBD.", bannerState: "partial" },
  { page: "MobileBoardroom",             subdir: "", state: "degraded",   degradedReason: "Mobile boardroom shell — advisor council mobile feed not yet wired.",       bannerState: "partial" },
  { page: "MobileBusiness",              subdir: "", state: "degraded",   degradedReason: "Business pillar mobile shell — domain hooks not yet wired into this page.",  bannerState: "partial" },
  { page: "MobileBusinessAdvisorDetail", subdir: "", state: "degraded",   degradedReason: "Advisor detail mobile view — live advisor data pipeline TBD.",              bannerState: "partial" },
  { page: "MobileBusinessAdvisors",      subdir: "", state: "degraded",   degradedReason: "Mobile advisor list shell — live advisor registry pipeline TBD.",          bannerState: "partial" },
  { page: "MobileCommand",               subdir: "", state: "degraded",   degradedReason: "Mobile command palette — intent router pipeline not yet wired.",          bannerState: "partial" },
  { page: "MobileDeviceTrust",           subdir: "", state: "degraded",   degradedReason: "Device trust mobile shell — device attestation pipeline TBD.",             bannerState: "partial" },
  { page: "MobileEmergencyActions",      subdir: "", state: "degraded",   degradedReason: "Emergency actions mobile shell — runbook execution pipeline TBD.",         bannerState: "partial" },
  { page: "MobileInbox",                 subdir: "", state: "degraded",   degradedReason: "Mobile inbox shell — unified messaging pipeline not yet wired.",          bannerState: "partial" },
  { page: "MobileInvestment",            subdir: "", state: "degraded",   degradedReason: "Investment mobile shell — portfolio pipeline not yet wired.",              bannerState: "partial" },
  { page: "MobileMore",                  subdir: "", state: "degraded",   degradedReason: "More-menu IA descriptor; child pages own their own data wiring.",          bannerState: "partial" },
  { page: "MobileNotificationCenter",    subdir: "", state: "degraded",   degradedReason: "Notification center shell — push delivery pipeline TBD.",                  bannerState: "partial" },
  { page: "MobileQuickCapture",          subdir: "", state: "degraded",   degradedReason: "Quick-capture shell — capture-to-inbox pipeline not yet wired; demo categories gated.", bannerState: "partial" },
  { page: "MobileReceiptDetail",         subdir: "", state: "degraded",   degradedReason: "Receipt detail viewer — full receipt-graph navigation pipeline TBD.",      bannerState: "partial" },
  { page: "MobileSyncControl",           subdir: "", state: "degraded",   degradedReason: "Sync control shell — multi-device sync pipeline not yet wired.",           bannerState: "partial" },
  { page: "MobileSystemMonitor",         subdir: "", state: "degraded",   degradedReason: "System monitor shell — live telemetry pipeline not yet wired.",            bannerState: "partial" },
  { page: "MobileTimeline",              subdir: "", state: "degraded",   degradedReason: "Timeline shell — unified activity stream not yet wired.",                  bannerState: "partial" },
] as const;

export function getTruthEntry(page: string): PageTruthEntry | undefined {
  return MOBILE_TRUTH_MANIFEST.find((e) => e.page === page);
}
export function getPagesByState(state: TruthState): ReadonlyArray<PageTruthEntry> {
  return MOBILE_TRUTH_MANIFEST.filter((e) => e.state === state);
}
export function summarizeManifest() {
  const total = MOBILE_TRUTH_MANIFEST.length;
  const fullyWired = getPagesByState("fully-wired").length;
  const degraded = getPagesByState("degraded").length;
  const hidden = getPagesByState("hidden").length;
  return { total, fullyWired, degraded, hidden };
}