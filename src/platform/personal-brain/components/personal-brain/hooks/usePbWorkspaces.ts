import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export type PbWorkspace = Database["public"]["Tables"]["pb_workspaces"]["Row"];

export function usePbWorkspaces() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<PbWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("pb_workspaces")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setWorkspaces((data ?? []) as PbWorkspace[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createWorkspace = useCallback(
    async (input: {
      name: string;
      kind?: string;
      default_mode?: string;
      color?: string;
      custom_instructions?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("pb_workspaces")
        .insert({
          user_id: user.id,
          name: input.name,
          kind: input.kind ?? "personal",
          default_mode: input.default_mode ?? "think",
          color: input.color ?? "primary",
          custom_instructions: input.custom_instructions ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      await refresh();
      return data as PbWorkspace;
    },
    [user, refresh],
  );

  const archiveWorkspace = useCallback(
    async (id: string) => {
      if (!user) return;
      await supabase
        .from("pb_workspaces")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      await refresh();
    },
    [user, refresh],
  );

  return { workspaces, loading, error, refresh, createWorkspace, archiveWorkspace };
}