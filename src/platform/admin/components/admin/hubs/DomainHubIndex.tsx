// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Hub Index (Phase 25)
// Reusable hub-index card grid driven entirely by the admin route
// registry. Used by hub pages whose drill-down explorers are still
// pages elsewhere in the app — gives operators a single canonical
// landing surface that points at every registered route in the
// domain.
// ═══════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import {
  type AdminDomain,
  ADMIN_ROUTE_REGISTRY,
  DOMAIN_DESCRIPTIONS,
  DOMAIN_LABELS,
  type AdminRouteEntry,
} from "@/platform/architecture/admin-route-registry";

interface DomainHubIndexProps {
  domain: AdminDomain;
  /** Optional filter over registered routes. */
  filter?: (entry: AdminRouteEntry) => boolean;
  /** Optional custom heading (defaults to domain label). */
  heading?: string;
  /** Optional intro paragraph. */
  intro?: string;
}

const ORDER = { primary: 0, subnav: 1, explorer: 2, hidden: 3, deprecated: 4 } as const;

export function DomainHubIndex({
  domain,
  filter,
  heading,
  intro,
}: DomainHubIndexProps) {
  const entries = ADMIN_ROUTE_REGISTRY.filter(
    (e) =>
      e.domain === domain &&
      e.nav !== "deprecated" &&
      e.pageClass !== "DEPRECATE_WITH_REDIRECT" &&
      e.pageClass !== "DUPLICATE_MERGE_REQUIRED" &&
      e.path !== `/admin/${domain}` &&
      (!filter || filter(e)),
  ).sort((a, b) => {
    const oa = ORDER[a.nav] ?? 99;
    const ob = ORDER[b.nav] ?? 99;
    if (oa !== ob) return oa - ob;
    return a.path.localeCompare(b.path);
  });

  const subnav = entries.filter((e) => e.nav === "subnav");
  const explorer = entries.filter((e) => e.nav === "explorer");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {heading ?? DOMAIN_LABELS[domain]}
        </h1>
        <p className="text-xs text-muted-foreground max-w-3xl">
          {intro ?? DOMAIN_DESCRIPTIONS[domain]}
        </p>
      </header>

      {subnav.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Primary surfaces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subnav.map((e) => (
              <RouteCard key={e.path} entry={e} />
            ))}
          </div>
        </section>
      )}

      {explorer.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Drill-down explorers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {explorer.map((e) => (
              <RouteCard key={e.path} entry={e} />
            ))}
          </div>
        </section>
      )}

      {entries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-xs text-muted-foreground">
            No registered surfaces in this domain yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RouteCard({ entry }: { entry: AdminRouteEntry }) {
  const title = entry.breadcrumb[entry.breadcrumb.length - 1] ?? entry.path;
  return (
    <Link to={entry.path} className="group">
      <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/30">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <code className="text-[10px] text-muted-foreground/80 font-mono break-all">
            {entry.path}
          </code>
          {entry.workflows && entry.workflows.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.workflows.map((w) => (
                <Badge key={w} variant="outline" className="text-[9px] h-4">
                  {w}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
