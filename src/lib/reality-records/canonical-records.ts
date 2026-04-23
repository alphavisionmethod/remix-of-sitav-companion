// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Reality Data Models (Part 9)
// Stable record types for the Reality Classification &
// Mock Replacement program across all operator surfaces.
// ═══════════════════════════════════════════════════════════════

// ── 1. Reality Classification Record ──
export interface RealityClassificationRecord {
  id: string;
  scope: "route" | "page" | "feature" | "component_group" | "service" | "domain" | "workspace" | "office";
  routePath: string;
  featureName: string;
  domain: string;
  classification: "presentational" | "simulated" | "persisted" | "proven";
  confidence: number; // 0-100
  evidenceRefs: string[];
  missingRequirements: string[];
  blockers: string[];
  owner: string | null;
  launchImpact: "blocking" | "degraded" | "none";
  contractStatus: "none" | "partial" | "aligned" | "verified";
  backendTarget: string | null;
  readinessScore: number;
  classifiedBy: string;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── 2. Reality Evidence Record ──
export interface RealityEvidenceRecord {
  id: string;
  classificationId: string;
  evidenceType: "route_exists" | "shell_exists" | "component_renders" | "data_source_real" |
    "contract_exists" | "api_exists" | "db_persistence" | "mock_imports_none" |
    "in_memory_only" | "edge_function_present" | "real_mutation_path" |
    "runtime_evidence" | "interaction_verified" | "proof_receipt" |
    "e2e_coverage" | "launch_ready";
  signal: boolean;
  source: string; // how was it gathered
  confidence: number;
  capturedAt: string;
}

// ── 3. Mock Usage Record ──
export interface MockUsageRecord {
  id: string;
  source: string;
  importPath: string;
  usageLocation: string; // file path
  domain: string;
  type: "hardcoded" | "local_array" | "localstorage" | "in_memory_engine" | "pure_function" | "demo_flow";
  severity: "critical" | "high" | "medium" | "low";
  forbidden: boolean;
  detectedAt: string;
}

// ── 4. Mock Source Inventory Record ──
export interface MockSourceInventoryRecord {
  id: string;
  sourcePath: string;
  exportedSymbols: string[];
  importedByPages: string[];
  importedByComponents: string[];
  domainsAffected: string[];
  totalUsageCount: number;
  criticality: "critical" | "high" | "medium" | "low";
  allowed: boolean;
  replacementTarget: string | null;
  updatedAt: string;
}

// ── 5. Mock Replacement Migration Record ──
export interface MockReplacementMigrationRecord {
  id: string;
  featureName: string;
  routePath: string;
  domain: string;
  source: string;
  type: MockUsageRecord["type"];
  realBackendTarget: string | null;
  expectedContracts: string[];
  persistenceTarget: string | null;
  migrationOwner: string | null;
  migrationPriority: "critical" | "high" | "medium" | "low";
  truthSeverity: "critical" | "high" | "medium" | "low";
  migrationStatus: "identified" | "planned" | "in_progress" | "blocked" | "completed" | "validated";
  blockers: string[];
  validationChecklist: string[];
  replacementEvidence: any[];
  launchImpact: "blocking" | "degraded" | "none";
  sequenceOrder: number;
  dependencies: string[];
  doneAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── 6. Migration Dependency Record ──
export interface MigrationDependencyRecord {
  id: string;
  migrationId: string;
  dependsOnMigrationId: string;
  dependencyType: "blocks" | "requires" | "soft";
  description: string;
  resolved: boolean;
  resolvedAt: string | null;
}

// ── 7. Migration Validation Record ──
export interface MigrationValidationRecord {
  id: string;
  migrationId: string;
  validationType: "data_loads" | "mutation_persists" | "interaction_success" | "proof_behavior" | "no_drift" | "e2e_pass";
  passed: boolean;
  evidence: any;
  validatedBy: string;
  validatedAt: string;
}

// ── 8. Core Service Reality Record ──
export interface CoreServiceRealityRecord {
  id: string;
  serviceName: string;
  currentBacking: "memory-only" | "localStorage" | "demo" | "db" | "hybrid";
  usageDomains: string[];
  persistenceTarget: string | null;
  stateLossSeverity: "critical" | "high" | "medium" | "low";
  migrationStatus: "not_started" | "planned" | "in_progress" | "completed";
  owner: string | null;
  updatedAt: string;
}

// ── 9. Route Reality Record ──
export interface RouteRealityRecord {
  id: string;
  routePath: string;
  domain: string;
  classification: RealityClassificationRecord["classification"];
  hasMockImports: boolean;
  hasRealDataSource: boolean;
  hasFormSubmission: boolean;
  formPersists: boolean;
  launchImpact: "blocking" | "degraded" | "none";
  criticality: "critical" | "high" | "medium" | "low";
  updatedAt: string;
}

// ── 10. Launch Honesty Record ──
export interface LaunchHonestyRecord {
  id: string;
  domain: string;
  totalFeatures: number;
  provenCount: number;
  simulatedCount: number;
  provenPercentage: number;
  truthRisk: "high" | "medium" | "low";
  claimSeverity: "safe" | "caution" | "danger";
  blockers: string[];
  criticalMocksRemaining: number;
  updatedAt: string;
}

// ── 11. Reality Transition Record ──
export interface RealityTransitionRecord {
  id: string;
  classificationId: string;
  fromState: RealityClassificationRecord["classification"];
  toState: RealityClassificationRecord["classification"];
  transitionedBy: string;
  criteriaMetRefs: string[];
  transitionedAt: string;
}

// ── 12. Runtime Reality Evidence Record ──
export interface RuntimeRealityEvidenceRecord {
  id: string;
  migrationId: string;
  routePath: string;
  probeType: "data_load" | "mutation_persist" | "interaction_success" | "proof_receipt" | "drift_check";
  result: "pass" | "fail" | "degraded";
  payload: any;
  confidence: number;
  capturedAt: string;
}
