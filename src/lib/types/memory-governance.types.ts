// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory Governance Types
// Memory as a first-class governed platform system
// ═══════════════════════════════════════════════════════════════

export type MemoryType = "ephemeral" | "working" | "durable" | "temporary" | "shared" | "private" | "advisor_scoped" | "org_scoped" | "household_scoped" | "workflow" | "boardroom" | "preference" | "operating_pattern" | "trust_behavior";
export type MemoryPrivacy = "private" | "household" | "org" | "advisor" | "system";
export type MemorySource = "user_input" | "advisor_inference" | "connector_sync" | "workflow_output" | "boardroom_decision" | "system_observation";

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  privacy: MemoryPrivacy;
  source: MemorySource;
  domain: string;
  key: string;
  value: unknown;
  confidence: number;
  lineage: MemoryLineage;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  accessCount: number;
  lastAccessedAt?: string;
  entityScope: { ownerId: string; visibility: string; householdId?: string; orgId?: string };
  tags: string[];
  contradicts?: string[];
  supersedes?: string[];
  verified: boolean;
  userReviewed: boolean;
}

export interface MemoryLineage {
  sourceId: string;
  sourceType: MemorySource;
  derivedFrom?: string[];
  transformations: string[];
  originalTimestamp: string;
  attributionChain: { actor: string; action: string; timestamp: string }[];
}

export interface MemoryContradiction {
  id: string;
  memoryA: string;
  memoryB: string;
  field: string;
  valueA: unknown;
  valueB: unknown;
  detectedAt: string;
  resolvedAt?: string;
  resolution?: "keep_a" | "keep_b" | "merge" | "user_decided" | "unresolved";
  resolvedBy?: string;
  confidence: number;
}

export interface MemoryPersistenceRule {
  id: string;
  domain: string;
  memoryType: MemoryType;
  autoExpireAfterDays?: number;
  requiresUserReview: boolean;
  maxConfidenceWithoutReview: number;
  allowAdvisorWrite: boolean;
  allowAdvisorRead: boolean;
  privacyDefault: MemoryPrivacy;
  retentionPolicy: "permanent" | "session" | "ttl" | "until_reviewed";
}

export interface MemoryCorrection {
  id: string;
  memoryId: string;
  previousValue: unknown;
  correctedValue: unknown;
  correctedBy: string;
  reason: string;
  timestamp: string;
  propagated: boolean;
  affectedWorkflows: string[];
}

export interface MemoryForgetRequest {
  id: string;
  memoryIds: string[];
  requestedBy: string;
  reason: string;
  timestamp: string;
  status: "pending" | "completed" | "partial" | "denied";
  affectedAdvisors: string[];
  cascadeEffects: string[];
}

export interface MemoryConflictResolution {
  conflictId: string;
  strategy: "latest_wins" | "highest_confidence" | "user_decides" | "advisor_decides" | "merge";
  resolvedValue: unknown;
  resolvedBy: string;
  timestamp: string;
}

export interface MemoryGovernanceConfig {
  globalRules: MemoryPersistenceRule[];
  domainOverrides: Record<string, Partial<MemoryPersistenceRule>>;
  advisorScopes: Record<string, { canRead: string[]; canWrite: string[]; canDelete: boolean }>;
  householdSharing: { enabled: boolean; requiresConsent: boolean; excludedTypes: MemoryType[] };
  auditEnabled: boolean;
  contradictionDetectionEnabled: boolean;
  autoExpirationEnabled: boolean;
}
