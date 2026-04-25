// ═══════════════════════════════════════════════════════════════
// SITA OS — Integrations Hub (Phase 25 + Phase 4 closure)
// Canonical entry for /admin/integrations.
// Adds: 7-day refresh streak panel; OAuth board uses canonical
// ConnectorStateBadge + receipt drawer + reauth CTA.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";

const CloudBackboneAdmin = lazy(() => import("@/pages/admin/cloud/CloudBackboneAdmin"));
const MCSyncCloud = lazy(() => import("@/pages/admin/modules/MCSyncCloud"));
const IntegrationConciergePage = lazy(() => import("@/pages/admin/IntegrationConciergePage"));
const OAuthRefreshHealthBoard = lazy(() => import("@/components/admin/OAuthRefreshHealthBoard"));
const IntegrationStreakPanel = lazy(() =>
  import("@/components/admin/integrations/IntegrationStreakPanel"),
);

function ModuleFallback() {
  return (
    <div className="flex flex-col items-center text-xs text-muted-foreground py-12 text-center sm:py-16">
      Loading module…
    </div>
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
    {
      id: "oauth-refresh-health",
      label: "OAuth Refresh Health",
      description: "Live Google/Microsoft/Slack token refresh probe results with reauth CTA.",
      render: wrap(OAuthRefreshHealthBoard),
    },
    {
      id: "refresh-streak",
      label: "7-Day Streak",
      description: "Per-provider refresh streak (worst-of-day) sourced from real probe receipts.",
      render: wrap(IntegrationStreakPanel),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="integrations" modules={modules} defaultTabId="cloud-backbone" />
    </AdminControlPlaneShell>
  );
}
