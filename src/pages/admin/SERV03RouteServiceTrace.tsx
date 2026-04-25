// ═══════════════════════════════════════════════════════════════
// SITA OS — SERV03: Route-to-Service Trace Board
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTE_SERVICE_INVENTORY, type RouteInventoryEntry } from "@/lib/core-services/service-registry/route-to-service-inventory";
import { Route, ArrowRight, Database, Plug } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

function ConfidenceBadge({ level }: { level: string }) {
  if (level === "high") return <Badge className="bg-emerald-500/20 text-emerald-400">{level}</Badge>;
  if (level === "medium") return <Badge className="bg-amber-500/20 text-amber-400">{level}</Badge>;
  return <Badge variant="destructive">{level}</Badge>;
}

function RouteDetail({ route }: { route: RouteInventoryEntry }) {
  return (
    <div className="space-y-3 pl-4 border-l-2 border-primary/30">
      {route.actions.map((action) => (
        <div key={action.actionKey} className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-primary" />
            <span className="font-medium">{action.actionLabel}</span>
            <Badge variant="outline" className="text-xs">{action.actionType}</Badge>
            {action.isCanonical && <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">canonical</Badge>}
          </div>
          <div className="grid grid-cols-2 gap-2 ml-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span className="font-mono">{action.primaryServiceKey}</span>
            </div>
            {action.secondaryServiceKeys.length > 0 && (
              <div className="flex items-center gap-1">
                <Plug className="h-3 w-3" />
                {action.secondaryServiceKeys.join(", ")}
              </div>
            )}
          </div>
          {action.providerDependencies.length > 0 && (
            <div className="ml-5 text-xs">
              <span className="text-muted-foreground">Providers: </span>
              {action.providerDependencies.map((p) => (
                <Badge key={p} variant="outline" className="text-xs mr-1">{p}</Badge>
              ))}
            </div>
          )}
          {action.notes && <div className="ml-5 text-xs text-muted-foreground italic">{action.notes}</div>}
        </div>
      ))}
    </div>
  );
}

export default function SERV03RouteServiceTrace() {
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [loopFilter, setLoopFilter] = useState<string>("all");

  const domains = [...new Set(ROUTE_SERVICE_INVENTORY.map((r) => r.domainFamily))];
  const loops = [...new Set(ROUTE_SERVICE_INVENTORY.map((r) => r.flagshipLoopKey).filter(Boolean))];

  const filtered = ROUTE_SERVICE_INVENTORY.filter((r) => {
    if (domainFilter !== "all" && r.domainFamily !== domainFilter) return false;
    if (loopFilter !== "all" && r.flagshipLoopKey !== loopFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 p-6" data-testid="serv03-board">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Route className="h-6 w-6 text-primary" />
          SERV03 — Route-to-Service Trace
        </h1>
        <p className="text-muted-foreground mt-1">
          Drill into any route to see its canonical service path, dependencies, and ownership
        </p>
      </div>

      <div className="flex gap-3">
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Domain" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {domains.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={loopFilter} onValueChange={setLoopFilter}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Flagship Loop" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Loops</SelectItem>
            {loops.map((l) => <SelectItem key={l!} value={l!}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((route) => (
          <Collapsible key={route.routeKey}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-sm font-mono">{route.routePath}</CardTitle>
                      <Badge variant="outline">{route.domainFamily}</Badge>
                      <Badge variant="outline">{route.surfaceClass}</Badge>
                      {route.flagshipLoopKey && (
                        <Badge className="bg-primary/20 text-primary text-xs">{route.flagshipLoopKey}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ConfidenceBadge level={route.canonicalPathConfidence} />
                      {route.shadowServiceRisk !== "low" && (
                        <Badge variant="destructive" className="text-xs">shadow: {route.shadowServiceRisk}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <RouteDetail route={route} />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="text-xs text-muted-foreground">
            Showing {filtered.length} of {ROUTE_SERVICE_INVENTORY.length} inventoried routes •{" "}
            {ROUTE_SERVICE_INVENTORY.reduce((s, r) => s + r.actions.length, 0)} total actions mapped
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
