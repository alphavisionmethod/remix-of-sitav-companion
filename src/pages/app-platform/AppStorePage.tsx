// ═══════════════════════════════════════════════════════════════
// SITA OS — App Store Home Page
// Premium software discovery marketplace with live state
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import {
  APP_BUNDLES, APP_CATEGORIES, searchApps,
} from "@/lib/app-platform";
import {
  StoreHero, AppCard, FeaturedAppCard, AppLane, BundleCard,
  CategoryStrip, InstallSheet,
} from "@/components/sita/app-platform/AppStoreComponents";
import type { AppDefinition, AppCategory } from "@/lib/app-platform/types";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const AppStorePage = () => {
  const { isDemoMode } = useDataMode();
  const { apps, installedApps, installApp } = useAppPlatform();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [installTarget, setInstallTarget] = useState<AppDefinition | null>(null);

  const searchResults = useMemo(() => {
    if (query.length <= 1) return null;
    const q = query.toLowerCase();
    return apps.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.publisher.toLowerCase().includes(q) ||
      a.tags.some(t => t.includes(q)) ||
      a.category.includes(q)
    );
  }, [query, apps]);

  const filteredApps = useMemo(() => {
    if (activeCategory === "all") return apps;
    return apps.filter(a => a.category === activeCategory);
  }, [activeCategory, apps]);

  const webApps = useMemo(() => apps.filter(a => a.appClass === "web-app" || a.appClass === "wrapped-app"), [apps]);
  const devApps = useMemo(() => apps.filter(a => a.category === "developer-tools"), [apps]);
  const commApps = useMemo(() => apps.filter(a => a.category === "communication"), [apps]);
  const prodApps = useMemo(() => apps.filter(a => a.category === "productivity"), [apps]);
  const newApps = useMemo(() => apps.filter(a => a.isNew), [apps]);

  // Profile-aware recommendations
  const recommendedApps = useMemo(() => {
    return apps.filter(a =>
      a.installStatus !== "installed" && (a.featured || a.whySitaRecommends)
    ).slice(0, 6);
  }, [apps]);

  const goApp = (id: string) => navigate(`/app-store/app/${id}`);

  const handleInstall = async () => {
    if (installTarget) {
      await installApp(installTarget.id);
      setInstallTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <DemoModeBadge />
      <h1 className="sr-only">App Store</h1>
      <StoreHero installedCount={installedApps.length} appsAvailable={apps.length} />

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
          {/* Recommended for Your Environment */}
          {recommendedApps.length > 0 && (
            <AppLane title="Recommended for Your Environment" subtitle="Based on your setup and preferences" apps={recommendedApps} onAppClick={goApp} />
          )}

          {/* Featured */}
          {(() => {
            const featured = apps.filter(a => a.featured);
            return featured.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {featured.slice(0, 2).map(app => (
                  <FeaturedAppCard key={app.id} app={app} onClick={() => goApp(app.id)} />
                ))}
              </div>
            ) : null;
          })()}

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
              <AppLane title="Web Apps You Can Install" subtitle="Beautiful shell-native experiences" apps={webApps} onAppClick={goApp} />
              <AppLane title="Communication" subtitle="Stay connected" apps={commApps} onAppClick={goApp} />
              <AppLane title="Productivity" subtitle="Get more done" apps={prodApps} onAppClick={goApp} />
              <AppLane title="Developer Tools" subtitle="Your complete dev environment" apps={devApps} onAppClick={goApp}
                onSeeAll={() => setActiveCategory("developer-tools")} />

              {/* Starter Packs */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">Starter Packs</h3>
                <p className="text-xs text-muted-foreground -mt-1">Curated collections to get started fast</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {APP_BUNDLES.map(bundle => {
                    const bundleApps = bundle.appIds.map(id => apps.find(a => a.id === id)).filter(Boolean) as AppDefinition[];
                    return <BundleCard key={bundle.id} bundle={bundle} apps={bundleApps}
                      onClick={() => navigate(`/app-store/bundle/${bundle.id}`)} />;
                  })}
                </div>
              </div>

              {newApps.length > 0 && <AppLane title="New Releases" apps={newApps} onAppClick={goApp} />}

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">All Apps</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {apps.map(app => <AppCard key={app.id} app={app} onClick={() => goApp(app.id)} />)}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Install Sheet */}
      {installTarget && (
        <InstallSheet app={installTarget} onClose={() => setInstallTarget(null)}
          onInstall={handleInstall} />
      )}
    </div>
  );
};

export default AppStorePage;
