import UAOSubNav from "@/platform/admin/components/admin/UAOSubNav";
import { useAction } from "@/hooks/use-action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cpu, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const stageColors: Record<string, string> = { alpha: "bg-blue-500/20 text-blue-400", planned: "bg-muted text-muted-foreground", future: "bg-muted text-muted-foreground/50", production: "bg-green-500/20 text-green-400" };

export default function UAO02ConnectedDevices() {
  const queryClient = useQueryClient();

  const { data: families = [] } = useQuery({
    queryKey: ["device-families"],
    queryFn: async () => { const { data } = await fromTable("device_families").select("*").order("name"); return data || []; },
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["connected-devices"],
    queryFn: async () => { const { data } = await fromTable("connected_devices").select("*, device_families(name, family_key)").order("created_at"); return data || []; },
  });

  const { data: wearables = [] } = useQuery({
    queryKey: ["wearable-providers"],
    queryFn: async () => { const { data } = await fromTable("wearable_providers").select("*").order("name"); return data || []; },
  });

  const seedMutation = useAction("admin", "seed.run");

  return (
    <div className="space-y-6 p-6">
      <UAOSubNav />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Cpu className="h-6 w-6" /> Connected Devices Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Phones, watches, wearables, trust levels, and sync</p>
        </div>
        <Button onClick={() => seedMutation.mutate({})} disabled={seedMutation.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${seedMutation.isPending ? "animate-spin" : ""}`} />
          {families.length === 0 ? "Initialize Devices" : "Re-Seed"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Device Families</p><p className="text-2xl font-bold">{families.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Connected Devices</p><p className="text-2xl font-bold">{devices.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Wearable Providers</p><p className="text-2xl font-bold">{wearables.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Trusted Devices</p><p className="text-2xl font-bold">{devices.filter((d: Record<string, any>) => d.trust_level === "high").length}</p></CardContent></Card>
      </div>

      {families.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Device Families</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Family</TableHead><TableHead>Interaction</TableHead><TableHead>Screen</TableHead><TableHead>Notify</TableHead><TableHead>Quick Act</TableHead><TableHead>Handoff</TableHead><TableHead>Trust</TableHead><TableHead>Stage</TableHead></TableRow></TableHeader>
              <TableBody>
                {families.map((f: Record<string, any>) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell className="text-xs">{f.interaction_type}</TableCell>
                    <TableCell className="text-xs">{f.screen_class}</TableCell>
                    <TableCell className="text-xs">{f.notification_type}</TableCell>
                    <TableCell>{f.quick_action_support ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{f.handoff_support ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell className="text-xs">{f.trust_level}</TableCell>
                    <TableCell><Badge className={stageColors[f.launch_stage] || ""}>{f.launch_stage}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {wearables.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Wearable Providers</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Categories</TableHead><TableHead>Health</TableHead><TableHead>Activity</TableHead><TableHead>Sleep</TableHead><TableHead>Readiness</TableHead><TableHead>Native App</TableHead><TableHead>Stage</TableHead></TableRow></TableHeader>
              <TableBody>
                {wearables.map((w: Record<string, any>) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell className="flex gap-1 flex-wrap">{(w.categories || []).map((c: string) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}</TableCell>
                    <TableCell>{w.health_data_support ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{w.activity_data_support ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{w.sleep_data_support ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{w.readiness_data_support ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{w.requires_native_app ? <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Required</Badge> : <span className="text-xs">No</span>}</TableCell>
                    <TableCell><Badge className={stageColors[w.launch_stage] || ""}>{w.launch_stage}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {families.length === 0 && (<Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No device families. Click "Initialize Devices" to seed.</CardContent></Card>)}
    </div>
  );
}
