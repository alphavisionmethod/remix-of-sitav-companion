// ═══════════════════════════════════════════════════════════════
// SITA OS — Pack Store Home Page
// Premium curated expansion layer
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SitaSectionHeader } from "@/components/sita/SitaCard";
import {
  StoreHero, FeaturedPackCard, PackCard, InternalAppCard, CategoryStrip, StoreEmptyState,
  PackStatusBadge, resolveIcon,
} from "@/components/sita/PackStoreComponents";
import {
  PACK_CATALOG, INTERNAL_APPS, STORE_CATEGORIES,
  getFeaturedPacks, getInstalledPacks, getPacksWithUpdates, getRecommendedPacks,
  INSTALL_STATES, type StoreCategory, type PackManifest,
} from "@/lib/pack-store";
import { ArrowRight, Package, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { usePackInstalls } from "@/hooks/use-live-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";




const PackStorePage = () => {
  const navigate = useNavigate();
  const { data: liveInstalls } = usePackInstalls();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const featured = getFeaturedPacks();
  const installed = getInstalledPacks();
  const withUpdates = getPacksWithUpdates();
  const installedIds = installed.map(p => p.pack_id);
  const recommended = getRecommendedPacks(installedIds);
  const trialsActive = installed.filter(p => p.installState.status === "trial-active").length;

  const filteredPacks = activeCategory === "all"
    ? PACK_CATALOG
    : PACK_CATALOG.filter(p => p.category === activeCategory);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
<h1 className="sr-only">Pack Store</h1>
      {/* Hero */}
      <StoreHero
        installedCount={installed.length}
        appsEnabled={INTERNAL_APPS.filter(a => a.default_enabled).length}
        updatesAvailable={withUpdates.length}
        trialsActive={trialsActive}
      />

      {/* Updates Available */}
      {withUpdates.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Updates Available" subtitle={`${withUpdates.length} pack(s) have new versions`} />
          {withUpdates.map(pack => (
            <div key={pack.pack_id} onClick={() => navigate(`/store/packs/${pack.pack_id}`)} className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 cursor-pointer transition-all hover:shadow-card-hover group">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                  <RefreshCw className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{pack.name}</p>
                  <p className="text-xs text-muted-foreground">{pack.installState.version_installed} → {pack.version}</p>
                </div>
              </div>
              <button className="text-xs font-medium text-primary hover:underline">Update</button>
            </div>
          ))}
        </div>
      )}

      {/* Featured Packs */}
      <div className="space-y-3">
        <SitaSectionHeader title="Featured" subtitle="Hand-picked by SITA" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 6).map(pack => (
            <FeaturedPackCard key={pack.pack_id} pack={pack} onClick={() => navigate(`/store/packs/${pack.pack_id}`)} />
          ))}
        </div>
      </div>

      {/* Internal Apps */}
      <div className="space-y-3">
        <SitaSectionHeader title="Internal Apps" subtitle="Core workspaces inside SITA OS" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {INTERNAL_APPS.map(app => (
            <InternalAppCard key={app.app_id} app={app} onClick={() => navigate(`/store/apps/${app.app_id}`)} />
          ))}
        </div>
      </div>

      {/* Recommended for You */}
      {recommended.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Recommended for You" subtitle="Based on your setup and usage patterns" />
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended.map(pack => (
              <PackCard key={pack.pack_id} pack={pack} onClick={() => navigate(`/store/packs/${pack.pack_id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Category Browser */}
      <div className="space-y-3">
        <SitaSectionHeader title="Browse by Category" />
        <CategoryStrip
          categories={[{ id: "all", label: "All Packs", icon: "Package" }, ...STORE_CATEGORIES]}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPacks.map(pack => (
            <PackCard key={pack.pack_id} pack={pack} onClick={() => navigate(`/store/packs/${pack.pack_id}`)} />
          ))}
        </div>
      </div>

      {/* Currently Installed */}
      {installed.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader
            title="Installed"
            subtitle={`${installed.length} packs active`}
            action={<button onClick={() => navigate("/store/installed")} className="text-xs text-primary hover:underline">Manage all</button>}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {installed.map(pack => (
              <div key={pack.pack_id} onClick={() => navigate(`/store/packs/${pack.pack_id}`)} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer transition-all hover:shadow-card-hover">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${pack.gradient}`}>
                  {(() => { const Icon = resolveIcon(pack.icon); return <Icon className="h-4 w-4 text-foreground" />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{pack.name}</p>
                  <p className="text-[10px] text-muted-foreground">v{pack.installState.version_installed}</p>
                </div>
                <PackStatusBadge status={pack.installState.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Bundle CTA */}
      <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 p-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> Founder Operating Bundle
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Founder Boardroom + Revenue Autopilot + Collections — save 30%</p>
          <p className="text-xs text-accent font-medium mt-2">$59/mo instead of $87/mo</p>
        </div>
        <button onClick={() => navigate("/store/packs/pack-founder-boardroom")} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors">
          View Bundle <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PackStorePage;
