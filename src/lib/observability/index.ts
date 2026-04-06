// ═══════════════════════════════════════════════════════════════
// SITA OS — Observability Barrel Export
// ═══════════════════════════════════════════════════════════════

export { logger, setMinLogLevel, setCorrelationId, getLogBuffer, clearLogBuffer } from "./structured-logger";
export type { LogLevel, LogEntry } from "./structured-logger";

export { recordAICost, getCostSummary, checkBudget } from "./cost-governance";
export type { CostRecord, CostSummary } from "./cost-governance";

export { probeSupabase, probeAuth, probeStorage, runAllProbes, getOverallHealth } from "./health-probes";
export type { ProbeResult } from "./health-probes";
