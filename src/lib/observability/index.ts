// ═══════════════════════════════════════════════════════════════
// SITA OS — Observability Barrel Export
// ═══════════════════════════════════════════════════════════════

export { logger, setMinLogLevel, setCorrelationId, getLogBuffer, clearLogBuffer } from "./structured-logger";
export type { LogLevel, LogEntry } from "./structured-logger";

export { recordAICost, getCostSummary, checkBudget } from "./cost-governance";
export type { CostRecord, CostSummary } from "./cost-governance";

export { probeSupabase, probeAuth, probeStorage, runAllProbes, getOverallHealth } from "./health-probes";
export type { ProbeResult } from "./health-probes";

// Telemetry
export { telemetry, type TelemetryEvent, type MetricName, type MetricWindow, getWindowStats, createMetricWindow, addSample } from "./telemetry-collector";

// Tracing
export { tracer, type TraceSpan, type TraceContext, type SpanEvent, generateTraceId, generateSpanId, toTraceparent, parseTraceparent } from "./distributed-tracing";

// SLO
export { SITA_SLOS, computeSLOStatus, computeErrorBudget, getErrorBudgetAlertSeverity, type SLODefinition, type SLOStatus, type AlertSeverity } from "./slo-tracking";

// Anomaly Detection
export { detectAnomaly, detectEWMAAnomaly, detectTrend, mean, standardDeviation, zScore, initEWMA, updateEWMA, type AnomalyDetection, type AnomalyConfig, type EWMAState, type TrendResult } from "./anomaly-detection";

// Health Index
export { computeHealthIndex, probeStatusToScore, scoreToGrade, scoreToStatus, checkPerformanceBudgets, classifyError, PERFORMANCE_BUDGETS, type CompositeHealthIndex, type SubsystemHealth, type HealthGrade, type HealthTrend, type PerformanceBudget, type BudgetViolation, type ClassifiedError, type ErrorCategory } from "./health-index";

// Hook
export { useObservability, type UseObservabilityReturn } from "./use-observability";
