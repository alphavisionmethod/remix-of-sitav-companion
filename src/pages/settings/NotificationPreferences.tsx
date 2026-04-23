import { useAction } from "@/hooks/use-action";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Globe, Smartphone, AlertTriangle } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Production fallback — seed data removed
const CATEGORIES: any[] = [];

export default function NotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isSupported, isRegistered, permissionState, requestPermission, unregister, isLoading: pushLoading } = usePushNotifications();

  const { data: preferences = [] } = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await fromTable("notification_preferences").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const upsertPref = useAction("system", "notification-pref.upsert");

  const getPref = (category: string) => {
    const existing = preferences.find((p: Record<string, any>) => p.category === category);
    return { channel_push: existing?.channel_push ?? true, channel_in_app: existing?.channel_in_app ?? true, urgency_minimum: existing?.urgency_minimum ?? "low" };
  };

  const permissionLabel = permissionState === "granted" ? "Granted" : permissionState === "denied" ? "Blocked" : permissionState === "default" ? "Not Asked" : "Unsupported";
  const permissionColor = permissionState === "granted" ? "bg-emerald-500/15 text-emerald-400" : permissionState === "denied" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6" data-testid="notification-preferences-page">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Bell className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold">Notification Preferences</h1>
          <p className="text-sm text-muted-foreground">Control how and when you receive notifications</p>
        </div>
      </div>

      {/* Push Permission State */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> Web Push Notifications
          </CardTitle>
          <CardDescription>Receive notifications even when SITA is not open</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Browser Permission</span>
              <Badge variant="outline" className={permissionColor}>{permissionLabel}</Badge>
            </div>
            {isRegistered ? (
              <Button variant="outline" size="sm" onClick={() => unregister()} disabled={pushLoading}>
                <BellOff className="h-4 w-4 mr-2" /> Disable Push
              </Button>
            ) : isSupported && permissionState !== "denied" ? (
              <Button size="sm" onClick={() => requestPermission()} disabled={pushLoading}>
                <Bell className="h-4 w-4 mr-2" /> Enable Push
              </Button>
            ) : null}
          </div>

          {permissionState === "denied" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-destructive">Push notifications are blocked by your browser. Reset permission in browser settings to re-enable.</span>
            </div>
          )}

          {!isSupported && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Push notifications are not supported in this browser.</span>
            </div>
          )}

          {isRegistered && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Bell className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">Web push is active. You'll receive notifications in this browser.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Category Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category Preferences</CardTitle>
          <CardDescription>Choose which categories send push vs in-app only</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {([] as any[]).map((cat) => {
            const pref = getPref(cat.key);
            return (
              <div key={cat.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Push</span>
                    <Switch
                      checked={pref.channel_push}
                      disabled={!isRegistered}
                      onCheckedChange={(checked) =>
                        upsertPref.mutate({ category: cat.key, channel_push: checked, channel_in_app: pref.channel_in_app, urgency_minimum: pref.urgency_minimum })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">In-App</span>
                    <Switch
                      checked={pref.channel_in_app}
                      onCheckedChange={(checked) =>
                        upsertPref.mutate({ category: cat.key, channel_push: pref.channel_push, channel_in_app: checked, urgency_minimum: pref.urgency_minimum })
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Platform Status */}
      <Card>
        <CardHeader><CardTitle className="text-base">Platform Support</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { platform: "Web / Desktop Browser", status: "Available", color: "bg-emerald-500/15 text-emerald-400" },
              { platform: "Android (FCM)", status: "Planned", color: "bg-muted text-muted-foreground" },
              { platform: "Apple / iOS (APNs)", status: "Planned", color: "bg-muted text-muted-foreground" },
            ].map((p) => (
              <div key={p.platform} className="flex items-center justify-between p-2 rounded bg-muted/20">
                <span className="text-sm">{p.platform}</span>
                <Badge variant="outline" className={p.color}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
