import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, CheckCircle2, XCircle, AlertTriangle, Bell, Smartphone, Monitor, Apple } from "lucide-react";
import NRCSubNav from "@/platform/admin/components/admin/NRCSubNav";



interface ChannelTruth {
  channel: string;
  label: string;
  icon: React.ElementType;
  status: "live" | "partial" | "planned" | "unavailable";
  deliveryCount: number;
  successRate: number;
  evidence: string;
}

function useNotificationLaunchHonesty() {
  return useQuery({
    queryKey: ["nrc06-notification-launch-honesty-real"],
    queryFn: async () => {
      // Fetch delivery receipts
      const { data: receipts, error: rErr } = await fromTable("notification_delivery_receipts")
        .select("channel, delivery_status, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (rErr) throw rErr;

      // Fetch push subscriptions
      const { data: tokens, error: tErr } = await fromTable("device_push_tokens")
        .select("id, platform, created_at");
      // table may not exist yet — graceful fallback
      const pushTokens = tErr ? [] : (tokens || []);

      const allReceipts = receipts || [];

      // Compute per-channel stats
      const channelStats = (channel: string) => {
        const ch = allReceipts.filter((r: Record<string, any>) => r.channel === channel);
        const delivered = ch.filter((r: Record<string, any>) => r.delivery_status === "delivered" || r.delivery_status === "sent");
        return {
          count: ch.length,
          successRate: ch.length > 0 ? Math.round((delivered.length / ch.length) * 100) : 0,
        };
      };

      const webPush = channelStats("push");
      const inApp = channelStats("in_app");

      const channels: ChannelTruth[] = [
        {
          channel: "web_push",
          label: "Web Push (VAPID)",
          icon: Monitor,
          status: webPush.count > 0 ? "live" : pushTokens.length > 0 ? "partial" : "planned",
          deliveryCount: webPush.count,
          successRate: webPush.successRate,
          evidence: webPush.count > 0
            ? `${webPush.count} deliveries, ${webPush.successRate}% success`
            : pushTokens.length > 0
              ? `${pushTokens.length} subscriptions, no deliveries yet`
              : "No subscriptions or deliveries",
        },
        {
          channel: "in_app",
          label: "In-App Notifications",
          icon: Bell,
          status: inApp.count > 0 ? "live" : "partial",
          deliveryCount: inApp.count,
          successRate: inApp.successRate,
          evidence: inApp.count > 0
            ? `${inApp.count} deliveries, ${inApp.successRate}% success`
            : "Queue exists, no tracked deliveries",
        },
        {
          channel: "android_push",
          label: "Android Push (FCM)",
          icon: Smartphone,
          status: "planned",
          deliveryCount: 0,
          successRate: 0,
          evidence: "FCM integration planned. No implementation yet.",
        },
        {
          channel: "apple_push",
          label: "Apple Push (APNs)",
          icon: Apple,
          status: "planned",
          deliveryCount: 0,
          successRate: 0,
          evidence: "Requires Apple Developer Program membership. Planned.",
        },
      ];

      const liveCount = channels.filter((c) => c.status === "live").length;
      const overallScore = Math.round((liveCount / channels.length) * 100);

      return { channels, overallScore, totalReceipts: allReceipts.length, pushSubscriptions: pushTokens.length };
    },
    staleTime: 30_000,
  });
}

const statusColors: Record<string, string> = {
  live: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  partial: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  planned: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  unavailable: "bg-muted text-muted-foreground border-border",
};

const statusIcons: Record<string, React.ElementType> = {
  live: CheckCircle2,
  partial: AlertTriangle,
  planned: Rocket,
  unavailable: XCircle,
};

export default function NRC06NotificationLaunchHonesty() {
  const { data, isLoading } = useNotificationLaunchHonesty();

  return (
    <div className="space-y-6">
      <NRCSubNav />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">NRC06 — Notification Launch Honesty</h1>
            <p className="text-muted-foreground">Evidence-based classification of notification channel readiness</p>
          </div>
        </div>
        <Badge variant="secondary">{data?.overallScore || 0}% channels live</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Receipts", value: data?.totalReceipts || 0 },
          { label: "Push Subscriptions", value: data?.pushSubscriptions || 0 },
          { label: "Channels Live", value: data?.channels?.filter((c) => c.status === "live").length || 0 },
          { label: "Channels Planned", value: data?.channels?.filter((c) => c.status === "planned").length || 0 },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          (data?.channels || []).map((channel) => {
            const StatusIcon = statusIcons[channel.status] || XCircle;
            return (
              <Card key={channel.channel} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <channel.icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-foreground text-base">{channel.label}</CardTitle>
                    </div>
                    <Badge className={statusColors[channel.status]}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {channel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deliveries</span>
                    <span className="text-foreground font-mono">{channel.deliveryCount}</span>
                  </div>
                  {channel.deliveryCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="text-foreground font-mono">{channel.successRate}%</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground pt-1">{channel.evidence}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
