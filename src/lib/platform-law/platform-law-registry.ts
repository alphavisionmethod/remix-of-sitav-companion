// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Law & Truth Enforcement Registry
// Full 14-Type Schema (A–N) with seeded data + helpers
// ═══════════════════════════════════════════════════════════════

// ─── Shared enums ────────────────────────────────────────────

export type EnforcementMode = "block" | "warn" | "log" | "disabled";
export type LawCategory =
  | "route-ownership" | "shell-requirement" | "contract-ownership"
  | "import-boundary" | "manifest-requirement" | "interaction-requirement"
  | "proof-requirement" | "naming-convention" | "test-id-convention"
  | "prompt-traceability" | "domain-purity" | "execution-chain"
  | "memory-governance" | "service-budget" | "connector-governance"
  | "approval-governance" | "capability-contract" | "truth-requirement"
  | "policy-governance" | "cost-governance";

export type LawSeverity = "critical" | "high" | "medium" | "low";

export type RuleType =
  | "location" | "ownership" | "import_boundary" | "manifest_required"
  | "contract_required" | "interaction_required" | "journey_required"
  | "runtime_evidence_required" | "launch_gate" | "naming" | "selector"
  | "readiness" | "other";

export type ScopeType =
  | "feature" | "route" | "component" | "contract" | "service"
  | "interaction" | "journey" | "deployment" | "global";

export type LawPackScope =
  | "global" | "admin" | "finance" | "money_office" | "engineering"
  | "deployment" | "ui" | "contracts" | "launch" | "custom";

export type DriftType =
  | "spec_code" | "contract_code" | "route_shell" | "manifest_impl"
  | "runtime_claim" | "prompt_impl" | "docs_runtime" | "selector_drift"
  | "journey_drift" | "other";

export type EvidenceType =
  | "route_render" | "data_load" | "mutation_persisted" | "event_emitted"
  | "projection_updated" | "proof_generated" | "redirect_verified"
  | "form_submitted" | "journey_completed" | "other";

export type ValidationRunType =
  | "local" | "ci" | "nightly" | "pre_release" | "runtime_probe" | "launch_gate";

export type ViolationStatus = "open" | "acknowledged" | "resolved" | "waived";

// ═══════════════════════════════════════════════════════════════
// A. PlatformLawPack
// ═══════════════════════════════════════════════════════════════

export interface PlatformLawPack {
  lawPackId: string;
  name: string;
  version: string;
  description: string;
  scope: LawPackScope;
  ruleIds: string[];
  severityModel: "strict" | "advisory" | "learning";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const LAW_PACKS: PlatformLawPack[] = [
  {
    lawPackId: "LP-001", name: "Core Architecture Pack", version: "2.1.0",
    description: "Foundational architecture laws — brain, domains, execution chain, proof layer",
    scope: "global", ruleIds: ["LAW-001","LAW-002","LAW-003","LAW-004","LAW-005","LAW-006","LAW-007","LAW-010","LAW-029"],
    severityModel: "strict", active: true, createdAt: "2026-01-15", updatedAt: "2026-04-10"
  },
  {
    lawPackId: "LP-002", name: "Governance & Policy Pack", version: "1.4.0",
    description: "Policy versioning, approval governance, self-learning boundaries, consent",
    scope: "global", ruleIds: ["LAW-008","LAW-009","LAW-013","LAW-014","LAW-015","LAW-016","LAW-017","LAW-018","LAW-019"],
    severityModel: "strict", active: true, createdAt: "2026-02-01", updatedAt: "2026-04-08"
  },
  {
    lawPackId: "LP-003", name: "Manifest & Compliance Pack", version: "1.2.0",
    description: "Feature manifests, route ownership, contract declarations, test IDs, journey requirements",
    scope: "global", ruleIds: ["LAW-020","LAW-021","LAW-022","LAW-023","LAW-024","LAW-025","LAW-030"],
    severityModel: "strict", active: true, createdAt: "2026-03-01", updatedAt: "2026-04-10"
  },
  {
    lawPackId: "LP-004", name: "Launch & Truth Pack", version: "1.0.0",
    description: "Launch gate enforcement, readiness truth, drift policing, status honesty",
    scope: "launch", ruleIds: ["LAW-011","LAW-012","LAW-026","LAW-027","LAW-028"],
    severityModel: "strict", active: true, createdAt: "2026-03-15", updatedAt: "2026-04-10"
  },
];

// ═══════════════════════════════════════════════════════════════
// B. PlatformLaw (extended from original)
// ═══════════════════════════════════════════════════════════════

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
  // Extended fields (spec B)
  ruleType: RuleType;
  scopeType: ScopeType;
  machineCheckable: boolean;
  remediationGuidance: string;
  active: boolean;
  createdAt: string;
  lawPackId: string;
}

export const PLATFORM_LAWS: PlatformLaw[] = [
  { id: "LAW-001", name: "One Sovereign Brain", ruleNumber: 1, description: "brain-core is sole authority for intent, arbitration, planning, execution auth. No duplicate intelligence.", category: "domain-purity", severity: "critical", enforcementMode: "block", scope: "platform-wide", violationCount: 0, lastTriggered: null, linkedScript: "scripts/check-single-brain.ts", linkedCIGate: "check-single-brain", enforcementDetail: "CI blocks any PR introducing a second brain/intelligence authority.", ruleType: "ownership", scopeType: "global", machineCheckable: true, remediationGuidance: "Remove duplicate intelligence authority. Only brain-core may arbitrate.", active: true, createdAt: "2026-01-15", lawPackId: "LP-001" },
  { id: "LAW-002", name: "Exactly 3 Top-Level Domains", ruleNumber: 2, description: "finance-os, business-os, concierge-os. No 4th module ever.", category: "domain-purity", severity: "critical", enforcementMode: "block", scope: "src/packages/", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/boundary-check.ts", linkedCIGate: "boundary-check", enforcementDetail: "Boundary check rejects any 4th top-level domain module.", ruleType: "import_boundary", scopeType: "global", machineCheckable: true, remediationGuidance: "Place new functionality under one of the 3 existing domains.", active: true, createdAt: "2026-01-15", lawPackId: "LP-001" },
  { id: "LAW-003", name: "Submodule Rule", ruleNumber: 3, description: "Anything in finance/business/concierge is a submodule under one of the 3.", category: "domain-purity", severity: "high", enforcementMode: "block", scope: "src/packages/", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/boundary-check.ts", linkedCIGate: "boundary-check", enforcementDetail: "Boundary check enforces submodule nesting.", ruleType: "location", scopeType: "component", machineCheckable: true, remediationGuidance: "Move the module under its parent domain package.", active: true, createdAt: "2026-01-15", lawPackId: "LP-001" },
  { id: "LAW-004", name: "Domain Purity", ruleNumber: 4, description: "Domains reason, evaluate, explain, propose. No execution, no API calls, no cross-domain calls.", category: "domain-purity", severity: "critical", enforcementMode: "block", scope: "src/packages/", violationCount: 1, lastTriggered: "2026-04-08", linkedScript: "scripts/check-import-boundaries.ts", linkedCIGate: "check-import-boundaries", enforcementDetail: "Import boundary checker blocks cross-domain and outbound calls from domain code.", ruleType: "import_boundary", scopeType: "component", machineCheckable: true, remediationGuidance: "Remove direct API calls and cross-domain imports. Use platform services.", active: true, createdAt: "2026-01-15", lawPackId: "LP-001" },
  { id: "LAW-005", name: "One Canonical Execution Chain", ruleNumber: 5, description: "Intent → Brain Core → Policy Engine → Capability Router → Executor → Receipt → Event Bus → Read Models.", category: "execution-chain", severity: "critical", enforcementMode: "block", scope: "platform-wide", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/check-outbound-communication-policy.ts", linkedCIGate: "check-outbound-communication-policy", enforcementDetail: "No raw HTTP in domain code. All execution through canonical chain.", ruleType: "ownership", scopeType: "global", machineCheckable: true, remediationGuidance: "Route all execution through the canonical chain. No direct HTTP.", active: true, createdAt: "2026-01-15", lawPackId: "LP-001" },
  { id: "LAW-006", name: "Executor as Sole Choke Point", ruleNumber: 6, description: "Envelope validation, signature, policy hash, approval proof, evidence grade, budget, idempotency, receipt.", category: "execution-chain", severity: "critical", enforcementMode: "block", scope: "src/packages/platform/", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/check-proof-coverage.ts", linkedCIGate: "check-proof-coverage", enforcementDetail: "Mutation → receipt binding enforced.", ruleType: "contract_required", scopeType: "service", machineCheckable: true, remediationGuidance: "Ensure all mutations pass through the executor with receipt generation.", active: true, createdAt: "2026-01-15", lawPackId: "LP-001" },
  { id: "LAW-007", name: "Unified Proof Layer", ruleNumber: 7, description: "Audit-ledger, proof-orchestrator, receipts, refusal-receipts, evidence-bundles, immutable-events.", category: "proof-requirement", severity: "critical", enforcementMode: "block", scope: "platform-wide", violationCount: 2, lastTriggered: "2026-04-09", linkedScript: "scripts/architecture/check-proof-coverage.ts", linkedCIGate: "check-proof-coverage", enforcementDetail: "Every mutation must have receipt binding.", ruleType: "runtime_evidence_required", scopeType: "global", machineCheckable: true, remediationGuidance: "Add receipt generation for all mutation paths.", active: true, createdAt: "2026-01-15", lawPackId: "LP-001" },
  { id: "LAW-008", name: "Governed Memory System", ruleNumber: 8, description: "Source attribution, evidence grades, conflict detection, privacy tiers, expiration, correction, forget.", category: "memory-governance", severity: "high", enforcementMode: "warn", scope: "src/packages/platform/memory/", violationCount: 0, lastTriggered: null, linkedScript: null, linkedCIGate: null, enforcementDetail: "Memory writes require provenance. Inferred cannot overwrite confirmed.", ruleType: "ownership", scopeType: "service", machineCheckable: false, remediationGuidance: "Add provenance metadata to all memory writes.", active: true, createdAt: "2026-02-01", lawPackId: "LP-002" },
  { id: "LAW-009", name: "Identity & Relationship Graph as Infra", ruleNumber: 9, description: "Household, org, roles, delegated authority, device ownership, permissions, inheritance, revocation.", category: "domain-purity", severity: "high", enforcementMode: "warn", scope: "src/packages/platform/identity/", violationCount: 0, lastTriggered: null, linkedScript: null, linkedCIGate: null, enforcementDetail: "Identity primitives must live in platform, not duplicated in domains.", ruleType: "location", scopeType: "service", machineCheckable: true, remediationGuidance: "Move identity primitives to platform package.", active: true, createdAt: "2026-02-01", lawPackId: "LP-002" },
  { id: "LAW-010", name: "Thin Surfaces", ruleNumber: 10, description: "Surfaces render, collect input, request approval, display state. No business logic.", category: "domain-purity", severity: "critical", enforcementMode: "block", scope: "src/pages/, src/components/", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/boundary-check.ts", linkedCIGate: "boundary-check", enforcementDetail: "Surface-owned business logic is a banned anti-pattern.", ruleType: "import_boundary", scopeType: "component", machineCheckable: true, remediationGuidance: "Extract business logic to domain services. Surfaces only render.", active: true, createdAt: "2026-01-15", lawPackId: "LP-001" },
  { id: "LAW-011", name: "~45 Canonical Services Max", ruleNumber: 11, description: "Service count budget. No unbounded sprawl.", category: "service-budget", severity: "high", enforcementMode: "warn", scope: "platform-wide", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/check-module-count.ts", linkedCIGate: "check-module-count", enforcementDetail: "Service count checked against budget.", ruleType: "other", scopeType: "global", machineCheckable: true, remediationGuidance: "Consolidate services. Target ≤45 canonical services.", active: true, createdAt: "2026-03-15", lawPackId: "LP-004" },
  { id: "LAW-012", name: "Truth is Never Model Output Alone", ruleNumber: 12, description: "LLM output = proposal, never fact. Facts from verified records, governed memory, connectors with provenance.", category: "truth-requirement", severity: "critical", enforcementMode: "block", scope: "platform-wide", violationCount: 0, lastTriggered: null, linkedScript: null, linkedCIGate: null, enforcementDetail: "No execution on raw model confidence. No memory write as fact without provenance.", ruleType: "runtime_evidence_required", scopeType: "global", machineCheckable: false, remediationGuidance: "Mark all LLM outputs as proposals. Require provenance for facts.", active: true, createdAt: "2026-03-15", lawPackId: "LP-004" },
  { id: "LAW-013", name: "Explicit Workflow State Machine", ruleNumber: 13, description: "draft → proposed → policy-checked → awaiting-approval → approved → executing → succeeded/failed.", category: "execution-chain", severity: "high", enforcementMode: "warn", scope: "src/packages/platform/workflow/", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/check-workflow-state-usage.ts", linkedCIGate: "check-workflow-state-usage", enforcementDetail: "Workflow transitions must be policy-aware, event-emitting, replayable.", ruleType: "contract_required", scopeType: "service", machineCheckable: true, remediationGuidance: "Use canonical workflow state machine for all workflows.", active: true, createdAt: "2026-02-01", lawPackId: "LP-002" },
  { id: "LAW-014", name: "Exception Handling as First-Class System", ruleNumber: 14, description: "Typed exceptions, policy refusals, compensation, rollback, escalation, postmortem receipts.", category: "execution-chain", severity: "high", enforcementMode: "warn", scope: "platform-wide", violationCount: 0, lastTriggered: null, linkedScript: null, linkedCIGate: null, enforcementDetail: "Every failed/refused action generates receipt.", ruleType: "runtime_evidence_required", scopeType: "global", machineCheckable: false, remediationGuidance: "Generate receipts for all failed/refused actions.", active: true, createdAt: "2026-02-01", lawPackId: "LP-002" },
  { id: "LAW-015", name: "Policies Versioned, No Silent Weakening", ruleNumber: 15, description: "Policy versioning, hashable bundles, change history, approval for weakening, rollback, regression tests.", category: "policy-governance", severity: "critical", enforcementMode: "block", scope: "src/packages/platform/policy/", violationCount: 0, lastTriggered: null, linkedScript: null, linkedCIGate: null, enforcementDetail: "Policy changes require approval workflow. No silent weakening.", ruleType: "ownership", scopeType: "service", machineCheckable: false, remediationGuidance: "Version all policies. Require approval for weakening changes.", active: true, createdAt: "2026-02-01", lawPackId: "LP-002" },
  { id: "LAW-016", name: "Self-Learning Never Mutates Authority", ruleNumber: 16, description: "May optimize suggestions/preferences. May NOT change permissions, authority, policy, evidence thresholds.", category: "approval-governance", severity: "critical", enforcementMode: "block", scope: "platform-wide", violationCount: 0, lastTriggered: null, linkedScript: null, linkedCIGate: null, enforcementDetail: "Self-learning boundary enforcement.", ruleType: "ownership", scopeType: "global", machineCheckable: false, remediationGuidance: "Ensure self-learning only modifies suggestions, never authority.", active: true, createdAt: "2026-02-01", lawPackId: "LP-002" },
  { id: "LAW-017", name: "Advisor Orchestration Formalized", ruleNumber: 17, description: "Advisor-registry, council-orchestrator, routing rules, confidence/dissent handling, escalation.", category: "domain-purity", severity: "high", enforcementMode: "warn", scope: "src/packages/platform/advisors/", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/check-advisor-registry.ts", linkedCIGate: "check-advisor-registry", enforcementDetail: "Advisors advise; only sovereign control authorizes.", ruleType: "contract_required", scopeType: "service", machineCheckable: true, remediationGuidance: "Register all advisors. Route through council orchestrator.", active: true, createdAt: "2026-02-01", lawPackId: "LP-002" },
  { id: "LAW-018", name: "Connector Governance = Security Boundary", ruleNumber: 18, description: "Declared capabilities, scoped permissions, rate limits, health, kill switch, certification.", category: "connector-governance", severity: "critical", enforcementMode: "block", scope: "src/packages/platform/connectors/", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/check-connector-catalog.ts", linkedCIGate: "check-connector-catalog", enforcementDetail: "No unmanaged connectors. Certification before production.", ruleType: "contract_required", scopeType: "service", machineCheckable: true, remediationGuidance: "Register and certify all connectors before production use.", active: true, createdAt: "2026-02-01", lawPackId: "LP-002" },
  { id: "LAW-019", name: "Consent/Permissions UX as Platform Feature", ruleNumber: 19, description: "Who can do what, on whose behalf, under what limits, for how long. Immediate revoke.", category: "approval-governance", severity: "high", enforcementMode: "warn", scope: "platform-wide", violationCount: 0, lastTriggered: null, linkedScript: null, linkedCIGate: null, enforcementDetail: "Consent receipts generated for all permission grants.", ruleType: "interaction_required", scopeType: "global", machineCheckable: false, remediationGuidance: "Generate consent receipts for permission grants.", active: true, createdAt: "2026-02-01", lawPackId: "LP-002" },
  { id: "LAW-020", name: "No Feature Without Manifest", ruleNumber: 20, description: "Every major feature requires feature manifest, route inventory, contract declarations, ownership mapping.", category: "manifest-requirement", severity: "critical", enforcementMode: "block", scope: "platform-wide", violationCount: 5, lastTriggered: "2026-04-10", linkedScript: "scripts/check-contract-completeness.ts", linkedCIGate: "check-contract-completeness", enforcementDetail: "No manifest = incomplete feature by definition.", ruleType: "manifest_required", scopeType: "feature", machineCheckable: true, remediationGuidance: "Create feature manifest with ID, owner, domain, dependencies.", active: true, createdAt: "2026-03-01", lawPackId: "LP-003" },
  { id: "LAW-021", name: "No Route Without Shell Mapping", ruleNumber: 21, description: "Every route must declare its shell, owner, and load expectations.", category: "route-ownership", severity: "critical", enforcementMode: "block", scope: "src/pages/", violationCount: 3, lastTriggered: "2026-04-10", linkedScript: "scripts/architecture/check-surface-ownership.ts", linkedCIGate: "check-surface-ownership", enforcementDetail: "Route → owner mapping enforced.", ruleType: "ownership", scopeType: "route", machineCheckable: true, remediationGuidance: "Register route in shell mapping with owner and load budget.", active: true, createdAt: "2026-03-01", lawPackId: "LP-003" },
  { id: "LAW-022", name: "No API Without Contract", ruleNumber: 22, description: "Every API endpoint and capability must have a typed contract definition.", category: "contract-ownership", severity: "critical", enforcementMode: "block", scope: "src/packages/contracts/", violationCount: 2, lastTriggered: "2026-04-09", linkedScript: "scripts/architecture/check-contract-registry.ts", linkedCIGate: "check-contract-registry", enforcementDetail: "Contract manifest ↔ source sync enforced.", ruleType: "contract_required", scopeType: "contract", machineCheckable: true, remediationGuidance: "Create typed contract in contracts package for the API.", active: true, createdAt: "2026-03-01", lawPackId: "LP-003" },
  { id: "LAW-023", name: "No Critical Button Without Test ID", ruleNumber: 23, description: "P0/P1 interactive elements must have stable test IDs and semantic test coverage.", category: "test-id-convention", severity: "high", enforcementMode: "warn", scope: "src/components/, src/pages/", violationCount: 8, lastTriggered: "2026-04-10", linkedScript: null, linkedCIGate: null, enforcementDetail: "Test ID discipline for critical interactions.", ruleType: "selector", scopeType: "component", machineCheckable: true, remediationGuidance: "Add data-testid to all P0/P1 interactive elements.", active: true, createdAt: "2026-03-01", lawPackId: "LP-003" },
  { id: "LAW-024", name: "No Critical Workflow Without Journey Manifest", ruleNumber: 24, description: "P0 user and operator workflows must have formally modeled journey manifests.", category: "interaction-requirement", severity: "high", enforcementMode: "warn", scope: "platform-wide", violationCount: 4, lastTriggered: "2026-04-10", linkedScript: null, linkedCIGate: null, enforcementDetail: "Journey coverage for critical flows required.", ruleType: "journey_required", scopeType: "journey", machineCheckable: false, remediationGuidance: "Create journey manifest for all P0 workflows.", active: true, createdAt: "2026-03-01", lawPackId: "LP-003" },
  { id: "LAW-025", name: "No Feature Done Without Runtime Evidence", ruleNumber: 25, description: "Definition of done requires runtime probe or evidence attached, not just code existence.", category: "proof-requirement", severity: "high", enforcementMode: "warn", scope: "platform-wide", violationCount: 12, lastTriggered: "2026-04-10", linkedScript: null, linkedCIGate: null, enforcementDetail: "Runtime evidence changes culture of 'done'.", ruleType: "runtime_evidence_required", scopeType: "feature", machineCheckable: false, remediationGuidance: "Attach runtime evidence or probe to feature completion.", active: true, createdAt: "2026-03-01", lawPackId: "LP-003" },
  { id: "LAW-026", name: "No Launch If P0 Journey Failures Exist", ruleNumber: 26, description: "Releases blocked if critical P0 journeys are failing.", category: "proof-requirement", severity: "critical", enforcementMode: "block", scope: "release-pipeline", violationCount: 0, lastTriggered: null, linkedScript: null, linkedCIGate: null, enforcementDetail: "Launch gate tied to P0 journey pass rate.", ruleType: "launch_gate", scopeType: "deployment", machineCheckable: true, remediationGuidance: "Fix all P0 journey failures before release.", active: true, createdAt: "2026-03-15", lawPackId: "LP-004" },
  { id: "LAW-027", name: "No Status Claim Outruns Readiness Score", ruleNumber: 27, description: "Documentation/status claims must not exceed actual readiness evidence.", category: "truth-requirement", severity: "high", enforcementMode: "warn", scope: "platform-wide", violationCount: 1, lastTriggered: "2026-04-08", linkedScript: "scripts/architecture/check-status-truth-tags.ts", linkedCIGate: "check-status-truth-tags", enforcementDetail: "Canonical status tags enforced.", ruleType: "readiness", scopeType: "global", machineCheckable: true, remediationGuidance: "Align status claims with readiness score evidence.", active: true, createdAt: "2026-03-15", lawPackId: "LP-004" },
  { id: "LAW-028", name: "No Drift Older Than Threshold for Critical Domains", ruleNumber: 28, description: "Architecture drift must be resolved within 7 days for critical domains.", category: "domain-purity", severity: "high", enforcementMode: "warn", scope: "platform-wide", violationCount: 3, lastTriggered: "2026-04-10", linkedScript: null, linkedCIGate: null, enforcementDetail: "Drift policing with time-based escalation.", ruleType: "other", scopeType: "global", machineCheckable: true, remediationGuidance: "Resolve critical drift within 7 days or escalate.", active: true, createdAt: "2026-03-15", lawPackId: "LP-004" },
  { id: "LAW-029", name: "No Hidden Mutation Path", ruleNumber: 29, description: "All mutation paths must go through canonical execution chain. No shadow writes.", category: "execution-chain", severity: "critical", enforcementMode: "block", scope: "platform-wide", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/check-proof-coverage.ts", linkedCIGate: "check-proof-coverage", enforcementDetail: "Mutation → receipt binding covers all write paths.", ruleType: "runtime_evidence_required", scopeType: "global", machineCheckable: true, remediationGuidance: "Route all mutations through canonical chain with receipts.", active: true, createdAt: "2026-01-15", lawPackId: "LP-001" },
  { id: "LAW-030", name: "Every Action Needs Capability Contract", ruleNumber: 30, description: "Name, inputs, risk class, approval/policy requirements, connector binding, expected receipts.", category: "capability-contract", severity: "critical", enforcementMode: "block", scope: "src/packages/", violationCount: 0, lastTriggered: null, linkedScript: "scripts/architecture/check-capability-families.ts", linkedCIGate: "check-capability-families", enforcementDetail: "No freeform execution. Capability family completeness checked.", ruleType: "contract_required", scopeType: "service", machineCheckable: true, remediationGuidance: "Define capability contract with risk class, policy requirements, receipts.", active: true, createdAt: "2026-03-01", lawPackId: "LP-003" },
];

// ═══════════════════════════════════════════════════════════════
// C. FeatureManifestRecord
// ═══════════════════════════════════════════════════════════════

export interface FeatureManifestRecord {
  featureManifestId: string;
  featureId: string;
  canonicalName: string;
  domain: string;
  owner: string;
  criticality: "P0" | "P1" | "P2" | "P3";
  promptOriginRefs: string[];
  routeRefs: string[];
  shellRefs: string[];
  componentRefs: string[];
  contractRefs: string[];
  endpointRefs: string[];
  serviceRefs: string[];
  eventRefs: string[];
  proofRefs: string[];
  testRefs: string[];
  runtimeEvidenceRefs: string[];
  readinessCriteria: string;
  status: "draft" | "active" | "deprecated";
  createdAt: string;
  updatedAt: string;
}

export const FEATURE_MANIFESTS: FeatureManifestRecord[] = [
  { featureManifestId: "FM-001", featureId: "feat-money-dashboard", canonicalName: "Money Office Dashboard", domain: "finance", owner: "finance-team", criticality: "P0", promptOriginRefs: ["PROMPT-001"], routeRefs: ["/money"], shellRefs: ["money-office-shell"], componentRefs: ["MoneyDashboard", "BalanceCard", "SpendingChart"], contractRefs: ["finance-account-contract", "finance-budget-contract"], endpointRefs: ["/api/accounts", "/api/budgets"], serviceRefs: ["account-service", "budget-service"], eventRefs: ["account.updated", "budget.threshold.breached"], proofRefs: ["receipt-account-view", "receipt-budget-check"], testRefs: ["money-dashboard.spec.ts"], runtimeEvidenceRefs: ["RE-001", "RE-002"], readinessCriteria: "Route renders, accounts load, budget data displays, spending chart interactive", status: "active", createdAt: "2026-02-15", updatedAt: "2026-04-10" },
  { featureManifestId: "FM-002", featureId: "feat-bill-pay", canonicalName: "Bill Payment System", domain: "finance", owner: "finance-team", criticality: "P0", promptOriginRefs: ["PROMPT-005"], routeRefs: ["/money/bills"], shellRefs: ["money-office-shell"], componentRefs: ["BillPayForm", "BillList", "PaymentConfirmation"], contractRefs: ["finance-payment-contract", "finance-bill-contract"], endpointRefs: ["/api/bills", "/api/payments"], serviceRefs: ["payment-service", "bill-service"], eventRefs: ["bill.paid", "payment.confirmed", "payment.failed"], proofRefs: ["receipt-payment", "receipt-bill-paid"], testRefs: ["bill-pay.spec.ts"], runtimeEvidenceRefs: ["RE-003"], readinessCriteria: "Bills load, payment form submits, confirmation shown, receipt generated", status: "active", createdAt: "2026-02-20", updatedAt: "2026-04-10" },
  { featureManifestId: "FM-003", featureId: "feat-admin-truth-center", canonicalName: "Implementation Truth Center", domain: "platform", owner: "platform-team", criticality: "P0", promptOriginRefs: ["PROMPT-010"], routeRefs: ["/admin/implementation-truth"], shellRefs: ["admin-shell"], componentRefs: ["TruthDashboard", "SpecRegistry", "ComplianceBoard"], contractRefs: ["platform-truth-contract"], endpointRefs: [], serviceRefs: ["truth-service"], eventRefs: ["truth.check.completed"], proofRefs: ["receipt-truth-check"], testRefs: ["truth-center.spec.ts"], runtimeEvidenceRefs: ["RE-004"], readinessCriteria: "Dashboard renders, spec registry loads, compliance data accurate", status: "active", createdAt: "2026-03-01", updatedAt: "2026-04-10" },
  { featureManifestId: "FM-004", featureId: "feat-advisor-council", canonicalName: "AI Advisor Council", domain: "platform", owner: "ai-team", criticality: "P1", promptOriginRefs: ["PROMPT-012"], routeRefs: ["/admin/ai-council"], shellRefs: ["admin-shell"], componentRefs: ["CouncilOrchestrator", "AdvisorPanel", "DebateView"], contractRefs: ["ai-advisor-contract"], endpointRefs: ["/api/advisors"], serviceRefs: ["advisor-service", "council-service"], eventRefs: ["advisor.response", "council.consensus"], proofRefs: ["receipt-council-decision"], testRefs: ["advisor-council.spec.ts"], runtimeEvidenceRefs: ["RE-005"], readinessCriteria: "Advisors register, council debate renders, consensus reached", status: "active", createdAt: "2026-03-05", updatedAt: "2026-04-09" },
  { featureManifestId: "FM-005", featureId: "feat-budget-goals", canonicalName: "Budget Goals & Tracking", domain: "finance", owner: "finance-team", criticality: "P1", promptOriginRefs: ["PROMPT-003"], routeRefs: ["/money/budgets", "/money/goals"], shellRefs: ["money-office-shell"], componentRefs: ["BudgetEditor", "GoalTracker", "ProgressBar"], contractRefs: ["finance-budget-contract", "finance-goal-contract"], endpointRefs: ["/api/budgets", "/api/goals"], serviceRefs: ["budget-service", "goal-service"], eventRefs: ["budget.updated", "goal.progress"], proofRefs: ["receipt-budget-update"], testRefs: ["budget-goals.spec.ts"], runtimeEvidenceRefs: ["RE-006"], readinessCriteria: "Budgets editable, goals track progress, alerts fire on threshold", status: "active", createdAt: "2026-03-10", updatedAt: "2026-04-10" },
  { featureManifestId: "FM-006", featureId: "feat-connector-mgmt", canonicalName: "Connector Management", domain: "platform", owner: "platform-team", criticality: "P1", promptOriginRefs: [], routeRefs: ["/admin/connectors"], shellRefs: ["admin-shell"], componentRefs: ["ConnectorList", "ConnectorDetail", "HealthIndicator"], contractRefs: ["platform-connector-contract"], endpointRefs: ["/api/connectors"], serviceRefs: ["connector-service"], eventRefs: ["connector.health.changed"], proofRefs: ["receipt-connector-cert"], testRefs: ["connector-mgmt.spec.ts"], runtimeEvidenceRefs: ["RE-007"], readinessCriteria: "Connectors list, health shows, certification flow works", status: "active", createdAt: "2026-03-15", updatedAt: "2026-04-08" },
  { featureManifestId: "FM-007", featureId: "feat-platform-law", canonicalName: "Platform Law Enforcement", domain: "platform", owner: "platform-team", criticality: "P0", promptOriginRefs: ["PROMPT-020"], routeRefs: ["/admin/platform-law", "/admin/platform-law/laws", "/admin/platform-law/scaffolds", "/admin/platform-law/ci-gates", "/admin/platform-law/manifests", "/admin/platform-law/ownership", "/admin/platform-law/compliance"], shellRefs: ["admin-shell"], componentRefs: ["PLE01Overview", "PLE02LawRegistry", "PLE03ScaffoldRegistry", "PLE04CIGateMonitor", "PLE05ManifestEnforcer", "PLE06OwnershipBoard", "PLE07ComplianceDashboard"], contractRefs: ["platform-law-contract"], endpointRefs: [], serviceRefs: ["law-enforcement-service"], eventRefs: ["law.violation.detected", "compliance.mode.changed"], proofRefs: ["receipt-law-check"], testRefs: ["platform-law.spec.ts"], runtimeEvidenceRefs: ["RE-008"], readinessCriteria: "All 7 pages render, laws queryable, compliance mode toggle works", status: "active", createdAt: "2026-04-10", updatedAt: "2026-04-10" },
  { featureManifestId: "FM-008", featureId: "feat-journey-verification", canonicalName: "Journey Verification System", domain: "platform", owner: "platform-team", criticality: "P0", promptOriginRefs: ["PROMPT-015"], routeRefs: ["/admin/verification/overview"], shellRefs: ["admin-shell"], componentRefs: ["JourneyOverview", "JourneyDetail", "StepVerifier"], contractRefs: ["platform-journey-contract"], endpointRefs: [], serviceRefs: ["journey-verification-service"], eventRefs: ["journey.step.verified"], proofRefs: ["receipt-journey-verified"], testRefs: ["journey-verification.spec.ts"], runtimeEvidenceRefs: ["RE-009"], readinessCriteria: "Journeys list, steps verifiable, pass/fail tracked", status: "active", createdAt: "2026-03-01", updatedAt: "2026-04-10" },
  { featureManifestId: "FM-009", featureId: "feat-revenue-invoicing", canonicalName: "Revenue & Invoicing", domain: "business", owner: "business-team", criticality: "P1", promptOriginRefs: [], routeRefs: ["/revenue/invoicing"], shellRefs: ["revenue-office-shell"], componentRefs: ["InvoiceList", "InvoiceEditor", "PaymentTracker"], contractRefs: ["business-invoice-contract"], endpointRefs: ["/api/invoices"], serviceRefs: ["invoice-service"], eventRefs: ["invoice.created", "invoice.paid"], proofRefs: ["receipt-invoice-sent"], testRefs: ["invoicing.spec.ts"], runtimeEvidenceRefs: [], readinessCriteria: "Invoices create, send, track payment status", status: "active", createdAt: "2026-03-20", updatedAt: "2026-04-09" },
  { featureManifestId: "FM-010", featureId: "feat-concierge-tasks", canonicalName: "Concierge Task Engine", domain: "concierge", owner: "concierge-team", criticality: "P1", promptOriginRefs: [], routeRefs: ["/concierge/tasks"], shellRefs: ["concierge-shell"], componentRefs: ["TaskList", "TaskDetail", "TaskCreator"], contractRefs: ["concierge-task-contract"], endpointRefs: ["/api/tasks"], serviceRefs: ["task-service"], eventRefs: ["task.assigned", "task.completed"], proofRefs: ["receipt-task-completed"], testRefs: ["concierge-tasks.spec.ts"], runtimeEvidenceRefs: [], readinessCriteria: "Tasks list, create, assign, complete with receipts", status: "active", createdAt: "2026-03-25", updatedAt: "2026-04-08" },
  { featureManifestId: "FM-011", featureId: "feat-onboarding-wizard", canonicalName: "Onboarding Wizard", domain: "platform", owner: "platform-team", criticality: "P0", promptOriginRefs: ["PROMPT-025"], routeRefs: ["/onboarding"], shellRefs: ["onboarding-shell"], componentRefs: ["WizardStepper", "PersonalizationStep", "TrustCalibration"], contractRefs: ["platform-onboarding-contract"], endpointRefs: [], serviceRefs: ["onboarding-service"], eventRefs: ["onboarding.step.completed", "onboarding.finished"], proofRefs: ["receipt-onboarding-complete"], testRefs: ["onboarding.spec.ts"], runtimeEvidenceRefs: ["RE-010"], readinessCriteria: "Steps navigate, personalization saves, trust calibration runs", status: "active", createdAt: "2026-04-01", updatedAt: "2026-04-10" },
  { featureManifestId: "FM-012", featureId: "feat-spending-analytics", canonicalName: "Spending Analytics", domain: "finance", owner: "finance-team", criticality: "P1", promptOriginRefs: [], routeRefs: ["/money/analytics"], shellRefs: ["money-office-shell"], componentRefs: ["SpendingChart", "CategoryBreakdown", "TrendLine"], contractRefs: ["finance-analytics-contract"], endpointRefs: ["/api/analytics/spending"], serviceRefs: ["analytics-service"], eventRefs: ["analytics.computed"], proofRefs: [], testRefs: ["spending-analytics.spec.ts"], runtimeEvidenceRefs: [], readinessCriteria: "Charts render, categories break down, trends compute", status: "draft", createdAt: "2026-04-05", updatedAt: "2026-04-10" },
];

// ═══════════════════════════════════════════════════════════════
// D. InteractionManifestRecord
// ═══════════════════════════════════════════════════════════════

export interface InteractionManifestRecord {
  interactionManifestId: string;
  interactionId: string;
  featureId: string;
  route: string;
  component: string;
  elementType: "button" | "form" | "link" | "toggle" | "modal" | "menu" | "input" | "card";
  stableSelector: string;
  criticality: "P0" | "P1" | "P2";
  expectedBehavior: string;
  expectedDestination: string | null;
  expectedMutation: string | null;
  expectedStateChange: string | null;
  expectedReceiptOrProof: string | null;
  permissionRequirements: string[];
  stateVariants: string[];
  createdAt: string;
  updatedAt: string;
}

export const INTERACTION_MANIFESTS: InteractionManifestRecord[] = [
  { interactionManifestId: "IM-001", interactionId: "int-pay-bill-submit", featureId: "feat-bill-pay", route: "/money/bills", component: "BillPayForm", elementType: "button", stableSelector: "[data-testid='pay-bill-submit']", criticality: "P0", expectedBehavior: "Submits payment for selected bill", expectedDestination: null, expectedMutation: "payment.create", expectedStateChange: "bill.status → paid", expectedReceiptOrProof: "receipt-payment", permissionRequirements: ["finance.pay"], stateVariants: ["enabled", "disabled-insufficient-funds", "loading"], createdAt: "2026-03-01", updatedAt: "2026-04-10" },
  { interactionManifestId: "IM-002", interactionId: "int-budget-save", featureId: "feat-budget-goals", route: "/money/budgets", component: "BudgetEditor", elementType: "button", stableSelector: "[data-testid='save-budget']", criticality: "P0", expectedBehavior: "Saves budget configuration", expectedDestination: null, expectedMutation: "budget.update", expectedStateChange: "budget.saved = true", expectedReceiptOrProof: "receipt-budget-update", permissionRequirements: ["finance.budget.edit"], stateVariants: ["enabled", "disabled-no-changes", "loading"], createdAt: "2026-03-10", updatedAt: "2026-04-10" },
  { interactionManifestId: "IM-003", interactionId: "int-account-connect", featureId: "feat-money-dashboard", route: "/money", component: "AccountConnector", elementType: "button", stableSelector: "[data-testid='connect-account']", criticality: "P0", expectedBehavior: "Initiates bank account connection flow", expectedDestination: "/money/connect", expectedMutation: "account.connect.initiate", expectedStateChange: "connection.status → pending", expectedReceiptOrProof: "receipt-account-connect", permissionRequirements: ["finance.accounts.connect"], stateVariants: ["enabled", "max-accounts-reached"], createdAt: "2026-02-15", updatedAt: "2026-04-10" },
  { interactionManifestId: "IM-004", interactionId: "int-goal-create", featureId: "feat-budget-goals", route: "/money/goals", component: "GoalCreator", elementType: "form", stableSelector: "[data-testid='create-goal-form']", criticality: "P1", expectedBehavior: "Creates a new financial goal", expectedDestination: null, expectedMutation: "goal.create", expectedStateChange: "goals.list += new goal", expectedReceiptOrProof: "receipt-goal-created", permissionRequirements: ["finance.goals.create"], stateVariants: ["empty", "filled", "submitting", "error"], createdAt: "2026-03-10", updatedAt: "2026-04-09" },
  { interactionManifestId: "IM-005", interactionId: "int-compliance-mode-toggle", featureId: "feat-platform-law", route: "/admin/platform-law/compliance", component: "PLE07ComplianceDashboard", elementType: "toggle", stableSelector: "[data-testid='compliance-mode-toggle']", criticality: "P0", expectedBehavior: "Switches between strict/advisory/learning enforcement modes", expectedDestination: null, expectedMutation: "compliance.mode.update", expectedStateChange: "enforcementMode changes", expectedReceiptOrProof: null, permissionRequirements: ["admin.platform-law.manage"], stateVariants: ["strict", "advisory", "learning"], createdAt: "2026-04-10", updatedAt: "2026-04-10" },
  { interactionManifestId: "IM-006", interactionId: "int-law-detail-open", featureId: "feat-platform-law", route: "/admin/platform-law/laws", component: "PLE02LawRegistry", elementType: "card", stableSelector: "[data-testid='law-row']", criticality: "P1", expectedBehavior: "Opens law detail drawer", expectedDestination: null, expectedMutation: null, expectedStateChange: "selectedLaw set", expectedReceiptOrProof: null, permissionRequirements: ["admin.view"], stateVariants: ["collapsed", "expanded"], createdAt: "2026-04-10", updatedAt: "2026-04-10" },
  { interactionManifestId: "IM-007", interactionId: "int-invoice-create", featureId: "feat-revenue-invoicing", route: "/revenue/invoicing", component: "InvoiceEditor", elementType: "button", stableSelector: "[data-testid='create-invoice']", criticality: "P0", expectedBehavior: "Creates new invoice", expectedDestination: null, expectedMutation: "invoice.create", expectedStateChange: "invoices.list += new", expectedReceiptOrProof: "receipt-invoice-created", permissionRequirements: ["business.invoicing.create"], stateVariants: ["enabled", "loading"], createdAt: "2026-03-20", updatedAt: "2026-04-09" },
  { interactionManifestId: "IM-008", interactionId: "int-onboarding-next", featureId: "feat-onboarding-wizard", route: "/onboarding", component: "WizardStepper", elementType: "button", stableSelector: "[data-testid='onboarding-next']", criticality: "P0", expectedBehavior: "Advances to next onboarding step", expectedDestination: null, expectedMutation: "onboarding.step.advance", expectedStateChange: "currentStep += 1", expectedReceiptOrProof: "receipt-onboarding-step", permissionRequirements: [], stateVariants: ["enabled", "disabled-incomplete", "final-step"], createdAt: "2026-04-01", updatedAt: "2026-04-10" },
  { interactionManifestId: "IM-009", interactionId: "int-connector-certify", featureId: "feat-connector-mgmt", route: "/admin/connectors", component: "ConnectorDetail", elementType: "button", stableSelector: "[data-testid='certify-connector']", criticality: "P1", expectedBehavior: "Certifies connector for production use", expectedDestination: null, expectedMutation: "connector.certify", expectedStateChange: "connector.status → certified", expectedReceiptOrProof: "receipt-connector-cert", permissionRequirements: ["admin.connectors.certify"], stateVariants: ["enabled", "already-certified", "loading"], createdAt: "2026-03-15", updatedAt: "2026-04-08" },
  { interactionManifestId: "IM-010", interactionId: "int-task-complete", featureId: "feat-concierge-tasks", route: "/concierge/tasks", component: "TaskDetail", elementType: "button", stableSelector: "[data-testid='complete-task']", criticality: "P1", expectedBehavior: "Marks task as completed", expectedDestination: null, expectedMutation: "task.complete", expectedStateChange: "task.status → completed", expectedReceiptOrProof: "receipt-task-completed", permissionRequirements: ["concierge.tasks.complete"], stateVariants: ["enabled", "already-completed"], createdAt: "2026-03-25", updatedAt: "2026-04-08" },
  { interactionManifestId: "IM-011", interactionId: "int-spending-filter", featureId: "feat-spending-analytics", route: "/money/analytics", component: "SpendingChart", elementType: "menu", stableSelector: "[data-testid='spending-period-filter']", criticality: "P1", expectedBehavior: "Filters spending data by time period", expectedDestination: null, expectedMutation: null, expectedStateChange: "period filter changes", expectedReceiptOrProof: null, permissionRequirements: ["finance.analytics.view"], stateVariants: ["7d", "30d", "90d", "1y", "all"], createdAt: "2026-04-05", updatedAt: "2026-04-10" },
  { interactionManifestId: "IM-012", interactionId: "int-truth-spec-drill", featureId: "feat-admin-truth-center", route: "/admin/implementation-truth", component: "SpecRegistry", elementType: "card", stableSelector: "[data-testid='spec-detail-row']", criticality: "P1", expectedBehavior: "Opens spec detail with evidence", expectedDestination: null, expectedMutation: null, expectedStateChange: "selectedSpec set", expectedReceiptOrProof: null, permissionRequirements: ["admin.view"], stateVariants: ["collapsed", "expanded"], createdAt: "2026-03-01", updatedAt: "2026-04-10" },
  { interactionManifestId: "IM-013", interactionId: "int-advisor-debate-start", featureId: "feat-advisor-council", route: "/admin/ai-council", component: "CouncilOrchestrator", elementType: "button", stableSelector: "[data-testid='start-debate']", criticality: "P1", expectedBehavior: "Initiates advisor council debate", expectedDestination: null, expectedMutation: "debate.create", expectedStateChange: "debate.status → active", expectedReceiptOrProof: "receipt-debate-started", permissionRequirements: ["admin.ai.manage"], stateVariants: ["enabled", "debate-in-progress"], createdAt: "2026-03-05", updatedAt: "2026-04-09" },
  { interactionManifestId: "IM-014", interactionId: "int-transfer-funds", featureId: "feat-money-dashboard", route: "/money/transfer", component: "TransferForm", elementType: "form", stableSelector: "[data-testid='transfer-form']", criticality: "P0", expectedBehavior: "Transfers funds between accounts", expectedDestination: null, expectedMutation: "transfer.execute", expectedStateChange: "account.balance changes", expectedReceiptOrProof: "receipt-transfer", permissionRequirements: ["finance.transfer"], stateVariants: ["ready", "submitting", "success", "error"], createdAt: "2026-03-01", updatedAt: "2026-04-10" },
  { interactionManifestId: "IM-015", interactionId: "int-launch-gate-override", featureId: "feat-platform-law", route: "/admin/platform-law/compliance", component: "PLE07ComplianceDashboard", elementType: "button", stableSelector: "[data-testid='launch-gate-override']", criticality: "P0", expectedBehavior: "Overrides a launch gate with justification", expectedDestination: null, expectedMutation: "launch_gate.override", expectedStateChange: "gate.status → overridden", expectedReceiptOrProof: "receipt-gate-override", permissionRequirements: ["admin.platform-law.override"], stateVariants: ["enabled", "disabled-no-permission"], createdAt: "2026-04-10", updatedAt: "2026-04-10" },
];

// ═══════════════════════════════════════════════════════════════
// E. JourneyManifestRecord
// ═══════════════════════════════════════════════════════════════

export interface JourneyManifestRecord {
  journeyManifestId: string;
  journeyId: string;
  title: string;
  featureId: string;
  actorRole: string;
  criticality: "P0" | "P1" | "P2";
  entryRoute: string;
  stepRefs: string[];
  expectedTransitions: string[];
  expectedMutations: string[];
  expectedProofs: string[];
  degradedVariants: string[];
  failureVariants: string[];
  requiredCoverage: number;
  runtimeProbeRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export const JOURNEY_MANIFESTS: JourneyManifestRecord[] = [
  { journeyManifestId: "JM-001", journeyId: "j-pay-bill-e2e", title: "Pay a Bill End-to-End", featureId: "feat-bill-pay", actorRole: "owner", criticality: "P0", entryRoute: "/money/bills", stepRefs: ["select-bill", "review-amount", "confirm-payment", "view-receipt"], expectedTransitions: ["/money/bills → /money/bills/:id → /money/bills/:id/confirm → /money/bills/:id/receipt"], expectedMutations: ["payment.create", "bill.status.update"], expectedProofs: ["receipt-payment", "receipt-bill-paid"], degradedVariants: ["insufficient-funds-shown", "bank-unavailable-retry"], failureVariants: ["payment-declined", "timeout"], requiredCoverage: 95, runtimeProbeRequired: true, createdAt: "2026-03-01", updatedAt: "2026-04-10" },
  { journeyManifestId: "JM-002", journeyId: "j-onboarding-complete", title: "Complete Onboarding", featureId: "feat-onboarding-wizard", actorRole: "new-user", criticality: "P0", entryRoute: "/onboarding", stepRefs: ["welcome", "personalization", "trust-calibration", "connect-account", "desktop-arrival"], expectedTransitions: ["/onboarding → /onboarding/personalize → /onboarding/trust → /onboarding/connect → /"], expectedMutations: ["profile.create", "preferences.save", "trust.calibrate"], expectedProofs: ["receipt-onboarding-complete"], degradedVariants: ["skip-connect-later", "skip-trust-defaults"], failureVariants: ["auth-failure"], requiredCoverage: 90, runtimeProbeRequired: true, createdAt: "2026-04-01", updatedAt: "2026-04-10" },
  { journeyManifestId: "JM-003", journeyId: "j-create-budget", title: "Create and Configure Budget", featureId: "feat-budget-goals", actorRole: "owner", criticality: "P0", entryRoute: "/money/budgets", stepRefs: ["click-new-budget", "set-categories", "set-limits", "save-budget", "verify-tracking"], expectedTransitions: ["/money/budgets → /money/budgets/new → /money/budgets/:id"], expectedMutations: ["budget.create", "budget.categories.set"], expectedProofs: ["receipt-budget-update"], degradedVariants: ["no-accounts-linked-warning"], failureVariants: ["save-failed"], requiredCoverage: 85, runtimeProbeRequired: true, createdAt: "2026-03-10", updatedAt: "2026-04-10" },
  { journeyManifestId: "JM-004", journeyId: "j-connect-bank", title: "Connect Bank Account", featureId: "feat-money-dashboard", actorRole: "owner", criticality: "P0", entryRoute: "/money", stepRefs: ["click-connect", "select-bank", "authenticate", "authorize-scopes", "confirm-connection"], expectedTransitions: ["/money → /money/connect → /money/connect/auth → /money"], expectedMutations: ["account.connect.initiate", "account.connect.complete"], expectedProofs: ["receipt-account-connect"], degradedVariants: ["bank-timeout-retry", "partial-scope-warning"], failureVariants: ["auth-rejected", "bank-unavailable"], requiredCoverage: 90, runtimeProbeRequired: true, createdAt: "2026-02-15", updatedAt: "2026-04-10" },
  { journeyManifestId: "JM-005", journeyId: "j-create-invoice", title: "Create and Send Invoice", featureId: "feat-revenue-invoicing", actorRole: "owner", criticality: "P1", entryRoute: "/revenue/invoicing", stepRefs: ["click-new", "fill-details", "add-line-items", "preview", "send"], expectedTransitions: ["/revenue/invoicing → /revenue/invoicing/new → /revenue/invoicing/:id"], expectedMutations: ["invoice.create", "invoice.send"], expectedProofs: ["receipt-invoice-sent"], degradedVariants: ["client-not-found-create-inline"], failureVariants: ["send-failed"], requiredCoverage: 80, runtimeProbeRequired: false, createdAt: "2026-03-20", updatedAt: "2026-04-09" },
  { journeyManifestId: "JM-006", journeyId: "j-verify-truth", title: "Run Implementation Truth Check", featureId: "feat-admin-truth-center", actorRole: "admin", criticality: "P0", entryRoute: "/admin/implementation-truth", stepRefs: ["open-dashboard", "select-domain", "run-validation", "review-results", "acknowledge-violations"], expectedTransitions: ["/admin/implementation-truth → validation modal → results"], expectedMutations: ["truth.check.run"], expectedProofs: ["receipt-truth-check"], degradedVariants: ["partial-data-warning"], failureVariants: ["validation-timeout"], requiredCoverage: 85, runtimeProbeRequired: true, createdAt: "2026-03-01", updatedAt: "2026-04-10" },
  { journeyManifestId: "JM-007", journeyId: "j-transfer-funds", title: "Transfer Funds Between Accounts", featureId: "feat-money-dashboard", actorRole: "owner", criticality: "P0", entryRoute: "/money/transfer", stepRefs: ["select-from", "select-to", "enter-amount", "review", "confirm", "view-receipt"], expectedTransitions: ["/money/transfer → /money/transfer/confirm → /money/transfer/receipt"], expectedMutations: ["transfer.execute"], expectedProofs: ["receipt-transfer"], degradedVariants: ["daily-limit-warning"], failureVariants: ["insufficient-funds", "transfer-failed"], requiredCoverage: 95, runtimeProbeRequired: true, createdAt: "2026-03-01", updatedAt: "2026-04-10" },
  { journeyManifestId: "JM-008", journeyId: "j-platform-law-review", title: "Review Platform Law Compliance", featureId: "feat-platform-law", actorRole: "admin", criticality: "P1", entryRoute: "/admin/platform-law", stepRefs: ["view-overview", "drill-into-laws", "check-violations", "view-ownership", "toggle-mode"], expectedTransitions: ["/admin/platform-law → /admin/platform-law/laws → /admin/platform-law/compliance"], expectedMutations: ["compliance.mode.update"], expectedProofs: [], degradedVariants: [], failureVariants: [], requiredCoverage: 75, runtimeProbeRequired: false, createdAt: "2026-04-10", updatedAt: "2026-04-10" },
  { journeyManifestId: "JM-009", journeyId: "j-task-lifecycle", title: "Task Create → Assign → Complete", featureId: "feat-concierge-tasks", actorRole: "owner", criticality: "P1", entryRoute: "/concierge/tasks", stepRefs: ["create-task", "assign-task", "work-on-task", "complete-task"], expectedTransitions: ["/concierge/tasks → /concierge/tasks/new → /concierge/tasks/:id"], expectedMutations: ["task.create", "task.assign", "task.complete"], expectedProofs: ["receipt-task-completed"], degradedVariants: ["unassigned-self-assign"], failureVariants: ["assign-failed"], requiredCoverage: 80, runtimeProbeRequired: false, createdAt: "2026-03-25", updatedAt: "2026-04-08" },
  { journeyManifestId: "JM-010", journeyId: "j-advisor-debate", title: "Run Advisor Council Debate", featureId: "feat-advisor-council", actorRole: "admin", criticality: "P1", entryRoute: "/admin/ai-council", stepRefs: ["select-topic", "start-debate", "view-arguments", "reach-consensus", "apply-recommendation"], expectedTransitions: ["/admin/ai-council → debate modal → results"], expectedMutations: ["debate.create", "debate.resolve"], expectedProofs: ["receipt-debate-started", "receipt-council-decision"], degradedVariants: ["no-consensus-escalate"], failureVariants: ["debate-timeout"], requiredCoverage: 70, runtimeProbeRequired: false, createdAt: "2026-03-05", updatedAt: "2026-04-09" },
];

// ═══════════════════════════════════════════════════════════════
// F. ContractManifestRecord
// ═══════════════════════════════════════════════════════════════

export interface ContractManifestRecord {
  contractManifestId: string;
  contractId: string;
  contractName: string;
  contractType: "api" | "event" | "capability" | "data" | "integration";
  ownerPackage: string;
  ownerDomain: string;
  frontendConsumers: string[];
  backendImplementers: string[];
  schemaVersion: string;
  duplicateSensitive: boolean;
  readinessState: "draft" | "stable" | "deprecated";
  createdAt: string;
  updatedAt: string;
}

export const CONTRACT_MANIFESTS: ContractManifestRecord[] = [
  { contractManifestId: "CM-001", contractId: "finance-account-contract", contractName: "Finance Account Contract", contractType: "api", ownerPackage: "src/packages/contracts/finance/", ownerDomain: "finance", frontendConsumers: ["MoneyDashboard", "AccountList", "BalanceCard"], backendImplementers: ["account-service"], schemaVersion: "3.2.0", duplicateSensitive: true, readinessState: "stable", createdAt: "2026-01-20", updatedAt: "2026-04-10" },
  { contractManifestId: "CM-002", contractId: "finance-payment-contract", contractName: "Finance Payment Contract", contractType: "api", ownerPackage: "src/packages/contracts/finance/", ownerDomain: "finance", frontendConsumers: ["BillPayForm", "PaymentConfirmation"], backendImplementers: ["payment-service"], schemaVersion: "2.1.0", duplicateSensitive: true, readinessState: "stable", createdAt: "2026-02-01", updatedAt: "2026-04-10" },
  { contractManifestId: "CM-003", contractId: "finance-budget-contract", contractName: "Finance Budget Contract", contractType: "api", ownerPackage: "src/packages/contracts/finance/", ownerDomain: "finance", frontendConsumers: ["BudgetEditor", "BudgetList"], backendImplementers: ["budget-service"], schemaVersion: "1.5.0", duplicateSensitive: false, readinessState: "stable", createdAt: "2026-02-15", updatedAt: "2026-04-10" },
  { contractManifestId: "CM-004", contractId: "platform-truth-contract", contractName: "Platform Truth Contract", contractType: "capability", ownerPackage: "src/packages/contracts/platform/", ownerDomain: "platform", frontendConsumers: ["TruthDashboard", "SpecRegistry", "ComplianceBoard"], backendImplementers: ["truth-service"], schemaVersion: "2.0.0", duplicateSensitive: false, readinessState: "stable", createdAt: "2026-03-01", updatedAt: "2026-04-10" },
  { contractManifestId: "CM-005", contractId: "ai-advisor-contract", contractName: "AI Advisor Contract", contractType: "capability", ownerPackage: "src/packages/contracts/platform/", ownerDomain: "platform", frontendConsumers: ["AdvisorPanel", "CouncilOrchestrator"], backendImplementers: ["advisor-service", "council-service"], schemaVersion: "1.3.0", duplicateSensitive: false, readinessState: "stable", createdAt: "2026-03-05", updatedAt: "2026-04-09" },
  { contractManifestId: "CM-006", contractId: "platform-connector-contract", contractName: "Platform Connector Contract", contractType: "integration", ownerPackage: "src/packages/contracts/platform/", ownerDomain: "platform", frontendConsumers: ["ConnectorList", "ConnectorDetail"], backendImplementers: ["connector-service"], schemaVersion: "1.1.0", duplicateSensitive: true, readinessState: "stable", createdAt: "2026-03-15", updatedAt: "2026-04-08" },
  { contractManifestId: "CM-007", contractId: "business-invoice-contract", contractName: "Business Invoice Contract", contractType: "api", ownerPackage: "src/packages/contracts/business/", ownerDomain: "business", frontendConsumers: ["InvoiceList", "InvoiceEditor"], backendImplementers: ["invoice-service"], schemaVersion: "1.0.0", duplicateSensitive: true, readinessState: "stable", createdAt: "2026-03-20", updatedAt: "2026-04-09" },
  { contractManifestId: "CM-008", contractId: "concierge-task-contract", contractName: "Concierge Task Contract", contractType: "api", ownerPackage: "src/packages/contracts/concierge/", ownerDomain: "concierge", frontendConsumers: ["TaskList", "TaskDetail", "TaskCreator"], backendImplementers: ["task-service"], schemaVersion: "1.2.0", duplicateSensitive: false, readinessState: "stable", createdAt: "2026-03-25", updatedAt: "2026-04-08" },
  { contractManifestId: "CM-009", contractId: "platform-law-contract", contractName: "Platform Law Contract", contractType: "capability", ownerPackage: "src/packages/contracts/platform/", ownerDomain: "platform", frontendConsumers: ["PLE01Overview", "PLE02LawRegistry", "PLE07ComplianceDashboard"], backendImplementers: ["law-enforcement-service"], schemaVersion: "1.0.0", duplicateSensitive: false, readinessState: "stable", createdAt: "2026-04-10", updatedAt: "2026-04-10" },
  { contractManifestId: "CM-010", contractId: "platform-onboarding-contract", contractName: "Platform Onboarding Contract", contractType: "capability", ownerPackage: "src/packages/contracts/platform/", ownerDomain: "platform", frontendConsumers: ["WizardStepper", "PersonalizationStep"], backendImplementers: ["onboarding-service"], schemaVersion: "1.0.0", duplicateSensitive: false, readinessState: "stable", createdAt: "2026-04-01", updatedAt: "2026-04-10" },
];

// ═══════════════════════════════════════════════════════════════
// G. RuntimeEvidenceManifestRecord
// ═══════════════════════════════════════════════════════════════

export interface RuntimeEvidenceManifestRecord {
  runtimeEvidenceManifestId: string;
  featureId: string;
  evidenceType: EvidenceType;
  environmentScope: "production" | "staging" | "preview" | "all";
  requiredForReadiness: boolean;
  requiredForLaunch: boolean;
  expectedFrequency: "on-load" | "on-action" | "periodic" | "on-demand";
  owner: string;
  createdAt: string;
}

export const RUNTIME_EVIDENCE_MANIFESTS: RuntimeEvidenceManifestRecord[] = [
  { runtimeEvidenceManifestId: "RE-001", featureId: "feat-money-dashboard", evidenceType: "route_render", environmentScope: "all", requiredForReadiness: true, requiredForLaunch: true, expectedFrequency: "on-load", owner: "finance-team", createdAt: "2026-02-15" },
  { runtimeEvidenceManifestId: "RE-002", featureId: "feat-money-dashboard", evidenceType: "data_load", environmentScope: "all", requiredForReadiness: true, requiredForLaunch: true, expectedFrequency: "on-load", owner: "finance-team", createdAt: "2026-02-15" },
  { runtimeEvidenceManifestId: "RE-003", featureId: "feat-bill-pay", evidenceType: "mutation_persisted", environmentScope: "production", requiredForReadiness: true, requiredForLaunch: true, expectedFrequency: "on-action", owner: "finance-team", createdAt: "2026-03-01" },
  { runtimeEvidenceManifestId: "RE-004", featureId: "feat-admin-truth-center", evidenceType: "route_render", environmentScope: "all", requiredForReadiness: true, requiredForLaunch: true, expectedFrequency: "on-load", owner: "platform-team", createdAt: "2026-03-01" },
  { runtimeEvidenceManifestId: "RE-005", featureId: "feat-advisor-council", evidenceType: "event_emitted", environmentScope: "staging", requiredForReadiness: true, requiredForLaunch: false, expectedFrequency: "on-action", owner: "ai-team", createdAt: "2026-03-05" },
  { runtimeEvidenceManifestId: "RE-006", featureId: "feat-budget-goals", evidenceType: "projection_updated", environmentScope: "all", requiredForReadiness: true, requiredForLaunch: true, expectedFrequency: "on-action", owner: "finance-team", createdAt: "2026-03-10" },
  { runtimeEvidenceManifestId: "RE-007", featureId: "feat-connector-mgmt", evidenceType: "proof_generated", environmentScope: "production", requiredForReadiness: true, requiredForLaunch: false, expectedFrequency: "on-action", owner: "platform-team", createdAt: "2026-03-15" },
  { runtimeEvidenceManifestId: "RE-008", featureId: "feat-platform-law", evidenceType: "route_render", environmentScope: "all", requiredForReadiness: true, requiredForLaunch: true, expectedFrequency: "on-load", owner: "platform-team", createdAt: "2026-04-10" },
  { runtimeEvidenceManifestId: "RE-009", featureId: "feat-journey-verification", evidenceType: "journey_completed", environmentScope: "all", requiredForReadiness: true, requiredForLaunch: true, expectedFrequency: "on-demand", owner: "platform-team", createdAt: "2026-03-01" },
  { runtimeEvidenceManifestId: "RE-010", featureId: "feat-onboarding-wizard", evidenceType: "form_submitted", environmentScope: "all", requiredForReadiness: true, requiredForLaunch: true, expectedFrequency: "on-action", owner: "platform-team", createdAt: "2026-04-01" },
];

// ═══════════════════════════════════════════════════════════════
// H. ReadinessManifestRecord
// ═══════════════════════════════════════════════════════════════

export interface ReadinessManifestRecord {
  readinessManifestId: string;
  featureId: string;
  requiredManifestCoverage: number;
  requiredTestCoverage: number;
  requiredRuntimeEvidenceCoverage: number;
  requiredArchitectureCompliance: number;
  requiredInteractionCoverage: number;
  requiredJourneyCoverage: number;
  requiredProofCompliance: number;
  launchThreshold: number;
  createdAt: string;
}

export const READINESS_MANIFESTS: ReadinessManifestRecord[] = [
  { readinessManifestId: "RM-001", featureId: "feat-money-dashboard", requiredManifestCoverage: 95, requiredTestCoverage: 80, requiredRuntimeEvidenceCoverage: 90, requiredArchitectureCompliance: 100, requiredInteractionCoverage: 85, requiredJourneyCoverage: 90, requiredProofCompliance: 85, launchThreshold: 88, createdAt: "2026-02-15" },
  { readinessManifestId: "RM-002", featureId: "feat-bill-pay", requiredManifestCoverage: 95, requiredTestCoverage: 85, requiredRuntimeEvidenceCoverage: 95, requiredArchitectureCompliance: 100, requiredInteractionCoverage: 90, requiredJourneyCoverage: 95, requiredProofCompliance: 95, launchThreshold: 93, createdAt: "2026-03-01" },
  { readinessManifestId: "RM-003", featureId: "feat-admin-truth-center", requiredManifestCoverage: 90, requiredTestCoverage: 75, requiredRuntimeEvidenceCoverage: 80, requiredArchitectureCompliance: 100, requiredInteractionCoverage: 70, requiredJourneyCoverage: 80, requiredProofCompliance: 75, launchThreshold: 81, createdAt: "2026-03-01" },
  { readinessManifestId: "RM-004", featureId: "feat-platform-law", requiredManifestCoverage: 90, requiredTestCoverage: 70, requiredRuntimeEvidenceCoverage: 80, requiredArchitectureCompliance: 100, requiredInteractionCoverage: 75, requiredJourneyCoverage: 70, requiredProofCompliance: 70, launchThreshold: 79, createdAt: "2026-04-10" },
  { readinessManifestId: "RM-005", featureId: "feat-onboarding-wizard", requiredManifestCoverage: 95, requiredTestCoverage: 80, requiredRuntimeEvidenceCoverage: 90, requiredArchitectureCompliance: 100, requiredInteractionCoverage: 90, requiredJourneyCoverage: 90, requiredProofCompliance: 85, launchThreshold: 90, createdAt: "2026-04-01" },
  { readinessManifestId: "RM-006", featureId: "feat-budget-goals", requiredManifestCoverage: 85, requiredTestCoverage: 75, requiredRuntimeEvidenceCoverage: 80, requiredArchitectureCompliance: 95, requiredInteractionCoverage: 80, requiredJourneyCoverage: 85, requiredProofCompliance: 80, launchThreshold: 83, createdAt: "2026-03-10" },
  { readinessManifestId: "RM-007", featureId: "feat-revenue-invoicing", requiredManifestCoverage: 85, requiredTestCoverage: 70, requiredRuntimeEvidenceCoverage: 75, requiredArchitectureCompliance: 95, requiredInteractionCoverage: 75, requiredJourneyCoverage: 80, requiredProofCompliance: 75, launchThreshold: 79, createdAt: "2026-03-20" },
  { readinessManifestId: "RM-008", featureId: "feat-concierge-tasks", requiredManifestCoverage: 80, requiredTestCoverage: 70, requiredRuntimeEvidenceCoverage: 70, requiredArchitectureCompliance: 90, requiredInteractionCoverage: 70, requiredJourneyCoverage: 75, requiredProofCompliance: 70, launchThreshold: 75, createdAt: "2026-03-25" },
];

// ═══════════════════════════════════════════════════════════════
// I. LaunchGateManifestRecord
// ═══════════════════════════════════════════════════════════════

export interface LaunchGateManifestRecord {
  launchGateManifestId: string;
  scopeType: "feature" | "domain" | "release_ring" | "environment";
  scopeId: string;
  requiredReadinessScore: number;
  blockingRuleIds: string[];
  blockingFailureTypes: string[];
  minimumRuntimeEvidence: number;
  minimumJourneyPassRate: number;
  minimumInteractionPassRate: number;
  allowOverrides: boolean;
  createdAt: string;
}

export const LAUNCH_GATE_MANIFESTS: LaunchGateManifestRecord[] = [
  { launchGateManifestId: "LG-001", scopeType: "domain", scopeId: "finance", requiredReadinessScore: 85, blockingRuleIds: ["LAW-020", "LAW-021", "LAW-022", "LAW-026", "LAW-029"], blockingFailureTypes: ["P0-journey-fail", "critical-manifest-missing", "proof-absent"], minimumRuntimeEvidence: 80, minimumJourneyPassRate: 95, minimumInteractionPassRate: 90, allowOverrides: false, createdAt: "2026-03-01" },
  { launchGateManifestId: "LG-002", scopeType: "domain", scopeId: "platform", requiredReadinessScore: 80, blockingRuleIds: ["LAW-001", "LAW-005", "LAW-006", "LAW-007", "LAW-015"], blockingFailureTypes: ["P0-journey-fail", "architecture-violation"], minimumRuntimeEvidence: 75, minimumJourneyPassRate: 90, minimumInteractionPassRate: 85, allowOverrides: true, createdAt: "2026-03-01" },
  { launchGateManifestId: "LG-003", scopeType: "domain", scopeId: "business", requiredReadinessScore: 80, blockingRuleIds: ["LAW-020", "LAW-022"], blockingFailureTypes: ["P0-journey-fail", "contract-drift"], minimumRuntimeEvidence: 70, minimumJourneyPassRate: 85, minimumInteractionPassRate: 80, allowOverrides: true, createdAt: "2026-03-20" },
  { launchGateManifestId: "LG-004", scopeType: "release_ring", scopeId: "canary", requiredReadinessScore: 90, blockingRuleIds: ["LAW-026", "LAW-029"], blockingFailureTypes: ["P0-journey-fail", "critical-manifest-missing", "proof-absent", "runtime-evidence-absent"], minimumRuntimeEvidence: 90, minimumJourneyPassRate: 98, minimumInteractionPassRate: 95, allowOverrides: false, createdAt: "2026-04-01" },
  { launchGateManifestId: "LG-005", scopeType: "environment", scopeId: "production", requiredReadinessScore: 92, blockingRuleIds: ["LAW-001", "LAW-005", "LAW-007", "LAW-020", "LAW-026", "LAW-029"], blockingFailureTypes: ["P0-journey-fail", "critical-manifest-missing", "proof-absent", "architecture-violation", "contract-drift"], minimumRuntimeEvidence: 95, minimumJourneyPassRate: 99, minimumInteractionPassRate: 95, allowOverrides: false, createdAt: "2026-04-01" },
];

// ═══════════════════════════════════════════════════════════════
// J. ValidationRunRecord
// ═══════════════════════════════════════════════════════════════

export interface ValidationRunRecord {
  validationRunId: string;
  runType: ValidationRunType;
  lawPackIds: string[];
  startedAt: string;
  completedAt: string;
  overallStatus: "pass" | "fail" | "partial";
  blockerCount: number;
  warningCount: number;
  artifactRefs: string[];
  createdAt: string;
}

export const VALIDATION_RUNS: ValidationRunRecord[] = [
  { validationRunId: "VR-001", runType: "ci", lawPackIds: ["LP-001", "LP-003"], startedAt: "2026-04-10T08:00:00Z", completedAt: "2026-04-10T08:02:15Z", overallStatus: "fail", blockerCount: 3, warningCount: 8, artifactRefs: ["validation-summary.json"], createdAt: "2026-04-10" },
  { validationRunId: "VR-002", runType: "nightly", lawPackIds: ["LP-001", "LP-002", "LP-003", "LP-004"], startedAt: "2026-04-10T02:00:00Z", completedAt: "2026-04-10T02:05:30Z", overallStatus: "fail", blockerCount: 5, warningCount: 14, artifactRefs: ["nightly-validation-report.json", "architecture-compliance-report.json"], createdAt: "2026-04-10" },
  { validationRunId: "VR-003", runType: "ci", lawPackIds: ["LP-001"], startedAt: "2026-04-09T16:30:00Z", completedAt: "2026-04-09T16:31:45Z", overallStatus: "pass", blockerCount: 0, warningCount: 2, artifactRefs: ["validation-summary.json"], createdAt: "2026-04-09" },
  { validationRunId: "VR-004", runType: "pre_release", lawPackIds: ["LP-001", "LP-002", "LP-003", "LP-004"], startedAt: "2026-04-08T14:00:00Z", completedAt: "2026-04-08T14:08:20Z", overallStatus: "fail", blockerCount: 1, warningCount: 6, artifactRefs: ["pre-release-gate-report.json"], createdAt: "2026-04-08" },
  { validationRunId: "VR-005", runType: "launch_gate", lawPackIds: ["LP-004"], startedAt: "2026-04-08T15:00:00Z", completedAt: "2026-04-08T15:01:10Z", overallStatus: "pass", blockerCount: 0, warningCount: 1, artifactRefs: ["launch-gate-report.json"], createdAt: "2026-04-08" },
  { validationRunId: "VR-006", runType: "runtime_probe", lawPackIds: ["LP-003"], startedAt: "2026-04-10T10:00:00Z", completedAt: "2026-04-10T10:00:45Z", overallStatus: "partial", blockerCount: 0, warningCount: 4, artifactRefs: ["runtime-probe-results.json"], createdAt: "2026-04-10" },
];

// ═══════════════════════════════════════════════════════════════
// K. ValidationViolationRecord
// ═══════════════════════════════════════════════════════════════

export interface ValidationViolationRecord {
  violationId: string;
  validationRunId: string;
  ruleId: string;
  featureId: string | null;
  artifactType: "route" | "component" | "contract" | "manifest" | "service" | "test" | "config";
  artifactRef: string;
  severity: LawSeverity;
  message: string;
  remediationGuidance: string;
  owner: string;
  status: ViolationStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export const VALIDATION_VIOLATIONS: ValidationViolationRecord[] = [
  { violationId: "VV-001", validationRunId: "VR-001", ruleId: "LAW-020", featureId: "feat-spending-analytics", artifactType: "manifest", artifactRef: "src/pages/money/SpendingAnalytics.tsx", severity: "critical", message: "Feature 'Spending Analytics' has no feature manifest", remediationGuidance: "Create feature manifest with ID, owner, domain, dependencies.", owner: "finance-team", status: "open", createdAt: "2026-04-10", resolvedAt: null },
  { violationId: "VV-002", validationRunId: "VR-001", ruleId: "LAW-021", featureId: null, artifactType: "route", artifactRef: "/money/analytics", severity: "critical", message: "Route /money/analytics missing shell mapping", remediationGuidance: "Register route in shell mapping with owner and load budget.", owner: "finance-team", status: "open", createdAt: "2026-04-10", resolvedAt: null },
  { violationId: "VV-003", validationRunId: "VR-001", ruleId: "LAW-023", featureId: "feat-money-dashboard", artifactType: "component", artifactRef: "src/components/money/BalanceCard.tsx", severity: "high", message: "P0 component BalanceCard missing data-testid on primary CTA", remediationGuidance: "Add data-testid to all P0/P1 interactive elements.", owner: "finance-team", status: "acknowledged", createdAt: "2026-04-10", resolvedAt: null },
  { violationId: "VV-004", validationRunId: "VR-002", ruleId: "LAW-004", featureId: null, artifactType: "component", artifactRef: "src/packages/finance-os/spending/SpendingUtils.ts", severity: "critical", message: "Domain code contains direct fetch() call — violates domain purity", remediationGuidance: "Remove direct API calls. Use platform services.", owner: "finance-team", status: "open", createdAt: "2026-04-10", resolvedAt: null },
  { violationId: "VV-005", validationRunId: "VR-002", ruleId: "LAW-007", featureId: "feat-bill-pay", artifactType: "service", artifactRef: "src/packages/platform/executor/payment-executor.ts", severity: "critical", message: "Payment mutation path missing receipt binding", remediationGuidance: "Add receipt generation for all mutation paths.", owner: "platform-team", status: "open", createdAt: "2026-04-10", resolvedAt: null },
  { violationId: "VV-006", validationRunId: "VR-002", ruleId: "LAW-022", featureId: "feat-connector-mgmt", artifactType: "contract", artifactRef: "src/packages/connectors/HealthCheckConnector.ts", severity: "critical", message: "Connector HealthCheckConnector has no typed contract", remediationGuidance: "Create typed contract in contracts package.", owner: "platform-team", status: "acknowledged", createdAt: "2026-04-10", resolvedAt: null },
  { violationId: "VV-007", validationRunId: "VR-002", ruleId: "LAW-025", featureId: "feat-advisor-council", artifactType: "test", artifactRef: "advisor-council.spec.ts", severity: "high", message: "Feature 'AI Advisor Council' has no runtime evidence attached", remediationGuidance: "Attach runtime evidence or probe to feature completion.", owner: "ai-team", status: "open", createdAt: "2026-04-10", resolvedAt: null },
  { violationId: "VV-008", validationRunId: "VR-004", ruleId: "LAW-027", featureId: "feat-money-dashboard", artifactType: "config", artifactRef: "docs/money-dashboard-status.md", severity: "high", message: "Status claims 'production-ready' but readiness score is 72%", remediationGuidance: "Align status claims with readiness score evidence.", owner: "finance-team", status: "resolved", createdAt: "2026-04-08", resolvedAt: "2026-04-09" },
  { violationId: "VV-009", validationRunId: "VR-002", ruleId: "LAW-024", featureId: "feat-spending-analytics", artifactType: "manifest", artifactRef: "spending-analytics", severity: "high", message: "Feature 'Spending Analytics' missing journey manifest for P1 workflow", remediationGuidance: "Create journey manifest for critical workflows.", owner: "finance-team", status: "open", createdAt: "2026-04-10", resolvedAt: null },
  { violationId: "VV-010", validationRunId: "VR-002", ruleId: "LAW-028", featureId: null, artifactType: "config", artifactRef: "concierge-domain", severity: "high", message: "Architecture drift in concierge domain unresolved for 12 days (threshold: 7)", remediationGuidance: "Resolve critical drift within 7 days or escalate.", owner: "concierge-team", status: "open", createdAt: "2026-04-10", resolvedAt: null },
];

// ═══════════════════════════════════════════════════════════════
// L. ComplianceOwnershipRecord (extended)
// ═══════════════════════════════════════════════════════════════

export interface OwnershipEntry {
  id: string;
  area: string;
  owner: string;
  type: "domain" | "shell" | "contract" | "route" | "probe" | "manifest" | "service";
  unresolvedViolations: number;
  driftCount: number;
  missingManifests: number;
  complianceScore: number;
  // Extended fields (spec L)
  secondaryOwner: string | null;
  team: string;
  escalationPath: string;
}

export const OWNERSHIP_REGISTRY: OwnershipEntry[] = [
  { id: "OWN-001", area: "Finance Domain", owner: "finance-team", type: "domain", unresolvedViolations: 2, driftCount: 1, missingManifests: 3, complianceScore: 82, secondaryOwner: "finance-lead-2", team: "Finance Engineering", escalationPath: "finance-lead → CTO" },
  { id: "OWN-002", area: "Business Domain", owner: "business-team", type: "domain", unresolvedViolations: 1, driftCount: 0, missingManifests: 2, complianceScore: 88, secondaryOwner: "business-lead-2", team: "Business Engineering", escalationPath: "business-lead → CTO" },
  { id: "OWN-003", area: "Concierge Domain", owner: "concierge-team", type: "domain", unresolvedViolations: 0, driftCount: 1, missingManifests: 4, complianceScore: 79, secondaryOwner: null, team: "Concierge Engineering", escalationPath: "concierge-lead → CTO" },
  { id: "OWN-004", area: "Platform Core", owner: "platform-team", type: "domain", unresolvedViolations: 3, driftCount: 2, missingManifests: 1, complianceScore: 85, secondaryOwner: "platform-lead-2", team: "Platform Engineering", escalationPath: "platform-lead → CTO" },
  { id: "OWN-005", area: "Admin Shell", owner: "platform-team", type: "shell", unresolvedViolations: 1, driftCount: 0, missingManifests: 0, complianceScore: 95, secondaryOwner: null, team: "Platform Engineering", escalationPath: "platform-lead → CTO" },
  { id: "OWN-006", area: "Owner Shell", owner: "owner-team", type: "shell", unresolvedViolations: 0, driftCount: 0, missingManifests: 1, complianceScore: 92, secondaryOwner: null, team: "Owner Experience", escalationPath: "owner-lead → CPO" },
  { id: "OWN-007", area: "Money Office Shell", owner: "finance-team", type: "shell", unresolvedViolations: 1, driftCount: 1, missingManifests: 2, complianceScore: 84, secondaryOwner: "finance-lead-2", team: "Finance Engineering", escalationPath: "finance-lead → CTO" },
  { id: "OWN-008", area: "Revenue Office Shell", owner: "business-team", type: "shell", unresolvedViolations: 0, driftCount: 0, missingManifests: 1, complianceScore: 90, secondaryOwner: null, team: "Business Engineering", escalationPath: "business-lead → CTO" },
  { id: "OWN-009", area: "Contract Layer", owner: "platform-team", type: "contract", unresolvedViolations: 2, driftCount: 1, missingManifests: 0, complianceScore: 87, secondaryOwner: "contracts-lead", team: "Platform Engineering", escalationPath: "contracts-lead → platform-lead → CTO" },
  { id: "OWN-010", area: "Proof & Receipt System", owner: "platform-team", type: "service", unresolvedViolations: 1, driftCount: 0, missingManifests: 0, complianceScore: 93, secondaryOwner: null, team: "Platform Engineering", escalationPath: "platform-lead → CTO" },
  { id: "OWN-011", area: "AI Engineering", owner: "ai-team", type: "domain", unresolvedViolations: 0, driftCount: 1, missingManifests: 2, complianceScore: 86, secondaryOwner: "ai-lead-2", team: "AI Engineering", escalationPath: "ai-lead → CTO" },
  { id: "OWN-012", area: "Connector Governance", owner: "platform-team", type: "service", unresolvedViolations: 0, driftCount: 0, missingManifests: 1, complianceScore: 91, secondaryOwner: null, team: "Platform Engineering", escalationPath: "platform-lead → CTO" },
  { id: "OWN-013", area: "Identity & Auth", owner: "security-team", type: "service", unresolvedViolations: 0, driftCount: 0, missingManifests: 0, complianceScore: 96, secondaryOwner: "security-lead-2", team: "Security Engineering", escalationPath: "security-lead → CISO → CTO" },
  { id: "OWN-014", area: "Runtime Probes", owner: "reliability-team", type: "probe", unresolvedViolations: 0, driftCount: 0, missingManifests: 3, complianceScore: 78, secondaryOwner: null, team: "Reliability Engineering", escalationPath: "reliability-lead → CTO" },
  { id: "OWN-015", area: "Launch Gates", owner: "release-team", type: "manifest", unresolvedViolations: 0, driftCount: 0, missingManifests: 0, complianceScore: 94, secondaryOwner: "release-lead-2", team: "Release Engineering", escalationPath: "release-lead → CTO" },
];

// ═══════════════════════════════════════════════════════════════
// M. GeneratorTemplateRecord (extended ScaffoldEntry)
// ═══════════════════════════════════════════════════════════════

export interface ScaffoldEntry {
  id: string;
  name: string;
  scriptPath: string;
  produces: string[];
  lastUsed: string | null;
  complianceCoverage: number;
  status: "active" | "planned" | "deprecated";
  description: string;
  // Extended fields (spec M)
  domain: string;
  includesManifests: boolean;
  includesContracts: boolean;
  includesTests: boolean;
  includesProbeScaffold: boolean;
  includesRouteShellBinding: boolean;
  includesHelpRegistration: boolean;
  includesCommandRegistration: boolean;
  version: string;
}

export const SCAFFOLD_REGISTRY: ScaffoldEntry[] = [
  { id: "SCF-001", name: "Service Manifest Generator", scriptPath: "scripts/generate-service-manifest.ts", produces: ["service-manifest.json"], lastUsed: "2026-04-10", complianceCoverage: 95, status: "active", description: "Generates canonical service inventory manifest", domain: "platform", includesManifests: true, includesContracts: false, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "2.1.0" },
  { id: "SCF-002", name: "Route Manifest Generator", scriptPath: "scripts/generate-route-manifest.ts", produces: ["route-manifest.json"], lastUsed: "2026-04-10", complianceCoverage: 92, status: "active", description: "Generates route → shell → owner mapping", domain: "platform", includesManifests: true, includesContracts: false, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: true, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.8.0" },
  { id: "SCF-003", name: "Capability Index Generator", scriptPath: "scripts/generate-capability-index.ts", produces: ["capability-index.json"], lastUsed: "2026-04-10", complianceCoverage: 88, status: "active", description: "Indexes all capability contracts", domain: "platform", includesManifests: false, includesContracts: true, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.5.0" },
  { id: "SCF-004", name: "Prompt Index Generator", scriptPath: "scripts/generate-prompt-index.ts", produces: ["prompt-index.json"], lastUsed: "2026-04-09", complianceCoverage: 85, status: "active", description: "Indexes prompt families and traceability", domain: "platform", includesManifests: true, includesContracts: false, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.2.0" },
  { id: "SCF-005", name: "Connector Catalog Generator", scriptPath: "scripts/generate-connector-catalog.ts", produces: ["connector-catalog.json"], lastUsed: "2026-04-10", complianceCoverage: 90, status: "active", description: "Catalogs all managed connectors", domain: "platform", includesManifests: true, includesContracts: true, includesTests: false, includesProbeScaffold: true, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.4.0" },
  { id: "SCF-006", name: "Advisor Registry Generator", scriptPath: "scripts/generate-advisor-registry.ts", produces: ["advisor-registry.json"], lastUsed: "2026-04-09", complianceCoverage: 87, status: "active", description: "Registers advisor configurations", domain: "platform", includesManifests: true, includesContracts: true, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.3.0" },
  { id: "SCF-007", name: "Contract Manifest Generator", scriptPath: "scripts/generate-contract-manifest.ts", produces: ["contract-manifest.json"], lastUsed: "2026-04-10", complianceCoverage: 93, status: "active", description: "Contract barrel export inventory", domain: "contracts", includesManifests: true, includesContracts: true, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "2.0.0" },
  { id: "SCF-008", name: "Capability Matrices Generator", scriptPath: "scripts/generate-capability-matrices.ts", produces: ["capability-event-matrix.json", "capability-owner-map.json", "capability-policy-matrix.json", "capability-receipt-matrix.json", "capability-surface-matrix.json"], lastUsed: "2026-04-10", complianceCoverage: 91, status: "active", description: "Cross-reference capability matrices", domain: "platform", includesManifests: false, includesContracts: true, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.6.0" },
  { id: "SCF-009", name: "Shell Space Registry Generator", scriptPath: "scripts/generate-shell-space-registry.ts", produces: ["shell-space-registry.json"], lastUsed: "2026-04-09", complianceCoverage: 86, status: "active", description: "Shell workspace spatial registry", domain: "platform", includesManifests: true, includesContracts: false, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: true, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.1.0" },
  { id: "SCF-010", name: "Runtime Conformance Generator", scriptPath: "scripts/generate-runtime-conformance.ts", produces: ["runtime-conformance-manifest.json"], lastUsed: "2026-04-10", complianceCoverage: 82, status: "active", description: "Runtime behavior conformance checks", domain: "platform", includesManifests: true, includesContracts: false, includesTests: true, includesProbeScaffold: true, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.0.0" },
  { id: "SCF-011", name: "Ownership Manifest Generator", scriptPath: "scripts/generate-ownership-manifest.ts", produces: ["ownership-manifest.json"], lastUsed: "2026-04-10", complianceCoverage: 89, status: "active", description: "Domain/service/route ownership mapping", domain: "platform", includesManifests: true, includesContracts: false, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.3.0" },
  { id: "SCF-012", name: "Architecture Compliance Generator", scriptPath: "scripts/generate-architecture-compliance.ts", produces: ["architecture-compliance-report.json"], lastUsed: "2026-04-10", complianceCoverage: 94, status: "active", description: "Full architecture compliance report", domain: "platform", includesManifests: true, includesContracts: false, includesTests: true, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "2.2.0" },
  { id: "SCF-013", name: "Validation Summary Generator", scriptPath: "scripts/generate-validation-summary.ts", produces: ["validation-summary.json"], lastUsed: "2026-04-10", complianceCoverage: 90, status: "active", description: "Aggregated validation results", domain: "platform", includesManifests: false, includesContracts: false, includesTests: true, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.5.0" },
  { id: "SCF-014", name: "Launch Tier Index Generator", scriptPath: "scripts/generate-launch-tier-index.ts", produces: ["launch-tier-index.json"], lastUsed: "2026-04-09", complianceCoverage: 88, status: "active", description: "Launch readiness tier classification", domain: "deployment", includesManifests: true, includesContracts: false, includesTests: false, includesProbeScaffold: true, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.1.0" },
  { id: "SCF-015", name: "Operational Scorecards Generator", scriptPath: "scripts/generate-operational-scorecards.ts", produces: ["operational-scorecards.json", "operational-metrics-snapshot.json"], lastUsed: "2026-04-10", complianceCoverage: 85, status: "active", description: "Operational health scorecards", domain: "platform", includesManifests: false, includesContracts: false, includesTests: false, includesProbeScaffold: true, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.0.0" },
  { id: "SCF-016", name: "Feature Integration Index Generator", scriptPath: "scripts/generate-feature-integration-index.ts", produces: ["feature-integration-index.json"], lastUsed: "2026-04-09", complianceCoverage: 83, status: "active", description: "Feature-to-feature integration map", domain: "platform", includesManifests: true, includesContracts: false, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.0.0" },
  { id: "SCF-017", name: "Internal Agent Registry Generator", scriptPath: "scripts/generate-internal-agent-registry.ts", produces: ["internal-agent-registry.json"], lastUsed: "2026-04-09", complianceCoverage: 80, status: "active", description: "Internal AI agent registry", domain: "platform", includesManifests: true, includesContracts: true, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.0.0" },
  { id: "SCF-018", name: "Formula Registry Generator", scriptPath: "scripts/generate-formula-registry.ts", produces: ["formula-registry.json"], lastUsed: "2026-04-08", complianceCoverage: 78, status: "active", description: "Financial formula registry", domain: "finance", includesManifests: true, includesContracts: false, includesTests: true, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.0.0" },
  { id: "SCF-019", name: "Surface Performance Budget Generator", scriptPath: "scripts/generate-surface-performance-budget.ts", produces: ["surface-performance-budget.json"], lastUsed: "2026-04-10", complianceCoverage: 84, status: "active", description: "Route performance budgets", domain: "platform", includesManifests: false, includesContracts: false, includesTests: false, includesProbeScaffold: true, includesRouteShellBinding: true, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.2.0" },
  { id: "SCF-020", name: "Maturity Thresholds Generator", scriptPath: "scripts/generate-maturity-thresholds.ts", produces: ["maturity-thresholds.json"], lastUsed: "2026-04-09", complianceCoverage: 81, status: "active", description: "Feature maturity threshold definitions", domain: "platform", includesManifests: true, includesContracts: false, includesTests: false, includesProbeScaffold: false, includesRouteShellBinding: false, includesHelpRegistration: false, includesCommandRegistration: false, version: "1.0.0" },
];

// ═══════════════════════════════════════════════════════════════
// CI / PR GATE REGISTRY (unchanged)
// ═══════════════════════════════════════════════════════════════

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
// MANIFEST REQUIREMENTS (kept for backward compat)
// ═══════════════════════════════════════════════════════════════

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
// N. DriftEnforcementRecord
// ═══════════════════════════════════════════════════════════════

export interface DriftEnforcementRecord {
  driftEnforcementId: string;
  driftType: DriftType;
  scopeType: ScopeType;
  scopeId: string;
  severity: LawSeverity;
  detectedAt: string;
  resolvedAt: string | null;
  owner: string;
  blocking: boolean;
  notes: string;
}

export const DRIFT_RECORDS: DriftEnforcementRecord[] = [
  { driftEnforcementId: "DR-001", driftType: "spec_code", scopeType: "feature", scopeId: "feat-spending-analytics", severity: "high", detectedAt: "2026-04-08", resolvedAt: null, owner: "finance-team", blocking: false, notes: "Spec says 7 chart types, code has 4. Missing: bubble, radar, waterfall." },
  { driftEnforcementId: "DR-002", driftType: "contract_code", scopeType: "contract", scopeId: "finance-payment-contract", severity: "critical", detectedAt: "2026-04-09", resolvedAt: null, owner: "finance-team", blocking: true, notes: "Contract v2.1 has refund field, implementation still on v2.0 schema." },
  { driftEnforcementId: "DR-003", driftType: "route_shell", scopeType: "route", scopeId: "/money/analytics", severity: "high", detectedAt: "2026-04-10", resolvedAt: null, owner: "finance-team", blocking: false, notes: "Route exists but not registered in shell mapping." },
  { driftEnforcementId: "DR-004", driftType: "manifest_impl", scopeType: "feature", scopeId: "feat-concierge-tasks", severity: "medium", detectedAt: "2026-03-28", resolvedAt: null, owner: "concierge-team", blocking: false, notes: "Manifest declares 5 endpoints, only 3 implemented." },
  { driftEnforcementId: "DR-005", driftType: "runtime_claim", scopeType: "feature", scopeId: "feat-money-dashboard", severity: "high", detectedAt: "2026-04-08", resolvedAt: "2026-04-09", owner: "finance-team", blocking: false, notes: "Claimed production-ready but readiness score was 72%. Resolved after evidence update." },
  { driftEnforcementId: "DR-006", driftType: "journey_drift", scopeType: "journey", scopeId: "j-pay-bill-e2e", severity: "high", detectedAt: "2026-04-10", resolvedAt: null, owner: "finance-team", blocking: false, notes: "Journey manifest expects 4 steps, actual flow has 5 (new 'select payment method' step added)." },
  { driftEnforcementId: "DR-007", driftType: "selector_drift", scopeType: "component", scopeId: "BillPayForm", severity: "medium", detectedAt: "2026-04-09", resolvedAt: null, owner: "finance-team", blocking: false, notes: "data-testid='pay-bill-submit' renamed to 'submit-payment' without manifest update." },
  { driftEnforcementId: "DR-008", driftType: "prompt_impl", scopeType: "feature", scopeId: "feat-advisor-council", severity: "medium", detectedAt: "2026-04-07", resolvedAt: null, owner: "ai-team", blocking: false, notes: "Prompt family PROMPT-012 specifies confidence threshold 0.8, implementation uses 0.7." },
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
  { id: "L6", name: "Release Enforcement", description: "Blocks launches if critical truth is missing", healthScore: 85, totalChecks: 8, passingChecks: 7, linkedPage: "/admin/platform-law/launch-enforcement", artifacts: ["launch truth gates", "behavior truth gates", "readiness thresholds"] },
  { id: "L7", name: "Governance Visibility", description: "Makes truth visible to humans", healthScore: 90, totalChecks: 7, passingChecks: 7, linkedPage: "/admin/platform-law", artifacts: ["truth center", "compliance dashboards", "drift radar", "accountability boards"] },
];

// ═══════════════════════════════════════════════════════════════
// ENFORCEMENT ARCHITECTURE (5 Layers A-E)
// ═══════════════════════════════════════════════════════════════

export interface EnforcementArchitectureLayer {
  id: string;
  name: string;
  description: string;
  checks: string[];
  blocksOn: string[];
  warnsOn: string[];
}

export const ENFORCEMENT_ARCHITECTURE: EnforcementArchitectureLayer[] = [
  { id: "A", name: "Local Developer Enforcement", description: "Runs before commit / during development", checks: ["manifest linting", "route-shell checks", "contract presence checks", "selector/test-id checks", "feature generator validation", "import boundary validation"], blocksOn: ["forbidden boundary violated", "route added without shell mapping"], warnsOn: ["naming drift", "documentation lag"] },
  { id: "B", name: "PR / CI Enforcement", description: "Runs on every PR", checks: ["full law pack validation", "feature manifest validation", "interaction/journey validation", "contract validation", "route/shell validation", "readiness impact validation", "changed-feature criticality checks", "blocker violation gating"], blocksOn: ["blocker law violated", "major feature lacks manifest", "critical journey changed without manifest update", "contract required but absent"], warnsOn: ["low-criticality coverage gaps", "noncritical stale evidence"] },
  { id: "C", name: "Nightly Truth Audit", description: "Runs across repo and integrated envs", checks: ["drift scans", "manifest coverage audit", "route inventory audit", "interaction coverage audit", "contract consumer/implementer audit", "selector drift scan", "runtime evidence freshness scan"], blocksOn: [], warnsOn: ["all findings surfaced as drift records"] },
  { id: "D", name: "Runtime Probe Enforcement", description: "Runs in staging and production-safe environments", checks: ["page load probes", "CTA probes", "form probes", "journey probes", "redirect integrity probes", "proof/receipt checks", "projection update checks", "environment-specific truth checks"], blocksOn: ["P0 journey failures"], warnsOn: ["degraded performance", "non-critical probe failures"] },
  { id: "E", name: "Release / Launch Gate Enforcement", description: "Runs before ring promotion or release", checks: ["readiness threshold checks", "P0 interaction/journey pass checks", "critical manifest completeness", "runtime evidence recency", "unresolved blocker count", "launch-gate manifest rules"], blocksOn: ["P0 journey failures unresolved", "required runtime evidence missing", "readiness below threshold", "unresolved critical drift", "launch gate manifest conditions unmet"], warnsOn: ["informational naming drift"] },
];

// ═══════════════════════════════════════════════════════════════
// PROBE CLASS DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface ProbeClassDefinition {
  id: string;
  name: string;
  description: string;
  outputs: string[];
  environment: "staging" | "production" | "both";
  criticality: "P0" | "P1" | "P2";
}

export const PROBE_CLASSES: ProbeClassDefinition[] = [
  { id: "PC-001", name: "Read-Only Page Probes", description: "Verifies page renders, loads data, displays expected content", outputs: ["pass/fail", "screenshot", "timing", "DOM assertions"], environment: "both", criticality: "P0" },
  { id: "PC-002", name: "Synthetic User Journey Probes", description: "Replays canonical user journeys end-to-end", outputs: ["pass/fail", "screenshot/video", "redirect trace", "timing", "evidence refs"], environment: "staging", criticality: "P0" },
  { id: "PC-003", name: "Write-Flow Probes", description: "Tests mutations in controlled environments", outputs: ["pass/fail", "receipt verification", "state change confirmation"], environment: "staging", criticality: "P0" },
  { id: "PC-004", name: "Approval/Receipt Verification Probes", description: "Confirms approval workflows produce receipts", outputs: ["pass/fail", "receipt hash", "evidence bundle"], environment: "staging", criticality: "P1" },
  { id: "PC-005", name: "Command Palette Probes", description: "Verifies command palette actions are registered and functional", outputs: ["pass/fail", "action count", "navigation verification"], environment: "both", criticality: "P1" },
  { id: "PC-006", name: "Money/Account-Link Safe Probes", description: "Safe financial operation verification without real transactions", outputs: ["pass/fail", "mock transaction trace", "balance assertions"], environment: "staging", criticality: "P0" },
  { id: "PC-007", name: "Admin Critical-Action Probes", description: "Verifies admin operations work correctly", outputs: ["pass/fail", "audit trail", "permission verification"], environment: "staging", criticality: "P1" },
  { id: "PC-008", name: "Deployment Gate Probes", description: "Pre-deploy verification of critical paths", outputs: ["pass/fail", "canary metrics", "rollback readiness"], environment: "staging", criticality: "P0" },
];

// ═══════════════════════════════════════════════════════════════
// WAIVER RECORDS
// ═══════════════════════════════════════════════════════════════

export interface WaiverRecord {
  waiverId: string;
  violationId: string;
  ruleId: string;
  justification: string;
  approvedBy: string;
  expiresAt: string;
  status: "active" | "expired" | "revoked";
  createdAt: string;
}

export const WAIVERS: WaiverRecord[] = [
  { waiverId: "WV-001", violationId: "VV-003", ruleId: "LAW-023", justification: "Test ID will be added in next sprint. Interaction is not user-facing yet.", approvedBy: "platform-lead", expiresAt: "2026-04-20", status: "active", createdAt: "2026-04-10" },
  { waiverId: "WV-002", violationId: "VV-009", ruleId: "LAW-024", justification: "Journey manifest deferred — feature is behind flag and not in launch scope.", approvedBy: "finance-lead", expiresAt: "2026-05-01", status: "active", createdAt: "2026-04-10" },
  { waiverId: "WV-003", violationId: "VV-008", ruleId: "LAW-027", justification: "Status corrected, readiness updated to match evidence.", approvedBy: "finance-lead", expiresAt: "2026-04-15", status: "expired", createdAt: "2026-04-08" },
  { waiverId: "WV-004", violationId: "VV-006", ruleId: "LAW-022", justification: "Connector contract in progress, expected completion by 2026-04-15.", approvedBy: "platform-lead", expiresAt: "2026-04-15", status: "active", createdAt: "2026-04-10" },
];

// ═══════════════════════════════════════════════════════════════
// PR TEMPLATE & FEATURE GENERATOR TEMPLATE
// ═══════════════════════════════════════════════════════════════

export interface PRTemplateField {
  id: string;
  field: string;
  type: "text" | "boolean" | "select";
  required: boolean;
  category: "metadata" | "manifest" | "compliance";
}

export const PR_TEMPLATE: PRTemplateField[] = [
  { id: "PR-001", field: "Feature ID", type: "text", required: true, category: "metadata" },
  { id: "PR-002", field: "Domain", type: "select", required: true, category: "metadata" },
  { id: "PR-003", field: "Owner", type: "text", required: true, category: "metadata" },
  { id: "PR-004", field: "Criticality", type: "select", required: true, category: "metadata" },
  { id: "PR-005", field: "Feature manifest added/updated?", type: "boolean", required: true, category: "manifest" },
  { id: "PR-006", field: "Interaction manifest added/updated?", type: "boolean", required: true, category: "manifest" },
  { id: "PR-007", field: "Journey manifest added/updated?", type: "boolean", required: true, category: "manifest" },
  { id: "PR-008", field: "Contract(s) added/updated?", type: "boolean", required: true, category: "manifest" },
  { id: "PR-009", field: "Route(s) registered with shell?", type: "boolean", required: true, category: "manifest" },
  { id: "PR-010", field: "Runtime evidence expectations added?", type: "boolean", required: true, category: "manifest" },
  { id: "PR-011", field: "I used or updated a canonical feature manifest", type: "boolean", required: true, category: "compliance" },
  { id: "PR-012", field: "All new routes assigned to correct shell", type: "boolean", required: true, category: "compliance" },
  { id: "PR-013", field: "All new APIs use canonical contracts", type: "boolean", required: true, category: "compliance" },
  { id: "PR-014", field: "No forbidden imports introduced", type: "boolean", required: true, category: "compliance" },
  { id: "PR-015", field: "Critical interactions have stable selectors", type: "boolean", required: true, category: "compliance" },
  { id: "PR-016", field: "Error/loading/empty/degraded states handled", type: "boolean", required: true, category: "compliance" },
];

export interface FeatureGeneratorTemplateRecord {
  generatorTemplateId: string;
  templateName: string;
  domain: string;
  includesManifests: boolean;
  includesContracts: boolean;
  includesTests: boolean;
  includesProbeScaffold: boolean;
  includesRouteShellBinding: boolean;
  includesHelpRegistration: boolean;
  includesCommandRegistration: boolean;
  version: string;
  createdAt: string;
  generatedFiles: string[];
  generatedMetadata: string[];
}

export const FEATURE_GENERATOR_TEMPLATES: FeatureGeneratorTemplateRecord[] = [
  { generatorTemplateId: "FGT-001", templateName: "Standard Feature", domain: "all", includesManifests: true, includesContracts: true, includesTests: true, includesProbeScaffold: true, includesRouteShellBinding: true, includesHelpRegistration: true, includesCommandRegistration: true, version: "2.0.0", createdAt: "2026-03-01", generatedFiles: ["feature folder", "route file(s)", "shell binding", "component scaffold", "contracts file", "feature manifest", "interaction manifest", "readiness manifest", "test scaffold", "probe scaffold", "ownership file"], generatedMetadata: ["feature ID", "canonical domain", "owner", "criticality", "prompt/spec origin", "readiness defaults", "rule pack refs"] },
  { generatorTemplateId: "FGT-002", templateName: "Finance Domain Feature", domain: "finance", includesManifests: true, includesContracts: true, includesTests: true, includesProbeScaffold: true, includesRouteShellBinding: true, includesHelpRegistration: true, includesCommandRegistration: true, version: "1.5.0", createdAt: "2026-03-15", generatedFiles: ["finance subfolder", "route under /money", "FinanceShell binding", "contract stubs", "journey manifest template", "receipt wiring"], generatedMetadata: ["feature ID", "finance domain owner", "P0 criticality default", "receipt requirements"] },
  { generatorTemplateId: "FGT-003", templateName: "Admin Panel Feature", domain: "admin", includesManifests: true, includesContracts: false, includesTests: true, includesProbeScaffold: false, includesRouteShellBinding: true, includesHelpRegistration: true, includesCommandRegistration: true, version: "1.2.0", createdAt: "2026-04-01", generatedFiles: ["admin page", "route under /admin", "AdminShell binding", "command palette entry", "help registration"], generatedMetadata: ["feature ID", "admin domain", "P1 criticality default"] },
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

export function getLawPackById(id: string): PlatformLawPack | undefined {
  return LAW_PACKS.find(p => p.lawPackId === id);
}

export function getLawsByPack(packId: string): PlatformLaw[] {
  return PLATFORM_LAWS.filter(l => l.lawPackId === packId);
}

export function getMachineCheckableLaws(): PlatformLaw[] {
  return PLATFORM_LAWS.filter(l => l.machineCheckable);
}

export function getFeatureManifestByFeatureId(featureId: string): FeatureManifestRecord | undefined {
  return FEATURE_MANIFESTS.find(f => f.featureId === featureId);
}

export function getInteractionsByFeature(featureId: string): InteractionManifestRecord[] {
  return INTERACTION_MANIFESTS.filter(i => i.featureId === featureId);
}

export function getJourneysByFeature(featureId: string): JourneyManifestRecord[] {
  return JOURNEY_MANIFESTS.filter(j => j.featureId === featureId);
}

export function getContractsByDomain(domain: string): ContractManifestRecord[] {
  return CONTRACT_MANIFESTS.filter(c => c.ownerDomain === domain);
}

export function getOpenViolations(): ValidationViolationRecord[] {
  return VALIDATION_VIOLATIONS.filter(v => v.status === "open");
}

export function getBlockingDrift(): DriftEnforcementRecord[] {
  return DRIFT_RECORDS.filter(d => d.blocking && !d.resolvedAt);
}

export function getUnresolvedDrift(): DriftEnforcementRecord[] {
  return DRIFT_RECORDS.filter(d => !d.resolvedAt);
}

export function getRecentValidationRuns(count: number = 5): ValidationRunRecord[] {
  return [...VALIDATION_RUNS].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, count);
}

export function getReadinessForFeature(featureId: string): ReadinessManifestRecord | undefined {
  return READINESS_MANIFESTS.find(r => r.featureId === featureId);
}

export function getLaunchGateForScope(scopeId: string): LaunchGateManifestRecord | undefined {
  return LAUNCH_GATE_MANIFESTS.find(g => g.scopeId === scopeId);
}

export function getRuntimeEvidenceByFeature(featureId: string): RuntimeEvidenceManifestRecord[] {
  return RUNTIME_EVIDENCE_MANIFESTS.filter(r => r.featureId === featureId);
}

// ── New helpers for PLT05-PLT10 ──────────────────────────────

export function getViolationsByOwner(): Map<string, ValidationViolationRecord[]> {
  const map = new Map<string, ValidationViolationRecord[]>();
  VALIDATION_VIOLATIONS.forEach(v => {
    const list = map.get(v.owner) || [];
    list.push(v);
    map.set(v.owner, list);
  });
  return map;
}

export function getViolationsByFeature(): Map<string, ValidationViolationRecord[]> {
  const map = new Map<string, ValidationViolationRecord[]>();
  VALIDATION_VIOLATIONS.filter(v => v.featureId).forEach(v => {
    const list = map.get(v.featureId!) || [];
    list.push(v);
    map.set(v.featureId!, list);
  });
  return map;
}

export function getViolationAge(v: ValidationViolationRecord): number {
  const created = new Date(v.createdAt).getTime();
  const now = new Date("2026-04-10").getTime();
  return Math.round((now - created) / (1000 * 60 * 60 * 24));
}

export function getRepeatViolators(): { owner: string; count: number; openCount: number }[] {
  const map = new Map<string, { count: number; openCount: number }>();
  VALIDATION_VIOLATIONS.forEach(v => {
    const existing = map.get(v.owner) || { count: 0, openCount: 0 };
    existing.count++;
    if (v.status === "open") existing.openCount++;
    map.set(v.owner, existing);
  });
  return Array.from(map.entries())
    .map(([owner, data]) => ({ owner, ...data }))
    .sort((a, b) => b.count - a.count);
}

export function getDriftByCategory(): Map<DriftType, DriftEnforcementRecord[]> {
  const map = new Map<DriftType, DriftEnforcementRecord[]>();
  DRIFT_RECORDS.forEach(d => {
    const list = map.get(d.driftType) || [];
    list.push(d);
    map.set(d.driftType, list);
  });
  return map;
}

export function getDriftTimeline(): { date: string; count: number; resolved: number }[] {
  const dates = new Map<string, { count: number; resolved: number }>();
  DRIFT_RECORDS.forEach(d => {
    const date = d.detectedAt;
    const existing = dates.get(date) || { count: 0, resolved: 0 };
    existing.count++;
    if (d.resolvedAt) existing.resolved++;
    dates.set(date, existing);
  });
  return Array.from(dates.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getFeatureComplianceScore(featureId: string): {
  hasManifest: boolean; hasInteractions: boolean; hasJourneys: boolean;
  hasContracts: boolean; hasRuntimeEvidence: boolean; hasReadiness: boolean;
  violations: number; score: number;
} {
  const hasManifest = FEATURE_MANIFESTS.some(f => f.featureId === featureId);
  const hasInteractions = INTERACTION_MANIFESTS.some(i => i.featureId === featureId);
  const hasJourneys = JOURNEY_MANIFESTS.some(j => j.featureId === featureId);
  const hasContracts = CONTRACT_MANIFESTS.some(c => c.contractId.includes(featureId.replace("feat-", "")));
  const hasRuntimeEvidence = RUNTIME_EVIDENCE_MANIFESTS.some(r => r.featureId === featureId);
  const hasReadiness = READINESS_MANIFESTS.some(r => r.featureId === featureId);
  const violations = VALIDATION_VIOLATIONS.filter(v => v.featureId === featureId && v.status === "open").length;
  const checks = [hasManifest, hasInteractions, hasJourneys, hasContracts, hasRuntimeEvidence, hasReadiness];
  const passing = checks.filter(Boolean).length;
  const violationPenalty = Math.min(violations * 5, 30);
  const score = Math.max(0, Math.round((passing / checks.length) * 100) - violationPenalty);
  return { hasManifest, hasInteractions, hasJourneys, hasContracts, hasRuntimeEvidence, hasReadiness, violations, score };
}

export function getDomainComplianceScores(): { domain: string; score: number; features: number; violations: number }[] {
  const domains = ["finance", "business", "concierge", "platform", "admin", "ai"];
  return domains.map(domain => {
    const features = FEATURE_MANIFESTS.filter(f => f.domain === domain);
    const violations = VALIDATION_VIOLATIONS.filter(v => v.owner.includes(domain) && v.status === "open").length;
    const ownerEntries = OWNERSHIP_REGISTRY.filter(o => o.area.toLowerCase().includes(domain));
    const avgScore = ownerEntries.length > 0
      ? Math.round(ownerEntries.reduce((s, o) => s + o.complianceScore, 0) / ownerEntries.length)
      : 85;
    return { domain, score: avgScore, features: features.length, violations };
  });
}

export function getLaunchBlockers(): { featureId: string; reasons: string[] }[] {
  const blockers: { featureId: string; reasons: string[] }[] = [];
  FEATURE_MANIFESTS.filter(f => f.criticality === "P0").forEach(f => {
    const reasons: string[] = [];
    const violations = VALIDATION_VIOLATIONS.filter(v => v.featureId === f.featureId && v.status === "open" && v.severity === "critical");
    if (violations.length > 0) reasons.push(`${violations.length} critical violations`);
    const drift = DRIFT_RECORDS.filter(d => d.scopeId === f.featureId && d.blocking && !d.resolvedAt);
    if (drift.length > 0) reasons.push(`${drift.length} blocking drift`);
    const readiness = READINESS_MANIFESTS.find(r => r.featureId === f.featureId);
    if (!readiness) reasons.push("No readiness manifest");
    const runtimeEvidence = RUNTIME_EVIDENCE_MANIFESTS.filter(r => r.featureId === f.featureId && r.requiredForLaunch);
    if (runtimeEvidence.length === 0) reasons.push("No launch-required runtime evidence");
    if (reasons.length > 0) blockers.push({ featureId: f.featureId, reasons });
  });
  return blockers;
}

export function getNoOwnerGaps(): string[] {
  const ownedAreas = new Set(OWNERSHIP_REGISTRY.map(o => o.area.toLowerCase()));
  const expectedAreas = ["spending analytics", "task management", "notifications", "search", "help system"];
  return expectedAreas.filter(a => !ownedAreas.has(a));
}

export function getOwnerMTTR(): { owner: string; avgDays: number; resolvedCount: number }[] {
  const map = new Map<string, { totalDays: number; count: number }>();
  VALIDATION_VIOLATIONS.filter(v => v.status === "resolved" && v.resolvedAt).forEach(v => {
    const created = new Date(v.createdAt).getTime();
    const resolved = new Date(v.resolvedAt!).getTime();
    const days = Math.max(1, Math.round((resolved - created) / (1000 * 60 * 60 * 24)));
    const existing = map.get(v.owner) || { totalDays: 0, count: 0 };
    existing.totalDays += days;
    existing.count++;
    map.set(v.owner, existing);
  });
  return Array.from(map.entries()).map(([owner, data]) => ({
    owner, avgDays: Math.round(data.totalDays / data.count), resolvedCount: data.count
  }));
}

export function getWaiverForViolation(violationId: string): WaiverRecord | undefined {
  return WAIVERS.find(w => w.violationId === violationId && w.status === "active");
}
