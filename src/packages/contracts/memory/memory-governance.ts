// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory Contracts: Memory Governance (Canonical)
// Merged v1+v2 into single canonical governance contract
// ═══════════════════════════════════════════════════════════════

import type { PrivacyTier, DomainId } from "../_contract-scaffold";

export type MemoryRetentionPolicy = "permanent" | "session" | "ttl" | "until-superseded" | "until-revoked";
export type MemoryAccessLevel = "owner-only" | "household" | "advisor" | "system" | "support-safe";
export type MemoryCorrectionType = "user-correction" | "source-update" | "decay" | "contradiction-resolution" | "privacy-redaction";

export interface MemoryGovernanceRule {
  domain: DomainId;
  privacyTier: PrivacyTier;
  retention: MemoryRetentionPolicy;
  accessLevel: MemoryAccessLevel;
  ttlMs?: number;
  allowAdvisorAccess: boolean;
  allowExport: boolean;
  requiresConsent: boolean;
  auditOnRead: boolean;
  auditOnWrite: boolean;
}

export interface MemoryCorrectionRecord {
  id: string;
  memoryId: string;
  correctionType: MemoryCorrectionType;
  previousValue: unknown;
  newValue: unknown;
  reason: string;
  correctedBy: string;
  correctedAt: string;
  proofId?: string;
}

export interface MemoryForgetRequest {
  id: string;
  memoryIds: string[];
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "executed" | "denied";
  executedAt?: string;
  scope: "single" | "domain" | "all";
}

export interface MemoryGovernanceConfig {
  rules: MemoryGovernanceRule[];
  defaultRetention: MemoryRetentionPolicy;
  defaultAccessLevel: MemoryAccessLevel;
  globalAuditEnabled: boolean;
  forgetRequestsEnabled: boolean;
  correctionHistoryRetentionDays: number;
}
