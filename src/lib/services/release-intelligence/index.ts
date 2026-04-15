// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Intelligence Service
// Compatibility matrix, regression fingerprints, rollback FSM,
// and release readiness scoring.
// ═══════════════════════════════════════════════════════════════

export interface CompatibilityEntry {
  component: string;
  version: string;
  compatible_with: Array<{ component: string; min_version: string; max_version: string }>;
  breaking_changes: string[];
  deprecations: string[];
  tested_at: string;
}

export interface RegressionFingerprint {
  id: string;
  test_suite: string;
  failure_signature: string;
  first_seen_version: string;
  last_seen_version: string;
  affected_components: string[];
  auto_resolved: boolean;
  resolution_version?: string;
}

export type ReleaseState =
  | "draft"
  | "candidate"
  | "testing"
  | "staging"
  | "canary"
  | "rolling_out"
  | "released"
  | "hotfix_needed"
  | "rolling_back"
  | "rolled_back"
  | "deprecated";

export interface ReleaseReadinessScore {
  release_id: string;
  overall_score: number;
  dimensions: {
    test_coverage: number;
    compatibility_pass: number;
    regression_free: number;
    security_scan_pass: number;
    performance_baseline: number;
    documentation_ready: number;
    rollback_tested: number;
  };
  blockers: string[];
  warnings: string[];
  scored_at: string;
}

export const RELEASE_STATE_TRANSITIONS: Record<ReleaseState, ReleaseState[]> = {
  draft: ["candidate"],
  candidate: ["testing", "draft"],
  testing: ["staging", "draft"],
  staging: ["canary", "draft"],
  canary: ["rolling_out", "rolling_back"],
  rolling_out: ["released", "rolling_back"],
  released: ["hotfix_needed", "deprecated"],
  hotfix_needed: ["candidate"],
  rolling_back: ["rolled_back"],
  rolled_back: ["candidate"],
  deprecated: [],
};

export class ReleaseIntelligenceService {
  private compatibilityMatrix: Map<string, CompatibilityEntry> = new Map();
  private regressions: Map<string, RegressionFingerprint> = new Map();

  checkCompatibility(component: string, version: string, targets: Array<{ component: string; version: string }>): { compatible: boolean; issues: string[] } {
    const entry = this.compatibilityMatrix.get(`${component}@${version}`);
    if (!entry) return { compatible: false, issues: ["No compatibility data found"] };

    const issues: string[] = [];
    for (const target of targets) {
      const rule = entry.compatible_with.find(c => c.component === target.component);
      if (!rule) {
        issues.push(`No compatibility rule for ${target.component}`);
      } else if (target.version < rule.min_version || target.version > rule.max_version) {
        issues.push(`${target.component}@${target.version} outside range ${rule.min_version}-${rule.max_version}`);
      }
    }
    return { compatible: issues.length === 0, issues };
  }

  scoreReadiness(releaseId: string, dimensions: ReleaseReadinessScore["dimensions"]): ReleaseReadinessScore {
    const values = Object.values(dimensions);
    const overall = values.reduce((sum, v) => sum + v, 0) / values.length;
    const blockers = Object.entries(dimensions)
      .filter(([, v]) => v < 0.5)
      .map(([k]) => `${k} below threshold (${dimensions[k as keyof typeof dimensions]})`);
    const warnings = Object.entries(dimensions)
      .filter(([, v]) => v >= 0.5 && v < 0.8)
      .map(([k]) => `${k} marginal (${dimensions[k as keyof typeof dimensions]})`);

    return {
      release_id: releaseId,
      overall_score: Math.round(overall * 100) / 100,
      dimensions,
      blockers,
      warnings,
      scored_at: new Date().toISOString(),
    };
  }

  registerRegression(fingerprint: RegressionFingerprint): void {
    this.regressions.set(fingerprint.id, fingerprint);
  }

  getActiveRegressions(): RegressionFingerprint[] {
    return Array.from(this.regressions.values()).filter(r => !r.auto_resolved);
  }

  registerCompatibility(entry: CompatibilityEntry): void {
    this.compatibilityMatrix.set(`${entry.component}@${entry.version}`, entry);
  }
}

export const releaseIntelligence = new ReleaseIntelligenceService();
