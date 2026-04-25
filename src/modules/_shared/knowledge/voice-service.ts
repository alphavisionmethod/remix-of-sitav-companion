// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 6 Voice Spine Service
// Wraps the `voice-spine` edge function (start/transcript/end/promote)
// and provides typed reads of voice_sessions / voice_transcripts.
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";
import type { Sensitivity } from "./memory-service";
import type { EmbeddingStatus } from "./knowledge-service";

export type VoiceProvider = "browser_stt" | "elevenlabs_stt" | "gemini_stt" | "manual";
export type VoiceMode = "dictation" | "conversation" | "background";
export type VoiceSessionStatus = "active" | "ended" | "aborted" | "failed";
export type VoiceTranscriptRole = "user" | "assistant" | "system";
export type { EmbeddingStatus, Sensitivity };

export interface VoiceSessionRow {
  id: string;
  user_id: string;
  workspace_id: string | null;
  module_id: string | null;
  pillar: string;
  provider: VoiceProvider;
  mode: VoiceMode;
  status: VoiceSessionStatus;
  correlation_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VoiceTranscriptRow {
  id: string;
  user_id: string;
  session_id: string;
  seq: number;
  role: VoiceTranscriptRole;
  text: string;
  lang: string;
  confidence: number;
  is_final: boolean;
  audio_storage_path: string | null;
  embedding_status: EmbeddingStatus;
  promoted_memory_id: string | null;
  created_at: string;
  expires_at: string;
}

export interface StartSessionInput {
  workspaceId?: string | null;
  moduleId?: string | null;
  pillar?: string;
  provider?: VoiceProvider;
  mode?: VoiceMode;
  metadata?: Record<string, unknown>;
}

export interface AppendTranscriptInput {
  sessionId: string;
  seq?: number;
  role?: VoiceTranscriptRole;
  text: string;
  lang?: string;
  confidence?: number;
  isFinal?: boolean;
  audioStoragePath?: string | null;
}

export interface PromoteTranscriptInput {
  transcriptId: string;
  sensitivity?: Sensitivity;
  category?: string;
}

interface SpineStartResponse { ok: boolean; session: { id: string; correlation_id: string | null; started_at: string }; }
interface SpineTranscriptResponse { ok: boolean; transcript: { id: string; seq: number; created_at: string }; }
interface SpineEndResponse { ok: boolean; session_id: string; duration_ms: number; }
interface SpinePromoteResponse { ok: boolean; memory_id: string; }

export interface VoiceIntentRow {
  id: string;
  session_id: string;
  transcript_id: string | null;
  action_key: string;
  params: Record<string, unknown>;
  rationale: string;
  confidence: number;
  status: "proposed" | "approved" | "rejected" | "executed" | "expired";
  executed_at: string | null;
  rejected_at: string | null;
  created_at: string;
}

interface ExtractIntentsResponse {
  ok: boolean;
  proposed: number;
  inserted: number;
  intents: VoiceIntentRow[];
}
interface ExecuteIntentResponse { ok: boolean; intent: { id: string; status: string; executed_at: string | null; rejected_at: string | null } }

/** Phase 8 — Sita-agent dispatch payload. */
export interface DispatchVoiceIntentResponse {
  ok: true;
  intent_id: string;
  action_key: string;
  params: Record<string, unknown>;
  rationale: string;
  confidence: number;
  correlation_id: string;
}

export async function startVoiceSession(input: StartSessionInput = {}): Promise<SpineStartResponse> {
  const { data, error } = await supabase.functions.invoke("voice-spine", {
    body: {
      op: "session.start",
      workspace_id: input.workspaceId ?? null,
      module_id: input.moduleId ?? null,
      pillar: input.pillar ?? "shared",
      provider: input.provider ?? "browser_stt",
      mode: input.mode ?? "dictation",
      metadata: input.metadata ?? {},
    },
  });
  if (error) throw new Error(error.message ?? "Voice session start failed");
  return data as SpineStartResponse;
}

export async function appendVoiceTranscript(input: AppendTranscriptInput): Promise<SpineTranscriptResponse> {
  const { data, error } = await supabase.functions.invoke("voice-spine", {
    body: {
      op: "transcript",
      session_id: input.sessionId,
      seq: input.seq ?? 0,
      role: input.role ?? "user",
      text: input.text,
      lang: input.lang ?? "en",
      confidence: input.confidence ?? 0.85,
      is_final: input.isFinal ?? true,
      audio_storage_path: input.audioStoragePath ?? null,
    },
  });
  if (error) throw new Error(error.message ?? "Append transcript failed");
  return data as SpineTranscriptResponse;
}

export async function endVoiceSession(sessionId: string, status: VoiceSessionStatus = "ended"): Promise<SpineEndResponse> {
  const { data, error } = await supabase.functions.invoke("voice-spine", {
    body: { op: "session.end", session_id: sessionId, status },
  });
  if (error) throw new Error(error.message ?? "End session failed");
  return data as SpineEndResponse;
}

export async function promoteVoiceTranscript(input: PromoteTranscriptInput): Promise<SpinePromoteResponse> {
  const { data, error } = await supabase.functions.invoke("voice-spine", {
    body: {
      op: "promote",
      transcript_id: input.transcriptId,
      sensitivity: input.sensitivity ?? "internal",
      category: input.category ?? "voice_note",
    },
  });
  if (error) throw new Error(error.message ?? "Promote transcript failed");
  return data as SpinePromoteResponse;
}

export async function extractVoiceIntents(sessionId: string, maxTranscripts = 10): Promise<ExtractIntentsResponse> {
  const { data, error } = await supabase.functions.invoke("voice-spine", {
    body: { op: "extract_intents", session_id: sessionId, max_transcripts: maxTranscripts },
  });
  if (error) throw new Error(error.message ?? "Intent extraction failed");
  return data as ExtractIntentsResponse;
}

export async function updateVoiceIntent(
  intentId: string,
  status: "approved" | "rejected" | "executed",
  rejectedReason?: string,
): Promise<ExecuteIntentResponse> {
  const { data, error } = await supabase.functions.invoke("voice-spine", {
    body: { op: "execute_intent", intent_id: intentId, status, rejected_reason: rejectedReason },
  });
  if (error) throw new Error(error.message ?? "Intent update failed");
  return data as ExecuteIntentResponse;
}

/**
 * Phase 8 — Dispatch a voice-extracted intent into the Sita agent runtime.
 * Calls the SECURITY DEFINER `dispatch_voice_intent` RPC to flip the intent
 * status to `dispatched` and return the payload, then fires the
 * `sita-agent-intent` window event the agent runtime already listens to.
 */
export async function dispatchVoiceIntent(intentId: string): Promise<DispatchVoiceIntentResponse> {
  const { data, error } = await (supabase as any).rpc("dispatch_voice_intent", { _intent_id: intentId });
  if (error) throw new Error(error.message ?? "Intent dispatch failed");
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Dispatch returned no row");
  const payload: DispatchVoiceIntentResponse = {
    ok: true,
    intent_id: String(row.intent_id),
    action_key: String(row.action_key),
    params: (row.params ?? {}) as Record<string, unknown>,
    rationale: String(row.rationale ?? ""),
    confidence: Number(row.confidence ?? 0),
    correlation_id: String(row.correlation_id),
  };
  // Bridge to the agent runtime — the existing useSitaAgent listener
  // turns this into a typed Action Plan via the planner edge fn.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sita-agent-intent", {
      detail: {
        intent: `${payload.action_key}: ${payload.rationale}`,
        domain: payload.action_key.startsWith("finance.") ? "finance"
          : payload.action_key.startsWith("concierge.") ? "concierge"
          : "business",
        params: payload.params,
        correlation_id: payload.correlation_id,
        source: "voice_intent",
        source_intent_id: payload.intent_id,
      },
    }));
  }
  return payload;
}

export async function listSessionIntents(sessionId: string): Promise<VoiceIntentRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await (supabase as any).rpc("extract_voice_intents", {
    _session_id: sessionId, _max_n: 25,
  });
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id),
    session_id: sessionId,
    transcript_id: (r.transcript_id ?? null) as string | null,
    action_key: String(r.action_key),
    params: (r.params ?? {}) as Record<string, unknown>,
    rationale: String(r.rationale ?? ""),
    confidence: Number(r.confidence ?? 0),
    status: String(r.status ?? "proposed") as VoiceIntentRow["status"],
    executed_at: null,
    rejected_at: null,
    created_at: String(r.created_at),
  }));
}

export async function listRecentVoiceSessions(limit = 25): Promise<VoiceSessionRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await (supabase as any)
    .from("voice_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as VoiceSessionRow[];
}

export async function listSessionTranscripts(sessionId: string): Promise<VoiceTranscriptRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await (supabase as any)
    .from("voice_transcripts")
    .select("*")
    .eq("user_id", user.id)
    .eq("session_id", sessionId)
    .order("seq", { ascending: true });
  if (error) throw error;
  return (data ?? []) as VoiceTranscriptRow[];
}

export async function getEmbeddingCoverage(): Promise<{
  chunks_total: number;
  chunks_embedded: number;
  chunks_pending: number;
  chunks_failed: number;
  memories_total: number;
  memories_embedded: number;
  memories_pending: number;
  transcripts_total: number;
  transcripts_pending: number;
  transcripts_promoted: number;
  voice_sessions_active: number;
  voice_sessions_total_24h: number;
}> {
  const sb = supabase as any;
  const since24h = new Date(Date.now() - 86_400_000).toISOString();
  const [
    { count: chunks_total },
    { count: chunks_embedded },
    { count: chunks_pending },
    { count: chunks_failed },
    { count: memories_total },
    { count: memories_embedded },
    { count: memories_pending },
    { count: transcripts_total },
    { count: transcripts_pending },
    { count: transcripts_promoted },
    { count: voice_sessions_active },
    { count: voice_sessions_total_24h },
  ] = await Promise.all([
    sb.from("knowledge_chunks").select("id", { count: "exact", head: true }),
    sb.from("knowledge_chunks").select("id", { count: "exact", head: true }).eq("embedding_status", "embedded"),
    sb.from("knowledge_chunks").select("id", { count: "exact", head: true }).eq("embedding_status", "pending"),
    sb.from("knowledge_chunks").select("id", { count: "exact", head: true }).eq("embedding_status", "failed"),
    sb.from("memory_provenance").select("memory_id", { count: "exact", head: true }),
    sb.from("memory_provenance").select("memory_id", { count: "exact", head: true }).eq("embedding_status", "embedded"),
    sb.from("memory_provenance").select("memory_id", { count: "exact", head: true }).eq("embedding_status", "pending"),
    sb.from("voice_transcripts").select("id", { count: "exact", head: true }),
    sb.from("voice_transcripts").select("id", { count: "exact", head: true }).eq("embedding_status", "pending"),
    sb.from("voice_transcripts").select("id", { count: "exact", head: true }).not("promoted_memory_id", "is", null),
    sb.from("voice_sessions").select("id", { count: "exact", head: true }).eq("status", "active"),
    sb.from("voice_sessions").select("id", { count: "exact", head: true }).gte("started_at", since24h),
  ]);
  return {
    chunks_total: chunks_total ?? 0,
    chunks_embedded: chunks_embedded ?? 0,
    chunks_pending: chunks_pending ?? 0,
    chunks_failed: chunks_failed ?? 0,
    memories_total: memories_total ?? 0,
    memories_embedded: memories_embedded ?? 0,
    memories_pending: memories_pending ?? 0,
    transcripts_total: transcripts_total ?? 0,
    transcripts_pending: transcripts_pending ?? 0,
    transcripts_promoted: transcripts_promoted ?? 0,
    voice_sessions_active: voice_sessions_active ?? 0,
    voice_sessions_total_24h: voice_sessions_total_24h ?? 0,
  };
}
