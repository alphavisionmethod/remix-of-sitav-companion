// ═══════════════════════════════════════════════════════════════
// SITA OS — Communications Routes
// Canonical route hub for all communication-related surfaces
// ═══════════════════════════════════════════════════════════════

import { Route } from "react-router-dom";
import { lazy } from "react";

const CommunicationInbox = lazy(() => import("@/pages/CommunicationInbox"));
const CommunicationsPage = lazy(() => import("@/pages/CommunicationsPage"));

export function getCommunicationsRoutes() {
  return [
    <Route
      key="comm-inbox"
      path="/communications/inbox"
      element={<CommunicationInbox />}
    />,
    <Route
      key="comm-main"
      path="/communications"
      element={<CommunicationsPage />}
    />,
  ];
}
