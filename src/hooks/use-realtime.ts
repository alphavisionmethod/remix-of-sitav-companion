import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useQueryClient } from "@tanstack/react-query";

interface RealtimeEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
  table: string;
}

export function useRealtime() {
  const { user } = useAuth();
  const { isLiveMode } = useDataMode();
  const queryClient = useQueryClient();
  const [recentEvents, setRecentEvents] = useState<RealtimeEvent[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isLiveMode || !user) {
      setIsConnected(false);
      return;
    }

    const channel = supabase
      .channel("sita-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, (payload) => {
        const evt: RealtimeEvent = {
          id: (payload.new as Record<string, string>)?.id || crypto.randomUUID(),
          type: payload.eventType,
          payload: payload.new as Record<string, unknown>,
          created_at: new Date().toISOString(),
          table: "events",
        };
        setRecentEvents(prev => [evt, ...prev].slice(0, 50));
        setLastSync(new Date());
        queryClient.invalidateQueries({ queryKey: ["activity"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "approval_queue" }, (payload) => {
        setLastSync(new Date());
        queryClient.invalidateQueries({ queryKey: ["approvals"] });
        queryClient.invalidateQueries({ queryKey: ["approval-queue"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "proof_records" }, () => {
        setLastSync(new Date());
        queryClient.invalidateQueries({ queryKey: ["proof-records"] });
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLiveMode, user, queryClient]);

  return { recentEvents, lastSync, isConnected };
}

// Heartbeat hook — shows last sync time and connectivity
export function useSystemHeartbeat() {
  const { isLiveMode } = useDataMode();
  const { isConnected, lastSync } = useRealtime();
  const [heartbeatAge, setHeartbeatAge] = useState("—");

  useEffect(() => {
    if (!isLiveMode) {
      setHeartbeatAge("Demo");
      return;
    }

    const interval = setInterval(() => {
      if (!lastSync) {
        setHeartbeatAge("Connecting...");
        return;
      }
      const seconds = Math.floor((Date.now() - lastSync.getTime()) / 1000);
      if (seconds < 5) setHeartbeatAge("Just now");
      else if (seconds < 60) setHeartbeatAge(`${seconds}s ago`);
      else if (seconds < 3600) setHeartbeatAge(`${Math.floor(seconds / 60)}m ago`);
      else setHeartbeatAge(`${Math.floor(seconds / 3600)}h ago`);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveMode, lastSync]);

  return { heartbeatAge, isConnected, isLiveMode };
}
