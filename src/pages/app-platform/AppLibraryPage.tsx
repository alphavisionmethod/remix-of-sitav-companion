// ═══════════════════════════════════════════════════════════════
// SITA OS — App Library Page (fully wired + all views)
// Installed app management with live state
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Grid3X3, List, Pin, Globe, Monitor, Package, ArrowRight,
  Check, Clock, Shield, Building, RefreshCw, Layers, Sparkles, ExternalLink,
} from "lucide-react";
import type { AppDefinition } from "@/domains/apps/types";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { AppIcon, VerificationBadge, AppSourceLabel } from "@/components/sita/app-platform/AppStoreComponents";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

type LibView = "all" | "installed" | "pinned" | "web" | "native" | "wrapped" | "internal" | "updates" | "recent" | "enterprise";

const AppLibraryPage = () => {
  const { apps, installedApps, updatableApps } = useAppPlatform();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<LibView>("installed");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "recent" | "publisher">("name");

  const launchApp = useCallback((app: AppDefinition) => {
    if (app.routePath) navigate(app.routePath);
    else if (app.externalUrl) window.open(app.externalUrl, '_blank', 'noopener');
    else navigate(`/app-store/app/${app.id}`);
  }, [navigate]);

  const filteredApps = useMemo(() => {
    let list: typeof apps;
    switch (view) {
      case "installed": list = installedApps; break;
      case "pinned": list = apps.filter(a => a.pinnedToDock); break;
      case "web": list = apps.filter(a => a.appClass === "web-app" || a.appClass === "wrapped-app"); break;
      case "native": list = apps.filter(a => a.appClass === "native"); break;
      case "wrapped": list = apps.filter(a => a.appClass === "wrapped-app"); break;
      case "internal": list = apps.filter(a => a.appClass === "internal"); break;
      case "updates": list = updatableApps; break;
      case "recent": list = [...installedApps].sort((a, b) => (b.installedAt || "").localeCompare(a.installedAt || "")).slice(0, 10); break;
      case "enterprise": list = apps.filter(a => a.sourceOrigin === "private-catalog" || a.managedByPolicy); break;
      default: list = apps;
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.publisher.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)));
    }

    if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "recent") list = [...list].sort((a, b) => (b.installedAt || "").localeCompare(a.installedAt || ""));
    else if (sortBy === "publisher") list = [...list].sort((a, b) => a.publisher.localeCompare(b.publisher));

    return list;
  }, [apps, installedApps, updatableApps, view, query, sortBy]);

  const views: { id: LibView; label: string; icon: typeof Package; count?: number }[] = [
    { id: "installed", label: "Installed", icon: Check, count: installedApps.length },
    { id: "all", label: "All Apps", icon: Grid3X3 },
    { id: "pinned", label: "Pinned", icon: Pin },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "web", label: "Web Apps", icon: Globe },
    { id: "native", label: "Native", icon: Monitor },
    { id: "wrapped", label: "Wrapped", icon: Layers },
    { id: "internal", label: "System", icon: Shield },
    { id: "updates", label: "Updates", icon: RefreshCw, count: updatableApps.length },
    { id: "enterprise", label: "Enterprise", icon: Building },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
<div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">App Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {installedApps.length} installed · {apps.length} available · {updatableApps.length} updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg bg-secondary px-3 py-1.5 text-xs text-foreground border border-border">
            <option value="name">Sort: Name</option>
            <option value="recent">Sort: Recent</option>
            <option value="publisher">Sort: Publisher</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {views.map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={cn("shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
              view === v.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
            <v.icon className="h-3.5 w-3.5" /> {v.label}
            {v.count !== undefined && v.count > 0 && (
              <span className="ml-0.5 text-[9px] opacity-70">{v.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search your apps…" value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20" />
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          <button onClick={() => setLayout("grid")} className={cn("rounded-md p-1.5 transition-colors", layout === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setLayout("list")} className={cn("rounded-md p-1.5 transition-colors", layout === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {layout === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map(app => (
            <div key={app.id} onClick={() => navigate(`/app-store/app/${app.id}`)}
              className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-lg group">
              <div className="flex items-center gap-3 mb-3">
                <AppIcon icon={app.icon} iconBg={app.iconBg} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{app.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{app.publisher}</p>
                </div>
                {app.pinnedToDock && <Pin className="h-3 w-3 text-primary shrink-0" />}
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{app.shortDescription}</p>
              <div className="flex items-center gap-2">
                <VerificationBadge level={app.trustLevel} />
                <AppSourceLabel appClass={app.appClass} />
                {app.installStatus === "installed" && (
                  <button onClick={(e) => { e.stopPropagation(); launchApp(app); }}
                    className="ml-auto rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                    {app.externalUrl ? <ExternalLink className="h-2.5 w-2.5" /> : <ArrowRight className="h-2.5 w-2.5" />} Open
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredApps.map(app => (
            <div key={app.id} onClick={() => navigate(`/app-store/app/${app.id}`)}
              className="cursor-pointer flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-primary/20 group">
              <AppIcon icon={app.icon} iconBg={app.iconBg} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{app.name}</p>
                  {app.pinnedToDock && <Pin className="h-2.5 w-2.5 text-primary" />}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{app.shortDescription}</p>
              </div>
              <VerificationBadge level={app.trustLevel} />
              <AppSourceLabel appClass={app.appClass} />
              {app.installStatus === "installed" ? (
                <button onClick={(e) => { e.stopPropagation(); launchApp(app); }}
                  className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                  {app.externalUrl ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />} Open
                </button>
              ) : (
                <span className="text-[10px] text-primary font-medium">Get</span>
              )}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          ))}
        </div>
      )}

      {filteredApps.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No apps match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different view or search</p>
        </div>
      )}
    </div>
  );
};

export default AppLibraryPage;
