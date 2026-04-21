// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Bundle Contract
// Canonical types for support bundles, packs, redaction, expiry,
// escalation packages, and support sessions.
// ═══════════════════════════════════════════════════════════════

import type { RunbookSubsystem } from "./runbook-types";

/** Every domain that can produce a support bundle. */
export type BundleType =
  | "runtime-crash"
  | "auth-account"
  | "onboarding"
  | "app-lifecycle"
  | "advisor-boardroom"
  | "integration-provider"
  | "workflow-failure"
  | "payment-proof"
  | "support-escalation"
  | "admin-operator"
  | "os-recovery"
  | "environment"
  | "system-wide";

export type RedactionStatus = "pending" | "applied" | "verified";

export type BundleExpiryClass = "customer" | "operator" | "escalation" | "archive";

export interface ExpiryPolicy {
  readonly expiryClass: BundleExpiryClass;
  readonly ttlMs: number;
  readonly renewableCount: number;
  readonly archiveAfterExpiry: boolean;
  readonly purgeAfterArchiveDays: number | null;
}

export interface RedactionRecord {
  readonly fieldPath: string;
  readonly category: RedactionCategory;
  readonly originalLength: number;
}

export type RedactionCategory =
  | "token"
  | "secret"
  | "email"
  | "phone"
  | "payment"
  | "credential"
  | "prompt"
  | "memory"
  | "device-id"
  | "user-content";

export interface BundlePack {
  readonly packType: string;
  readonly capturedAt: string;
  readonly data: Record<string, unknown>;
  readonly redactedFields: readonly RedactionRecord[];
}

export interface SupportBundle {
  readonly bundleId: string;
  readonly bundleType: BundleType;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly expiryPolicy: ExpiryPolicy;
  readonly sourceDomain: string;
  readonly sourceEntityIds: readonly string[];
  readonly redactionStatus: RedactionStatus;
  readonly totalRedactions: number;
  readonly supportSessionId: string | null;
  readonly packs: readonly BundlePack[];
  readonly linkedRunbookIds: readonly string[];
  readonly linkedIncidentIds: readonly string[];
  readonly linkedKillSwitchSuggestions: readonly string[];
  readonly exportSafe: boolean;
}

export type EscalationSeverity = "low" | "medium" | "high" | "critical";

export type EscalationTarget =
  | "internal-operator"
  | "security-team"
  | "platform-team"
  | "integration-owner"
  | "customer-support";

export interface EscalationPackage {
  readonly packageId: string;
  readonly createdAt: string;
  readonly severity: EscalationSeverity;
  readonly target: EscalationTarget;
  readonly issueSummary: string;
  readonly environmentFingerprint: BundlePack | null;
  readonly diagnosticsPacks: readonly BundlePack[];
  readonly relatedIncidentIds: readonly string[];
  readonly linkedRunbookIds: readonly string[];
  readonly killSwitchSuggestions: readonly KillSwitchSuggestion[];
  readonly sessionHistory: readonly SupportSessionAction[];
  readonly actionHistory: readonly string[];
  readonly redactionStatus: RedactionStatus;
}

export interface KillSwitchSuggestion {
  readonly switchId: string;
  readonly reason: string;
  readonly confidence: number;
  readonly linkedRunbookId: string | null;
  readonly requiredApprovalLevel: "standard" | "dual-admin";
  readonly classification: "informational" | "actionable";
}

export type SupportSessionStatus = "open" | "escalated" | "resolved" | "closed";

export interface SupportSessionAction {
  readonly timestamp: string;
  readonly action: string;
  readonly actorId: string;
  readonly details: string | null;
}

export interface SupportSession {
  readonly sessionId: string;
  readonly startedAt: string;
  readonly status: SupportSessionStatus;
  readonly actorIds: readonly string[];
  readonly issueRef: string | null;
  readonly generatedBundleIds: readonly string[];
  readonly actions: readonly SupportSessionAction[];
  readonly escalationIds: readonly string[];
  readonly runbooksConsulted: readonly string[];
  readonly killSwitchesSuggested: readonly string[];
  readonly closedAt: string | null;
}

export interface SupportDomainPackMap {
  readonly domain: string;
  readonly subsystem: RunbookSubsystem;
  readonly bundleTypes: readonly BundleType[];
  readonly requiredPacks: readonly string[];
}