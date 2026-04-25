// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Hub (Phase 25)
// Canonical entry for /admin/support. Owner support workflow.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";

const MCSupport = lazy(() => import("@/pages/admin/modules/MCSupport"));
const MCLogsAudit = lazy(() => import("@/pages/admin/modules/MCLogsAudit"));
const FCC04RunbookCenter = lazy(() => import("@/pages/admin/FCC04RunbookCenter"));
const FCC10HumanOversightEscalation = lazy(
  () => import("@/pages/admin/FCC10HumanOversightEscalation"),
);
const FCC11IncidentResponseTimeline = lazy(
  () => import("@/pages/admin/FCC11IncidentResponseTimeline"),
);
const AdminRecoveryOperations = lazy(
  () => import("@/pages/admin/support/AdminRecoveryOperations"),
);

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

export default function SupportHome() {
  const modules: HubModule[] = [
    {
      id: "cases",
      label: "Cases",
      description: "Open support cases and triage.",
      legacyPath: "/admin/mc/support",
      render: wrap(MCSupport),
    },
    {
      id: "logs",
      label: "Logs & Audit",
      description: "Search audit logs and operator actions.",
      legacyPath: "/admin/mc/logs",
      render: wrap(MCLogsAudit),
    },
    {
      id: "runbooks",
      label: "Runbooks",
      description: "Recovery procedures and runbooks.",
      legacyPath: "/admin/support/runbooks",
      render: wrap(FCC04RunbookCenter),
    },
    {
      id: "incidents",
      label: "Incident Timeline",
      description: "Incident response timeline.",
      legacyPath: "/admin/founder/incidents",
      render: wrap(FCC11IncidentResponseTimeline),
    },
    {
      id: "oversight",
      label: "Human Oversight",
      description: "Escalations needing human review.",
      legacyPath: "/admin/founder/oversight",
      render: wrap(FCC10HumanOversightEscalation),
    },
    {
      id: "recovery",
      label: "Recovery Ops",
      description: "Reset users, revoke sessions, replay webhooks, export diagnostics.",
      legacyPath: "/admin/support/recovery-ops",
      render: wrap(AdminRecoveryOperations),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="support" modules={modules} defaultTabId="cases" />
    </AdminControlPlaneShell>
  );
}
