// Personal Brain — Phase 7 insights signals hook
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PbSignal {
  id: string;
  kind: "pattern" | "blocker" | "win" | "theme" | "suggestion";
  title: string;
  body: string;
  confidence: number;
  status: "new" | "pinned" | "dismissed";
  created_at: string;
}

export function usePbInsightsSignals() {
  const { user } = useAuth();
  const [signals, setSignals] = useState<PbSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.functions.invoke("personal-brain", {
      body: { action: "insights.list", payload: {} },
    });
    setSignals(((data as { signals?: PbSignal[] } | null)?.signals ?? []));
    setLoading(false);
  }, [user]);

  const scan = useCallback(async () => {
    setBusy(true);
    try {
      await supabase.functions.invoke("personal-brain", {
        body: { action: "insights.scan", payload: { windowMessages: 80 } },
      });
      await refresh();
    } finally { setBusy(false); }
  }, [refresh]);

  const updateStatus = useCallback(async (id: string, status: "pinned" | "dismissed" | "new") => {
    await supabase.functions.invoke("personal-brain", {
      body: { action: "insights.update_status", payload: { id, status } },
    });
    if (status === "dismissed") {
      setSignals((prev) => prev.filter((s) => s.id !== id));
    } else {
      setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  return { signals, loading, busy, scan, updateStatus, refresh };
}
