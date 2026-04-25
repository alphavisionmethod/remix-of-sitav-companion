// ═══════════════════════════════════════════════════════════════
// SITA OS — NOT03: Notification Delivery Receipts Explorer
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Bell, CheckCircle, XCircle, Ban, Clock, Zap } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  sent: { color: "bg-emerald-500/15 text-emerald-400", icon: <CheckCircle className="h-3 w-3" /> },
  delivered: { color: "bg-emerald-500/15 text-emerald-400", icon: <CheckCircle className="h-3 w-3" /> },
  failed: { color: "bg-destructive/15 text-destructive", icon: <XCircle className="h-3 w-3" /> },
  suppressed: { color: "bg-amber-500/15 text-amber-400", icon: <Ban className="h-3 w-3" /> },
  opened: { color: "bg-blue-500/15 text-blue-400", icon: <Zap className="h-3 w-3" /> },
  clicked: { color: "bg-blue-500/15 text-blue-400", icon: <Zap className="h-3 w-3" /> },
};

export default function NOT03DeliveryReceiptsExplorer() {
  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ["notification-delivery-receipts"],
    queryFn: async () => {
      const { data, error } = await fromTable("notification_delivery_receipts")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const sentCount = receipts.filter((r: Record<string, any>) => r.status === "sent" || r.status === "delivered").length;
  const failedCount = receipts.filter((r: Record<string, any>) => r.status === "failed").length;
  const suppressedCount = receipts.filter((r: Record<string, any>) => r.status === "suppressed").length;
  const avgLatency = receipts.filter((r: Record<string, any>) => r.latency_ms).length > 0
    ? Math.round(receipts.filter((r: Record<string, any>) => r.latency_ms).reduce((s: number,  r: Record<string, any>) => s + r.latency_ms, 0) / receipts.filter((r: Record<string, any>) => r.latency_ms).length)
    : 0;

  return (
    <div className="space-y-6 p-6">
<div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Delivery Receipts Explorer</h1>
          <p className="text-sm text-muted-foreground">Per-attempt push delivery tracking with failure analysis</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Attempts</p>
          <p className="text-2xl font-bold">{receipts.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Delivered</p>
          <p className="text-2xl font-bold text-emerald-400">{sentCount}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold text-destructive">{failedCount}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Avg Latency</p>
          <p className="text-2xl font-bold">{avgLatency}ms</p>
        </CardContent></Card>
      </div>

      {/* Receipts Table */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Recent Delivery Attempts</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading receipts…</p>
          ) : receipts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No delivery receipts yet</p>
              <p className="text-xs text-muted-foreground mt-1">Receipts appear when push notifications are dispatched</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {receipts.map((r: Record<string, any>) => {
                const cfg = statusConfig[r.status] || statusConfig.failed;
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {cfg.icon}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cfg.color}>{r.status}</Badge>
                          <Badge variant="secondary" className="text-xs">{r.platform}</Badge>
                          <Badge variant="secondary" className="text-xs">{r.channel}</Badge>
                        </div>
                        {r.failure_reason && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{r.failure_reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      {r.latency_ms && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{r.latency_ms}ms
                        </span>
                      )}
                      <span>{new Date(r.sent_at).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suppressed Summary */}
      {suppressedCount > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Calm Routing Suppressions</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{suppressedCount} notifications suppressed by calm routing or preferences</p>
            <div className="space-y-2">
              {receipts.filter((r: Record<string, any>) => r.status === "suppressed").slice(0, 10).map((r: Record<string, any>) => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                  <Badge variant="outline" className="bg-amber-500/15 text-amber-400">{r.failure_reason || "suppressed"}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(r.sent_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
