// ═══════════════════════════════════════════════════════════════
// SITA OS — Config Hub (Phase 25)
// Canonical entry for /admin/config.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";

const MCKnowledgeBase = lazy(() => import("@/pages/admin/modules/MCKnowledgeBase"));
const FCC06ProgramManagementBoard = lazy(
  () => import("@/pages/admin/FCC06ProgramManagementBoard"),
);
const FCC12KnowledgeMemorySystem = lazy(
  () => import("@/pages/admin/FCC12KnowledgeMemorySystem"),
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

export default function ConfigHome() {
  const modules: HubModule[] = [
    {
      id: "knowledge",
      label: "Knowledge Base",
      description: "Operational knowledge base.",
      legacyPath: "/admin/mc/knowledge",
      render: wrap(MCKnowledgeBase),
    },
    {
      id: "programs",
      label: "Programs",
      description: "Program management board.",
      legacyPath: "/admin/founder/programs",
      render: wrap(FCC06ProgramManagementBoard),
    },
    {
      id: "memory",
      label: "Knowledge Memory",
      description: "Knowledge memory system.",
      legacyPath: "/admin/founder/knowledge",
      render: wrap(FCC12KnowledgeMemorySystem),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="config" modules={modules} defaultTabId="knowledge" />
    </AdminControlPlaneShell>
  );
}
