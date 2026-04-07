import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, MonitorSmartphone, ArrowRightLeft, Eye, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

export default function DWE02PresenceContinuityCenter() {
  const { isDemoMode } = useDataMode();
  const [presence, setPresence] = useState<any[]>([]);
  const [handoffs, setHandoffs] = useState<any[]>([]);
  const [contextRecords, setContextRecords] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("presence_states").select("*").order("updated_at", { ascending: false }).limit(20).then(({ data }: any) => setPresence(data || []));
    supabase.from("handoff_sessions").select("*").order("started_at", { ascending: false }).limit(20).then(({ data }: any) => setHandoffs(data || []));
    supabase.from("context_continuity_records").select("*").order("updated_at", { ascending: false }).limit(10).then(({ data }: any) => setContextRecords(data || []));
  }, []);

  const focusColors: Record<string, string> = { available: "text-green-500", focused: "text-blue-500", dnd: "text-red-500", meeting: "text-yellow-500", away: "text-muted-foreground", offline: "text-muted-foreground" };

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DWE02 — Presence & Continuity Center</h1>
        <p className="text-muted-foreground">Active device, continuity state, handoffs, focus, interruption tolerance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Sessions</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{presence.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Handoffs</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{handoffs.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Continuity Records</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{contextRecords.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Handoff Success</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{handoffs.length > 0 ? Math.round((handoffs.filter((h: any) => h.handoff_state === "completed").length / handoffs.length) * 100) : 0}%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Presence States</CardTitle></CardHeader>
        <CardContent>
          {presence.length === 0 ? <p className="text-sm text-muted-foreground">No active presence records.</p> : (
            <div className="space-y-2">
              {presence.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Radio className={`h-4 w-4 ${focusColors[p.focus_state] || "text-muted-foreground"}`} />
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
              {handoffs.map((h: any) => (
                <div key={h.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <MonitorSmartphone className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{h.source_surface} → {h.target_surface}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.started_at).toLocaleString()}</p>
                  </div>
                  <Badge variant={h.handoff_state === "completed" ? "default" : "secondary"} className="text-xs">{h.handoff_state}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}