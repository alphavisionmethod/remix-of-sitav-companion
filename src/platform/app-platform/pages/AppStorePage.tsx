// ═══════════════════════════════════════════════════════════════
// SITA OS — App Store Home Page (fully wired)
// Premium software discovery marketplace with all lanes
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Search, Shield, Sparkles } from "lucide-react";
import { useAppPlatform } from "@/platform/app-platform/contexts/AppPlatformContext";
import {
  APP_BUNDLES, APP_CATEGORIES,
} from "@/lib/app-platform";
import {
  StoreHero, AppCard, FeaturedAppCard, AppLane, BundleCard,
  CategoryStrip, InstallSheet,
} from "@/platform/sita/components/sita/app-platform/AppStoreComponents";
import type { AppDefinition, AppCategory } from "@/domains/apps/types";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const AppStorePage = () => {
  const { apps, installedApps, installApp, pinToDock } = useAppPlatform();
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

  // Category-based lanes
  const webApps = useMemo(() => apps.filter(a => a.appClass === "web-app" || a.appClass === "wrapped-app"), [apps]);
  const devApps = useMemo(() => apps.filter(a => a.category === "developer-tools"), [apps]);
  const commApps = useMemo(() => apps.filter(a => a.category === "communication"), [apps]);
  const prodApps = useMemo(() => apps.filter(a => a.category === "productivity"), [apps]);
  const bizApps = useMemo(() => apps.filter(a => a.category === "business"), [apps]);
  const finApps = useMemo(() => apps.filter(a => a.category === "finance"), [apps]);
  const secApps = useMemo(() => apps.filter(a => a.category === "security"), [apps]);
  const utilApps = useMemo(() => apps.filter(a => a.category === "utilities"), [apps]);
  const householdApps = useMemo(() => apps.filter(a => a.category === "household"), [apps]);
  const browserApps = useMemo(() => apps.filter(a => a.category === "browsers"), [apps]);
  const entertainApps = useMemo(() => apps.filter(a => a.category === "entertainment"), [apps]);
  const newApps = useMemo(() => apps.filter(a => a.isNew), [apps]);
  const recentlyUpdated = useMemo(() => [...apps].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 6), [apps]);

  // Profile-aware recommendations
  const recommendedApps = useMemo(() => {
    return apps.filter(a =>
      a.installStatus !== "installed" && (a.featured || a.whySitaRecommends)
    ).slice(0, 6);
  }, [apps]);

  // Verified apps
  const verifiedApps = useMemo(() => apps.filter(a => a.trustLevel === "sita-verified" && a.installStatus !== "installed").slice(0, 8), [apps]);

  const goApp = (id: string) => navigate(`/app-store/app/${id}`);

  const handleInstall = async () => {
    if (installTarget) {
      await installApp(installTarget.id);
      setInstallTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
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
          { label: "Compare", path: "/app-store/compare" },
          { label: "Open With", path: "/app-store/open-with" },
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
            <AppLane title="Recommended for Your Environment"
              subtitle="Based on your setup, profile, and preferences"
              apps={recommendedApps} onAppClick={goApp} />
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
              {/* Works beautifully with SITA */}
              <AppLane title="Works Beautifully with SITA"
                subtitle="Deep shell integration, trust-aware launches, and receipts"
                apps={apps.filter(a => a.worksWithSita.length >= 4).slice(0, 8)}
                onAppClick={goApp} />

              {/* Web Apps */}
              <AppLane title="Trusted Web Apps You Can Install"
                subtitle="Beautiful shell-native experiences from the web"
                apps={webApps} onAppClick={goApp}
                onSeeAll={() => navigate("/app-store/web-install")} />

              {/* Browsers */}
              {browserApps.length > 0 && (
                <AppLane title="Browsers" subtitle="Choose your default browser"
                  apps={browserApps} onAppClick={goApp}
                  onSeeAll={() => setActiveCategory("browsers")} />
              )}

              {/* Communication */}
              <AppLane title="Communication" subtitle="Stay connected" apps={commApps} onAppClick={goApp}
                onSeeAll={() => setActiveCategory("communication")} />

              {/* Productivity */}
              <AppLane title="Productivity" subtitle="Get more done" apps={prodApps} onAppClick={goApp}
                onSeeAll={() => setActiveCategory("productivity")} />

              {/* Business */}
              {bizApps.length > 0 && (
                <AppLane title="Business" subtitle="Tools for running your business" apps={bizApps} onAppClick={goApp}
                  onSeeAll={() => setActiveCategory("business")} />
              )}

              {/* Developer Tools */}
              <AppLane title="Developer Tools" subtitle="Your complete dev environment" apps={devApps} onAppClick={goApp}
                onSeeAll={() => navigate("/app-store/dev-tools")} />

              {/* Finance */}
              {finApps.length > 0 && (
                <AppLane title="Finance" subtitle="Accounting, budgeting, and money tools" apps={finApps} onAppClick={goApp}
                  onSeeAll={() => setActiveCategory("finance")} />
              )}

              {/* Security */}
              {secApps.length > 0 && (
                <AppLane title="Security & Privacy" subtitle="Protect your digital life" apps={secApps} onAppClick={goApp}
                  onSeeAll={() => setActiveCategory("security")} />
              )}

              {/* Household */}
              {householdApps.length > 0 && (
                <AppLane title="Household & Family" subtitle="Coordinate your home life" apps={householdApps} onAppClick={goApp}
                  onSeeAll={() => setActiveCategory("household")} />
              )}

              {/* Utilities */}
              {utilApps.length > 0 && (
                <AppLane title="Utilities" subtitle="Essential tools and managers" apps={utilApps} onAppClick={goApp}
                  onSeeAll={() => setActiveCategory("utilities")} />
              )}

              {/* Entertainment */}
              {entertainApps.length > 0 && (
                <AppLane title="Entertainment" subtitle="Music, video, and fun" apps={entertainApps} onAppClick={goApp}
                  onSeeAll={() => setActiveCategory("entertainment")} />
              )}

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

              {/* Verified Publishers */}
              {verifiedApps.length > 0 && (
                <AppLane title="SITA Verified"
                  subtitle="Highest trust — signature verified and SITA-approved"
                  apps={verifiedApps} onAppClick={goApp} />
              )}

              {/* New Releases */}
              {newApps.length > 0 && <AppLane title="New Releases" apps={newApps} onAppClick={goApp} />}

              {/* Recently Updated */}
              <AppLane title="Recently Updated"
                subtitle="Latest versions with new features and patches"
                apps={recentlyUpdated} onAppClick={goApp} />

              {/* All Apps */}
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
          onInstall={handleInstall}
          onPinToDock={(id) => { pinToDock(id); toast.success("Pinned to dock"); }}
          onOpen={() => {
            const target = installTarget;
            setInstallTarget(null);
            if (target?.routePath) navigate(target.routePath);
            else if (target?.externalUrl) window.open(target.externalUrl, '_blank', 'noopener');
          }} />
      )}
    </div>
  );
};

export default AppStorePage;
