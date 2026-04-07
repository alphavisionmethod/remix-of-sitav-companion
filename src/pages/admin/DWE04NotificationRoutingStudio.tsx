import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Route, Volume2, VolumeX, Smartphone, Watch, Laptop } from "lucide-react";
import { db } from "@/integrations/supabase/db";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

export default function DWE04NotificationRoutingStudio() {
  const { isDemoMode } = useDataMode();
  const [routes, setRoutes] = useState<any[]>([]);
  const [fatigue, setFatigue] = useState<any[]>([]);
  const [interruption, setInterruption] = useState<any[]>([]);

  useEffect(() => {
    db.from("ambient_notification_routes").select("*").order("priority", { ascending: false }).then(({ data }: any) => setRoutes(data || []));
    db.from("notification_fatigue_profiles").select("*").then(({ data }: any) => setFatigue(data || []));
    db.from("interruption_policies").select("*").then(({ data }: any) => setInterruption(data || []));
  }, []);

  const surfaceIcon = (s: string) => {
    if (s.includes("watch")) return <Watch className="h-4 w-4" />;
    if (s.includes("phone") || s.includes("mobile")) return <Smartphone className="h-4 w-4" />;
    return <Laptop className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DWE04 — Notification Routing Studio</h1>
        <p className="text-muted-foreground">What goes where, why it was routed, urgency policy, fatigue suppression.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Routing Rules</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{routes.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fatigue Profiles</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{fatigue.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Interruption Policies</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{interruption.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" /> Notification Routes</CardTitle></CardHeader>
        <CardContent>
          {routes.length === 0 ? <p className="text-sm text-muted-foreground">No routing rules configured yet.</p> : (
            <div className="space-y-2">
              {routes.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  {surfaceIcon(r.target_surface)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{r.route_name}</p>
                    <p className="text-xs text-muted-foreground">→ {r.target_surface} · {r.category || "general"}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{r.urgency_level || "normal"}</Badge>
                  {r.fatigue_aware && <VolumeX className="h-3 w-3 text-muted-foreground" />}
                  <Badge variant={r.enabled ? "default" : "secondary"} className="text-xs">{r.enabled ? "Active" : "Disabled"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Interruption Policies</CardTitle></CardHeader>
        <CardContent>
          {interruption.length === 0 ? <p className="text-sm text-muted-foreground">No interruption policies set.</p> : (
            <div className="space-y-2">
              {interruption.map((ip: any) => (
                <div key={ip.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  {ip.enforce_quiet_hours ? <VolumeX className="h-4 w-4 text-yellow-500" /> : <Volume2 className="h-4 w-4" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ip.policy_name}</p>
                    <p className="text-xs text-muted-foreground">Focus: {ip.focus_state_trigger || "any"} · {ip.enforce_quiet_hours ? "Quiet hours enforced" : "No quiet hours"}</p>
                  </div>
                  <Badge variant={ip.enabled ? "default" : "secondary"} className="text-xs">{ip.enabled ? "Active" : "Off"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}