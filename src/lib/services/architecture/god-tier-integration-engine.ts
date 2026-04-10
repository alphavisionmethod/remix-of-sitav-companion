// ═══════════════════════════════════════════════════════════════
// SITA OS — God-Tier Architecture Integration Engine
// Definitive integration report: mapping, matrices, phases, governance
// ═══════════════════════════════════════════════════════════════

export type IntegrationAction =
  | "integrate_now"
  | "elevate"
  | "consolidate"
  | "defer"
  | "reject"
  | "rename";

export type TaskMaturity = "immediate" | "near_term" | "later" | "avoid";

export type SprawlRisk = "reduces" | "neutral" | "increases" | "dangerous";

export type SecurityImpact = "improves" | "neutral" | "new_surface" | "risk";

// ── Module Mapping Matrix ─────────────────────────────────────

export interface ModuleMapping {
  proposedModule: string;
  currentEquivalent: string;
  currentFiles: string[];
  status: string;
  action: IntegrationAction;
  strategicValue: "critical" | "high" | "medium" | "low";
  launchValue: "critical" | "high" | "medium" | "low" | "none";
  complexityCost: "low" | "medium" | "high" | "very_high";
  sprawlRisk: SprawlRisk;
  rationale: string;
  nextStep: string;
}

export const MODULE_MAPPING_MATRIX: ModuleMapping[] = [
  {
    proposedModule: "Brain Core",
    currentEquivalent: "brain-core/ + ai-gateway edge function",
    currentFiles: [
      "src/lib/services/brain-core/orchestrate-intent.ts",
      "src/lib/services/brain-core/brain-core-types.ts",
      "src/lib/services/brain-core/brain-context-assembler.ts",
      "src/lib/services/brain-core/brain-response-handler.ts",
      "src/lib/services/brain-core/brain-tool-executor.ts",
      "src/lib/services/brain-core/brain-budget-enforcer.ts",
      "src/lib/services/brain-core/brain-capability-selector.ts",
      "src/lib/services/brain-core/brain-invocation-normalizer.ts",
      "src/lib/services/brain-core/brain-event-emitter.ts",
      "src/lib/services/brain-core/brain-receipt-recorder.ts",
    ],
    status: "Exists — 10 files, full orchestration pipeline",
    action: "elevate",
    strategicValue: "critical",
    launchValue: "critical",
    complexityCost: "low",
    sprawlRisk: "reduces",
    rationale:
      "Already the canonical intelligence orchestrator. Elevate orchestrate-intent.ts as THE single entry point. Do NOT create a second brain.",
    nextStep:
      "Formalize brain-core as the God-Tier Brain Core. Add documentation. Ensure all AI flows route through orchestrate-intent.",
  },
  {
    proposedModule: "ConscienceGate",
    currentEquivalent: "✅ conscience-gate/ (consolidated) + no-hallucination/ + launch honesty",
    currentFiles: [
      "src/lib/core-services/conscience-gate/conscience-gate.ts",
      "src/lib/no-hallucination/confidence.ts",
      "src/lib/no-hallucination/grounding.ts",
      "src/lib/no-hallucination/refusal.ts",
      "src/lib/no-hallucination/staleness.ts",
      "src/lib/no-hallucination/contradiction.ts",
      "src/lib/no-hallucination/truth-boundaries.ts",
      "src/lib/no-hallucination/advisor-contract.ts",
    ],
    status: "✅ Completed — consolidated into conscience-gate/. groundedness-gate deleted. Pre-flight wired into callBrainCore.",
    action: "elevate",
    strategicValue: "critical",
    launchValue: "high",
    complexityCost: "low",
    sprawlRisk: "reduces",
    rationale:
      "✅ DONE: groundedness-gate deleted, ConscienceGate consolidated in core-services/conscience-gate/. Pre-flight validation wired into callBrainCore. CritiqueLoop pattern available.",
    nextStep:
      "Maintain ConscienceGate as the canonical pre-response validation boundary. Extend CritiqueLoop patterns as needed.",
  },
  {
    proposedModule: "ModelRouter",
    currentEquivalent: "model-router/ + ai-gateway routing logic",
    currentFiles: [
      "src/lib/services/model-router/model-router.ts",
      "src/lib/services/model-router/model-router-types.ts",
    ],
    status: "Exists — 210 lines, full routing/fallback/health/cost logic",
    action: "elevate",
    strategicValue: "high",
    launchValue: "high",
    complexityCost: "low",
    sprawlRisk: "neutral",
    rationale:
      "Already complete. Formalize as the canonical model selection layer. Ensure all provider/model decisions centralize here.",
    nextStep:
      "Document as God-Tier ModelRouter. Ensure brain-core routes all model selection through this layer exclusively.",
  },
  {
    proposedModule: "InferenceEngine",
    currentEquivalent: "inference-gateway/ + ai-gateway edge function",
    currentFiles: [
      "src/lib/services/inference-gateway/inference-gateway.ts",
      "src/lib/services/inference-gateway/inference-gateway-types.ts",
    ],
    status: "Exists — 193 lines, canonical inference path",
    action: "elevate",
    strategicValue: "high",
    launchValue: "high",
    complexityCost: "low",
    sprawlRisk: "neutral",
    rationale:
      "Already the canonical inference execution layer. Keep as-is. Do NOT create a second inference engine or add local model support yet.",
    nextStep:
      "Formalize as God-Tier InferenceEngine. Verify all external model calls pass through this gateway.",
  },
  {
    proposedModule: "Mnemosyne",
    currentEquivalent: "✅ mnemosyne/context-assembler.ts (425 lines, fully implemented)",
    currentFiles: ["src/lib/services/mnemosyne/context-assembler.ts"],
    status: "✅ Completed — 425-line context assembler with memory graph, profile enrichment, and conversation persistence",
    action: "elevate",
    strategicValue: "high",
    launchValue: "medium",
    complexityCost: "low",
    sprawlRisk: "neutral",
    rationale:
      "✅ DONE: Expanded from stub to full context assembler. Includes memory graph integration, rich user profile context, persisted conversation history from advisor_memories, token budgeting, and evidence assembly.",
    nextStep:
      "Add embeddings/retrieval when vector storage strategy is finalized. Current implementation covers all flagship loop needs.",
  },
  {
    proposedModule: "Math-OS",
    currentEquivalent: "sovereign-calculation/ (formulas, regime, risk, scenario, reserves, receivables)",
    currentFiles: [
      "src/lib/services/sovereign-calculation/formulas.ts",
      "src/lib/services/sovereign-calculation/regime-engine.ts",
      "src/lib/services/sovereign-calculation/risk-engine.ts",
      "src/lib/services/sovereign-calculation/scenario-engine.ts",
      "src/lib/services/sovereign-calculation/reserves-engine.ts",
      "src/lib/services/sovereign-calculation/receivables-engine.ts",
    ],
    status: "Exists — full deterministic calculation suite for finance/tax/boardroom",
    action: "rename",
    strategicValue: "high",
    launchValue: "high",
    complexityCost: "low",
    sprawlRisk: "reduces",
    rationale:
      "Already has formulas, regime, risk, scenario engines. Acknowledge as Math-OS conceptually. No rebuild needed. Deterministic verification for finance/tax/boardroom-critical operations is already strong.",
    nextStep:
      "Add Math-OS alias/documentation. Ensure boardroom and finance loops use sovereign-calculation for all deterministic outputs.",
  },
  {
    proposedModule: "Desk / Tool Executor",
    currentEquivalent: "executor-service/ + recommendation-execution/ + connector-runners/",
    currentFiles: [
      "src/lib/services/executor-service/",
      "src/lib/services/recommendation-execution/",
      "src/lib/services/connector-runners/",
    ],
    status: "Fragmented — three separate execution concepts, not unified",
    action: "consolidate",
    strategicValue: "high",
    launchValue: "medium",
    complexityCost: "high",
    sprawlRisk: "reduces",
    rationale:
      "Consolidate into one Desk concept with clear boundaries: connector actions, recommendation execution, tool invocations. Defer autonomous tool execution until approval/proof hardened.",
    nextStep:
      "Create a thin Desk facade that unifies executor-service + recommendation-execution + connector-runners under a single invocation contract. Add mandatory approval gates for high-risk actions.",
  },
  {
    proposedModule: "Journeys / Autopilot",
    currentEquivalent: "operating-autopilot/ + customer-journey/ + workflow-engine/",
    currentFiles: [
      "src/lib/services/operating-autopilot/",
      "src/lib/services/customer-journey/",
      "src/lib/services/workflow-engine/",
    ],
    status: "Exists — three overlapping journey/workflow/autopilot systems",
    action: "consolidate",
    strategicValue: "medium",
    launchValue: "low",
    complexityCost: "high",
    sprawlRisk: "reduces",
    rationale:
      "Consolidate operating-autopilot + workflow-engine. Customer journey stays as proof/verification layer. Defer fully autonomous flows until approval/proof discipline is hardened.",
    nextStep:
      "Unify operating-autopilot + workflow-engine into a single Journeys system. Keep customer-journey as verification/proof. Do NOT add autonomous execution yet.",
  },
  {
    proposedModule: "Event Bus",
    currentEquivalent: "✅ event-bus/unified-event-service.ts (single canonical system)",
    currentFiles: [
      "src/lib/services/event-bus/event-envelope.ts",
      "src/lib/services/event-bus/publish-event.service.ts",
      "src/lib/services/event-bus/unified-event-service.ts",
    ],
    status: "✅ Completed — event-broker deleted, merged into UnifiedEventService with Supabase Realtime bridge",
    action: "elevate",
    strategicValue: "medium",
    launchValue: "medium",
    complexityCost: "low",
    sprawlRisk: "reduces",
    rationale:
      "✅ DONE: event-broker deleted. UnifiedEventService is the single canonical event system with publish/subscribe, trace, and Supabase Realtime bridge for server-side events.",
    nextStep:
      "Maintain UnifiedEventService as the single event system. Realtime bridge wired via PlatformInit.",
  },
];

// ── Integrate / Defer / Reject / Rename Matrix ───────────────

export interface IntegrationDecision {
  concept: string;
  decision: IntegrationAction;
  rationale: string;
  phase: "A" | "B" | "C" | "D";
  affectedLoops: string[];
}

export const INTEGRATION_DECISIONS: IntegrationDecision[] = [
  {
    concept: "Brain Core as single entry point",
    decision: "elevate",
    rationale: "Already canonical. Formalize documentation and ensure exclusivity.",
    phase: "A",
    affectedLoops: ["All 5 flagship loops"],
  },
  {
    concept: "ConscienceGate as pre-response validation",
    decision: "consolidate",
    rationale: "Merge groundedness-gate + no-hallucination into unified gate.",
    phase: "A",
    affectedLoops: ["Files + AI Assist", "Boardroom + Decision", "Admin Truth"],
  },
  {
    concept: "CritiqueLoop as post-inference validation",
    decision: "integrate_now",
    rationale: "NEW pattern — lightweight post-inference check feeding back to ConscienceGate. Not a full module.",
    phase: "A",
    affectedLoops: ["Boardroom + Decision", "Admin Truth + Approval"],
  },
  {
    concept: "ModelRouter formalization",
    decision: "elevate",
    rationale: "Already complete at 210 lines. Just formalize as canonical.",
    phase: "A",
    affectedLoops: ["Files + AI Assist", "Boardroom + Decision"],
  },
  {
    concept: "InferenceEngine formalization",
    decision: "elevate",
    rationale: "Already the canonical inference path. No changes needed.",
    phase: "A",
    affectedLoops: ["Files + AI Assist", "Boardroom + Decision"],
  },
  {
    concept: "Mnemosyne context assembly expansion",
    decision: "integrate_now",
    rationale: "Stub exists. Expanding for file context + profile retrieval is high-leverage for AI quality.",
    phase: "B",
    affectedLoops: ["Files + AI Assist", "Boardroom + Decision"],
  },
  {
    concept: "Math-OS acknowledgment",
    decision: "rename",
    rationale: "sovereign-calculation already IS Math-OS. Just acknowledge the mapping.",
    phase: "A",
    affectedLoops: ["Boardroom + Decision"],
  },
  {
    concept: "Desk tool executor consolidation",
    decision: "consolidate",
    rationale: "Three fragmented execution services should unify under one concept.",
    phase: "B",
    affectedLoops: ["Connected Services + Insight", "Admin Truth + Approval"],
  },
  {
    concept: "Event Bus merger",
    decision: "consolidate",
    rationale: "Dual event-bus + event-broker creates confusion. Merge into one.",
    phase: "B",
    affectedLoops: ["Admin Truth + Approval", "Connected Services + Insight"],
  },
  {
    concept: "Journeys / Autopilot consolidation",
    decision: "consolidate",
    rationale: "Three overlapping systems. Unify autopilot + workflow-engine. Defer autonomy.",
    phase: "C",
    affectedLoops: ["Admin Truth + Approval"],
  },
  {
    concept: "Local / on-device model support",
    decision: "reject",
    rationale: "No runtime need. No flagship loop requires it. Would add infrastructure complexity for zero product value now.",
    phase: "D",
    affectedLoops: [],
  },
  {
    concept: "Vision / OCR task routing",
    decision: "defer",
    rationale: "No flagship loop needs it currently. Valuable for future file processing but premature.",
    phase: "D",
    affectedLoops: ["Files + AI Assist"],
  },
  {
    concept: "Advanced LoRA orchestration",
    decision: "reject",
    rationale: "Speculative complexity. SITA uses external models, not custom fine-tuned models.",
    phase: "D",
    affectedLoops: [],
  },
  {
    concept: "Multi-agent debate as runtime system",
    decision: "defer",
    rationale: "Directory exists (multi-agent-debate/). Leave as-is. Not a runtime need yet.",
    phase: "C",
    affectedLoops: ["Boardroom + Decision"],
  },
  {
    concept: "Full autonomous autopilot",
    decision: "defer",
    rationale: "Approval and proof discipline not ready for autonomous execution. Manual + AI-assisted is correct now.",
    phase: "D",
    affectedLoops: ["Admin Truth + Approval"],
  },
];

// ── Flagship Loop Impact Matrix ──────────────────────────────

export interface FlagshipImpact {
  loop: string;
  loopNumber: number;
  godTierComponents: string[];
  currentState: string;
  integrationBenefit: string;
  priority: "critical" | "high" | "medium" | "low";
}

export const FLAGSHIP_LOOP_IMPACT: FlagshipImpact[] = [
  {
    loop: "Auth + Dashboard + Pulse",
    loopNumber: 1,
    godTierComponents: ["Brain Core (context assembly)", "Event Bus (activity feed)"],
    currentState: "Functional. Brain Core already powers pulse intelligence.",
    integrationBenefit: "Event Bus unification improves activity traceability. Minimal other changes needed.",
    priority: "low",
  },
  {
    loop: "Files + AI Assist",
    loopNumber: 2,
    godTierComponents: [
      "Brain Core (orchestration)",
      "ConscienceGate (output validation)",
      "ModelRouter (model selection)",
      "InferenceEngine (execution)",
      "Mnemosyne (file context assembly)",
      "CritiqueLoop (response quality)",
    ],
    currentState: "AI pipeline exists but Mnemosyne is a stub — file context assembly is weak.",
    integrationBenefit:
      "Expanding Mnemosyne for file context is the single highest-leverage improvement. ConscienceGate ensures AI outputs are grounded. CritiqueLoop catches hallucinations.",
    priority: "critical",
  },
  {
    loop: "Boardroom + Summary + Decision",
    loopNumber: 3,
    godTierComponents: [
      "Brain Core (synthesis orchestration)",
      "ConscienceGate (evidence gating)",
      "Math-OS (deterministic verification)",
      "ModelRouter (reasoning model selection)",
      "CritiqueLoop (claim verification)",
    ],
    currentState: "Boardroom uses sovereign-calculation for deterministic outputs. AI synthesis exists.",
    integrationBenefit:
      "Math-OS acknowledgment formalizes what exists. ConscienceGate ensures boardroom claims are evidence-backed. CritiqueLoop adds post-synthesis verification.",
    priority: "high",
  },
  {
    loop: "Connected Services + Sync + Insight",
    loopNumber: 4,
    godTierComponents: [
      "Desk (unified connector execution)",
      "Event Bus (sync event tracing)",
      "Brain Core (insight generation)",
    ],
    currentState: "Connector runners fragmented across three services. Sync events not fully traced.",
    integrationBenefit:
      "Desk consolidation reduces connector execution fragmentation. Event Bus unification improves sync traceability.",
    priority: "medium",
  },
  {
    loop: "Admin Truth + Recommendation + Approval",
    loopNumber: 5,
    godTierComponents: [
      "Event Bus (receipt/audit trail)",
      "ConscienceGate (recommendation safety)",
      "Desk (execution after approval)",
      "CritiqueLoop (outcome verification)",
    ],
    currentState: "Recommendation/execution loop exists but fragmented. Event tracing is dual-system.",
    integrationBenefit:
      "Event Bus merger improves audit trail. Desk consolidation unifies post-approval execution. CritiqueLoop verifies outcomes.",
    priority: "high",
  },
];

// ── Security / Governance Impact Matrix ──────────────────────

export interface SecurityGovernanceImpact {
  module: string;
  improvesSafety: boolean;
  improvesTraceability: boolean;
  createsNewSurface: boolean;
  leakageRisk: "none" | "low" | "medium" | "high";
  blastRadiusChange: "reduces" | "neutral" | "increases";
  approvalIntegration: string;
  launchHonestyRole: string;
}

export const SECURITY_GOVERNANCE_IMPACT: SecurityGovernanceImpact[] = [
  {
    module: "Brain Core",
    improvesSafety: true,
    improvesTraceability: true,
    createsNewSurface: false,
    leakageRisk: "low",
    blastRadiusChange: "reduces",
    approvalIntegration: "All AI invocations auditable through single entry point",
    launchHonestyRole: "Canonical entry point enables accurate AI capability claims",
  },
  {
    module: "ConscienceGate",
    improvesSafety: true,
    improvesTraceability: true,
    createsNewSurface: false,
    leakageRisk: "none",
    blastRadiusChange: "reduces",
    approvalIntegration: "Pre-response validation prevents unsafe outputs from reaching users",
    launchHonestyRole: "Enforces claim safety at the response boundary",
  },
  {
    module: "ModelRouter",
    improvesSafety: true,
    improvesTraceability: true,
    createsNewSurface: false,
    leakageRisk: "none",
    blastRadiusChange: "neutral",
    approvalIntegration: "Budget enforcement prevents cost abuse",
    launchHonestyRole: "Accurate model availability claims",
  },
  {
    module: "InferenceEngine",
    improvesSafety: true,
    improvesTraceability: true,
    createsNewSurface: false,
    leakageRisk: "low",
    blastRadiusChange: "neutral",
    approvalIntegration: "All inference calls produce receipts",
    launchHonestyRole: "Receipt chain enables audit of all AI outputs",
  },
  {
    module: "Mnemosyne",
    improvesSafety: false,
    improvesTraceability: false,
    createsNewSurface: true,
    leakageRisk: "medium",
    blastRadiusChange: "neutral",
    approvalIntegration: "Context assembly must respect per-user data boundaries",
    launchHonestyRole: "Must not overclaim retrieval quality until verified",
  },
  {
    module: "Math-OS",
    improvesSafety: true,
    improvesTraceability: true,
    createsNewSurface: false,
    leakageRisk: "none",
    blastRadiusChange: "reduces",
    approvalIntegration: "Deterministic outputs need no approval — they are verifiable",
    launchHonestyRole: "Enables safe claims about financial calculations",
  },
  {
    module: "Desk",
    improvesSafety: false,
    improvesTraceability: true,
    createsNewSurface: true,
    leakageRisk: "medium",
    blastRadiusChange: "increases",
    approvalIntegration: "MANDATORY approval gates for high-risk tool actions",
    launchHonestyRole: "Must honestly classify which tools are real vs planned",
  },
  {
    module: "Event Bus",
    improvesSafety: true,
    improvesTraceability: true,
    createsNewSurface: false,
    leakageRisk: "low",
    blastRadiusChange: "reduces",
    approvalIntegration: "Unified audit trail for all system events",
    launchHonestyRole: "Enables evidence-based launch claims",
  },
  {
    module: "CritiqueLoop",
    improvesSafety: true,
    improvesTraceability: true,
    createsNewSurface: false,
    leakageRisk: "none",
    blastRadiusChange: "reduces",
    approvalIntegration: "Post-inference validation catches unsafe outputs before delivery",
    launchHonestyRole: "Enables honest quality claims about AI outputs",
  },
];

// ── Complexity vs Leverage Matrix ────────────────────────────

export interface ComplexityLeverage {
  module: string;
  effortWeeks: number;
  leverageScore: number; // 1-10
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
}

export const COMPLEXITY_LEVERAGE: ComplexityLeverage[] = [
  { module: "Brain Core elevation", effortWeeks: 0.5, leverageScore: 9, riskLevel: "low", recommendation: "Do immediately — documentation and formalization only" },
  { module: "ConscienceGate unification", effortWeeks: 2, leverageScore: 8, riskLevel: "medium", recommendation: "High priority — unify existing safety layers" },
  { module: "ModelRouter formalization", effortWeeks: 0.5, leverageScore: 7, riskLevel: "low", recommendation: "Do immediately — already complete" },
  { module: "InferenceEngine formalization", effortWeeks: 0.5, leverageScore: 7, riskLevel: "low", recommendation: "Do immediately — already complete" },
  { module: "Mnemosyne expansion", effortWeeks: 3, leverageScore: 9, riskLevel: "medium", recommendation: "High priority — biggest AI quality improvement" },
  { module: "Math-OS rename", effortWeeks: 0.25, leverageScore: 5, riskLevel: "low", recommendation: "Trivial — just acknowledge the mapping" },
  { module: "Desk consolidation", effortWeeks: 4, leverageScore: 6, riskLevel: "high", recommendation: "Phase B — complex refactor, defer until proof stable" },
  { module: "Event Bus merger", effortWeeks: 2, leverageScore: 6, riskLevel: "medium", recommendation: "Phase B — merge dual system" },
  { module: "Journeys consolidation", effortWeeks: 4, leverageScore: 5, riskLevel: "high", recommendation: "Phase C — complex, low launch urgency" },
  { module: "CritiqueLoop pattern", effortWeeks: 1, leverageScore: 8, riskLevel: "low", recommendation: "Phase A — lightweight pattern, high safety value" },
];

// ── Anti-Sprawl Risk Matrix ──────────────────────────────────

export interface AntiSprawlAssessment {
  concept: string;
  currentServiceCount: number;
  proposedChange: string;
  sprawlEffect: SprawlRisk;
  netServiceDelta: number;
  rationale: string;
}

export const ANTI_SPRAWL_MATRIX: AntiSprawlAssessment[] = [
  { concept: "Brain Core elevation", currentServiceCount: 10, proposedChange: "Formalize existing, no new files", sprawlEffect: "reduces", netServiceDelta: 0, rationale: "Reduces ambiguity about intelligence entry point" },
  { concept: "ConscienceGate unification", currentServiceCount: 8, proposedChange: "✅ Completed — groundedness-gate deleted, consolidated into conscience-gate/", sprawlEffect: "reduces", netServiceDelta: -1, rationale: "✅ Done: fewer safety layers, single gate" },
  { concept: "ModelRouter formalization", currentServiceCount: 2, proposedChange: "No new files — document as canonical", sprawlEffect: "neutral", netServiceDelta: 0, rationale: "Already clean" },
  { concept: "Mnemosyne expansion", currentServiceCount: 1, proposedChange: "✅ Completed — expanded to 425-line context assembler", sprawlEffect: "neutral", netServiceDelta: 0, rationale: "✅ Done: full context assembly with memory graph" },
  { concept: "Desk consolidation", currentServiceCount: 3, proposedChange: "Merge 3 services → 1 facade", sprawlEffect: "reduces", netServiceDelta: -2, rationale: "Removes execution fragmentation" },
  { concept: "Event Bus merger", currentServiceCount: 1, proposedChange: "✅ Completed — event-broker deleted, merged into unified-event-service", sprawlEffect: "reduces", netServiceDelta: -1, rationale: "✅ Done: single event system" },
  { concept: "Journeys consolidation", currentServiceCount: 3, proposedChange: "Merge autopilot + workflow-engine", sprawlEffect: "reduces", netServiceDelta: -1, rationale: "Reduces journey system overlap" },
  { concept: "CritiqueLoop pattern", currentServiceCount: 0, proposedChange: "Add as a pattern in ConscienceGate, not a new service", sprawlEffect: "neutral", netServiceDelta: 0, rationale: "Pattern, not module — no new service directory" },
  { concept: "Local model support", currentServiceCount: 0, proposedChange: "REJECTED — would add new infra", sprawlEffect: "dangerous", netServiceDelta: 5, rationale: "Would add WebLLM, model cache, device capability detection — massive sprawl for zero product value" },
  { concept: "Vision/OCR routing", currentServiceCount: 0, proposedChange: "DEFERRED — no flagship need", sprawlEffect: "increases", netServiceDelta: 2, rationale: "Premature until file processing loop needs it" },
];

// ── Task Type Mapping ────────────────────────────────────────

export interface TaskTypeAnalysis {
  taskType: string;
  maturity: TaskMaturity;
  neededBy: string[];
  currentSystem: string | null;
  riskIntroduced: string;
  productValue: string;
}

export const TASK_TYPE_MAPPING: TaskTypeAnalysis[] = [
  {
    taskType: "Math / Proof",
    maturity: "immediate",
    neededBy: ["Boardroom", "Finance", "Tax", "Investment"],
    currentSystem: "sovereign-calculation/ (fully implemented)",
    riskIntroduced: "None — deterministic, auditable",
    productValue: "Critical — trustworthy financial outputs",
  },
  {
    taskType: "Tool Execution / Planning",
    maturity: "near_term",
    neededBy: ["Connected Services", "Recommendations", "Approvals"],
    currentSystem: "executor-service/ + connector-runners/ (fragmented)",
    riskIntroduced: "Medium — autonomous tool use needs approval gates",
    productValue: "High — enables action after AI recommendation",
  },
  {
    taskType: "Vision / OCR",
    maturity: "later",
    neededBy: ["Files (future)", "Document Processing (future)"],
    currentSystem: null,
    riskIntroduced: "Low — read-only analysis",
    productValue: "Medium — document understanding, receipt scanning",
  },
  {
    taskType: "Draft / Rewrite / Email",
    maturity: "immediate",
    neededBy: ["Files + AI Assist", "Communications", "Email App"],
    currentSystem: "brain-core/ + inference-gateway/ (working)",
    riskIntroduced: "Low — text generation with ConscienceGate validation",
    productValue: "High — core AI assistant value",
  },
  {
    taskType: "Deep Reasoning",
    maturity: "immediate",
    neededBy: ["Boardroom", "Investment", "Scenario Analysis"],
    currentSystem: "brain-core/ + model-router/ (routing to capable models)",
    riskIntroduced: "Medium — high cost, needs budget enforcement",
    productValue: "Critical — boardroom synthesis quality",
  },
  {
    taskType: "Embeddings / Retrieval",
    maturity: "near_term",
    neededBy: ["Files + AI Assist", "Knowledge Base", "Memory"],
    currentSystem: "mnemosyne/context-assembler.ts (425 lines, fully implemented)",
    riskIntroduced: "Low — read-only retrieval",
    productValue: "High — contextual AI quality improvement",
  },
  {
    taskType: "On-device Models",
    maturity: "avoid",
    neededBy: [],
    currentSystem: null,
    riskIntroduced: "High — device capability matrix, WebLLM integration, performance variance",
    productValue: "None currently — no flagship loop needs offline AI",
  },
];

// ── Phased Implementation Plan ───────────────────────────────

export interface ImplementationPhase {
  phase: "A" | "B" | "C" | "D";
  name: string;
  timeframe: string;
  goals: string[];
  modulesToIntegrate: string[];
  whatToDefer: string[];
  risks: string[];
  expectedValue: string;
  affectedLoops: string[];
}

export const IMPLEMENTATION_PHASES: ImplementationPhase[] = [
  {
    phase: "A",
    name: "Immediate High-Leverage",
    timeframe: "Next 2 weeks",
    goals: [
      "Formalize Brain Core as canonical entry point",
      "Formalize ModelRouter + InferenceEngine",
      "Acknowledge Math-OS = sovereign-calculation",
      "Add CritiqueLoop pattern to ConscienceGate",
    ],
    modulesToIntegrate: ["Brain Core", "ModelRouter", "InferenceEngine", "Math-OS", "CritiqueLoop"],
    whatToDefer: ["Mnemosyne expansion", "Desk consolidation", "Event Bus merger"],
    risks: ["Minimal — mostly documentation and formalization"],
    expectedValue: "Clear canonical architecture. Reduced ambiguity about AI pipeline ownership.",
    affectedLoops: ["All 5 flagship loops"],
  },
  {
    phase: "B",
    name: "Near-Term Architecture Strengthening",
    timeframe: "Weeks 3-6",
    goals: [
      "✅ Expand Mnemosyne for real context assembly — DONE (425 lines)",
      "✅ Merge event-bus + event-broker — DONE (event-broker deleted)",
      "Begin Desk facade over executor/recommendation/connector services",
      "✅ Unify ConscienceGate from groundedness-gate + no-hallucination — DONE (groundedness-gate deleted)",
    ],
    modulesToIntegrate: ["Mnemosyne", "Event Bus", "ConscienceGate", "Desk (facade)"],
    whatToDefer: ["Journeys consolidation", "Autonomous execution"],
    risks: ["Mnemosyne expansion could introduce data leakage if context boundaries are not strict", "Desk consolidation is complex refactor"],
    expectedValue: "AI quality leap through Mnemosyne. Cleaner event tracing. Unified safety gate.",
    affectedLoops: ["Files + AI Assist", "Connected Services", "Admin Truth"],
  },
  {
    phase: "C",
    name: "Advanced Intelligence Architecture",
    timeframe: "Weeks 7-12",
    goals: [
      "Consolidate Journeys (autopilot + workflow-engine)",
      "Complete Desk with full connector action unification",
      "Add embeddings/retrieval to Mnemosyne",
      "Consider multi-agent patterns for boardroom synthesis",
    ],
    modulesToIntegrate: ["Journeys", "Desk (complete)", "Mnemosyne (advanced)"],
    whatToDefer: ["Vision/OCR", "Local models", "LoRA"],
    risks: ["Journeys consolidation is complex", "Embeddings need vector storage strategy"],
    expectedValue: "Unified workflow execution. Richer AI context. Stronger boardroom synthesis.",
    affectedLoops: ["Boardroom + Decision", "Admin Truth + Approval"],
  },
  {
    phase: "D",
    name: "Long-Term God-Tier Evolution",
    timeframe: "Quarter 2+",
    goals: [
      "Vision/OCR for document processing",
      "Advanced Mnemosyne with reranking and long-term memory",
      "Evaluate local model support based on product need",
      "Multi-agent debate for complex decisions",
    ],
    modulesToIntegrate: ["Vision/OCR", "Advanced Mnemosyne", "Multi-agent (if needed)"],
    whatToDefer: ["Local models (unless product signal)", "LoRA (unless fine-tuning strategy)"],
    risks: ["Premature complexity if product-market fit not validated"],
    expectedValue: "True God-Tier intelligence architecture — if product need justifies it.",
    affectedLoops: ["Files + AI Assist", "Boardroom + Decision"],
  },
];

// ── Contract Map Analysis ────────────────────────────────────

export interface ContractAnalysis {
  contract: string;
  exists: boolean;
  currentLocation: string | null;
  neededFor: string[];
  sprawlRisk: "safe" | "caution" | "dangerous";
  recommendation: string;
}

export const CONTRACT_MAP: ContractAnalysis[] = [
  { contract: "Task Request Envelope", exists: true, currentLocation: "ai_task_requests table + brain-core types", neededFor: ["Brain Core", "InferenceEngine"], sprawlRisk: "safe", recommendation: "Already canonical. Keep as-is." },
  { contract: "Invocation Contract", exists: true, currentLocation: "inference-gateway-types.ts", neededFor: ["InferenceEngine", "ModelRouter"], sprawlRisk: "safe", recommendation: "Already well-typed. Formalize as God-Tier contract." },
  { contract: "Evidence Bundle", exists: true, currentLocation: "customer-journey proof types", neededFor: ["CritiqueLoop", "Boardroom", "Launch Honesty"], sprawlRisk: "safe", recommendation: "Extend for CritiqueLoop results." },
  { contract: "Critique Result", exists: false, currentLocation: null, neededFor: ["CritiqueLoop", "ConscienceGate"], sprawlRisk: "caution", recommendation: "NEW — add as a thin type in ConscienceGate. Do not over-engineer." },
  { contract: "Tool Execution Plan", exists: true, currentLocation: "executor-service types", neededFor: ["Desk"], sprawlRisk: "safe", recommendation: "Consolidate under Desk facade." },
  { contract: "Connector Action Receipt", exists: true, currentLocation: "agent_action_receipts table", neededFor: ["Desk", "Event Bus"], sprawlRisk: "safe", recommendation: "Already canonical. Wire to unified Event Bus." },
  { contract: "Route-to-Service Trace", exists: true, currentLocation: "SERV03 route-service-trace types", neededFor: ["Event Bus", "Observability"], sprawlRisk: "safe", recommendation: "Already implemented in SERV03." },
  { contract: "Launch Honesty Contract", exists: true, currentLocation: "ai_launch_honesty table + launch truth types", neededFor: ["ConscienceGate", "Admin Truth"], sprawlRisk: "safe", recommendation: "Already strong. ConscienceGate should reference it." },
  { contract: "Reasoning Trace Contract", exists: false, currentLocation: null, neededFor: ["CritiqueLoop", "Boardroom audit"], sprawlRisk: "caution", recommendation: "DEFER — only add when reasoning model traces are productionized." },
  { contract: "Budget Policy Contract", exists: true, currentLocation: "ai_budget_policies table + budget types", neededFor: ["ModelRouter", "Brain Core"], sprawlRisk: "safe", recommendation: "Already canonical. No changes needed." },
];

// ── What Already Exists and Should Be Elevated ───────────────

export interface ElevationCandidate {
  system: string;
  godTierRole: string;
  currentState: string;
  action: "formalize" | "consolidate" | "expand" | "acknowledge" | "leave_alone";
  details: string;
}

export const ELEVATION_CANDIDATES: ElevationCandidate[] = [
  { system: "brain-core/", godTierRole: "Brain Core", currentState: "10 files, full pipeline", action: "formalize", details: "Elevate orchestrate-intent.ts as the single canonical entry. Add architecture documentation." },
  { system: "model-router/", godTierRole: "ModelRouter", currentState: "Complete, 210 lines", action: "formalize", details: "Already the canonical model selection layer. Document as God-Tier ModelRouter." },
  { system: "inference-gateway/", godTierRole: "InferenceEngine", currentState: "Complete, 193 lines", action: "formalize", details: "Already the canonical inference path. No changes needed." },
  { system: "conscience-gate/", godTierRole: "ConscienceGate", currentState: "✅ 250-line canonical gate in core-services/", action: "formalize", details: "✅ Consolidated from groundedness-gate + no-hallucination. Pre-flight wired into callBrainCore." },
  { system: "no-hallucination/", godTierRole: "ConscienceGate (types)", currentState: "8 type/utility files", action: "leave_alone", details: "Types referenced by ConscienceGate. Keep as-is." },
  { system: "sovereign-calculation/", godTierRole: "Math-OS", currentState: "6 engines, full deterministic suite", action: "acknowledge", details: "Already IS Math-OS. Just acknowledge the mapping." },
  { system: "event-bus/", godTierRole: "Event Bus", currentState: "✅ UnifiedEventService with Realtime bridge", action: "formalize", details: "✅ event-broker merged. Single canonical event system with server-side bridge." },
  { system: "mnemosyne/", godTierRole: "Mnemosyne", currentState: "✅ 425-line context assembler", action: "formalize", details: "✅ Expanded with memory graph, profile enrichment, conversation persistence." },
  { system: "customer-journey/", godTierRole: "Journeys (proof layer)", currentState: "Verification + proof system", action: "leave_alone", details: "Keep as proof/verification. Do NOT merge into autopilot." },
  { system: "ai_inference_receipts table", godTierRole: "InferenceEngine audit trail", currentState: "Full receipt chain in DB", action: "formalize", details: "Already excellent. Reference as God-Tier audit trail." },
  { system: "ai_budget_policies table", godTierRole: "ModelRouter cost governance", currentState: "Full budget policy system", action: "leave_alone", details: "Already canonical. No changes." },
];

// ── Missing to Safe Integration ──────────────────────────────

export interface MissingToSafe {
  gap: string;
  severity: "critical" | "high" | "medium" | "low";
  blocksPhase: "A" | "B" | "C" | "D";
  resolution: string;
}

export const MISSING_TO_SAFE_INTEGRATION: MissingToSafe[] = [
  { gap: "CritiqueLoop type definition", severity: "medium", blocksPhase: "A", resolution: "Add CritiqueResult type to ConscienceGate types" },
  { gap: "Mnemosyne context boundary rules", severity: "critical", blocksPhase: "B", resolution: "Define strict per-user/per-workspace data isolation before expanding Mnemosyne" },
  { gap: "Desk approval gate contract", severity: "high", blocksPhase: "B", resolution: "Define which Desk actions require approval before consolidation" },
  { gap: "Event Bus migration path", severity: "medium", blocksPhase: "B", resolution: "Plan event-broker → event-bus migration without breaking existing subscribers" },
  { gap: "Architecture documentation", severity: "high", blocksPhase: "A", resolution: "Create God-Tier architecture README mapping proposed → existing" },
  { gap: "Journeys consolidation plan", severity: "low", blocksPhase: "C", resolution: "Map overlaps between autopilot, workflow-engine, and customer-journey before merging" },
];

// ── Compute Functions ────────────────────────────────────────

export function getModulesByAction(action: IntegrationAction): ModuleMapping[] {
  return MODULE_MAPPING_MATRIX.filter((m) => m.action === action);
}

export function getDecisionsByPhase(phase: "A" | "B" | "C" | "D"): IntegrationDecision[] {
  return INTEGRATION_DECISIONS.filter((d) => d.phase === phase);
}

export function getHighLeverageModules(): ComplexityLeverage[] {
  return COMPLEXITY_LEVERAGE.filter((c) => c.leverageScore >= 7).sort((a, b) => b.leverageScore - a.leverageScore);
}

export function getSprawlReducers(): AntiSprawlAssessment[] {
  return ANTI_SPRAWL_MATRIX.filter((a) => a.sprawlEffect === "reduces");
}

export function getSprawlDangers(): AntiSprawlAssessment[] {
  return ANTI_SPRAWL_MATRIX.filter((a) => a.sprawlEffect === "dangerous" || a.sprawlEffect === "increases");
}

export function computeIntegrationScore(): {
  totalModules: number;
  readyNow: number;
  needsWork: number;
  deferred: number;
  rejected: number;
  netSprawlDelta: number;
  overallReadiness: number;
} {
  const decisions = INTEGRATION_DECISIONS;
  const readyNow = decisions.filter((d) => d.phase === "A").length;
  const needsWork = decisions.filter((d) => d.phase === "B").length;
  const deferred = decisions.filter((d) => d.phase === "C" || d.phase === "D").length;
  const rejected = decisions.filter((d) => d.decision === "reject").length;
  const netSprawlDelta = ANTI_SPRAWL_MATRIX.reduce((sum, a) => sum + a.netServiceDelta, 0);
  const overallReadiness = Math.round((readyNow / decisions.length) * 100);

  return { totalModules: decisions.length, readyNow, needsWork, deferred, rejected, netSprawlDelta, overallReadiness };
}

