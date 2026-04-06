import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Shield, Activity } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { getDistinctProviders, getProviderHealth } from "@/lib/services/ai-gateway";

export default function AIG01ProviderRegistry() {
  const { data: providers = [] } = useQuery({
    queryKey: ["ai-distinct-providers"],
    queryFn: getDistinctProviders,
  });

  const { data: health = [] } = useQuery({
    queryKey: ["ai-provider-health"],
    queryFn: getProviderHealth,
  });

  const healthMap = new Map(health.map(h => [h.provider, h]));

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Server className="h-6 w-6" /> AIG01 — AI Provider Registry</h1>
        <p className="text-sm text-muted-foreground mt-1">Configured AI providers, health, and secret availability</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Active Providers</p>
          <p className="text-2xl font-bold">{providers.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Health Records</p>
          <p className="text-2xl font-bold">{health.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Incidents</p>
          <p className="text-2xl font-bold">{health.filter(h => h.incident_status && h.incident_status !== "none").length}</p>
        </CardContent></Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Provider Health</CardTitle></CardHeader>
        <CardContent>
          {health.length > 0 ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Error Rate</TableHead>
                <TableHead>Avg Latency</TableHead>
                <TableHead>P95 Latency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {health.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.provider}</TableCell>
                    <TableCell className="text-xs">{h.model ?? "all"}</TableCell>
                    <TableCell>{h.availability != null ? `${(h.availability * 100).toFixed(1)}%` : "—"}</TableCell>
                    <TableCell>{h.error_rate != null ? `${(h.error_rate * 100).toFixed(2)}%` : "—"}</TableCell>
                    <TableCell>{h.avg_latency_ms ? `${h.avg_latency_ms}ms` : "—"}</TableCell>
                    <TableCell>{h.p95_latency_ms ? `${h.p95_latency_ms}ms` : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={h.incident_status && h.incident_status !== "none" ? "destructive" : "default"} className="text-xs">
                        {h.incident_status ?? "healthy"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No provider health data. Providers will appear after AI usage.</p>
          )}
        </CardContent>
      </Card>

      {providers.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Registered Providers</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {providers.map(p => (
                <Badge key={p} variant="outline" className="text-sm px-3 py-1">
                  {p}
                  {healthMap.has(p) && (
                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-400" />
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
