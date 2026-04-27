// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust / Security Production-Truth Manifest (Phase 6.2)
//
// Single source of truth for the production state of every Trust
// page under src/platform/trust/pages/. Mirrors the Business /
// Concierge / Finance manifests in shape and semantics.
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

export const TRUST_TRUTH_MANIFEST: ReadonlyArray<PageTruthEntry> = [
  { page: "TrustHome",                subdir: "", state: "degraded",   degradedReason: "Trust pillar landing tiles — IA descriptor; child pages own their own data wiring.",       bannerState: "partial" },
  { page: "TrustCenter",              subdir: "", state: "fully-wired", sources: ["receipts pipeline", "approval_requests"], bannerState: "live" },
  { page: "ApprovalChamber",          subdir: "", state: "fully-wired", sources: ["useApprovalQueue", "approval_requests"],  bannerState: "live" },
  { page: "ApprovalsCenter",          subdir: "", state: "fully-wired", sources: ["useApprovalQueue"],                       bannerState: "live" },
  { page: "PermissionsCenter",        subdir: "", state: "fully-wired", sources: ["usePermissions", "user_roles"],           bannerState: "live" },
  { page: "PolicyEditor",             subdir: "", state: "fully-wired", sources: ["usePolicyDoc", "policy_documents"],       bannerState: "live" },
  { page: "PolicySimulatorHub",       subdir: "", state: "fully-wired", sources: ["usePolicySimulator"],                     bannerState: "live" },
  { page: "ProofCenter",              subdir: "", state: "fully-wired", sources: ["useReceipts", "ai_action_receipts"],      bannerState: "live" },
  { page: "TrustApprovals",           subdir: "", state: "fully-wired", sources: ["useApprovalQueue"],                       bannerState: "live" },
  { page: "TrustAudit",               subdir: "", state: "fully-wired", sources: ["useAuditLog", "admin_action_audit"],      bannerState: "live" },
  { page: "TrustAutomationAuthority", subdir: "", state: "fully-wired", sources: ["useAutomationAuthority", "advisor_autonomy_policies"], bannerState: "live" },
  { page: "TrustReceipts",            subdir: "", state: "degraded",   degradedReason: "Legacy bridge page — canonical receipts viewer lives in ProofCenter; left as honest pointer.", bannerState: "partial" },
  { page: "TrustCoverage",            subdir: "", state: "degraded",   degradedReason: "Coverage map source not yet wired; renders honest setup-required state.",                bannerState: "partial" },
  { page: "TrustDecisions",           subdir: "", state: "degraded",   degradedReason: "Architectural ownership map is an IA descriptor; live decision-events pipeline TBD.",     bannerState: "partial" },
  { page: "TrustPermissions",         subdir: "", state: "degraded",   degradedReason: "Legacy bridge page — canonical permissions UI lives in PermissionsCenter.",              bannerState: "partial" },
] as const;

export function getTruthEntry(page: string): PageTruthEntry | undefined {
  return TRUST_TRUTH_MANIFEST.find((e) => e.page === page);
}
export function getPagesByState(state: TruthState): ReadonlyArray<PageTruthEntry> {
  return TRUST_TRUTH_MANIFEST.filter((e) => e.state === state);
}
export function summarizeManifest() {
  const total = TRUST_TRUTH_MANIFEST.length;
  const fullyWired = getPagesByState("fully-wired").length;
  const degraded = getPagesByState("degraded").length;
  const hidden = getPagesByState("hidden").length;
  return { total, fullyWired, degraded, hidden };
}