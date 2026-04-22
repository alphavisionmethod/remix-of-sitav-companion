// ═══════════════════════════════════════════════════════════════
// SITA OS — APS22 Developer Tools Catalog (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Code, Terminal, GitBranch, Database, Globe, Package, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { APP_BUNDLES } from "@/lib/app-platform";
import { AppCard, BundleCard, AppIcon } from "@/components/sita/app-platform/AppStoreComponents";
import type { AppDefinition } from "@/domains/apps/types";
import { DEMO_DEV_CATEGORIES } from "@/data/seed/core-pages";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const DevToolsCatalogPage = () => {
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();
  const { apps } = useAppPlatform();
  const [activeCat, setActiveCat] = useState("all");

  const devApps = useMemo(() => apps.filter(a => a.category === "developer-tools"), [apps]);
  const devBundle = APP_BUNDLES.find(b => b.id === "developer-essentials");

  const filtered = useMemo(() => {
    if (activeCat === "all") return devApps;
    return devApps.filter(a => {
      if (activeCat === "editors") return a.tags.some(t => ["code", "editor"].includes(t));
      if (activeCat === "git") return a.tags.some(t => ["git", "github", "version-control"].includes(t));
      if (activeCat === "api") return a.tags.some(t => ["api", "testing"].includes(t));
      if (activeCat === "containers") return a.tags.some(t => ["containers", "devops", "kubernetes"].includes(t));
      if (activeCat === "terminal") return a.tags.some(t => ["terminal", "shell", "cli"].includes(t));
      return false;
    });
  }, [activeCat, devApps]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
<button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to App Store
      </button>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600/15 via-card to-purple-600/10 border border-border p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Code className="h-7 w-7 text-primary" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Developer Tools</h1>
            <p className="text-sm text-muted-foreground">{devApps.length} tools for your complete dev environment</p>
          </div>
        </div>
      </div>

      {/* Dev Bundle Promo */}
      {devBundle && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Quick Start</h3>
          <BundleCard bundle={devBundle}
            apps={devBundle.appIds.map(id => apps.find(a => a.id === id)).filter(Boolean) as AppDefinition[]}
            onClick={() => navigate(`/app-store/bundle/${devBundle.id}`)} />
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(isDemoMode ? DEMO_DEV_CATEGORIES : [] as typeof DEMO_DEV_CATEGORIES).map(c => {
          const Icon = c.icon;
          return (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={cn("shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                activeCat === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
              <Icon className="h-3.5 w-3.5" /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Apps Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map(app => <AppCard key={app.id} app={app} onClick={() => navigate(`/app-store/app/${app.id}`)} />)}
      </div>
      {filtered.length === 0 && <p className="text-center py-12 text-sm text-muted-foreground">No tools in this category yet</p>}
    </div>
  );
};

export default DevToolsCatalogPage;
