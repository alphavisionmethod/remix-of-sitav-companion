// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Services Barrel Export
// ═══════════════════════════════════════════════════════════════

export { HardwareCapabilityService, hardwareCapabilityService } from "./hardware-capability-service";
export { WorldModelService, worldModelService } from "./world-model-service";
export { TrustCalibrationService, trustCalibrationService } from "./trust-calibration-service";
export { AdvisorRecommendationEngine, advisorRecommendationEngine } from "./advisor-recommendation-engine";
export { ConnectionRecommendationEngine, connectionRecommendationEngine } from "./connection-recommendation-engine";
export type { ConnectionRecommendation } from "./connection-recommendation-engine";
export { FirstWinRecommendationEngine, firstWinRecommendationEngine } from "./first-win-recommendation-engine";
export { SetupSummaryBuilder, setupSummaryBuilder } from "./setup-summary-builder";
export type { SetupSummaryContext } from "./setup-summary-builder";
