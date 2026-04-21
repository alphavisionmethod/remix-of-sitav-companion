// ═══════════════════════════════════════════════════════════════
// SITA OS — Stale Artifact Invalidation
// Semantic invalidation rules for generated artifacts
// ═══════════════════════════════════════════════════════════════

export type InvalidationCategory =
  | "schema-change"
  | "route-change"
  | "workflow-change"
  | "migration-change"
  | "runtime-change"
  | "release-change"
  | "policy-change"
  | "time-expiry"
  | "validator-failure"
  | "ownership-change";

export type InvalidationState = "valid" | "stale" | "invalid" | "acknowledged-stale";

export interface InvalidationRule {
  readonly ruleId: string;
  readonly artifactPattern: string;
  readonly category: InvalidationCategory;
  readonly triggerPaths: readonly string[];
  readonly maxAgeHours: number;
  readonly description: string;
}

export interface ArtifactInvalidationState {
  readonly artifactPath: string;
  readonly state: InvalidationState;
  readonly matchedRules: readonly string[];
  readonly lastModified: string;
  readonly ageHours: number;
  readonly acknowledged: boolean;
}

/** Semantic invalidation rules extending time-based staleness */
export const INVALIDATION_RULES: readonly InvalidationRule[] = [
  // Schema changes invalidate DB-dependent artifacts
  {
    ruleId: "INV-001",
    artifactPattern: "generated/ai-*-report.json",
    category: "schema-change",
    triggerPaths: ["supabase/migrations/**"],
    maxAgeHours: 168,
    description: "AI runtime reports become stale when migrations change AI tables",
  },
  {
    ruleId: "INV-002",
    artifactPattern: "generated/connector-*-report.json",
    category: "schema-change",
    triggerPaths: ["supabase/migrations/**"],
    maxAgeHours: 168,
    description: "Connector reports become stale when migrations change connector tables",
  },
  // Route changes invalidate frontend artifacts
  {
    ruleId: "INV-003",
    artifactPattern: "generated/route-*-report.json",
    category: "route-change",
    triggerPaths: ["src/routes/**", "src/App.tsx"],
    maxAgeHours: 24,
    description: "Route reports become stale when routing config changes",
  },
  {
    ruleId: "INV-004",
    artifactPattern: "generated/no-shell-only-production-pages-report.json",
    category: "route-change",
    triggerPaths: ["src/pages/**", "src/routes/**"],
    maxAgeHours: 24,
    description: "Dead page report stales when pages are added or removed",
  },
  // Policy changes invalidate trust artifacts
  {
    ruleId: "INV-005",
    artifactPattern: "generated/oauth-security-closure-report.json",
    category: "policy-change",
    triggerPaths: ["src/lib/integrations/oauth-security-closure.ts", "src/lib/truth/**"],
    maxAgeHours: 336,
    description: "OAuth security report stales when security policy changes",
  },
  // Runtime changes invalidate behavioral artifacts
  {
    ruleId: "INV-006",
    artifactPattern: "generated/advisor-boardroom-proof/**",
    category: "runtime-change",
    triggerPaths: ["src/lib/advisors/**", "src/lib/boardroom/**"],
    maxAgeHours: 336,
    description: "Advisor proof bundle stales when advisor runtime changes",
  },
  // Release workflow changes
  {
    ruleId: "INV-007",
    artifactPattern: "generated/os-release-readiness-report.json",
    category: "release-change",
    triggerPaths: ["scripts/architecture/checks/check-os-release-readiness.ts"],
    maxAgeHours: 168,
    description: "Release readiness report stales when aggregator logic changes",
  },
  // Truth governance self-invalidation
  {
    ruleId: "INV-008",
    artifactPattern: "generated/truth-governance-report.json",
    category: "policy-change",
    triggerPaths: ["src/lib/truth/**"],
    maxAgeHours: 168,
    description: "Truth governance report stales when truth policies change",
  },
  // Component canonicalization
  {
    ruleId: "INV-009",
    artifactPattern: "generated/component-canonicalization-report.json",
    category: "runtime-change",
    triggerPaths: ["src/components/**"],
    maxAgeHours: 168,
    description: "Component report stales when components are added or modified",
  },
  // App platform
  {
    ruleId: "INV-010",
    artifactPattern: "generated/app-*-report.json",
    category: "runtime-change",
    triggerPaths: ["src/lib/app-platform/**"],
    maxAgeHours: 336,
    description: "App platform reports stale when app lifecycle changes",
  },
] as const;

export function getRulesForArtifact(artifactPath: string): readonly InvalidationRule[] {
  return INVALIDATION_RULES.filter(r => {
    const pattern = r.artifactPattern.replace(/\*/g, ".*");
    return new RegExp(`^${pattern}$`).test(artifactPath);
  });
}

export function getRulesForCategory(category: InvalidationCategory): readonly InvalidationRule[] {
  return INVALIDATION_RULES.filter(r => r.category === category);
}