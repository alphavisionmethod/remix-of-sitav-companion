// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Council Protocol Engine
// Formal advisor registry, council protocol with disagreement,
// synthesis, cross-OS meta-advisors, and capability maps
// ═══════════════════════════════════════════════════════════════

// ── Advisor Definition ──────────────────────────────────────────

export interface AdvisorDefinition {
  id: string;
  name: string;
  council: "business" | "finance" | "concierge" | "meta";
  mission: string;
  specialAbility: string;
  domainScope: string[];
  memoryScope: string[];          // what memory keys this advisor can read
  toolPermissions: string[];      // capability IDs this advisor can invoke
  blockedActions: string[];       // explicitly denied capabilities
  simulationRights: boolean;
  approvalCeiling: "low" | "medium" | "high" | "critical";
  boardroomRole: string;
  kpis: string[];
  autonomyLevel: "observe" | "recommend" | "draft" | "simulate" | "approval-ready" | "execute";
  trustThreshold: number;         // 0-100, minimum trust score to activate
  status: "active" | "paused" | "degraded" | "disabled";
}

export interface CouncilRecommendation {
  advisorId: string;
  advisorName: string;
  council: string;
  recommendation: string;
  confidence: number;             // 0-1
  concerns: string[];
  opportunities: string[];
  constraints: string[];
  preferredAction: string;
  alternativeAction?: string;
  riskAssessment: "low" | "medium" | "high" | "critical";
  dataSources: string[];
  assumptions: string[];
}

export interface CouncilDisagreement {
  field: string;
  advisorA: { id: string; name: string; position: string };
  advisorB: { id: string; name: string; position: string };
  severity: "minor" | "material" | "blocking";
  tradeoff: string;
  dominantConstraint: string;
  resolution?: string;
}

export interface CouncilSynthesis {
  id: string;
  topic: string;
  participatingAdvisors: string[];
  recommendations: CouncilRecommendation[];
  disagreements: CouncilDisagreement[];
  primaryRecommendation: string;
  alternativePath: string;
  overallConfidence: number;
  overallRisk: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  simulationAvailable: boolean;
  proofOfSimilarPast: string[];
  synthesizedBy: string;          // meta-advisor ID
  timestamp: number;
}

export interface MissionMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  prominentAdvisors: string[];    // advisor IDs surfaced first
  emphasizedDomains: string[];
  deemphasizedDomains: string[];
  boardroomPacketType: string;
  homeEmphasis: string[];         // sections to highlight on Daily Pulse
  active: boolean;
}

// ── Advisor Registry ────────────────────────────────────────────

export const ADVISOR_REGISTRY: AdvisorDefinition[] = [
  // Business Council
  { id: "biz-advisor", name: "Business Advisor", council: "business", mission: "Revenue health, pipeline intelligence, and strategic business moves", specialAbility: "Cross-client pattern recognition and churn prediction", domainScope: ["business", "crm"], memoryScope: ["customers", "leads", "opportunities", "invoices"], toolPermissions: ["crm.*", "business.*"], blockedActions: ["finance.transfer", "finance.budget.delete"], simulationRights: true, approvalCeiling: "high", boardroomRole: "Revenue Intelligence Lead", kpis: ["pipeline velocity", "lead conversion", "revenue growth"], autonomyLevel: "approval-ready", trustThreshold: 70, status: "active" },
  { id: "sales-advisor", name: "Sales Advisor", council: "business", mission: "Deal acceleration, follow-up timing, and competitive positioning", specialAbility: "Optimal outreach timing based on engagement patterns", domainScope: ["business", "crm"], memoryScope: ["leads", "opportunities", "communications"], toolPermissions: ["crm.lead.*", "crm.opportunity.*", "communication.*"], blockedActions: ["finance.*"], simulationRights: true, approvalCeiling: "medium", boardroomRole: "Deal Velocity Analyst", kpis: ["close rate", "response time", "deal size"], autonomyLevel: "recommend", trustThreshold: 60, status: "active" },
  { id: "growth-advisor", name: "Growth Advisor", council: "business", mission: "Expansion opportunities, market positioning, and demand generation", specialAbility: "Opportunity scoring from cross-domain signals", domainScope: ["business", "marketing"], memoryScope: ["leads", "customers", "market"], toolPermissions: ["business.opportunity.*", "marketing.*"], blockedActions: ["finance.transfer"], simulationRights: true, approvalCeiling: "medium", boardroomRole: "Growth Strategy Advisor", kpis: ["opportunity pipeline", "expansion revenue", "market share"], autonomyLevel: "recommend", trustThreshold: 60, status: "active" },
  { id: "collections-advisor", name: "Collections Advisor", council: "business", mission: "Receivables recovery, payment follow-up, and aging management", specialAbility: "Escalation timing and tone optimization for collections", domainScope: ["business", "finance"], memoryScope: ["invoices", "customers", "communications"], toolPermissions: ["business.invoice.*", "communication.send"], blockedActions: ["finance.budget.*"], simulationRights: true, approvalCeiling: "high", boardroomRole: "Receivables Recovery Lead", kpis: ["collection rate", "DSO", "aging reduction"], autonomyLevel: "approval-ready", trustThreshold: 70, status: "active" },
  { id: "operations-advisor", name: "Operations Advisor", council: "business", mission: "Workflow efficiency, process optimization, and capacity planning", specialAbility: "Bottleneck detection across workflows", domainScope: ["business", "workflows"], memoryScope: ["workflows", "tasks", "processes"], toolPermissions: ["workflow.*", "business.ops.*"], blockedActions: ["finance.transfer"], simulationRights: true, approvalCeiling: "medium", boardroomRole: "Operational Efficiency Analyst", kpis: ["workflow completion rate", "process cycle time"], autonomyLevel: "recommend", trustThreshold: 60, status: "active" },
  { id: "biz-risk-advisor", name: "Business Risk Advisor", council: "business", mission: "Churn risk, concentration risk, and operational exposure", specialAbility: "Early warning signals from behavioral drift", domainScope: ["business"], memoryScope: ["customers", "leads", "invoices"], toolPermissions: ["business.risk.*", "business.report.*"], blockedActions: ["finance.*", "concierge.*"], simulationRights: true, approvalCeiling: "medium", boardroomRole: "Risk Assessment Advisor", kpis: ["risk score accuracy", "early warning hit rate"], autonomyLevel: "recommend", trustThreshold: 65, status: "active" },
  { id: "biz-boardroom-advisor", name: "Business Boardroom Advisor", council: "business", mission: "Synthesize business intelligence into boardroom-ready packets", specialAbility: "Multi-signal narrative generation with confidence scoring", domainScope: ["business"], memoryScope: ["customers", "leads", "opportunities", "invoices", "workflows"], toolPermissions: ["boardroom.business.*"], blockedActions: [], simulationRights: false, approvalCeiling: "low", boardroomRole: "Business Boardroom Synthesizer", kpis: ["packet accuracy", "decision quality"], autonomyLevel: "draft", trustThreshold: 70, status: "active" },

  // Finance Council
  { id: "money-advisor", name: "Money Advisor", council: "finance", mission: "Cash posture, spending intelligence, and financial health monitoring", specialAbility: "Safe-to-spend calculation with multi-horizon awareness", domainScope: ["finance"], memoryScope: ["bills", "accounts", "budgets", "cashflow"], toolPermissions: ["finance.analyze.*", "finance.bill.*"], blockedActions: ["finance.transfer.execute"], simulationRights: true, approvalCeiling: "high", boardroomRole: "Cash Intelligence Lead", kpis: ["safe-to-spend accuracy", "cashflow prediction"], autonomyLevel: "approval-ready", trustThreshold: 75, status: "active" },
  { id: "treasury-advisor", name: "Treasury Advisor", council: "finance", mission: "Reserve management, capital allocation, and liquidity strategy", specialAbility: "Optimal reserve allocation across time horizons", domainScope: ["finance"], memoryScope: ["reserves", "budgets", "cashflow", "investments"], toolPermissions: ["finance.reserve.*", "finance.analyze.*"], blockedActions: ["finance.transfer.execute"], simulationRights: true, approvalCeiling: "critical", boardroomRole: "Capital Strategy Advisor", kpis: ["reserve coverage", "runway months"], autonomyLevel: "recommend", trustThreshold: 80, status: "active" },
  { id: "waste-advisor", name: "Waste Reduction Advisor", council: "finance", mission: "Subscription waste detection, duplicate spending, and cost optimization", specialAbility: "Pattern detection across recurring charges", domainScope: ["finance"], memoryScope: ["subscriptions", "bills", "spending"], toolPermissions: ["finance.subscription.*", "finance.analyze.*"], blockedActions: ["finance.transfer.*"], simulationRights: true, approvalCeiling: "medium", boardroomRole: "Cost Optimization Analyst", kpis: ["waste detected", "savings realized"], autonomyLevel: "recommend", trustThreshold: 60, status: "active" },
  { id: "tax-advisor", name: "Tax & Reserve Advisor", council: "finance", mission: "Tax estimation, quarterly planning, and compliance preparation", specialAbility: "Deterministic tax bracket calculation with deduction optimization", domainScope: ["finance"], memoryScope: ["income", "deductions", "reserves", "tax"], toolPermissions: ["finance.tax.*", "finance.reserve.*"], blockedActions: ["finance.transfer.*"], simulationRights: true, approvalCeiling: "high", boardroomRole: "Tax Strategy Advisor", kpis: ["tax estimate accuracy", "compliance readiness"], autonomyLevel: "recommend", trustThreshold: 70, status: "active" },
  { id: "receivables-advisor", name: "Receivables & Obligations Advisor", council: "finance", mission: "Invoice aging, payment timing, and obligation tracking", specialAbility: "Cross-domain obligation detection from documents and workflows", domainScope: ["finance", "business"], memoryScope: ["invoices", "bills", "obligations"], toolPermissions: ["finance.invoice.*", "finance.bill.*"], blockedActions: ["finance.transfer.execute"], simulationRights: true, approvalCeiling: "medium", boardroomRole: "Obligations Analyst", kpis: ["collection efficiency", "bill payment timing"], autonomyLevel: "recommend", trustThreshold: 65, status: "active" },
  { id: "finance-boardroom-advisor", name: "Finance Boardroom Advisor", council: "finance", mission: "Synthesize financial intelligence into boardroom-ready packets", specialAbility: "Multi-horizon financial narrative with risk overlay", domainScope: ["finance"], memoryScope: ["cashflow", "budgets", "reserves", "invoices", "bills"], toolPermissions: ["boardroom.finance.*"], blockedActions: [], simulationRights: false, approvalCeiling: "low", boardroomRole: "Finance Boardroom Synthesizer", kpis: ["packet accuracy", "risk assessment quality"], autonomyLevel: "draft", trustThreshold: 70, status: "active" },

  // Concierge Council
  { id: "concierge-advisor", name: "Concierge Advisor", council: "concierge", mission: "Life logistics, daily coordination, and household harmony", specialAbility: "Cross-context priority balancing across life and work", domainScope: ["concierge", "household"], memoryScope: ["tasks", "calendar", "household", "routines"], toolPermissions: ["concierge.*", "household.*"], blockedActions: ["finance.transfer.*"], simulationRights: true, approvalCeiling: "medium", boardroomRole: "Life Operations Lead", kpis: ["task completion rate", "schedule adherence"], autonomyLevel: "approval-ready", trustThreshold: 60, status: "active" },
  { id: "calendar-advisor", name: "Calendar Advisor", council: "concierge", mission: "Schedule optimization, conflict resolution, and time protection", specialAbility: "Buffer time analysis and energy-aware scheduling", domainScope: ["concierge"], memoryScope: ["calendar", "tasks", "preferences"], toolPermissions: ["concierge.calendar.*"], blockedActions: ["finance.*", "business.*"], simulationRights: true, approvalCeiling: "low", boardroomRole: "Schedule Analyst", kpis: ["conflict rate", "free time preserved"], autonomyLevel: "recommend", trustThreshold: 50, status: "active" },
  { id: "travel-advisor", name: "Travel Advisor", council: "concierge", mission: "Travel planning, booking coordination, and itinerary management", specialAbility: "Multi-stop itinerary optimization with preference matching", domainScope: ["concierge", "travel"], memoryScope: ["travel", "preferences", "calendar", "budgets"], toolPermissions: ["concierge.travel.*", "concierge.booking.*"], blockedActions: ["finance.transfer.*"], simulationRights: true, approvalCeiling: "high", boardroomRole: "Travel Strategy Advisor", kpis: ["booking quality score", "preference match rate"], autonomyLevel: "approval-ready", trustThreshold: 65, status: "active" },
  { id: "family-advisor", name: "Family & Household Advisor", council: "concierge", mission: "Household coordination, family task distribution, and routine health", specialAbility: "Fairness-aware task distribution across household members", domainScope: ["concierge", "household", "family"], memoryScope: ["household", "family", "tasks", "routines", "school"], toolPermissions: ["concierge.household.*", "concierge.family.*"], blockedActions: ["finance.transfer.*", "business.*"], simulationRights: true, approvalCeiling: "medium", boardroomRole: "Household Harmony Advisor", kpis: ["fairness score", "routine health"], autonomyLevel: "recommend", trustThreshold: 55, status: "active" },
  { id: "simplicity-advisor", name: "Simplicity & Stress Advisor", council: "concierge", mission: "Cognitive load reduction, simplification suggestions, and calm operations", specialAbility: "Overcommitment detection and delegation suggestions", domainScope: ["concierge", "household"], memoryScope: ["tasks", "calendar", "routines", "preferences"], toolPermissions: ["concierge.simplify.*"], blockedActions: ["finance.*", "business.*"], simulationRights: false, approvalCeiling: "low", boardroomRole: "Cognitive Load Analyst", kpis: ["stress indicators", "simplification adoption"], autonomyLevel: "observe", trustThreshold: 40, status: "active" },
  { id: "concierge-boardroom-advisor", name: "Concierge Boardroom Advisor", council: "concierge", mission: "Synthesize household and life logistics into boardroom-ready packets", specialAbility: "Family-aware narrative with privacy controls", domainScope: ["concierge", "household"], memoryScope: ["tasks", "calendar", "household", "routines", "travel"], toolPermissions: ["boardroom.concierge.*"], blockedActions: [], simulationRights: false, approvalCeiling: "low", boardroomRole: "Concierge Boardroom Synthesizer", kpis: ["packet accuracy", "privacy compliance"], autonomyLevel: "draft", trustThreshold: 60, status: "active" },

  // Meta / Cross-OS Advisors
  { id: "execution-advisor", name: "Execution Advisor", council: "meta", mission: "Coordinate action execution across all domains with policy compliance", specialAbility: "Cross-domain execution sequencing and rollback planning", domainScope: ["business", "finance", "concierge"], memoryScope: ["workflows", "approvals", "policies"], toolPermissions: ["execution.*", "workflow.*"], blockedActions: [], simulationRights: true, approvalCeiling: "critical", boardroomRole: "Execution Coordinator", kpis: ["execution success rate", "rollback rate"], autonomyLevel: "execute", trustThreshold: 85, status: "active" },
  { id: "trust-policy-advisor", name: "Trust & Policy Advisor", council: "meta", mission: "Policy compliance, approval routing, and autonomy boundary enforcement", specialAbility: "Real-time policy evaluation with precedent matching", domainScope: ["business", "finance", "concierge"], memoryScope: ["policies", "approvals", "trust-state", "audit"], toolPermissions: ["policy.*", "approval.*", "trust.*"], blockedActions: [], simulationRights: true, approvalCeiling: "critical", boardroomRole: "Trust Governance Lead", kpis: ["policy compliance rate", "approval accuracy"], autonomyLevel: "execute", trustThreshold: 90, status: "active" },
  { id: "opportunity-advisor", name: "Opportunity Advisor", council: "meta", mission: "Cross-domain opportunity detection and prioritization", specialAbility: "Pattern matching across business, finance, and concierge signals", domainScope: ["business", "finance", "concierge"], memoryScope: ["leads", "customers", "opportunities", "cashflow", "calendar"], toolPermissions: ["opportunity.*"], blockedActions: ["finance.transfer.*"], simulationRights: true, approvalCeiling: "medium", boardroomRole: "Opportunity Scout", kpis: ["opportunities surfaced", "conversion from surfaced"], autonomyLevel: "recommend", trustThreshold: 65, status: "active" },
  { id: "scenario-advisor", name: "Scenario Advisor", council: "meta", mission: "What-if analysis, impact simulation, and decision modeling", specialAbility: "Multi-variable scenario comparison with confidence intervals", domainScope: ["business", "finance", "concierge"], memoryScope: ["*"], toolPermissions: ["simulation.*"], blockedActions: ["execution.*"], simulationRights: true, approvalCeiling: "low", boardroomRole: "Scenario Analyst", kpis: ["simulation accuracy", "decision adoption rate"], autonomyLevel: "simulate", trustThreshold: 60, status: "active" },
  { id: "recovery-advisor", name: "Recovery Advisor", council: "meta", mission: "Failure recovery, rollback coordination, and incident mitigation", specialAbility: "Root cause analysis and recovery path generation", domainScope: ["business", "finance", "concierge"], memoryScope: ["workflows", "incidents", "receipts"], toolPermissions: ["recovery.*", "workflow.retry.*"], blockedActions: [], simulationRights: true, approvalCeiling: "high", boardroomRole: "Recovery Coordinator", kpis: ["MTTR", "recovery success rate"], autonomyLevel: "approval-ready", trustThreshold: 80, status: "active" },
  { id: "boardroom-meta-advisor", name: "Boardroom Meta-Advisor", council: "meta", mission: "Synthesize all council recommendations into unified boardroom narratives", specialAbility: "Multi-council synthesis with disagreement resolution", domainScope: ["business", "finance", "concierge"], memoryScope: ["*"], toolPermissions: ["boardroom.*"], blockedActions: ["execution.*"], simulationRights: false, approvalCeiling: "low", boardroomRole: "Chief Synthesizer", kpis: ["synthesis quality", "decision clarity"], autonomyLevel: "draft", trustThreshold: 75, status: "active" },
  { id: "identity-delegation-advisor", name: "Identity & Delegation Advisor", council: "meta", mission: "Role management, delegation chains, and permission verification", specialAbility: "Permission inheritance validation across entity graph", domainScope: ["business", "finance", "concierge"], memoryScope: ["identity", "roles", "delegations"], toolPermissions: ["identity.*", "delegation.*"], blockedActions: ["execution.*"], simulationRights: false, approvalCeiling: "critical", boardroomRole: "Access Governance Advisor", kpis: ["permission accuracy", "delegation response time"], autonomyLevel: "recommend", trustThreshold: 85, status: "active" },
];

// ── Council Protocol ────────────────────────────────────────────

export function getAdvisorsByCouncil(council: AdvisorDefinition["council"]): AdvisorDefinition[] {
  return ADVISOR_REGISTRY.filter(a => a.council === council && a.status === "active");
}

export function getAdvisor(id: string): AdvisorDefinition | undefined {
  return ADVISOR_REGISTRY.find(a => a.id === id);
}

export function getMetaAdvisors(): AdvisorDefinition[] {
  return ADVISOR_REGISTRY.filter(a => a.council === "meta" && a.status === "active");
}

/**
 * Run the formal council protocol:
 * 1. Identify relevant advisors for the topic
 * 2. Each advisor returns recommendation with concerns/opportunities
 * 3. Detect disagreements
 * 4. Boardroom Meta-Advisor synthesizes
 */
export function runCouncilProtocol(
  topic: string,
  domain: string,
  context: Record<string, unknown>,
  involvedCouncils: AdvisorDefinition["council"][] = ["business", "finance", "concierge"]
): CouncilSynthesis {
  const relevantAdvisors = involvedCouncils.flatMap(c => getAdvisorsByCouncil(c));
  const metaAdvisors = getMetaAdvisors();

  // Generate mock recommendations (in production, Brain Core would orchestrate real advisor calls)
  const recommendations: CouncilRecommendation[] = relevantAdvisors.slice(0, 5).map(advisor => ({
    advisorId: advisor.id,
    advisorName: advisor.name,
    council: advisor.council,
    recommendation: `${advisor.name} recommends proceeding with caution on "${topic}". ${advisor.mission.split(".")[0]}.`,
    confidence: 0.7 + Math.random() * 0.25,
    concerns: [`${advisor.domainScope[0]} impact needs monitoring`],
    opportunities: [`Potential ${advisor.domainScope[0]} improvement`],
    constraints: advisor.blockedActions.length > 0 ? [`Cannot ${advisor.blockedActions[0]}`] : [],
    preferredAction: `Review and proceed with ${advisor.autonomyLevel} level`,
    alternativeAction: "Simulate first before committing",
    riskAssessment: advisor.approvalCeiling === "critical" ? "high" : advisor.approvalCeiling === "high" ? "medium" : "low",
    dataSources: advisor.memoryScope.slice(0, 3),
    assumptions: [`${advisor.domainScope[0]} data is current`],
  }));

  // Detect disagreements
  const disagreements: CouncilDisagreement[] = [];
  for (let i = 0; i < recommendations.length; i++) {
    for (let j = i + 1; j < recommendations.length; j++) {
      const a = recommendations[i];
      const b = recommendations[j];
      if (a.riskAssessment !== b.riskAssessment) {
        disagreements.push({
          field: "risk assessment",
          advisorA: { id: a.advisorId, name: a.advisorName, position: `Risk: ${a.riskAssessment}` },
          advisorB: { id: b.advisorId, name: b.advisorName, position: `Risk: ${b.riskAssessment}` },
          severity: "material",
          tradeoff: `${a.advisorName} sees ${a.riskAssessment} risk while ${b.advisorName} sees ${b.riskAssessment} risk`,
          dominantConstraint: a.riskAssessment === "high" ? `${a.advisorName}'s higher risk assessment` : `${b.advisorName}'s assessment`,
        });
      }
    }
  }

  const overallConfidence = recommendations.length > 0
    ? recommendations.reduce((s, r) => s + r.confidence, 0) / recommendations.length
    : 0.5;

  const synthesis: CouncilSynthesis = {
    id: crypto.randomUUID(),
    topic,
    participatingAdvisors: recommendations.map(r => r.advisorId),
    recommendations,
    disagreements,
    primaryRecommendation: recommendations[0]?.preferredAction ?? "No recommendation available",
    alternativePath: recommendations[0]?.alternativeAction ?? "Simulate the scenario first",
    overallConfidence,
    overallRisk: disagreements.some(d => d.severity === "blocking") ? "critical"
      : disagreements.length > 2 ? "high"
      : disagreements.length > 0 ? "medium" : "low",
    requiresApproval: recommendations.some(r => r.riskAssessment === "high" || r.riskAssessment === "critical"),
    simulationAvailable: true,
    proofOfSimilarPast: ["Similar decision reviewed 14 days ago — approved with positive outcome"],
    synthesizedBy: "boardroom-meta-advisor",
    timestamp: Date.now(),
  };

  return synthesis;
}

// ── Mission Modes ───────────────────────────────────────────────

export const MISSION_MODES: MissionMode[] = [
  { id: "normal", name: "Normal", description: "Balanced view across all domains", icon: "⚡", prominentAdvisors: ["biz-advisor", "money-advisor", "concierge-advisor"], emphasizedDomains: ["business", "finance", "concierge"], deemphasizedDomains: [], boardroomPacketType: "morning-briefing", homeEmphasis: ["actions", "opportunities", "proof"], active: true },
  { id: "sales-day", name: "Sales Day", description: "Focus on pipeline, leads, and deal acceleration", icon: "🎯", prominentAdvisors: ["sales-advisor", "growth-advisor", "biz-advisor", "collections-advisor"], emphasizedDomains: ["business", "crm"], deemphasizedDomains: ["concierge"], boardroomPacketType: "pipeline-review", homeEmphasis: ["pipeline", "leads", "follow-ups", "deals"], active: false },
  { id: "closing-day", name: "Closing Day", description: "Focus on closing deals and finalizing proposals", icon: "🤝", prominentAdvisors: ["sales-advisor", "biz-advisor", "collections-advisor"], emphasizedDomains: ["business"], deemphasizedDomains: ["concierge", "household"], boardroomPacketType: "pipeline-review", homeEmphasis: ["closing-deals", "proposals", "invoices"], active: false },
  { id: "travel-mode", name: "Travel Mode", description: "Travel coordination, itineraries, and on-the-go essentials", icon: "✈️", prominentAdvisors: ["travel-advisor", "calendar-advisor", "concierge-advisor"], emphasizedDomains: ["concierge", "travel"], deemphasizedDomains: ["business"], boardroomPacketType: "household-ops", homeEmphasis: ["itinerary", "bookings", "calendar"], active: false },
  { id: "family-week", name: "Family Week", description: "Household coordination, school, and family activities", icon: "👨‍👩‍👧‍👦", prominentAdvisors: ["family-advisor", "calendar-advisor", "concierge-advisor", "simplicity-advisor"], emphasizedDomains: ["concierge", "household", "family"], deemphasizedDomains: ["business"], boardroomPacketType: "household-ops", homeEmphasis: ["family-tasks", "school", "routines", "calendar"], active: false },
  { id: "tax-week", name: "Tax Week", description: "Tax preparation, deductions review, and compliance", icon: "📊", prominentAdvisors: ["tax-advisor", "money-advisor", "treasury-advisor"], emphasizedDomains: ["finance"], deemphasizedDomains: ["concierge"], boardroomPacketType: "financial-health", homeEmphasis: ["tax-estimate", "deductions", "quarterly-payment"], active: false },
  { id: "collections-recovery", name: "Collections Recovery", description: "Focus on overdue invoices and receivables recovery", icon: "💰", prominentAdvisors: ["collections-advisor", "receivables-advisor", "money-advisor"], emphasizedDomains: ["business", "finance"], deemphasizedDomains: ["concierge"], boardroomPacketType: "pipeline-review", homeEmphasis: ["overdue-invoices", "aging", "follow-ups"], active: false },
  { id: "calm", name: "Calm Mode", description: "Minimal notifications, essential actions only", icon: "🧘", prominentAdvisors: ["simplicity-advisor", "concierge-advisor"], emphasizedDomains: [], deemphasizedDomains: ["business"], boardroomPacketType: "morning-briefing", homeEmphasis: ["essentials-only"], active: false },
  { id: "launch", name: "Launch Mode", description: "Product launch focus with all systems monitoring", icon: "🚀", prominentAdvisors: ["biz-advisor", "growth-advisor", "operations-advisor", "money-advisor"], emphasizedDomains: ["business", "finance"], deemphasizedDomains: ["concierge"], boardroomPacketType: "weekly-review", homeEmphasis: ["metrics", "pipeline", "revenue", "incidents"], active: false },
  { id: "emergency", name: "Emergency Stabilization", description: "Critical incident mode — essential actions only, heightened monitoring", icon: "🚨", prominentAdvisors: ["recovery-advisor", "trust-policy-advisor", "execution-advisor", "money-advisor"], emphasizedDomains: ["business", "finance", "concierge"], deemphasizedDomains: [], boardroomPacketType: "incident-review", homeEmphasis: ["incidents", "recovery", "approvals"], active: false },
];

export function getActiveMissionMode(): MissionMode {
  return MISSION_MODES.find(m => m.active) ?? MISSION_MODES[0];
}

export function setMissionMode(modeId: string): MissionMode[] {
  return MISSION_MODES.map(m => ({ ...m, active: m.id === modeId }));
}

// ── Boardroom Perspective Levels ────────────────────────────────

export type PerspectiveLevel = "executive" | "analyst" | "owner";

export interface PerspectiveConfig {
  level: PerspectiveLevel;
  label: string;
  description: string;
  showMetricCards: boolean;
  showDetailTables: boolean;
  showNarratives: boolean;
  showAlerts: boolean;
  showActionItems: boolean;
  showProvenance: boolean;
  showConfidenceEnvelope: boolean;
  showContradictions: boolean;
  showOpportunities: boolean;
  showTechnicalDetails: boolean;
  maxMetrics: number;
  maxAlerts: number;
  maxActionItems: number;
  narrativeDepth: "summary" | "standard" | "detailed";
}

export const PERSPECTIVE_CONFIGS: Record<PerspectiveLevel, PerspectiveConfig> = {
  executive: {
    level: "executive",
    label: "Executive",
    description: "High-level KPIs, key risks, and strategic recommendations",
    showMetricCards: true,
    showDetailTables: false,
    showNarratives: true,
    showAlerts: true,
    showActionItems: true,
    showProvenance: false,
    showConfidenceEnvelope: false,
    showContradictions: false,
    showOpportunities: true,
    showTechnicalDetails: false,
    maxMetrics: 4,
    maxAlerts: 3,
    maxActionItems: 5,
    narrativeDepth: "summary",
  },
  analyst: {
    level: "analyst",
    label: "Analyst",
    description: "Full data tables, all metrics, and detailed analysis",
    showMetricCards: true,
    showDetailTables: true,
    showNarratives: true,
    showAlerts: true,
    showActionItems: true,
    showProvenance: true,
    showConfidenceEnvelope: true,
    showContradictions: true,
    showOpportunities: true,
    showTechnicalDetails: true,
    maxMetrics: 20,
    maxAlerts: 10,
    maxActionItems: 20,
    narrativeDepth: "detailed",
  },
  owner: {
    level: "owner",
    label: "Owner",
    description: "Strategic overview with trust, policy, and system health",
    showMetricCards: true,
    showDetailTables: true,
    showNarratives: true,
    showAlerts: true,
    showActionItems: true,
    showProvenance: true,
    showConfidenceEnvelope: true,
    showContradictions: true,
    showOpportunities: true,
    showTechnicalDetails: false,
    maxMetrics: 8,
    maxAlerts: 5,
    maxActionItems: 10,
    narrativeDepth: "standard",
  },
};

export function getPerspectiveConfig(level: PerspectiveLevel): PerspectiveConfig {
  return PERSPECTIVE_CONFIGS[level];
}

// ── Perspective Filtering ──────────────────────────────────────

import type { BoardroomSection } from "@/lib/boardroom/types";

const SECTION_TYPE_MAP: Record<string, keyof PerspectiveConfig> = {
  "metric-card": "showMetricCards",
  "table": "showDetailTables",
  "narrative": "showNarratives",
  "alert": "showAlerts",
  "action-list": "showActionItems",
  "chart": "showMetricCards",
};

export function filterSectionsByPerspective(
  sections: BoardroomSection[],
  level: PerspectiveLevel
): BoardroomSection[] {
  const config = PERSPECTIVE_CONFIGS[level];
  return sections.filter(section => {
    const configKey = SECTION_TYPE_MAP[section.type];
    if (configKey && config[configKey] === false) return false;
    return true;
  });
}

export function filterAlertsByPerspective<T extends { severity?: string }>(
  alerts: T[],
  level: PerspectiveLevel
): T[] {
  const config = PERSPECTIVE_CONFIGS[level];
  return alerts.slice(0, config.maxAlerts);
}

export function filterActionItemsByPerspective<T>(
  items: T[],
  level: PerspectiveLevel
): T[] {
  const config = PERSPECTIVE_CONFIGS[level];
  return items.slice(0, config.maxActionItems);
}

// ── Advisor Capability Checks ──────────────────────────────────

export function canAdvisorPerformAction(
  advisorId: string,
  action: string
): { allowed: boolean; reason: string } {
  const advisor = getAdvisor(advisorId);
  if (!advisor) return { allowed: false, reason: `Unknown advisor: ${advisorId}` };
  if (advisor.status !== "active") return { allowed: false, reason: `Advisor ${advisor.name} is ${advisor.status}` };

  // Check blocked actions
  for (const blocked of advisor.blockedActions) {
    if (blocked.endsWith(".*")) {
      const prefix = blocked.replace(".*", "");
      if (action.startsWith(prefix)) return { allowed: false, reason: `Action ${action} blocked by ${blocked}` };
    } else if (blocked === action) {
      return { allowed: false, reason: `Action ${action} explicitly blocked` };
    }
  }

  // Check tool permissions
  const hasPermission = advisor.toolPermissions.some(perm => {
    if (perm.endsWith(".*")) {
      return action.startsWith(perm.replace(".*", ""));
    }
    return perm === action;
  });

  if (!hasPermission) return { allowed: false, reason: `Advisor ${advisor.name} lacks permission for ${action}` };
  return { allowed: true, reason: "Permitted" };
}

export function getAdvisorCapabilities(advisorId: string): string[] {
  const advisor = getAdvisor(advisorId);
  if (!advisor) return [];
  return advisor.toolPermissions;
}

export function isAdvisorTrustworthy(advisorId: string, currentTrustScore: number): boolean {
  const advisor = getAdvisor(advisorId);
  if (!advisor) return false;
  return currentTrustScore >= advisor.trustThreshold;
}

// ── Cross-Council Bridging ─────────────────────────────────────

export function getAdvisorsForDomain(domain: string): AdvisorDefinition[] {
  return ADVISOR_REGISTRY.filter(a => a.domainScope.includes(domain) && a.status === "active");
}

export function getAdvisorsWithMemoryAccess(memoryKey: string): AdvisorDefinition[] {
  return ADVISOR_REGISTRY.filter(a =>
    a.status === "active" && (a.memoryScope.includes(memoryKey) || a.memoryScope.includes("*"))
  );
}

export function detectCouncilDisagreements(
  recommendations: CouncilRecommendation[]
): CouncilDisagreement[] {
  const disagreements: CouncilDisagreement[] = [];
  for (let i = 0; i < recommendations.length; i++) {
    for (let j = i + 1; j < recommendations.length; j++) {
      const a = recommendations[i];
      const b = recommendations[j];

      // Risk assessment disagreement
      if (a.riskAssessment !== b.riskAssessment) {
        disagreements.push({
          field: "risk assessment",
          advisorA: { id: a.advisorId, name: a.advisorName, position: `Risk: ${a.riskAssessment}` },
          advisorB: { id: b.advisorId, name: b.advisorName, position: `Risk: ${b.riskAssessment}` },
          severity: (a.riskAssessment === "critical" || b.riskAssessment === "critical") ? "blocking" : "material",
          tradeoff: `${a.advisorName} sees ${a.riskAssessment} risk while ${b.advisorName} sees ${b.riskAssessment} risk`,
          dominantConstraint: a.riskAssessment === "high" || a.riskAssessment === "critical"
            ? `${a.advisorName}'s higher risk assessment`
            : `${b.advisorName}'s assessment`,
        });
      }

      // Confidence gap > 0.3
      if (Math.abs(a.confidence - b.confidence) > 0.3) {
        disagreements.push({
          field: "confidence",
          advisorA: { id: a.advisorId, name: a.advisorName, position: `Confidence: ${(a.confidence * 100).toFixed(0)}%` },
          advisorB: { id: b.advisorId, name: b.advisorName, position: `Confidence: ${(b.confidence * 100).toFixed(0)}%` },
          severity: "minor",
          tradeoff: `Significant confidence gap between advisors`,
          dominantConstraint: "Lower confidence advisor may lack data",
        });
      }
    }
  }
  return disagreements;
}

export function synthesizeCouncilRecommendations(
  recommendations: CouncilRecommendation[]
): { primary: string; alternative: string; overallConfidence: number; requiresApproval: boolean } {
  if (recommendations.length === 0) {
    return { primary: "No recommendations available", alternative: "Gather more data", overallConfidence: 0, requiresApproval: false };
  }
  const sorted = [...recommendations].sort((a, b) => b.confidence - a.confidence);
  const overallConfidence = recommendations.reduce((s, r) => s + r.confidence, 0) / recommendations.length;
  return {
    primary: sorted[0].preferredAction,
    alternative: sorted[0].alternativeAction || sorted[1]?.preferredAction || "Simulate first",
    overallConfidence,
    requiresApproval: recommendations.some(r => r.riskAssessment === "high" || r.riskAssessment === "critical"),
  };
}
