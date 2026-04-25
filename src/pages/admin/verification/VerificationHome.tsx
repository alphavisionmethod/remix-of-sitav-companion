// ═══════════════════════════════════════════════════════════════
// SITA OS — Verification Hub (Phase 25)
// Canonical entry for /admin/verification.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";

const LaunchHonestyBoard = lazy(() => import("@/pages/admin/LaunchHonestyBoard"));
const META01ArchitectureAtlas = lazy(() => import("@/pages/admin/META01ArchitectureAtlas"));
const META03GoldenPathHealth = lazy(() => import("@/pages/admin/META03GoldenPathHealth"));
const META04ProductReality = lazy(() => import("@/pages/admin/META04ProductReality"));
const META05CompletenessMatrix = lazy(() => import("@/pages/admin/META05CompletenessMatrix"));
const CI01CIUmbrellaCenter = lazy(() => import("@/pages/admin/CI01CIUmbrellaCenter"));
const DbTruthExplorer = lazy(() => import("@/pages/admin/DbTruthExplorer"));
const MCArchitectureDashboard = lazy(
  () => import("@/pages/admin/modules/MCArchitectureDashboard"),
);
const CrossDomainCoherence = lazy(() => import("@/pages/admin/verification/CrossDomainCoherence"));

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

export default function VerificationHome() {
  const modules: HubModule[] = [
    {
      id: "launch-honesty",
      label: "Launch Honesty",
      description: "Compare launch claims vs evidence.",
      legacyPath: "/admin/verification/launch-honesty",
      render: wrap(LaunchHonestyBoard),
    },
    {
      id: "ci-umbrella",
      label: "CI Umbrella",
      description: "All architectural CI gates.",
      legacyPath: "/admin/ci/umbrella",
      render: wrap(CI01CIUmbrellaCenter),
    },
    {
      id: "completeness",
      label: "Completeness",
      description: "Completeness matrix across surfaces.",
      legacyPath: "/admin/meta/completeness",
      render: wrap(META05CompletenessMatrix),
    },
    {
      id: "reality",
      label: "Product Reality",
      description: "Product reality across the seven surfaces.",
      legacyPath: "/admin/meta/reality",
      render: wrap(META04ProductReality),
    },
    {
      id: "atlas",
      label: "Architecture Atlas",
      description: "Architectural map across registries.",
      legacyPath: "/admin/meta-arch/atlas",
      render: wrap(META01ArchitectureAtlas),
    },
    {
      id: "golden-paths",
      label: "Golden Paths",
      description: "Golden-path coverage and health.",
      legacyPath: "/admin/meta-arch/golden-paths",
      render: wrap(META03GoldenPathHealth),
    },
    {
      id: "architecture",
      label: "Architecture Tests",
      description: "Architecture conformance dashboard.",
      legacyPath: "/admin/mc/architecture",
      render: wrap(MCArchitectureDashboard),
    },
    {
      id: "db-truth",
      label: "DB Truth",
      description: "Database truth explorer.",
      legacyPath: "/admin/db-truth-explorer",
      render: wrap(DbTruthExplorer),
    },
    {
      id: "cross-domain-coherence",
      label: "Cross-Domain Coherence",
      description: "Activates when verification, trust, or incident events span multiple domains.",
      legacyPath: "/admin/verification/cross-domain-coherence",
      render: wrap(CrossDomainCoherence),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="verification" modules={modules} defaultTabId="launch-honesty" />
    </AdminControlPlaneShell>
  );
}
