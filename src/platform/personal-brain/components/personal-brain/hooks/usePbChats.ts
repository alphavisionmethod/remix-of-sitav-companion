import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";
import type { BrainModeId } from "../BRAIN_MODES";

export type PbChat = Database["public"]["Tables"]["pb_chats"]["Row"];

interface UsePbChatsOptions {
  workspaceId?: string | null;
  limit?: number;
}

export function usePbChats(opts: UsePbChatsOptions = {}) {
  const { user } = useAuth();
  const [chats, setChats] = useState<PbChat[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let q = supabase
      .from("pb_chats")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("pinned", { ascending: false })
      .order("last_message_at", { ascending: false })
      .limit(opts.limit ?? 50);
    if (opts.workspaceId !== undefined) {
      if (opts.workspaceId === null) {
        q = q.is("workspace_id", null);
      } else {
        q = q.eq("workspace_id", opts.workspaceId);
      }
    }
    const { data } = await q;
    setChats((data ?? []) as PbChat[]);
    setLoading(false);
  }, [user, opts.workspaceId, opts.limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createChat = useCallback(
    async (input: {
      title?: string;
      mode: BrainModeId;
      workspace_id?: string | null;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("pb_chats")
        .insert({
          user_id: user.id,
          title: input.title ?? "New chat",
          mode: input.mode,
          workspace_id: input.workspace_id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      await refresh();
      return data as PbChat;
    },
    [user, refresh],
  );

  const renameChat = useCallback(
    async (id: string, title: string) => {
      if (!user) return;
      await supabase
        .from("pb_chats")
        .update({ title })
        .eq("id", id)
        .eq("user_id", user.id);
      await refresh();
    },
    [user, refresh],
  );

  const togglePin = useCallback(
    async (id: string, pinned: boolean) => {
      if (!user) return;
      await supabase
        .from("pb_chats")
        .update({ pinned })
        .eq("id", id)
        .eq("user_id", user.id);
      await refresh();
    },
    [user, refresh],
  );

  const archiveChat = useCallback(
    async (id: string) => {
      if (!user) return;
      await supabase
        .from("pb_chats")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      await refresh();
    },
    [user, refresh],
  );

  return { chats, loading, refresh, createChat, renameChat, togglePin, archiveChat };
}