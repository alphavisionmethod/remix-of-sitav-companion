import { Route } from "react-router-dom";
import { lazy } from "react";

const AdvisorWorkspace = lazy(() => import("@/pages/advisors/AdvisorWorkspace"));
const AdvisorCouncilDashboard = lazy(() => import("@/pages/advisors/AdvisorCouncilDashboard"));
const CalmAssistantChat = lazy(() => import("@/pages/advisors/CalmAssistantChat"));
const AdvisorRegistry = lazy(() => import("@/pages/advisors/AdvisorRegistry"));
const AgentActivityDashboard = lazy(() => import("@/pages/AgentActivityDashboard"));
const AdvisorShowcase = lazy(() => import("@/pages/advisors/AdvisorShowcase"));

export function getAdvisorRoutes() {
  return (
    <>
      <Route path="/advisors" element={<AdvisorWorkspace />} />
      <Route path="/advisors/showcase" element={<AdvisorShowcase />} />
      <Route path="/advisors/chat" element={<CalmAssistantChat />} />
      <Route path="/advisors/council-dashboard" element={<AdvisorCouncilDashboard />} />
      <Route path="/advisors/overview" element={<AdvisorWorkspace />} />
      <Route path="/advisors/compare" element={<AdvisorWorkspace />} />
      <Route path="/advisors/simulations" element={<AdvisorWorkspace />} />
      <Route path="/advisors/approvals" element={<AdvisorWorkspace />} />
      <Route path="/advisors/proof" element={<AdvisorWorkspace />} />
      <Route path="/advisors/memory" element={<AdvisorWorkspace />} />
      <Route path="/advisors/:advisorId" element={<AdvisorWorkspace />} />
      <Route path="/advisors/registry" element={<AdvisorRegistry />} />
      <Route path="/agent-activity" element={<AgentActivityDashboard />} />
    </>
  );
}
