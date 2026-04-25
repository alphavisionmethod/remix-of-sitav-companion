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
import { Radio, RefreshCw, Monitor, Smartphone, Watch, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const surfaceIcons: Record<string, React.ReactNode> = { web: <Monitor className="h-4 w-4" />, phone: <Smartphone className="h-4 w-4" />, watch: <Watch className="h-4 w-4" /> };

export default function UAO01PresenceContinuity() {
  const queryClient = useQueryClient();

  const { data: presence = [] } = useQuery({
    queryKey: ["presence-states"],
    queryFn: async () => { const { data } = await fromTable("presence_states").select("*, connected_devices(device_name)").order("updated_at", { ascending: false }).limit(10); return data || []; },
  });

  const { data: continuity = [] } = useQuery({
    queryKey: ["context-continuity"],
    queryFn: async () => { const { data } = await fromTable("context_continuity_records").select("*").order("updated_at", { ascending: false }).limit(10); return data || []; },
  });

  const { data: handoffs = [] } = useQuery({
    queryKey: ["handoff-sessions"],
    queryFn: async () => { const { data } = await fromTable("handoff_sessions").select("*").order("created_at", { ascending: false }).limit(20); return data || []; },
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["connected-devices-presence"],
    queryFn: async () => { const { data } = await fromTable("connected_devices").select("*, device_families(name, family_key)").order("last_seen_at", { ascending: false }); return data || []; },
  });

  const updatePresence = useAction("admin", "presence.update");

  const current = presence[0];
  const completedHandoffs = handoffs.filter((h: Record<string, any>) => h.handoff_status === "completed");

  return (
    <div className="space-y-6 p-6">
      <UAOSubNav />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Radio className="h-6 w-6" /> Presence & Continuity Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Active device, surfaces, handoff, and context continuity</p>
        </div>
        <Button onClick={() => updatePresence.mutate({})} disabled={updatePresence.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${updatePresence.isPending ? "animate-spin" : ""}`} /> Update Presence
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Active Surface</p>
          <div className="flex items-center gap-2 mt-1">{surfaceIcons[current?.active_surface] || <Monitor className="h-4 w-4" />}<span className="text-lg font-bold">{current?.active_surface || "—"}</span></div>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Focus State</p>
          <p className="text-lg font-bold">{current?.focus_state || "—"}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Interruption Tolerance</p>
          <p className="text-lg font-bold">{current?.interruption_tolerance || "—"}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Handoff Eligible</p>
          <p className="text-lg font-bold">{current?.handoff_eligible ? "Yes" : "No"}</p>
        </CardContent></Card>
      </div>

      {devices.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Known Devices</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Device</TableHead><TableHead>Family</TableHead><TableHead>Trust</TableHead><TableHead>Reachable</TableHead><TableHead>Primary</TableHead><TableHead>Last Seen</TableHead></TableRow></TableHeader>
              <TableBody>
                {devices.map((d: Record<string, any>) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.device_name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{d.device_families?.name || d.platform}</Badge></TableCell>
                    <TableCell className="text-xs">{d.trust_level}</TableCell>
                    <TableCell>{d.reachable ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                    <TableCell>{d.is_primary ? <CheckCircle className="h-3 w-3 text-green-400" /> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-xs">{d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {handoffs.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Recent Handoffs ({completedHandoffs.length} completed)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Status</TableHead><TableHead>Quality</TableHead><TableHead>When</TableHead></TableRow></TableHeader>
              <TableBody>
                {handoffs.slice(0, 10).map((h: Record<string, any>) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs">{h.source_surface}</TableCell>
                    <TableCell className="text-xs">{h.target_surface}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{h.handoff_status}</Badge></TableCell>
                    <TableCell className="text-xs">{h.handoff_quality}</TableCell>
                    <TableCell className="text-xs">{new Date(h.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {presence.length === 0 && devices.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No presence data. Click "Update Presence" to start.</CardContent></Card>
      )}
    </div>
  );
}
