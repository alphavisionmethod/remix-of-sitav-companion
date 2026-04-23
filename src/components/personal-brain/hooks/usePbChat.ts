import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";
import type { BrainModeId } from "../BRAIN_MODES";

export type PbChat = Database["public"]["Tables"]["pb_chats"]["Row"];
export type PbMessage = Database["public"]["Tables"]["pb_messages"]["Row"];

export interface PbDraftMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Record<string, unknown>;
  pending?: boolean;
}

export function usePbChat(chatId: string | null) {
  const { user } = useAuth();
  const [chat, setChat] = useState<PbChat | null>(null);
  const [messages, setMessages] = useState<PbDraftMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (!user || !chatId) {
      setChat(null);
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: chatRow }, { data: msgRows }] = await Promise.all([
      supabase.from("pb_chats").select("*").eq("id", chatId).eq("user_id", user.id).maybeSingle(),
      supabase
        .from("pb_messages")
        .select("*")
        .eq("chat_id", chatId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(500),
    ]);
    setChat((chatRow as PbChat) ?? null);
    setMessages(
      ((msgRows ?? []) as PbMessage[]).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        sources: (m.sources as Record<string, unknown>) ?? undefined,
      })),
    );
    setLoading(false);
  }, [user, chatId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!user || !chatId) return;
    const channel = supabase
      .channel(`pb_messages:${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pb_messages", filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const row = payload.new as PbMessage;
          if (row.user_id !== user.id) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [
              ...prev,
              {
                id: row.id,
                role: row.role as "user" | "assistant",
                content: row.content,
                sources: (row.sources as Record<string, unknown>) ?? undefined,
              },
            ];
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, chatId]);

  const send = useCallback(
    async (content: string, mode: BrainModeId) => {
      if (!user || !chatId || !content.trim() || streaming) return;
      const trimmed = content.trim();
      const optimisticUserId = `local-user-${Date.now()}`;
      const optimisticAssistantId = `local-assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: optimisticUserId, role: "user", content: trimmed },
        { id: optimisticAssistantId, role: "assistant", content: "", pending: true },
      ]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (!token) throw new Error("Missing session token");

        // Build messages context (last 20 from DB-backed state, omit pending placeholders)
        const history = messages
          .filter((m) => !m.pending)
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));
        const payloadMessages = [...history, { role: "user", content: trimmed }];

        const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/personal-brain`;
        const resp = await fetch(url, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: payloadMessages,
            mode,
            chatId,
          }),
        });

        if (!resp.ok || !resp.body) {
          const errText = await resp.text();
          throw new Error(errText || `HTTP ${resp.status}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assembled = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith("data:")) continue;
            const data = trimmedLine.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                assembled += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === optimisticAssistantId ? { ...m, content: assembled } : m,
                  ),
                );
              }
            } catch {
              /* ignore */
            }
          }
        }

        // Mark optimistic assistant as no longer pending. Realtime sub will replace
        // the local optimistic row when the canonical persisted row arrives.
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticAssistantId
              ? { ...m, content: assembled || m.content, pending: false }
              : m,
          ),
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Stream failed";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticAssistantId
              ? { ...m, content: `Error: ${msg}`, pending: false }
              : m,
          ),
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [user, chatId, streaming, messages],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { chat, messages, loading, streaming, send, stop, reload: load };
}