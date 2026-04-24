// Personal Brain — Phase 7 insights signals hook
// Supports refresh + cursor pagination (infinite scroll) by querying
// pb_insights_signals directly. Mutations still go through the edge fn.
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

const PAGE_SIZE = 20;

/**
 * De-duplicate signals by id while preserving order.
 * Keeps the FIRST occurrence (so already-rendered rows win over a later
 * duplicate from a cursor overlap or a stale refresh).
 */
function dedupeById(rows: PbSignal[]): PbSignal[] {
  const seen = new Set<string>();
  const out: PbSignal[] = [];
  for (const r of rows) {
    if (!r?.id || seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

export function usePbInsightsSignals() {
  const { user } = useAuth();
  const [signals, setSignals] = useState<PbSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("pb_insights_signals")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "dismissed")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    const rows = dedupeById((data ?? []) as unknown as PbSignal[]);
    setSignals(rows);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, [user]);

  const loadMore = useCallback(async () => {
    if (!user || loadingMore || !hasMore || signals.length === 0) return;
    setLoadingMore(true);
    const cursor = signals[signals.length - 1].created_at;
    const { data } = await supabase
      .from("pb_insights_signals")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "dismissed")
      .lt("created_at", cursor)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    const fetched = (data ?? []) as unknown as PbSignal[];
    // Filter out any rows already in state (created_at ties at the cursor
    // boundary can return overlapping ids), then dedupe defensively.
    setSignals((prev) => {
      const have = new Set(prev.map((s) => s.id));
      const fresh = fetched.filter((r) => r?.id && !have.has(r.id));
      return dedupeById([...prev, ...fresh]);
    });
    // hasMore reflects the raw page-size signal from the server, not the
    // post-dedupe count, so we don't stop early when overlap happens.
    setHasMore(fetched.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [user, loadingMore, hasMore, signals]);

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
  return { signals, loading, busy, scan, updateStatus, refresh, loadMore, hasMore, loadingMore };
}
