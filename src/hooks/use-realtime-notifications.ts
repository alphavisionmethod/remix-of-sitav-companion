import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useElectronBridge } from "@/hooks/useElectronBridge";

const URGENCY_STYLES: Record<string, { icon: string; type: "success" | "error" | "info" | "warning" }> = {
  critical: { icon: "🔴", type: "error" },
  high: { icon: "🟠", type: "warning" },
  medium: { icon: "🔵", type: "info" },
  low: { icon: "✅", type: "success" },
};

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { isElectron, sendNotification } = useElectronBridge();

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // Ensure the realtime socket is authenticated so RLS-filtered events reach us
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) {
          supabase.realtime.setAuth(token);
        }
      } catch (err) {
        console.warn("[realtime-notifications] setAuth failed", err);
      }

      if (cancelled) return;

      channel = supabase
        .channel(`realtime-notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const n = payload.new as { title: string; body?: string; urgency?: string; domain?: string; action_url?: string };
            const style = URGENCY_STYLES[n.urgency || "low"] || URGENCY_STYLES.low;

            // Web toast notification
            toast[style.type](`${style.icon} ${n.title}`, {
              description: n.body || undefined,
              action: n.action_url
                ? { label: "View", onClick: () => window.location.assign(n.action_url!) }
                : undefined,
              duration: n.urgency === "critical" ? 10000 : 5000,
            });

            // Native Electron notification — routed through canonical bridge
            if (isElectron) {
              try {
                sendNotification(`${style.icon} ${n.title}`, n.body || "");
              } catch {
                // Electron bridge not available
              }
            }

            qc.invalidateQueries({ queryKey: ["notifications"] });
          }
        )
        .subscribe((status) => {
          console.log("[realtime-notifications] status:", status);
        });
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id, qc, isElectron, sendNotification]);
}
