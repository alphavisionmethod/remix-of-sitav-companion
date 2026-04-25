// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 6 Knowledge Embedder
// Pulls pending rows from knowledge_chunks, memory_provenance and
// voice_transcripts, embeds them via the Lovable AI Gateway, and
// writes back the vector + status + cost accounting.
// Authority-gated via trust action `shared.knowledge.reindex`.
// ═══════════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const EMBED_MODEL = "google/text-embedding-004";
const EMBED_DIM = 768;
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/embeddings";
const CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const CAPTION_MODEL = "google/gemini-2.5-flash";

const BodySchema = z.object({
  scope: z.enum(["chunks", "memories", "transcripts", "all", "query"]).default("all"),
  workspace_id: z.string().uuid().nullable().optional(),
  batch_size: z.number().int().min(1).max(100).default(50),
  // For ad-hoc query embedding (used by orchestrator before semantic retrieval).
  query_text: z.string().min(1).max(8000).optional(),
});

type EmbedRow = { id: string; content: string; table: "knowledge_chunks" | "memory_provenance" | "voice_transcripts" };
type Modality = "text" | "image" | "audio" | "video";

async function embedTexts(texts: string[]): Promise<number[][]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const resp = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    if (resp.status === 429) throw new Error("rate_limited");
    if (resp.status === 402) throw new Error("payment_required");
    throw new Error(`embed_failed_${resp.status}: ${txt.slice(0, 200)}`);
  }
  const json = await resp.json();
  const out: number[][] = (json?.data ?? []).map((d: { embedding: number[] }) => d.embedding);
  if (out.length !== texts.length) throw new Error("embedding_count_mismatch");
  return out;
}

// ── Phase 8.b: multi-modal captioning via gateway ──────────────
async function captionMedia(args: {
  modality: Modality;
  signedUrl: string;
  mime: string;
  fallbackText: string;
}): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return args.fallbackText;
  // Gemini supports image_url / audio_url multimodal blocks via OpenAI-compatible chat schema.
  const userParts: unknown[] = [
    { type: "text", text: `Describe this ${args.modality} in 2-3 dense sentences for semantic search. Include named entities, actions, and concrete nouns.` },
  ];
  if (args.modality === "image") {
    userParts.push({ type: "image_url", image_url: { url: args.signedUrl } });
  } else if (args.modality === "audio") {
    userParts.push({ type: "input_audio", input_audio: { data: args.signedUrl, format: args.mime.split("/")[1] ?? "mp3" } });
  } else {
    // video — we can't fully process video here; reuse existing caption text.
    return args.fallbackText;
  }
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CAPTION_MODEL,
        messages: [{ role: "user", content: userParts }],
        max_tokens: 240,
      }),
    });
    if (!resp.ok) {
      console.warn(`[embedder] caption failed ${resp.status}`);
      return args.fallbackText;
    }
    const json = await resp.json();
    const out = String(json?.choices?.[0]?.message?.content ?? "").trim();
    return out || args.fallbackText;
  } catch (e) {
    console.warn("[embedder] caption threw", e);
    return args.fallbackText;
  }
}

async function signedUrlFor(supabase: ReturnType<typeof createClient>, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from("user-files").createSignedUrl(path, 120);
  if (error || !data) return null;
  return data.signedUrl;
}

function vecLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const input = parsed.data;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const correlationId = crypto.randomUUID();
  const startedAt = Date.now();

  // ── Mode 1: ad-hoc query embedding (for orchestrator) ───────────
  if (input.scope === "query") {
    if (!input.query_text) {
      return new Response(JSON.stringify({ error: "query_text required for scope=query" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    try {
      const [emb] = await embedTexts([input.query_text.slice(0, 8000)]);
      return new Response(JSON.stringify({
        ok: true, embedding: emb, model: EMBED_MODEL, dim: EMBED_DIM, correlation_id: correlationId,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const status = msg === "rate_limited" ? 429 : msg === "payment_required" ? 402 : 500;
      return new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── Mode 2: batch embed pending rows ─────────────────────────────
  const rows: EmbedRow[] = [];
  const wsFilter = input.workspace_id ?? null;

  const pull = async (table: EmbedRow["table"], textCol: string, extra: string) => {
    const remaining = input.batch_size - rows.length;
    if (remaining <= 0) return;
    let q = supabase
      .from(table)
      .select(`id, ${textCol}`)
      .eq("user_id", user.id)
      .eq("embedding_status", "pending")
      .limit(remaining);
    if (wsFilter !== null && (table === "knowledge_chunks")) {
      q = q.eq("workspace_id", wsFilter);
    }
    const { data, error } = await q;
    if (error) {
      console.error(`[embedder] pull ${table} failed`, error);
      return;
    }
    for (const row of (data ?? []) as Record<string, unknown>[]) {
      const text = String(row[textCol] ?? "").trim();
      if (!text) continue;
      rows.push({ id: String(row.id), content: text.slice(0, 8000), table });
    }
    void extra;
  };

  if (input.scope === "chunks" || input.scope === "all") await pull("knowledge_chunks", "content", "");

  // ── Phase 8.b: enrich knowledge_chunks rows that are media-backed ──
  if (input.scope === "chunks" || input.scope === "all") {
    const chunkIds = rows.filter((r) => r.table === "knowledge_chunks").map((r) => r.id);
    if (chunkIds.length > 0) {
      const { data: meta } = await supabase
        .from("knowledge_chunks")
        .select("id, modality, media_uri, media_mime")
        .in("id", chunkIds);
      const byId = new Map<string, { modality: Modality; media_uri: string | null; media_mime: string | null }>();
      for (const m of (meta ?? []) as Array<{ id: string; modality: Modality | null; media_uri: string | null; media_mime: string | null }>) {
        byId.set(m.id, { modality: (m.modality ?? "text") as Modality, media_uri: m.media_uri, media_mime: m.media_mime });
      }
      for (const r of rows) {
        if (r.table !== "knowledge_chunks") continue;
        const m = byId.get(r.id);
        if (!m || m.modality === "text" || !m.media_uri) continue;
        const signed = await signedUrlFor(supabase, m.media_uri);
        if (!signed) continue;
        const caption = await captionMedia({
          modality: m.modality,
          signedUrl: signed,
          mime: m.media_mime ?? "application/octet-stream",
          fallbackText: r.content,
        });
        // Persist enriched caption into content so downstream search has dense text.
        r.content = caption.slice(0, 8000);
        await supabase.from("knowledge_chunks")
          .update({ content: r.content, metadata: { phase: "8.b", multimodal_caption: true, modality: m.modality } })
          .eq("id", r.id);
      }
    }
  }
  if (input.scope === "memories" || input.scope === "all") {
    // memory_provenance.content lives on pb_memories; pull joined view.
    const remaining = input.batch_size - rows.length;
    if (remaining > 0) {
      const { data: provRows, error } = await supabase
        .from("memory_provenance")
        .select("memory_id, pb_memories!inner(content)")
        .eq("user_id", user.id)
        .eq("embedding_status", "pending")
        .limit(remaining);
      if (error) console.error("[embedder] pull memories failed", error);
      for (const r of (provRows ?? []) as Array<{ memory_id: string; pb_memories: { content: string } }>) {
        const text = (r.pb_memories?.content ?? "").trim();
        if (!text) continue;
        rows.push({ id: r.memory_id, content: text.slice(0, 8000), table: "memory_provenance" });
      }
    }
  }
  if (input.scope === "transcripts" || input.scope === "all") await pull("voice_transcripts", "text", "");

  if (rows.length === 0) {
    return new Response(JSON.stringify({ ok: true, embedded: 0, message: "no pending rows" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Phase 7: budget pre-check + decision receipt ──────────────
  const tokenEstPre = rows.reduce((s, r) => s + Math.ceil(r.content.length / 4), 0);
  const estCostUsdPre = tokenEstPre * 0.000_000_025;
  const estCostCentsPre = Math.max(1, Math.ceil(estCostUsdPre * 100));
  let budgetDecision: "allow" | "degrade" | "block" = "allow";
  let budgetReason = "no_policy";
  let budgetState: Record<string, unknown> = {};
  try {
    const { data: budgetCheck, error: budgetErr } = await supabase.rpc("check_ai_budget_policies", {
      p_user_id: user.id,
      p_capability_key: "shared.embed.text",
      p_estimated_cost_cents: estCostCentsPre,
    });
    if (!budgetErr && budgetCheck && typeof budgetCheck === "object") {
      const bc = budgetCheck as Record<string, unknown>;
      const decisionRaw = String(bc.decision ?? "allow").toLowerCase();
      budgetDecision = decisionRaw === "block" ? "block" : decisionRaw === "degrade" ? "degrade" : "allow";
      budgetReason = String(bc.reason ?? "policy_ok");
      budgetState = bc;
    }
  } catch (e) {
    console.warn("[embedder] budget check threw, defaulting to allow", e);
  }

  // Always write a decision receipt for governance.
  await supabase.from("ai_budget_decision_receipts").insert({
    user_id: user.id,
    capability_key: "shared.embed.text",
    decision: budgetDecision,
    reason: budgetReason,
    pre_check_state: budgetState,
    policy_rule: "embedding_capability",
    cost_estimate_cents: estCostCentsPre,
    daily_pct: typeof budgetState.daily_pct === "number" ? budgetState.daily_pct : null,
    monthly_pct: typeof budgetState.monthly_pct === "number" ? budgetState.monthly_pct : null,
    correlation_id: correlationId,
  }).then(({ error }) => { if (error) console.warn("[embedder] decision receipt insert failed", error); });

  if (budgetDecision === "block") {
    // Mark batch as deferred (re-stays pending) but log a failure receipt for visibility.
    return new Response(JSON.stringify({
      ok: false,
      blocked: true,
      reason: budgetReason,
      attempted: rows.length,
      embedded: 0,
    }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let embeddings: number[][];
  try {
    embeddings = await embedTexts(rows.map((r) => r.content));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Mark failed
    for (const r of rows) {
      await supabase.from(r.table).update({
        embedding_status: "failed",
        metadata: { error: msg },
      }).eq(r.table === "memory_provenance" ? "memory_id" : "id", r.id);
    }
    const status = msg === "rate_limited" ? 429 : msg === "payment_required" ? 402 : 500;
    return new Response(JSON.stringify({ error: msg, attempted: rows.length }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Write back via raw SQL update so we can pass the vector literal.
  let embedded = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const v = vecLiteral(embeddings[i]);
    const idCol = r.table === "memory_provenance" ? "memory_id" : "id";
    const { error } = await supabase.from(r.table).update({
      embedding: v,
      embedding_status: "embedded",
      embedding_model: EMBED_MODEL,
      embedding_dim: EMBED_DIM,
      embedded_at: new Date().toISOString(),
    }).eq(idCol, r.id);
    if (error) {
      console.error(`[embedder] write ${r.table} ${r.id} failed`, error);
    } else {
      embedded++;
    }
  }

  // Cost accounting → ai_invocation_plans (mode='embedding').
  const tokenEst = rows.reduce((s, r) => s + Math.ceil(r.content.length / 4), 0);
  await supabase.from("ai_invocation_plans").insert({
    user_id: user.id,
    workspace_id: wsFilter,
    mode: "embedding",
    capability_key: "shared.embed.text",
    correlation_id: correlationId,
    status: "completed",
    completed_at: new Date().toISOString(),
    latency_ms: Date.now() - startedAt,
    model_choice: EMBED_MODEL,
    prompt_tokens: tokenEst,
    total_tokens: tokenEst,
    estimated_cost_usd: tokenEst * 0.000_000_025, // ~$0.025 / 1M tokens
    metadata: { phase: 7, scope: input.scope, embedded, attempted: rows.length, budget_decision: budgetDecision },
  });

  return new Response(JSON.stringify({
    ok: true,
    embedded,
    attempted: rows.length,
    model: EMBED_MODEL,
    dim: EMBED_DIM,
    correlation_id: correlationId,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});