import { Route, Navigate } from "react-router-dom";
import { lazy } from "react";

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const TeamManagement = lazy(() => import("@/pages/admin/TeamManagement"));
const SystemManagement = lazy(() => import("@/pages/admin/SystemManagement"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const AITokenDashboard = lazy(() => import("@/pages/admin/AITokenDashboard"));
const GeneratedTruthDashboard = lazy(() => import("@/pages/admin/GeneratedTruthDashboard"));
const FleetHealthPage = lazy(() => import("@/pages/admin/FleetHealthPage"));


const IntelligenceReuseOverview = lazy(() => import("@/pages/admin/intelligence/IntelligenceReuseOverview"));
const IntelligenceAssetLibrary = lazy(() => import("@/pages/admin/intelligence/IntelligenceAssetLibrary"));
const DifferentialReasoningExplorer = lazy(() => import("@/pages/admin/intelligence/DifferentialReasoningExplorer"));
const IntelligencePacketInspector = lazy(() => import("@/pages/admin/intelligence/IntelligencePacketInspector"));
const AIEfficiencyScoreboard = lazy(() => import("@/pages/admin/intelligence/AIEfficiencyScoreboard"));
const OutcomeEconomicsBoard = lazy(() => import("@/pages/admin/intelligence/OutcomeEconomicsBoard"));
const EscalationControlCenter = lazy(() => import("@/pages/admin/intelligence/EscalationControlCenter"));
const PatternLearningCenter = lazy(() => import("@/pages/admin/intelligence/PatternLearningCenter"));
const ZeroWastePromptView = lazy(() => import("@/pages/admin/intelligence/ZeroWastePromptView"));
const SmartDigestCenter = lazy(() => import("@/pages/admin/intelligence/SmartDigestCenter"));
const CrossTenantGovernance = lazy(() => import("@/pages/admin/intelligence/CrossTenantGovernance"));

const AIG01ProviderRegistry = lazy(() => import("@/pages/admin/AIG01ProviderRegistry"));
const AIG02ModelRegistry = lazy(() => import("@/pages/admin/AIG02ModelRegistry"));
const AIG03RoutingMatrix = lazy(() => import("@/pages/admin/AIG03RoutingMatrix"));
const AIG04BudgetCenter = lazy(() => import("@/pages/admin/AIG04BudgetCenter"));
const AIG05ReceiptsExplorer = lazy(() => import("@/pages/admin/AIG05ReceiptsExplorer"));
const AIG06LaunchTruth = lazy(() => import("@/pages/admin/AIG06LaunchTruth"));
const AIG07LaunchTruth = lazy(() => import("@/pages/admin/AIG07LaunchTruth"));
const AIG08DegradedDiagnostics = lazy(() => import("@/pages/admin/AIG08DegradedDiagnostics"));
const AIG09RuntimeVerification = lazy(() => import("@/pages/admin/AIG09RuntimeVerification"));

const IntelligenceCapitalDashboard = lazy(() => import("@/pages/admin/strategic/IntelligenceCapitalDashboard"));
const CostToConfidenceDashboard = lazy(() => import("@/pages/admin/strategic/CostToConfidenceDashboard"));
const QualityFloorDashboard = lazy(() => import("@/pages/admin/strategic/QualityFloorDashboard"));
const IntelligenceInsuranceDashboard = lazy(() => import("@/pages/admin/strategic/IntelligenceInsuranceDashboard"));
const IntelligenceMarketDashboard = lazy(() => import("@/pages/admin/strategic/IntelligenceMarketDashboard"));
const TimeToTruthDashboard = lazy(() => import("@/pages/admin/strategic/TimeToTruthDashboard"));
const ReasoningReplayDashboard = lazy(() => import("@/pages/admin/strategic/ReasoningReplayDashboard"));
const DecayMonitorDashboard = lazy(() => import("@/pages/admin/strategic/DecayMonitorDashboard"));
const PortfolioAllocationDashboard = lazy(() => import("@/pages/admin/strategic/PortfolioAllocationDashboard"));
const BenchmarkLabDashboard = lazy(() => import("@/pages/admin/strategic/BenchmarkLabDashboard"));
const ValueRiskDashboard = lazy(() => import("@/pages/admin/strategic/ValueRiskDashboard"));
const OperatorTasteDashboard = lazy(() => import("@/pages/admin/strategic/OperatorTasteDashboard"));

const AIT01TeamOverview = lazy(() => import("@/pages/admin/AIT01TeamOverview"));
const AIT02RoleRegistry = lazy(() => import("@/pages/admin/AIT02RoleRegistry"));
const AIT03TaskInvocation = lazy(() => import("@/pages/admin/AIT03TaskInvocation"));
const AIT04ActivityFeed = lazy(() => import("@/pages/admin/AIT04to08Boards").then(m => ({ default: m.AIT04ActivityFeed })));
const AIT05CostEfficiency = lazy(() => import("@/pages/admin/AIT05CostEfficiency").then(m => ({ default: m.AIT05CostEfficiency })));
const AIT06Recommendations = lazy(() => import("@/pages/admin/AIT04to08Boards").then(m => ({ default: m.AIT06Recommendations })));
const AIT07ApprovalQueue = lazy(() => import("@/pages/admin/AIT04to08Boards").then(m => ({ default: m.AIT07ApprovalQueue })));
const AIT08LaunchTruth = lazy(() => import("@/pages/admin/AIT04to08Boards").then(m => ({ default: m.AIT08LaunchTruth })));

const HQApprovalQueue = lazy(() => import("@/pages/admin/HQApprovalQueue"));
const AITSetupChecklist = lazy(() => import("@/pages/admin/AITSetupChecklist"));
const TruthIndexDashboard = lazy(() => import("@/pages/admin/TruthIndexDashboard"));

export function getAdminRoutes() {
  return [
    <Route key="a1" path="/admin/generated-truth" element={<GeneratedTruthDashboard />} />,
    <Route key="a2" path="/admin/fleet-health" element={<FleetHealthPage />} />,
    <Route key="a3" path="/admin/dashboard" element={<AdminDashboard />} />,
    <Route key="a4" path="/admin/team" element={<TeamManagement />} />,
    <Route key="a5" path="/admin/system" element={<SystemManagement />} />,
    <Route key="a6" path="/admin/users" element={<UserManagement />} />,
    <Route key="a7" path="/admin/ai-tokens" element={<AITokenDashboard />} />,
    <Route key="a8" path="/admin/intelligence-efficiency" element={<Navigate to="/admin/intelligence/efficiency" replace />} />,
    <Route key="a9" path="/admin/truth-indices" element={<TruthIndexDashboard />} />,
    <Route key="a10" path="/admin/ai-team/overview" element={<AIT01TeamOverview />} />,
    <Route key="a11" path="/admin/ai-team/roles" element={<AIT02RoleRegistry />} />,
    <Route key="a12" path="/admin/ai-team/invoke" element={<AIT03TaskInvocation />} />,
    <Route key="a13" path="/admin/ai-team/activity" element={<AIT04ActivityFeed />} />,
    <Route key="a14" path="/admin/ai-team/cost" element={<AIT05CostEfficiency />} />,
    <Route key="a15" path="/admin/ai-team/recommendations" element={<AIT06Recommendations />} />,
    <Route key="a16" path="/admin/ai-team/approvals" element={<AIT07ApprovalQueue />} />,
    <Route key="a17" path="/admin/ai-team/launch-truth" element={<AIT08LaunchTruth />} />,
    <Route key="a18" path="/admin/ai-team/approval-queue" element={<HQApprovalQueue />} />,
    <Route key="a19" path="/admin/ai-team/setup-checklist" element={<AITSetupChecklist />} />,
    <Route key="a20" path="/admin/intelligence/reuse" element={<IntelligenceReuseOverview />} />,
    <Route key="a21" path="/admin/intelligence/assets" element={<IntelligenceAssetLibrary />} />,
    <Route key="a22" path="/admin/intelligence/differential" element={<DifferentialReasoningExplorer />} />,
    <Route key="a23" path="/admin/intelligence/packets" element={<IntelligencePacketInspector />} />,
    <Route key="a24" path="/admin/intelligence/efficiency" element={<AIEfficiencyScoreboard />} />,
    <Route key="a25" path="/admin/intelligence/outcomes" element={<OutcomeEconomicsBoard />} />,
    <Route key="a26" path="/admin/intelligence/escalation" element={<EscalationControlCenter />} />,
    <Route key="a27" path="/admin/intelligence/patterns" element={<PatternLearningCenter />} />,
    <Route key="a28" path="/admin/intelligence/prompts" element={<ZeroWastePromptView />} />,
    <Route key="a29" path="/admin/intelligence/digests" element={<SmartDigestCenter />} />,
    <Route key="a30" path="/admin/intelligence/cross-tenant" element={<CrossTenantGovernance />} />,
    <Route key="a31" path="/admin/ai-gateway/providers" element={<AIG01ProviderRegistry />} />,
    <Route key="a32" path="/admin/ai-gateway/models" element={<AIG02ModelRegistry />} />,
    <Route key="a33" path="/admin/ai-gateway/routing" element={<AIG03RoutingMatrix />} />,
    <Route key="a34" path="/admin/ai-gateway/budget" element={<AIG04BudgetCenter />} />,
    <Route key="a35" path="/admin/ai-gateway/receipts" element={<AIG05ReceiptsExplorer />} />,
    <Route key="a36" path="/admin/ai-gateway/honesty" element={<AIG06LaunchTruth />} />,
    <Route key="a37" path="/admin/ai-gateway/launch-truth" element={<AIG07LaunchTruth />} />,
    <Route key="a38" path="/admin/ai-gateway/diagnostics" element={<AIG08DegradedDiagnostics />} />,
    <Route key="a39" path="/admin/ai-gateway/verification" element={<AIG09RuntimeVerification />} />,
    <Route key="a40" path="/admin/strategic/capital" element={<IntelligenceCapitalDashboard />} />,
    <Route key="a41" path="/admin/strategic/cost-confidence" element={<CostToConfidenceDashboard />} />,
    <Route key="a42" path="/admin/strategic/quality-floor" element={<QualityFloorDashboard />} />,
    <Route key="a43" path="/admin/strategic/insurance" element={<IntelligenceInsuranceDashboard />} />,
    <Route key="a44" path="/admin/strategic/market" element={<IntelligenceMarketDashboard />} />,
    <Route key="a45" path="/admin/strategic/time-to-truth" element={<TimeToTruthDashboard />} />,
    <Route key="a46" path="/admin/strategic/reasoning-replay" element={<ReasoningReplayDashboard />} />,
    <Route key="a47" path="/admin/strategic/decay" element={<DecayMonitorDashboard />} />,
    <Route key="a48" path="/admin/strategic/portfolio" element={<PortfolioAllocationDashboard />} />,
    <Route key="a49" path="/admin/strategic/benchmark" element={<BenchmarkLabDashboard />} />,
    <Route key="a50" path="/admin/strategic/value-risk" element={<ValueRiskDashboard />} />,
    <Route key="a51" path="/admin/strategic/operator-taste" element={<OperatorTasteDashboard />} />,
  ];
}
