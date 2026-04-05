// ═══════════════════════════════════════════════════════════════
// SITA OS — Cost-to-Confidence Curve Engine
// Maps confidence achieved vs cost/latency for reasoning paths.
// ═══════════════════════════════════════════════════════════════

export interface ConfidenceDataPoint {
  costCents: number;
  latencyMs: number;
  confidence: number;
  modelTier: string;
  taskType: string;
  domain: string;
}

export interface CostToConfidenceCurve {
  curveId: string;
  taskType: string;
  domain: string;
  dataPoints: ConfidenceDataPoint[];
  diminishingReturnsPoint: ConfidenceDataPoint | null;
  idealStoppingPoint: ConfidenceDataPoint | null;
  maxAchievableConfidence: number;
  costForMaxConfidence: number;
  marginalCostPerConfidencePoint: number;
  recommendation: CurveRecommendation;
}

export type CurveRecommendation =
  | "well_optimized"
  | "overspending"
  | "underspending"
  | "diminishing_returns"
  | "consider_escalation"
  | "reuse_available";

export interface CurveAnalysis {
  taskType: string;
  domain: string;
  currentCost: number;
  currentConfidence: number;
  optimalCost: number;
  optimalConfidence: number;
  savings: number;
  additionalComputeWouldHelp: boolean;
  reason: string;
}

// ── Curve Computation ──────────────────────────────────────

export function computeCostToConfidenceCurve(
  dataPoints: ConfidenceDataPoint[],
  taskType: string,
  domain: string,
): CostToConfidenceCurve {
  const sorted = [...dataPoints].sort((a, b) => a.costCents - b.costCents);
  if (sorted.length === 0) {
    return {
      curveId: `ctc-${Date.now()}`,
      taskType, domain, dataPoints: [],
      diminishingReturnsPoint: null,
      idealStoppingPoint: null,
      maxAchievableConfidence: 0,
      costForMaxConfidence: 0,
      marginalCostPerConfidencePoint: 0,
      recommendation: "underspending",
    };
  }

  // Find diminishing returns: where marginal confidence gain < 0.5 per cent spent
  let diminishingPoint: ConfidenceDataPoint | null = null;
  let idealPoint: ConfidenceDataPoint | null = null;

  for (let i = 1; i < sorted.length; i++) {
    const costDelta = sorted[i].costCents - sorted[i - 1].costCents;
    const confDelta = sorted[i].confidence - sorted[i - 1].confidence;
    const marginalGain = costDelta > 0 ? confDelta / costDelta : 0;

    if (marginalGain < 0.5 && !diminishingPoint) {
      diminishingPoint = sorted[i - 1];
    }
    if (sorted[i].confidence >= 85 && !idealPoint) {
      idealPoint = sorted[i];
    }
  }

  const maxConf = sorted[sorted.length - 1];
  const totalCostDelta = maxConf.costCents - sorted[0].costCents;
  const totalConfDelta = maxConf.confidence - sorted[0].confidence;
  const marginal = totalConfDelta > 0 ? totalCostDelta / totalConfDelta : 0;

  const current = sorted[sorted.length - 1];
  let recommendation: CurveRecommendation = "well_optimized";
  if (diminishingPoint && current.costCents > diminishingPoint.costCents * 1.5) {
    recommendation = "overspending";
  } else if (current.confidence < 70) {
    recommendation = "underspending";
  } else if (diminishingPoint) {
    recommendation = "diminishing_returns";
  }

  return {
    curveId: `ctc-${Date.now()}`,
    taskType, domain,
    dataPoints: sorted,
    diminishingReturnsPoint: diminishingPoint,
    idealStoppingPoint: idealPoint || diminishingPoint,
    maxAchievableConfidence: maxConf.confidence,
    costForMaxConfidence: maxConf.costCents,
    marginalCostPerConfidencePoint: Math.round(marginal * 100) / 100,
    recommendation,
  };
}

export function analyzeCurve(curve: CostToConfidenceCurve): CurveAnalysis {
  const ideal = curve.idealStoppingPoint || curve.diminishingReturnsPoint;
  const current = curve.dataPoints[curve.dataPoints.length - 1];

  if (!current || !ideal) {
    return {
      taskType: curve.taskType, domain: curve.domain,
      currentCost: 0, currentConfidence: 0, optimalCost: 0, optimalConfidence: 0,
      savings: 0, additionalComputeWouldHelp: true,
      reason: "Insufficient data to analyze curve",
    };
  }

  return {
    taskType: curve.taskType,
    domain: curve.domain,
    currentCost: current.costCents,
    currentConfidence: current.confidence,
    optimalCost: ideal.costCents,
    optimalConfidence: ideal.confidence,
    savings: Math.max(0, current.costCents - ideal.costCents),
    additionalComputeWouldHelp: current.confidence < 80 && curve.recommendation !== "overspending",
    reason: curve.recommendation === "overspending"
      ? `Spending ${current.costCents}¢ but optimal is ${ideal.costCents}¢ for ${ideal.confidence}% confidence`
      : curve.recommendation === "underspending"
      ? `Only ${current.confidence}% confidence — consider escalation`
      : `Well-optimized at ${current.confidence}% confidence for ${current.costCents}¢`,
  };
}
