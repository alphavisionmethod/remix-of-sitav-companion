// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Parity Resolver
// Truth: which features claim parity with desktop/web vs degraded.
// ═══════════════════════════════════════════════════════════════

export type ParityStatus =
  | "full-parity"      // identical capability to desktop/web
  | "degraded-parity"  // works, but reduced UX
  | "mobile-only"      // only available on mobile
  | "unsupported";     // not on mobile

export interface ParityRecord {
  featureId: string;
  status: ParityStatus;
  /** Desktop/web equivalent for cross-reference. */
  desktopEquivalent: string | null;
  note: string;
}

export const MOBILE_PARITY_MAP: ReadonlyArray<ParityRecord> = [
  { featureId: "boardroom-view",       status: "degraded-parity", desktopEquivalent: "boardroom",       note: "Read + approve, no multi-window evidence pinning." },
  { featureId: "approvals",            status: "full-parity",     desktopEquivalent: "approvals",       note: "Swipe-to-approve mobile UX." },
  { featureId: "proof-receipts",       status: "full-parity",     desktopEquivalent: "proof-receipts",  note: "" },
  { featureId: "money-bills",          status: "degraded-parity", desktopEquivalent: "money",           note: "View + mark-paid; no bulk edit." },
  { featureId: "concierge-errands",    status: "full-parity",     desktopEquivalent: "concierge",       note: "" },
  { featureId: "ai-chat",              status: "full-parity",     desktopEquivalent: "ai-chat",         note: "" },
  { featureId: "files",                status: "degraded-parity", desktopEquivalent: "files",           note: "Browse + upload; no AI bulk operations." },
  { featureId: "system-monitor",       status: "degraded-parity", desktopEquivalent: "system-monitor",  note: "Read-only dashboards on mobile." },
  { featureId: "emergency-actions",    status: "mobile-only",     desktopEquivalent: null,              note: "Mobile-first authority device." },
  { featureId: "device-trust",         status: "mobile-only",     desktopEquivalent: null,              note: "Biometric + attestation are mobile-native." },
  { featureId: "push-notifications",   status: "degraded-parity", desktopEquivalent: "web-push",        note: "APNs deferred, FCM planned, web push active." },
  { featureId: "boardroom-presenter",  status: "unsupported",     desktopEquivalent: "boardroom-presenter", note: "Desktop-only presenter mode." },
  { featureId: "multi-window",         status: "unsupported",     desktopEquivalent: "multi-window",    note: "Desktop-only OS shell." },
] as const;

export function resolveParity(featureId: string): ParityRecord | undefined {
  return MOBILE_PARITY_MAP.find((r) => r.featureId === featureId);
}
