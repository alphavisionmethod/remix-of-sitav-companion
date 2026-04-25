// ═══════════════════════════════════════════════════════════════
// SITA OS — Releases Hub (Phase 25)
// Canonical entry for /admin/releases. Composes launch readiness,
// release engineering, mobile parity, and deployability surfaces.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";

const LaunchReadinessBoard = lazy(() => import("@/pages/admin/LaunchReadinessBoard"));
const LaunchHonestyBoard = lazy(() => import("@/pages/admin/LaunchHonestyBoard"));
const ReleaseEngineeringPage = lazy(() => import("@/pages/admin/ReleaseEngineeringPage"));
// MobileParityDashboard archived — Ubuntu-native is canonical native platform.
const MCReleasesUpdates = lazy(() => import("@/pages/admin/modules/MCReleasesUpdates"));
const AdminDeploymentRings = lazy(() => import("@/pages/admin/AdminDeploymentRings"));
const SbomHistory = lazy(() => import("@/pages/admin/releases/SbomHistory"));

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

export default function ReleasesHome() {
  const modules: HubModule[] = [
    {
      id: "launch-readiness",
      label: "Launch Readiness",
      description: "Are we ready to ship?",
      legacyPath: "/admin/releases/launch-readiness",
      render: wrap(LaunchReadinessBoard),
    },
    {
      id: "launch-honesty",
      label: "Launch Honesty",
      description: "Compare launch claims vs evidence.",
      render: wrap(LaunchHonestyBoard),
    },
    {
      id: "engineering",
      label: "Release Engineering",
      description: "Pipelines, signing, artifact health.",
      legacyPath: "/admin/release-engineering",
      render: wrap(ReleaseEngineeringPage),
    },
    // mobile-parity module removed — Ubuntu-native canonical (see docs/PLATFORM_SCOPE.md)
    {
      id: "deployment-rings",
      label: "Deployment Rings",
      description: "Ring promotion eligibility.",
      render: wrap(AdminDeploymentRings),
    },
    {
      id: "updates",
      label: "Updates & Rollback",
      description: "Release rollout, rollback, and update status.",
      legacyPath: "/admin/mc/releases",
      render: wrap(MCReleasesUpdates),
    },
    {
      id: "sbom-history",
      label: "SBOM History",
      description: "Historical SBOM diffs across signed releases (accumulates after the next signed release).",
      legacyPath: "/admin/releases/sbom-history",
      render: wrap(SbomHistory),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="releases" modules={modules} defaultTabId="launch-readiness" />
    </AdminControlPlaneShell>
  );
}
