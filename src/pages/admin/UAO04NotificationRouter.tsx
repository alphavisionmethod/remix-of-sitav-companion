import UAOSubNav from "@/platform/admin/components/admin/UAOSubNav";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const urgencyColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-orange-500/20 text-orange-400", normal: "bg-blue-500/20 text-blue-400", low: "bg-muted text-muted-foreground" };

export default function UAO04NotificationRouter() {
  const { data: routes = [] } = useQuery({
    queryKey: ["notification-routes"],
    queryFn: async () => { const { data } = await fromTable("ambient_notification_routes").select("*").order("priority"); return data || []; },
  });

  const { data: fatigue = [] } = useQuery({
    queryKey: ["fatigue-profiles"],
    queryFn: async () => { const { data } = await fromTable("notification_fatigue_profiles").select("*"); return data || []; },
  });

  const { data: interruption = [] } = useQuery({
    queryKey: ["interruption-policies"],
    queryFn: async () => { const { data } = await fromTable("interruption_policies").select("*").order("priority"); return data || []; },
  });

  const fp = fatigue[0];

  return (
    <div className="space-y-6 p-6">
      <UAOSubNav />
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6" /> Notification & Escalation Router</h1>
        <p className="text-sm text-muted-foreground mt-1">Routing rules, urgency ladders, quiet hours, fatigue control</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Active Routes</p><p className="text-2xl font-bold">{routes.filter((r: Record<string, any>) => r.enabled).length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Max/Hour</p><p className="text-2xl font-bold">{fp?.max_notifications_per_hour || "—"}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Watch Max/Hour</p><p className="text-2xl font-bold">{fp?.max_watch_notifications_per_hour || "—"}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Interruption Policies</p><p className="text-2xl font-bold">{interruption.length}</p></CardContent></Card>
      </div>

      {fp && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Fatigue Profile</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Quiet Hours:</span> {fp.quiet_hours_start || "—"} — {fp.quiet_hours_end || "—"}</div>
              <div><span className="text-muted-foreground">Focus Mode:</span> {fp.focus_mode_behavior}</div>
              <div><span className="text-muted-foreground">Workout:</span> {fp.workout_behavior}</div>
              <div><span className="text-muted-foreground">Sleep:</span> {fp.sleep_behavior}</div>
              <div><span className="text-muted-foreground">Cooldown:</span> {fp.cooldown_minutes}min</div>
              <div><span className="text-muted-foreground">Escalation After:</span> {fp.escalation_only_after_minutes}min</div>
            </div>
          </CardContent>
        </Card>
      )}

      {routes.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Notification Routes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Route</TableHead><TableHead>Urgency</TableHead><TableHead>Surface</TableHead><TableHead>Device Family</TableHead><TableHead>Fatigue</TableHead><TableHead>Enabled</TableHead><TableHead>Priority</TableHead></TableRow></TableHeader>
              <TableBody>
                {routes.map((r: Record<string, any>) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.route_name}</TableCell>
                    <TableCell><Badge className={urgencyColors[r.urgency_level] || ""}>{r.urgency_level}</Badge></TableCell>
                    <TableCell className="text-xs">{r.target_surface}</TableCell>
                    <TableCell className="text-xs">{r.target_device_family || "any"}</TableCell>
                    <TableCell>{r.fatigue_aware ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{r.enabled ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                    <TableCell className="text-xs">{r.priority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {interruption.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Interruption Policies</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Policy</TableHead><TableHead>Time Range</TableHead><TableHead>Allowed Urgencies</TableHead><TableHead>Suppress</TableHead><TableHead>Enabled</TableHead></TableRow></TableHeader>
              <TableBody>
                {interruption.map((p: Record<string, any>) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.policy_name}</TableCell>
                    <TableCell className="text-xs">{p.time_range_start || "—"} — {p.time_range_end || "—"}</TableCell>
                    <TableCell className="text-xs">{(p.allowed_urgencies || []).join(", ")}</TableCell>
                    <TableCell className="text-xs">{(p.suppress_categories || []).join(", ") || "—"}</TableCell>
                    <TableCell>{p.enabled ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {routes.length === 0 && fatigue.length === 0 && (<Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No notification routes or fatigue profiles configured.</CardContent></Card>)}
    </div>
  );
}
