// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Voice Provider (Phase B)
// ═══════════════════════════════════════════════════════════════
// Singleton voice spine. Owns wake-word + capture lifecycle, and
// publishes presence/transcript/reply state into the Sita HUD bus
// so any UI (orb, status strip, dashboard chip) reflects truth.
//
// Captured commands are passed to a host-supplied executor through
// the global window event "sita-voice-intent" so this provider does
// not need to know about apps, launcher, or focus mode.
// ═══════════════════════════════════════════════════════════════

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useWakeWord } from "@/components/personal-brain/voice/useWakeWord";
import { useSpeechRecognition } from "@/components/personal-brain/voice/useSpeechRecognition";
import { useSpeechSynthesis } from "@/components/personal-brain/voice/useSpeechSynthesis";
import { useSentinelPrefs } from "@/components/personal-brain/voice/useSentinelPrefs";
import { publishSitaHud } from "@/components/sita/shell/sita-hud/sita-hud-bus";
import {
  routeVoiceIntent,
  type SitaIntent,
} from "@/lib/sita-voice/voice-intent-router";
import { useSitaBrainBridge } from "@/lib/sita-voice/useSitaBrainBridge";

type LoopState = "idle" | "wake" | "capture" | "thinking" | "speaking";

export interface SitaVoiceApi {
  /** True when the wake-word loop is armed. */
  armed: boolean;
  /** Toggle the wake-word loop on/off. */
  setArmed: (next: boolean) => void;
  /** Mute mic without losing arm state (e.g. meeting mode). */
  muted: boolean;
  setMuted: (next: boolean) => void;
  /** Whether the underlying browser supports STT. */
  supported: boolean;
  /** Last full transcript captured. */
  lastTranscript: string | null;
  /** Last spoken reply. */
  lastReply: string | null;
  /** Manually inject an intent (e.g. test buttons in Control Center). */
  dispatchIntent: (utterance: string) => void;
}

const SitaVoiceContext = createContext<SitaVoiceApi | null>(null);

const CAPTURE_TIMEOUT_MS = 7000;

/** Dispatch an intent on the global window bus so the host can execute. */
function emitIntent(intent: SitaIntent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("sita-voice-intent", { detail: intent }));
}

export function SitaVoiceProvider({ children }: { children: ReactNode }) {
  const { prefs: sentinel } = useSentinelPrefs();
  const synth = useSpeechSynthesis();

  // Phase B+C — brain bridge runs alongside, wired to the same window bus.
  useSitaBrainBridge();

  const [armed, setArmedState] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [state, setState] = useState<LoopState>("idle");
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [lastReply, setLastReply] = useState<string | null>(null);

  const stateRef = useRef<LoopState>("idle");
  useEffect(() => { stateRef.current = state; }, [state]);

  const captureTimerRef = useRef<number | null>(null);
  const finalAccumRef = useRef<string>("");

  // ── Single-shot capture STT ──────────────────────────────────
  const captureStt = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    onFinalTranscript: (t) => {
      finalAccumRef.current = (finalAccumRef.current + " " + t).trim();
      publishSitaHud({ transcript: finalAccumRef.current });
    },
    onError: (e) => {
      if (e !== "no-speech" && e !== "aborted") {
        console.warn("[SitaVoice] capture error", e);
      }
    },
  });

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
      setState("wake");
      publishSitaHud({ presence: "listening", status: "Listening", transcript: null });
      return;
    }
    setLastTranscript(accum);
    setState("thinking");
    publishSitaHud({ presence: "thinking", status: "Routing intent", transcript: accum });

    const intent = routeVoiceIntent(accum);
    emitIntent(intent);

    // Brain fallback is async (host edge fn); other intents are local.
    // Either way we return to wake after a short cool-down.
    window.setTimeout(() => {
      if (stateRef.current === "thinking" && armed && !muted) {
        setState("wake");
        publishSitaHud({ presence: "listening", status: "Listening" });
      }
    }, 1200);
  }, [captureStt, armed, muted]);

  // ── Wake word ────────────────────────────────────────────────
  const wake = useWakeWord({
    phrases: sentinel.phrases,
    cooldownMs: sentinel.cooldownMs,
    minMatchWords: sentinel.minMatchWords,
    onWake: () => {
      if (stateRef.current !== "wake") return;
      setState("capture");
      publishSitaHud({ presence: "listening", status: "Speak your command" });
      finalAccumRef.current = "";
      try {
        captureStt.reset();
        captureStt.start();
      } catch (e) {
        console.warn("[SitaVoice] capture start failed", e);
        setState("wake");
        return;
      }
      captureTimerRef.current = window.setTimeout(() => finalizeCapture(), CAPTURE_TIMEOUT_MS);
    },
    onTranscript: (text) => {
      // Live caption for HUD strip even before wake — only if armed.
      if (armed && !muted && stateRef.current === "wake") {
        publishSitaHud({ transcript: text });
      }
    },
  });

  // Capture STT natural end → finalize
  useEffect(() => {
    if (stateRef.current !== "capture") return;
    if (!captureStt.listening && (captureStt.finalText || finalAccumRef.current)) {
      finalizeCapture();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captureStt.listening, captureStt.finalText]);

  // Drive wake loop on/off based on state
  useEffect(() => {
    if (state === "wake") wake.start();
    else wake.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── Master arm/mute control ─────────────────────────────────
  const setArmed = useCallback((next: boolean) => {
    setArmedState(next);
    if (!next) {
      setState("idle");
      try { captureStt.stop(); } catch { /* noop */ }
      synth.stop();
      publishSitaHud({ presence: "idle", status: null, transcript: null, armed: false });
      return;
    }
    if (!wake.supported) {
      toast.error("Sita voice not available", {
        description: "This browser does not support continuous voice. Try Chrome or Edge on HTTPS.",
      });
      setArmedState(false);
      return;
    }
    publishSitaHud({ presence: "listening", status: "Listening", armed: true });
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        setState("wake");
      })
      .catch(() => {
        toast.error("Microphone permission required");
        setArmedState(false);
        publishSitaHud({ presence: "idle", status: null, armed: false });
      });
  }, [wake.supported, captureStt, synth]);

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next);
    publishSitaHud({ presence: next ? "muted" : armed ? "listening" : "idle" });
    if (next) {
      try { captureStt.stop(); } catch { /* noop */ }
      wake.stop();
    } else if (armed) {
      setState("wake");
    }
  }, [armed, captureStt, wake]);

  const dispatchIntent = useCallback((utterance: string) => {
    setLastTranscript(utterance);
    publishSitaHud({ transcript: utterance });
    const intent = routeVoiceIntent(utterance);
    emitIntent(intent);
  }, []);

  // Listen for Brain replies so HUD reflects spoken output centrally
  useEffect(() => {
    const onReply = (e: Event) => {
      const detail = (e as CustomEvent).detail as { text?: string } | undefined;
      if (!detail?.text) return;
      setLastReply(detail.text);
      publishSitaHud({ presence: "speaking", status: "Speaking", reply: detail.text });
      window.setTimeout(() => {
        if (armed && !muted) {
          setState("wake");
          publishSitaHud({ presence: "listening", status: "Listening" });
        } else {
          publishSitaHud({ presence: armed ? "listening" : "idle", status: null });
        }
      }, 1500);
    };
    window.addEventListener("sita-voice-reply", onReply);
    return () => window.removeEventListener("sita-voice-reply", onReply);
  }, [armed, muted]);

  // Cleanup
  useEffect(() => {
    return () => {
      try { captureStt.stop(); } catch { /* noop */ }
      synth.stop();
      wake.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api = useMemo<SitaVoiceApi>(() => ({
    armed,
    setArmed,
    muted,
    setMuted,
    supported: wake.supported,
    lastTranscript,
    lastReply,
    dispatchIntent,
  }), [armed, muted, wake.supported, lastTranscript, lastReply, setArmed, setMuted, dispatchIntent]);

  return (
    <SitaVoiceContext.Provider value={api}>{children}</SitaVoiceContext.Provider>
  );
}

/** Consume the singleton voice API. Returns null when used outside the provider. */
export function useSitaVoice(): SitaVoiceApi | null {
  return useContext(SitaVoiceContext);
}