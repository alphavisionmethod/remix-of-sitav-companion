// ════════════════════════════════════════════════════════════
// SITA OS — Phase 7 useOrchestratorStream
// SSE client for `ai-orchestrator-stream`. Yields incremental
// `context`, `trace`, `delta`, `done` events as they arrive.
// Class: HOOK (frontend). Edge fn does all auth + context.
// ════════════════════════════════════════════════════════════
import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type OrchestratorStreamEvent =
  | { kind: "context"; invocationId: string; correlationId: string; semanticMemories: number; semanticChunks: number; autoMemories: number }
  | { kind: "trace"; source_type: string; source_label: string; similarity: number | null; retrieval_kind: string }
  | { kind: "delta"; text: string }
  | { kind: "error"; message: string; status?: number }
  | { kind: "done"; invocationId: string; correlationId: string; model: string; traceCount?: number; failed?: boolean };

export interface OrchestratorStreamRequest {
  capabilityKey?: string;
  workspaceId?: string | null;
  moduleId?: string | null;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  contextSources?: {
    semanticRetrieval?: boolean;
    semanticMemoryMax?: number;
    semanticChunkMax?: number;
    minSimilarity?: number;
    workspaceMemoryAuto?: boolean;
    workspaceMemoryMax?: number;
  };
  model?: string;
  temperature?: number;
  maxTokens?: number;
  correlationId?: string;
}

const STREAM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-orchestrator-stream`;

/**
 * Stream the orchestrator's SSE response and surface the running text
 * + structured event log. Returns the cumulative text on resolution.
 */
export function useOrchestratorStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [text, setText] = useState("");
  const [events, setEvents] = useState<OrchestratorStreamEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setText("");
    setEvents([]);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const start = useCallback(async (req: OrchestratorStreamRequest): Promise<string> => {
    reset();
    setIsStreaming(true);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setError("Not authenticated");
      setIsStreaming(false);
      return "";
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let resp: Response;
    try {
      resp = await fetch(STREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(req),
        signal: ctrl.signal,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setIsStreaming(false);
      return "";
    }

    if (!resp.ok || !resp.body) {
      const txt = await resp.text().catch(() => "");
      setError(txt || `HTTP ${resp.status}`);
      setIsStreaming(false);
      return "";
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let collectedText = "";
    let currentEvent = "message";

    const flushEvent = (raw: string) => {
      const data = raw.trim();
      if (!data) return;
      try {
        const parsed = JSON.parse(data);
        switch (currentEvent) {
          case "context":
            setEvents((p) => [...p, { kind: "context", ...parsed } as OrchestratorStreamEvent]);
            break;
          case "trace":
            setEvents((p) => [...p, { kind: "trace", ...parsed } as OrchestratorStreamEvent]);
            break;
          case "delta":
            if (typeof parsed.text === "string") {
              collectedText += parsed.text;
              setText((t) => t + parsed.text);
              setEvents((p) => [...p, { kind: "delta", text: parsed.text }]);
            }
            break;
          case "error":
            setError(parsed.message ?? "Stream error");
            setEvents((p) => [...p, { kind: "error", ...parsed }]);
            break;
          case "done":
            setEvents((p) => [...p, { kind: "done", ...parsed }]);
            break;
        }
      } catch {
        // partial — ignore
      }
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const block = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          // Block contains: event: X\ndata: Y
          const lines = block.split("\n");
          let dataPayload = "";
          for (const line of lines) {
            if (line.startsWith("event:")) currentEvent = line.slice(6).trim();
            else if (line.startsWith("data:")) dataPayload += line.slice(5).trim();
          }
          flushEvent(dataPayload);
        }
      }
    } catch (e) {
      if ((e as { name?: string })?.name !== "AbortError") {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
    return collectedText;
  }, [reset]);

  return { start, cancel, reset, isStreaming, text, events, error };
}