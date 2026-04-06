// ═══════════════════════════════════════════════════════════════
// SITA OS — Anomaly Detection
// Statistical anomaly detection for metrics and patterns
// ═══════════════════════════════════════════════════════════════

export interface AnomalyDetection {
  readonly metric: string;
  readonly value: number;
  readonly expected: number;
  readonly deviation: number; // standard deviations from mean
  readonly isAnomaly: boolean;
  readonly severity: "low" | "medium" | "high" | "critical";
  readonly direction: "above" | "below";
  readonly detectedAt: number;
  readonly context?: string;
}

export interface AnomalyConfig {
  /** Number of standard deviations to trigger anomaly */
  readonly sensitivityThreshold: number;
  /** Minimum samples required for detection */
  readonly minSamples: number;
  /** Window size in milliseconds */
  readonly windowMs: number;
}

export const DEFAULT_ANOMALY_CONFIG: AnomalyConfig = {
  sensitivityThreshold: 2.5,
  minSamples: 10,
  windowMs: 300_000, // 5 minutes
};

// ── Statistical Functions ──────────────────────────────────

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

export function zScore(value: number, avg: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - avg) / stdDev;
}

// ── Anomaly Detector ──────────────────────────────────────

export function detectAnomaly(
  metric: string,
  value: number,
  historicalValues: number[],
  config: AnomalyConfig = DEFAULT_ANOMALY_CONFIG,
): AnomalyDetection | null {
  if (historicalValues.length < config.minSamples) return null;

  const avg = mean(historicalValues);
  const stdDev = standardDeviation(historicalValues);
  const z = zScore(value, avg, stdDev);
  const absZ = Math.abs(z);
  const isAnomaly = absZ >= config.sensitivityThreshold;

  if (!isAnomaly) return null;

  let severity: AnomalyDetection["severity"] = "low";
  if (absZ >= 4) severity = "critical";
  else if (absZ >= 3.5) severity = "high";
  else if (absZ >= 3) severity = "medium";

  return {
    metric,
    value,
    expected: avg,
    deviation: absZ,
    isAnomaly: true,
    severity,
    direction: z > 0 ? "above" : "below",
    detectedAt: Date.now(),
  };
}

// ── Moving Average Anomaly Detection ──────────────────────

export interface EWMAState {
  readonly average: number;
  readonly variance: number;
  readonly count: number;
}

export function initEWMA(): EWMAState {
  return { average: 0, variance: 0, count: 0 };
}

export function updateEWMA(state: EWMAState, value: number, alpha = 0.1): EWMAState {
  if (state.count === 0) {
    return { average: value, variance: 0, count: 1 };
  }

  const diff = value - state.average;
  const newAvg = state.average + alpha * diff;
  const newVar = (1 - alpha) * (state.variance + alpha * diff * diff);

  return { average: newAvg, variance: newVar, count: state.count + 1 };
}

export function detectEWMAAnomaly(
  metric: string,
  state: EWMAState,
  value: number,
  threshold = 2.5,
): AnomalyDetection | null {
  if (state.count < 10) return null;

  const stdDev = Math.sqrt(state.variance);
  const z = zScore(value, state.average, stdDev);
  const absZ = Math.abs(z);

  if (absZ < threshold) return null;

  let severity: AnomalyDetection["severity"] = "low";
  if (absZ >= 4) severity = "critical";
  else if (absZ >= 3.5) severity = "high";
  else if (absZ >= 3) severity = "medium";

  return {
    metric,
    value,
    expected: state.average,
    deviation: absZ,
    isAnomaly: true,
    severity,
    direction: z > 0 ? "above" : "below",
    detectedAt: Date.now(),
  };
}

// ── Pattern Detection ─────────────────────────────────────

export interface TrendResult {
  readonly direction: "up" | "down" | "flat";
  readonly slope: number;
  readonly confidence: number;
}

export function detectTrend(values: number[], minLength = 5): TrendResult {
  if (values.length < minLength) return { direction: "flat", slope: 0, confidence: 0 };

  // Simple linear regression
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avg = sumY / n;

  // Normalize slope relative to mean
  const normalizedSlope = avg !== 0 ? slope / avg : slope;

  // R² for confidence
  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const predicted = (sumY / n) + slope * (i - sumX / n);
    ssTot += Math.pow(values[i] - yMean, 2);
    ssRes += Math.pow(values[i] - predicted, 2);
  }
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  let direction: TrendResult["direction"] = "flat";
  if (Math.abs(normalizedSlope) > 0.01) {
    direction = normalizedSlope > 0 ? "up" : "down";
  }

  return { direction, slope: normalizedSlope, confidence: Math.max(0, r2) };
}
