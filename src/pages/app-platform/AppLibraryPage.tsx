// ═══════════════════════════════════════════════════════════════
// SITA OS — App Library Page
// Installed app management
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Grid3X3, List, Pin, Clock, Globe, Monitor, Package, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CATALOG, getInstalledApps } from "@/lib/app-platform";
import { AppCard, AppIcon, VerificationBadge, AppSourceLabel, CategoryStrip } from "@/components/sita/app-platform/AppStoreComponents";
import { APP_CATEGORIES } from "@/lib/app-platform/catalog";
import type { AppDefinition } from "@/lib/app-platform/types";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

type LibView = "all" | "pinned" | "recent" | "web" | "native" | "updates";

const AppLibraryPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<LibView>("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const installed = getInstalledApps();
  const allApps = APP_CATALOG; // Show all for demo

  const filteredApps = useMemo(() => {
    let apps = allApps;
    if (view === "pinned") apps = apps.filter(a => a.pinnedToDock);
    if (view === "web") apps = apps.filter(a => a.appClass === "web-app" || a.appClass === "wrapped-app");
    if (view === "native") apps = apps.filter(a => a.appClass === "native" || a.appClass === "internal");
    if (view === "updates") apps = apps.filter(a => a.installStatus === "update-available");
    if (query) {
      const q = query.toLowerCase();
      apps = apps.filter(a => a.name.toLowerCase().includes(q) || a.publisher.toLowerCase().includes(q));
    }
    return apps;
  }, [allApps, view, query]);

  const views: { id: LibView; label: string; icon: typeof Package }[] = [
    { id: "all", label: "All Apps", icon: Grid3X3 },
    { id: "pinned", label: "Pinned", icon: Pin },
    { id: "web", label: "Web Apps", icon: Globe },
    { id: "native", label: "Native", icon: Monitor },
    { id: "updates", label: "Updates", icon: Package },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DemoModeBadge />
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">App Library</h1>
        <p className="text-sm text-muted-foreground mt-1">{installed.length} installed · {allApps.length} available</p>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {views.map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={cn("shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
              view === v.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
            <v.icon className="h-3.5 w-3.5" /> {v.label}
          </button>
        ))}
      </div>

      {/* Search + Layout */}
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

      {/* Apps */}
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
                <p className="text-sm font-semibold text-foreground truncate">{app.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{app.shortDescription}</p>
              </div>
              <VerificationBadge level={app.trustLevel} />
              <AppSourceLabel appClass={app.appClass} />
              {app.installStatus === "installed" ? (
                <span className="text-[10px] text-[hsl(var(--trust-safe))] font-medium">Installed</span>
              ) : (
                <span className="text-[10px] text-primary font-medium">Get</span>
              )}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          ))}
        </div>
      )}

      {filteredApps.length === 0 && (
        <p className="text-center py-12 text-muted-foreground text-sm">No apps match your filters</p>
      )}
    </div>
  );
};

export default AppLibraryPage;
