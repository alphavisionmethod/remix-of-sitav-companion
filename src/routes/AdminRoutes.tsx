import { Route, Navigate } from "react-router-dom";
import { lazy } from "react";

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const TeamManagement = lazy(() => import("@/pages/admin/TeamManagement"));
const SystemManagement = lazy(() => import("@/pages/admin/SystemManagement"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const AITokenDashboard = lazy(() => import("@/pages/admin/AITokenDashboard"));
const GeneratedTruthDashboard = lazy(() => import("@/pages/admin/GeneratedTruthDashboard"));
const FleetHealthPage = lazy(() => import("@/pages/admin/FleetHealthPage"));

export const AdminRoutes = () => (
  <>
    <Route path="/admin/generated-truth" element={<GeneratedTruthDashboard />} />
    <Route path="/admin/fleet-health" element={<FleetHealthPage />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/team" element={<TeamManagement />} />
    <Route path="/admin/system" element={<SystemManagement />} />
    <Route path="/admin/users" element={<UserManagement />} />
    <Route path="/admin/ai-tokens" element={<AITokenDashboard />} />
  </>
);
