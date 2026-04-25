// ════════════════════════════════════════════════════════════════
// SITA OS — AI Orchestrator (Phase 4)
// Single entry point for every in-app AI call.
// Responsibilities:
//   1. Build an `ai_invocation_plan` row (correlation, workspace, module).
//   2. Resolve workspace + module + advisor + memory/file context.
//   3. Authority pre-check via Phase-2 engine (RPC: evaluate_action_authority).
//   4. Forward to `ai-gateway` with the resolved messages + capability.
//   5. Persist explainability traces (sources used).
//   6. Update the plan row with token/cost/latency telemetry.
//   7. Return shaped response by mode.
// All write paths use the service role; reads honour RLS via the user JWT.
// ════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { logSecurityEvent, getClientIP } from "../_shared/audit-logger.ts";

type Mode = "chat" | "simulation" | "action" | "voice" | "recap" | "tool";

interface OrchestratorRequest {
  mode?: Mode;
  capabilityKey?: string;
  workspaceId?: string | null;
  moduleId?: string | null;
  messages: Array<{ role: "system" | "user" | "assistant" | "tool"; content: string }>;
  promptFamilyId?: string;
  promptVars?: Record<string, unknown>;
  contextSources?: {
    memoryIds?: string[];
    fileIds?: string[];
    advisorIds?: string[];
    priorReceiptIds?: string[];
    workspaceIds?: string[];
    notes?: Array<{ label: string; excerpt?: string; weight?: number }>;
    /** Phase 5: when true, server fetches effective workspace memories via RPC and records usage. */
    workspaceMemoryAuto?: boolean;
    workspaceMemoryMax?: number;
    /** Phase 5: when set, server fetches up to N matching knowledge_chunks via full-text search. */
    chunkQuery?: string;
    chunkMax?: number;
    /** Phase 6: when true (default), server embeds last user message and runs semantic retrieval. */
    semanticRetrieval?: boolean;
    semanticMemoryMax?: number;
    semanticChunkMax?: number;
    minSimilarity?: number;
  };
  assumptions?: string[];
  confidenceTarget?: number;
  riskTier?: "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
  authorityActionKey?: string; // optional — when this AI call is going to drive a registered Trust action
  taskClass?: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

interface TraceRow {
  source_type:
    | "memory" | "file" | "advisor" | "policy" | "workspace" | "module"
    | "tool" | "prompt" | "prior_receipt" | "live_data" | "user_input" | "system"
    | "knowledge_chunk";
  source_id?: string | null;
  source_label: string;
  weight?: number;
  role?: "context" | "grounding" | "constraint" | "citation" | "tool_input" | "tool_output" | "signal";
  excerpt?: string | null;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    // ── Rate limiting ────────────────────────────────────────
    const clientIP = getClientIP(req);
    const rl = checkRateLimit(`ai-orch:${clientIP}`, 60, 60_000);
    if (!rl.allowed) {
      await logSecurityEvent({
        eventType: "rate_limit_hit",
        ipAddress: clientIP,
        functionName: "ai-orchestrator",
        severity: "warning",
      });
      return rateLimitResponse(rl, corsHeaders);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return corsError("Unauthorized", 401);

    const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const body = (await req.json()) as OrchestratorRequest;
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return corsError("messages[] required", 400);
    }

    const mode: Mode = body.mode ?? "chat";
    const capabilityKey = body.capabilityKey ?? "general";
    const correlationId = body.correlationId ?? crypto.randomUUID();
    const startedAt = Date.now();

    // ── 1. Insert plan (status=planning) ─────────────────────
    const ctxSourcesPayload = {
      memoryIds: body.contextSources?.memoryIds ?? [],
      fileIds: body.contextSources?.fileIds ?? [],
      advisorIds: body.contextSources?.advisorIds ?? [],
      priorReceiptIds: body.contextSources?.priorReceiptIds ?? [],
      workspaceIds: body.contextSources?.workspaceIds ?? [],
      notesCount: body.contextSources?.notes?.length ?? 0,
    };

    const { data: planRow, error: planErr } = await service
      .from("ai_invocation_plans")
      .insert({
        correlation_id: correlationId,
        user_id: user.id,
        workspace_id: body.workspaceId ?? null,
        module_id: body.moduleId ?? null,
        mode,
        capability_key: capabilityKey,
        context_sources: ctxSourcesPayload,
        assumptions: body.assumptions ?? [],
        confidence_target: body.confidenceTarget ?? null,
        status: "planning",
        metadata: body.metadata ?? {},
      })
      .select("id, correlation_id")
      .single();

    if (planErr || !planRow) {
      console.error("[ai-orchestrator] plan insert failed:", planErr);
      return corsError("Failed to create invocation plan", 500);
    }
    const planId: string = planRow.id;

    // ── 2. Authority pre-check (only when an action key is given) ─
    let authorityCheck: { decision: string; rationale: string; effective: string } = {
      decision: "n/a",
      rationale: "no authority action declared",
      effective: "n/a",
    };

    if (body.authorityActionKey) {
      const { data: rpcData, error: rpcErr } = await userClient.rpc(
        "evaluate_action_authority",
        { _action_key: body.authorityActionKey, _user_id: user.id },
      );
      if (rpcErr) {
        console.warn("[ai-orchestrator] authority RPC failed:", rpcErr);
      } else if (rpcData && typeof rpcData === "object") {
        const d = rpcData as Record<string, unknown>;
        const effective = String(d.effective_authority ?? d.effectiveAuthority ?? "ask");
        const isBlocked = effective === "blocked" || d.is_blocked === true;
        authorityCheck = {
          decision: isBlocked ? "blocked" : "allowed",
          rationale: String(d.rationale ?? ""),
          effective,
        };
        if (isBlocked) {
          await service.from("ai_invocation_plans")
            .update({
              status: "blocked",
              blocked_reason: authorityCheck.rationale,
              authority_check: authorityCheck,
              completed_at: new Date().toISOString(),
            })
            .eq("id", planId);

          return corsResponse({
            blocked: true,
            reason: authorityCheck.rationale,
            invocationId: planId,
            correlationId,
          }, 403);
        }
      }
    }

    // ── 3. Mark executing ────────────────────────────────────
    await service.from("ai_invocation_plans")
      .update({ status: "executing", authority_check: authorityCheck })
      .eq("id", planId);

    // ── 3b. Phase 5: auto-fetch workspace memories + chunks ──
    const autoMemoryRows: Array<{ memory_id: string; content: string; pillar: string; sensitivity: string; provenance_kind: string; confidence_band: string }> = [];
    const autoChunkRows: Array<{ id: string; file_id: string; chunk_index: number; content: string; pillar: string; sensitivity: string }> = [];
    const semanticMemoryRows: Array<{ memory_id: string; content: string; similarity: number; pillar: string; provenance_kind: string }> = [];
    const semanticChunkRows: Array<{ chunk_id: string; file_id: string; content: string; similarity: number; pillar: string }> = [];
    const seenMemoryIds = new Set<string>();
    const seenChunkIds = new Set<string>();

    if (body.contextSources?.workspaceMemoryAuto) {
      const { data: mem } = await userClient.rpc("effective_workspace_memories", {
        _workspace_id: body.workspaceId ?? null,
        _max_n: body.contextSources.workspaceMemoryMax ?? 15,
      });
      if (Array.isArray(mem)) {
        for (const m of mem as any[]) {
          autoMemoryRows.push({
            memory_id: m.memory_id, content: m.content ?? "", pillar: m.pillar,
            sensitivity: m.sensitivity, provenance_kind: m.provenance_kind, confidence_band: m.confidence_band,
          });
          seenMemoryIds.add(m.memory_id);
          await userClient.rpc("record_memory_usage", { _memory_id: m.memory_id }).catch(() => {});
        }
      }
    }
    if (body.contextSources?.chunkQuery) {
      const { data: chunks } = await userClient
        .from("knowledge_chunks")
        .select("id, file_id, chunk_index, content, pillar, sensitivity")
        .textSearch("content_search", body.contextSources.chunkQuery, { type: "websearch", config: "english" })
        .limit(body.contextSources.chunkMax ?? 8);
      if (Array.isArray(chunks)) {
        for (const c of chunks as any[]) { autoChunkRows.push(c); seenChunkIds.add(c.id); }
      }
    }

    // ── 3c. Phase 6: semantic retrieval (default on) ─────────
    const semanticOn = body.contextSources?.semanticRetrieval !== false;
    let queryEmbedding: number[] | null = null;
    if (semanticOn) {
      const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
      const queryText = (lastUser?.content ?? "").trim();
      if (queryText.length >= 4) {
        try {
          const embResp = await fetch(`${SUPABASE_URL}/functions/v1/knowledge-embedder`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: authHeader ?? "", apikey: SUPABASE_ANON_KEY },
            body: JSON.stringify({ scope: "query", query_text: queryText.slice(0, 4000) }),
          });
          if (embResp.ok) {
            const ej = await embResp.json();
            if (Array.isArray(ej?.embedding)) queryEmbedding = ej.embedding as number[];
          } else {
            console.warn("[ai-orchestrator] query embed failed", embResp.status);
          }
        } catch (e) {
          console.warn("[ai-orchestrator] query embed exception", e);
        }
      }

      if (queryEmbedding) {
        const minSim = body.contextSources?.minSimilarity ?? 0.55;
        const memMax = body.contextSources?.semanticMemoryMax ?? 8;
        const chMax = body.contextSources?.semanticChunkMax ?? 6;
        const vecLit = `[${queryEmbedding.join(",")}]`;

        const { data: semMem, error: semMemErr } = await userClient.rpc("semantic_workspace_memories", {
          _workspace_id: body.workspaceId ?? null,
          _query_embedding: vecLit,
          _max_n: memMax,
          _min_similarity: minSim,
        });
        if (semMemErr) console.warn("[ai-orchestrator] semantic mem RPC failed", semMemErr);
        if (Array.isArray(semMem)) {
          for (const m of semMem as any[]) {
            if (seenMemoryIds.has(m.memory_id)) continue;
            seenMemoryIds.add(m.memory_id);
            semanticMemoryRows.push({
              memory_id: m.memory_id, content: m.content ?? "",
              similarity: Number(m.similarity ?? 0), pillar: m.pillar, provenance_kind: m.provenance_kind,
            });
            await userClient.rpc("record_memory_usage", { _memory_id: m.memory_id }).catch(() => {});
          }
        }

        const { data: semChunks, error: semChErr } = await userClient.rpc("semantic_knowledge_chunks", {
          _workspace_id: body.workspaceId ?? null,
          _query_embedding: vecLit,
          _max_n: chMax,
          _min_similarity: Math.max(0.45, minSim - 0.1),
        });
        if (semChErr) console.warn("[ai-orchestrator] semantic chunk RPC failed", semChErr);
        if (Array.isArray(semChunks)) {
          for (const c of semChunks as any[]) {
            if (seenChunkIds.has(c.chunk_id)) continue;
            seenChunkIds.add(c.chunk_id);
            semanticChunkRows.push({
              chunk_id: c.chunk_id, file_id: c.file_id, content: c.content ?? "",
              similarity: Number(c.similarity ?? 0), pillar: c.pillar,
            });
          }
        }
      }
    }

    // ── 4. Forward to ai-gateway (preserving auth) ───────────
    const gatewayResp = await fetch(`${SUPABASE_URL}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader ?? "",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        capabilityId: capabilityKey,
        taskClass: body.taskClass ?? "balanced_assistant",
        messages: body.messages,
        promptFamilyId: body.promptFamilyId,
        promptVars: body.promptVars,
        riskTier: body.riskTier ?? "R1",
        maxTokens: body.maxTokens,
        temperature: body.temperature,
        stream: false,
      }),
    });

    const gatewayJson: Record<string, unknown> = await gatewayResp.json().catch(() => ({}));

    if (!gatewayResp.ok) {
      await service.from("ai_invocation_plans")
        .update({
          status: "failed",
          error_code: String(gatewayResp.status),
          error_message: typeof gatewayJson.message === "string"
            ? gatewayJson.message
            : "ai-gateway error",
          completed_at: new Date().toISOString(),
          latency_ms: Date.now() - startedAt,
        })
        .eq("id", planId);

      return corsResponse({
        invocationId: planId,
        correlationId,
        error: gatewayJson,
      }, gatewayResp.status);
    }

    // ── 5. Build explainability traces ───────────────────────
    const traces: TraceRow[] = [];

    if (body.contextSources?.memoryIds?.length) {
      for (const id of body.contextSources.memoryIds) {
        traces.push({
          source_type: "memory",
          source_id: id,
          source_label: `Memory ${id.slice(0, 8)}`,
          role: "context",
        });
      }
    }
    if (body.contextSources?.fileIds?.length) {
      for (const id of body.contextSources.fileIds) {
        traces.push({
          source_type: "file",
          source_id: id,
          source_label: `File ${id.slice(0, 8)}`,
          role: "grounding",
        });
      }
    }
    if (body.contextSources?.advisorIds?.length) {
      for (const id of body.contextSources.advisorIds) {
        traces.push({
          source_type: "advisor",
          source_id: id,
          source_label: `Advisor ${id}`,
          role: "context",
        });
      }
    }
    if (body.contextSources?.priorReceiptIds?.length) {
      for (const id of body.contextSources.priorReceiptIds) {
        traces.push({
          source_type: "prior_receipt",
          source_id: id,
          source_label: `Receipt ${id.slice(0, 8)}`,
          role: "citation",
        });
      }
    }
    if (body.contextSources?.notes?.length) {
      for (const note of body.contextSources.notes) {
        traces.push({
          source_type: "live_data",
          source_label: note.label,
          excerpt: note.excerpt ?? null,
          weight: note.weight ?? 1,
          role: "context",
        });
      }
    }
    if (body.promptFamilyId) {
      traces.push({
        source_type: "prompt",
        source_id: body.promptFamilyId,
        source_label: `Prompt family ${body.promptFamilyId}`,
        role: "constraint",
      });
    }
    for (const m of autoMemoryRows) {
      traces.push({
        source_type: "memory",
        source_id: m.memory_id,
        source_label: `Memory ${m.provenance_kind}/${m.confidence_band}`,
        excerpt: m.content.slice(0, 240),
        role: "context",
        metadata: { retrieval_kind: "recency" },
      });
    }
    for (const c of autoChunkRows) {
      traces.push({
        source_type: "knowledge_chunk",
        source_id: c.id,
        source_label: `Chunk ${c.file_id.slice(0, 8)}#${c.chunk_index}`,
        excerpt: c.content.slice(0, 240),
        role: "grounding",
        metadata: { retrieval_kind: "fulltext" },
      });
    }
    for (const m of semanticMemoryRows) {
      traces.push({
        source_type: "memory",
        source_id: m.memory_id,
        source_label: `Memory ${m.provenance_kind} (sem ${(m.similarity * 100).toFixed(0)}%)`,
        excerpt: m.content.slice(0, 240),
        role: "context",
        weight: Number(m.similarity.toFixed(3)),
        metadata: { retrieval_kind: "semantic", similarity: Number(m.similarity.toFixed(4)) },
      });
    }
    for (const c of semanticChunkRows) {
      traces.push({
        source_type: "knowledge_chunk",
        source_id: c.chunk_id,
        source_label: `Chunk ${c.file_id.slice(0, 8)} (sem ${(c.similarity * 100).toFixed(0)}%)`,
        excerpt: c.content.slice(0, 240),
        role: "grounding",
        weight: Number(c.similarity.toFixed(3)),
        metadata: { retrieval_kind: "semantic", similarity: Number(c.similarity.toFixed(4)) },
      });
    }
    if (body.workspaceId) {
      traces.push({
        source_type: "workspace",
        source_id: body.workspaceId,
        source_label: "Active workspace",
        role: "context",
      });
    }
    if (body.moduleId) {
      traces.push({
        source_type: "module",
        source_id: body.moduleId,
        source_label: `Module ${body.moduleId}`,
        role: "context",
      });
    }
    traces.push({
      source_type: "system",
      source_label: "ai-orchestrator",
      role: "context",
      metadata: { mode, capabilityKey },
    });

    if (traces.length > 0) {
      const traceRows = traces.map((t) => ({
        invocation_id: planId,
        user_id: user.id,
        source_type: t.source_type,
        source_id: t.source_id ?? null,
        source_label: t.source_label,
        weight: t.weight ?? 1,
        role: t.role ?? "context",
        excerpt: t.excerpt ?? null,
        metadata: t.metadata ?? {},
      }));
      const { error: traceErr } = await service
        .from("ai_explainability_traces")
        .insert(traceRows);
      if (traceErr) {
        console.warn("[ai-orchestrator] trace insert failed:", traceErr);
      }
    }

    // ── 6. Telemetry from gateway response (best-effort) ─────
    const usage = (gatewayJson.usage ?? {}) as Record<string, unknown>;
    const promptTokens = Number(usage.prompt_tokens ?? 0) || null;
    const completionTokens = Number(usage.completion_tokens ?? 0) || null;
    const totalTokens = Number(usage.total_tokens ?? 0) || null;
    const estCost = Number(gatewayJson.estimatedCostUsd ?? 0) || null;
    const inferenceReceiptId = typeof gatewayJson.inferenceReceiptId === "string"
      ? gatewayJson.inferenceReceiptId : null;
    const modelChoice = typeof gatewayJson.model === "string" ? gatewayJson.model : null;

    await service.from("ai_invocation_plans")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        latency_ms: Date.now() - startedAt,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        estimated_cost_usd: estCost,
        inference_receipt_id: inferenceReceiptId,
        model_choice: modelChoice,
      })
      .eq("id", planId);

    // ── 7. Return shaped response ───────────────────────────
    return corsResponse({
      invocationId: planId,
      correlationId,
      mode,
      capabilityKey,
      result: gatewayJson,
      traceCount: traces.length,
      authority: authorityCheck,
    }, 200);
  } catch (err) {
    console.error("[ai-orchestrator] error:", err);
    return corsError(err instanceof Error ? err.message : "Internal error", 500);
  }
});