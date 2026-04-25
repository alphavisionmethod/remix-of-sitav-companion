// ═══════════════════════════════════════════════════════════════
// SITA OS — NOT04 Calm Policy Board
// Inspect interruption policies, quiet hours, urgency gating
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Moon, Shield, Clock, Volume2, VolumeX, Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";


export default function NOT04CalmPolicyBoard() {
  const { data: policies = [] } = useQuery({
    queryKey: ["not04-policies"],
    queryFn: async () => {
      const { data } = await fromTable("interruption_policies").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: deliveryReceipts = [] } = useQuery({
    queryKey: ["not04-suppressed"],
    queryFn: async () => {
      const { data } = await fromTable("notification_delivery_receipts")
        .select("*")
        .in("status", ["suppressed", "deferred", "quiet_hours"])
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const activePolicies = policies.filter((p: Record<string, any>) => p.active !== false);

  return (
    <div className="p-6 space-y-6 max-w-6xl" data-testid="not04-calm-board">
<div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent/10"><Moon className="h-5 w-5 text-accent" /></div>
        <div>
          <h1 className="text-xl font-bold">NOT04 — Calm Policy Board</h1>
          <p className="text-sm text-muted-foreground">Interruption policies, quiet hours, urgency gating, and suppression evidence</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{policies.length}</p>
          <p className="text-xs text-muted-foreground">Total Policies</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{activePolicies.length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{deliveryReceipts.length}</p>
          <p className="text-xs text-muted-foreground">Suppressed Notifications</p>
        </CardContent></Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Interruption Policies</CardTitle></CardHeader>
        <CardContent>
          {policies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Policy</TableHead>
                  <TableHead className="text-xs">Surface</TableHead>
                  <TableHead className="text-xs">Urgency Gate</TableHead>
                  <TableHead className="text-xs">Quiet Hours</TableHead>
                  <TableHead className="text-xs">Dedup Window</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((p: Record<string, any>) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-medium">{p.policy_name || p.id?.slice(0, 8)}</TableCell>
                    <TableCell className="text-xs">{p.surface || "all"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{p.min_urgency || p.urgency_gate || "low"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {p.quiet_start && p.quiet_end ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {p.quiet_start}–{p.quiet_end}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs">{p.dedup_window_minutes ? `${p.dedup_window_minutes}m` : "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", p.active !== false ? "text-emerald-400" : "text-muted-foreground")}>
                        {p.active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No interruption policies configured yet</p>
          )}
        </CardContent>
      </Card>

      {/* Suppressed Notifications */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><VolumeX className="h-4 w-4" /> Recent Suppressions</CardTitle></CardHeader>
        <CardContent>
          {deliveryReceipts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Time</TableHead>
                  <TableHead className="text-xs">Notification</TableHead>
                  <TableHead className="text-xs">Channel</TableHead>
                  <TableHead className="text-xs">Reason</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryReceipts.map((r: Record<string, any>) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.created_at ? new Date(r.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </TableCell>
                    <TableCell className="text-xs font-medium max-w-48 truncate">{r.notification_id?.slice(0, 8)}</TableCell>
                    <TableCell className="text-xs">{r.channel || "—"}</TableCell>
                    <TableCell className="text-xs">{r.failure_reason || r.status || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] text-muted-foreground">{r.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No calm suppressions recorded yet — this is good if notifications are flowing naturally</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
