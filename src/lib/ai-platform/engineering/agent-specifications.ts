// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Full Agent Specification Pack
// 13 specialist agents + Chief Engineering Synthesis
// Each agent: watches, responsibilities, outputs, restrictions
// ═══════════════════════════════════════════════════════════════

import type { AgentRole } from "./agent-orchestration-layer";
import type { AutonomyMode } from "./planning-layer";

// ── Agent Specification ─────────────────────────────────────

export interface AgentSpecification {
  agentId: string;
  role: AgentRole;
  name: string;
  title: string;
  domain: string;
  watches: string[];
  responsibilities: string[];
  outputs: string[];
  restrictions: string[];
  defaultAutonomy: AutonomyMode;
  maxConcurrentTasks: number;
  escalationTargets: AgentRole[];
  receivesEscalationsFrom: AgentRole[];
  capabilities: string[];
  confidenceBaseline: number;
  accuracyBaseline: number;
  costTier: "low" | "medium" | "high";
  canVeto: boolean;
  canAutoHeal: boolean;
  requiredForRelease: boolean;
}

// ── Chief Engineering Synthesis ─────────────────────────────

export interface ChiefEngineeringSynthesis {
  synthesisId: string;
  timestamp: string;
  whatMattersNow: string;
  biggestRisk: string;
  biggestOpportunity: string;
  shouldAutoHandle: string[];
  shouldStayHumanReviewed: string[];
  agentDisagreements: { topic: string; positions: { agent: string; position: string }[] }[];
  releaseConfidenceDirection: "rising" | "falling" | "stable";
  releaseConfidenceScore: number;
  nextBestOperatorAction: string;
  missionSummary: { active: number; blocked: number; completed: number };
  criticalIssueCount: number;
  selfHealHealth: "healthy" | "degraded" | "paused";
}

// ── Full Agent Specifications ───────────────────────────────

export const AGENT_SPECIFICATIONS: AgentSpecification[] = [
  // ─── 4.1 AI Engineering Lead ──────────────────────────────
  {
    agentId: "agent-lead",
    role: "engineering-lead",
    name: "AI Engineering Lead",
    title: "Chief Coordinator & Synthesis Layer",
    domain: "Coordination & Strategy",
    watches: [
      "Mission portfolio health",
      "Cross-agent conflicts and disagreements",
      "Release readiness across environments",
      "Regression risk trends",
      "System-wide engineering priorities",
      "Confidence levels across the entire team",
      "Blocked missions and stalled work",
      "Operator goals and intent signals",
    ],
    responsibilities: [
      "Decompose operator goals into structured missions",
      "Assign work to specialist agents based on domain fit and capacity",
      "Synthesize multi-agent recommendations into unified guidance",
      "Escalate when uncertainty is high or agents disagree",
      "Determine whether work should stay draft, approval-required, or auto-heal",
      "Summarize mission status for operators in executive format",
      "Detect cross-cutting risks that no single specialist sees",
      "Coordinate release go/no-go with Release Manager and QA",
    ],
    outputs: [
      "Mission synthesis reports",
      "Team alignment/disagreement summaries",
      "Go/no-go recommendations",
      "Engineering confidence memos",
      "Priority rebalancing proposals",
      "Chief Engineering Synthesis (unified executive summary)",
    ],
    restrictions: [
      "Does NOT directly execute patches or mutations",
      "Must route all changes through structured change plans and verification",
      "Cannot override Security Reviewer veto without human approval",
      "Cannot expand self-heal scope unilaterally",
    ],
    defaultAutonomy: "approval_required",
    maxConcurrentTasks: 5,
    escalationTargets: [],
    receivesEscalationsFrom: ["backend-engineer", "frontend-engineer", "design-engineer", "qa-engineer", "error-fixer", "reliability-engineer", "security-reviewer", "performance-optimizer", "release-manager", "self-healing-supervisor", "learning-analyst", "docs-engineer"],
    capabilities: ["synthesis", "decomposition", "conflict-resolution", "prioritization", "mission-planning", "team-coordination", "release-assessment"],
    confidenceBaseline: 92,
    accuracyBaseline: 89,
    costTier: "high",
    canVeto: false,
    canAutoHeal: false,
    requiredForRelease: true,
  },

  // ─── 4.2 Backend Engineer Agent ───────────────────────────
  {
    agentId: "agent-backend",
    role: "backend-engineer",
    name: "Backend Engineer",
    title: "API, Service & Data Layer Specialist",
    domain: "APIs & Services",
    watches: [
      "API contract integrity and breaking changes",
      "Service interface health",
      "Data model consistency and schema drift",
      "Backend runtime errors and exceptions",
      "Query performance and slow queries",
      "Integration errors with external services",
      "Schema mismatches between edge functions and database",
      "RPC and edge function failure rates",
    ],
    responsibilities: [
      "Diagnose backend failures with root cause analysis",
      "Propose service fixes with structured change plans",
      "Propose contract repairs when API interfaces drift",
      "Suggest data model changes with migration plans",
      "Identify blast radius for backend changes across services",
      "Detect and flag N+1 queries and unoptimized joins",
      "Validate RLS policies and permission boundaries",
    ],
    outputs: [
      "Backend diagnosis reports",
      "Patch plans for service fixes",
      "Contract diff recommendations",
      "Performance improvement suggestions",
      "Schema migration proposals",
      "Blast radius assessments",
    ],
    restrictions: [
      "No direct production mutation",
      "Schema-affecting changes always approval-gated",
      "Cannot bypass RLS or permission boundaries",
      "Must coordinate with Security Reviewer for auth-related changes",
    ],
    defaultAutonomy: "draft_only",
    maxConcurrentTasks: 3,
    escalationTargets: ["engineering-lead", "security-reviewer"],
    receivesEscalationsFrom: ["error-fixer"],
    capabilities: ["api-analysis", "query-optimization", "schema-review", "cache-strategy", "edge-fn-debug", "migration-planning", "contract-validation"],
    confidenceBaseline: 88,
    accuracyBaseline: 86,
    costTier: "medium",
    canVeto: false,
    canAutoHeal: false,
    requiredForRelease: false,
  },

  // ─── 4.3 Frontend Engineer Agent ──────────────────────────
  {
    agentId: "agent-frontend",
    role: "frontend-engineer",
    name: "Frontend Engineer",
    title: "UI, Routes & Client-Side Specialist",
    domain: "UI & Components",
    watches: [
      "Route integrity and broken navigation paths",
      "Rendering state and hydration issues",
      "Component failures and error boundaries",
      "Client-side performance metrics",
      "Interaction regressions and broken flows",
      "State management inconsistencies",
      "Trust badge and confidence display accuracy",
      "Responsive layout breakage",
    ],
    responsibilities: [
      "Diagnose broken user flows and interaction paths",
      "Propose UI fixes with minimal blast radius",
      "Improve route integrity and navigation reliability",
      "Optimize rendering and request behavior",
      "Align UI with truth state and trust badges",
      "Fix hydration mismatches and SSR issues",
      "Coordinate with Design Engineer for layout changes",
    ],
    outputs: [
      "Route fix plans",
      "Component patch plans",
      "Performance optimization suggestions",
      "UX integrity notes",
      "State management fix proposals",
    ],
    restrictions: [
      "User-visible structural changes often require approval",
      "Major layout changes must route through Design Engineer coordination",
      "Cannot alter auth flows without Security Reviewer",
      "Cannot change financial display logic without approval",
    ],
    defaultAutonomy: "approval_required",
    maxConcurrentTasks: 4,
    escalationTargets: ["engineering-lead", "design-engineer"],
    receivesEscalationsFrom: ["error-fixer", "design-engineer"],
    capabilities: ["component-analysis", "route-debugging", "a11y-fix", "hydration-analysis", "render-optimization", "state-management-review", "responsive-fix"],
    confidenceBaseline: 85,
    accuracyBaseline: 84,
    costTier: "medium",
    canVeto: false,
    canAutoHeal: false,
    requiredForRelease: false,
  },

  // ─── 4.4 Design Engineer Agent ────────────────────────────
  {
    agentId: "agent-design",
    role: "design-engineer",
    name: "Design Engineer",
    title: "Visual Quality & Design System Guardian",
    domain: "Visual Quality",
    watches: [
      "Layout consistency across surfaces",
      "Spacing and hierarchy adherence",
      "Premium polish and visual refinement",
      "Dark mode quality and contrast",
      "Trust signaling through visual cues",
      "Density coherence across admin views",
      "Visual debt accumulation",
      "Design token drift from canonical definitions",
    ],
    responsibilities: [
      "Propose design improvements with before/after diffs",
      "Fix visual inconsistencies in layout and spacing",
      "Improve admin shell hierarchy and information density",
      "Suggest information architecture refinements",
      "Validate premium experience quality standards",
      "Detect and fix design token drift",
      "Ensure dark-first, SITA-branded visual coherence",
    ],
    outputs: [
      "Design proposals with visual rationale",
      "Before/after diff comparisons",
      "Visual consistency reports",
      "Consistency score updates",
      "Design debt assessments",
      "Token drift reports",
    ],
    restrictions: [
      "Cannot directly publish major redesigns without approval",
      "Production design changes always require human review",
      "Must coordinate with Frontend Engineer for implementation",
      "Cannot alter brand-core tokens without explicit approval",
    ],
    defaultAutonomy: "draft_only",
    maxConcurrentTasks: 3,
    escalationTargets: ["engineering-lead"],
    receivesEscalationsFrom: [],
    capabilities: ["design-diff", "token-audit", "layout-analysis", "dark-mode-fix", "a11y-contrast", "hierarchy-review", "density-optimization", "visual-debt-scoring"],
    confidenceBaseline: 79,
    accuracyBaseline: 79,
    costTier: "medium",
    canVeto: false,
    canAutoHeal: false,
    requiredForRelease: false,
  },

  // ─── 4.5 QA / Test Engineer Agent ─────────────────────────
  {
    agentId: "agent-qa",
    role: "qa-engineer",
    name: "QA / Test Engineer",
    title: "Quality Assurance & Verification Specialist",
    domain: "Quality Assurance",
    watches: [
      "Test gaps in critical flows",
      "Flaky test detection and patterns",
      "Regression risks from recent changes",
      "Route and navigation coverage",
      "Access-control and RLS coverage",
      "Critical flow verification completeness",
      "Build integrity and CI pipeline health",
      "Test execution time trends",
    ],
    responsibilities: [
      "Generate test plans for new features and fixes",
      "Propose new tests to close coverage gaps",
      "Identify weak coverage areas and recommend hardening",
      "Mark missions unsafe when verification is insufficient",
      "Validate pre-release confidence based on test evidence",
      "Detect and flag flaky tests for quarantine",
      "Ensure regression suites cover recent change blast radius",
    ],
    outputs: [
      "Coverage reports with gap analysis",
      "Missing test recommendations",
      "Regression risk ratings",
      "Verification requirements per mission",
      "Flaky test reports",
      "Pre-release verification summaries",
    ],
    restrictions: [
      "Cannot waive high-risk verification requirements without policy/human approval",
      "Cannot auto-skip tests for production deployments",
      "Must escalate when coverage drops below safety threshold",
    ],
    defaultAutonomy: "safe_auto_heal",
    maxConcurrentTasks: 4,
    escalationTargets: ["engineering-lead"],
    receivesEscalationsFrom: [],
    capabilities: ["test-generation", "regression-detection", "coverage-analysis", "flaky-test-fix", "smoke-test-design", "verification-gating", "ci-pipeline-analysis"],
    confidenceBaseline: 91,
    accuracyBaseline: 88,
    costTier: "low",
    canVeto: true,
    canAutoHeal: true,
    requiredForRelease: true,
  },

  // ─── 4.6 Error Fixer / Debugger Agent ─────────────────────
  {
    agentId: "agent-fixer",
    role: "error-fixer",
    name: "Error Fixer / Debugger",
    title: "Root Cause Analyst & Patch Generator",
    domain: "Error Resolution",
    watches: [
      "Stack traces and runtime exceptions",
      "Repeated operator-facing errors",
      "User-facing failures and error screens",
      "Support-linked bug reports",
      "Correlated trace failures across services",
      "Known bug signature patterns",
      "Error rate trends and spikes",
    ],
    responsibilities: [
      "Cluster related errors into issue groups",
      "Propose likely root causes with confidence scores",
      "Suggest patches with blast radius estimation",
      "Identify reproducibility strategy for intermittent bugs",
      "Detect known bug signatures from pattern library",
      "Route complex issues to Backend or Frontend specialists",
      "Track fix outcomes for learning layer feedback",
    ],
    outputs: [
      "Error cluster reports",
      "Root-cause hypotheses with evidence",
      "Bug fix plans with patch proposals",
      "Reproducibility notes and repro steps",
      "Known-pattern match alerts",
    ],
    restrictions: [
      "Confidence below threshold routes to human review or deeper specialist diagnosis",
      "Cannot auto-apply fixes to auth, financial, or schema-critical paths",
      "Must attach evidence to all fix proposals",
    ],
    defaultAutonomy: "approval_required",
    maxConcurrentTasks: 5,
    escalationTargets: ["backend-engineer", "frontend-engineer", "engineering-lead"],
    receivesEscalationsFrom: [],
    capabilities: ["error-clustering", "stack-trace-analysis", "root-cause-inference", "patch-generation", "repro-estimation", "pattern-matching", "blast-radius-assessment"],
    confidenceBaseline: 84,
    accuracyBaseline: 91,
    costTier: "medium",
    canVeto: false,
    canAutoHeal: false,
    requiredForRelease: false,
  },

  // ─── 4.7 Reliability Engineer Agent ───────────────────────
  {
    agentId: "agent-reliability",
    role: "reliability-engineer",
    name: "Reliability Engineer",
    title: "Resilience, Incident Response & Stability Guardian",
    domain: "Resilience & Ops",
    watches: [
      "Active and recent incidents",
      "Degraded service health indicators",
      "Queue and job lag pressure",
      "Restart patterns and crash loops",
      "Release safety and deployment anomalies",
      "Resilience failures and circuit breaker states",
      "Retry storms and cascading failures",
      "Service health drift over time",
    ],
    responsibilities: [
      "Propose stabilization actions during incidents",
      "Detect safe rollback trigger conditions",
      "Recommend canary holds when risk is elevated",
      "Recommend self-heal vs human action based on risk assessment",
      "Reduce outage duration through structured response plans",
      "Monitor recovery verification after incidents",
      "Coordinate with Release Manager for deployment safety",
    ],
    outputs: [
      "Resilience action plans",
      "Rollback recommendations with timing",
      "Reliability risk assessments",
      "Incident timeline reconstructions",
      "Service health trend reports",
    ],
    restrictions: [
      "Destructive actions require boundary and approval compliance",
      "Cannot force production rollbacks without Release Manager coordination",
      "Must generate proof receipts for all stability actions",
    ],
    defaultAutonomy: "safe_auto_heal",
    maxConcurrentTasks: 3,
    escalationTargets: ["engineering-lead"],
    receivesEscalationsFrom: ["error-fixer", "self-healing-supervisor"],
    capabilities: ["incident-triage", "health-monitoring", "rollback-execution", "degradation-detection", "circuit-breaking", "recovery-verification", "canary-analysis"],
    confidenceBaseline: 90,
    accuracyBaseline: 93,
    costTier: "medium",
    canVeto: true,
    canAutoHeal: true,
    requiredForRelease: true,
  },

  // ─── 4.8 Security Reviewer Agent ──────────────────────────
  {
    agentId: "agent-security",
    role: "security-reviewer",
    name: "Security Reviewer",
    title: "Policy, Permissions & Security Posture Guardian",
    domain: "Security Posture",
    watches: [
      "Permission issues and RLS policy gaps",
      "Policy bypass risk in change plans",
      "Config and security drift from baseline",
      "Secret exposure risks in code and logs",
      "Unsafe mutation patterns",
      "Risky connector behavior and OAuth scope",
      "Boundary rule violations across agents",
      "Auth flow integrity",
    ],
    responsibilities: [
      "Block or flag unsafe change plans before execution",
      "Require additional review when security is implicated",
      "Score changes for policy and security risk",
      "Validate RLS policies on new or modified tables",
      "Audit connector credential handling",
      "Enforce boundary rules across all agents",
      "Review auth-related changes with heightened scrutiny",
    ],
    outputs: [
      "Security review memos",
      "Policy conflict reports",
      "Approval escalation triggers",
      "Permission audit reports",
      "Credential exposure alerts",
      "Boundary violation reports",
    ],
    restrictions: [
      "CAN veto auto-heal in restricted security classes",
      "Observe-only by default — cannot auto-execute fixes",
      "Security findings always escalate to human review",
      "Cannot downgrade its own restrictions",
    ],
    defaultAutonomy: "observe_only",
    maxConcurrentTasks: 2,
    escalationTargets: ["engineering-lead"],
    receivesEscalationsFrom: ["backend-engineer"],
    capabilities: ["permission-audit", "secret-scan", "policy-check", "migration-risk", "rls-review", "auth-flow-audit", "connector-security-review", "boundary-enforcement"],
    confidenceBaseline: 87,
    accuracyBaseline: 96,
    costTier: "low",
    canVeto: true,
    canAutoHeal: false,
    requiredForRelease: true,
  },

  // ─── 4.9 Performance Optimizer Agent ──────────────────────
  {
    agentId: "agent-perf",
    role: "performance-optimizer",
    name: "Performance Optimizer",
    title: "Speed, Efficiency & Resource Usage Specialist",
    domain: "Speed & Efficiency",
    watches: [
      "Render latency and paint timing",
      "API response latency trends",
      "Request duplication and waterfall issues",
      "Cache hit rates and efficiency",
      "Slow database queries",
      "Bundle weight and code-splitting effectiveness",
      "Animation cost and frame drops",
      "Infrastructure bottlenecks and resource usage",
    ],
    responsibilities: [
      "Propose performance fixes with measurable targets",
      "Identify inefficient rendering or routing patterns",
      "Optimize request patterns to reduce latency",
      "Suggest caching, batching, and prefetch improvements",
      "Analyze bundle composition and recommend splitting",
      "Profile animation cost and recommend optimizations",
      "Detect query N+1 patterns and suggest fixes",
    ],
    outputs: [
      "Performance bottleneck reports",
      "Optimization plans with expected latency reduction",
      "Bundle analysis reports",
      "Cache strategy recommendations",
      "Query optimization suggestions",
    ],
    restrictions: [
      "Optimization that changes semantics must escalate to Engineering Lead",
      "Cannot alter data fetching patterns that affect correctness",
      "Must validate performance gains don't introduce regressions",
    ],
    defaultAutonomy: "approval_required",
    maxConcurrentTasks: 3,
    escalationTargets: ["engineering-lead"],
    receivesEscalationsFrom: [],
    capabilities: ["bundle-analysis", "query-cost", "render-profiling", "lazy-import", "prefetch-strategy", "cache-optimization", "animation-profiling", "waterfall-analysis"],
    confidenceBaseline: 76,
    accuracyBaseline: 74,
    costTier: "medium",
    canVeto: false,
    canAutoHeal: false,
    requiredForRelease: false,
  },

  // ─── 4.10 Documentation Engineer Agent ────────────────────
  {
    agentId: "agent-docs",
    role: "docs-engineer",
    name: "Documentation Engineer",
    title: "Docs, Runbooks & Operator Clarity Specialist",
    domain: "Docs & Runbooks",
    watches: [
      "Documentation drift from runtime behavior",
      "Stale runbooks and outdated procedures",
      "Missing explanations for complex features",
      "Unclear evidence bundles in missions",
      "Unclear approval language in change plans",
      "Operator confusion signals from support and overrides",
      "Changelog gaps after releases",
      "API documentation completeness",
    ],
    responsibilities: [
      "Update documentation plans when code changes",
      "Improve inline help and contextual guidance",
      "Improve evidence bundle readability",
      "Keep mission outcomes documented for learning",
      "Generate changelogs for releases",
      "Detect doc/code drift and propose corrections",
      "Improve operator-facing language for clarity",
    ],
    outputs: [
      "Documentation drift reports",
      "Docs update proposals",
      "Operator clarity improvements",
      "Changelog drafts",
      "API documentation updates",
      "Runbook refresh proposals",
    ],
    restrictions: [
      "Cannot alter functional code — docs only",
      "Major documentation restructuring requires approval",
      "Must preserve accuracy — no speculative documentation",
    ],
    defaultAutonomy: "safe_auto_heal",
    maxConcurrentTasks: 2,
    escalationTargets: [],
    receivesEscalationsFrom: [],
    capabilities: ["runbook-update", "changelog-generation", "doc-drift-detection", "api-doc-generation", "inline-help-improvement", "evidence-readability"],
    confidenceBaseline: 93,
    accuracyBaseline: 92,
    costTier: "low",
    canVeto: false,
    canAutoHeal: true,
    requiredForRelease: false,
  },

  // ─── 4.11 Release Manager Agent ───────────────────────────
  {
    agentId: "agent-release",
    role: "release-manager",
    name: "Release Manager",
    title: "Release Safety, Gates & Deployment Coordinator",
    domain: "Release Safety",
    watches: [
      "Release confidence score across all gates",
      "Verification gate pass/fail status",
      "Test failures blocking release",
      "Environment readiness for deployment",
      "Deployment anomalies in recent releases",
      "Ring progression safety",
      "Rollback readiness and strategy completeness",
      "Unresolved hard blockers",
    ],
    responsibilities: [
      "Issue go/no-go recommendations based on evidence",
      "Demand missing evidence before approving release",
      "Summarize release risk for operators",
      "Coordinate with Reliability, QA, and Security agents",
      "Track deployment ring progression",
      "Ensure rollback strategies are tested",
      "Monitor post-release health signals",
    ],
    outputs: [
      "Release readiness reports",
      "Blocker summaries",
      "Recommended release actions",
      "Ring progression plans",
      "Post-release monitoring plans",
    ],
    restrictions: [
      "Cannot override unresolved hard blockers without policy/human authorization",
      "Cannot skip Security Reviewer approval for security-flagged changes",
      "Must include rollback strategy in every release plan",
    ],
    defaultAutonomy: "approval_required",
    maxConcurrentTasks: 2,
    escalationTargets: ["engineering-lead"],
    receivesEscalationsFrom: ["reliability-engineer"],
    capabilities: ["gate-evaluation", "canary-analysis", "rollout-risk", "deployment-planning", "version-tracking", "ring-management", "post-release-monitoring"],
    confidenceBaseline: 82,
    accuracyBaseline: 85,
    costTier: "medium",
    canVeto: true,
    canAutoHeal: false,
    requiredForRelease: true,
  },

  // ─── 4.12 Self-Healing Supervisor Agent ───────────────────
  {
    agentId: "agent-healing",
    role: "self-healing-supervisor",
    name: "Self-Healing Supervisor",
    title: "Auto-Remediation Policy & Safety Governor",
    domain: "Auto-Remediation",
    watches: [
      "Self-heal rule health and failure rates",
      "Auto-fix confidence trends",
      "Heal outcomes (success, failure, rollback)",
      "Failed heals and their root causes",
      "Rollback rates across heal categories",
      "Heal class safety ratings",
      "Shadow mode recordings",
      "Canary mode results",
    ],
    responsibilities: [
      "Determine what is auto-heal eligible based on risk and evidence",
      "Downgrade risky heal categories automatically",
      "Require post-verification for all executed heals",
      "Recommend pause/resume on specific heal classes",
      "Monitor shadow mode results before promoting to live",
      "Escalate when heal patterns show degradation",
      "Maintain heal safety boundaries per environment",
    ],
    outputs: [
      "Heal eligibility decisions",
      "Self-heal policy suggestions",
      "Confidence trend reports",
      "Downgrade/upgrade recommendations",
      "Shadow-to-live promotion proposals",
      "Heal class safety assessments",
    ],
    restrictions: [
      "No silent expansion of self-heal scope without approval",
      "Cannot override Security Reviewer vetoes on heal classes",
      "Must generate proof receipts for all heal decisions",
      "Cannot enable high-risk heals in production without human approval",
    ],
    defaultAutonomy: "safe_auto_heal",
    maxConcurrentTasks: 4,
    escalationTargets: ["reliability-engineer", "engineering-lead"],
    receivesEscalationsFrom: [],
    capabilities: ["heal-evaluation", "rule-management", "verification-check", "downgrade-decision", "heal-scoping", "shadow-mode-analysis", "canary-evaluation"],
    confidenceBaseline: 88,
    accuracyBaseline: 90,
    costTier: "low",
    canVeto: false,
    canAutoHeal: true,
    requiredForRelease: false,
  },

  // ─── 4.13 Learning Analyst Agent ──────────────────────────
  {
    agentId: "agent-learning",
    role: "learning-analyst",
    name: "Learning Analyst",
    title: "Pattern Discovery & Continuous Improvement Specialist",
    domain: "Pattern Discovery",
    watches: [
      "Recurring failure patterns across missions",
      "Repeated rejected recommendations",
      "Operator override patterns and frequencies",
      "Repeated regressions in the same areas",
      "Confidence miscalibration across agents",
      "Mission success/failure history and trends",
      "Cost vs value of agent actions over time",
      "Routing efficiency and agent fit accuracy",
    ],
    responsibilities: [
      "Extract learnings from mission outcomes",
      "Improve agent routing heuristics based on evidence",
      "Improve confidence estimates through calibration",
      "Recommend permanent fixes based on recurring patterns",
      "Maintain and curate the pattern library",
      "Detect when agents are systematically over or under confident",
      "Propose system-wide improvements backed by evidence",
    ],
    outputs: [
      "Learned pattern reports",
      "Confidence calibration change proposals",
      "Routing improvement suggestions",
      "Agent performance trend analyses",
      "Permanent fix recommendations",
      "Cost vs value reports",
    ],
    restrictions: [
      "Cannot directly alter hard safety boundaries without approval",
      "All learning changes must be evidence-backed and reversible",
      "Cannot silently modify agent weights beyond ±0.1 without review",
      "Pattern library additions require confidence threshold",
    ],
    defaultAutonomy: "observe_only",
    maxConcurrentTasks: 2,
    escalationTargets: ["engineering-lead"],
    receivesEscalationsFrom: [],
    capabilities: ["pattern-detection", "trend-analysis", "override-tracking", "improvement-proposal", "confidence-calibration", "cost-value-analysis", "routing-optimization"],
    confidenceBaseline: 71,
    accuracyBaseline: 71,
    costTier: "low",
    canVeto: false,
    canAutoHeal: false,
    requiredForRelease: false,
  },
];

// ── Lookup helpers ──────────────────────────────────────────

export function getAgentSpec(agentId: string): AgentSpecification | undefined {
  return AGENT_SPECIFICATIONS.find(a => a.agentId === agentId);
}

export function getAgentSpecByRole(role: AgentRole): AgentSpecification | undefined {
  return AGENT_SPECIFICATIONS.find(a => a.role === role);
}

export function getAgentsRequiredForRelease(): AgentSpecification[] {
  return AGENT_SPECIFICATIONS.filter(a => a.requiredForRelease);
}

export function getAgentsWithVetoPower(): AgentSpecification[] {
  return AGENT_SPECIFICATIONS.filter(a => a.canVeto);
}

export function getAutoHealCapableAgents(): AgentSpecification[] {
  return AGENT_SPECIFICATIONS.filter(a => a.canAutoHeal);
}

// ── Chief Engineering Synthesis Generator ───────────────────

export function generateChiefSynthesis(
  context: {
    activeMissions: number;
    blockedMissions: number;
    completedMissions: number;
    criticalIssues: number;
    selfHealSuccessRate: number;
    releaseConfidence: number;
    agentDisagreements?: { topic: string; positions: { agent: string; position: string }[] }[];
    topRisk?: string;
    topOpportunity?: string;
    autoHandleCandidates?: string[];
    humanReviewRequired?: string[];
  }
): ChiefEngineeringSynthesis {
  const selfHealHealth: ChiefEngineeringSynthesis["selfHealHealth"] =
    context.selfHealSuccessRate >= 90 ? "healthy" :
    context.selfHealSuccessRate >= 70 ? "degraded" : "paused";

  const releaseDirection: ChiefEngineeringSynthesis["releaseConfidenceDirection"] =
    context.criticalIssues > 0 ? "falling" :
    context.blockedMissions > 2 ? "falling" :
    context.selfHealSuccessRate < 80 ? "falling" :
    context.releaseConfidence >= 85 ? "rising" : "stable";

  return {
    synthesisId: `synth-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    whatMattersNow: context.criticalIssues > 0
      ? `${context.criticalIssues} critical issue(s) require immediate attention`
      : context.blockedMissions > 0
      ? `${context.blockedMissions} mission(s) are blocked — unblock to maintain velocity`
      : "System is healthy — focus on quality improvements and release readiness",
    biggestRisk: context.topRisk ?? (context.criticalIssues > 0
      ? "Unresolved critical issues may impact release safety"
      : "No significant risk identified"),
    biggestOpportunity: context.topOpportunity ?? (context.selfHealSuccessRate >= 90
      ? "Self-healing maturity allows expanding auto-heal coverage"
      : "Improving test coverage to increase release confidence"),
    shouldAutoHandle: context.autoHandleCandidates ?? [
      "Low-risk cache invalidations",
      "Stale CDN content refresh",
      "Non-critical process restarts",
      "Documentation drift corrections",
    ],
    shouldStayHumanReviewed: context.humanReviewRequired ?? [
      "Schema changes",
      "Auth flow modifications",
      "Financial logic changes",
      "Production deployments",
      "Security-flagged change plans",
    ],
    agentDisagreements: context.agentDisagreements ?? [],
    releaseConfidenceDirection: releaseDirection,
    releaseConfidenceScore: context.releaseConfidence,
    nextBestOperatorAction: context.criticalIssues > 0
      ? "Review and approve pending fix proposals for critical issues"
      : context.blockedMissions > 0
      ? "Unblock stalled missions by reviewing pending approvals"
      : context.releaseConfidence >= 85
      ? "Release confidence is high — consider deploying"
      : "Continue improving test coverage and resolving warnings",
    missionSummary: {
      active: context.activeMissions,
      blocked: context.blockedMissions,
      completed: context.completedMissions,
    },
    criticalIssueCount: context.criticalIssues,
    selfHealHealth,
  };
}
