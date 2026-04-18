// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Hub Layout (Phase 3 — Canonical Hub Grammar)
//
// One coherent hub layout used by every /admin/<domain> entry page.
// Each hub composes existing pages as registry-classified modules,
// preserving deep-link behavior while presenting a single owner
// workflow surface. No hub renders new business logic — modules
// remain the source of truth.
// ═══════════════════════════════════════════════════════════════

import { ReactNode, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type AdminDomain,
  DOMAIN_LABELS,
  DOMAIN_DESCRIPTIONS,
} from "@/platform/architecture/admin-route-registry";

export interface HubModule {
  /** Stable id used as ?tab= query param. */
  id: string;
  /** Tab label. */
  label: string;
  /** One-line description for the tab tooltip + module header. */
  description?: string;
  /** Existing canonical legacy path — used to deep-link from the tab. */
  legacyPath?: string;
  /** Optional badge (counts, severity tags, etc.). */
  badge?: { label: string; tone?: "default" | "warning" | "critical" | "success" };
  /** Renderer — kept light so hubs do not re-implement business logic. */
  render: () => ReactNode;
}

interface DomainHubLayoutProps {
  domain: AdminDomain;
  modules: HubModule[];
  /** Optional summary widgets shown above tabs (overview KPIs etc.). */
  summary?: ReactNode;
  /** Default tab when ?tab= is absent. */
  defaultTabId?: string;
}

const TONE_CLASSES: Record<NonNullable<HubModule["badge"]>["tone"] & string, string> = {
  default: "bg-muted text-muted-foreground",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  critical: "bg-destructive/15 text-destructive",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export function DomainHubLayout({
  domain,
  modules,
  summary,
  defaultTabId,
}: DomainHubLayoutProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initial = defaultTabId ?? modules[0]?.id;
  const activeId = searchParams.get("tab") ?? initial;
  const activeModule = useMemo(
    () => modules.find((m) => m.id === activeId) ?? modules[0],
    [activeId, modules],
  );

  const setTab = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", id);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-4">
      {/* Hub header */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {DOMAIN_LABELS[domain]}
        </h1>
        <p className="text-xs text-muted-foreground max-w-3xl">
          {DOMAIN_DESCRIPTIONS[domain]}
        </p>
      </header>

      {/* Optional summary KPI strip */}
      {summary && <div>{summary}</div>}

      {/* Module tab strip */}
      <Card className="p-1 flex items-center gap-1 overflow-x-auto bg-card/50">
        {modules.map((m) => {
          const isActive = m.id === activeModule?.id;
          return (
            <button
              key={m.id}
              onClick={() => setTab(m.id)}
              title={m.description}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              <span>{m.label}</span>
              {m.badge && (
                <Badge
                  variant="outline"
                  className={cn(
                    "h-4 px-1 text-[9px] border-0",
                    TONE_CLASSES[m.badge.tone ?? "default"],
                  )}
                >
                  {m.badge.label}
                </Badge>
              )}
            </button>
          );
        })}
      </Card>

      {/* Active module body */}
      <section aria-label={activeModule?.label} className="space-y-3">
        {activeModule?.legacyPath && (
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              {activeModule.description}
            </p>
            <button
              onClick={() => navigate(activeModule.legacyPath!)}
              className="text-[11px] text-primary hover:underline"
            >
              Open full page →
            </button>
          </div>
        )}
        {activeModule?.render()}
      </section>
    </div>
  );
}
