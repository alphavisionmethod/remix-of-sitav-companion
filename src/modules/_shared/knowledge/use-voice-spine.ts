// React Query hooks for the Phase 6 Voice Spine.
import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appendVoiceTranscript,
  endVoiceSession,
  getEmbeddingCoverage,
  listRecentVoiceSessions,
  listSessionTranscripts,
  promoteVoiceTranscript,
  startVoiceSession,
  type AppendTranscriptInput,
  type PromoteTranscriptInput,
  type StartSessionInput,
  type VoiceSessionRow,
  type VoiceSessionStatus,
  type VoiceTranscriptRow,
} from "./voice-service";

export const VOICE_QUERY_KEYS = {
  recentSessions: (limit: number) => ["voice", "sessions", "recent", limit] as const,
  sessionTranscripts: (id: string | null) => ["voice", "transcripts", id] as const,
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
