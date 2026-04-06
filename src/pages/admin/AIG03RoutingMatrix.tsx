import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Route, CheckCircle, XCircle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { getRoutingPolicies } from "@/lib/services/ai-gateway";

export default function AIG03RoutingMatrix() {
  const { data: policies = [] } = useQuery({
    queryKey: ["ai-routing-policies"],
    queryFn: getRoutingPolicies,
  });

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Route className="h-6 w-6" /> AIG03 — AI Routing Matrix</h1>
        <p className="text-sm text-muted-foreground mt-1">Capability → Provider/Model routing, fallback paths, budget classes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Policies</p>
          <p className="text-2xl font-bold">{policies.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">{policies.filter(p => p.enabled).length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Domains</p>
          <p className="text-2xl font-bold">{new Set(policies.map(p => p.domain).filter(Boolean)).size}</p>
        </CardContent></Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Routing Policies</CardTitle></CardHeader>
        <CardContent>
          {policies.length > 0 ? (
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
                    <TableCell>{p.enabled ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No routing policies. Add policies to ai_routing_policies to configure capability routing.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
