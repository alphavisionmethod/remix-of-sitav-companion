// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Record Contract Types
// Durable release persistence chain: promotion, rollback, evidence
// ═══════════════════════════════════════════════════════════════

/** Canonical release channel */
export type ReleaseChannel = "stable" | "beta" | "canary" | "internal" | "appliance";

/** Canonical release ring */
export type ReleaseRing = "ring-0" | "ring-1" | "ring-2" | "ring-3" | "general-availability";

/** Canonical release status */
export type ReleaseStatus =
  | "draft"
  | "candidate"
  | "promoted"
  | "rolling-out"
  | "rolled-back"
  | "completed"
  | "failed"
  | "archived";

/** Rollback reason classification */
export type RollbackReason =
  | "regression"
  | "incident"
  | "operator-decision"
  | "policy-violation"
  | "performance-degradation"
  | "trust-breach"
  | "customer-impact";

/** Durable release record with full promotion/rollback history */
export interface ReleaseRecord {
  id: string;
  version: string;
  channel: ReleaseChannel;
  ring: ReleaseRing;
  status: ReleaseStatus;
  title: string;
  description: string;

  /** Rollout metadata */
  rollout: {
    startedAt: string | null;
    completedAt: string | null;
    targetPercentage: number;
    currentPercentage: number;
    affectedTenants: string[];
    rolloutStrategy: "canary" | "blue-green" | "rolling" | "immediate";
  };

  /** Rollback metadata */
  rollback: {
    rolledBackAt: string | null;
    rolledBackBy: string | null;
    reason: RollbackReason | null;
    rollbackToVersion: string | null;
    impactSummary: string | null;
  };

  /** Audit correlation */
  audit: {
    correlationId: string;
    approvedBy: string | null;
    approvedAt: string | null;
    reviewedBy: string[];
    receiptIds: string[];
    incidentIds: string[];
  };

  /** Evidence links */
  evidence: {
    importSmokeManifestId: string | null;
    testSuitePassId: string | null;
    proofBundleId: string | null;
    deploymentArtifactHash: string | null;
  };

  /** Promotion history chain */
  promotionHistory: ReleasePromotionEvent[];

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/** Individual promotion event in the release lifecycle */
export interface ReleasePromotionEvent {
  id: string;
  releaseId: string;
  fromRing: ReleaseRing;
  toRing: ReleaseRing;
  fromStatus: ReleaseStatus;
  toStatus: ReleaseStatus;
  promotedBy: string;
  promotedAt: string;
  reason: string;
  evidenceRefs: string[];
  receiptId: string | null;
}

/** Rollback event record */
export interface ReleaseRollbackEvent {
  id: string;
  releaseId: string;
  fromVersion: string;
  toVersion: string;
  reason: RollbackReason;
  initiatedBy: string;
  initiatedAt: string;
  completedAt: string | null;
  impactAssessment: {
    affectedUsers: number;
    affectedServices: string[];
    dataLossRisk: "none" | "low" | "medium" | "high";
  };
  receiptId: string;
  incidentId: string | null;
}

/** Evidence chain linking release to proof artifacts */
export interface ReleaseEvidenceChain {
  releaseId: string;
  proofArtifacts: Array<{
    type: "test-suite" | "import-smoke" | "deployment-hash" | "approval-receipt" | "incident-resolution";
    artifactId: string;
    verified: boolean;
    verifiedAt: string | null;
    verifiedBy: string | null;
  }>;
  chainComplete: boolean;
  chainVerifiedAt: string | null;
}
