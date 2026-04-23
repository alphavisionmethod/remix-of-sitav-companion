// ═══════════════════════════════════════════════════════════════
// Personal Brain — Adaptive Intelligence Layer (Phase 0+ router)
// ═══════════════════════════════════════════════════════════════
// Single edge function exposing multiple actions:
//   infer (default — backwards-compatible chat with 9 modes)
//   memory.save / memory.list / memory.toggle / memory.delete
//   learn.scan          (background pattern inference)
//   file.ingest         (summarize an uploaded file)
//   voice.transcribe    (cloud STT — currently returns use_browser_stt flag)
//   data.export         (full pb_* export for the calling user)
//
// Backwards compatibility:
//   - A request body without `action` is treated as `infer` (legacy chat).
//   - The legacy { messages, mode } shape continues to work and stream SSE.
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import {
  zodValidate,
  PersonalBrainSchema,
  PBRouterSchema,
  PBMemorySaveSchema,
  PBMemoryToggleSchema,
  PBMemoryDeleteSchema,
  PBLearnScanSchema,
  PBFileIngestSchema,
  PBVoiceTranscribeSchema,
} from "../_shared/zod-validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { logAIReceipt } from "../_shared/ai-receipt-logger.ts";
import { checkAIBudget } from "../_shared/ai-budget-check.ts";

// ── 9 canonical mode prompts ─────────────────────────────────
const MODE_PROMPTS: Record<string, string> = {
  think:      `You are SITA Brain — Think Mode. A reflective thinking partner. Use Socratic questioning, surface counterarguments, help the user reason from multiple angles.`,
  learn:      `You are SITA Brain — Learn Mode. A patient expert tutor. Break complex topics into digestible steps, quiz the user when useful, track progress, celebrate wins.`,
  build:      `You are SITA Brain — Build Mode. A pragmatic startup advisor and product strategist. Validate ideas, plan MVPs, draft concrete next actions.`,
  create:     `You are SITA Brain — Create Mode. A creative collaborator. Help write, design, compose, invent. Offer templates, examples, and alternatives.`,
  research:   `You are SITA Brain — Research Mode. A meticulous investigator. Synthesize sources, surface unknowns, suggest what to verify, cite when possible.`,
  strategize: `You are SITA Brain — Strategize Mode. An executive strategist. Frame trade-offs, assess second-order effects, propose decisions with rationale.`,
  coach:      `You are SITA Brain — Coach Mode. A supportive performance coach. Ask powerful questions, hold the user accountable, focus on growth and clarity.`,
  reflect:    `You are SITA Brain — Reflect Mode. A reflective journal partner. Help the user process events, surface patterns and emotions, suggest one insight.`,
  decide:     `You are SITA Brain — Decide Mode. A decision architect. Lay out options, criteria, weights, and recommend a clear next step with rationale.`,
};

const DEFAULT_MODEL = "google/gemini-3-flash-preview";

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

async function getSecurityPrefs(admin: ReturnType<typeof createClient>, userId: string) {
  const { data } = await admin
    .from("pb_security_prefs")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? {
    sensitive_mode: false,
    autolearn_enabled: true,
    autolearn_threshold: 0.7,
    learn_from_chats: true,
    learn_from_files: true,
    voice_transcript_retention: "session",
  };
}

async function logSecurityEvent(
  admin: ReturnType<typeof createClient>,
  userId: string,
  event_type: string,
  detail: Record<string, unknown> = {},
  severity: "info" | "warning" | "critical" = "info",
) {
  try {
    await admin.from("pb_security_events").insert({ user_id: userId, event_type, severity, detail });
  } catch (e) {
    console.error("pb_security_events insert error:", e);
  }
}

async function buildBrainContext(
  userClient: ReturnType<typeof createClient>,
  admin: ReturnType<typeof createClient>,
  userId: string,
  mode: string,
): Promise<string> {
  let prompt = MODE_PROMPTS[mode] || MODE_PROMPTS.think;

  const [profileRes, memoriesRes, goalsRes, advisorFactsRes] = await Promise.all([
    admin.from("pb_profile").select("*").eq("user_id", userId).maybeSingle(),
    admin.from("pb_memories").select("category,content,confidence,kind")
      .eq("user_id", userId).eq("status", "active")
      .order("confidence", { ascending: false }).limit(40),
    admin.from("pb_goals").select("kind,title,horizon_days,progress_pct")
      .eq("user_id", userId).eq("status", "active").limit(10),
    userClient.from("advisor_memories").select("advisor_id,content")
      .eq("user_id", userId).eq("memory_type", "fact")
      .order("created_at", { ascending: false }).limit(15),
  ]);

  const profile = profileRes.data as Record<string, unknown> | null;
  if (profile) {
    prompt += `\n\n## About this user\n`;
    if (profile.display_name) prompt += `- Name: ${profile.display_name}\n`;
    if (profile.role) prompt += `- Role: ${profile.role}\n`;
    if (profile.life_context) prompt += `- Context: ${profile.life_context}\n`;
    prompt += `- Tone preference: ${profile.tone}\n`;
    prompt += `- Depth preference: ${profile.depth}\n`;
    prompt += `- Coaching style: ${profile.coaching_style}\n`;
    prompt += `- Personalization depth: ${profile.personalization_depth}\n`;
  }

  const goals = goalsRes.data ?? [];
  if (goals.length) {
    prompt += `\n\n## Active goals & projects\n`;
    for (const g of goals as Array<Record<string, unknown>>) {
      prompt += `- (${g.kind}) ${g.title} — ${g.progress_pct}% progress, ${g.horizon_days}-day horizon\n`;
    }
  }

  const memories = memoriesRes.data ?? [];
  if (memories.length) {
    prompt += `\n\n## What the Brain has learned about this user\n`;
    for (const m of memories as Array<Record<string, unknown>>) {
      const tag = m.kind === "inferred" ? `inferred · ${(Number(m.confidence) * 100) | 0}%` : "saved";
      prompt += `- [${m.category} · ${tag}] ${m.content}\n`;
    }
  }

  const advisorFacts = advisorFactsRes.data ?? [];
  if (advisorFacts.length) {
    prompt += `\n\n## Cross-advisor facts\n`;
    for (const f of advisorFacts as Array<Record<string, unknown>>) {
      prompt += `- [${f.advisor_id}] ${f.content}\n`;
    }
  }

  return prompt;
}

async function actionInfer(
  user: { id: string },
  userClient: ReturnType<typeof createClient>,
  admin: ReturnType<typeof createClient>,
  rawBody: unknown,
  correlationId: string,
): Promise<Response> {
  const validated = zodValidate(rawBody, PersonalBrainSchema);
  if (!validated.success) return validated.response;
  const { messages, mode = "think", chatId } = validated.data;

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return jsonResponse({ error: "AI provider not configured", code: "PROVIDER_MISSING", correlation_id: correlationId }, 503);
  }

  const budget = await checkAIBudget(admin, user.id, `personal_brain.${mode}`, 0.005, { strict: true });
  let model = DEFAULT_MODEL;
  if (!budget.allowed) {
    return jsonResponse({ error: "AI budget exceeded.", code: "BUDGET_EXCEEDED", correlation_id: correlationId }, 429);
  }
  if (budget.shouldDowngrade && budget.fallbackModelId) model = budget.fallbackModelId;

  const systemPrompt = await buildBrainContext(userClient, admin, user.id, mode);

  const aiCallStart = Date.now();
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    }),
  });
  const aiLatencyMs = Date.now() - aiCallStart;

  if (!response.ok) {
    const t = await response.text();
    const code = response.status === 429 ? "PROVIDER_RATE_LIMITED" : response.status === 402 ? "CREDITS_EXHAUSTED" : "PROVIDER_ERROR";
    const msg  = response.status === 429 ? "Rate limited — try again shortly."
              : response.status === 402 ? "AI credits exhausted. Add funds in Settings → Workspace → Usage."
              : "AI service error";
    console.error(`personal-brain [${correlationId}] AI gateway error:`, response.status, t.slice(0, 200));
    return jsonResponse({ error: msg, code, correlation_id: correlationId },
      response.status === 429 || response.status === 402 ? response.status : 500);
  }

  if (chatId) {
    const lastUser = messages[messages.length - 1];
    if (lastUser?.role === "user") {
      admin.from("pb_messages").insert({
        user_id: user.id,
        chat_id: chatId,
        role: "user",
        content: lastUser.content,
      }).then(() => {}).catch((e) => console.error("pb_messages user insert:", e));
      admin.from("pb_chats").update({ last_message_at: new Date().toISOString() })
        .eq("id", chatId).eq("user_id", user.id)
        .then(() => {}).catch((e) => console.error("pb_chats touch:", e));
    }
  }

  const inputApprox = JSON.stringify(messages).length / 4;
  const estCostUsd = inputApprox * 0.000002;
  logAIReceipt(admin, {
    userId: user.id,
    capabilityKey: `personal_brain.${mode}`,
    model,
    provider: "lovable-gateway",
    inputTokens: Math.ceil(inputApprox),
    outputTokens: 0,
    estimatedCostUsd: estCostUsd,
    latencyMs: aiLatencyMs,
    correlationId,
  });
  admin.rpc("update_ai_budget_usage", {
    p_user_id: user.id,
    p_tokens: Math.ceil(inputApprox),
    p_cost: Math.ceil(inputApprox * 0.002),
  }).then(() => {}).catch((e) => console.error("Budget metering error:", e));

  // When chatId is present, tee the SSE stream — pass-through to client AND
  // assemble assistant content server-side so we can persist it.
  if (chatId && response.body) {
    const [clientStream, serverStream] = response.body.tee();
    (async () => {
      try {
        const reader = serverStream.getReader();
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
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta?.content ?? "";
              if (delta) assembled += delta;
            } catch {
              /* ignore malformed chunk */
            }
          }
        }
        if (assembled.trim().length > 0) {
          // Reload the active memories to record what informed the reply.
          const { data: mems } = await admin
            .from("pb_memories")
            .select("id,category,content,confidence,kind")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("confidence", { ascending: false })
            .limit(20);
          await admin.from("pb_messages").insert({
            user_id: user.id,
            chat_id: chatId,
            role: "assistant",
            content: assembled,
            sources: { memories_used: mems ?? [], mode },
          });
          await admin
            .from("pb_chats")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", chatId)
            .eq("user_id", user.id);
        }
      } catch (e) {
        console.error(`personal-brain [${correlationId}] persist error:`, e);
      }
    })();
    return new Response(clientStream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Correlation-Id": correlationId,
        "X-Latency-Ms": aiLatencyMs.toString(),
      },
    });
  }

  return new Response(response.body!, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "X-Correlation-Id": correlationId,
      "X-Latency-Ms": aiLatencyMs.toString(),
    },
  });
}

async function actionMemorySave(
  user: { id: string },
  admin: ReturnType<typeof createClient>,
  payload: unknown,
): Promise<Response> {
  const v = zodValidate(payload, PBMemorySaveSchema);
  if (!v.success) return v.response;

  const prefs = await getSecurityPrefs(admin, user.id);
  if (prefs.sensitive_mode && v.data.kind === "inferred") {
    return jsonResponse({ ok: true, skipped: true, reason: "sensitive_mode_blocks_inferred" });
  }

  const { data, error } = await admin.from("pb_memories").insert({
    user_id: user.id,
    kind: v.data.kind,
    category: v.data.category,
    content: v.data.content,
    confidence: v.data.confidence,
    source_chat_id: v.data.source_chat_id,
    status: "active",
  }).select().single();

  if (error) return jsonResponse({ error: error.message }, 500);
  await logSecurityEvent(admin, user.id, "memory.saved", { id: data.id, kind: v.data.kind, category: v.data.category });
  return jsonResponse({ ok: true, memory: data });
}

async function actionMemoryList(
  user: { id: string },
  admin: ReturnType<typeof createClient>,
): Promise<Response> {
  const { data, error } = await admin
    .from("pb_memories")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ ok: true, memories: data ?? [] });
}

async function actionMemoryToggle(
  user: { id: string },
  admin: ReturnType<typeof createClient>,
  payload: unknown,
): Promise<Response> {
  const v = zodValidate(payload, PBMemoryToggleSchema);
  if (!v.success) return v.response;
  const { data, error } = await admin.from("pb_memories")
    .update({ status: v.data.status })
    .eq("id", v.data.id).eq("user_id", user.id)
    .select().maybeSingle();
  if (error) return jsonResponse({ error: error.message }, 500);
  if (!data) return jsonResponse({ error: "Not found" }, 404);
  await logSecurityEvent(admin, user.id, "memory.toggled", { id: v.data.id, status: v.data.status });
  return jsonResponse({ ok: true, memory: data });
}

async function actionMemoryDelete(
  user: { id: string },
  admin: ReturnType<typeof createClient>,
  payload: unknown,
): Promise<Response> {
  const v = zodValidate(payload, PBMemoryDeleteSchema);
  if (!v.success) return v.response;
  let q = admin.from("pb_memories").delete().eq("user_id", user.id);
  if (v.data.id) q = q.eq("id", v.data.id);
  if (v.data.category) q = q.eq("category", v.data.category);
  const { error, count } = await q.select("id", { count: "exact" });
  if (error) return jsonResponse({ error: error.message }, 500);
  await logSecurityEvent(admin, user.id, "memory.deleted", { ...v.data, count });
  return jsonResponse({ ok: true, deleted: count ?? 0 });
}

async function actionLearnScan(
  user: { id: string },
  admin: ReturnType<typeof createClient>,
  payload: unknown,
  correlationId: string,
): Promise<Response> {
  const v = zodValidate(payload, PBLearnScanSchema);
  if (!v.success) return v.response;

  const prefs = await getSecurityPrefs(admin, user.id);
  if (prefs.sensitive_mode || !prefs.autolearn_enabled || !prefs.learn_from_chats) {
    return jsonResponse({ ok: true, skipped: true, reason: "autolearn_disabled" });
  }

  let messagesQuery = admin.from("pb_messages")
    .select("role,content,chat_id,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(v.data.windowMessages);
  if (v.data.chatId) messagesQuery = messagesQuery.eq("chat_id", v.data.chatId);
  const { data: msgs } = await messagesQuery;
  if (!msgs || msgs.length === 0) {
    return jsonResponse({ ok: true, scanned: 0, inferred: 0 });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return jsonResponse({ error: "AI provider not configured" }, 503);

  const transcript = (msgs as Array<{ role: string; content: string }>)
    .reverse()
    .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 800)}`)
    .join("\n\n");

  const sysPrompt = `You analyze a user's recent chat transcript to extract durable, useful facts the AI should remember. Only return high-quality, non-trivial signals. Avoid restating obvious or short-lived statements.`;
  const tools = [{
    type: "function",
    function: {
      name: "record_inferences",
      description: "Record up to 8 inferred memories about the user.",
      parameters: {
        type: "object",
        properties: {
          inferences: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string", enum: ["style","format","interest","skill","project","pain_point","goal","work_context","preference"] },
                content: { type: "string" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
              },
              required: ["category","content","confidence"],
            },
          },
        },
        required: ["inferences"],
      },
    },
  }];

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: `Transcript:\n${transcript}` },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "record_inferences" } },
    }),
  });

  if (!aiResp.ok) {
    return jsonResponse({ error: "AI scan failed", status: aiResp.status }, 500);
  }

  const json = await aiResp.json();
  const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  let inferences: Array<{ category: string; content: string; confidence: number }> = [];
  try { inferences = JSON.parse(args ?? "{}").inferences ?? []; } catch { inferences = []; }

  const threshold = Number(prefs.autolearn_threshold ?? 0.7);
  const rows = inferences.slice(0, 8).map((inf) => ({
    user_id: user.id,
    kind: "inferred",
    category: inf.category,
    content: inf.content,
    confidence: inf.confidence,
    status: inf.confidence >= threshold ? "active" : "pending",
  }));
  if (rows.length) {
    await admin.from("pb_memories").insert(rows);
  }
  await logSecurityEvent(admin, user.id, "learn.scan", {
    correlationId, scanned: msgs.length, inferred: rows.length,
  });
  return jsonResponse({ ok: true, scanned: msgs.length, inferred: rows.length });
}

async function actionFileIngest(
  user: { id: string },
  admin: ReturnType<typeof createClient>,
  payload: unknown,
): Promise<Response> {
  const v = zodValidate(payload, PBFileIngestSchema);
  if (!v.success) return v.response;

  let summary: string | null = null;
  if (v.data.text_content && v.data.text_content.length > 50) {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: DEFAULT_MODEL,
            messages: [
              { role: "system", content: "Summarize the following document in 3-5 sentences. Be specific and useful." },
              { role: "user", content: v.data.text_content.slice(0, 30000) },
            ],
          }),
        });
        if (resp.ok) {
          const json = await resp.json();
          summary = json.choices?.[0]?.message?.content ?? null;
        }
      } catch (e) {
        console.error("file.ingest summary error:", e);
      }
    }
  }

  const { data, error } = await admin.from("pb_files").insert({
    user_id: user.id,
    workspace_id: v.data.workspace_id ?? null,
    scope: v.data.scope,
    filename: v.data.filename,
    mime_type: v.data.mime_type ?? null,
    size_bytes: v.data.size_bytes ?? null,
    storage_path: v.data.storage_path,
    summary,
    indexed_at: summary ? new Date().toISOString() : null,
  }).select().single();
  if (error) return jsonResponse({ error: error.message }, 500);
  await logSecurityEvent(admin, user.id, "file.ingested", { id: data.id, scope: v.data.scope });
  return jsonResponse({ ok: true, file: data });
}

async function actionVoiceTranscribe(
  user: { id: string },
  admin: ReturnType<typeof createClient>,
  payload: unknown,
): Promise<Response> {
  const v = zodValidate(payload, PBVoiceTranscribeSchema);
  if (!v.success) return v.response;

  const prefs = await getSecurityPrefs(admin, user.id);
  await logSecurityEvent(admin, user.id, "voice.transcribe.requested", {
    bytes: v.data.audio_base64.length,
    retention: prefs.voice_transcript_retention,
  });
  return jsonResponse({
    ok: true,
    use_browser_stt: true,
    retention: prefs.voice_transcript_retention,
    note: "Cloud STT not available — fall back to Web Speech API on the client.",
  });
}

async function actionDataExport(
  user: { id: string },
  admin: ReturnType<typeof createClient>,
): Promise<Response> {
  const tables = [
    "pb_profile","pb_goals","pb_workspaces","pb_chats","pb_messages",
    "pb_memories","pb_files","pb_voice_prefs","pb_security_prefs","pb_security_events",
  ];
  const out: Record<string, unknown> = { exported_at: new Date().toISOString(), user_id: user.id };
  for (const t of tables) {
    const { data } = await admin.from(t).select("*").eq("user_id", user.id);
    out[t] = data ?? [];
  }
  await logSecurityEvent(admin, user.id, "data.exported", { tables: tables.length });
  return jsonResponse(out, 200, {
    "Content-Disposition": `attachment; filename="personal-brain-export-${user.id}.json"`,
  });
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const correlationId = crypto.randomUUID();
  const t0 = Date.now();

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const user = auth.user;
    const userClient = auth.supabase;

    const rl = checkRateLimit(user.id, 30, 60_000);
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const rawBody = await req.json().catch(() => null);
    if (!rawBody) return corsError("Invalid JSON body", 400);

    const admin = getServiceClient();

    const looksLikeRouter = typeof (rawBody as { action?: unknown }).action === "string";
    if (!looksLikeRouter) {
      return await actionInfer(user, userClient, admin, rawBody, correlationId);
    }

    const routed = zodValidate(rawBody, PBRouterSchema);
    if (!routed.success) return routed.response;
    const { action, payload } = routed.data;

    switch (action) {
      case "infer":              return await actionInfer(user, userClient, admin, payload ?? {}, correlationId);
      case "memory.save":        return await actionMemorySave(user, admin, payload);
      case "memory.list":        return await actionMemoryList(user, admin);
      case "memory.toggle":      return await actionMemoryToggle(user, admin, payload);
      case "memory.delete":      return await actionMemoryDelete(user, admin, payload);
      case "learn.scan":         return await actionLearnScan(user, admin, payload, correlationId);
      case "file.ingest":        return await actionFileIngest(user, admin, payload);
      case "voice.transcribe":   return await actionVoiceTranscribe(user, admin, payload);
      case "data.export":        return await actionDataExport(user, admin);
      default:
        return jsonResponse({ error: "Unknown action", code: "BAD_ACTION" }, 400);
    }
  } catch (e) {
    const ms = Date.now() - t0;
    console.error(`personal-brain [${correlationId}] error (${ms}ms):`, e);
    return jsonResponse({
      error: e instanceof Error ? e.message : "Unknown error",
      code: "INTERNAL_ERROR",
      correlation_id: correlationId,
    }, 500);
  }
});