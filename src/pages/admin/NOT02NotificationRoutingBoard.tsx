// ═══════════════════════════════════════════════════════════════
// SITA OS — NOT02 Notification Routing Board
// Shows routing decisions: channel selection, calm/pref suppression
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { ArrowRight, Filter, Bell, BellOff, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";


export default function NOT02NotificationRoutingBoard() {
  const { data: queue = [] } = useQuery({
    queryKey: ["not02-queue"],
    queryFn: async () => {
      const { data } = await fromTable("notifications_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ["not02-receipts"],
    queryFn: async () => {
      const { data } = await fromTable("notification_delivery_receipts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const { data: preferences = [] } = useQuery({
    queryKey: ["not02-prefs"],
    queryFn: async () => {
      const { data } = await fromTable("notification_preferences").select("*");
      return data || [];
    },
  });

  const channelBadge = (channel: string) => {
    const colors: Record<string, string> = {
      push: "bg-primary/15 text-primary",
      email: "bg-blue-500/15 text-blue-400",
      sms: "bg-green-500/15 text-green-400",
      "in-app": "bg-muted text-muted-foreground",
    };
    return <Badge variant="outline" className={cn("text-[10px]", colors[channel] || colors["in-app"])}>{channel}</Badge>;
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/15 text-yellow-400",
      sent: "bg-emerald-500/15 text-emerald-400",
      delivered: "bg-emerald-500/15 text-emerald-400",
      failed: "bg-destructive/15 text-destructive",
      suppressed: "bg-muted text-muted-foreground",
    };
    return <Badge variant="outline" className={cn("text-[10px]", colors[status] || "bg-muted text-muted-foreground")}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl" data-testid="not02-routing-board">
<div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Filter className="h-5 w-5 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold">NOT02 — Notification Routing Board</h1>
          <p className="text-sm text-muted-foreground">Inspect routing decisions: channel selection, calm suppression, preference filtering</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{queue.length}</p>
          <p className="text-xs text-muted-foreground">Queue Items</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{receipts.length}</p>
          <p className="text-xs text-muted-foreground">Delivery Receipts</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{receipts.filter((r: Record<string, any>) => r.status === "delivered").length}</p>
          <p className="text-xs text-muted-foreground">Delivered</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{receipts.filter((r: Record<string, any>) => r.status === "failed" || r.status === "suppressed").length}</p>
          <p className="text-xs text-muted-foreground">Failed / Suppressed</p>
        </CardContent></Card>
      </div>

      {/* Recent Routing Decisions */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Recent Routing Decisions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Time</TableHead>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Urgency</TableHead>
                <TableHead className="text-xs">Channel</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.slice(0, 25).map((n: Record<string, any>) => (
                <TableRow key={n.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {n.created_at ? new Date(n.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </TableCell>
                  <TableCell className="text-xs font-medium max-w-48 truncate">{n.title}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{n.category}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", {
                      "text-destructive": n.urgency === "critical",
                      "text-yellow-400": n.urgency === "high",
                      "text-primary": n.urgency === "normal",
                      "text-muted-foreground": n.urgency === "low",
                    })}>{n.urgency}</Badge>
                  </TableCell>
                  <TableCell>{channelBadge(n.channel || "in-app")}</TableCell>
                  <TableCell>{statusBadge(n.status || "pending")}</TableCell>
                </TableRow>
              ))}
              {queue.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No routing decisions recorded yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Active Preferences */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Active Preference Rules ({preferences.length})</CardTitle></CardHeader>
        <CardContent>
          {preferences.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Push</TableHead>
                  <TableHead className="text-xs">In-App</TableHead>
                  <TableHead className="text-xs">Min Urgency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preferences.map((p: Record<string, any>) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-medium">{p.category}</TableCell>
                    <TableCell>{p.channel_push ? <Bell className="h-3.5 w-3.5 text-emerald-400" /> : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}</TableCell>
                    <TableCell>{p.channel_in_app ? <Bell className="h-3.5 w-3.5 text-emerald-400" /> : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}</TableCell>
                    <TableCell className="text-xs">{p.urgency_minimum || "low"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No preference rules configured</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
