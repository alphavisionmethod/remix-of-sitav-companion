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

export const OwnerRoutes = () => (
  <>
    <Route path="/owner" element={<OwnerCenter />} />
    <Route path="/owner/home" element={<Navigate to="/owner" replace />} />
    <Route path="/owner/health" element={<Navigate to="/owner" replace />} />
    <Route path="/owner/pulse" element={<OwnerPulsePage />} />
    <Route path="/owner/trust" element={<Navigate to="/owner/trust-center" replace />} />
    <Route path="/owner/approvals" element={<OwnerApprovalsPage />} />
    <Route path="/owner/ai-team" element={<Navigate to="/owner/internal-agents" replace />} />
    <Route path="/owner/ai-team/updates" element={<OwnerAiTeamUpdatesPage />} />
    <Route path="/owner/incidents" element={<OwnerCenter />} />
    <Route path="/owner/intelligence" element={<OwnerCenter />} />
    <Route path="/owner/policies" element={<OwnerCenter />} />
    <Route path="/owner/fleet" element={<OwnerCenter />} />
    <Route path="/owner/council" element={<OwnerCenter />} />
    <Route path="/owner/audit" element={<OwnerCenter />} />
    <Route path="/owner/connector-health" element={<OwnerCenter />} />
    <Route path="/owner/connectors" element={<OwnerCenter />} />
    <Route path="/owner/costs" element={<OwnerCenter />} />
    <Route path="/owner/internal-agents" element={<OwnerCenter />} />
    <Route path="/owner/workflow-control" element={<OwnerCenter />} />
    <Route path="/owner/trust-center" element={<OwnerCenter />} />
    <Route path="/owner/autopilot" element={<OwnerCenter />} />
    <Route path="/owner/billing" element={<OwnerCenter />} />
    <Route path="/owner/releases" element={<ReleaseDeploymentWorkspace />} />
    <Route path="/owner/model-routing" element={<OwnerCenter />} />
    <Route path="/owner/system-map" element={<OwnerCenter />} />
    <Route path="/owner/knowledge" element={<OwnerCenter />} />
    <Route path="/owner/support" element={<OwnerCenter />} />
    <Route path="/owner/change-review" element={<OwnerCenter />} />
    <Route path="/owner/rollback-center" element={<ReleaseDeploymentWorkspace />} />
    <Route path="/owner/governance" element={<OwnerCenter />} />
    <Route path="/owner/pricing" element={<PricingEditor />} />
    <Route path="/owner/packs" element={<PackEditorPage />} />
    <Route path="/owner/advisors" element={<AdvisorConfigPage />} />
    <Route path="/owner/leases" element={<LeaseDashboard />} />
    <Route path="/owner/constitution" element={<ConstitutionEditor />} />
    <Route path="/owner-mode" element={<Navigate to="/owner" replace />} />
    <Route path="/owner-mode/home" element={<Navigate to="/owner" replace />} />
  </>
);
