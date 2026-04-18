// ═══════════════════════════════════════════════════════════════
// SITA OS — Settings Routes
// Canonical route hub for all system and user settings surfaces
// ═══════════════════════════════════════════════════════════════

import { Route } from "react-router-dom";
import { lazy } from "react";

const SettingsCenter = lazy(() => import("@/pages/SettingsPage"));
const EnvironmentSwitcher = lazy(() => import("@/pages/EnvironmentSwitcher"));
const TenantSelfServiceConsole = lazy(() => import("@/pages/tenant/TenantSelfServiceConsole"));

export function getSettingsRoutes() {
  return [
    <Route
      key="settings-main"
      path="/settings"
      element={<SettingsCenter />}
    />,
    <Route
      key="settings-environment"
      path="/settings/environment"
      element={<EnvironmentSwitcher />}
    />,
    <Route
      key="settings-self-service"
      path="/settings/self-service"
      element={<TenantSelfServiceConsole />}
    />,
  ];
}
