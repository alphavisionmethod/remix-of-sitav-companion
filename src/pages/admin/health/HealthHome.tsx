// ═══════════════════════════════════════════════════════════════
// SITA OS — Health Hub (Phase 25)
// Canonical entry for /admin/health. Observability, runtime
// continuity, fleet, storage, incidents, performance.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";

const FleetHealthPage = lazy(() => import("@/pages/admin/FleetHealthPage"));
const SystemHealthDashboard = lazy(() => import("@/pages/admin/SystemHealthDashboard"));
const MCSystemHealth = lazy(() => import("@/pages/admin/modules/MCSystemHealth"));
const MCIncidents = lazy(() => import("@/pages/admin/modules/MCIncidents"));
const MCStorageCenter = lazy(() => import("@/pages/admin/modules/MCStorageCenter"));
const MCJobsMaintenance = lazy(() => import("@/pages/admin/modules/MCJobsMaintenance"));
const MCFailureRecovery = lazy(() => import("@/pages/admin/modules/MCFailureRecovery"));
const BackendTopologyDashboard = lazy(() => import("@/pages/admin/BackendTopologyDashboard"));
const EFH01EdgeFunctionHealthCenter = lazy(
  () => import("@/pages/admin/EFH01EdgeFunctionHealthCenter"),
);
const DrillCadenceBoard = lazy(() => import("@/components/admin/DrillCadenceBoard"));
const CostSpotlight = lazy(() => import("@/pages/admin/health/CostSpotlight"));

function ModuleFallback() {
  return (
    <div className="text-xs text-muted-foreground py-12 text-center">Loading module…</div>
  );
}

const wrap = (Comp: React.ComponentType) => () => (
  <Suspense fallback={<ModuleFallback />}>
    <Comp />
  </Suspense>
);

export default function HealthHome() {
  const modules: HubModule[] = [
    {
      id: "system",
      label: "System Health",
      description: "Overall system health snapshot.",
      render: wrap(SystemHealthDashboard),
    },
    {
      id: "fleet",
      label: "Fleet",
      description: "Fleet-wide observability and continuity.",
      legacyPath: "/admin/fleet-health",
      render: wrap(FleetHealthPage),
    },
    {
      id: "incidents",
      label: "Incidents",
      description: "Active incidents and recovery state.",
      legacyPath: "/admin/mc/incidents",
      render: wrap(MCIncidents),
    },
    {
      id: "edge-functions",
      label: "Edge Functions",
      description: "Edge function health & replay.",
      legacyPath: "/admin/edge-functions/health",
      render: wrap(EFH01EdgeFunctionHealthCenter),
    },
    {
      id: "storage",
      label: "Storage",
      description: "Storage capacity, drift, and integrity.",
      legacyPath: "/admin/mc/storage",
      render: wrap(MCStorageCenter),
    },
    {
      id: "jobs",
      label: "Jobs",
      description: "Background jobs & maintenance windows.",
      legacyPath: "/admin/mc/jobs",
      render: wrap(MCJobsMaintenance),
    },
    {
      id: "recovery",
      label: "Recovery",
      description: "Failure recovery and self-healing.",
      legacyPath: "/admin/mc/failure-recovery",
      render: wrap(MCFailureRecovery),
    },
    {
      id: "backend",
      label: "Backend Topology",
      description: "Backend services topology.",
      legacyPath: "/admin/backend-topology",
      render: wrap(BackendTopologyDashboard),
    },
    {
      id: "module-overview",
      label: "Mission Control",
      description: "Mission-control system health module.",
      legacyPath: "/admin/mc/system-health",
      render: wrap(MCSystemHealth),
    },
    {
      id: "drill-cadence",
      label: "Drill Cadence",
      description: "Recurring operational drills (restore, refresh, baseline, calmness, golden paths).",
      render: wrap(DrillCadenceBoard),
    },
    {
      id: "cost-spotlight",
      label: "Cost Spotlight",
      description: "7-day cost trend (history accumulating). Live cost data lives in Budget Center, Usage Ledger, and Cost Efficiency.",
      legacyPath: "/admin/health/cost-spotlight",
      render: wrap(CostSpotlight),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="health" modules={modules} defaultTabId="system" />
    </AdminControlPlaneShell>
  );
}
