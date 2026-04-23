// ═══════════════════════════════════════════════════════════════
// Personal Brain — Always-on voice loop (Phase 7)
// ═══════════════════════════════════════════════════════════════
// Jarvis-style ambient voice mode.
//
// Lifecycle (one cycle):
//   1. WAKE      → useWakeWord listens continuously for "Hey Sita".
//   2. CAPTURE   → on wake, swap to a focused single-shot recognizer
//                  to capture the next utterance as the command.
//   3. THINKING  → stream the command into the personal-brain edge
//                  function (mode='think'), assemble the reply.
//   4. SPEAKING  → speak via cloud TTS if enabled, else browser TTS.
//   5. → back to WAKE.
//
// Renders a fixed "presence orb" in the bottom-right that pulses with
// the current state. Tap to disable. Designed to survive route changes
// at the BrainDashboard level (mounted only when sentinel is on).
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { Power } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWakeWord } from "./useWakeWord";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { useCloudVoice } from "./useCloudVoice";
import { usePbVoicePrefs } from "./usePbVoicePrefs";
import { useSentinelPrefs } from "./useSentinelPrefs";

type LoopState = "wake" | "capture" | "thinking" | "speaking" | "paused";

interface AlwaysOnVoiceProps {
  enabled: boolean;
  onDisable: () => void;
  /** Wake phrases override (otherwise uses Sentinel prefs from localStorage). */
  wakePhrases?: string[];
}

const CAPTURE_TIMEOUT_MS = 7000;

export function AlwaysOnVoice({ enabled, onDisable, wakePhrases }: AlwaysOnVoiceProps) {
  const { user } = useAuth();
  const { prefs } = usePbVoicePrefs();
  const { prefs: sentinel } = useSentinelPrefs();
  const synth = useSpeechSynthesis();
  const cloud = useCloudVoice();

  const phrases = wakePhrases ?? sentinel.phrases;

  const [state, setState] = useState<LoopState>("paused");
  const [lastUser, setLastUser] = useState<string>("");
  const [lastReply, setLastReply] = useState<string>("");
  const [chatId, setChatId] = useState<string | null>(null);

  const stateRef = useRef<LoopState>("paused");
  useEffect(() => { stateRef.current = state; }, [state]);

  const captureTimerRef = useRef<number | null>(null);
  const finalAccumRef = useRef<string>("");

  // ── Command-capture STT (single-shot per wake) ──
  const captureStt = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    onFinalTranscript: (t) => {
      finalAccumRef.current = (finalAccumRef.current + " " + t).trim();
    },
    onError: (e) => {
      if (e !== "no-speech" && e !== "aborted") {
        console.warn("[AlwaysOnVoice] capture error", e);
      }
    },
  });

  // ── Brain turn ──
  const ensureChat = useCallback(async (): Promise<string | null> => {
    if (chatId) return chatId;
    if (!user) return null;
    const { data, error } = await supabase
      .from("pb_chats")
      .insert({ user_id: user.id, title: "Sentinel session", mode: "think" })
      .select()
      .maybeSingle();
    if (error || !data) return null;
    setChatId(data.id);
    return data.id;
  }, [chatId, user]);

  const speakReply = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      if (prefs?.use_cloud_stt) {
        const res = await cloud.tts(text, prefs?.voice_id);
        if (res.ok && res.audio_base64) {
          try {
            const audio = await cloud.playBase64Audio(res.audio_base64, res.mime_type ?? "audio/mpeg");
            await new Promise<void>((resolve) => {
              audio.onended = () => resolve();
              audio.onerror = () => resolve();
            });
            return;
          } catch { /* fall through */ }
        }
      }
      synth.speak(text, { rate: prefs?.rate ?? 1, pitch: prefs?.pitch ?? 1 });
      // Wait for browser TTS to finish.
      await new Promise<void>((resolve) => {
        const tick = window.setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            window.clearInterval(tick);
            resolve();
          }
        }, 200);
        // Hard cap 30s to avoid stuck loop.
        window.setTimeout(() => { window.clearInterval(tick); resolve(); }, 30000);
      });
    },
    [prefs, cloud, synth],
  );

  const runBrainTurn = useCallback(
    async (command: string) => {
      setLastUser(command);
      setLastReply("");
      setState("thinking");
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (!token) throw new Error("Not signed in");
        const cid = await ensureChat();
        if (!cid) throw new Error("Chat unavailable");

        const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/personal-brain`;
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: command }],
            mode: "think",
            chatId: cid,
          }),
        });
        if (!resp.ok || !resp.body) throw new Error(await resp.text() || "stream_error");

        const reader = resp.body.getReader();
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
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const data = t.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                assembled += delta;
                setLastReply(assembled);
              }
            } catch { /* noop */ }
          }
        }

        if (assembled.trim()) {
          setState("speaking");
          await speakReply(assembled);
        }
      } catch (e) {
        console.error("[AlwaysOnVoice] brain turn failed", e);
        toast.error("Sentinel turn failed", {
          description: e instanceof Error ? e.message : String(e),
        });
      } finally {
        // Return to wake-listen if still enabled.
        if (stateRef.current !== "paused") setState("wake");
      }
    },
    [ensureChat, speakReply],
  );

  // Finalize a captured command after the single-shot STT ends.
  const finalizeCapture = useCallback(() => {
    if (captureTimerRef.current) {
      window.clearTimeout(captureTimerRef.current);
      captureTimerRef.current = null;
    }
    try { captureStt.stop(); } catch { /* noop */ }
    const accum = (finalAccumRef.current || captureStt.finalText || captureStt.interimText).trim();
    finalAccumRef.current = "";
    captureStt.reset();
    if (!accum || accum.length < 2) {
      // Nothing meaningful — go back to wake.
      setState("wake");
      return;
    }
    void runBrainTurn(accum);
  }, [captureStt, runBrainTurn]);

  // ── Wake word ──
  const wake = useWakeWord({
    phrases,
    cooldownMs: sentinel.cooldownMs,
    minMatchWords: sentinel.minMatchWords,
    onWake: () => {
      // Only react when we're in the WAKE phase.
      if (stateRef.current !== "wake") return;
      setState("capture");
      finalAccumRef.current = "";
      // Brief earcon via short browser beep — keep optional.
      try {
        captureStt.reset();
        captureStt.start();
      } catch (e) {
        console.warn("[AlwaysOnVoice] capture start failed", e);
        setState("wake");
        return;
      }
      // Hard timeout to avoid hanging in capture.
      captureTimerRef.current = window.setTimeout(() => {
        finalizeCapture();
      }, CAPTURE_TIMEOUT_MS);
    },
  });

  // When the capture STT ends naturally (silence), finalize.
  useEffect(() => {
    if (stateRef.current !== "capture") return;
    if (!captureStt.listening && (captureStt.finalText || finalAccumRef.current)) {
      finalizeCapture();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captureStt.listening, captureStt.finalText]);

  // Drive wake-listen on/off as the loop returns to "wake" / leaves it.
  useEffect(() => {
    if (state === "wake") {
      wake.start();
    } else {
      wake.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Master enable/disable.
  useEffect(() => {
    if (!enabled) {
      setState("paused");
      try { captureStt.stop(); } catch { /* noop */ }
      synth.stop();
      return;
    }
    if (!wake.supported) {
      toast.error("Sentinel not available", {
        description: "Your browser doesn't support continuous voice. Try Chrome or Edge on HTTPS.",
      });
      onDisable();
      return;
    }
    // Request mic up-front so wake recognizer starts cleanly.
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        // We don't keep the stream — Web Speech opens its own.
        stream.getTracks().forEach((t) => t.stop());
        setState("wake");
        toast.success("Sentinel is listening", {
          description: `Say "${(wakePhrases?.[0] ?? "hey sita")}" to start a command.`,
        });
      })
      .catch(() => {
        toast.error("Microphone permission required");
        onDisable();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      try { captureStt.stop(); } catch { /* noop */ }
      synth.stop();
      wake.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled) return null;

  const stateLabel: Record<LoopState, string> = {
    paused: "Paused",
    wake: `Listening for "${wakePhrases?.[0] ?? "Hey Sita"}"…`,
    capture: "Speak your command…",
    thinking: "Thinking…",
    speaking: "Speaking…",
  };

  const ringClass = cn(
    "relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300",
    state === "wake" && "bg-primary/20 ring-2 ring-primary/40",
    state === "capture" && "bg-primary text-primary-foreground ring-4 ring-primary/40 shadow-lg shadow-primary/40",
    state === "thinking" && "bg-muted text-muted-foreground ring-2 ring-muted-foreground/30",
    state === "speaking" && "bg-accent text-accent-foreground ring-4 ring-accent/40 shadow-lg shadow-accent/40",
    state === "paused" && "bg-muted/40 text-muted-foreground",
  );

  return (
    <div className="fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-border/60 bg-background/85 p-3 pr-4 shadow-2xl shadow-primary/10 backdrop-blur-xl">
      <div className={ringClass} aria-hidden>
        {/* Pulse */}
        {(state === "wake" || state === "capture" || state === "speaking") && (
          <span className={cn(
            "absolute inset-0 rounded-full",
            state === "wake" && "animate-ping bg-primary/20",
            state === "capture" && "animate-ping bg-primary/40",
            state === "speaking" && "animate-ping bg-accent/40",
          )} />
        )}
        <span className="relative h-2.5 w-2.5 rounded-full bg-current" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Sentinel
        </span>
        <span className="truncate text-xs text-foreground">{stateLabel[state]}</span>
        {(lastUser || lastReply) && (
          <span className="mt-0.5 line-clamp-1 max-w-[16rem] text-[11px] italic text-muted-foreground">
            {state === "thinking" || state === "capture"
              ? lastUser && `“${lastUser}”`
              : lastReply && `“${lastReply}”`}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onDisable}
        className="ml-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Turn off Sentinel"
        title="Turn off Sentinel"
      >
        <Power className="h-4 w-4" />
      </button>
    </div>
  );
}
