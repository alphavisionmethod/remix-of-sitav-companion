// ═══════════════════════════════════════════════════════════════
// SITA Delivery OS — Feature Factory / Generation Pipeline
// Auto-generates canonical artifacts from a blueprint
// ═══════════════════════════════════════════════════════════════

export interface FeatureBlueprint {
  featureId: string;
  title: string;
  domain: string;
  archetypeKey: string;
  userIntent: string;
  persistenceClass: "ephemeral" | "operational" | "durable" | "compliance-sensitive";
  contractClass: "none" | "standard" | "strict" | "critical";
  interactionCriticality: "low" | "medium" | "high" | "critical";
  journeyCriticality: "low" | "medium" | "high" | "critical";
  trustNeeds: "none" | "standard" | "high" | "critical";
  aiComputeClass: "none" | "light" | "standard" | "deep";
  launchCriticality: "nice-to-have" | "standard" | "important" | "critical";
  realityTarget: "presentational" | "simulated" | "persisted" | "proven";
}

export interface GeneratedArtifacts {
  featureId: string;
  domain: string;
  routePlan: { path: string; shell: string; lazy: boolean };
  contractStubs: string[];
  schemaNeeds: string[];
  serviceModules: string[];
  interactionRegistryEntry: { featureId: string; domain: string; criticalCTAs: string[]; journeySteps: string[] };
  journeyManifestStarter: { journeyId: string; steps: string[]; verificationPoints: string[] };
  testsStarter: string[];
  runtimeProbeStarter: string[];
  readinessChecklist: Array<{ item: string; required: boolean; status: "pending" }>;
  ownershipDeclaration: { domain: string; team: string; featureId: string };
  generatedAt: string;
}

const ARCHETYPE_DEFAULTS: Record<string, Partial<GeneratedArtifacts>> = {
  boardroom: {
    contractStubs: ["synthesis-contract", "advisor-panel-contract", "intelligence-overlay-contract"],
    serviceModules: ["synthesis-service", "advisor-service"],
    testsStarter: ["renders-synthesis", "advisor-interaction", "intelligence-overlay-loads"],
  },
  office: {
    contractStubs: ["workspace-contract", "panel-registry-contract", "action-center-contract"],
    serviceModules: ["workspace-service", "panel-service", "action-service"],
    testsStarter: ["renders-workspace", "panels-load", "actions-dispatch"],
  },
  workflow: {
    contractStubs: ["workflow-definition-contract", "approval-contract", "state-transition-contract"],
    serviceModules: ["workflow-engine", "approval-service", "transition-service"],
    testsStarter: ["workflow-starts", "transitions-correctly", "approval-gates-work"],
  },
  dashboard: {
    contractStubs: ["kpi-contract", "chart-data-contract"],
    serviceModules: ["kpi-service", "chart-service"],
    testsStarter: ["renders-kpis", "charts-load"],
  },
  crud: {
    contractStubs: ["entity-contract", "validation-contract"],
    serviceModules: ["entity-service", "validation-service"],
    testsStarter: ["creates-entity", "reads-entity", "updates-entity", "deletes-entity"],
  },
  "connector-flow": {
    contractStubs: ["connector-auth-contract", "sync-contract", "health-contract"],
    serviceModules: ["connector-auth-service", "sync-service", "health-monitor"],
    testsStarter: ["auth-flow-works", "sync-runs", "health-reports"],
  },
  intelligence: {
    contractStubs: ["analysis-contract", "confidence-contract", "evidence-contract"],
    serviceModules: ["analysis-engine", "confidence-service", "evidence-service"],
    testsStarter: ["analysis-runs", "confidence-displays", "evidence-links"],
  },
};

export function generateFeatureArtifacts(blueprint: FeatureBlueprint): GeneratedArtifacts {
  const defaults = ARCHETYPE_DEFAULTS[blueprint.archetypeKey] ?? {};
  const routePath = `/${blueprint.domain}/${blueprint.featureId}`;
  const shell = blueprint.archetypeKey === "boardroom" ? "boardroom-shell"
    : blueprint.archetypeKey === "office" ? "office-shell"
    : blueprint.archetypeKey === "admin-control" ? "admin-shell"
    : "default-shell";

  const readinessChecklist = [
    { item: "Blueprint approved", required: true, status: "pending" as const },
    { item: "Contracts defined", required: blueprint.contractClass !== "none", status: "pending" as const },
    { item: "Schema migration created", required: blueprint.persistenceClass !== "ephemeral", status: "pending" as const },
    { item: "Route registered", required: true, status: "pending" as const },
    { item: "Interactions registered", required: blueprint.interactionCriticality !== "low", status: "pending" as const },
    { item: "Journey tests written", required: blueprint.journeyCriticality !== "low", status: "pending" as const },
    { item: "Runtime probes configured", required: blueprint.launchCriticality !== "nice-to-have", status: "pending" as const },
    { item: "Trust/proof semantics wired", required: blueprint.trustNeeds !== "none", status: "pending" as const },
    { item: "AI compute budget allocated", required: blueprint.aiComputeClass !== "none", status: "pending" as const },
    { item: "Owner signoff", required: true, status: "pending" as const },
  ].filter(c => c.required);

  return {
    featureId: blueprint.featureId,
    domain: blueprint.domain,
    routePlan: { path: routePath, shell, lazy: true },
    contractStubs: defaults.contractStubs ?? [`${blueprint.featureId}-contract`],
    schemaNeeds: blueprint.persistenceClass === "ephemeral" ? [] : [`${blueprint.featureId}_records`],
    serviceModules: defaults.serviceModules ?? [`${blueprint.featureId}-service`],
    interactionRegistryEntry: {
      featureId: blueprint.featureId,
      domain: blueprint.domain,
      criticalCTAs: [],
      journeySteps: [],
    },
    journeyManifestStarter: {
      journeyId: `${blueprint.featureId}-journey`,
      steps: ["load", "interact", "verify"],
      verificationPoints: ["renders", "persists", "survives-refresh"],
    },
    testsStarter: defaults.testsStarter ?? [`${blueprint.featureId}-renders`],
    runtimeProbeStarter: blueprint.launchCriticality === "nice-to-have" ? [] : [`probe-${blueprint.featureId}-health`],
    readinessChecklist,
    ownershipDeclaration: { domain: blueprint.domain, team: blueprint.domain, featureId: blueprint.featureId },
    generatedAt: new Date().toISOString(),
  };
}

export function classifyFeatureDomain(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  const domainKeywords: Record<string, string[]> = {
    finance: ["money", "payment", "invoice", "budget", "bill", "account", "transaction", "capital"],
    revenue: ["revenue", "lead", "deal", "pipeline", "opportunity", "conversion", "acquisition"],
    "digital-presence": ["website", "brand", "content", "seo", "social", "presence", "page"],
    "ai-engineering": ["agent", "model", "ai", "compute", "token", "intelligence", "learning"],
    admin: ["admin", "control", "governance", "policy", "audit", "compliance", "system"],
    trust: ["trust", "proof", "receipt", "evidence", "verification", "attestation"],
    connector: ["connector", "integration", "sync", "api", "webhook", "import", "export"],
  };
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(k => text.includes(k))) return domain;
  }
  return "general";
}
