// ═══════════════════════════════════════════════════════════════
// SITA OS — App Library Window
// Native OS window showing all registered apps from AppRegistry
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { AppRegistry } from "@/platform/nova-sdk/core/registry";
import type { RegisteredApp } from "@/platform/nova-sdk/core/registry";
import { APP_TYPE, APP_MATERIALS, APP_COMPONENTS } from "@/platform/design-system/app-window-system";
import { Search, Grid, List, Shield, Play, CheckCircle, XCircle, Layers } from "lucide-react";
import { useAppPlatform } from "@/contexts/AppPlatformContext";

// ── State Badges ─────────────────────────────────────────────

const STATE_COLORS: Record<string, string> = {
  running: "bg-[hsl(130_55%_48%/0.15)] text-[hsl(130_55%_40%)] dark:text-[hsl(130_55%_60%)]",
  focused: "bg-[hsl(210_80%_55%/0.15)] text-[hsl(210_80%_45%)] dark:text-[hsl(210_80%_65%)]",
  registered: "bg-[hsl(0_0%_50%/0.10)] text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_60%)]",
  terminated: "bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_45%)] dark:text-[hsl(0_70%_60%)]",
  blurred: "bg-[hsl(45_80%_55%/0.12)] text-[hsl(45_80%_40%)] dark:text-[hsl(45_80%_60%)]",
  launching: "bg-[hsl(265_55%_58%/0.12)] text-[hsl(265_55%_50%)] dark:text-[hsl(265_55%_65%)]",
  suspending: "bg-[hsl(30_85%_55%/0.12)] text-[hsl(30_85%_45%)] dark:text-[hsl(30_85%_60%)]",
};

const CATEGORIES = ["All", "Productivity", "Utilities", "System", "Communication", "Media", "Development"];

type ViewMode = "grid" | "list";

export function AppLibraryWindow() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { apps: platformApps } = useAppPlatform();

  // Subscribe to AppRegistry changes
  const registeredApps = useSyncExternalStore(
    (cb) => AppRegistry.subscribe(cb),
    () => AppRegistry.listApps()
  );

  // Merge platform app data for icons
  const enrichedApps = useMemo(() => {
    return registeredApps.map(rApp => {
      const pApp = platformApps.find(p => p.id === rApp.manifest.id);
      return { ...rApp, platformApp: pApp };
    });
  }, [registeredApps, platformApps]);

  // Filter
  const filtered = useMemo(() => {
    let list = enrichedApps;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.manifest.name.toLowerCase().includes(q) || a.manifest.id.toLowerCase().includes(q));
    }
    if (category !== "All") {
      list = list.filter(a => (a.manifest.category || "Utilities").toLowerCase() === category.toLowerCase());
    }
    return list;
  }, [enrichedApps, search, category]);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={cn("w-44 shrink-0 border-r p-3 flex flex-col gap-1", APP_MATERIALS.sidebarBorder, APP_MATERIALS.sidebarBg.dark)}>
        <div className={cn(APP_TYPE.label, "uppercase text-[hsl(0_0%_50%)] mb-2 px-2")}>Categories</div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              APP_COMPONENTS.listItem.base,
              category === cat ? APP_COMPONENTS.listItem.active : APP_COMPONENTS.listItem.inactive
            )}
          >
            {cat}
          </button>
        ))}

        <div className="flex-1" />

        <div className={cn("px-2 py-2 rounded-lg", APP_COMPONENTS.card.base)}>
          <div className={cn(APP_TYPE.label, "text-[hsl(0_0%_50%)] mb-1")}>Registry Stats</div>
          <div className={cn(APP_TYPE.body, "text-[hsl(0_0%_70%)]")}>
            {registeredApps.length} apps registered
          </div>
          <div className={cn(APP_TYPE.body, "text-[hsl(130_55%_50%)]")}>
            {registeredApps.filter(a => a.state === "running" || a.state === "focused").length} running
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className={cn("flex items-center gap-2 px-4 py-2 border-b", APP_MATERIALS.sidebarBorder)}>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(0_0%_50%)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search apps..."
              className={cn(APP_COMPONENTS.input.base, "pl-8 w-full")}
            />
          </div>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(APP_COMPONENTS.button.base, viewMode === "grid" ? APP_COMPONENTS.button.primary : APP_COMPONENTS.button.ghost)}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(APP_COMPONENTS.button.base, viewMode === "list" ? APP_COMPONENTS.button.primary : APP_COMPONENTS.button.ghost)}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[hsl(0_0%_50%)]">
              <Layers className="w-10 h-10 mb-2 opacity-30" />
              <div className={APP_TYPE.body}>No apps found</div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map(app => (
                <AppGridCard key={app.manifest.id} app={app} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filtered.map(app => (
                <AppListRow key={app.manifest.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Grid Card ────────────────────────────────────────────────

function AppGridCard({ app }: { app: RegisteredApp & { platformApp?: any } }) {
  const m = app.manifest;
  const isActive = app.state === "running" || app.state === "focused";

  return (
    <div className={cn(APP_COMPONENTS.card.base, "flex flex-col items-center gap-2 py-4 hover:bg-[hsl(0_0%_100%/0.04)] transition-colors cursor-default")}>
      <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl shadow-md", m.iconBg || "from-[hsl(265_55%_58%)] to-[hsl(280_50%_50%)]")}>
        {m.icon || "📦"}
      </div>
      <div className={cn(APP_TYPE.body, "font-medium text-[hsl(0_0%_85%)] text-center truncate w-full px-1")}>{m.name}</div>
      <div className={cn(APP_TYPE.label, "text-[hsl(0_0%_50%)]")}>v{m.version}</div>
      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", STATE_COLORS[app.state] || STATE_COLORS.registered)}>
        {app.state}
      </span>

      {/* Permission & Security indicators */}
      <div className="flex items-center gap-1.5 mt-1">
        {m.permissions.length > 0 && (
          <div className="flex items-center gap-0.5 text-[hsl(0_0%_50%)]" title={`${m.permissions.length} permissions`}>
            <Shield className="w-3 h-3" />
            <span className="text-[9px]">{m.permissions.length}</span>
          </div>
        )}
        {isActive && (
          <div className="flex items-center gap-0.5 text-[hsl(130_55%_50%)]" title="Running">
            <Play className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── List Row ─────────────────────────────────────────────────

function AppListRow({ app }: { app: RegisteredApp & { platformApp?: any } }) {
  const m = app.manifest;
  const isActive = app.state === "running" || app.state === "focused";

  return (
    <div className={cn(APP_COMPONENTS.listItem.base, APP_COMPONENTS.listItem.inactive, "gap-3 py-2.5")}>
      <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm shadow-sm shrink-0", m.iconBg || "from-[hsl(265_55%_58%)] to-[hsl(280_50%_50%)]")}>
        {m.icon || "📦"}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn(APP_TYPE.body, "font-medium text-[hsl(0_0%_85%)] truncate")}>{m.name}</div>
        <div className={cn(APP_TYPE.label, "text-[hsl(0_0%_50%)]")}>{m.publisher} · v{m.version}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {m.permissions.length > 0 && (
          <div className="flex items-center gap-0.5 text-[hsl(0_0%_50%)]">
            <Shield className="w-3 h-3" />
            <span className="text-[9px]">{m.permissions.length}</span>
          </div>
        )}
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", STATE_COLORS[app.state] || STATE_COLORS.registered)}>
          {app.state}
        </span>
        {isActive && <Play className="w-3 h-3 text-[hsl(130_55%_50%)]" />}
      </div>
    </div>
  );
}
