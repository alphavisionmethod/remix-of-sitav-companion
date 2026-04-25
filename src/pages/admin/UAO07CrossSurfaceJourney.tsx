import UAOSubNav from "@/platform/admin/components/admin/UAOSubNav";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Route, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const qualityColors: Record<string, string> = { seamless: "bg-green-500/20 text-green-400", good: "bg-blue-500/20 text-blue-400", friction: "bg-yellow-500/20 text-yellow-400", failed: "bg-red-500/20 text-red-400", unknown: "bg-muted text-muted-foreground" };
const statusColors: Record<string, string> = { completed: "bg-green-500/20 text-green-400", initiated: "bg-blue-500/20 text-blue-400", failed: "bg-red-500/20 text-red-400", abandoned: "bg-muted text-muted-foreground" };

export default function UAO07CrossSurfaceJourney() {
  const { data: handoffs = [] } = useQuery({
    queryKey: ["handoff-sessions-journey"],
    queryFn: async () => { const { data } = await fromTable("handoff_sessions").select("*").order("created_at", { ascending: false }).limit(50); return data || []; },
  });

  const { data: continuity = [] } = useQuery({
    queryKey: ["continuity-records"],
    queryFn: async () => { const { data } = await fromTable("context_continuity_records").select("*").order("updated_at", { ascending: false }).limit(20); return data || []; },
  });

  const { data: surfaceStates = [] } = useQuery({
    queryKey: ["surface-context-states"],
    queryFn: async () => { const { data } = await fromTable("surface_context_states").select("*").order("last_active_at", { ascending: false }).limit(20); return data || []; },
  });

  const completed = handoffs.filter((h: Record<string, any>) => h.handoff_status === "completed");
  const failed = handoffs.filter((h: Record<string, any>) => h.handoff_status === "failed");
  const successRate = handoffs.length > 0 ? Math.round((completed.length / handoffs.length) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      <UAOSubNav />
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Route className="h-6 w-6" /> Cross-Surface Journey Board</h1>
        <p className="text-sm text-muted-foreground mt-1">Handoff quality, continuity success, friction points</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Handoffs</p><p className="text-2xl font-bold">{handoffs.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Success Rate</p><p className="text-2xl font-bold text-green-400">{successRate}%</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Failed</p><p className="text-2xl font-bold text-destructive">{failed.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Active Contexts</p><p className="text-2xl font-bold">{continuity.filter((c: Record<string, any>) => c.resumable).length}</p></CardContent></Card>
      </div>

      {handoffs.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Handoff History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>From</TableHead><TableHead></TableHead><TableHead>To</TableHead><TableHead>Status</TableHead><TableHead>Quality</TableHead><TableHead>Friction</TableHead><TableHead>When</TableHead></TableRow></TableHeader>
              <TableBody>
                {handoffs.slice(0, 15).map((h: Record<string, any>) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs font-medium">{h.source_surface}</TableCell>
                    <TableCell><ArrowRight className="h-3 w-3 text-muted-foreground" /></TableCell>
                    <TableCell className="text-xs font-medium">{h.target_surface}</TableCell>
                    <TableCell><Badge className={statusColors[h.handoff_status] || ""}>{h.handoff_status}</Badge></TableCell>
                    <TableCell><Badge className={qualityColors[h.handoff_quality] || ""}>{h.handoff_quality}</Badge></TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{h.friction_notes || "—"}</TableCell>
                    <TableCell className="text-xs">{new Date(h.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {surfaceStates.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Surface Context States</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Surface</TableHead><TableHead>Route</TableHead><TableHead>View</TableHead><TableHead>Last Active</TableHead></TableRow></TableHeader>
              <TableBody>
                {surfaceStates.map((s: Record<string, any>) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.surface}</TableCell>
                    <TableCell className="text-xs font-mono">{s.current_route || "—"}</TableCell>
                    <TableCell className="text-xs">{s.current_view || "—"}</TableCell>
                    <TableCell className="text-xs">{new Date(s.last_active_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {handoffs.length === 0 && (<Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No handoff or journey data recorded yet.</CardContent></Card>)}
    </div>
  );
}
