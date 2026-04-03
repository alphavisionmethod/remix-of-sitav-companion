import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const URGENCY_STYLES: Record<string, { icon: string; type: "success" | "error" | "info" | "warning" }> = {
  critical: { icon: "🔴", type: "error" },
  high: { icon: "🟠", type: "warning" },
  medium: { icon: "🔵", type: "info" },
  low: { icon: "✅", type: "success" },
};

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("realtime-notifications")
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

          toast[style.type](`${style.icon} ${n.title}`, {
            description: n.body || undefined,
            action: n.action_url
              ? { label: "View", onClick: () => window.location.assign(n.action_url!) }
              : undefined,
            duration: n.urgency === "critical" ? 10000 : 5000,
          });

          qc.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);
}
