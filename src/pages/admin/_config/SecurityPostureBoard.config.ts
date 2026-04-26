// ═══════════════════════════════════════════════════════════════
// SecurityPostureBoard — UI catalog (Wave 9.2)
//
// Authored truth catalogs for posture display. Live posture comes
// from useSecurityFabric(); this file provides the operator-facing
// reference data (secret rotation policy, classification matrix,
// key rotation schedule) that does not change per-tenant.
// ═══════════════════════════════════════════════════════════════

export type SecretStatus = "verified" | "unverified" | "expired";
export type RotationStatus = "on-schedule" | "due-soon" | "overdue";
export type EncryptionLevel = "full" | "partial" | "none";
export type ClassificationLevel = "PII" | "PHI" | "Sensitive" | "Internal" | "Compliance";

export interface SecretEntry {
  name: string;
  status: SecretStatus;
  rotatedAt: string;
  expiresAt: string;
  scope: string;
}

export interface ClassificationEntry {
  domain: string;
  classification: ClassificationLevel;
  tables: string[];
  protectionLevel: string;
  lastAudit: string;
}

export interface KeyRotationEntry {
  key: string;
  lastRotated: string;
  nextRotation: string;
  status: RotationStatus;
}

export interface DomainPosture {
  domain: string;
  encryption: EncryptionLevel;
  rlsEnabled: boolean;
  secretsIntegrity: SecretStatus;
  sensitiveData: boolean;
  lastVerified: string;
  gaps: string[];
}

export const ENCRYPTION_BADGE: Record<EncryptionLevel, string> = {
  full: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  partial: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  none: "text-red-500 bg-red-500/10 border-red-500/20",
};

export const SECRET_BADGE: Record<SecretStatus, string> = {
  verified: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  unverified: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  expired: "text-red-500 bg-red-500/10 border-red-500/20",
};

/** Authored secret rotation registry. */
export const SECRET_REGISTRY: SecretEntry[] = [
  { name: "SUPABASE_SERVICE_ROLE_KEY", status: "verified", rotatedAt: "2026-03-20", expiresAt: "2027-03-20", scope: "platform" },
  { name: "OPENAI_API_KEY", status: "verified", rotatedAt: "2026-04-01", expiresAt: "2027-04-01", scope: "ai-gateway" },
  { name: "VAPID_PRIVATE_KEY", status: "verified", rotatedAt: "2026-02-15", expiresAt: "2027-02-15", scope: "notifications" },
  { name: "TWILIO_AUTH_TOKEN", status: "unverified", rotatedAt: "2025-12-01", expiresAt: "2026-06-01", scope: "communications" },
  { name: "ANTHROPIC_API_KEY", status: "verified", rotatedAt: "2026-03-28", expiresAt: "2027-03-28", scope: "ai-gateway" },
];

/** Authored data classification matrix. */
export const CLASSIFICATION_MATRIX: ClassificationEntry[] = [
  { domain: "User Profiles", classification: "PII", tables: ["profiles", "user_preferences"], protectionLevel: "encrypted", lastAudit: "2026-04-01" },
  { domain: "Financial Data", classification: "Sensitive", tables: ["invoices", "transactions", "revenue_records"], protectionLevel: "encrypted+rls", lastAudit: "2026-04-03" },
  { domain: "Health Signals", classification: "PHI", tables: ["health_metrics", "wellness_scores"], protectionLevel: "encrypted+rls+audit", lastAudit: "2026-03-28" },
  { domain: "AI Inference", classification: "Internal", tables: ["ai_inference_receipts", "ai_cost_ledger"], protectionLevel: "rls", lastAudit: "2026-04-02" },
  { domain: "Audit Logs", classification: "Compliance", tables: ["audit_logs", "agent_action_receipts"], protectionLevel: "immutable+encrypted", lastAudit: "2026-04-05" },
];

/** Authored key rotation schedule. */
export const KEY_ROTATION_SCHEDULE: KeyRotationEntry[] = [
  { key: "DB Encryption Key", lastRotated: "2026-03-15", nextRotation: "2026-06-15", status: "on-schedule" },
  { key: "JWT Signing Key", lastRotated: "2026-04-01", nextRotation: "2026-07-01", status: "on-schedule" },
  { key: "VAPID Keys", lastRotated: "2026-02-15", nextRotation: "2026-05-15", status: "due-soon" },
  { key: "Service Role Key", lastRotated: "2026-03-20", nextRotation: "2026-06-20", status: "on-schedule" },
];

/** Authored per-domain posture baseline. Overlaid by useSecurityFabric() at render time. */
export const DOMAIN_POSTURE_BASELINE: DomainPosture[] = [
  { domain: "Business OS", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: true, lastVerified: "2026-04-10T09:30:00Z", gaps: [] },
  { domain: "Finance OS", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: true, lastVerified: "2026-04-10T09:28:00Z", gaps: [] },
  { domain: "Concierge OS", encryption: "full", rlsEnabled: true, secretsIntegrity: "unverified", sensitiveData: false, lastVerified: "2026-04-10T08:15:00Z", gaps: ["Booking-flow receipt linkage incomplete"] },
  { domain: "Admin Control Plane", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: true, lastVerified: "2026-04-10T09:32:00Z", gaps: [] },
  { domain: "AI Gateway", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: false, lastVerified: "2026-04-10T09:31:00Z", gaps: [] },
  { domain: "Connector Control", encryption: "partial", rlsEnabled: true, secretsIntegrity: "unverified", sensitiveData: false, lastVerified: "2026-04-10T08:45:00Z", gaps: ["3 connectors missing token-rotation receipts"] },
];