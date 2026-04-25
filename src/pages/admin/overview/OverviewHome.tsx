// ═══════════════════════════════════════════════════════════════
// SITA OS — Overview Hub (Phase 3)
// Canonical entry for /admin/overview. Replaces the previous
// fragmented executive dashboards (AdminDashboard, OperationsHub,
// MissionControlHome, SystemHealthDashboard, LaunchReadinessBoard,
// LaunchHonestyBoard, GeneratedTruthDashboard) by composing them as
// modules within one owner workflow surface.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const GeneratedTruthDashboard = lazy(() => import("@/pages/admin/GeneratedTruthDashboard"));
const RuntimeTierGovernanceDashboard = lazy(
  () => import("@/pages/admin/RuntimeTierGovernanceDashboard"),
);
const TruthIndexDashboard = lazy(() => import("@/pages/admin/TruthIndexDashboard"));
const SYS01SystemIntelligence = lazy(
  () => import("@/pages/admin/SYS01SystemIntelligence"),
);
const ECO01EcosystemCommand = lazy(() => import("@/pages/admin/ECO01EcosystemCommand"));
const OS01PlatformCommandCenter = lazy(
  () => import("@/pages/admin/OS01PlatformCommandCenter"),
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

export default function OverviewHome() {
  const modules: HubModule[] = [
    {
      id: "executive",
      label: "Executive",
      description: "Daily executive command — the canonical decision surface.",
      legacyPath: "/admin/dashboard",
      render: wrap(AdminDashboard),
    },
    {
      id: "generated-truth",
      label: "Generated Truth",
      description: "Auto-generated truth dashboards across services.",
      legacyPath: "/admin/generated-truth",
      render: wrap(GeneratedTruthDashboard),
    },
    {
      id: "truth-indices",
      label: "Truth Indices",
      description: "Aggregate truth-index trends and drift signals.",
      legacyPath: "/admin/truth-indices",
      render: wrap(TruthIndexDashboard),
    },
    {
      id: "runtime-tier",
      label: "Runtime Tier",
      description: "Runtime tier governance health.",
      legacyPath: "/admin/runtime-tier-governance",
      render: wrap(RuntimeTierGovernanceDashboard),
    },
    {
      id: "system-intelligence",
      label: "System Intelligence",
      description: "System-wide intelligence pulse.",
      legacyPath: "/admin/system-intelligence",
      render: wrap(SYS01SystemIntelligence),
    },
    {
      id: "ecosystem",
      label: "Ecosystem",
      description: "Ecosystem command coordination.",
      legacyPath: "/admin/ecosystem/command",
      render: wrap(ECO01EcosystemCommand),
    },
    {
      id: "os-platform",
      label: "OS Platform",
      description: "Platform command center for OS-tier services.",
      legacyPath: "/admin/os-platform",
      render: wrap(OS01PlatformCommandCenter),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="overview" modules={modules} defaultTabId="executive" />
    </AdminControlPlaneShell>
  );
}
