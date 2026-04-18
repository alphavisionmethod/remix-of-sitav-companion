// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Domain Sidebar (Phase 2 — Registry Driven)
// Sidebar items are derived from the canonical admin-route-registry.
// Sub-nav entries (`nav: "subnav"`) appear as primary links;
// explorer entries (`nav: "explorer"`) are grouped beneath each
// breadcrumb prefix as drill-down targets.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ADMIN_ROUTE_REGISTRY,
  DOMAIN_HUB_PATHS,
  DOMAIN_LABELS,
  type AdminDomain,
  type AdminRouteEntry,
} from "@/platform/architecture/admin-route-registry";

// Re-export so existing call sites keep compiling.
export type { AdminDomain };

interface AdminDomainNavProps {
  activeDomain: AdminDomain;
  collapsed: boolean;
  currentPath: string;
}

interface NavGroup {
  label: string;
  items: AdminRouteEntry[];
}

/** Group entries by the second breadcrumb segment (group label). */
function groupEntries(entries: AdminRouteEntry[]): NavGroup[] {
  const groups = new Map<string, AdminRouteEntry[]>();
  for (const e of entries) {
    const label = e.breadcrumb[1] ?? "General";
    const list = groups.get(label) ?? [];
    list.push(e);
    groups.set(label, list);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

export function AdminDomainNav({ activeDomain, collapsed, currentPath }: AdminDomainNavProps) {
  const navigate = useNavigate();

  const { subnav, explorers } = useMemo(() => {
    const all = ADMIN_ROUTE_REGISTRY.filter(
      (r) => r.domain === activeDomain && r.nav !== "deprecated" && r.nav !== "hidden"
    );
    return {
      subnav: all.filter((r) => r.nav === "subnav" || r.nav === "primary"),
      explorers: all.filter((r) => r.nav === "explorer"),
    };
  }, [activeDomain]);

  if (collapsed) {
    return (
      <aside className="w-0 transition-all duration-200 overflow-hidden border-r border-border/30" />
    );
  }

  const subnavGroups = groupEntries(subnav);
  const explorerGroups = groupEntries(explorers);

  const renderItem = (entry: AdminRouteEntry) => {
    const isActive = currentPath === entry.path;
    const label = entry.breadcrumb[entry.breadcrumb.length - 1] ?? entry.path;
    return (
      <button
        key={entry.path}
        onClick={() => navigate(entry.path)}
        className={cn(
          "w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <aside className="w-56 shrink-0 border-r border-border/50 bg-card/20 transition-all duration-200">
      <ScrollArea className="h-[calc(100vh-7rem)]">
        <div className="p-3 space-y-4">
          {/* Domain hub link always at the top */}
          <button
            onClick={() => navigate(DOMAIN_HUB_PATHS[activeDomain])}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded text-[11px] font-semibold transition-colors",
              currentPath === DOMAIN_HUB_PATHS[activeDomain]
                ? "bg-primary/15 text-primary"
                : "text-foreground hover:bg-accent/50"
            )}
          >
            {DOMAIN_LABELS[activeDomain]} — Home
          </button>

          {subnavGroups.map((g) => (
            <div key={`sub-${g.label}`}>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
                {g.label}
              </p>
              <div className="space-y-0.5">{g.items.map(renderItem)}</div>
            </div>
          ))}

          {explorerGroups.length > 0 && (
            <div className="pt-2 border-t border-border/40">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-2 mb-2">
                Explorers
              </p>
              {explorerGroups.map((g) => (
                <div key={`exp-${g.label}`} className="mb-3">
                  <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/50 px-2 mb-1">
                    {g.label}
                  </p>
                  <div className="space-y-0.5">{g.items.map(renderItem)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
