import { useMemo } from "react";
import {
  useModuleRegistry,
  useRouteOwnership,
  groupModulesByParent,
  type ModuleRegistryRow,
} from "@/platform/registry/module-registry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const PILLAR_COLORS: Record<string, string> = {
  business: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  concierge: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  finance: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  health: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  trust: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  shared: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

function pillarBadge(pillar: string) {
  return (
    <Badge variant="outline" className={PILLAR_COLORS[pillar] ?? ""}>
      {pillar}
    </Badge>
  );
}

function lifecycleBadge(lc: string) {
  const variant = lc === "ga" ? "default" : lc === "beta" ? "secondary" : "outline";
  return <Badge variant={variant}>{lc}</Badge>;
}

function ModuleNode({
  m,
  childrenOf,
  routeIndex,
}: {
  m: ModuleRegistryRow;
  childrenOf: Record<string, ModuleRegistryRow[]>;
  routeIndex: Map<string, { route_path: string; visibility: string; is_trust: boolean }[]>;
}) {
  const kids = childrenOf[m.module_id] ?? [];
  const routes = routeIndex.get(m.module_id) ?? [];
  return (
    <div className="border-l border-border/40 pl-3">
      <div className="flex items-center gap-2 py-1">
        <span className="font-medium">{m.label}</span>
        {pillarBadge(m.pillar)}
        {lifecycleBadge(m.lifecycle)}
        <span className="text-xs text-muted-foreground">
          {m.route_prefix ?? "—"} · {m.module_id}
        </span>
      </div>
      {routes.length > 0 && (
        <div className="text-xs text-muted-foreground pl-2">
          Routes:{" "}
          {routes.map((r) => (
            <span key={r.route_path} className="mr-2">
              <code>{r.route_path}</code>
              <span className="ml-1 opacity-60">[{r.visibility}]</span>
            </span>
          ))}
        </div>
      )}
      {kids.length > 0 && (
        <div className="ml-2 mt-1 space-y-1">
          {kids.map((k) => (
            <ModuleNode key={k.module_id} m={k} childrenOf={childrenOf} routeIndex={routeIndex} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MCModuleRegistry() {
  const { data: modules, isLoading: mLoading } = useModuleRegistry();
  const { data: routes, isLoading: rLoading } = useRouteOwnership();

  const tree = useMemo(() => groupModulesByParent(modules ?? []), [modules]);

  const routeIndex = useMemo(() => {
    const idx = new Map<string, { route_path: string; visibility: string; is_trust: boolean }[]>();
    for (const r of routes ?? []) {
      const arr = idx.get(r.module_id) ?? [];
      arr.push({ route_path: r.route_path, visibility: r.visibility, is_trust: r.is_trust });
      idx.set(r.module_id, arr);
    }
    return idx;
  }, [routes]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Module Registry</h1>
        <p className="text-muted-foreground mt-1">
          Single source of truth for every module, sub-app, and route in SITA OS. Powers the
          launcher, navigation, command palette, and architecture validators.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Modules</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{modules?.length ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Routes mapped</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{routes?.length ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pillars</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {new Set((modules ?? []).map((m) => m.pillar)).size || "—"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module tree</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(mLoading || rLoading) && <Skeleton className="h-40 w-full" />}
          {!mLoading &&
            !rLoading &&
            tree.roots.map((root) => (
              <ModuleNode
                key={root.module_id}
                m={root}
                childrenOf={tree.childrenOf}
                routeIndex={routeIndex}
              />
            ))}
        </CardContent>
      </Card>
    </div>
  );
}