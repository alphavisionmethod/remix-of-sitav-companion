import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Route, CheckCircle, XCircle, AlertTriangle, Filter } from "lucide-react";
import { getRoutingPolicies, getCapabilityRouting } from "@/lib/core-services/ai-gateway";
import AIGSubNav from "@/platform/admin/components/admin/AIGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function AIG03RoutingMatrix() {
  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [premiumOnly, setPremiumOnly] = useState(false);

  const { data: policies = [] } = useQuery({
    queryKey: ["ai-routing-policies"],
    queryFn: getRoutingPolicies,
  });

  const { data: capRouting = [] } = useQuery({
    queryKey: ["ai-capability-routing"],
    queryFn: getCapabilityRouting,
  });

  const families = useMemo(() => {
    const fams = new Set(capRouting.map(r => r.capability_key.split(".")[0]));
    return ["all", ...Array.from(fams).sort()];
  }, [capRouting]);

  const filteredRouting = useMemo(() => {
    let list = capRouting;
    if (familyFilter !== "all") {
      list = list.filter(r => r.capability_key.startsWith(familyFilter + ".") || r.capability_key === familyFilter);
    }
    if (premiumOnly) {
      list = list.filter(r => r.routing_class === "premium_synthesis");
    }
    return list;
  }, [capRouting, familyFilter, premiumOnly]);

  const activeRoutes = capRouting.filter(r => r.is_active).length;
  const premiumRoutes = capRouting.filter(r => r.routing_class === "premium_synthesis").length;
  const missingFallbacks = capRouting.filter(r => r.is_active && !r.fallback_model_id && !r.fallback_provider_id && !r.can_fallback_to_demo).length;

  return (
    <div className="space-y-6 p-6">
<AIGSubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Route className="h-6 w-6" /> AIG03 — AI Routing Matrix
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Capability → Provider/Model routing, fallback paths, budget classes, quality requirements
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="bg-card border-border"><CardContent className="pt-3 pb-3">
          <p className="text-xs text-muted-foreground">Capability Routes</p>
          <p className="text-xl font-bold">{capRouting.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3 pb-3">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-xl font-bold">{activeRoutes}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3 pb-3">
          <p className="text-xs text-muted-foreground">Premium</p>
          <p className="text-xl font-bold">{premiumRoutes}</p>
        </CardContent></Card>
        <Card className={`bg-card ${missingFallbacks > 0 ? "border-amber-500/50" : "border-border"}`}><CardContent className="pt-3 pb-3">
          <p className="text-xs text-amber-400">Missing Fallbacks</p>
          <p className="text-xl font-bold">{missingFallbacks}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3 pb-3">
          <p className="text-xs text-muted-foreground">Legacy Policies</p>
          <p className="text-xl font-bold">{policies.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3 pb-3">
          <p className="text-xs text-muted-foreground">Domains</p>
          <p className="text-xl font-bold">{new Set(capRouting.map(r => r.routing_class)).size}</p>
        </CardContent></Card>
      </div>

      {/* Capability Family Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {families.map(f => (
          <Button
            key={f}
            size="sm"
            variant={familyFilter === f ? "default" : "outline"}
            onClick={() => setFamilyFilter(f)}
            className="text-xs capitalize"
          >
            {f === "all" ? "All Families" : f.replace(/_/g, " ")}
          </Button>
        ))}
        <Button
          size="sm"
          variant={premiumOnly ? "default" : "outline"}
          onClick={() => setPremiumOnly(!premiumOnly)}
          className="text-xs ml-2"
        >
          Premium Only
        </Button>
      </div>

      {/* Canonical Capability Routing */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Capability Routing Matrix ({filteredRouting.length})</CardTitle></CardHeader>
        <CardContent>
          {filteredRouting.length > 0 ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Capability Key</TableHead>
                <TableHead>Routing Class</TableHead>
                <TableHead>Budget Class</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Tool Use</TableHead>
                <TableHead>Structured</TableHead>
                <TableHead>Honesty Class</TableHead>
                <TableHead>Demo Fallback</TableHead>
                <TableHead>Unavail Fallback</TableHead>
                <TableHead>Active</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredRouting.map(r => {
                  const hasFallback = !!(r.fallback_model_id || r.fallback_provider_id || r.can_fallback_to_demo || r.can_fallback_to_unavailable);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs font-medium">{r.capability_key}</TableCell>
                      <TableCell>
                        <Badge variant={r.routing_class === "premium_synthesis" ? "default" : "outline"} className="text-xs">
                          {r.routing_class}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{r.budget_class}</TableCell>
                      <TableCell className="text-xs">{r.quality_requirement}</TableCell>
                      <TableCell className="text-xs">{r.max_latency_class}</TableCell>
                      <TableCell>
                        {r.tool_use_required
                          ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {r.structured_output_required
                          ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{r.launch_honesty_class}</Badge>
                      </TableCell>
                      <TableCell>
                        {r.can_fallback_to_demo
                          ? <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                          : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                      </TableCell>
                      <TableCell>
                        {r.can_fallback_to_unavailable
                          ? <CheckCircle className="h-3.5 w-3.5 text-amber-400" />
                          : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                      </TableCell>
                      <TableCell>
                        {r.is_active
                          ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                        {r.is_active && !hasFallback && (
                          <AlertTriangle className="h-3 w-3 text-amber-400 ml-1 inline" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No capability routing configured. Add entries to ai_capability_routing to map capabilities to providers.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Legacy Routing Policies */}
      {policies.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Legacy Routing Policies</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Task Class</TableHead>
                <TableHead>Default Provider</TableHead>
                <TableHead>Default Model</TableHead>
                <TableHead>Fallback</TableHead>
                <TableHead>Budget Class</TableHead>
                <TableHead>Max Cost</TableHead>
                <TableHead>Enabled</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {policies.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.capability_id}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{p.task_class}</Badge></TableCell>
                    <TableCell className="text-xs">{p.default_provider ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{p.default_model ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{p.fallback_model ?? "—"}</TableCell>
                    <TableCell className="text-xs">{p.budget_class ?? "—"}</TableCell>
                    <TableCell className="text-xs">{p.max_cost_cents ? `${p.max_cost_cents}¢` : "—"}</TableCell>
                    <TableCell>{p.enabled ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
