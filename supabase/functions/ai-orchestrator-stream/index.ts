// ════════════════════════════════════════════════════════════════
// SITA OS — Phase 7 AI Orchestrator (Streaming variant)
// SSE companion to ai-orchestrator. Resolves the same Phase 5/6 context
// (workspace memories, knowledge chunks, semantic retrieval), then
// streams gateway tokens as they arrive while emitting structured
// `context`, `trace`, `delta`, and `done` SSE events.
//
// Wire format (one line per event, double-newline terminated):
//   event: context\n
//   data: { semanticMemories, semanticChunks, autoMemories, autoChunks }\n\n
//   event: delta\n
//   data: { text }\n\n
//   event: trace\n
//   data: { source_type, source_label, similarity? }\n\n
//   event: done\n
//   data: { invocationId, correlationId, model, traceCount }\n\n
// ════════════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, corsError, handleCors } from "../_shared/cors.ts";

interface StreamRequest {
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

const DEFAULT_MODEL = "google/gemini-3-flash-preview";

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return corsError("POST required", 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return corsError("AI gateway key missing", 500);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return corsError("Unauthorized", 401);

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user) return corsError("Invalid token", 401);
  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let body: StreamRequest;
  try { body = (await req.json()) as StreamRequest; }
  catch { return corsError("Invalid JSON", 400); }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return corsError("messages[] required", 400);
  }

  const correlationId = body.correlationId ?? crypto.randomUUID();
  const capabilityKey = body.capabilityKey ?? "general.stream";
  const startedAt = Date.now();
  const model = body.model ?? DEFAULT_MODEL;

  // ── Insert plan row up-front so we can attach the invocationId to events.
  const { data: planRow, error: planErr } = await service
    .from("ai_invocation_plans")
    .insert({
      correlation_id: correlationId,
      user_id: user.id,
      workspace_id: body.workspaceId ?? null,
      module_id: body.moduleId ?? null,
      mode: "chat",
      capability_key: capabilityKey,
      context_sources: { stream: true, semanticRetrieval: body.contextSources?.semanticRetrieval !== false },
      status: "executing",
      metadata: { phase: 7, stream: true, model },
    })
    .select("id")
    .single();
  if (planErr || !planRow) {
    console.error("[orch-stream] plan insert failed", planErr);
    return corsError("Failed to plan invocation", 500);
  }
  const planId: string = planRow.id;

  // ── SSE stream ────────────────────────────────────────────────
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(sseEvent(event, data)));

      const traceRows: Array<Record<string, unknown>> = [];

      try {
        // ── 1. Context resolution (semantic-first) ──
        const semanticOn = body.contextSources?.semanticRetrieval !== false;
        const semanticMemories: Array<{ memory_id: string; content: string; similarity: number }> = [];
        const semanticChunks: Array<{ chunk_id: string; content: string; similarity: number }> = [];
        const autoMemories: Array<{ memory_id: string; content: string }> = [];

        if (body.contextSources?.workspaceMemoryAuto) {
          const { data: mem } = await userClient.rpc("effective_workspace_memories", {
            _workspace_id: body.workspaceId ?? null,
            _max_n: body.contextSources.workspaceMemoryMax ?? 10,
          });
          if (Array.isArray(mem)) {
            for (const m of mem as Array<Record<string, unknown>>) {
              autoMemories.push({ memory_id: String(m.memory_id), content: String(m.content ?? "") });
              traceRows.push({
                source_type: "memory", source_id: String(m.memory_id),
                source_label: "Workspace memory (recency)",
                weight: 0.7, role: "context",
                metadata: { retrieval_kind: "recency" },
              });
            }
          }
        }

        if (semanticOn) {
          const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
          const queryText = (lastUser?.content ?? "").trim();
          if (queryText.length >= 4) {
            try {
              const embResp = await fetch(`${SUPABASE_URL}/functions/v1/knowledge-embedder`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: authHeader, apikey: SUPABASE_ANON_KEY },
                body: JSON.stringify({ scope: "query", query_text: queryText.slice(0, 4000) }),
              });
              if (embResp.ok) {
                const ej = await embResp.json();
                if (Array.isArray(ej?.embedding)) {
                  const vecLit = `[${(ej.embedding as number[]).join(",")}]`;
                  const minSim = body.contextSources?.minSimilarity ?? 0.55;

                  const { data: semMem } = await userClient.rpc("semantic_workspace_memories", {
                    _workspace_id: body.workspaceId ?? null,
                    _query_embedding: vecLit,
                    _max_n: body.contextSources?.semanticMemoryMax ?? 6,
                    _min_similarity: minSim,
                  });
                  if (Array.isArray(semMem)) {
                    for (const m of semMem as Array<Record<string, unknown>>) {
                      const sim = Number(m.similarity ?? 0);
                      semanticMemories.push({
                        memory_id: String(m.memory_id),
                        content: String(m.content ?? ""),
                        similarity: sim,
                      });
                      traceRows.push({
                        source_type: "memory", source_id: String(m.memory_id),
                        source_label: "Workspace memory (semantic)",
                        weight: sim, role: "context",
                        metadata: { retrieval_kind: "semantic", similarity: sim },
                      });
                    }
                  }

                  const { data: semChunks } = await userClient.rpc("semantic_knowledge_chunks", {
                    _workspace_id: body.workspaceId ?? null,
                    _query_embedding: vecLit,
                    _max_n: body.contextSources?.semanticChunkMax ?? 5,
                    _min_similarity: Math.max(0.45, minSim - 0.1),
                  });
                  if (Array.isArray(semChunks)) {
                    for (const c of semChunks as Array<Record<string, unknown>>) {
                      const sim = Number(c.similarity ?? 0);
                      semanticChunks.push({
                        chunk_id: String(c.chunk_id),
                        content: String(c.content ?? ""),
                        similarity: sim,
                      });
                      traceRows.push({
                        source_type: "knowledge_chunk", source_id: String(c.chunk_id),
                        source_label: "Knowledge chunk (semantic)",
                        weight: sim, role: "grounding",
                        metadata: { retrieval_kind: "semantic", similarity: sim },
                      });
                    }
                  }
                }
              }
            } catch (e) {
              console.warn("[orch-stream] embed failed", e);
            }
          }
        }

        // ── 2. Emit context event up-front so UI can paint immediately.
        send("context", {
          invocationId: planId,
          correlationId,
          semanticMemories: semanticMemories.length,
          semanticChunks: semanticChunks.length,
          autoMemories: autoMemories.length,
        });
        for (const t of traceRows) {
          send("trace", {
            source_type: t.source_type,
            source_label: t.source_label,
            similarity: (t.metadata as Record<string, unknown> | undefined)?.similarity ?? null,
            retrieval_kind: (t.metadata as Record<string, unknown> | undefined)?.retrieval_kind ?? "context",
          });
        }

        // ── 3. Build augmented messages with grounding context. ──
        const groundingBlocks: string[] = [];
        if (semanticMemories.length) {
          groundingBlocks.push(`# Semantic memories\n${semanticMemories.map((m, i) => `${i + 1}. [sim ${(m.similarity * 100).toFixed(0)}%] ${m.content}`).join("\n")}`);
        }
        if (semanticChunks.length) {
          groundingBlocks.push(`# Knowledge chunks\n${semanticChunks.map((c, i) => `${i + 1}. [sim ${(c.similarity * 100).toFixed(0)}%] ${c.content.slice(0, 600)}`).join("\n")}`);
        }
        if (autoMemories.length) {
          groundingBlocks.push(`# Recent workspace memories\n${autoMemories.map((m, i) => `${i + 1}. ${m.content}`).join("\n")}`);
        }
        const augmentedMessages = [...body.messages];
        if (groundingBlocks.length) {
          augmentedMessages.unshift({
            role: "system",
            content:
              "You have the following grounded context. Use it when relevant; cite naturally if it helps. " +
              "If context is irrelevant, ignore it.\n\n" + groundingBlocks.join("\n\n"),
          });
        }

        // ── 4. Call Lovable AI Gateway in streaming mode. ──
        const gwResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: augmentedMessages,
            stream: true,
            temperature: body.temperature ?? 0.7,
            ...(body.maxTokens ? { max_completion_tokens: body.maxTokens } : {}),
          }),
        });

        if (!gwResp.ok || !gwResp.body) {
          const txt = await gwResp.text().catch(() => "");
          const errMsg = gwResp.status === 429
            ? "Rate limit exceeded — please slow down."
            : gwResp.status === 402
            ? "AI credits exhausted. Add funds in workspace settings."
            : `Gateway error ${gwResp.status}: ${txt.slice(0, 200)}`;
          send("error", { message: errMsg, status: gwResp.status });
          await service.from("ai_invocation_plans").update({
            status: "failed",
            error_message: errMsg,
            completed_at: new Date().toISOString(),
            latency_ms: Date.now() - startedAt,
          }).eq("id", planId);
          send("done", { invocationId: planId, correlationId, model, traceCount: traceRows.length, failed: true });
          controller.close();
          return;
        }

        // ── 5. Pipe gateway SSE → our SSE, extracting tokens. ──
        const reader = gwResp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";
        let streamDone = false;

        while (!streamDone) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, nl);
            buffer = buffer.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") { streamDone = true; break; }
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed?.choices?.[0]?.delta?.content as string | undefined;
              if (delta) {
                fullText += delta;
                send("delta", { text: delta });
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        // ── 6. Persist traces + final plan update. ──
        if (traceRows.length > 0) {
          await service.from("ai_explainability_traces").insert(
            traceRows.map((t) => ({
              invocation_id: planId,
              user_id: user.id,
              source_type: t.source_type,
              source_id: t.source_id ?? null,
              source_label: t.source_label,
              weight: t.weight ?? 1,
              role: t.role ?? "context",
              metadata: t.metadata ?? {},
            })),
          );
        }

        const tokenEst = Math.ceil(fullText.length / 4);
        await service.from("ai_invocation_plans").update({
          status: "completed",
          completed_at: new Date().toISOString(),
          latency_ms: Date.now() - startedAt,
          model_choice: model,
          completion_tokens: tokenEst,
          total_tokens: tokenEst,
        }).eq("id", planId);

        send("done", {
          invocationId: planId,
          correlationId,
          model,
          traceCount: traceRows.length,
          totalChars: fullText.length,
        });
        controller.close();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[orch-stream] fatal", msg);
        send("error", { message: msg });
        try {
          await service.from("ai_invocation_plans").update({
            status: "failed",
            error_message: msg,
            completed_at: new Date().toISOString(),
            latency_ms: Date.now() - startedAt,
          }).eq("id", planId);
        } catch { /* ignore */ }
        send("done", { invocationId: planId, correlationId, model, failed: true });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
});