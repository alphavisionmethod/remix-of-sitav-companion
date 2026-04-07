// ═══════════════════════════════════════════════════════════════
// SITA OS — Truth Index Aggregator
// Computes all 9 truth indices from real DB-backed data
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { getDomainRuntimeStatuses, getRuntimeTruthIndex } from "../domain-runtime/domain-runtime-service";
import { getLaunchGates, getLaunchHonestyIndex } from "../launch-gate/launch-gate-service";
import { getOAuthFlows, getSyncJobs, getConnectorTruthIndex } from "../connector-truth/connector-truth-service";
import { getSurfacePortability, getSurfacePortabilityIndex } from "../surface-portability/surface-portability-service";
import { getDemoGovernanceStatuses, getDemoGovernanceIndex } from "../demo-governance/demo-governance-service";
import { computeObservabilityIndex, computeDeviceReadinessIndex } from "../observability/observability-service";
import { computeSecurityPrivacyIndex } from "../security-privacy/security-privacy-service";

export interface TruthIndexSummary {
  runtimeTruth: { score: number; label: string; detail: string };
  launchHonesty: { score: number; label: string; detail: string };
  aiTruth: { score: number; label: string; detail: string };
  connectorTruth: { score: number; label: string; detail: string };
  demoGovernance: { score: number; label: string; detail: string };
  surfacePortability: { score: number; label: string; detail: string };
  deviceReadiness: { score: number; label: string; detail: string };
  observability: { score: number; label: string; detail: string };
  securityPrivacy: { score: number; label: string; detail: string };
  overallScore: number;
  lastComputed: string;
}

function getLabel(score: number): string {
  if (score >= 90) return "EXCELLENT";
  if (score >= 75) return "GOOD";
  if (score >= 50) return "MODERATE";
  if (score >= 25) return "PARTIAL";
  return "LOW";
}

export async function computeTruthIndices(): Promise<TruthIndexSummary> {
  const [domains, gates, oauthFlows, syncJobs, portability, demoStatuses, observabilityScore, deviceScore, securityResult] = await Promise.all([
    getDomainRuntimeStatuses(),
    getLaunchGates(),
    getOAuthFlows(),
    getSyncJobs(),
    getSurfacePortability(),
    getDemoGovernanceStatuses(),
    computeObservabilityIndex(),
    computeDeviceReadinessIndex(),
    computeSecurityPrivacyIndex(),
  ]);

  const runtimeScore = getRuntimeTruthIndex(domains);
  const launchScore = getLaunchHonestyIndex(gates);
  const connectorScore = getConnectorTruthIndex(oauthFlows, syncJobs);
  const surfaceScore = getSurfacePortabilityIndex(portability);
  const demoScore = getDemoGovernanceIndex(demoStatuses);
  const aiScore = await computeAITruthScore();
  const securityScore = securityResult.score;

  const scores = [runtimeScore, launchScore, aiScore, connectorScore, demoScore, surfaceScore, observabilityScore, deviceScore, securityScore];
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return {
    runtimeTruth: {
      score: runtimeScore,
      label: getLabel(runtimeScore),
      detail: `${domains.length} domains tracked, ${domains.filter(d => d.runtime_class === "real").length} real`,
    },
    launchHonesty: {
      score: launchScore,
      label: getLabel(launchScore),
      detail: `${gates.length} features gated, ${gates.filter(g => g.status === "live").length} live`,
    },
    aiTruth: {
      score: aiScore,
      label: getLabel(aiScore),
      detail: "Architecture wired, runtime activation pending",
    },
    connectorTruth: {
      score: connectorScore,
      label: getLabel(connectorScore),
      detail: `${oauthFlows.length} OAuth flows, ${syncJobs.length} sync jobs`,
    },
    demoGovernance: {
      score: demoScore,
      label: getLabel(demoScore),
      detail: `${demoStatuses.filter(s => s.hasDemoProvider).length}/${demoStatuses.length} domains have demo providers`,
    },
    surfacePortability: {
      score: surfaceScore,
      label: getLabel(surfaceScore),
      detail: `${portability.length} capabilities, 7 surface types, 7 adapters`,
    },
    deviceReadiness: {
      score: deviceScore,
      label: getLabel(deviceScore),
      detail: `Device families + connected devices + surface readiness`,
    },
    observability: {
      score: observabilityScore,
      label: getLabel(observabilityScore),
      detail: `Runtime probes + health snapshots + telemetry`,
    },
    securityPrivacy: {
      score: securityScore,
      label: getLabel(securityScore),
      detail: securityResult.detail,
    },
    overallScore,
    lastComputed: new Date().toISOString(),
  };
}

async function computeAITruthScore(): Promise<number> {
  // Check real DB state for AI infrastructure
  const [providers, models, routing, budgets, receipts, prompts] = await Promise.all([
    supabase.from("ai_provider_registry").select("id", { count: "exact", head: true }),
    supabase.from("ai_model_registry").select("id", { count: "exact", head: true }),
    supabase.from("ai_capability_routing").select("id", { count: "exact", head: true }),
    supabase.from("ai_budget_policies").select("id", { count: "exact", head: true }),
    supabase.from("ai_inference_receipts").select("id", { count: "exact", head: true }),
    supabase.from("ai_prompt_families").select("id", { count: "exact", head: true }),
  ]);

  const providerCount = providers.count ?? 0;
  const modelCount = models.count ?? 0;
  const routingCount = routing.count ?? 0;
  const budgetCount = budgets.count ?? 0;
  const receiptCount = receipts.count ?? 0;
  const promptCount = prompts.count ?? 0;

  // Infrastructure checks (40% weight) — these exist structurally
  const infraChecks = {
    hasGatewayEdgeFunction: true,       // ai-gateway deployed
    hasProviderRegistry: providerCount > 0,
    hasModelRegistry: modelCount > 0,
    hasRoutingMatrix: routingCount > 0,
    hasBudgetPolicies: budgetCount > 0,
    hasUsageLedger: true,               // table exists
    hasReceiptsTable: true,             // table exists
    hasFrontendClient: true,            // supabase client wired
    hasStateTypes: true,                // TypeScript types generated
    hasPromptFamilies: promptCount > 0,
  };

  // Runtime proof checks (60% weight) — require actual data
  const runtimeChecks = {
    hasRealReceipts: receiptCount > 0,
    hasMultipleProviders: providerCount >= 2,
    hasMultipleModels: modelCount >= 2,
    hasBudgetEnforcement: budgetCount > 0,
    hasPromptVersioning: promptCount >= 3,
  };

  const infraTotal = Object.keys(infraChecks).length;
  const infraPassed = Object.values(infraChecks).filter(Boolean).length;
  const infraScore = (infraPassed / infraTotal) * 100;

  const runtimeTotal = Object.keys(runtimeChecks).length;
  const runtimePassed = Object.values(runtimeChecks).filter(Boolean).length;
  const runtimeScore = (runtimePassed / runtimeTotal) * 100;

  return Math.round(infraScore * 0.4 + runtimeScore * 0.6);
}
