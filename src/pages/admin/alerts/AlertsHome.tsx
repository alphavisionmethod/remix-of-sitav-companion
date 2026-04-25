// ═══════════════════════════════════════════════════════════════
// SITA OS — Alerts Hub (Phase 3)
// Canonical entry for /admin/alerts. Single triage center —
// composes incident, AI, integration and degraded-state surfaces.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";
import { NoSilentFailureAlerts } from "@/platform/admin/components/admin/shells/NoSilentFailureAlerts";

const MCIncidents = lazy(() => import("@/pages/admin/modules/MCIncidents"));
const AIFixCenter = lazy(() => import("@/pages/admin/AIFixCenter"));
const AISelfHealing = lazy(() => import("@/pages/admin/AISelfHealing"));

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

export default function AlertsHome() {
  const modules: HubModule[] = [
    {
      id: "critical",
      label: "Critical",
      description: "Critical alerts requiring immediate attention.",
      badge: { label: "P0", tone: "critical" },
      render: () => <NoSilentFailureAlerts />,
    },
    {
      id: "incidents",
      label: "Incidents",
      description: "Active incidents and recovery status.",
      legacyPath: "/admin/mc/incidents",
      render: wrap(MCIncidents),
    },
    {
      id: "ai-failures",
      label: "AI Failures",
      description: "AI runtime failures and fixes.",
      legacyPath: "/admin/ai-fix-center",
      render: wrap(AIFixCenter),
    },
    {
      id: "self-healing",
      label: "Self-Healing",
      description: "Automated remediation status.",
      legacyPath: "/admin/ai-self-healing",
      render: wrap(AISelfHealing),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="alerts" modules={modules} defaultTabId="critical" />
    </AdminControlPlaneShell>
  );
}
