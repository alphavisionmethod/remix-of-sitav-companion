import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export type PbMemory = Database["public"]["Tables"]["pb_memories"]["Row"];
export type PbMemoryStatus = "active" | "disabled" | "pending";
export type PbMemoryCategory =
  | "style" | "format" | "interest" | "skill" | "project"
  | "pain_point" | "goal" | "work_context" | "preference" | "general";

export const MEMORY_CATEGORIES: { id: PbMemoryCategory; label: string }[] = [
  { id: "general", label: "General" },
  { id: "style", label: "Style" },
  { id: "format", label: "Format" },
  { id: "interest", label: "Interest" },
  { id: "skill", label: "Skill" },
  { id: "project", label: "Project" },
  { id: "pain_point", label: "Pain point" },
  { id: "goal", label: "Goal" },
  { id: "work_context", label: "Work context" },
  { id: "preference", label: "Preference" },
];

interface InvokeOk<T> { ok: true; memory?: T; memories?: T[]; deleted?: number; skipped?: boolean }

async function invokeBrain(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("personal-brain", {
    body: { action, payload },
  });
  if (error) throw error;
  return data as InvokeOk<PbMemory>;
}

export function usePbMemories() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<PbMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setMemories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await invokeBrain("memory.list");
      setMemories((res.memories ?? []) as PbMemory[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load memories");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (input: {
      content: string;
      category?: PbMemoryCategory;
      confidence?: number;
      kind?: "explicit" | "inferred";
      source_chat_id?: string | null;
    }) => {
      const res = await invokeBrain("memory.save", {
        content: input.content,
        category: input.category ?? "general",
        confidence: input.confidence ?? 1.0,
        kind: input.kind ?? "explicit",
        source_chat_id: input.source_chat_id ?? null,
      });
      await refresh();
      return res.memory ?? null;
    },
    [refresh],
  );

  const toggle = useCallback(
    async (id: string, status: PbMemoryStatus) => {
      await invokeBrain("memory.toggle", { id, status });
      setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    },
    [],
  );

  const remove = useCallback(
    async (id: string) => {
      await invokeBrain("memory.delete", { id });
      setMemories((prev) => prev.filter((m) => m.id !== id));
    },
    [],
  );

  const removeCategory = useCallback(
    async (category: PbMemoryCategory) => {
      await invokeBrain("memory.delete", { category });
      await refresh();
    },
    [refresh],
  );

  const triggerScan = useCallback(
    async (chatId?: string | null) => {
      try {
        await invokeBrain("learn.scan", chatId ? { chatId, windowMessages: 30 } : { windowMessages: 60 });
        await refresh();
      } catch (e) {
        console.warn("learn.scan failed:", e);
      }
    },
    [refresh],
  );

  return { memories, loading, error, refresh, save, toggle, remove, removeCategory, triggerScan };
}
