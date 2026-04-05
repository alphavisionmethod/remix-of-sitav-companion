import type { InternalAgentDefinition } from "../types";

// Re-export canonical agents from lib
export { PRODUCT_BUILD_AGENTS } from "@/lib/internal-agents/agents/product-build";

/**
 * Product Build Council — Contract-Level Extension
 */
export interface FeatureReadinessGate {
  featureId: string;
  gates: {
    contractsDefined: boolean;
    typesCompile: boolean;
    rlsPolicies: boolean;
    mockDataExists: boolean;
    supabaseWired: boolean;
    uiComponentExists: boolean;
    accessibilityPassed: boolean;
    errorStatesHandled: boolean;
    proofEmission: boolean;
    testCoverage: number;
  };
  overallReady: boolean;
  blockers: string[];
  evaluatedAt: string;
}

export interface UXConsistencyScore {
  surfaceId: string;
  scores: {
    designTokenUsage: number;
    componentReuse: number;
    interactionConsistency: number;
    loadingStateQuality: number;
    emptyStateQuality: number;
    errorStateQuality: number;
    accessibilityScore: number;
    responsiveQuality: number;
  };
  overallScore: number;
  issues: Array<{ type: string; description: string; severity: string; file: string }>;
  evaluatedAt: string;
}

export interface BuildQualityReport {
  buildId: string;
  timestamp: string;
  typeErrors: number;
  lintWarnings: number;
  bundleSizeKB: number;
  testsPassed: number;
  testsFailed: number;
  coveragePercent: number;
  overallGrade: "A" | "B" | "C" | "D" | "F";
}

export interface ReleaseCandidate {
  id: string;
  version: string;
  features: string[];
  qualityReport: BuildQualityReport;
  readinessGates: FeatureReadinessGate[];
  status: "draft" | "testing" | "approved" | "released" | "rolled-back";
  releaseNotes: string;
}
