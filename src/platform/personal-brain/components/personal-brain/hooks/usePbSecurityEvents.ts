// ═══════════════════════════════════════════════════════════════
// Personal Brain — Security Events hook (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PbSecurityEvent {
  id: string;
  event_type: string;
  severity: "info" | "warning" | "critical";
  detail: Record<string, unknown>;
  created_at: string;
}

export function usePbSecurityEvents(limit = 50) {
  const { user } = useAuth();
  const [events, setEvents] = useState<PbSecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("pb_security_events")
        .select("id,event_type,severity,detail,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (cancelled) return;
      setEvents((data ?? []) as PbSecurityEvent[]);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`pb_security_events_${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pb_security_events", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setEvents((prev) => [payload.new as PbSecurityEvent, ...prev].slice(0, limit));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [user, limit]);

  return { events, loading };
}