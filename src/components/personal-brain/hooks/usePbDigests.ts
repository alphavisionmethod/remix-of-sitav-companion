// Personal Brain — Phase 7 digests hook
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PbDigest {
  id: string;
  period: "daily" | "weekly";
  period_start: string;
  period_end: string;
  title: string;
  summary: string;
  highlights: Array<{ kind: string; text: string }>;
  source_counts: Record<string, number>;
  status: "draft" | "ready" | "dismissed";
  created_at: string;
}

export function usePbDigests() {
  const { user } = useAuth();
  const [digests, setDigests] = useState<PbDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.functions.invoke("personal-brain", {
      body: { action: "digest.list", payload: {} },
    });
    setDigests(((data as { digests?: PbDigest[] } | null)?.digests ?? []));
    setLoading(false);
  }, [user]);

  const generate = useCallback(async (period: "daily" | "weekly" = "daily") => {
    setBusy(true);
    try {
      await supabase.functions.invoke("personal-brain", {
        body: { action: "digest.generate", payload: { period } },
      });
      await refresh();
    } finally { setBusy(false); }
  }, [refresh]);

  const dismiss = useCallback(async (id: string) => {
    await supabase.functions.invoke("personal-brain", {
      body: { action: "digest.dismiss", payload: { id } },
    });
    setDigests((prev) => prev.filter((d) => d.id !== id));
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  return { digests, loading, busy, generate, dismiss, refresh };
}
