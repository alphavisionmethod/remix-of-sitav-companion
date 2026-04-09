// ═══════════════════════════════════════════════════════════════
// SITA OS — VMware Evidence Chain Contract Types
// Appliance lifecycle, import-smoke manifests, evidence gates
// ═══════════════════════════════════════════════════════════════

/** Appliance lifecycle stage */
export type ApplianceLifecycleStage =
  | "provisioned"
  | "importing"
  | "import-verified"
  | "configuring"
  | "ready"
  | "running"
  | "updating"
  | "degraded"
  | "decommissioned";

/** Import smoke test result */
export type ImportSmokeResult = "pass" | "fail" | "partial" | "skipped" | "not-run";

/** VMware import smoke manifest — machine-checkable evidence */
export interface VmwareImportSmokeManifest {
  manifestId: string;
  generatedAt: string;
  generatedBy: string;
  environment: "production" | "staging" | "development";
  applianceVersion: string;
  vmwareVersion: string;

  checks: Array<{
    checkId: string;
    name: string;
    category: "network" | "storage" | "compute" | "identity" | "services" | "trust";
    result: ImportSmokeResult;
    details: string;
    durationMs: number;
    evidence: string | null;
  }>;

  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    partial: number;
    skipped: number;
    overallResult: ImportSmokeResult;
  };

  artifactHash: string;
  previousManifestId: string | null;
}

/** Evidence gate — governs whether appliance can proceed */
export interface VmwareEvidenceGate {
  gateId: string;
  applianceId: string;
  gateType: "import-smoke" | "health-check" | "update-verification" | "decommission-proof";
  status: "open" | "passed" | "failed" | "bypassed";
  requiredEvidence: string[];
  providedEvidence: string[];
  missingEvidence: string[];
  evaluatedAt: string | null;
  evaluatedBy: string | null;
  bypassReason: string | null;
  receiptId: string | null;
}

/** Durable appliance lifecycle record */
export interface ApplianceLifecycleRecord {
  id: string;
  applianceId: string;
  applianceName: string;
  stage: ApplianceLifecycleStage;
  version: string;

  hardware: {
    cpuCores: number;
    memoryGb: number;
    storageGb: number;
    networkAdapters: number;
  };

  lifecycle: {
    provisionedAt: string;
    lastBootAt: string | null;
    lastUpdateAt: string | null;
    lastHealthCheckAt: string | null;
    decommissionedAt: string | null;
  };

  evidence: {
    importSmokeManifestId: string | null;
    lastHealthGateId: string | null;
    updateGateIds: string[];
  };

  updateChannel: string;
  backupStatus: "current" | "stale" | "missing" | "in-progress";
  trustPosture: "trusted" | "degraded" | "untrusted";

  createdAt: string;
  updatedAt: string;
}
