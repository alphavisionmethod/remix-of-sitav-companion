import { Route } from "react-router-dom";
import { lazy } from "react";

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const TeamManagement = lazy(() => import("@/pages/admin/TeamManagement"));
const SystemManagement = lazy(() => import("@/pages/admin/SystemManagement"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const AITokenDashboard = lazy(() => import("@/pages/admin/AITokenDashboard"));
const GeneratedTruthDashboard = lazy(() => import("@/pages/admin/GeneratedTruthDashboard"));
const FleetHealthPage = lazy(() => import("@/pages/admin/FleetHealthPage"));
const IntelligenceEfficiencyBoard = lazy(() => import("@/pages/admin/IntelligenceEfficiencyBoard"));

// UIE01-UIE11: Intelligence Architecture Screens
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

// AIG01-AIG08: AI Governance Center
const AIG01ProviderRegistry = lazy(() => import("@/pages/admin/AIG01ProviderRegistry"));
const AIG02ModelRegistry = lazy(() => import("@/pages/admin/AIG02ModelRegistry"));
const AIG03RoutingMatrix = lazy(() => import("@/pages/admin/AIG03RoutingMatrix"));
const AIG04BudgetCenter = lazy(() => import("@/pages/admin/AIG04BudgetCenter"));
const AIG05ReceiptsExplorer = lazy(() => import("@/pages/admin/AIG05ReceiptsExplorer"));
const AIG06LaunchTruth = lazy(() => import("@/pages/admin/AIG06LaunchTruth"));
const AIG07LaunchTruth = lazy(() => import("@/pages/admin/AIG07LaunchTruth"));
const AIG08DegradedDiagnostics = lazy(() => import("@/pages/admin/AIG08DegradedDiagnostics"));

// Part 3: Strategic Intelligence Screens
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

// AIT01-AIT08: AI Engineering Team
const AIT01TeamOverview = lazy(() => import("@/pages/admin/AIT01TeamOverview"));
const AIT02RoleRegistry = lazy(() => import("@/pages/admin/AIT02RoleRegistry"));
const AIT03TaskInvocation = lazy(() => import("@/pages/admin/AIT03TaskInvocation"));

// Truth Index Dashboard
const TruthIndexDashboard = lazy(() => import("@/pages/admin/TruthIndexDashboard"));

export const AdminRoutes = () => (
  <>
    <Route path="/admin/generated-truth" element={<GeneratedTruthDashboard />} />
    <Route path="/admin/fleet-health" element={<FleetHealthPage />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/team" element={<TeamManagement />} />
    <Route path="/admin/system" element={<SystemManagement />} />
    <Route path="/admin/users" element={<UserManagement />} />
    <Route path="/admin/ai-tokens" element={<AITokenDashboard />} />
    <Route path="/admin/intelligence-efficiency" element={<IntelligenceEfficiencyBoard />} />

    {/* Truth Index Dashboard */}
    <Route path="/admin/truth-indices" element={<TruthIndexDashboard />} />

    {/* AIT01-AIT08: AI Engineering Team */}
    <Route path="/admin/ai-team/overview" element={<AIT01TeamOverview />} />
    <Route path="/admin/ai-team/roles" element={<AIT02RoleRegistry />} />
    <Route path="/admin/ai-team/invoke" element={<AIT03TaskInvocation />} />

    {/* UIE01-UIE11: Intelligence Architecture */}
    <Route path="/admin/intelligence/reuse" element={<IntelligenceReuseOverview />} />
    <Route path="/admin/intelligence/assets" element={<IntelligenceAssetLibrary />} />
    <Route path="/admin/intelligence/differential" element={<DifferentialReasoningExplorer />} />
    <Route path="/admin/intelligence/packets" element={<IntelligencePacketInspector />} />
    <Route path="/admin/intelligence/efficiency" element={<AIEfficiencyScoreboard />} />
    <Route path="/admin/intelligence/outcomes" element={<OutcomeEconomicsBoard />} />
    <Route path="/admin/intelligence/escalation" element={<EscalationControlCenter />} />
    <Route path="/admin/intelligence/patterns" element={<PatternLearningCenter />} />
    <Route path="/admin/intelligence/prompts" element={<ZeroWastePromptView />} />
    <Route path="/admin/intelligence/digests" element={<SmartDigestCenter />} />
    <Route path="/admin/intelligence/cross-tenant" element={<CrossTenantGovernance />} />

    {/* AIG07-AIG08: AI Governance Center */}
    <Route path="/admin/ai-gateway/launch-truth" element={<AIG07LaunchTruth />} />
    <Route path="/admin/ai-gateway/diagnostics" element={<AIG08DegradedDiagnostics />} />

    {/* Part 3: Strategic Intelligence */}
    <Route path="/admin/strategic/capital" element={<IntelligenceCapitalDashboard />} />
    <Route path="/admin/strategic/cost-confidence" element={<CostToConfidenceDashboard />} />
    <Route path="/admin/strategic/quality-floor" element={<QualityFloorDashboard />} />
    <Route path="/admin/strategic/insurance" element={<IntelligenceInsuranceDashboard />} />
    <Route path="/admin/strategic/market" element={<IntelligenceMarketDashboard />} />
    <Route path="/admin/strategic/time-to-truth" element={<TimeToTruthDashboard />} />
    <Route path="/admin/strategic/reasoning-replay" element={<ReasoningReplayDashboard />} />
    <Route path="/admin/strategic/decay" element={<DecayMonitorDashboard />} />
    <Route path="/admin/strategic/portfolio" element={<PortfolioAllocationDashboard />} />
    <Route path="/admin/strategic/benchmark" element={<BenchmarkLabDashboard />} />
    <Route path="/admin/strategic/value-risk" element={<ValueRiskDashboard />} />
    <Route path="/admin/strategic/operator-taste" element={<OperatorTasteDashboard />} />
  </>
);
