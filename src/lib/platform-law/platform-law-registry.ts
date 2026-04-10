// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Law & Truth Enforcement Registry
// Canonical source for architecture laws, scaffolds, CI gates,
// manifest requirements, and ownership accountability
// ═══════════════════════════════════════════════════════════════

export type EnforcementMode = "block" | "warn" | "log" | "disabled";
export type LawCategory =
  | "route-ownership"
  | "shell-requirement"
  | "contract-ownership"
  | "import-boundary"
  | "manifest-requirement"
  | "interaction-requirement"
  | "proof-requirement"
  | "naming-convention"
  | "test-id-convention"
  | "prompt-traceability"
  | "domain-purity"
  | "execution-chain"
  | "memory-governance"
  | "service-budget"
  | "connector-governance"
  | "approval-governance"
  | "capability-contract"
  | "truth-requirement"
  | "policy-governance"
  | "cost-governance";

export type LawSeverity = "critical" | "high" | "medium" | "low";

export interface PlatformLaw {
  id: string;
  name: string;
  description: string;
  category: LawCategory;
  severity: LawSeverity;
  enforcementMode: EnforcementMode;
  scope: string;
  ruleNumber: number;
  violationCount: number;
  lastTriggered: string | null;
  linkedScript: string | null;
  linkedCIGate: string | null;
  enforcementDetail: string;
}

export interface ScaffoldEntry {
  id: string;
  name: string;
  scriptPath: string;
  produces: string[];
  lastUsed: string | null;
  complianceCoverage: number;
  status: "active" | "planned" | "deprecated";
  description: string;
}

export interface CIGateEntry {
  id: string;
  name: string;
  scriptPath: string;
  type: "blocking" | "advisory";
  domain: string;
  lastRun: string | null;
  lastStatus: "pass" | "fail" | "skipped" | "never-run";
  description: string;
  category: "architecture" | "validation" | "generation" | "master";
}

export interface ManifestRequirement {
  id: string;
  type: string;
  description: string;
  requiredForP0: boolean;
  requiredForP1: boolean;
  domain: string;
  completionRate: number;
  totalFeatures: number;
  compliantFeatures: number;
}

export interface OwnershipEntry {
  id: string;
  area: string;
  owner: string;
  type: "domain" | "shell" | "contract" | "route" | "probe" | "manifest" | "service";
  unresolvedViolations: number;
  driftCount: number;
  missingManifests: number;
  complianceScore: number;
}

// ═══════════════════════════════════════════════════════════════
// PLATFORM LAWS — 30 canonical architecture rules
// ═══════════════════════════════════════════════════════════════

export const PLATFORM_LAWS: PlatformLaw[] = [
  {
    id: "LAW-001", name: "One Sovereign Brain", ruleNumber: 1,
    description: "brain-core is sole authority for intent, arbitration, planning, execution auth. No duplicate intelligence.",
    category: "domain-purity", severity: "critical", enforcementMode: "block",
    scope: "platform-wide", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/check-single-brain.ts", linkedCIGate: "check-single-brain",
    enforcementDetail: "CI blocks any PR introducing a second brain/intelligence authority."
  },
  {
    id: "LAW-002", name: "Exactly 3 Top-Level Domains", ruleNumber: 2,
    description: "finance-os, business-os, concierge-os. No 4th module ever.",
    category: "domain-purity", severity: "critical", enforcementMode: "block",
    scope: "src/packages/", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/boundary-check.ts", linkedCIGate: "boundary-check",
    enforcementDetail: "Boundary check rejects any 4th top-level domain module."
  },
  {
    id: "LAW-003", name: "Submodule Rule", ruleNumber: 3,
    description: "Anything in finance/business/concierge is a submodule under one of the 3.",
    category: "domain-purity", severity: "high", enforcementMode: "block",
    scope: "src/packages/", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/boundary-check.ts", linkedCIGate: "boundary-check",
    enforcementDetail: "Boundary check enforces submodule nesting."
  },
  {
    id: "LAW-004", name: "Domain Purity", ruleNumber: 4,
    description: "Domains reason, evaluate, explain, propose. No execution, no API calls, no cross-domain calls.",
    category: "domain-purity", severity: "critical", enforcementMode: "block",
    scope: "src/packages/", violationCount: 1, lastTriggered: "2026-04-08",
    linkedScript: "scripts/check-import-boundaries.ts", linkedCIGate: "check-import-boundaries",
    enforcementDetail: "Import boundary checker blocks cross-domain and outbound calls from domain code."
  },
  {
    id: "LAW-005", name: "One Canonical Execution Chain", ruleNumber: 5,
    description: "Intent → Brain Core → Policy Engine → Capability Router → Executor → Receipt → Event Bus → Read Models.",
    category: "execution-chain", severity: "critical", enforcementMode: "block",
    scope: "platform-wide", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/check-outbound-communication-policy.ts", linkedCIGate: "check-outbound-communication-policy",
    enforcementDetail: "No raw HTTP in domain code. All execution through canonical chain."
  },
  {
    id: "LAW-006", name: "Executor as Sole Choke Point", ruleNumber: 6,
    description: "Envelope validation, signature, policy hash, approval proof, evidence grade, budget, idempotency, receipt.",
    category: "execution-chain", severity: "critical", enforcementMode: "block",
    scope: "src/packages/platform/", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/check-proof-coverage.ts", linkedCIGate: "check-proof-coverage",
    enforcementDetail: "Mutation → receipt binding enforced."
  },
  {
    id: "LAW-007", name: "Unified Proof Layer", ruleNumber: 7,
    description: "Audit-ledger, proof-orchestrator, receipts, refusal-receipts, evidence-bundles, immutable-events.",
    category: "proof-requirement", severity: "critical", enforcementMode: "block",
    scope: "platform-wide", violationCount: 2, lastTriggered: "2026-04-09",
    linkedScript: "scripts/architecture/check-proof-coverage.ts", linkedCIGate: "check-proof-coverage",
    enforcementDetail: "Every mutation must have receipt binding."
  },
  {
    id: "LAW-008", name: "Governed Memory System", ruleNumber: 8,
    description: "Source attribution, evidence grades, conflict detection, privacy tiers, expiration, correction, forget.",
    category: "memory-governance", severity: "high", enforcementMode: "warn",
    scope: "src/packages/platform/memory/", violationCount: 0, lastTriggered: null,
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Memory writes require provenance. Inferred cannot overwrite confirmed."
  },
  {
    id: "LAW-009", name: "Identity & Relationship Graph as Infra", ruleNumber: 9,
    description: "Household, org, roles, delegated authority, device ownership, permissions, inheritance, revocation.",
    category: "domain-purity", severity: "high", enforcementMode: "warn",
    scope: "src/packages/platform/identity/", violationCount: 0, lastTriggered: null,
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Identity primitives must live in platform, not duplicated in domains."
  },
  {
    id: "LAW-010", name: "Thin Surfaces", ruleNumber: 10,
    description: "Surfaces render, collect input, request approval, display state. No business logic.",
    category: "domain-purity", severity: "critical", enforcementMode: "block",
    scope: "src/pages/, src/components/", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/boundary-check.ts", linkedCIGate: "boundary-check",
    enforcementDetail: "Surface-owned business logic is a banned anti-pattern."
  },
  {
    id: "LAW-011", name: "~45 Canonical Services Max", ruleNumber: 11,
    description: "Service count budget. No unbounded sprawl.",
    category: "service-budget", severity: "high", enforcementMode: "warn",
    scope: "platform-wide", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/check-module-count.ts", linkedCIGate: "check-module-count",
    enforcementDetail: "Service count checked against budget."
  },
  {
    id: "LAW-012", name: "Truth is Never Model Output Alone", ruleNumber: 12,
    description: "LLM output = proposal, never fact. Facts from verified records, governed memory, connectors with provenance.",
    category: "truth-requirement", severity: "critical", enforcementMode: "block",
    scope: "platform-wide", violationCount: 0, lastTriggered: null,
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "No execution on raw model confidence. No memory write as fact without provenance."
  },
  {
    id: "LAW-013", name: "Explicit Workflow State Machine", ruleNumber: 13,
    description: "draft → proposed → policy-checked → awaiting-approval → approved → executing → succeeded/failed.",
    category: "execution-chain", severity: "high", enforcementMode: "warn",
    scope: "src/packages/platform/workflow/", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/check-workflow-state-usage.ts", linkedCIGate: "check-workflow-state-usage",
    enforcementDetail: "Workflow transitions must be policy-aware, event-emitting, replayable."
  },
  {
    id: "LAW-014", name: "Exception Handling as First-Class System", ruleNumber: 14,
    description: "Typed exceptions, policy refusals, compensation, rollback, escalation, postmortem receipts.",
    category: "execution-chain", severity: "high", enforcementMode: "warn",
    scope: "platform-wide", violationCount: 0, lastTriggered: null,
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Every failed/refused action generates receipt."
  },
  {
    id: "LAW-015", name: "Policies Versioned, No Silent Weakening", ruleNumber: 15,
    description: "Policy versioning, hashable bundles, change history, approval for weakening, rollback, regression tests.",
    category: "policy-governance", severity: "critical", enforcementMode: "block",
    scope: "src/packages/platform/policy/", violationCount: 0, lastTriggered: null,
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Policy changes require approval workflow. No silent weakening."
  },
  {
    id: "LAW-016", name: "Self-Learning Never Mutates Authority", ruleNumber: 16,
    description: "May optimize suggestions/preferences. May NOT change permissions, authority, policy, evidence thresholds.",
    category: "approval-governance", severity: "critical", enforcementMode: "block",
    scope: "platform-wide", violationCount: 0, lastTriggered: null,
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Self-learning boundary enforcement."
  },
  {
    id: "LAW-017", name: "Advisor Orchestration Formalized", ruleNumber: 17,
    description: "Advisor-registry, council-orchestrator, routing rules, confidence/dissent handling, escalation.",
    category: "domain-purity", severity: "high", enforcementMode: "warn",
    scope: "src/packages/platform/advisors/", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/check-advisor-registry.ts", linkedCIGate: "check-advisor-registry",
    enforcementDetail: "Advisors advise; only sovereign control authorizes."
  },
  {
    id: "LAW-018", name: "Connector Governance = Security Boundary", ruleNumber: 18,
    description: "Declared capabilities, scoped permissions, rate limits, health, kill switch, certification.",
    category: "connector-governance", severity: "critical", enforcementMode: "block",
    scope: "src/packages/platform/connectors/", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/check-connector-catalog.ts", linkedCIGate: "check-connector-catalog",
    enforcementDetail: "No unmanaged connectors. Certification before production."
  },
  {
    id: "LAW-019", name: "Consent/Permissions UX as Platform Feature", ruleNumber: 19,
    description: "Who can do what, on whose behalf, under what limits, for how long. Immediate revoke.",
    category: "approval-governance", severity: "high", enforcementMode: "warn",
    scope: "platform-wide", violationCount: 0, lastTriggered: null,
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Consent receipts generated for all permission grants."
  },
  {
    id: "LAW-020", name: "No Feature Without Manifest", ruleNumber: 20,
    description: "Every major feature requires feature manifest, route inventory, contract declarations, ownership mapping.",
    category: "manifest-requirement", severity: "critical", enforcementMode: "block",
    scope: "platform-wide", violationCount: 5, lastTriggered: "2026-04-10",
    linkedScript: "scripts/check-contract-completeness.ts", linkedCIGate: "check-contract-completeness",
    enforcementDetail: "No manifest = incomplete feature by definition."
  },
  {
    id: "LAW-021", name: "No Route Without Shell Mapping", ruleNumber: 21,
    description: "Every route must declare its shell, owner, and load expectations.",
    category: "route-ownership", severity: "critical", enforcementMode: "block",
    scope: "src/pages/", violationCount: 3, lastTriggered: "2026-04-10",
    linkedScript: "scripts/architecture/check-surface-ownership.ts", linkedCIGate: "check-surface-ownership",
    enforcementDetail: "Route → owner mapping enforced."
  },
  {
    id: "LAW-022", name: "No API Without Contract", ruleNumber: 22,
    description: "Every API endpoint and capability must have a typed contract definition.",
    category: "contract-ownership", severity: "critical", enforcementMode: "block",
    scope: "src/packages/contracts/", violationCount: 2, lastTriggered: "2026-04-09",
    linkedScript: "scripts/architecture/check-contract-registry.ts", linkedCIGate: "check-contract-registry",
    enforcementDetail: "Contract manifest ↔ source sync enforced."
  },
  {
    id: "LAW-023", name: "No Critical Button Without Test ID", ruleNumber: 23,
    description: "P0/P1 interactive elements must have stable test IDs and semantic test coverage.",
    category: "test-id-convention", severity: "high", enforcementMode: "warn",
    scope: "src/components/, src/pages/", violationCount: 8, lastTriggered: "2026-04-10",
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Test ID discipline for critical interactions."
  },
  {
    id: "LAW-024", name: "No Critical Workflow Without Journey Manifest", ruleNumber: 24,
    description: "P0 user and operator workflows must have formally modeled journey manifests.",
    category: "interaction-requirement", severity: "high", enforcementMode: "warn",
    scope: "platform-wide", violationCount: 4, lastTriggered: "2026-04-10",
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Journey coverage for critical flows required."
  },
  {
    id: "LAW-025", name: "No Feature Done Without Runtime Evidence", ruleNumber: 25,
    description: "Definition of done requires runtime probe or evidence attached, not just code existence.",
    category: "proof-requirement", severity: "high", enforcementMode: "warn",
    scope: "platform-wide", violationCount: 12, lastTriggered: "2026-04-10",
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Runtime evidence changes culture of 'done'."
  },
  {
    id: "LAW-026", name: "No Launch If P0 Journey Failures Exist", ruleNumber: 26,
    description: "Releases blocked if critical P0 journeys are failing.",
    category: "proof-requirement", severity: "critical", enforcementMode: "block",
    scope: "release-pipeline", violationCount: 0, lastTriggered: null,
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Launch gate tied to P0 journey pass rate."
  },
  {
    id: "LAW-027", name: "No Status Claim Outruns Readiness Score", ruleNumber: 27,
    description: "Documentation/status claims must not exceed actual readiness evidence.",
    category: "truth-requirement", severity: "high", enforcementMode: "warn",
    scope: "platform-wide", violationCount: 1, lastTriggered: "2026-04-08",
    linkedScript: "scripts/architecture/check-status-truth-tags.ts", linkedCIGate: "check-status-truth-tags",
    enforcementDetail: "Canonical status tags enforced."
  },
  {
    id: "LAW-028", name: "No Drift Older Than Threshold for Critical Domains", ruleNumber: 28,
    description: "Architecture drift must be resolved within 7 days for critical domains.",
    category: "domain-purity", severity: "high", enforcementMode: "warn",
    scope: "platform-wide", violationCount: 3, lastTriggered: "2026-04-10",
    linkedScript: null, linkedCIGate: null,
    enforcementDetail: "Drift policing with time-based escalation."
  },
  {
    id: "LAW-029", name: "No Hidden Mutation Path", ruleNumber: 29,
    description: "All mutation paths must go through canonical execution chain. No shadow writes.",
    category: "execution-chain", severity: "critical", enforcementMode: "block",
    scope: "platform-wide", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/check-proof-coverage.ts", linkedCIGate: "check-proof-coverage",
    enforcementDetail: "Mutation → receipt binding covers all write paths."
  },
  {
    id: "LAW-030", name: "Every Action Needs Capability Contract", ruleNumber: 30,
    description: "Name, inputs, risk class, approval/policy requirements, connector binding, expected receipts.",
    category: "capability-contract", severity: "critical", enforcementMode: "block",
    scope: "src/packages/", violationCount: 0, lastTriggered: null,
    linkedScript: "scripts/architecture/check-capability-families.ts", linkedCIGate: "check-capability-families",
    enforcementDetail: "No freeform execution. Capability family completeness checked."
  },
];

// ═══════════════════════════════════════════════════════════════
// SCAFFOLD / GENERATOR REGISTRY
// ═══════════════════════════════════════════════════════════════

export const SCAFFOLD_REGISTRY: ScaffoldEntry[] = [
  { id: "SCF-001", name: "Service Manifest Generator", scriptPath: "scripts/generate-service-manifest.ts", produces: ["service-manifest.json"], lastUsed: "2026-04-10", complianceCoverage: 95, status: "active", description: "Generates canonical service inventory manifest" },
  { id: "SCF-002", name: "Route Manifest Generator", scriptPath: "scripts/generate-route-manifest.ts", produces: ["route-manifest.json"], lastUsed: "2026-04-10", complianceCoverage: 92, status: "active", description: "Generates route → shell → owner mapping" },
  { id: "SCF-003", name: "Capability Index Generator", scriptPath: "scripts/generate-capability-index.ts", produces: ["capability-index.json"], lastUsed: "2026-04-10", complianceCoverage: 88, status: "active", description: "Indexes all capability contracts" },
  { id: "SCF-004", name: "Prompt Index Generator", scriptPath: "scripts/generate-prompt-index.ts", produces: ["prompt-index.json"], lastUsed: "2026-04-09", complianceCoverage: 85, status: "active", description: "Indexes prompt families and traceability" },
  { id: "SCF-005", name: "Connector Catalog Generator", scriptPath: "scripts/generate-connector-catalog.ts", produces: ["connector-catalog.json"], lastUsed: "2026-04-10", complianceCoverage: 90, status: "active", description: "Catalogs all managed connectors" },
  { id: "SCF-006", name: "Advisor Registry Generator", scriptPath: "scripts/generate-advisor-registry.ts", produces: ["advisor-registry.json"], lastUsed: "2026-04-09", complianceCoverage: 87, status: "active", description: "Registers advisor configurations" },
  { id: "SCF-007", name: "Contract Manifest Generator", scriptPath: "scripts/generate-contract-manifest.ts", produces: ["contract-manifest.json"], lastUsed: "2026-04-10", complianceCoverage: 93, status: "active", description: "Contract barrel export inventory" },
  { id: "SCF-008", name: "Capability Matrices Generator", scriptPath: "scripts/generate-capability-matrices.ts", produces: ["capability-event-matrix.json", "capability-owner-map.json", "capability-policy-matrix.json", "capability-receipt-matrix.json", "capability-surface-matrix.json"], lastUsed: "2026-04-10", complianceCoverage: 91, status: "active", description: "Cross-reference capability matrices" },
  { id: "SCF-009", name: "Shell Space Registry Generator", scriptPath: "scripts/generate-shell-space-registry.ts", produces: ["shell-space-registry.json"], lastUsed: "2026-04-09", complianceCoverage: 86, status: "active", description: "Shell workspace spatial registry" },
  { id: "SCF-010", name: "Runtime Conformance Generator", scriptPath: "scripts/generate-runtime-conformance.ts", produces: ["runtime-conformance-manifest.json"], lastUsed: "2026-04-10", complianceCoverage: 82, status: "active", description: "Runtime behavior conformance checks" },
  { id: "SCF-011", name: "Ownership Manifest Generator", scriptPath: "scripts/generate-ownership-manifest.ts", produces: ["ownership-manifest.json"], lastUsed: "2026-04-10", complianceCoverage: 89, status: "active", description: "Domain/service/route ownership mapping" },
  { id: "SCF-012", name: "Architecture Compliance Generator", scriptPath: "scripts/generate-architecture-compliance.ts", produces: ["architecture-compliance-report.json"], lastUsed: "2026-04-10", complianceCoverage: 94, status: "active", description: "Full architecture compliance report" },
  { id: "SCF-013", name: "Validation Summary Generator", scriptPath: "scripts/generate-validation-summary.ts", produces: ["validation-summary.json"], lastUsed: "2026-04-10", complianceCoverage: 90, status: "active", description: "Aggregated validation results" },
  { id: "SCF-014", name: "Launch Tier Index Generator", scriptPath: "scripts/generate-launch-tier-index.ts", produces: ["launch-tier-index.json"], lastUsed: "2026-04-09", complianceCoverage: 88, status: "active", description: "Launch readiness tier classification" },
  { id: "SCF-015", name: "Operational Scorecards Generator", scriptPath: "scripts/generate-operational-scorecards.ts", produces: ["operational-scorecards.json", "operational-metrics-snapshot.json"], lastUsed: "2026-04-10", complianceCoverage: 85, status: "active", description: "Operational health scorecards" },
  { id: "SCF-016", name: "Feature Integration Index Generator", scriptPath: "scripts/generate-feature-integration-index.ts", produces: ["feature-integration-index.json"], lastUsed: "2026-04-09", complianceCoverage: 83, status: "active", description: "Feature-to-feature integration map" },
  { id: "SCF-017", name: "Internal Agent Registry Generator", scriptPath: "scripts/generate-internal-agent-registry.ts", produces: ["internal-agent-registry.json"], lastUsed: "2026-04-09", complianceCoverage: 80, status: "active", description: "Internal AI agent registry" },
  { id: "SCF-018", name: "Formula Registry Generator", scriptPath: "scripts/generate-formula-registry.ts", produces: ["formula-registry.json"], lastUsed: "2026-04-08", complianceCoverage: 78, status: "active", description: "Financial formula registry" },
  { id: "SCF-019", name: "Surface Performance Budget Generator", scriptPath: "scripts/generate-surface-performance-budget.ts", produces: ["surface-performance-budget.json"], lastUsed: "2026-04-10", complianceCoverage: 84, status: "active", description: "Route performance budgets" },
  { id: "SCF-020", name: "Maturity Thresholds Generator", scriptPath: "scripts/generate-maturity-thresholds.ts", produces: ["maturity-thresholds.json"], lastUsed: "2026-04-09", complianceCoverage: 81, status: "active", description: "Feature maturity threshold definitions" },
];

// ═══════════════════════════════════════════════════════════════
// CI / PR GATE REGISTRY
// ═══════════════════════════════════════════════════════════════

export const CI_GATE_REGISTRY: CIGateEntry[] = [
  { id: "CI-001", name: "Boundary Check", scriptPath: "scripts/architecture/boundary-check.ts", type: "blocking", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "One-brain, three-domain boundary enforcement", category: "architecture" },
  { id: "CI-002", name: "Advisor Registry Sync", scriptPath: "scripts/architecture/check-advisor-registry.ts", type: "blocking", domain: "advisors", lastRun: "2026-04-10", lastStatus: "pass", description: "Advisor registry ↔ source sync", category: "architecture" },
  { id: "CI-003", name: "Capability Families", scriptPath: "scripts/architecture/check-capability-families.ts", type: "blocking", domain: "capabilities", lastRun: "2026-04-10", lastStatus: "pass", description: "Capability family completeness", category: "architecture" },
  { id: "CI-004", name: "Connector Catalog Sync", scriptPath: "scripts/architecture/check-connector-catalog.ts", type: "blocking", domain: "connectors", lastRun: "2026-04-10", lastStatus: "pass", description: "Connector catalog ↔ source sync", category: "architecture" },
  { id: "CI-005", name: "Contract Family Completeness", scriptPath: "scripts/architecture/check-contract-family-completeness.ts", type: "blocking", domain: "contracts", lastRun: "2026-04-10", lastStatus: "pass", description: "Contract barrel exports", category: "architecture" },
  { id: "CI-006", name: "Contract Registry Sync", scriptPath: "scripts/architecture/check-contract-registry.ts", type: "blocking", domain: "contracts", lastRun: "2026-04-10", lastStatus: "pass", description: "Contract manifest ↔ source sync", category: "architecture" },
  { id: "CI-007", name: "Event Catalog", scriptPath: "scripts/architecture/check-event-catalog.ts", type: "blocking", domain: "events", lastRun: "2026-04-10", lastStatus: "pass", description: "Event type barrel completeness", category: "architecture" },
  { id: "CI-008", name: "Event-Receipt Linkage", scriptPath: "scripts/architecture/check-event-receipt-linkage.ts", type: "blocking", domain: "proof", lastRun: "2026-04-10", lastStatus: "pass", description: "Event → receipt pairing", category: "architecture" },
  { id: "CI-009", name: "Module Count", scriptPath: "scripts/architecture/check-module-count.ts", type: "advisory", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "Service count budget", category: "architecture" },
  { id: "CI-010", name: "Outbound Communication Policy", scriptPath: "scripts/architecture/check-outbound-communication-policy.ts", type: "blocking", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "No raw HTTP in domain code", category: "architecture" },
  { id: "CI-011", name: "Policy Coverage", scriptPath: "scripts/architecture/check-policy-coverage.ts", type: "blocking", domain: "policy", lastRun: "2026-04-10", lastStatus: "pass", description: "Capability → policy binding", category: "architecture" },
  { id: "CI-012", name: "Proof Coverage", scriptPath: "scripts/architecture/check-proof-coverage.ts", type: "blocking", domain: "proof", lastRun: "2026-04-10", lastStatus: "pass", description: "Mutation → receipt binding", category: "architecture" },
  { id: "CI-013", name: "Sensitive Document Privacy", scriptPath: "scripts/architecture/check-sensitive-document-privacy.ts", type: "blocking", domain: "security", lastRun: "2026-04-10", lastStatus: "pass", description: "No PII in generated artifacts", category: "architecture" },
  { id: "CI-014", name: "Service Sprawl", scriptPath: "scripts/architecture/check-service-sprawl.ts", type: "advisory", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "Service sprawl detection", category: "architecture" },
  { id: "CI-015", name: "Status Truth Tags", scriptPath: "scripts/architecture/check-status-truth-tags.ts", type: "blocking", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "Canonical status tags", category: "architecture" },
  { id: "CI-016", name: "Surface Ownership", scriptPath: "scripts/architecture/check-surface-ownership.ts", type: "blocking", domain: "surfaces", lastRun: "2026-04-10", lastStatus: "fail", description: "Route → owner mapping", category: "architecture" },
  { id: "CI-017", name: "Workflow State Usage", scriptPath: "scripts/architecture/check-workflow-state-usage.ts", type: "blocking", domain: "workflow", lastRun: "2026-04-10", lastStatus: "pass", description: "Workflow state machine usage", category: "architecture" },
  { id: "CI-018", name: "Single Brain", scriptPath: "scripts/check-single-brain.ts", type: "blocking", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "Single intelligence authority", category: "validation" },
  { id: "CI-019", name: "Import Boundaries", scriptPath: "scripts/check-import-boundaries.ts", type: "blocking", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "Cross-domain import rules", category: "validation" },
  { id: "CI-020", name: "RLS Coverage", scriptPath: "scripts/check-rls-coverage.ts", type: "blocking", domain: "security", lastRun: "2026-04-10", lastStatus: "pass", description: "Row-level security coverage", category: "validation" },
  { id: "CI-021", name: "Edge Function Health", scriptPath: "scripts/check-edge-function-health.ts", type: "blocking", domain: "platform", lastRun: "2026-04-09", lastStatus: "pass", description: "Edge function structure", category: "validation" },
  { id: "CI-022", name: "Package Exports", scriptPath: "scripts/check-package-exports.ts", type: "blocking", domain: "contracts", lastRun: "2026-04-10", lastStatus: "pass", description: "Package barrel export coverage", category: "validation" },
  { id: "CI-023", name: "Contract Completeness", scriptPath: "scripts/check-contract-completeness.ts", type: "blocking", domain: "contracts", lastRun: "2026-04-10", lastStatus: "pass", description: "Contract type completeness", category: "validation" },
  { id: "CI-024", name: "Canonical Imports", scriptPath: "scripts/check-canonical-imports.ts", type: "blocking", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "Canonical import paths", category: "validation" },
  { id: "CI-025", name: "Route-Page Contract Usage", scriptPath: "scripts/validation/check-route-page-contract-layer-usage.ts", type: "advisory", domain: "surfaces", lastRun: "2026-04-09", lastStatus: "pass", description: "Page should import from contract barrels", category: "validation" },
  { id: "CI-026", name: "Generated Truth", scriptPath: "scripts/validation/generated-truth.ts", type: "blocking", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "Generated file truth validation", category: "validation" },
  { id: "CI-027", name: "Schema Compliance", scriptPath: "scripts/validation/schema-compliance.ts", type: "blocking", domain: "contracts", lastRun: "2026-04-10", lastStatus: "pass", description: "Schema compliance validation", category: "validation" },
  { id: "CI-028", name: "Generate All", scriptPath: "scripts/generate-all.ts", type: "blocking", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "Master generation orchestrator", category: "master" },
  { id: "CI-029", name: "Validate All", scriptPath: "scripts/validate-all.ts", type: "blocking", domain: "platform", lastRun: "2026-04-10", lastStatus: "pass", description: "Master validation orchestrator", category: "master" },
];

// ═══════════════════════════════════════════════════════════════
// MANIFEST REQUIREMENTS
// ═══════════════════════════════════════════════════════════════

export const MANIFEST_REQUIREMENTS: ManifestRequirement[] = [
  { id: "MR-001", type: "Feature Manifest", description: "Canonical feature definition with ID, owner, domain, status, dependencies", requiredForP0: true, requiredForP1: true, domain: "all", completionRate: 78, totalFeatures: 45, compliantFeatures: 35 },
  { id: "MR-002", type: "Route Inventory", description: "Route → shell → owner mapping for all pages", requiredForP0: true, requiredForP1: true, domain: "surfaces", completionRate: 85, totalFeatures: 120, compliantFeatures: 102 },
  { id: "MR-003", type: "Contract Declarations", description: "Typed contract for all API endpoints and capabilities", requiredForP0: true, requiredForP1: false, domain: "contracts", completionRate: 72, totalFeatures: 60, compliantFeatures: 43 },
  { id: "MR-004", type: "Interaction Registry Entries", description: "Stable IDs and expected outcomes for P0/P1 interactions", requiredForP0: true, requiredForP1: false, domain: "interactions", completionRate: 45, totalFeatures: 200, compliantFeatures: 90 },
  { id: "MR-005", type: "Journey Manifests", description: "Formally modeled journey steps for critical workflows", requiredForP0: true, requiredForP1: false, domain: "journeys", completionRate: 52, totalFeatures: 50, compliantFeatures: 26 },
  { id: "MR-006", type: "Ownership Mapping", description: "Every domain/shell/contract/route has named owner", requiredForP0: true, requiredForP1: true, domain: "governance", completionRate: 88, totalFeatures: 30, compliantFeatures: 26 },
  { id: "MR-007", type: "Readiness Criteria", description: "Definition of done with runtime evidence expectations", requiredForP0: true, requiredForP1: false, domain: "readiness", completionRate: 40, totalFeatures: 45, compliantFeatures: 18 },
  { id: "MR-008", type: "Runtime Evidence", description: "Probe or evidence attached proving feature works", requiredForP0: true, requiredForP1: false, domain: "runtime", completionRate: 35, totalFeatures: 45, compliantFeatures: 16 },
  { id: "MR-009", type: "Test ID Coverage", description: "Stable test selectors for P0 interactive elements", requiredForP0: true, requiredForP1: false, domain: "testing", completionRate: 42, totalFeatures: 200, compliantFeatures: 84 },
  { id: "MR-010", type: "Command Palette Registration", description: "Workspace registered in command palette for discoverability", requiredForP0: false, requiredForP1: true, domain: "surfaces", completionRate: 75, totalFeatures: 80, compliantFeatures: 60 },
];

// ═══════════════════════════════════════════════════════════════
// OWNERSHIP REGISTRY
// ═══════════════════════════════════════════════════════════════

export const OWNERSHIP_REGISTRY: OwnershipEntry[] = [
  { id: "OWN-001", area: "Finance Domain", owner: "finance-team", type: "domain", unresolvedViolations: 2, driftCount: 1, missingManifests: 3, complianceScore: 82 },
  { id: "OWN-002", area: "Business Domain", owner: "business-team", type: "domain", unresolvedViolations: 1, driftCount: 0, missingManifests: 2, complianceScore: 88 },
  { id: "OWN-003", area: "Concierge Domain", owner: "concierge-team", type: "domain", unresolvedViolations: 0, driftCount: 1, missingManifests: 4, complianceScore: 79 },
  { id: "OWN-004", area: "Platform Core", owner: "platform-team", type: "domain", unresolvedViolations: 3, driftCount: 2, missingManifests: 1, complianceScore: 85 },
  { id: "OWN-005", area: "Admin Shell", owner: "platform-team", type: "shell", unresolvedViolations: 1, driftCount: 0, missingManifests: 0, complianceScore: 95 },
  { id: "OWN-006", area: "Owner Shell", owner: "owner-team", type: "shell", unresolvedViolations: 0, driftCount: 0, missingManifests: 1, complianceScore: 92 },
  { id: "OWN-007", area: "Money Office Shell", owner: "finance-team", type: "shell", unresolvedViolations: 1, driftCount: 1, missingManifests: 2, complianceScore: 84 },
  { id: "OWN-008", area: "Revenue Office Shell", owner: "business-team", type: "shell", unresolvedViolations: 0, driftCount: 0, missingManifests: 1, complianceScore: 90 },
  { id: "OWN-009", area: "Contract Layer", owner: "platform-team", type: "contract", unresolvedViolations: 2, driftCount: 1, missingManifests: 0, complianceScore: 87 },
  { id: "OWN-010", area: "Proof & Receipt System", owner: "platform-team", type: "service", unresolvedViolations: 1, driftCount: 0, missingManifests: 0, complianceScore: 93 },
  { id: "OWN-011", area: "AI Engineering", owner: "ai-team", type: "domain", unresolvedViolations: 0, driftCount: 1, missingManifests: 2, complianceScore: 86 },
  { id: "OWN-012", area: "Connector Governance", owner: "platform-team", type: "service", unresolvedViolations: 0, driftCount: 0, missingManifests: 1, complianceScore: 91 },
  { id: "OWN-013", area: "Identity & Auth", owner: "security-team", type: "service", unresolvedViolations: 0, driftCount: 0, missingManifests: 0, complianceScore: 96 },
  { id: "OWN-014", area: "Runtime Probes", owner: "reliability-team", type: "probe", unresolvedViolations: 0, driftCount: 0, missingManifests: 3, complianceScore: 78 },
  { id: "OWN-015", area: "Launch Gates", owner: "release-team", type: "manifest", unresolvedViolations: 0, driftCount: 0, missingManifests: 0, complianceScore: 94 },
];

// ═══════════════════════════════════════════════════════════════
// ENFORCEMENT LAYER DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface EnforcementLayer {
  id: string;
  name: string;
  description: string;
  healthScore: number;
  totalChecks: number;
  passingChecks: number;
  linkedPage: string;
  artifacts: string[];
}

export const ENFORCEMENT_LAYERS: EnforcementLayer[] = [
  { id: "L1", name: "Law", description: "Canonical laws and rules", healthScore: 93, totalChecks: 30, passingChecks: 28, linkedPage: "/admin/platform-law/laws", artifacts: ["constitution docs", "rule packs", "policy files", "validation schemas"] },
  { id: "L2", name: "Scaffolding", description: "Generators that create compliant structure by default", healthScore: 88, totalChecks: 20, passingChecks: 18, linkedPage: "/admin/platform-law/scaffolds", artifacts: ["feature generators", "route generators", "contract generators", "test generators"] },
  { id: "L3", name: "Static Enforcement", description: "CI/PR checks before merge", healthScore: 91, totalChecks: 29, passingChecks: 28, linkedPage: "/admin/platform-law/ci-gates", artifacts: ["lint rules", "import rules", "manifest validators", "contract validators"] },
  { id: "L4", name: "Behavioral Enforcement", description: "Checks if UI actually works", healthScore: 72, totalChecks: 14, passingChecks: 10, linkedPage: "/admin/verification/overview", artifacts: ["interaction registry", "journey manifests", "E2E tests", "runtime probes"] },
  { id: "L5", name: "Runtime Enforcement", description: "Checks live system truth", healthScore: 68, totalChecks: 12, passingChecks: 8, linkedPage: "/admin/implementation-truth/runtime", artifacts: ["health probes", "mutation evidence", "proof generation", "page load probes"] },
  { id: "L6", name: "Release Enforcement", description: "Blocks launches if critical truth is missing", healthScore: 85, totalChecks: 8, passingChecks: 7, linkedPage: "/admin/implementation-truth/launch-gate", artifacts: ["launch truth gates", "behavior truth gates", "readiness thresholds"] },
  { id: "L7", name: "Governance Visibility", description: "Makes truth visible to humans", healthScore: 90, totalChecks: 7, passingChecks: 7, linkedPage: "/admin/platform-law", artifacts: ["truth center", "compliance dashboards", "drift radar", "accountability boards"] },
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getLawsByCategory(category: LawCategory): PlatformLaw[] {
  return PLATFORM_LAWS.filter(l => l.category === category);
}

export function getLawsBySeverity(severity: LawSeverity): PlatformLaw[] {
  return PLATFORM_LAWS.filter(l => l.severity === severity);
}

export function getBlockingLaws(): PlatformLaw[] {
  return PLATFORM_LAWS.filter(l => l.enforcementMode === "block");
}

export function getViolatedLaws(): PlatformLaw[] {
  return PLATFORM_LAWS.filter(l => l.violationCount > 0);
}

export function getTotalViolations(): number {
  return PLATFORM_LAWS.reduce((sum, l) => sum + l.violationCount, 0);
}

export function getOverallComplianceScore(): number {
  const total = PLATFORM_LAWS.length;
  const passing = PLATFORM_LAWS.filter(l => l.violationCount === 0).length;
  return Math.round((passing / total) * 100);
}

export function getCIGatePassRate(): number {
  const total = CI_GATE_REGISTRY.length;
  const passing = CI_GATE_REGISTRY.filter(g => g.lastStatus === "pass").length;
  return Math.round((passing / total) * 100);
}

export function getManifestCompletionRate(): number {
  const total = MANIFEST_REQUIREMENTS.reduce((s, m) => s + m.totalFeatures, 0);
  const compliant = MANIFEST_REQUIREMENTS.reduce((s, m) => s + m.compliantFeatures, 0);
  return total > 0 ? Math.round((compliant / total) * 100) : 0;
}

export function getOwnerComplianceAverage(): number {
  const scores = OWNERSHIP_REGISTRY.map(o => o.complianceScore);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function getEnforcementLayerAverage(): number {
  const scores = ENFORCEMENT_LAYERS.map(l => l.healthScore);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
