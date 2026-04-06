// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Scenario Packs
// Pre-built coherent scenario families for investor, operator,
// family office, business growth, and connected services demos
// ═══════════════════════════════════════════════════════════════

export interface ScenarioPack {
  packId: string;
  name: string;
  description: string;
  targetAudience: string[];
  domains: string[];
  narrativeArc: string;
  defaultLandingRoute: string;
  tourSteps: ScenarioTourStep[];
  entitySeeds: ScenarioEntitySeed[];
  supportedSurfaces: ("web_desktop" | "web_mobile" | "web_tablet")[];
}

export interface ScenarioTourStep {
  stepId: string;
  route: string;
  title: string;
  description: string;
  highlightElements?: string[];
  durationSeconds: number;
}

export interface ScenarioEntitySeed {
  domain: string;
  entityType: string;
  key: string;
  label: string;
  data: Record<string, unknown>;
}

// ── Flagship Scenario Packs ─────────────────────────────────────

export const SCENARIO_PACKS: ScenarioPack[] = [
  {
    packId: "founder-operator",
    name: "Founder/Operator Life",
    description: "A day in the life of a tech founder managing business, investments, and personal finances through SITA OS",
    targetAudience: ["investors", "founders", "operators"],
    domains: ["boardroom", "business", "investment", "money", "workspace", "advisor", "approvals"],
    narrativeArc: "Morning pulse → Boardroom review → Business pipeline check → Investment rebalance → Approval queue → AI advisor insights → End-of-day summary",
    defaultLandingRoute: "/dashboard",
    supportedSurfaces: ["web_desktop", "web_mobile", "web_tablet"],
    tourSteps: [
      { stepId: "pulse", route: "/dashboard", title: "Morning Pulse", description: "Your AI-powered daily briefing with key metrics across all domains", durationSeconds: 30 },
      { stepId: "boardroom", route: "/boardroom", title: "Boardroom", description: "Strategic overview with cross-domain insights and action items", durationSeconds: 45 },
      { stepId: "pipeline", route: "/business/pipeline", title: "Business Pipeline", description: "Active deals, revenue metrics, and CRM intelligence", durationSeconds: 30 },
      { stepId: "portfolio", route: "/investment/portfolio", title: "Investment Portfolio", description: "Portfolio performance, allocation analysis, and rebalancing recommendations", durationSeconds: 30 },
      { stepId: "approvals", route: "/approvals", title: "Approval Queue", description: "Trust-weighted actions requiring your review", durationSeconds: 20 },
      { stepId: "advisor", route: "/assistant", title: "AI Advisor", description: "Contextual AI assistance across all your domains", durationSeconds: 30 },
    ],
    entitySeeds: [
      { domain: "business", entityType: "deal", key: "atlas-platform", label: "Atlas Corp Platform License", data: { value: 120000, stage: "negotiation", probability: 75 } },
      { domain: "business", entityType: "deal", key: "nordic-consulting", label: "Nordic Digital Consulting", data: { value: 45000, stage: "proposal", probability: 50 } },
      { domain: "investment", entityType: "holding", key: "vti", label: "Vanguard Total Stock Market", data: { value: 119385, gainPct: 18.2 } },
      { domain: "money", entityType: "account", key: "primary-checking", label: "Primary Checking", data: { balance: 48250, institution: "Chase" } },
      { domain: "money", entityType: "account", key: "business-operating", label: "Business Operating", data: { balance: 67800, institution: "Mercury" } },
    ],
  },
  {
    packId: "family-office",
    name: "Family Office Demo",
    description: "Multi-entity wealth management with household operations, trust structures, and generational planning",
    targetAudience: ["wealth_managers", "family_offices", "hnwi"],
    domains: ["investment", "money", "boardroom", "advisor", "approvals", "workspace"],
    narrativeArc: "Portfolio overview → Entity analysis → Tax optimization → Trust review → Generational plan → Advisor consultation",
    defaultLandingRoute: "/boardroom",
    supportedSurfaces: ["web_desktop", "web_tablet"],
    tourSteps: [
      { stepId: "overview", route: "/boardroom", title: "Family Dashboard", description: "Unified view across all family entities and trusts", durationSeconds: 45 },
      { stepId: "portfolio", route: "/investment/portfolio", title: "Investment Holdings", description: "Multi-account portfolio with asset allocation", durationSeconds: 40 },
      { stepId: "money", route: "/money/accounts", title: "Liquidity Management", description: "Cash positions, upcoming obligations, and flow projections", durationSeconds: 30 },
      { stepId: "advisor", route: "/assistant", title: "Wealth Advisor", description: "AI-powered wealth optimization recommendations", durationSeconds: 30 },
    ],
    entitySeeds: [
      { domain: "investment", entityType: "portfolio", key: "main-portfolio", label: "Main Family Portfolio", data: { totalValue: 4200000, accounts: 8 } },
      { domain: "money", entityType: "networth", key: "family-nw", label: "Family Net Worth", data: { total: 8500000, liquid: 1200000 } },
    ],
  },
  {
    packId: "business-growth",
    name: "Business Growth Demo",
    description: "SaaS founder scaling revenue with CRM, pipeline management, and operational intelligence",
    targetAudience: ["saas_founders", "sales_leaders", "operators"],
    domains: ["business", "workspace", "advisor", "approvals", "connectors"],
    narrativeArc: "Revenue dashboard → Pipeline management → Contact follow-ups → Connected services → Growth projections",
    defaultLandingRoute: "/business/dashboard",
    supportedSurfaces: ["web_desktop", "web_mobile", "web_tablet"],
    tourSteps: [
      { stepId: "revenue", route: "/business/dashboard", title: "Revenue Dashboard", description: "MRR, growth trends, and churn analysis", durationSeconds: 30 },
      { stepId: "pipeline", route: "/business/pipeline", title: "Deal Pipeline", description: "Active opportunities and weighted pipeline value", durationSeconds: 30 },
      { stepId: "contacts", route: "/business/contacts", title: "CRM Intelligence", description: "Contact timeline and relationship health", durationSeconds: 25 },
      { stepId: "connectors", route: "/connected-services", title: "Connected Services", description: "Integrated tools and data sources", durationSeconds: 20 },
    ],
    entitySeeds: [
      { domain: "business", entityType: "metric", key: "mrr", label: "Monthly Recurring Revenue", data: { value: 18500, growth: 8.1, trend: "accelerating" } },
      { domain: "business", entityType: "pipeline", key: "weighted", label: "Weighted Pipeline", data: { totalValue: 201000, weightedValue: 136500, dealCount: 3 } },
    ],
  },
  {
    packId: "connected-services",
    name: "Connected Services Demo",
    description: "Showcase of SITA's integration ecosystem with external services and data sources",
    targetAudience: ["technical_buyers", "integration_teams"],
    domains: ["connectors", "advisor", "workspace", "notifications"],
    narrativeArc: "Integration hub → Connector health → Data sync → Workflow automation → Notification routing",
    defaultLandingRoute: "/connected-services",
    supportedSurfaces: ["web_desktop"],
    tourSteps: [
      { stepId: "hub", route: "/connected-services", title: "Integration Hub", description: "All connected services and their health status", durationSeconds: 30 },
      { stepId: "health", route: "/admin/connectors", title: "Connector Health", description: "Sync freshness, error rates, and impacted workflows", durationSeconds: 30 },
      { stepId: "workflows", route: "/workspace", title: "Automated Workflows", description: "Cross-service workflows triggered by connectors", durationSeconds: 25 },
    ],
    entitySeeds: [
      { domain: "connectors", entityType: "connector", key: "slack", label: "Slack", data: { status: "healthy", lastSync: "2m ago" } },
      { domain: "connectors", entityType: "connector", key: "stripe", label: "Stripe", data: { status: "healthy", lastSync: "5m ago" } },
      { domain: "connectors", entityType: "connector", key: "github", label: "GitHub", data: { status: "degraded", lastSync: "15m ago" } },
    ],
  },
  {
    packId: "admin-operator",
    name: "Admin Operator Demo",
    description: "System operator walkthrough of SITA's internal control plane and governance systems",
    targetAudience: ["operators", "admins", "internal_team"],
    domains: ["admin", "ai_governance", "connectors", "security", "observability"],
    narrativeArc: "Mission Control → AI Team → Incidents → Connectors → Trust → Budget → Observability",
    defaultLandingRoute: "/admin/mission-control",
    supportedSurfaces: ["web_desktop"],
    tourSteps: [
      { stepId: "mission", route: "/admin/mission-control", title: "Mission Control", description: "System pulse, urgent items, and health score", durationSeconds: 30 },
      { stepId: "ai-team", route: "/admin/ai-workforce", title: "AI Team", description: "Internal agent registry and health", durationSeconds: 30 },
      { stepId: "truth", route: "/admin/truth-index", title: "Truth Index", description: "Runtime truth scores across all domains", durationSeconds: 25 },
      { stepId: "security", route: "/admin/security-posture", title: "Security Posture", description: "RLS coverage, audit trails, and compliance", durationSeconds: 25 },
    ],
    entitySeeds: [],
  },
];

/**
 * Get a scenario pack by ID
 */
export function getScenarioPack(packId: string): ScenarioPack | undefined {
  return SCENARIO_PACKS.find(p => p.packId === packId);
}

/**
 * Get packs suitable for a given audience
 */
export function getPacksForAudience(audience: string): ScenarioPack[] {
  return SCENARIO_PACKS.filter(p => p.targetAudience.includes(audience));
}

/**
 * Get all available scenario pack IDs
 */
export function listScenarioPackIds(): string[] {
  return SCENARIO_PACKS.map(p => p.packId);
}
