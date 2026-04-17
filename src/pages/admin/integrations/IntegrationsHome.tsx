// ═══════════════════════════════════════════════════════════════
// SITA OS — Integrations Hub (Phase 25)
// Canonical entry for /admin/integrations.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/components/admin/hubs/DomainHubLayout";

const CloudBackboneAdmin = lazy(() => import("@/pages/admin/cloud/CloudBackboneAdmin"));
const MCSyncCloud = lazy(() => import("@/pages/admin/modules/MCSyncCloud"));
const IntegrationConciergePage = lazy(() => import("@/pages/admin/IntegrationConciergePage"));

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

export default function IntegrationsHome() {
  const modules: HubModule[] = [
    {
      id: "cloud-backbone",
      label: "Cloud Backbone",
      description: "Connectors, OAuth, sync providers.",
      legacyPath: "/admin/cloud-backbone",
      render: wrap(CloudBackboneAdmin),
    },
    {
      id: "sync",
      label: "Sync",
      description: "Sync state and integration health.",
      legacyPath: "/admin/mc/sync-cloud",
      render: wrap(MCSyncCloud),
    },
    {
      id: "concierge",
      label: "Integration Concierge",
      description: "Operator-assisted integration triage.",
      render: wrap(IntegrationConciergePage),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="integrations" modules={modules} defaultTabId="cloud-backbone" />
    </AdminControlPlaneShell>
  );
}
