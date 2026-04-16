// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Feature Classification Map
// Per-mobile-feature tier, parity, owner. Used by audits + admin.
// ═══════════════════════════════════════════════════════════════

import type { ParityStatus } from "../runtime/mobile-parity-resolver";

export interface MobileFeatureClassification {
  featureId: string;
  /** Mobile route(s) where this feature lives. */
  routes: ReadonlyArray<string>;
  parity: ParityStatus;
  owner: "boardroom" | "business" | "money" | "concierge" | "platform" | "system";
  /** Capabilities required from mobile-platform contracts. */
  requiredCapabilities: ReadonlyArray<string>;
  /** Honest note for launch-honesty surfaces. */
  note: string;
}

export const MOBILE_FEATURE_CLASSIFICATION: ReadonlyArray<MobileFeatureClassification> = [
  { featureId: "mobile.home",            routes: ["/mobile"],                           parity: "mobile-only",     owner: "platform",  requiredCapabilities: [],                                       note: "Calm pulse home." },
  { featureId: "mobile.approvals",       routes: ["/mobile/approvals", "/mobile/approval/:id"], parity: "full-parity", owner: "boardroom", requiredCapabilities: ["biometric.faceid", "biometric.fingerprint"], note: "Authority device." },
  { featureId: "mobile.boardroom",       routes: ["/mobile/boardroom"],                 parity: "degraded-parity", owner: "boardroom", requiredCapabilities: [],                                       note: "Read + light interaction." },
  { featureId: "mobile.proof",           routes: ["/mobile/proof", "/mobile/receipt/:id"], parity: "full-parity",  owner: "boardroom", requiredCapabilities: [],                                       note: "" },
  { featureId: "mobile.business",        routes: ["/mobile/business", "/mobile/capture"], parity: "degraded-parity", owner: "business", requiredCapabilities: ["permissions.camera"],                  note: "Quick capture." },
  { featureId: "mobile.money",           routes: ["/mobile/money", "/mobile/investment"], parity: "degraded-parity", owner: "money",    requiredCapabilities: [],                                       note: "" },
  { featureId: "mobile.concierge",       routes: ["/mobile/concierge"],                 parity: "full-parity",     owner: "concierge", requiredCapabilities: [],                                       note: "" },
  { featureId: "mobile.alerts",          routes: ["/mobile/alerts", "/mobile/notifications"], parity: "degraded-parity", owner: "system", requiredCapabilities: ["push.web"],                          note: "APNs deferred, FCM planned." },
  { featureId: "mobile.emergency",       routes: ["/mobile/emergency"],                 parity: "mobile-only",     owner: "system",    requiredCapabilities: ["biometric.faceid", "biometric.fingerprint"], note: "Mobile-first authority surface." },
  { featureId: "mobile.device-trust",    routes: ["/mobile/device-trust"],              parity: "mobile-only",     owner: "system",    requiredCapabilities: ["device-trust.attestation"],             note: "Native trust surface." },
  { featureId: "mobile.sync",            routes: ["/mobile/sync"],                      parity: "full-parity",     owner: "platform",  requiredCapabilities: ["offline.durable-queue"],                note: "" },
  { featureId: "mobile.settings",        routes: ["/mobile/settings", "/mobile/more"],  parity: "full-parity",     owner: "platform",  requiredCapabilities: [],                                       note: "" },
  { featureId: "mobile.ai-chat",         routes: ["/mobile/ai-chat"],                   parity: "full-parity",     owner: "platform",  requiredCapabilities: [],                                       note: "" },
  { featureId: "mobile.system-monitor",  routes: ["/mobile/system-monitor"],            parity: "degraded-parity", owner: "system",    requiredCapabilities: [],                                       note: "Read-only." },
  { featureId: "mobile.command",         routes: ["/mobile/command"],                   parity: "degraded-parity", owner: "system",    requiredCapabilities: [],                                       note: "" },
  { featureId: "mobile.timeline",        routes: ["/mobile/timeline"],                  parity: "degraded-parity", owner: "boardroom", requiredCapabilities: [],                                       note: "" },
  { featureId: "mobile.inbox",           routes: ["/mobile/inbox"],                     parity: "full-parity",     owner: "system",    requiredCapabilities: [],                                       note: "" },
  { featureId: "mobile.files",           routes: ["/mobile/files"],                     parity: "degraded-parity", owner: "system",    requiredCapabilities: ["permissions.photos"],                  note: "" },
] as const;
