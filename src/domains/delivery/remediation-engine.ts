// ═══════════════════════════════════════════════════════════════
// SITA Delivery OS — Autonomous Remediation Engine
// Auto-proposes exact fixes for detected platform gaps
// ═══════════════════════════════════════════════════════════════

export interface DetectedGap {
  targetType: "route" | "contract" | "interaction" | "proof" | "persistence" | "journey" | "probe" | "mock-import";
  targetId: string;
  gapType: string;
  description: string;
}

export interface RemediationSuggestion {
  targetType: string;
  targetId: string;
  gapType: string;
  gapDescription: string;
  suggestedAction: string;
  suggestedArtifacts: string[];
  priority: "low" | "medium" | "high" | "critical";
  autoFixable: boolean;
}

const REMEDIATION_RULES: Array<{
  gapType: string;
  action: (gap: DetectedGap) => Partial<RemediationSuggestion>;
}> = [
  {
    gapType: "missing-contract",
    action: (gap) => ({
      suggestedAction: `Create contract definition for ${gap.targetId}`,
      suggestedArtifacts: [`src/packages/contracts/domain-types/${gap.targetId}.ts`],
      priority: "high",
      autoFixable: true,
    }),
  },
  {
    gapType: "route-without-shell",
    action: (gap) => ({
      suggestedAction: `Assign shell layout to route ${gap.targetId}`,
      suggestedArtifacts: [`Update route config for ${gap.targetId}`],
      priority: "medium",
      autoFixable: true,
    }),
  },
  {
    gapType: "critical-cta-no-manifest",
    action: (gap) => ({
      suggestedAction: `Register interaction manifest for CTA ${gap.targetId}`,
      suggestedArtifacts: [`src/lib/interaction-manifests/${gap.targetId}.ts`],
      priority: "critical",
      autoFixable: false,
    }),
  },
  {
    gapType: "mock-import-in-production",
    action: (gap) => ({
      suggestedAction: `Replace mock import with real data source in ${gap.targetId}`,
      suggestedArtifacts: [`Remove import from src/lib/mock-data/`, `Wire to Supabase query`],
      priority: "critical",
      autoFixable: false,
    }),
  },
  {
    gapType: "no-runtime-evidence",
    action: (gap) => ({
      suggestedAction: `Add runtime probe for ${gap.targetId}`,
      suggestedArtifacts: [`src/lib/probes/${gap.targetId}-probe.ts`],
      priority: "high",
      autoFixable: true,
    }),
  },
  {
    gapType: "no-persistence",
    action: (gap) => ({
      suggestedAction: `Wire ${gap.targetId} to durable storage`,
      suggestedArtifacts: [`Create Supabase table`, `Wire persistence adapter`],
      priority: "high",
      autoFixable: false,
    }),
  },
  {
    gapType: "missing-journey-test",
    action: (gap) => ({
      suggestedAction: `Create journey verification test for ${gap.targetId}`,
      suggestedArtifacts: [`src/test/journeys/${gap.targetId}.test.ts`],
      priority: "medium",
      autoFixable: true,
    }),
  },
  {
    gapType: "readiness-mismatch",
    action: (gap) => ({
      suggestedAction: `Resolve readiness gap: ${gap.description}`,
      suggestedArtifacts: [],
      priority: "high",
      autoFixable: false,
    }),
  },
];

export function generateRemediation(gap: DetectedGap): RemediationSuggestion {
  const rule = REMEDIATION_RULES.find(r => r.gapType === gap.gapType);
  const overrides = rule ? rule.action(gap) : {};

  return {
    targetType: gap.targetType,
    targetId: gap.targetId,
    gapType: gap.gapType,
    gapDescription: gap.description,
    suggestedAction: overrides.suggestedAction ?? `Fix ${gap.gapType} for ${gap.targetId}`,
    suggestedArtifacts: overrides.suggestedArtifacts ?? [],
    priority: overrides.priority ?? "medium",
    autoFixable: overrides.autoFixable ?? false,
  };
}

export function batchRemediate(gaps: DetectedGap[]): RemediationSuggestion[] {
  return gaps.map(generateRemediation).sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });
}
