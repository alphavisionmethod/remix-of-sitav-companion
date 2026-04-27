// First-use resume/re-entry telemetry — client-side persistence loop.
// Wires the `onboarding-resume-checkpoint` edge function so abandoned setups
// can resume from the last completed screen. Closes BLOCK gate #11 client-side.
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "sita_onboarding_session_id";
const TOKEN_KEY = "sita_onboarding_resume_token";

export type OnboardingBranch = "quick" | "balanced" | "deep";

export interface ResumeCheckpoint {
  session_id: string;
  current_screen: number;
  branch: OnboardingBranch;
  profile_snapshot: Record<string, unknown>;
  conditional_state: Record<string, unknown>;
  last_completed_screen: number | null;
  resume_token: string;
  expires_at: string;
  updated_at: string;
}

export interface SaveCheckpointArgs {
  currentScreen: number;
  branch: OnboardingBranch;
  profileSnapshot: Record<string, unknown>;
  conditionalState?: Record<string, unknown>;
  lastCompletedScreen?: number | null;
}

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = (crypto as any)?.randomUUID?.() ?? `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
}

async function callEdge(method: "GET" | "POST", path: string, body?: unknown) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return { ok: false, status: 401, body: null as any };

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-resume-checkpoint${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body: json };
}

export function useOnboardingResume() {
  const [checkpoint, setCheckpoint] = useState<ResumeCheckpoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string>(getOrCreateSessionId());

  // On mount: try to restore checkpoint via existing resume_token
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          if (!cancelled) setIsLoading(false);
          return;
        }
        const { ok, body } = await callEdge("GET", `?resume_token=${encodeURIComponent(token)}`);
        if (!cancelled && ok && body?.checkpoint) {
          setCheckpoint(body.checkpoint as ResumeCheckpoint);
        }
      } catch (e) {
        // non-fatal — user just won't see resume prompt
        console.warn("[onboarding-resume] restore failed", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveCheckpoint = useCallback((args: SaveCheckpointArgs) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { ok, body } = await callEdge("POST", "", {
          session_id: sessionIdRef.current,
          current_screen: args.currentScreen,
          branch: args.branch,
          profile_snapshot: args.profileSnapshot,
          conditional_state: args.conditionalState ?? {},
          last_completed_screen: args.lastCompletedScreen ?? null,
        });
        if (ok && body?.resume_token) {
          try { localStorage.setItem(TOKEN_KEY, body.resume_token); } catch {}
        }
      } catch (e) {
        console.warn("[onboarding-resume] save failed", e);
      }
    }, 500);
  }, []);

  const clearCheckpoint = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setCheckpoint(null);
  }, []);

  return {
    checkpoint,
    isLoading,
    saveCheckpoint,
    clearCheckpoint,
    sessionId: sessionIdRef.current,
  };
}
