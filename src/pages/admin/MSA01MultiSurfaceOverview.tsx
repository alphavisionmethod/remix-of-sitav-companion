import { useAction } from "@/hooks/use-action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, Smartphone, Monitor, Glasses, Mic, RefreshCw, CheckCircle, XCircle, Layers, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const surfaceIcons: Record<string, React.ReactNode> = {
  web: <Globe className="h-5 w-5" />, mobile_ios: <Smartphone className="h-5 w-5" />,
  mobile_android: <Smartphone className="h-5 w-5" />, desktop: <Monitor className="h-5 w-5" />,
  spatial: <Glasses className="h-5 w-5" />, voice: <Mic className="h-5 w-5" />,
};

const stageColors: Record<string, string> = {
  production: "bg-green-500/20 text-green-400", beta: "bg-cyan-500/20 text-cyan-400",
  alpha: "bg-blue-500/20 text-blue-400", prototyping: "bg-yellow-500/20 text-yellow-400",
  planned: "bg-muted text-muted-foreground", deprecated: "bg-red-500/20 text-red-400",
};

export default function MSA01MultiSurfaceOverview() {
  const queryClient = useQueryClient();

  const { data: surfaces = [] } = useQuery({
    queryKey: ["surface-types"],
    queryFn: async () => { const { data } = await fromTable("surface_types").select("*").order("created_at"); return data || []; },
  });

  const { data: shells = [] } = useQuery({
    queryKey: ["shell-implementations"],
    queryFn: async () => { const { data } = await fromTable("shell_implementations").select("*"); return data || []; },
  });

  const { data: readiness = [] } = useQuery({
    queryKey: ["surface-readiness"],
    queryFn: async () => { const { data } = await fromTable("surface_readiness_records").select("*"); return data || []; },
  });

  const { data: capabilities = [] } = useQuery({
    queryKey: ["capability-definitions"],
    queryFn: async () => { const { data } = await fromTable("capability_definitions").select("*"); return data || []; },
  });

  const { data: bindings = [] } = useQuery({
    queryKey: ["capability-bindings"],
    queryFn: async () => { const { data } = await fromTable("capability_surface_bindings").select("*"); return data || []; },
  });

  const { data: launchProfiles = [] } = useQuery({
    queryKey: ["surface-launch-profiles"],
    queryFn: async () => { const { data } = await fromTable("surface_launch_profiles").select("*"); return data || []; },
  });

  const seedMutation = useAction("admin", "seed.run");

  const activeSurfaces = surfaces.filter((s: Record<string, any>) => s.surface_class === "active").length;
  const plannedSurfaces = surfaces.filter((s: Record<string, any>) => s.surface_class !== "active" && s.surface_class !== "deprecated").length;
  const portableCaps = capabilities.filter((c: Record<string, any>) => c.portability_class === "portable").length;

  // Build portability matrix
  const capMatrix = capabilities.map((cap: Record<string, any>) => {
    const row: Record<string, string> = { key: cap.capability_key, name: cap.display_name, domain: cap.domain };
    surfaces.forEach((s: Record<string, any>) => {
      const binding = bindings.find((b: Record<string, any>) => b.capability_id === cap.id && b.surface_id === s.id);
      row[s.surface_key] = binding ? binding.binding_status : "—";
    });
    return row;
  });

  // Collect all blockers across surfaces
  const allBlockers: Array<{ surface: string; blocker: string }> = [];
  readiness.forEach((r: Record<string, any>) => {
    const surf = surfaces.find((s: Record<string, any>) => s.id === r.surface_id);
    const name = surf?.display_name || "Unknown";
    (r.blockers || []).forEach((b: string) => allBlockers.push({ surface: name, blocker: b }));
  });
  launchProfiles.forEach((lp: Record<string, any>) => {
    const surf = surfaces.find((s: Record<string, any>) => s.id === lp.surface_id);
    const name = surf?.display_name || "Unknown";
    (lp.blockers || []).forEach((b: string) => {
      if (!allBlockers.some(ab => ab.surface === name && ab.blocker === b)) {
        allBlockers.push({ surface: name, blocker: b });
      }
    });
  });

  const statusIcon = (status: string) => {
    if (status === "production") return <CheckCircle className="h-3 w-3 text-green-400" />;
    if (status === "planned") return <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />;
    if (status === "beta") return <div className="h-3 w-3 rounded-full bg-cyan-400" />;
    return <div className="h-3 w-3 rounded-full bg-yellow-400" />;
  };

  return (
    <div className="space-y-6 p-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-6 w-6" /> Multi-Surface Architecture</h1>
          <p className="text-sm text-muted-foreground mt-1">One sovereign runtime, many shells — web, mobile, desktop, spatial, voice</p>
        </div>
        <Button onClick={() => seedMutation.mutate({})} disabled={seedMutation.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${seedMutation.isPending ? "animate-spin" : ""}`} />
          {surfaces.length === 0 ? "Initialize MSA" : "Re-Seed All"}
        </Button>
      </div>

      {/* ── SurfaceReadinessHero ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Active Surfaces</p>
          <p className="text-2xl font-bold">{activeSurfaces}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Planned</p>
          <p className="text-2xl font-bold">{plannedSurfaces}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Capabilities</p>
          <p className="text-2xl font-bold">{capabilities.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Portable</p>
          <p className="text-2xl font-bold">{portableCaps}/{capabilities.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Blockers</p>
          <p className="text-2xl font-bold text-destructive">{allBlockers.length}</p>
        </CardContent></Card>
      </div>

      {/* ── PortabilityCoverageCards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {surfaces.map((s: Record<string, any>) => {
          const shell = shells.find((sh: Record<string, any>) => sh.surface_id === s.id);
          const ready = readiness.find((r: Record<string, any>) => r.surface_id === s.id);
          const lp = launchProfiles.find((l: Record<string, any>) => l.surface_id === s.id);
          return (
            <Card key={s.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {surfaceIcons[s.surface_key] || <Globe className="h-5 w-5" />}
                    {s.display_name}
                  </CardTitle>
                  <Badge className={stageColors[s.readiness_stage] || ""}>{s.readiness_stage}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Interaction: {s.interaction_model}</div>
                  <div>Notifications: {s.notification_model}</div>
                  <div>Offline: {s.offline_support ? "Yes" : "No"}</div>
                  <div>Class: {s.surface_class}</div>
                </div>
                {shell && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-medium mb-1">{shell.shell_type} v{shell.version}</p>
                    <div className="text-xs text-muted-foreground">{shell.technology_stack?.join(", ")}</div>
                    {shell.capability_coverage_pct > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={shell.capability_coverage_pct} className="h-2 flex-1" />
                        <span className="text-xs">{shell.capability_coverage_pct}%</span>
                      </div>
                    )}
                    {shell.boundary_violations > 0 && (
                      <p className="text-xs text-destructive mt-1">{shell.boundary_violations} boundary violations</p>
                    )}
                  </div>
                )}
                {ready && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Portability:</span>
                      <Progress value={Number(ready.portability_score)} className="h-2 flex-1" />
                      <span className="text-xs">{ready.portability_score}%</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {ready.trust_portability ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                      <span className="text-xs">Trust</span>
                      {ready.workflow_portability ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                      <span className="text-xs">Workflow</span>
                      {ready.receipt_portability ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                      <span className="text-xs">Receipt</span>
                    </div>
                  </div>
                )}
                {lp && (
                  <div className="pt-2 border-t border-border text-xs">
                    <span className="text-muted-foreground">Launch: </span>
                    <Badge variant="outline" className="text-xs">{lp.launch_status}</Badge>
                    {lp.readiness_score > 0 && <span className="ml-2">{lp.readiness_score}% ready</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── CapabilityPortabilityMatrix ── */}
      {capMatrix.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Capability Portability Matrix</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability</TableHead>
                  <TableHead>Domain</TableHead>
                  {surfaces.map((s: Record<string, any>) => (
                    <TableHead key={s.id} className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {surfaceIcons[s.surface_key]}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {capMatrix.map((row: Record<string, any>) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-mono text-xs">{row.key}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{row.domain}</Badge></TableCell>
                    {surfaces.map((s: Record<string, any>) => (
                      <TableCell key={s.id} className="text-center">
                        {statusIcon(row[s.surface_key])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── BlockerRail ── */}
      {allBlockers.length > 0 && (
        <Card className="bg-card border-border border-destructive/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Portability Blockers ({allBlockers.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {allBlockers.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-destructive/5">
                  <span className="text-sm">{b.blocker}</span>
                  <Badge variant="outline" className="text-xs">{b.surface}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {surfaces.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">
          No surfaces registered. Click "Initialize MSA" to seed the multi-surface architecture.
        </CardContent></Card>
      )}
    </div>
  );
}
