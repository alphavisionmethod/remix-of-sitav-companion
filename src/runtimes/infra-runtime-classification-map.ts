// ═══════════════════════════════════════════════════════════════
// SITA OS — Infra Runtime Classification Map
// Maps infra docs → runtime tier → code → tests → admin pages
// ═══════════════════════════════════════════════════════════════

import { INFRA_DOC_CLASSIFICATIONS, type InfraDocClassification, type RealityTier } from "./reality-classification-registry";

export interface RuntimeClassificationSummary {
  tier: RealityTier;
  docCount: number;
  docs: string[];
  avgCoverage: number;
  totalCodePaths: number;
  totalTests: number;
  totalAdminPages: number;
}

/** Build summary by reality tier */
export function buildRuntimeClassificationSummary(): RuntimeClassificationSummary[] {
  const tiers: RealityTier[] = ["production-backed", "prototype", "simulated", "spec-only", "partially-implemented", "experimental"];

  return tiers.map((tier) => {
    const docs = INFRA_DOC_CLASSIFICATIONS.filter((d) => d.realityTier === tier);
    return {
      tier,
      docCount: docs.length,
      docs: docs.map((d) => d.docName),
      avgCoverage: docs.length > 0 ? Math.round(docs.reduce((s, d) => s + d.implementationCoverage, 0) / docs.length) : 0,
      totalCodePaths: docs.reduce((s, d) => s + d.relatedCodePaths.length, 0),
      totalTests: docs.reduce((s, d) => s + d.relatedTests.length, 0),
      totalAdminPages: docs.reduce((s, d) => s + d.relatedAdminPages.length, 0),
    };
  }).filter((s) => s.docCount > 0);
}

/** Get full linkage map for a specific doc */
export function getDocLinkage(docPath: string): InfraDocClassification | undefined {
  return INFRA_DOC_CLASSIFICATIONS.find((d) => d.docPath === docPath);
}

/** Get docs that claim production readiness */
export function getProductionReadyDocs(): InfraDocClassification[] {
  return INFRA_DOC_CLASSIFICATIONS.filter((d) => d.productionReady);
}

/** Get docs with no code backing (spec-only risk) */
export function getUnbackedDocs(): InfraDocClassification[] {
  return INFRA_DOC_CLASSIFICATIONS.filter((d) => d.relatedCodePaths.length === 0);
}
