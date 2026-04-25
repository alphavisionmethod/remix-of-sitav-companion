import UAOSubNav from "@/platform/admin/components/admin/UAOSubNav";
import { DemoOnlyBanner } from "@/platform/trust/components/claim-safety/DemoOnlyBanner";
import { useAction } from "@/hooks/use-action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const labelColors: Record<string, string> = { alpha: "bg-blue-500/20 text-blue-400", planned: "bg-muted text-muted-foreground", future: "bg-muted text-muted-foreground/50", production: "bg-green-500/20 text-green-400", beta: "bg-cyan-500/20 text-cyan-400" };

export default function UAO08AmbientLaunchReadiness() {
  const queryClient = useQueryClient();

  const { data: readiness = [] } = useQuery({
    queryKey: ["ambient-launch-readiness"],
    queryFn: async () => { const { data } = await fromTable("ambient_launch_readiness").select("*").order("target_type, target_name"); return data || []; },
  });

  const seedReadiness = useAction("admin", "readiness.seed");

  const deviceFamilies = readiness.filter((r: Record<string, any>) => r.target_type === "device_family");
  const wearableProviders = readiness.filter((r: Record<string, any>) => r.target_type === "wearable_provider");
  const launchReady = readiness.filter((r: Record<string, any>) => r.launch_ready).length;
  const withBlockers = readiness.filter((r: Record<string, any>) => (r.blockers || []).length > 0).length;

  return (
    <div className="space-y-6 p-6">
      <UAOSubNav />
      <DemoOnlyBanner surfaceId="UAO08" />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Flag className="h-6 w-6" /> Ambient Launch Readiness</h1>
          <p className="text-sm text-muted-foreground mt-1">Device & wearable launch honesty per family</p>
        </div>
        <Button onClick={() => seedReadiness.mutate({})} disabled={seedReadiness.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${seedReadiness.isPending ? "animate-spin" : ""}`} />
          {readiness.length === 0 ? "Initialize" : "Re-Seed"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{readiness.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Launch Ready</p><p className="text-2xl font-bold text-green-400">{launchReady}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Demo Available</p><p className="text-2xl font-bold">{readiness.filter((r: Record<string, any>) => r.demo_available).length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">With Blockers</p><p className="text-2xl font-bold text-destructive">{withBlockers}</p></CardContent></Card>
      </div>

      {deviceFamilies.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Device Families</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Device</TableHead><TableHead>Label</TableHead><TableHead>Supported</TableHead><TableHead>Demo</TableHead><TableHead>Pilot</TableHead><TableHead>Launch</TableHead><TableHead>Blockers</TableHead></TableRow></TableHeader>
              <TableBody>
                {deviceFamilies.map((r: Record<string, any>) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.target_name}</TableCell>
                    <TableCell><Badge className={labelColors[r.launch_label] || ""}>{r.launch_label}</Badge></TableCell>
                    <TableCell>{r.supported ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{r.demo_available ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{r.pilot_ready ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{r.launch_ready ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{(r.blockers || []).length > 0 ? <div className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-yellow-400" /><span className="text-xs">{r.blockers.length}</span></div> : <CheckCircle className="h-3 w-3 text-green-400" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {wearableProviders.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Wearable Providers</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Label</TableHead><TableHead>Supported</TableHead><TableHead>Demo</TableHead><TableHead>Pilot</TableHead><TableHead>Launch</TableHead><TableHead>Blockers</TableHead></TableRow></TableHeader>
              <TableBody>
                {wearableProviders.map((r: Record<string, any>) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.target_name}</TableCell>
                    <TableCell><Badge className={labelColors[r.launch_label] || ""}>{r.launch_label}</Badge></TableCell>
                    <TableCell>{r.supported ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{r.demo_available ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{r.pilot_ready ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{r.launch_ready ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{(r.blockers || []).length > 0 ? <div className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-yellow-400" /><span className="text-xs">{r.blockers.length}</span></div> : <CheckCircle className="h-3 w-3 text-green-400" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {readiness.length === 0 && (<Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No launch readiness data. Seed device families first, then click "Initialize".</CardContent></Card>)}
    </div>
  );
}
