// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Workforce Barrel
// ═══════════════════════════════════════════════════════════════

// Re-export the original in-memory workforce service (used by governance)
export { AIWorkforceService, createAIWorkforce } from "./workforce-service";
export type { AgentAssignmentResult } from "./workforce-service";

// Re-export governance
export * from "./agent-governance";
export * from "./agent-health-monitor";

// Re-export DB-backed orchestrator
export * from "./workforce-orchestrator";
