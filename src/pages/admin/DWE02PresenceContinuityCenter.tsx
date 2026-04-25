import DWESubNav from "@/platform/admin/components/admin/DWESubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonitorSmartphone, ArrowRightLeft, Eye, Radio } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { PresenceStateRow, HandoffSessionRow, ContextContinuityRow } from "@/lib/types/dwe-types";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { DemoOnlyBanner } from "@/platform/trust/components/claim-safety/DemoOnlyBanner";

export default function DWE02PresenceContinuityCenter() {
  const { user } = useAuth();

  const { data: presence = [] } = useQuery<PresenceStateRow[]>({
    queryKey: ["dwe02-presence", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("presence_states").select("*").order("updated_at", { ascending: false }).limit(20);
      return (data ?? []) as PresenceStateRow[];
    },
  });

  const { data: handoffs = [] } = useQuery<HandoffSessionRow[]>({
    queryKey: ["dwe02-handoffs", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("handoff_sessions").select("*").order("initiated_at", { ascending: false }).limit(20);
      return (data ?? []) as HandoffSessionRow[];
    },
  });

  const { data: contextRecords = [] } = useQuery<ContextContinuityRow[]>({
    queryKey: ["dwe02-context", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("context_continuity_records").select("*").order("updated_at", { ascending: false }).limit(10);
      return (data ?? []) as ContextContinuityRow[];
    },
  });

  const focusColors: Record<string, string> = { available: "text-primary", focused: "text-accent-foreground", dnd: "text-destructive", meeting: "text-warning", away: "text-muted-foreground", offline: "text-muted-foreground" };

  return (
    <div className="space-y-6 p-6">
      <DWESubNav />
      <DemoOnlyBanner surfaceId="DWE02" />
<div>
        <h1 className="text-2xl font-bold text-foreground">DWE02 — Presence & Continuity Center</h1>
        <p className="text-muted-foreground">Active device, continuity state, handoffs, focus, interruption tolerance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Sessions</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{presence.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Handoffs</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{handoffs.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Continuity Records</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{contextRecords.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Handoff Success</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{handoffs.length > 0 ? Math.round((handoffs.filter((h) => h.handoff_status === "completed").length / handoffs.length) * 100) : 0}%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Presence States</CardTitle></CardHeader>
        <CardContent>
          {presence.length === 0 ? <p className="text-sm text-muted-foreground">No active presence records.</p> : (
            <div className="space-y-2">
              {presence.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Radio className={`h-4 w-4 ${focusColors[p.focus_state ?? ""] || "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{p.active_surface || "Unknown surface"}</p>
                    <p className="text-xs text-muted-foreground">Focus: {p.focus_state} · Interruption: {p.interruption_tolerance}</p>
                  </div>
                  {p.handoff_eligible && <Badge variant="outline" className="text-xs">Handoff OK</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5" /> Recent Handoffs</CardTitle></CardHeader>
        <CardContent>
          {handoffs.length === 0 ? <p className="text-sm text-muted-foreground">No handoff sessions recorded.</p> : (
            <div className="space-y-2">
              {handoffs.map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <MonitorSmartphone className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{h.source_surface} → {h.target_surface}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.initiated_at).toLocaleString()}</p>
                  </div>
                  <Badge variant={h.handoff_status === "completed" ? "default" : "secondary"} className="text-xs">{h.handoff_status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
