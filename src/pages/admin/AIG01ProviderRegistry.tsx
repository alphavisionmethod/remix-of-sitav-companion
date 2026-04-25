import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Shield, Activity, CheckCircle, XCircle } from "lucide-react";
import { getProviderRegistry, getProviderHealth, getDistinctProviders } from "@/lib/core-services/ai-gateway";
import AIGSubNav from "@/platform/admin/components/admin/AIGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function AIG01ProviderRegistry() {
  const { data: registry = [] } = useQuery({
    queryKey: ["ai-provider-registry"],
    queryFn: getProviderRegistry,
  });

  const { data: health = [] } = useQuery({
    queryKey: ["ai-provider-health"],
    queryFn: getProviderHealth,
  });

  const { data: modelProviders = [] } = useQuery({
    queryKey: ["ai-distinct-providers"],
    queryFn: getDistinctProviders,
  });

  const healthMap = new Map(health.map(h => [h.provider, h]));

  return (
    <div className="space-y-6 p-6">
<AIGSubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Server className="h-6 w-6" /> AIG01 — AI Provider Registry</h1>
        <p className="text-sm text-muted-foreground mt-1">Configured AI providers, health, secret availability, and launch stage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Registered Providers</p>
          <p className="text-2xl font-bold">{registry.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">{registry.filter(r => r.is_active).length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Health Records</p>
          <p className="text-2xl font-bold">{health.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Model Providers</p>
          <p className="text-2xl font-bold">{modelProviders.length}</p>
        </CardContent></Card>
      </div>

      {/* Canonical Provider Registry */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> Provider Registry</CardTitle></CardHeader>
        <CardContent>
          {registry.length > 0 ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Provider Key</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>API Style</TableHead>
                <TableHead>Secret Env</TableHead>
                <TableHead>Tools</TableHead>
                <TableHead>Structured</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Launch Stage</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Active</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {registry.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs font-medium">{r.provider_key}</TableCell>
                    <TableCell className="text-sm">{r.display_name}</TableCell>
                    <TableCell className="text-xs">{r.api_style}</TableCell>
                    <TableCell className="font-mono text-xs">{r.secret_env_name ?? "—"}</TableCell>
                    <TableCell>{r.supports_tools ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{r.supports_structured_output ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{r.supports_streaming ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{r.launch_stage}</Badge></TableCell>
                    <TableCell><Badge variant={r.mode === "real" ? "default" : "secondary"} className="text-xs">{r.mode}</Badge></TableCell>
                    <TableCell>{r.is_active ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No providers registered. Add entries to ai_provider_registry to configure providers.</p>
          )}
        </CardContent>
      </Card>

      {/* Health */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Provider Health</CardTitle></CardHeader>
        <CardContent>
          {health.length > 0 ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Health State</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Error Rate</TableHead>
                <TableHead>Avg Latency</TableHead>
                <TableHead>Last Success</TableHead>
                <TableHead>Last Failure</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {health.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.provider}</TableCell>
                    <TableCell>
                      <Badge variant={h.health_state === "healthy" ? "default" : h.health_state === "degraded" ? "secondary" : "destructive"} className="text-xs">
                        {h.health_state ?? h.incident_status ?? "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{h.availability != null ? `${(h.availability * 100).toFixed(1)}%` : "—"}</TableCell>
                    <TableCell>{h.error_rate != null ? `${(h.error_rate * 100).toFixed(2)}%` : "—"}</TableCell>
                    <TableCell>{h.avg_latency_ms ? `${h.avg_latency_ms}ms` : "—"}</TableCell>
                    <TableCell className="text-xs">{h.last_success_at ? new Date(h.last_success_at).toLocaleString() : "—"}</TableCell>
                    <TableCell className="text-xs">{h.last_failure_at ? new Date(h.last_failure_at).toLocaleString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No provider health data yet.</p>
          )}
        </CardContent>
      </Card>

      {modelProviders.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Model Providers</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {modelProviders.map(p => (
                <Badge key={p} variant="outline" className="text-sm px-3 py-1">
                  {p}
                  {healthMap.has(p) && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-400" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
