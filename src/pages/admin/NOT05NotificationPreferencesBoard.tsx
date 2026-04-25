// ═══════════════════════════════════════════════════════════════
// SITA OS — NOT05 Notification Preferences Board
// Admin view of per-user notification preferences
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Settings, Bell, BellOff, Users, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";


export default function NOT05NotificationPreferencesBoard() {
  const { data: preferences = [] } = useQuery({
    queryKey: ["not05-all-prefs"],
    queryFn: async () => {
      const { data } = await fromTable("notification_preferences").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ["not05-device-tokens"],
    queryFn: async () => {
      const { data } = await fromTable("device_push_tokens").select("*").eq("active", true).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const uniqueUsers = new Set(preferences.map((p: Record<string, any>) => p.user_id)).size;
  const pushEnabledCount = preferences.filter((p: Record<string, any>) => p.channel_push).length;
  const inAppOnlyCount = preferences.filter((p: Record<string, any>) => !p.channel_push && p.channel_in_app).length;

  return (
    <div className="p-6 space-y-6 max-w-6xl" data-testid="not05-prefs-board">
<div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Settings className="h-5 w-5 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold">NOT05 — Notification Preferences Board</h1>
          <p className="text-sm text-muted-foreground">Per-user notification preferences, push status, and device registrations</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{uniqueUsers}</p>
          <p className="text-xs text-muted-foreground">Users with Prefs</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{preferences.length}</p>
          <p className="text-xs text-muted-foreground">Preference Rules</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{tokens.length}</p>
          <p className="text-xs text-muted-foreground">Active Push Devices</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{pushEnabledCount}</p>
          <p className="text-xs text-muted-foreground">Push-Enabled Rules</p>
        </CardContent></Card>
      </div>

      {/* Device Tokens */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4" /> Active Push Subscriptions</CardTitle></CardHeader>
        <CardContent>
          {tokens.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Platform</TableHead>
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs">Registered</TableHead>
                  <TableHead className="text-xs">Last Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((t: Record<string, any>) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs font-mono">{t.user_id?.slice(0, 8)}…</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", {
                        "text-primary": t.platform === "web",
                        "text-green-400": t.platform === "android",
                        "text-blue-400": t.platform === "ios",
                      })}>{t.platform}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{t.device_name || "Unknown"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {t.last_used_at ? new Date(t.last_used_at).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No active push subscriptions</p>
          )}
        </CardContent>
      </Card>

      {/* Preferences Table */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> All Preference Rules</CardTitle></CardHeader>
        <CardContent>
          {preferences.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Push</TableHead>
                  <TableHead className="text-xs">In-App</TableHead>
                  <TableHead className="text-xs">Min Urgency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preferences.map((p: Record<string, any>) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-mono">{p.user_id?.slice(0, 8)}…</TableCell>
                    <TableCell className="text-xs font-medium">{p.category}</TableCell>
                    <TableCell>
                      {p.channel_push
                        ? <Bell className="h-3.5 w-3.5 text-emerald-400" />
                        : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </TableCell>
                    <TableCell>
                      {p.channel_in_app
                        ? <Bell className="h-3.5 w-3.5 text-emerald-400" />
                        : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="text-xs">{p.urgency_minimum || "low"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No user preferences configured yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
