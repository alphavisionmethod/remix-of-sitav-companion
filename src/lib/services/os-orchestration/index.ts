// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Orchestration Barrel
// Meta-barrel for all 15 new systems
// ═══════════════════════════════════════════════════════════════

// Wave 1 — Orchestration Magic
export { PersonalOperatingGraphService, createPersonalOperatingGraph } from "../personal-graph/personal-operating-graph";
export { IntentOrchestratorService, createIntentOrchestrator } from "../intent-orchestrator/intent-orchestrator";
export { AttentionOSService, createAttentionOS } from "../attention-os/attention-os";
export { ContinuityEngineService, createContinuityEngine } from "../continuity-engine/continuity-engine";
export { TrustWeightedActionService, createTrustWeightedActions } from "../trust-actions/trust-weighted-actions";

// Wave 2 — Human Support Magic
export { ChiefOfStaffService, createChiefOfStaff } from "../chief-of-staff/chief-of-staff";
export { TimingIntelligenceService, createTimingIntelligence } from "../timing-intelligence/timing-intelligence";
export { DigestEngineService, createDigestEngine } from "../digest-engine/digest-engine";
export { MemoryGovernanceEngine, createMemoryGovernance } from "../memory-governance/memory-governance-engine";

// Wave 3 — Polish and Moat
export { AdaptiveInterfaceService, createAdaptiveInterface } from "../adaptive-interface/adaptive-interface";
export { BoundaryEngineService, createBoundaryEngine } from "../boundary-engine/boundary-engine";
export { ExperienceSignatureService, createExperienceSignature } from "../experience-signature/experience-signature";
