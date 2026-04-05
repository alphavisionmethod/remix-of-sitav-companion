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
  </>
);
