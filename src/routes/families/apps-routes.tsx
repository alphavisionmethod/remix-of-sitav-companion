// ═══════════════════════════════════════════════════════════════
// SITA OS — Apps Routes
// Canonical route hub for app store, app launcher, and app management
// ═══════════════════════════════════════════════════════════════

import { Route } from "react-router-dom";
import { lazy } from "react";

const AppStoreCenter = lazy(() => import("@/pages/AppStoreCenter"));
const DownloadsCenter = lazy(() => import("@/pages/DownloadsCenter"));

export function getAppsRoutes() {
  return [
    <Route
      key="apps-store"
      path="/apps/store"
      element={<AppStoreCenter />}
    />,
    <Route
      key="apps-downloads"
      path="/apps/downloads"
      element={<DownloadsCenter />}
    />,
  ];
}
