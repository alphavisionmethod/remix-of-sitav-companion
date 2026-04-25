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

const ExtractIntentsSchema = z.object({
  op: z.literal("extract_intents"),
  session_id: z.string().uuid(),
  /** Optional cap on transcripts to scan (most recent first). */
  max_transcripts: z.number().int().min(1).max(50).default(10),
});

const ExecuteIntentSchema = z.object({
  op: z.literal("execute_intent"),
  intent_id: z.string().uuid(),
  status: z.enum(["approved", "rejected", "executed"]).default("approved"),
  rejected_reason: z.string().max(500).optional(),
});

const BodySchema = z.discriminatedUnion("op", [
  StartSchema, TranscriptSchema, EndSchema, PromoteSchema, ExtractIntentsSchema, ExecuteIntentSchema,
]);

// ── Allowed action keys for voice intent extraction (whitelist) ──
// We restrict the model to safe, reversible actions. The Trust engine
// remains the only path to actually execute these.
const VOICE_INTENT_ACTION_KEYS = [
  "crm.contact.create",
  "crm.deal.stage_change",
  "shared.note.create",
  "shared.task.create",
  "shared.calendar.event.create",
  "shared.knowledge.reindex",
] as const;

async function extractIntentsViaGateway(transcripts: Array<{ id: string; text: string; role: string }>): Promise<Array<{
  transcript_id: string;
  action_key: string;
  params: Record<string, unknown>;
  rationale: string;
  confidence: number;
}>> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return [];
  const userText = transcripts
    .filter((t) => t.role === "user")
    .map((t) => `[${t.id}] ${t.text}`)
    .join("\n");
  if (!userText.trim()) return [];

  const tools = [{
    type: "function",
    function: {
      name: "propose_intents",
      description: "Propose actionable intents extracted from voice transcripts. Only use whitelisted action_keys.",
      parameters: {
        type: "object",
        properties: {
          intents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                transcript_id: { type: "string", description: "UUID of the source transcript line" },
                action_key: { type: "string", enum: [...VOICE_INTENT_ACTION_KEYS] },
                params: { type: "object", description: "Plain JSON params for the action" },
                rationale: { type: "string", description: "One sentence on why this action follows from the transcript" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
              },
              required: ["transcript_id", "action_key", "rationale", "confidence"],
              additionalProperties: false,
            },
          },
        },
        required: ["intents"],
        additionalProperties: false,
      },
    },
  }];

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You extract concrete user intents from voice transcripts. Return at most 5 high-confidence intents (>=0.6). " +
            "Never invent transcript_ids — only use those provided. Use only the whitelisted action_keys. " +
            "If nothing concrete, return an empty intents array.",
        },
        { role: "user", content: `Transcripts:\n${userText}` },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "propose_intents" } },
    }),
  });
  if (!resp.ok) {
    console.warn("[voice-spine] intent extraction gateway non-ok", resp.status);
    return [];
  }
  const json = await resp.json();
  const call = json?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) return [];
  try {
    const parsed = JSON.parse(call.function.arguments) as { intents?: unknown[] };
    const intents = Array.isArray(parsed.intents) ? parsed.intents : [];
    const allowed = new Set<string>(VOICE_INTENT_ACTION_KEYS);
    const knownIds = new Set(transcripts.map((t) => t.id));
    return intents
      .filter((i): i is Record<string, unknown> => !!i && typeof i === "object")
      .filter((i) => allowed.has(String(i.action_key)) && knownIds.has(String(i.transcript_id)))
      .map((i) => ({
        transcript_id: String(i.transcript_id),
        action_key: String(i.action_key),
        params: (i.params && typeof i.params === "object") ? i.params as Record<string, unknown> : {},
        rationale: String(i.rationale ?? ""),
        confidence: Math.min(1, Math.max(0, Number(i.confidence ?? 0.5))),
      }))
      .filter((i) => i.confidence >= 0.6)
      .slice(0, 5);
  } catch (e) {
    console.warn("[voice-spine] failed to parse intent tool call", e);
    return [];
  }
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;
  const authHeader = req.headers.get("Authorization") ?? "";

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
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
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