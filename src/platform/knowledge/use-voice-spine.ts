// React Query hooks for the Phase 6 Voice Spine.
import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appendVoiceTranscript,
  dispatchVoiceIntent,
  endVoiceSession,
  extractVoiceIntents,
  getEmbeddingCoverage,
  listSessionIntents,
  listRecentVoiceSessions,
  listSessionTranscripts,
  promoteVoiceTranscript,
  startVoiceSession,
  updateVoiceIntent,
  type AppendTranscriptInput,
  type DispatchVoiceIntentResponse,
  type PromoteTranscriptInput,
  type StartSessionInput,
  type VoiceIntentRow,
  type VoiceSessionRow,
  type VoiceSessionStatus,
  type VoiceTranscriptRow,
} from "./voice-service";

export const VOICE_QUERY_KEYS = {
  recentSessions: (limit: number) => ["voice", "sessions", "recent", limit] as const,
  sessionTranscripts: (id: string | null) => ["voice", "transcripts", id] as const,
  sessionIntents: (id: string | null) => ["voice", "intents", id] as const,
  embeddingCoverage: () => ["voice", "embedding-coverage"] as const,
};

export function useRecentVoiceSessions(limit = 25) {
  return useQuery<VoiceSessionRow[]>({
    queryKey: VOICE_QUERY_KEYS.recentSessions(limit),
    queryFn: () => listRecentVoiceSessions(limit),
    staleTime: 15_000,
  });
}

export function useSessionTranscripts(sessionId: string | null) {
  return useQuery<VoiceTranscriptRow[]>({
    queryKey: VOICE_QUERY_KEYS.sessionTranscripts(sessionId),
    queryFn: () => (sessionId ? listSessionTranscripts(sessionId) : Promise.resolve([])),
    enabled: !!sessionId,
    refetchInterval: 5_000,
  });
}

export function useEmbeddingCoverage() {
  return useQuery({
    queryKey: VOICE_QUERY_KEYS.embeddingCoverage(),
    queryFn: getEmbeddingCoverage,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function usePromoteVoiceTranscript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PromoteTranscriptInput) => promoteVoiceTranscript(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice", "transcripts"] });
      qc.invalidateQueries({ queryKey: VOICE_QUERY_KEYS.embeddingCoverage() });
    },
  });
}

/** Phase 7 — list intents already proposed for a session. */
export function useSessionIntents(sessionId: string | null) {
  return useQuery<VoiceIntentRow[]>({
    queryKey: VOICE_QUERY_KEYS.sessionIntents(sessionId),
    queryFn: () => (sessionId ? listSessionIntents(sessionId) : Promise.resolve([])),
    enabled: !!sessionId,
    refetchInterval: 8_000,
  });
}

/** Phase 7 — trigger LLM intent extraction over a session's transcripts. */
export function useExtractVoiceIntents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, maxTranscripts }: { sessionId: string; maxTranscripts?: number }) =>
      extractVoiceIntents(sessionId, maxTranscripts ?? 10),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: VOICE_QUERY_KEYS.sessionIntents(vars.sessionId) });
    },
  });
}

/** Phase 7 — approve / reject / mark-executed an intent. */
export function useUpdateVoiceIntent(sessionId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { intentId: string; status: "approved" | "rejected" | "executed"; rejectedReason?: string }) =>
      updateVoiceIntent(input.intentId, input.status, input.rejectedReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VOICE_QUERY_KEYS.sessionIntents(sessionId) });
    },
  });
}

/**
 * Phase 8 — Dispatch a voice intent into the Sita agent runtime.
 * Flips status to `dispatched` server-side and emits the `sita-agent-intent`
 * window event the agent listener already consumes.
 */
export function useDispatchVoiceIntent(sessionId: string | null) {
  const qc = useQueryClient();
  return useMutation<DispatchVoiceIntentResponse, Error, { intentId: string }>({
    mutationFn: ({ intentId }) => dispatchVoiceIntent(intentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VOICE_QUERY_KEYS.sessionIntents(sessionId) });
    },
  });
}

/**
 * Stateful voice session lifecycle hook (start → append → end).
 * Designed for dictation panels. Handles seq counter and abort cleanup.
 */
export function useVoiceSession() {
  const qc = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "recording" | "ending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const seqRef = useRef(0);

  const start = useCallback(async (input: StartSessionInput = {}) => {
    setStatus("starting");
    setError(null);
    try {
      const res = await startVoiceSession(input);
      setSessionId(res.session.id);
      seqRef.current = 0;
      setStatus("recording");
      qc.invalidateQueries({ queryKey: ["voice", "sessions"] });
      return res.session.id;
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }, [qc]);

  const append = useCallback(async (input: Omit<AppendTranscriptInput, "sessionId" | "seq"> & { seq?: number }) => {
    if (!sessionId) throw new Error("No active session");
    const seq = input.seq ?? seqRef.current++;
    const res = await appendVoiceTranscript({ ...input, sessionId, seq });
    qc.invalidateQueries({ queryKey: VOICE_QUERY_KEYS.sessionTranscripts(sessionId) });
    return res;
  }, [sessionId, qc]);

  const end = useCallback(async (finalStatus: VoiceSessionStatus = "ended") => {
    if (!sessionId) return null;
    setStatus("ending");
    try {
      const res = await endVoiceSession(sessionId, finalStatus);
      setStatus("idle");
      qc.invalidateQueries({ queryKey: ["voice", "sessions"] });
      qc.invalidateQueries({ queryKey: VOICE_QUERY_KEYS.embeddingCoverage() });
      const closed = sessionId;
      setSessionId(null);
      seqRef.current = 0;
      return { ...res, session_id: closed };
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }, [sessionId, qc]);

  return { sessionId, status, error, start, append, end };
}
