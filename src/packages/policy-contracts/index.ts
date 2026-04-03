// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Contracts (Barrel)
// ═══════════════════════════════════════════════════════════════

import type { PrivacyTier } from "../contracts";

// ── Truth Boundaries ─────────────────────────────────────────

export type RequiredSourceType = "deterministic" | "verified-external" | "canonical-record";

export interface TruthBoundaryRule {
  domain: string;
  field: string;
  requiredSource: RequiredSourceType;
  neverFromLLM: boolean;
  description: string;
}

export const TRUTH_BOUNDARIES: TruthBoundaryRule[] = [
  { domain: "finance", field: "tax-estimation", requiredSource: "deterministic", neverFromLLM: true, description: "Tax must use sovereign-calculation brackets" },
  { domain: "finance", field: "safe-to-spend", requiredSource: "deterministic", neverFromLLM: true, description: "Safe-to-spend is arithmetic only" },
  { domain: "finance", field: "account-balance", requiredSource: "verified-external", neverFromLLM: true, description: "Balances from connector sync only" },
  { domain: "finance", field: "reserve-calculation", requiredSource: "deterministic", neverFromLLM: true, description: "Reserve math is deterministic" },
  { domain: "finance", field: "invoice-aging", requiredSource: "deterministic", neverFromLLM: true, description: "Aging buckets are date arithmetic" },
  { domain: "finance", field: "burn-multiple", requiredSource: "deterministic", neverFromLLM: true, description: "Burn multiple is ratio calculation" },
  { domain: "business", field: "customer-record", requiredSource: "canonical-record", neverFromLLM: true, description: "Customer data from DB only" },
  { domain: "business", field: "invoice-record", requiredSource: "canonical-record", neverFromLLM: true, description: "Invoices from DB only" },
  { domain: "platform", field: "receipt-hash", requiredSource: "canonical-record", neverFromLLM: true, description: "Receipt hashes are immutable records" },
  { domain: "platform", field: "approval-decision", requiredSource: "canonical-record", neverFromLLM: true, description: "Approvals from DB only" },
];

// ── Contradiction Report ─────────────────────────────────────

export interface Contradiction {
  field: string;
  sourceA: string;
  valueA: string;
  sourceB: string;
  valueB: string;
  severity: "material" | "minor";
}

export interface ContradictionReport {
  contradictions: Contradiction[];
  recommendedDowngrade: string | null;
}

// ── Refusal State ────────────────────────────────────────────

export type DowngradeLevel = "none" | "caveat" | "low-confidence" | "refuse";

export interface RefusalState {
  refused: boolean;
  reason: string;
  nextSteps: string[];
  fallbackOutput?: string;
  downgradeLevel: DowngradeLevel;
}

// ── Connector Freshness ──────────────────────────────────────

export interface ConnectorFreshnessPolicy {
  connectorId: string;
  maxStalenessMs: number;
  onStale: "warn" | "degrade" | "block";
  affectedFields: string[];
  refreshStrategy: "auto" | "manual" | "scheduled";
}

export const CONNECTOR_FRESHNESS_POLICIES: ConnectorFreshnessPolicy[] = [
  { connectorId: "plaid", maxStalenessMs: 3600000, onStale: "warn", affectedFields: ["account-balance", "transactions"], refreshStrategy: "scheduled" },
  { connectorId: "google-calendar", maxStalenessMs: 1800000, onStale: "warn", affectedFields: ["calendar-events"], refreshStrategy: "auto" },
  { connectorId: "stripe", maxStalenessMs: 300000, onStale: "degrade", affectedFields: ["payment-status", "subscription-status"], refreshStrategy: "auto" },
];

// ── Sensitive Document Policy ────────────────────────────────

export interface SensitiveDocumentPolicy {
  documentType: string;
  triggers: string[]; // patterns that trigger sensitive classification
  privacyTier: PrivacyTier;
  memoryRetention: "session" | "24h" | "permanent-redacted";
  supportSafeRedaction: boolean;
  auditRequired: boolean;
}

export const SENSITIVE_DOCUMENT_POLICIES: SensitiveDocumentPolicy[] = [
  { documentType: "tax-return", triggers: ["SSN", "tax return", "1040", "W-2"], privacyTier: "restricted", memoryRetention: "permanent-redacted", supportSafeRedaction: true, auditRequired: true },
  { documentType: "medical-record", triggers: ["diagnosis", "prescription", "medical record", "HIPAA"], privacyTier: "restricted", memoryRetention: "session", supportSafeRedaction: true, auditRequired: true },
  { documentType: "bank-statement", triggers: ["account number", "routing number", "bank statement"], privacyTier: "confidential", memoryRetention: "24h", supportSafeRedaction: true, auditRequired: true },
  { documentType: "legal-document", triggers: ["contract", "agreement", "power of attorney", "will", "trust"], privacyTier: "confidential", memoryRetention: "permanent-redacted", supportSafeRedaction: true, auditRequired: true },
];

// ── Outbound Communication Policy ────────────────────────────

export interface OutboundCommunicationPolicy {
  type: "email" | "sms" | "phone" | "bulk";
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  requiresDualApproval: boolean;
  timeRestrictions: { startHour: number; endHour: number; timezone: "recipient" | "sender" };
  maxPerDay: number;
  cooldownMinutes: number;
  optOutCheckRequired: boolean;
}

export const OUTBOUND_POLICIES: OutboundCommunicationPolicy[] = [
  { type: "email", riskLevel: "low", requiresApproval: false, requiresDualApproval: false, timeRestrictions: { startHour: 8, endHour: 20, timezone: "recipient" }, maxPerDay: 50, cooldownMinutes: 0, optOutCheckRequired: true },
  { type: "sms", riskLevel: "medium", requiresApproval: true, requiresDualApproval: false, timeRestrictions: { startHour: 9, endHour: 19, timezone: "recipient" }, maxPerDay: 20, cooldownMinutes: 30, optOutCheckRequired: true },
  { type: "phone", riskLevel: "high", requiresApproval: true, requiresDualApproval: false, timeRestrictions: { startHour: 9, endHour: 18, timezone: "recipient" }, maxPerDay: 10, cooldownMinutes: 60, optOutCheckRequired: true },
  { type: "bulk", riskLevel: "critical", requiresApproval: true, requiresDualApproval: true, timeRestrictions: { startHour: 10, endHour: 16, timezone: "sender" }, maxPerDay: 1, cooldownMinutes: 1440, optOutCheckRequired: true },
];

// ── Access Audit ─────────────────────────────────────────────

export interface AccessAuditEntry {
  id: string;
  documentId: string;
  accessedBy: string;
  accessType: "view" | "download" | "share" | "redact";
  timestamp: string;
  ipAddress?: string;
  redacted: boolean;
  reason?: string;
}

export interface RedactionRules {
  documentType: string;
  fieldsToRedact: string[];
  redactionLevel: "full" | "partial" | "hash";
  visibleTo: string[]; // role IDs
}

// ── Sub-module re-exports ────────────────────────────────────
export * from "./approvals";
export * from "./sensitive-docs";
export * from "./outbound";
