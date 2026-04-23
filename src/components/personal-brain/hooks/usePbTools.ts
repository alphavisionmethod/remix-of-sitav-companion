// Personal Brain — Phase 7 external tools hook
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PbToolKind = "web_search" | "calendar" | "file_search" | "memory_search" | "custom";
export interface PbTool {
  id: string;
  tool_key: string;
  display_name: string;
  description: string;
  kind: PbToolKind;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
}

export interface PbToolUpsertInput {
  tool_key: string;
  display_name: string;
  description?: string;
  kind?: PbToolKind;
  config?: Record<string, unknown>;
  enabled?: boolean;
}

export function usePbTools() {
  const { user } = useAuth();
  const [tools, setTools] = useState<PbTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.functions.invoke("personal-brain", {
      body: { action: "tool.list", payload: {} },
    });
    setTools(((data as { tools?: PbTool[] } | null)?.tools ?? []));
    setLoading(false);
  }, [user]);

  const upsert = useCallback(async (input: PbToolUpsertInput) => {
    setBusy(true);
    try {
      await supabase.functions.invoke("personal-brain", {
        body: { action: "tool.upsert", payload: input },
      });
      await refresh();
    } finally { setBusy(false); }
  }, [refresh]);

  const toggle = useCallback(async (id: string, enabled: boolean) => {
    await supabase.functions.invoke("personal-brain", {
      body: { action: "tool.toggle", payload: { id, enabled } },
    });
    setTools((p) => p.map((t) => (t.id === id ? { ...t, enabled } : t)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.functions.invoke("personal-brain", {
      body: { action: "tool.delete", payload: { id } },
    });
    setTools((p) => p.filter((t) => t.id !== id));
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  return { tools, loading, busy, refresh, upsert, toggle, remove };
}
