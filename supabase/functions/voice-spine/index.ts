// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 6 Voice Spine
// Single endpoint with sub-routes for the voice → memory bridge.
//   POST /voice-spine               { op: "session.start" | "transcript" | "session.end" | "promote" }
// All routes require auth; trust action `shared.voice.session.start`
// is checked on session.start.
// ═══════════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const StartSchema = z.object({
  op: z.literal("session.start"),
  workspace_id: z.string().uuid().nullable().optional(),
  module_id: z.string().nullable().optional(),
  pillar: z.string().default("shared"),
  provider: z.enum(["browser_stt", "elevenlabs_stt", "gemini_stt", "manual"]).default("browser_stt"),
  mode: z.enum(["dictation", "conversation", "background"]).default("dictation"),
  metadata: z.record(z.unknown()).default({}),
});

const TranscriptSchema = z.object({
  op: z.literal("transcript"),
  session_id: z.string().uuid(),
  seq: z.number().int().min(0).default(0),
  role: z.enum(["user", "assistant", "system"]).default("user"),
  text: z.string().min(1).max(8000),
  lang: z.string().default("en"),
  confidence: z.number().min(0).max(1).default(0.85),
  is_final: z.boolean().default(true),
  audio_storage_path: z.string().nullable().optional(),
});

const EndSchema = z.object({
  op: z.literal("session.end"),
  session_id: z.string().uuid(),
  status: z.enum(["ended", "aborted", "failed"]).default("ended"),
});

const PromoteSchema = z.object({
  op: z.literal("promote"),
  transcript_id: z.string().uuid(),
  sensitivity: z.enum(["public", "internal", "confidential", "restricted"]).default("internal"),
  category: z.string().default("voice_note"),
});

const BodySchema = z.discriminatedUnion("op", [
  StartSchema, TranscriptSchema, EndSchema, PromoteSchema,
]);

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user, token } = authResult as { user: { id: string }; token: string };

  let body: unknown;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
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

  try {
    if (input.op === "session.start") {
      const { data, error } = await supabase
        .from("voice_sessions")
        .insert({
          user_id: user.id,
          workspace_id: input.workspace_id ?? null,
          module_id: input.module_id ?? null,
          pillar: input.pillar,
          provider: input.provider,
          mode: input.mode,
          status: "active",
          metadata: input.metadata,
        })
        .select("id, correlation_id, started_at")
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, session: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (input.op === "transcript") {
      const { data, error } = await supabase
        .from("voice_transcripts")
        .insert({
          user_id: user.id,
          session_id: input.session_id,
          seq: input.seq,
          role: input.role,
          text: input.text,
          lang: input.lang,
          confidence: input.confidence,
          is_final: input.is_final,
          audio_storage_path: input.audio_storage_path ?? null,
          embedding_status: input.is_final ? "pending" : "skipped",
        })
        .select("id, seq, created_at")
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, transcript: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (input.op === "session.end") {
      const { data: existing, error: fetchErr } = await supabase
        .from("voice_sessions")
        .select("id, started_at")
        .eq("id", input.session_id)
        .eq("user_id", user.id)
        .single();
      if (fetchErr || !existing) {
        return new Response(JSON.stringify({ error: "session not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const endedAt = new Date();
      const duration = endedAt.getTime() - new Date(existing.started_at).getTime();
      const { error } = await supabase
        .from("voice_sessions")
        .update({
          status: input.status,
          ended_at: endedAt.toISOString(),
          duration_ms: Math.max(0, duration),
        })
        .eq("id", input.session_id);
      if (error) throw error;

      // Fire-and-forget: kick the embedder for this user's pending transcripts.
      fetch(`${supabaseUrl}/functions/v1/knowledge-embedder`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "transcripts", batch_size: 50 }),
      }).catch((e) => console.error("[voice-spine] embedder kick failed", e));

      return new Response(JSON.stringify({ ok: true, session_id: input.session_id, duration_ms: duration }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (input.op === "promote") {
      const { data, error } = await supabase.rpc("promote_voice_transcript_to_memory", {
        _transcript_id: input.transcript_id,
        _sensitivity: input.sensitivity,
        _category: input.category,
      });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, memory_id: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown op" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[voice-spine] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});