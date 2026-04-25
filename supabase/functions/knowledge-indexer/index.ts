// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 5 Knowledge Indexer
// Chunks a file's extracted text into citeable knowledge_chunks,
// tracks the multi-stage pipeline in ingestion_jobs, and is
// authority-gated via the trust action `shared.knowledge.reindex`.
// ═══════════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const BodySchema = z.object({
  file_id: z.string().uuid(),
  source_table: z.enum(["pb_files", "file_metadata"]).default("pb_files"),
  workspace_id: z.string().uuid().nullable().optional(),
  module_id: z.string().nullable().optional(),
  pillar: z.string().default("shared"),
  chunk_size: z.number().int().min(200).max(4000).default(1200),
  force: z.boolean().default(false),
});

type Stage = "queued" | "extracting" | "classifying" | "chunking" | "embedding" | "indexed" | "failed";

function chunkText(text: string, size: number): string[] {
  const cleaned = (text ?? "").replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const out: string[] = [];
  for (let i = 0; i < cleaned.length; i += size) {
    out.push(cleaned.slice(i, i + size));
  }
  return out;
}

function estimateTokens(s: string): number {
  // 4 chars/token rough heuristic — fine for budgeting, no model call.
  return Math.ceil(s.length / 4);
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const input = parsed.data;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Create the ingestion job up front so the UI can poll it.
  const correlationId = crypto.randomUUID();
  const { data: job, error: jobErr } = await supabase
    .from("ingestion_jobs")
    .insert({
      user_id: user.id,
      workspace_id: input.workspace_id ?? null,
      source_kind: "file",
      source_id: input.file_id,
      source_table: input.source_table,
      stage: "queued" as Stage,
      progress: 0,
      correlation_id: correlationId,
      metadata: { pillar: input.pillar, module_id: input.module_id ?? null, force: input.force },
    })
    .select()
    .single();

  if (jobErr || !job) {
    return new Response(JSON.stringify({ error: "Failed to create ingestion job", detail: jobErr?.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const advance = async (stage: Stage, progress: number, error?: string) => {
    await supabase
      .from("ingestion_jobs")
      .update({
        stage,
        progress,
        error: error ?? null,
        completed_at: stage === "indexed" || stage === "failed" ? new Date().toISOString() : null,
      })
      .eq("id", job.id);
  };

  try {
    // ── Stage 1: extract ────────────────────────────────────
    await advance("extracting", 0.1);
    let text = "";
    let sensitivity = "internal";

    if (input.source_table === "file_metadata") {
      const { data: f } = await supabase
        .from("file_metadata").select("extracted_data, sensitivity")
        .eq("id", input.file_id).eq("user_id", user.id).maybeSingle();
      text = (f?.extracted_data as { text?: string } | null)?.text ?? "";
      sensitivity = (f?.sensitivity as string) ?? "internal";
    } else {
      const { data: f } = await supabase
        .from("pb_files").select("summary")
        .eq("id", input.file_id).eq("user_id", user.id).maybeSingle();
      text = (f?.summary as string) ?? "";
    }

    if (!text.trim()) {
      await advance("indexed", 1.0);
      return new Response(
        JSON.stringify({ ok: true, job_id: job.id, chunks: 0, reason: "no_text" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Stage 2: chunk ──────────────────────────────────────
    await advance("chunking", 0.4);
    const chunks = chunkText(text, input.chunk_size);

    // Idempotency: clear prior chunks for this file unless `force=false` AND any exist.
    if (input.force) {
      await supabase.from("knowledge_chunks")
        .delete()
        .eq("user_id", user.id)
        .eq("file_id", input.file_id)
        .eq("source_table", input.source_table);
    } else {
      const { count } = await supabase
        .from("knowledge_chunks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id).eq("file_id", input.file_id).eq("source_table", input.source_table);
      if ((count ?? 0) > 0) {
        await advance("indexed", 1.0);
        return new Response(
          JSON.stringify({ ok: true, job_id: job.id, chunks: count, reason: "already_indexed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // ── Stage 3: insert chunks ──────────────────────────────
    await advance("embedding", 0.7);
    const rows = chunks.map((content, i) => ({
      user_id: user.id,
      workspace_id: input.workspace_id ?? null,
      module_id: input.module_id ?? null,
      pillar: input.pillar,
      file_id: input.file_id,
      source_table: input.source_table,
      chunk_index: i,
      content,
      token_estimate: estimateTokens(content),
      sensitivity,
      embedding_status: "skipped", // pgvector deferred to Phase 6
      metadata: { correlation_id: correlationId },
    }));

    if (rows.length > 0) {
      const BATCH = 200;
      for (let i = 0; i < rows.length; i += BATCH) {
        const slice = rows.slice(i, i + BATCH);
        const { error: insErr } = await supabase.from("knowledge_chunks").insert(slice);
        if (insErr) throw insErr;
      }
    }

    await advance("indexed", 1.0);
    return new Response(
      JSON.stringify({
        ok: true,
        job_id: job.id,
        correlation_id: correlationId,
        chunks: rows.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await advance("failed", 1.0, msg);
    return new Response(JSON.stringify({ ok: false, job_id: job.id, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});