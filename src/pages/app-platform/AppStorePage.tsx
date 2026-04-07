// ═══════════════════════════════════════════════════════════════
// SITA OS — App Store Home Page
// Premium software discovery marketplace
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  APP_CATALOG, APP_BUNDLES, APP_CATEGORIES,
  getInstalledApps, getFeaturedApps, searchApps, getAppsByCategory,
} from "@/lib/app-platform";
import {
  StoreHero, AppCard, FeaturedAppCard, AppLane, BundleCard,
  CategoryStrip, InstallSheet,
} from "@/components/sita/app-platform/AppStoreComponents";
import type { AppDefinition } from "@/lib/app-platform/types";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const AppStorePage = () => {
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [installTarget, setInstallTarget] = useState<AppDefinition | null>(null);

  const installed = getInstalledApps();
  const featured = getFeaturedApps();

  const searchResults = useMemo(() => query.length > 1 ? searchApps(query) : null, [query]);

  const filteredApps = useMemo(() => {
    if (activeCategory === "all") return APP_CATALOG;
    return getAppsByCategory(activeCategory as unknown);
  }, [activeCategory]);

  const webApps = APP_CATALOG.filter(a => a.appClass === "web-app" || a.appClass === "wrapped-app");
  const devApps = APP_CATALOG.filter(a => a.category === "developer-tools");
  const commApps = APP_CATALOG.filter(a => a.category === "communication");
  const prodApps = APP_CATALOG.filter(a => a.category === "productivity");
  const newApps = APP_CATALOG.filter(a => a.isNew);

  const goApp = (id: string) => navigate(`/app-store/app/${id}`);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <DemoModeBadge />
      <StoreHero installedCount={installed.length} appsAvailable={APP_CATALOG.length} />

      {/* Quick Nav */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { label: "Library", path: "/app-store/library" },
          { label: "Updates", path: "/app-store/updates" },
          { label: "Permissions", path: "/app-store/permissions" },
          { label: "Associations", path: "/app-store/associations" },
          { label: "Install from Web", path: "/app-store/web-install" },
          { label: "External Package", path: "/app-store/external-install" },
          { label: "Dev Tools", path: "/app-store/dev-tools" },
          { label: "Enterprise", path: "/app-store/enterprise" },
          { label: "Receipts", path: "/app-store/receipts" },
        ].map(link => (
          <button key={link.path} onClick={() => navigate(link.path)}
            className="shrink-0 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            {link.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search apps, publishers, categories…" value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground">Search Results <span className="text-sm font-normal text-muted-foreground">({searchResults.length})</span></h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {searchResults.map(app => <AppCard key={app.id} app={app} onClick={() => goApp(app.id)} />)}
          </div>
          {searchResults.length === 0 && (
            <p className="text-center py-12 text-muted-foreground text-sm">No apps found for "{query}"</p>
          )}
        </div>
      )}

      {/* Main Content (hidden during search) */}
      {!searchResults && (
        <>
          {/* Featured */}
          {featured.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {featured.slice(0, 2).map(app => (
                <FeaturedAppCard key={app.id} app={app} onClick={() => goApp(app.id)} />
              ))}
            </div>
          )}

          {/* Categories */}
          <CategoryStrip categories={APP_CATEGORIES} active={activeCategory} onSelect={setActiveCategory} />

          {/* Category View */}
          {activeCategory !== "all" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredApps.map(app => <AppCard key={app.id} app={app} onClick={() => goApp(app.id)} />)}
              {filteredApps.length === 0 && (
                <p className="col-span-2 text-center py-12 text-muted-foreground text-sm">No apps in this category yet</p>
              )}
            </div>
          ) : (
            <>
              {/* Web Apps Lane */}
              <AppLane title="Web Apps You Can Install" subtitle="Beautiful shell-native experiences" apps={webApps} onAppClick={goApp} />

              {/* Communication */}
              <AppLane title="Communication" subtitle="Stay connected" apps={commApps} onAppClick={goApp} />

              {/* Productivity */}
              <AppLane title="Productivity" subtitle="Get more done" apps={prodApps} onAppClick={goApp} />

              {/* Developer Tools */}
              <AppLane title="Developer Tools" subtitle="Your complete dev environment" apps={devApps} onAppClick={goApp}
                onSeeAll={() => setActiveCategory("developer-tools")} />

              {/* Starter Packs */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">Starter Packs</h3>
                <p className="text-xs text-muted-foreground -mt-1">Curated collections to get started fast</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {APP_BUNDLES.map(bundle => {
                    const bundleApps = bundle.appIds.map(id => APP_CATALOG.find(a => a.id === id)).filter(Boolean) as AppDefinition[];
                    return <BundleCard key={bundle.id} bundle={bundle} apps={bundleApps}
                      onClick={() => navigate(`/app-store/bundle/${bundle.id}`)} />;
                  })}
                </div>
              </div>

              {/* New Releases */}
              {newApps.length > 0 && (
                <AppLane title="New Releases" apps={newApps} onAppClick={goApp} />
              )}

              {/* All Apps */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">All Apps</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {APP_CATALOG.map(app => <AppCard key={app.id} app={app} onClick={() => goApp(app.id)} />)}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Install Sheet */}
      {installTarget && (
        <InstallSheet app={installTarget} onClose={() => setInstallTarget(null)}
          onInstall={() => { /* update state */ }} />
      )}
    </div>
  );
};

export default AppStorePage;
