// ═══════════════════════════════════════════════════════════════
// SITA OS — Environments Hub (Phase 3)
// Canonical entry for /admin/environments. Combines user, team,
// device and system management surfaces under a single lookup +
// repair workflow.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";

const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const TeamManagement = lazy(() => import("@/pages/admin/TeamManagement"));
const SystemManagement = lazy(() => import("@/pages/admin/SystemManagement"));
const MCDevicesCenter = lazy(() => import("@/pages/admin/modules/MCDevicesCenter"));
const MCWorkspacesContinuity = lazy(
  () => import("@/pages/admin/modules/MCWorkspacesContinuity"),
);

function ModuleFallback() {
  return (
    <div className="text-xs text-muted-foreground py-12 text-center">
      Loading module…
    </div>
  );
}

const wrap = (Comp: React.ComponentType) => () => (
  <Suspense fallback={<ModuleFallback />}>
    <Comp />
  </Suspense>
);

export default function EnvironmentsHome() {
  const modules: HubModule[] = [
    {
      id: "users",
      label: "Users",
      description: "User lookup, roles and account state.",
      legacyPath: "/admin/users",
      render: wrap(UserManagement),
    },
    {
      id: "teams",
      label: "Teams",
      description: "Team membership and access.",
      legacyPath: "/admin/team",
      render: wrap(TeamManagement),
    },
    {
      id: "devices",
      label: "Devices",
      description: "Device fleet and trust state.",
      legacyPath: "/admin/mc/devices",
      render: wrap(MCDevicesCenter),
    },
    {
      id: "workspaces",
      label: "Workspaces",
      description: "Workspace continuity and session state.",
      legacyPath: "/admin/mc/workspaces",
      render: wrap(MCWorkspacesContinuity),
    },
    {
      id: "system",
      label: "System State",
      description: "Environment-wide system management.",
      legacyPath: "/admin/system",
      render: wrap(SystemManagement),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="environments" modules={modules} defaultTabId="users" />
    </AdminControlPlaneShell>
  );
}
