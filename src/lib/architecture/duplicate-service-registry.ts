// ═══════════════════════════════════════════════════════════════
// SITA OS — Duplicate Service Registry (Workstream A)
// Canonical inventory of all overlapping service pairs between
// src/lib/core-services/ and src/lib/services/
// ═══════════════════════════════════════════════════════════════

export type OverlapType =
  | "full-duplicate"
  | "partial-duplicate"
  | "wrapper-duplicate"
  | "naming-only"
  | "dead-live"
  | "legacy-current";

export type EquivalenceStatus =
  | "identical"
  | "compatible"
  | "divergent"
  | "unknown"
  | "wrapper-already";

export type MigrationPhase = "wave-1" | "wave-2" | "wave-3" | "done" | "skip";

export interface DuplicateServicePair {
  id: string;
  coreServicesPath: string;
  servicesPath: string;
  responsibility: string;
  overlapType: OverlapType;
  canonicalChoice: "core-services" | "services" | "new-canonical" | "both-keep";
  callerCount: { coreServices: number; services: number };
  testCoverage: "none" | "partial" | "full";
  riskLevel: "low" | "medium" | "high";
  migrationPhase: MigrationPhase;
  equivalenceStatus: EquivalenceStatus;
  notes: string;
}

/**
 * All 39 overlapping directory names between core-services/ and services/.
 * Pairs marked "skip" have README.md or __tests__ that are structural, not service duplicates.
 */
export const DUPLICATE_SERVICE_PAIRS: readonly DuplicateServicePair[] = [
  // ── Structural (not true service pairs) ──
  { id: "DSP-README", coreServicesPath: "src/lib/core-services/README.md", servicesPath: "src/lib/services/README.md", responsibility: "Documentation", overlapType: "naming-only", canonicalChoice: "both-keep", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "skip", equivalenceStatus: "unknown", notes: "Both READMEs serve different purposes" },
  { id: "DSP-TESTS", coreServicesPath: "src/lib/core-services/__tests__", servicesPath: "src/lib/services/__tests__", responsibility: "Test infrastructure", overlapType: "naming-only", canonicalChoice: "both-keep", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "skip", equivalenceStatus: "unknown", notes: "Separate test suites" },
  { id: "DSP-INDEX", coreServicesPath: "src/lib/core-services/index.ts", servicesPath: "src/lib/services/index.ts", responsibility: "Barrel export", overlapType: "naming-only", canonicalChoice: "both-keep", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "skip", equivalenceStatus: "unknown", notes: "Barrel files for different layers" },
  { id: "DSP-ARCH", coreServicesPath: "src/lib/core-services/architecture", servicesPath: "src/lib/services/architecture", responsibility: "Architecture metadata", overlapType: "naming-only", canonicalChoice: "both-keep", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "skip", equivalenceStatus: "unknown", notes: "Layer-specific architecture info" },

  // ── Wave 1: Low-risk, likely identical or simple wrappers ──
  { id: "DSP-001", coreServicesPath: "src/lib/core-services/ai-gateway", servicesPath: "src/lib/services/ai-gateway", responsibility: "AI model gateway and routing", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Core infrastructure — canonical in core-services" },
  { id: "DSP-002", coreServicesPath: "src/lib/core-services/ai-workforce", servicesPath: "src/lib/services/ai-workforce", responsibility: "AI agent workforce management", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Workforce orchestration" },
  { id: "DSP-003", coreServicesPath: "src/lib/core-services/biometric-auth", servicesPath: "src/lib/services/biometric-auth", responsibility: "Biometric authentication", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Auth subsystem" },
  { id: "DSP-004", coreServicesPath: "src/lib/core-services/canonical-pipeline", servicesPath: "src/lib/services/canonical-pipeline", responsibility: "Canonical execution pipeline", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Pipeline infrastructure" },
  { id: "DSP-005", coreServicesPath: "src/lib/core-services/capability-router", servicesPath: "src/lib/services/capability-router", responsibility: "Capability routing", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Router infrastructure" },
  { id: "DSP-006", coreServicesPath: "src/lib/core-services/event-bus", servicesPath: "src/lib/services/event-bus", responsibility: "Event bus / pub-sub", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Core eventing" },
  { id: "DSP-007", coreServicesPath: "src/lib/core-services/flagship-loops", servicesPath: "src/lib/services/flagship-loops", responsibility: "Flagship loop orchestration", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Core loops" },
  { id: "DSP-008", coreServicesPath: "src/lib/core-services/frontend", servicesPath: "src/lib/services/frontend", responsibility: "Frontend service utilities", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Frontend helpers" },
  { id: "DSP-009", coreServicesPath: "src/lib/core-services/google-provider-family", servicesPath: "src/lib/services/google-provider-family", responsibility: "Google provider integration", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Provider adapter" },
  { id: "DSP-010", coreServicesPath: "src/lib/core-services/handoff", servicesPath: "src/lib/services/handoff", responsibility: "Task/context handoff", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Handoff orchestration" },
  { id: "DSP-011", coreServicesPath: "src/lib/core-services/launch-readiness", servicesPath: "src/lib/services/launch-readiness", responsibility: "Launch readiness checks", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Readiness gates" },
  { id: "DSP-012", coreServicesPath: "src/lib/core-services/life-simulation", servicesPath: "src/lib/services/life-simulation", responsibility: "Life simulation engine", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Simulation engine" },
  { id: "DSP-013", coreServicesPath: "src/lib/core-services/mnemosyne", servicesPath: "src/lib/services/mnemosyne", responsibility: "Memory persistence layer", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Memory infrastructure" },
  { id: "DSP-014", coreServicesPath: "src/lib/core-services/model-router", servicesPath: "src/lib/services/model-router", responsibility: "AI model routing", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Model routing core" },
  { id: "DSP-015", coreServicesPath: "src/lib/core-services/projection-service", servicesPath: "src/lib/services/projection-service", responsibility: "Read model projections", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Projection layer" },
  { id: "DSP-016", coreServicesPath: "src/lib/core-services/self-healing", servicesPath: "src/lib/services/self-healing", responsibility: "Self-healing infrastructure", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Self-healing subsystem" },
  { id: "DSP-017", coreServicesPath: "src/lib/core-services/service-registry", servicesPath: "src/lib/services/service-registry", responsibility: "Service discovery registry", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Registry infrastructure" },
  { id: "DSP-018", coreServicesPath: "src/lib/core-services/system-updates", servicesPath: "src/lib/services/system-updates", responsibility: "System update management", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Update subsystem" },
  { id: "DSP-019", coreServicesPath: "src/lib/core-services/truth-indices", servicesPath: "src/lib/services/truth-indices", responsibility: "Truth index management", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Truth enforcement" },

  // ── Wave 2: Medium-risk, may have partial differences ──
  { id: "DSP-020", coreServicesPath: "src/lib/core-services/approval-engine", servicesPath: "src/lib/services/approval-engine", responsibility: "Approval workflow engine", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "Core approval logic may differ" },
  { id: "DSP-021", coreServicesPath: "src/lib/core-services/conscience-gate", servicesPath: "src/lib/services/conscience-gate", responsibility: "Ethical/safety gating", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "Safety-critical — careful analysis needed" },
  { id: "DSP-022", coreServicesPath: "src/lib/core-services/epistemic-firewall", servicesPath: "src/lib/services/epistemic-firewall", responsibility: "AI output verification", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "Trust-critical — verify behavior equivalence" },
  { id: "DSP-023", coreServicesPath: "src/lib/core-services/identity-auth", servicesPath: "src/lib/services/identity-auth", responsibility: "Identity & authentication", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "Auth — high-risk domain" },
  { id: "DSP-024", coreServicesPath: "src/lib/core-services/inference-gateway", servicesPath: "src/lib/services/inference-gateway", responsibility: "AI inference gateway", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "Inference pipeline" },
  { id: "DSP-025", coreServicesPath: "src/lib/core-services/integration-hub", servicesPath: "src/lib/services/integration-hub", responsibility: "Integration hub", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "Integration orchestration" },
  { id: "DSP-026", coreServicesPath: "src/lib/core-services/memory-service", servicesPath: "src/lib/services/memory-service", responsibility: "Memory persistence", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "Memory infrastructure" },
  { id: "DSP-027", coreServicesPath: "src/lib/core-services/recommendation-execution", servicesPath: "src/lib/services/recommendation-execution", responsibility: "Recommendation lifecycle", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "REX pipeline" },
  { id: "DSP-028", coreServicesPath: "src/lib/core-services/security", servicesPath: "src/lib/services/security", responsibility: "Security services", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "Security-critical domain" },
  { id: "DSP-029", coreServicesPath: "src/lib/core-services/verification-engine", servicesPath: "src/lib/services/verification-engine", responsibility: "Verification engine", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "Verification subsystem" },

  // ── Wave 3: High-risk, known divergence or complex dependency ──
  { id: "DSP-030", coreServicesPath: "src/lib/core-services/brain-core", servicesPath: "src/lib/services/brain-core", responsibility: "Brain orchestration core", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "high", migrationPhase: "wave-3", equivalenceStatus: "unknown", notes: "Most complex pair — brain substrate" },
  { id: "DSP-031", coreServicesPath: "src/lib/core-services/executor-service", servicesPath: "src/lib/services/executor-service", responsibility: "Action execution engine", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "high", migrationPhase: "wave-3", equivalenceStatus: "unknown", notes: "Execution pipeline — side-effect critical" },
  { id: "DSP-032", coreServicesPath: "src/lib/core-services/finance-os", servicesPath: "src/lib/services/finance-os", responsibility: "Finance operating system", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "high", migrationPhase: "wave-3", equivalenceStatus: "unknown", notes: "Finance domain — high-risk" },
  { id: "DSP-033", coreServicesPath: "src/lib/core-services/policy-engine", servicesPath: "src/lib/services/policy-engine", responsibility: "Policy enforcement engine", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "high", migrationPhase: "wave-3", equivalenceStatus: "unknown", notes: "Policy enforcement — governance critical" },
  { id: "DSP-034", coreServicesPath: "src/lib/core-services/receipt-service", servicesPath: "src/lib/services/receipt-service", responsibility: "Receipt generation & audit", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "high", migrationPhase: "wave-3", equivalenceStatus: "unknown", notes: "Receipt integrity — trust critical" },
  { id: "DSP-035", coreServicesPath: "src/lib/core-services/trust-governor", servicesPath: "src/lib/services/trust-governor", responsibility: "Trust governance", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "high", migrationPhase: "wave-3", equivalenceStatus: "unknown", notes: "Trust enforcement — governance critical" },
  { id: "DSP-036", coreServicesPath: "src/lib/core-services/workflow-engine", servicesPath: "src/lib/services/workflow-engine", responsibility: "Workflow execution engine", overlapType: "partial-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "high", migrationPhase: "wave-3", equivalenceStatus: "unknown", notes: "Workflow orchestration — high traffic" },
  { id: "DSP-037", coreServicesPath: "src/lib/core-services/connector-health-service", servicesPath: "src/lib/services/connector-health-service.ts", responsibility: "Connector health monitoring", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "medium", migrationPhase: "wave-2", equivalenceStatus: "unknown", notes: "Dir vs file mismatch" },
  { id: "DSP-038", coreServicesPath: "src/lib/core-services/ci-launch-gate-service", servicesPath: "src/lib/services/ci-launch-gate-service.ts", responsibility: "CI launch gating", overlapType: "full-duplicate", canonicalChoice: "core-services", callerCount: { coreServices: 0, services: 0 }, testCoverage: "none", riskLevel: "low", migrationPhase: "wave-1", equivalenceStatus: "unknown", notes: "Dir vs file mismatch" },
] as const;

// ── Query helpers ──

export function getPairsByWave(wave: MigrationPhase): readonly DuplicateServicePair[] {
  return DUPLICATE_SERVICE_PAIRS.filter(p => p.migrationPhase === wave);
}

export function getPairsByRisk(risk: "low" | "medium" | "high"): readonly DuplicateServicePair[] {
  return DUPLICATE_SERVICE_PAIRS.filter(p => p.riskLevel === risk);
}

export function getConsolidationProgress() {
  const actionable = DUPLICATE_SERVICE_PAIRS.filter(p => p.migrationPhase !== "skip");
  const done = actionable.filter(p => p.migrationPhase === "done");
  return {
    totalPairs: DUPLICATE_SERVICE_PAIRS.length,
    actionablePairs: actionable.length,
    completed: done.length,
    wave1: getPairsByWave("wave-1").length,
    wave2: getPairsByWave("wave-2").length,
    wave3: getPairsByWave("wave-3").length,
    skipped: DUPLICATE_SERVICE_PAIRS.filter(p => p.migrationPhase === "skip").length,
    completionPct: actionable.length > 0 ? Math.round((done.length / actionable.length) * 100) : 100,
  };
}