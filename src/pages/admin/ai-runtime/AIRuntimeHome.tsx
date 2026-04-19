// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Hub (Admin AI Engineer Team — single window)
// Canonical entry for /admin/ai-runtime.
//
// Tabs are NOT hardcoded here. They live in the canonical registry:
//   src/lib/admin/ai-engineer-hub/tab-registry.ts
//
// The CI gate `check-ai-engineer-tab-registry` enforces that every
// panel under src/components/admin/ai-runtime/** and every board
// under src/pages/admin/ai-runtime/** is either registered or
// explicitly archived. Adding a panel without registering it fails
// the build.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense, type ComponentType } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { AdminControlPlaneShell } from "@/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/components/admin/hubs/DomainHubLayout";
import {
  AI_ENGINEER_HUB_TABS,
  AI_ENGINEER_HUB_DEFAULT_TAB_ID,
  type AIEngineerTabSpec,
} from "@/lib/admin/ai-engineer-hub/tab-registry";

function ModuleFallback() {
  return (
    <div className="text-xs text-muted-foreground py-12 text-center">Loading module…</div>
  );
}

// Vite requires a literal-prefix glob for tree-shaking.
// We split the registry into the two folders that contain panels.
const componentLoaders = import.meta.glob<{ default: ComponentType }>([
  "@/pages/admin/**/*.tsx",
  "@/components/admin/ai-runtime/**/*.tsx",
]);

function loaderFor(spec: AIEngineerTabSpec) {
  // Translate "@/pages/admin/x" → "/src/pages/admin/x.tsx"
  const candidate = `/src/${spec.componentPath.replace(/^@\//, "")}.tsx`;
  const loader = componentLoaders[candidate];
  if (loader) return loader;
  // Some pages use a named export — fall back to a hand-mapped loader.
  return namedExportLoaders[spec.id] ?? null;
}

// Hand-mapped loaders for components whose lazy() needs a named export
// (so the registry can stay declarative).
const namedExportLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  cost: () => import("@/pages/admin/AIT05CostEfficiency").then((m) => ({ default: m.AIT05CostEfficiency })),
};

function buildModule(spec: AIEngineerTabSpec): HubModule {
  const loader = loaderFor(spec);
  const Comp = loader ? lazy(loader as never) : null;
  return {
    id: spec.id,
    label: spec.label,
    description: spec.description,
    legacyPath: spec.legacyPath,
    render: () =>
      Comp ? (
        <Suspense fallback={<ModuleFallback />}>
          <Comp />
        </Suspense>
      ) : (
        <div className="text-xs text-destructive py-12 text-center">
          Tab "{spec.id}" registry mount failed: cannot resolve {spec.componentPath}
        </div>
      ),
  };
}

export default function AIRuntimeHome() {
  const modules: HubModule[] = AI_ENGINEER_HUB_TABS.map(buildModule);

  return (
    <AdminControlPlaneShell>
      <div className="flex justify-end px-4 pt-2">
        <Link to="/admin/health/error-patrol">
          <Button size="sm" variant="outline">
            <ExternalLink className="mr-1 h-3 w-3" />
            Open Error Patrol
          </Button>
        </Link>
      </div>
      <DomainHubLayout
        domain="ai-runtime"
        modules={modules}
        defaultTabId={AI_ENGINEER_HUB_DEFAULT_TAB_ID}
      />
    </AdminControlPlaneShell>
  );
}
