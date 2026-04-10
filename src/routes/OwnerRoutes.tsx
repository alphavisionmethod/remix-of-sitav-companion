import { Route, Navigate } from "react-router-dom";
import { lazy } from "react";

const OwnerCenter = lazy(() => import("@/pages/OwnerCenter"));
const PricingEditor = lazy(() => import("@/pages/owner/PricingEditor"));
const PackEditorPage = lazy(() => import("@/pages/owner/PackEditor"));
const AdvisorConfigPage = lazy(() => import("@/pages/owner/AdvisorConfig"));
const LeaseDashboard = lazy(() => import("@/pages/owner/LeaseDashboard"));
const ConstitutionEditor = lazy(() => import("@/pages/owner/ConstitutionEditor"));
const OwnerPulsePage = lazy(() => import("@/pages/owner/OwnerPulsePage"));
const OwnerApprovalsPage = lazy(() => import("@/pages/owner/OwnerApprovalsPage"));
const OwnerAiTeamUpdatesPage = lazy(() => import("@/pages/owner/OwnerAiTeamUpdatesPage"));
const ReleaseDeploymentWorkspace = lazy(() => import("@/pages/owner/ReleaseDeploymentWorkspace"));

export function getOwnerRoutes() {
  return [
    <Route key="o1" path="/owner" element={<OwnerCenter />} />,
    <Route key="o2" path="/owner/home" element={<Navigate to="/owner" replace />} />,
    <Route key="o3" path="/owner/health" element={<Navigate to="/owner" replace />} />,
    <Route key="o4" path="/owner/pulse" element={<OwnerPulsePage />} />,
    <Route key="o5" path="/owner/trust" element={<Navigate to="/owner/trust-center" replace />} />,
    <Route key="o6" path="/owner/approvals" element={<OwnerApprovalsPage />} />,
    <Route key="o7" path="/owner/ai-team" element={<Navigate to="/owner/internal-agents" replace />} />,
    <Route key="o8" path="/owner/ai-team/updates" element={<OwnerAiTeamUpdatesPage />} />,
    <Route key="o9" path="/owner/incidents" element={<OwnerCenter />} />,
    <Route key="o10" path="/owner/intelligence" element={<OwnerCenter />} />,
    <Route key="o11" path="/owner/policies" element={<OwnerCenter />} />,
    <Route key="o12" path="/owner/fleet" element={<OwnerCenter />} />,
    <Route key="o13" path="/owner/council" element={<OwnerCenter />} />,
    <Route key="o14" path="/owner/audit" element={<OwnerCenter />} />,
    <Route key="o15" path="/owner/connector-health" element={<OwnerCenter />} />,
    <Route key="o16" path="/owner/connectors" element={<OwnerCenter />} />,
    <Route key="o17" path="/owner/costs" element={<OwnerCenter />} />,
    <Route key="o18" path="/owner/internal-agents" element={<OwnerCenter />} />,
    <Route key="o19" path="/owner/workflow-control" element={<OwnerCenter />} />,
    <Route key="o20" path="/owner/trust-center" element={<OwnerCenter />} />,
    <Route key="o21" path="/owner/autopilot" element={<OwnerCenter />} />,
    <Route key="o22" path="/owner/billing" element={<OwnerCenter />} />,
    <Route key="o23" path="/owner/releases" element={<ReleaseDeploymentWorkspace />} />,
    <Route key="o24" path="/owner/model-routing" element={<OwnerCenter />} />,
    <Route key="o25" path="/owner/system-map" element={<OwnerCenter />} />,
    <Route key="o26" path="/owner/knowledge" element={<OwnerCenter />} />,
    <Route key="o27" path="/owner/support" element={<OwnerCenter />} />,
    <Route key="o28" path="/owner/change-review" element={<OwnerCenter />} />,
    <Route key="o29" path="/owner/rollback-center" element={<ReleaseDeploymentWorkspace />} />,
    <Route key="o30" path="/owner/governance" element={<OwnerCenter />} />,
    <Route key="o31" path="/owner/pricing" element={<PricingEditor />} />,
    <Route key="o32" path="/owner/packs" element={<PackEditorPage />} />,
    <Route key="o33" path="/owner/advisors" element={<AdvisorConfigPage />} />,
    <Route key="o34" path="/owner/leases" element={<LeaseDashboard />} />,
    <Route key="o35" path="/owner/constitution" element={<ConstitutionEditor />} />,
    <Route key="o36" path="/owner-mode" element={<Navigate to="/owner" replace />} />,
    <Route key="o37" path="/owner-mode/home" element={<Navigate to="/owner" replace />} />,
  ];
}
