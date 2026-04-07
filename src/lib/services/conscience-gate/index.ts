// ═══════════════════════════════════════════════════════════════
// SITA OS — ConscienceGate + CritiqueLoop Barrel
// ═══════════════════════════════════════════════════════════════

export { ConscienceGateService, conscienceGate } from "./conscience-gate";
export type { GateVerdict, GateRequest, GateDecision, EvidenceState, BudgetState, RoutingHints } from "./conscience-gate";

export { runCritique, logCritique, getCritiqueLog, getCritiqueStats } from "./critique-loop";
export type { CritiqueResult, CritiqueIssue, CritiqueRecommendation, EvidenceSource } from "./critique-loop";

