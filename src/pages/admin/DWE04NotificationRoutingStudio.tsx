import DWESubNav from "@/platform/admin/components/admin/DWESubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Route, Volume2, VolumeX, Smartphone, Watch, Laptop } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { AmbientNotificationRouteRow, NotificationFatigueProfileRow, InterruptionPolicyRow } from "@/lib/types/dwe-types";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { DemoOnlyBanner } from "@/platform/trust/components/claim-safety/DemoOnlyBanner";

export default function DWE04NotificationRoutingStudio() {
  const { user } = useAuth();

  const { data: routes = [] } = useQuery<AmbientNotificationRouteRow[]>({
    queryKey: ["dwe04-routes", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("ambient_notification_routes").select("*").order("priority", { ascending: false });
      return (data ?? []) as AmbientNotificationRouteRow[];
    },
  });

  const { data: fatigue = [] } = useQuery<NotificationFatigueProfileRow[]>({
    queryKey: ["dwe04-fatigue", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("notification_fatigue_profiles").select("*");
      return (data ?? []) as NotificationFatigueProfileRow[];
    },
  });

  const { data: interruption = [] } = useQuery<InterruptionPolicyRow[]>({
    queryKey: ["dwe04-interruption", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("interruption_policies").select("*");
      return (data ?? []) as InterruptionPolicyRow[];
    },
  });

  const surfaceIcon = (s: string) => {
    if (s.includes("watch")) return <Watch className="h-4 w-4" />;
    if (s.includes("phone") || s.includes("mobile")) return <Smartphone className="h-4 w-4" />;
    return <Laptop className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 p-6">
      <DWESubNav />
      <DemoOnlyBanner surfaceId="DWE04" />
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
              {routes.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  {surfaceIcon(r.target_surface ?? "")}
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
              {interruption.map((ip) => (
                <div key={ip.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Volume2 className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ip.policy_name}</p>
                    <p className="text-xs text-muted-foreground">Priority: {ip.priority} · Families: {(ip.device_families || []).join(", ") || "all"}</p>
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
