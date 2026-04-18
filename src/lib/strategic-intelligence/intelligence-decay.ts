// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Decay Monitor
// Detects stale, degraded, and invalid intelligence assets.
// ═══════════════════════════════════════════════════════════════

export type DecayType =
  | "stale_asset"
  | "rising_false_positive"
  | "outdated_template"
  | "degraded_recommendation"
  | "invalid_assumption"
  | "reuse_downgrade";

export interface DecayAlert {
  alertId: string;
  decayType: DecayType;
  assetId: string;
  assetTitle: string;
  domain: string;
  severity: "low" | "medium" | "high" | "critical";
  detectedAt: string;
  metric: string;
  currentValue: number;
  threshold: number;
  recommendation: string;
  autoAction: "none" | "downgrade" | "invalidate" | "refresh" | "alert_operator";
}

export interface DecayMonitorConfig {
  freshnessThresholdMinutes: number;
  falsePositiveThreshold: number;
  acceptanceRateThreshold: number;
  qualityScoreThreshold: number;
  maxAssetAgeWithoutReuseDays: number;
}

export interface AssetHealthInput {
  assetId: string;
  title: string;
  domain: string;
  createdAt: string;
  lastUsedAt: string | null;
  freshnessTTLMinutes: number;
  falsePositiveRate: number;
  acceptanceRate: number;
  qualityScore: number;
  usageCount: number;
  status: string;
}

// ── Default Config ─────────────────────────────────────────

export const DEFAULT_DECAY_CONFIG: DecayMonitorConfig = {
  freshnessThresholdMinutes: 1440 * 7,  // 7 days
  falsePositiveThreshold: 15,
  acceptanceRateThreshold: 0.7,
  qualityScoreThreshold: 60,
  maxAssetAgeWithoutReuseDays: 14,
};

// ── Monitor ────────────────────────────────────────────────

export function monitorDecay(
  assets: AssetHealthInput[],
  config: DecayMonitorConfig = DEFAULT_DECAY_CONFIG,
): DecayAlert[] {
  const alerts: DecayAlert[] = [];
  const now = Date.now();

  for (const a of assets) {
    const ageMs = now - new Date(a.createdAt).getTime();
    const ageMinutes = ageMs / 60000;
    const ageDays = ageMs / 86400000;

    // Stale asset
    if (ageMinutes > a.freshnessTTLMinutes) {
      alerts.push({
        alertId: `decay-${a.assetId}-stale`,
        decayType: "stale_asset", assetId: a.assetId, assetTitle: a.title, domain: a.domain,
        severity: ageMinutes > a.freshnessTTLMinutes * 2 ? "high" : "medium",
        detectedAt: new Date().toISOString(),
        metric: "age_vs_ttl", currentValue: Math.round(ageMinutes), threshold: a.freshnessTTLMinutes,
        recommendation: "Refresh or invalidate asset",
        autoAction: ageMinutes > a.freshnessTTLMinutes * 3 ? "invalidate" : "downgrade",
      });
    }

    // Rising false positive
    if (a.falsePositiveRate > config.falsePositiveThreshold) {
      alerts.push({
        alertId: `decay-${a.assetId}-fp`,
        decayType: "rising_false_positive", assetId: a.assetId, assetTitle: a.title, domain: a.domain,
        severity: a.falsePositiveRate > 25 ? "high" : "medium",
        detectedAt: new Date().toISOString(),
        metric: "false_positive_rate", currentValue: a.falsePositiveRate, threshold: config.falsePositiveThreshold,
        recommendation: "Retrain pattern or adjust thresholds",
        autoAction: a.falsePositiveRate > 30 ? "downgrade" : "alert_operator",
      });
    }

    // Degraded acceptance
    if (a.acceptanceRate < config.acceptanceRateThreshold && a.usageCount > 5) {
      alerts.push({
        alertId: `decay-${a.assetId}-accept`,
        decayType: "degraded_recommendation", assetId: a.assetId, assetTitle: a.title, domain: a.domain,
        severity: a.acceptanceRate < 0.5 ? "high" : "medium",
        detectedAt: new Date().toISOString(),
        metric: "acceptance_rate", currentValue: Math.round(a.acceptanceRate * 100), threshold: Math.round(config.acceptanceRateThreshold * 100),
        recommendation: "Review and regenerate recommendation logic",
        autoAction: "alert_operator",
      });
    }

    // Quality degradation
    if (a.qualityScore < config.qualityScoreThreshold) {
      alerts.push({
        alertId: `decay-${a.assetId}-quality`,
        decayType: "reuse_downgrade", assetId: a.assetId, assetTitle: a.title, domain: a.domain,
        severity: a.qualityScore < 40 ? "critical" : "medium",
        detectedAt: new Date().toISOString(),
        metric: "quality_score", currentValue: a.qualityScore, threshold: config.qualityScoreThreshold,
        recommendation: "Downgrade reuse eligibility",
        autoAction: a.qualityScore < 40 ? "invalidate" : "downgrade",
      });
    }

    // Unused asset
    if (!a.lastUsedAt && ageDays > config.maxAssetAgeWithoutReuseDays) {
      alerts.push({
        alertId: `decay-${a.assetId}-unused`,
        decayType: "outdated_template", assetId: a.assetId, assetTitle: a.title, domain: a.domain,
        severity: "low",
        detectedAt: new Date().toISOString(),
        metric: "days_without_reuse", currentValue: Math.round(ageDays), threshold: config.maxAssetAgeWithoutReuseDays,
        recommendation: "Archive or remove unused asset",
        autoAction: "none",
      });
    }
  }

  return alerts.sort((a, b) => {
    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (sevOrder[a.severity] || 3) - (sevOrder[b.severity] || 3);
  });
}
