// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Secret Rotation Cadence Registry
// Authoritative per-class rotation policy. Read by:
//   • emit-secret-rotation-status.ts (status emitter)
//   • check-secret-rotation-cadence.ts (BLOCK validator — policy completeness)
//   • check-secret-rotation-freshness.ts (BLOCK validator — DB-backed freshness)
//   • SecurityAndPortabilityTruthPanel (live UI)
// Honest classification of control-plane-blocked classes (auth/storage).
// ═══════════════════════════════════════════════════════════════

export type SecretClass =
  | "push"
  | "comms"
  | "ai"
  | "auth"
  | "storage"
  | "webhook-signing"
  | "attestation-signing"
  | "audit-export-hmac";

export type AlertSeverity = "info" | "warn" | "error" | "critical";

export interface SecretCadencePolicy {
  /** Canonical class identifier. */
  class: SecretClass;
  /** Standard rotation interval in days. */
  intervalDays: number;
  /** Days past intervalDays before the class is considered overdue. */
  staleThresholdDays: number;
  /** Primary owner role responsible for rotation. */
  ownerRole: string;
  /** Backup owner if primary is unavailable. */
  backupOwnerRole: string;
  /** Severity raised when this class becomes overdue. */
  alertSeverity: AlertSeverity;
  /** Concrete secret names belonging to this class. */
  secretNames: readonly string[];
  /** True when rotation is owned by an external control plane (no in-app proof possible). */
  controlPlaneBlocked: boolean;
  /** Human description of why rotation matters. */
  rationale: string;
}

export const SECRET_ROTATION_CADENCE: Readonly<Record<SecretClass, SecretCadencePolicy>> = {
  push: {
    class: "push",
    intervalDays: 90,
    staleThresholdDays: 14,
    ownerRole: "platform-security",
    backupOwnerRole: "ops-on-call",
    alertSeverity: "warn",
    secretNames: ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"],
    controlPlaneBlocked: false,
    rationale: "Web Push private keys gate every browser-delivered notification. Rotate quarterly.",
  },
  comms: {
    class: "comms",
    intervalDays: 180,
    staleThresholdDays: 21,
    ownerRole: "platform-security",
    backupOwnerRole: "ops-on-call",
    alertSeverity: "warn",
    secretNames: ["TWILIO_AUTH_TOKEN", "TWILIO_ACCOUNT_SID", "TWILIO_PHONE_NUMBER"],
    controlPlaneBlocked: false,
    rationale: "Twilio auth tokens authenticate every outbound SMS / voice call.",
  },
  ai: {
    class: "ai",
    intervalDays: 90,
    staleThresholdDays: 14,
    ownerRole: "ai-ops",
    backupOwnerRole: "platform-security",
    alertSeverity: "warn",
    secretNames: ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "LOVABLE_API_KEY"],
    controlPlaneBlocked: false,
    rationale: "AI provider keys directly meter cost and gate every AI call.",
  },
  auth: {
    class: "auth",
    intervalDays: 365,
    staleThresholdDays: 60,
    ownerRole: "lovable-cloud-control-plane",
    backupOwnerRole: "lovable-cloud-control-plane",
    alertSeverity: "info",
    secretNames: ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY"],
    controlPlaneBlocked: true,
    rationale:
      "Auth signing keys are managed by the Lovable Cloud control plane. Rotation requires a control-plane key-rotation operation; this class is honest WARN-tier (control-plane-blocked).",
  },
  storage: {
    class: "storage",
    intervalDays: 365,
    staleThresholdDays: 60,
    ownerRole: "lovable-cloud-control-plane",
    backupOwnerRole: "lovable-cloud-control-plane",
    alertSeverity: "info",
    secretNames: ["SUPABASE_DB_URL"],
    controlPlaneBlocked: true,
    rationale:
      "Database connection strings are control-plane-issued. Honest WARN-tier (control-plane-blocked).",
  },
  "webhook-signing": {
    class: "webhook-signing",
    intervalDays: 90,
    staleThresholdDays: 14,
    ownerRole: "platform-security",
    backupOwnerRole: "ai-ops",
    alertSeverity: "error",
    secretNames: ["WEBHOOK_SIGNING_SECRET"],
    controlPlaneBlocked: false,
    rationale: "HMAC secret authenticates every external workforce / federation webhook.",
  },
  "attestation-signing": {
    class: "attestation-signing",
    intervalDays: 180,
    staleThresholdDays: 30,
    ownerRole: "platform-security",
    backupOwnerRole: "compliance",
    alertSeverity: "error",
    secretNames: ["ATTESTATION_SIGNING_KEY"],
    controlPlaneBlocked: false,
    rationale: "Signs sealed compliance / attestation packets — compromise breaks audit chain.",
  },
  "audit-export-hmac": {
    class: "audit-export-hmac",
    intervalDays: 180,
    staleThresholdDays: 30,
    ownerRole: "platform-security",
    backupOwnerRole: "compliance",
    alertSeverity: "error",
    secretNames: ["AUDIT_EXPORT_HMAC_KEY"],
    controlPlaneBlocked: false,
    rationale: "HMAC chains immutable audit exports — every block must be verifiable.",
  },
} as const;

export const SECRET_CLASSES = Object.keys(SECRET_ROTATION_CADENCE) as SecretClass[];

/** Map a concrete secret name back to its canonical class. */
export function classifySecret(name: string): SecretClass | null {
  for (const policy of Object.values(SECRET_ROTATION_CADENCE)) {
    if (policy.secretNames.includes(name)) return policy.class;
  }
  return null;
}

/** Compute when the next rotation is due, given the last rotation timestamp. */
export function computeCadenceDueAt(secretClass: SecretClass, lastRotatedAt: Date): Date {
  const policy = SECRET_ROTATION_CADENCE[secretClass];
  const due = new Date(lastRotatedAt.getTime());
  due.setUTCDate(due.getUTCDate() + policy.intervalDays);
  return due;
}

/** Compute days-until-due (negative = overdue). */
export function daysUntilDue(dueAt: Date, now: Date = new Date()): number {
  return Math.floor((dueAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}
