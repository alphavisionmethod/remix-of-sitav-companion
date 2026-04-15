// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Pages: AI Control Plane
// Canonical import: @/admin/pages/ai
// ═══════════════════════════════════════════════════════════════

// ── AI Core ──
export { default as AIAgentDebate } from "@/pages/admin/AIAgentDebate";
export { default as AIApprovalDesk } from "@/pages/admin/AIApprovalDesk";
export { default as AIChangePlanViewer } from "@/pages/admin/AIChangePlanViewer";
export { default as AIDesignDiffTheater } from "@/pages/admin/AIDesignDiffTheater";
export { default as AIDesignStudio } from "@/pages/admin/AIDesignStudio";
export { default as AIEngineeringBoard } from "@/pages/admin/AIEngineeringBoard";
export { default as AIEvidenceBundleComposer } from "@/pages/admin/AIEvidenceBundleComposer";
export { default as AIFixCenter } from "@/pages/admin/AIFixCenter";
export { default as AIGovernancePage } from "@/pages/admin/AIGovernancePage";
export { default as AIHumanBoundaryControls } from "@/pages/admin/AIHumanBoundaryControls";
export { default as AILearningCenter } from "@/pages/admin/AILearningCenter";
export { default as AIMissionCenter } from "@/pages/admin/AIMissionCenter";
export { default as AIReleasesCenter } from "@/pages/admin/AIReleasesCenter";
export { default as AIRootCauseGraph } from "@/pages/admin/AIRootCauseGraph";
export { default as AIRuntimeStatus } from "@/pages/admin/AIRuntimeStatus";
export { default as AISelfHealing } from "@/pages/admin/AISelfHealing";
export { default as AISelfLearningLedger } from "@/pages/admin/AISelfLearningLedger";
export { default as AITimeMachine } from "@/pages/admin/AITimeMachine";
export { default as AITokenDashboard } from "@/pages/admin/AITokenDashboard";
export { default as AITeamRoster } from "@/pages/admin/AITeamRoster";

// ── AIG (AI Gateway) ──
export { default as AIG01ProviderRegistry } from "@/pages/admin/AIG01ProviderRegistry";
export { default as AIG02ModelRegistry } from "@/pages/admin/AIG02ModelRegistry";
export { default as AIG03RoutingMatrix } from "@/pages/admin/AIG03RoutingMatrix";
export { default as AIG04BudgetCenter } from "@/pages/admin/AIG04BudgetCenter";
export { default as AIG05ReceiptsExplorer } from "@/pages/admin/AIG05ReceiptsExplorer";
export { default as AIG05UsageLedgerExplorer } from "@/pages/admin/AIG05UsageLedgerExplorer";
export { default as AIG06LaunchTruth } from "@/pages/admin/AIG06LaunchTruth";
export { default as AIG07LaunchTruth } from "@/pages/admin/AIG07LaunchTruth";
export { default as AIG08DegradedDiagnostics } from "@/pages/admin/AIG08DegradedDiagnostics";
export { default as AIG09RuntimeVerification } from "@/pages/admin/AIG09RuntimeVerification";

// ── AIT (AI Team) ──
export { default as AIT01TeamOverview } from "@/pages/admin/AIT01TeamOverview";
export { default as AIT02RoleRegistry } from "@/pages/admin/AIT02RoleRegistry";
export { default as AIT03TaskInvocation } from "@/pages/admin/AIT03TaskInvocation";
export { default as AIT04ActivityFeedPage } from "@/pages/admin/AIT04ActivityFeedPage";
export { AIT04ActivityFeed as AIT04to08ActivityFeed, AIT05CostEfficiency as AIT04to08CostEfficiency, AIT06Recommendations as AIT04to08Recommendations, AIT07ApprovalQueue as AIT04to08ApprovalQueue, AIT08LaunchTruth as AIT04to08LaunchTruth } from "@/pages/admin/AIT04to08Boards";
export { default as AIT05CostEfficiency } from "@/pages/admin/AIT05CostEfficiency";
export { default as AIT06RecommendationsPage } from "@/pages/admin/AIT06RecommendationsPage";
export { default as AIT07ApprovalQueuePage } from "@/pages/admin/AIT07ApprovalQueuePage";
export { default as AIT08LaunchTruthPage } from "@/pages/admin/AIT08LaunchTruthPage";
export { default as AITSetupChecklist } from "@/pages/admin/AITSetupChecklist";

// ── Advisor ──
export { default as AdvisorActionApprovalAdmin } from "@/pages/admin/AdvisorActionApprovalAdmin";
export { default as AdvisorAgentDashboard } from "@/pages/admin/AdvisorAgentDashboard";
export { default as AdvisorAutonomyPolicyEditor } from "@/pages/admin/AdvisorAutonomyPolicyEditor";
export { default as AdvisorBoardCatalog } from "@/pages/admin/AdvisorBoardCatalog";
export { default as AdvisorMemoryInspector } from "@/pages/admin/AdvisorMemoryInspector";
export { default as AdvisorProfitabilityDashboard } from "@/pages/admin/AdvisorProfitabilityDashboard";
export { default as AdvisorRecommendationMonitor } from "@/pages/admin/AdvisorRecommendationMonitor";

// ── Other AI ──
export { default as BrainCoreDashboard } from "@/pages/admin/BrainCoreDashboard";
export { default as GoogleProviderFamilyDashboard } from "@/pages/admin/GoogleProviderFamilyDashboard";

// ── REX (Recommendation Execution) ──
export { default as REX01RecommendationIntelligence } from "@/pages/admin/REX01RecommendationIntelligence";
export { default as REX02ApprovalQueueCompletion } from "@/pages/admin/REX02ApprovalQueueCompletion";
export { default as REX03RecommendationExecution } from "@/pages/admin/REX03RecommendationExecution";
export { default as REX04RemediationPrograms } from "@/pages/admin/REX04RemediationPrograms";
export { default as REX05OutcomeVerification } from "@/pages/admin/REX05OutcomeVerification";

// ── SAG (Strategic AI Governance) subdirectory ──
export { default as SAGBuilderConsole } from "@/pages/admin/sag/SAGBuilderConsole";
export { default as SAGComplianceGate } from "@/pages/admin/sag/SAGComplianceGate";
export { default as SAGCostConfidenceLab } from "@/pages/admin/sag/SAGCostConfidenceLab";
export { default as SAGEconomicsBoard } from "@/pages/admin/sag/SAGEconomicsBoard";
export { default as SAGFallbackCenter } from "@/pages/admin/sag/SAGFallbackCenter";
export { default as SAGModelRegistry } from "@/pages/admin/sag/SAGModelRegistry";
export { default as SAGMultiStageExplorer } from "@/pages/admin/sag/SAGMultiStageExplorer";
export { default as SAGOverview } from "@/pages/admin/sag/SAGOverview";
export { default as SAGPromptRegistry } from "@/pages/admin/sag/SAGPromptRegistry";
export { default as SAGProviderHealth } from "@/pages/admin/sag/SAGProviderHealth";
export { default as SAGReceiptExplorer } from "@/pages/admin/sag/SAGReceiptExplorer";
export { default as SAGRoutingPolicy } from "@/pages/admin/sag/SAGRoutingPolicy";

// ── Intelligence subdirectory AI pages ──
export { default as AIEfficiencyScoreboard } from "@/pages/admin/intelligence/AIEfficiencyScoreboard";
export { default as DifferentialReasoningExplorer } from "@/pages/admin/intelligence/DifferentialReasoningExplorer";
export { default as EscalationControlCenter } from "@/pages/admin/intelligence/EscalationControlCenter";
export { default as PatternLearningCenter } from "@/pages/admin/intelligence/PatternLearningCenter";
export { default as ZeroWastePromptView } from "@/pages/admin/intelligence/ZeroWastePromptView";
