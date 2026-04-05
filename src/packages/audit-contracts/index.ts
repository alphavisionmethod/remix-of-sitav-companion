// ═══════════════════════════════════════════════════════════════
// SITA OS — Audit Contracts
// Comprehensive audit trail, compliance reporting, and forensic
// evidence types for sovereign accountability.
// ═══════════════════════════════════════════════════════════════

// ── Re-exports from canonical sources ────────────────────────
export type { AdminAuditEntry, AdminSession, AdminPolicy } from "@/packages/contracts/admin/admin-contracts";
export type { AuthAuditEntry } from "@/packages/auth";

// ── Audit Trail Types ────────────────────────────────────────

export type AuditSeverity = "info" | "warning" | "critical" | "security";
export type AuditCategory =
  | "authentication" | "authorization" | "data-access" | "data-mutation"
  | "policy-change" | "configuration" | "approval" | "financial"
  | "communication" | "system" | "compliance" | "escalation";

export interface AuditEntry {
  id: string;
  userId: string;
  tenantId: string;
  action: string;
  category: AuditCategory;
  severity: AuditSeverity;
  actor: string;
  actorType: "user" | "advisor" | "agent" | "system" | "webhook";
  targetType: string;
  targetId: string;
  domain: string;
  correlationId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  geolocation?: { country: string; region: string; city: string };
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  timestamp: string;
  hash: string;
  previousEntryHash?: string;
}

// ── Audit Chain Integrity ────────────────────────────────────

export interface AuditChainSegment {
  startEntryId: string;
  endEntryId: string;
  entryCount: number;
  startHash: string;
  endHash: string;
  chainIntact: boolean;
  brokenLinks: string[];
  verifiedAt: string;
}

export interface AuditChainVerification {
  id: string;
  tenantId: string;
  verifiedAt: string;
  totalEntries: number;
  segments: AuditChainSegment[];
  overallIntegrity: "intact" | "degraded" | "broken";
  missingEntries: string[];
  duplicateEntries: string[];
}

// ── Compliance Reporting ─────────────────────────────────────

export type ComplianceStandard = "SOC2" | "GDPR" | "HIPAA" | "PCI-DSS" | "ISO27001" | "CCPA" | "internal";

export interface ComplianceCheckResult {
  standard: ComplianceStandard;
  requirement: string;
  status: "pass" | "fail" | "partial" | "not-applicable";
  evidence: string[];
  auditEntryIds: string[];
  notes: string;
  evaluatedAt: string;
}

export interface ComplianceReport {
  id: string;
  tenantId: string;
  period: { start: string; end: string };
  standard: ComplianceStandard;
  overallScore: number;
  checks: ComplianceCheckResult[];
  totalPass: number;
  totalFail: number;
  totalPartial: number;
  recommendations: string[];
  generatedAt: string;
  generatedBy: string;
  signedHash: string;
}

// ── Forensic Evidence ────────────────────────────────────────

export interface ForensicQuery {
  id: string;
  queryType: "timeline" | "actor-trace" | "entity-trace" | "anomaly-scan";
  filters: {
    dateRange?: { start: string; end: string };
    actors?: string[];
    categories?: AuditCategory[];
    severities?: AuditSeverity[];
    targetTypes?: string[];
    targetIds?: string[];
    correlationIds?: string[];
    domains?: string[];
  };
  executedAt: string;
  resultCount: number;
}

export interface ForensicTimeline {
  queryId: string;
  entries: AuditEntry[];
  gaps: Array<{ after: string; before: string; estimatedMissing: number }>;
  anomalies: Array<{ entryId: string; type: string; severity: AuditSeverity; description: string }>;
  summary: {
    uniqueActors: number;
    uniqueTargets: number;
    categoryBreakdown: Record<AuditCategory, number>;
    severityBreakdown: Record<AuditSeverity, number>;
  };
}

// ── Data Access Audit ────────────────────────────────────────

export interface DataAccessRecord {
  id: string;
  userId: string;
  table: string;
  operation: "select" | "insert" | "update" | "delete";
  rowsAffected: number;
  sensitivityTier: "public" | "internal" | "confidential" | "restricted";
  policyApplied: string;
  allowed: boolean;
  denialReason?: string;
  timestamp: string;
}

export interface DataAccessSummary {
  userId: string;
  period: { start: string; end: string };
  totalAccesses: number;
  byTable: Record<string, number>;
  byOperation: Record<string, number>;
  bySensitivity: Record<string, number>;
  deniedAccesses: number;
  anomalousPatterns: Array<{ pattern: string; description: string; riskLevel: string }>;
}

// ── Audit Retention & Archival ───────────────────────────────

export interface AuditRetentionPolicy {
  category: AuditCategory;
  retentionDays: number;
  archiveAfterDays: number;
  immutable: boolean;
  encryptAtRest: boolean;
  complianceRequirement?: ComplianceStandard;
}

export interface AuditArchiveManifest {
  id: string;
  archivedAt: string;
  period: { start: string; end: string };
  entryCount: number;
  sizeBytes: number;
  integrityHash: string;
  storageLocation: string;
  encryptionKeyId: string;
  restorable: boolean;
}

// ── Anomaly Detection ────────────────────────────────────────

export type AnomalyType =
  | "unusual-access-pattern" | "privilege-escalation" | "bulk-data-access"
  | "off-hours-activity" | "geographic-anomaly" | "rate-spike"
  | "configuration-tampering" | "policy-bypass";

export interface AuditAnomaly {
  id: string;
  type: AnomalyType;
  severity: AuditSeverity;
  detectedAt: string;
  relatedEntryIds: string[];
  description: string;
  actorId: string;
  riskScore: number;
  autoMitigated: boolean;
  mitigationAction?: string;
  requiresReview: boolean;
}
