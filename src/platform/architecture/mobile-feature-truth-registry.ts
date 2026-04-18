// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Feature Truth Registry
//
// Honest per-feature classification of every mobile surface.
// Single source of truth for:
//   - check-mobile-capability-truth.ts CI gate
//   - in-app MobileCapabilityBanner copy
//   - launcher/store readiness reports
//
// Do not mark a feature `live` unless it has real persistence
// + auth + working in offline + tested on iOS Safari & Android Chrome.
// ═══════════════════════════════════════════════════════════════

export type MobileCapabilityClass =
  | "live"             // Production-hard. Real persistence, auth, offline-safe.
  | "partial"          // Works, but has known gaps (documented in `gaps`).
  | "responsive-only"  // Visual mobile layout only — backed by web flow.
  | "mock"             // Placeholder data / UI shell.
  | "deferred";        // Scheduled for later — surface honest "Coming soon".

export interface MobileCapabilityEntry {
  /** Stable feature key. */
  featureKey: string;
  /** Display name in launcher / banner copy. */
  displayName: string;
  /** Page or component file (relative path). */
  surface: string;
  /** Truthful classification. */
  classification: MobileCapabilityClass;
  /** Specific known gaps when `partial`/`deferred`. */
  gaps: string[];
  /** Last verified date (ISO yyyy-mm-dd). Bump when status changes. */
  lastVerified: string;
}

export const MOBILE_FEATURE_TRUTH: MobileCapabilityEntry[] = [
  // ── Core mobile shell ──
  { featureKey: "mobile.home",         displayName: "Home",         surface: "src/pages/mobile/MobileHome.tsx",         classification: "partial",         gaps: ["pull-to-refresh stubbed"], lastVerified: "2026-04-18" },
  { featureKey: "mobile.command",      displayName: "Command",      surface: "src/pages/mobile/MobileCommand.tsx",      classification: "partial",         gaps: ["search wired only to local index"], lastVerified: "2026-04-18" },
  { featureKey: "mobile.settings",     displayName: "Settings",     surface: "src/pages/mobile/MobileSettings.tsx",     classification: "live",            gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.more",         displayName: "More",         surface: "src/pages/mobile/MobileMore.tsx",         classification: "responsive-only", gaps: [], lastVerified: "2026-04-18" },

  // ── Surfaces backed by real data ──
  { featureKey: "mobile.alerts",       displayName: "Alerts",       surface: "src/pages/mobile/MobileAlerts.tsx",       classification: "live",    gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.approvals",    displayName: "Approvals",    surface: "src/pages/mobile/MobileApprovals.tsx",    classification: "live",    gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.inbox",        displayName: "Inbox",        surface: "src/pages/mobile/MobileInbox.tsx",        classification: "partial", gaps: ["mobile push not delivered (transport deferred)"], lastVerified: "2026-04-18" },
  { featureKey: "mobile.proof",        displayName: "Proofs",       surface: "src/pages/mobile/MobileProof.tsx",        classification: "live",    gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.timeline",     displayName: "Timeline",     surface: "src/pages/mobile/MobileTimeline.tsx",     classification: "partial", gaps: ["large datasets not yet windowed"], lastVerified: "2026-04-18" },
  { featureKey: "mobile.notifications",displayName: "Notifications",surface: "src/pages/mobile/MobileNotificationCenter.tsx", classification: "partial", gaps: ["native push transport (APNs/FCM) deferred"], lastVerified: "2026-04-18" },

  // ── Feature surfaces ──
  { featureKey: "mobile.business",     displayName: "Business",     surface: "src/pages/mobile/MobileBusiness.tsx",     classification: "responsive-only", gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.money",        displayName: "Money",        surface: "src/pages/mobile/MobileMoney.tsx",        classification: "responsive-only", gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.investment",   displayName: "Investment",   surface: "src/pages/mobile/MobileInvestment.tsx",   classification: "responsive-only", gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.boardroom",    displayName: "Boardroom",    surface: "src/pages/mobile/MobileBoardroom.tsx",    classification: "responsive-only", gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.concierge",    displayName: "Concierge",    surface: "src/pages/mobile/MobileConcierge.tsx",    classification: "partial", gaps: ["voice input not wired on iOS"], lastVerified: "2026-04-18" },
  { featureKey: "mobile.ai-chat",      displayName: "AI Chat",      surface: "src/pages/mobile/MobileAIChat.tsx",       classification: "live",    gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.files",        displayName: "Files",        surface: "src/pages/mobile/MobileFiles.tsx",        classification: "partial", gaps: ["large file upload uses single-shot, not chunked"], lastVerified: "2026-04-18" },
  { featureKey: "mobile.quick-capture",displayName: "Quick Capture",surface: "src/pages/mobile/MobileQuickCapture.tsx", classification: "partial", gaps: ["camera capture works; OCR backend deferred"], lastVerified: "2026-04-18" },
  { featureKey: "mobile.receipt-detail",displayName:"Receipt Detail",surface: "src/pages/mobile/MobileReceiptDetail.tsx", classification: "live", gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.workflow-detail", displayName: "Workflow Detail", surface: "src/pages/mobile/MobileWorkflowDetail.tsx", classification: "live", gaps: [], lastVerified: "2026-04-18" },
  { featureKey: "mobile.approval-detail", displayName: "Approval Detail", surface: "src/pages/mobile/MobileApprovalDetail.tsx", classification: "live", gaps: [], lastVerified: "2026-04-18" },

  // ── Trust / system / sync ──
  { featureKey: "mobile.device-trust", displayName: "Device Trust", surface: "src/pages/mobile/MobileDeviceTrust.tsx",  classification: "deferred", gaps: ["WebAuthn enrollment flow not yet shipped"], lastVerified: "2026-04-18" },
  { featureKey: "mobile.sync-control", displayName: "Sync Control", surface: "src/pages/mobile/MobileSyncControl.tsx",  classification: "partial", gaps: ["queue persistence is in-memory; durable queue tracked separately"], lastVerified: "2026-04-18" },
  { featureKey: "mobile.system-monitor",displayName:"System Monitor",surface: "src/pages/mobile/MobileSystemMonitor.tsx",classification: "partial", gaps: ["read-only; no remote command yet"], lastVerified: "2026-04-18" },
  { featureKey: "mobile.emergency",    displayName: "Emergency",    surface: "src/pages/mobile/MobileEmergencyActions.tsx", classification: "live", gaps: [], lastVerified: "2026-04-18" },
];

/** Fast lookup. */
export const MOBILE_FEATURE_INDEX: Readonly<Record<string, MobileCapabilityEntry>> =
  Object.freeze(MOBILE_FEATURE_TRUTH.reduce((acc, e) => {
    acc[e.featureKey] = e;
    return acc;
  }, {} as Record<string, MobileCapabilityEntry>));

export function getMobileCapability(featureKey: string): MobileCapabilityEntry | undefined {
  return MOBILE_FEATURE_INDEX[featureKey];
}

export function isMobileCapabilityLive(featureKey: string): boolean {
  return getMobileCapability(featureKey)?.classification === "live";
}
