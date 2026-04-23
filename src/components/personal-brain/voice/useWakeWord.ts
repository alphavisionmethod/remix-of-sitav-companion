// ═══════════════════════════════════════════════════════════════
// Personal Brain — Wake-word listener (Phase 7)
// ═══════════════════════════════════════════════════════════════
// Continuous Web Speech recognition that scans interim transcripts
// for one of several wake phrases. Fires `onWake` exactly once per
// detection (with a short cooldown) so the orchestrator can switch
// to a focused command-capture phase. Designed to auto-restart on
// browser-driven `onend` events so it stays "always on".
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeechRecognitionCtor } from "./voice-capabilities";

export interface UseWakeWordOptions {
  /** Wake phrases (lowercase, no punctuation). Default: ["hey sita", "hey sentinel"]. */
  phrases?: string[];
  /** Language hint for the underlying recognizer. */
  language?: string;
  /** Minimum ms between two consecutive wakes. */
  cooldownMs?: number;
  /** Whether to auto-start on mount. */
  autoStart?: boolean;
  /** Called when one of the wake phrases is detected in a transcript. */
  onWake?: (matchedPhrase: string, fullTranscript: string) => void;
}

export interface UseWakeWord {
  supported: boolean;
  active: boolean;
  lastWakeAt: number | null;
  start: () => void;
  stop: () => void;
}

const DEFAULT_PHRASES = ["hey sita", "hey sentinel", "hey jarvis"];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

export function useWakeWord(opts: UseWakeWordOptions = {}): UseWakeWord {
  const {
    phrases = DEFAULT_PHRASES,
    language = "en-US",
    cooldownMs = 2500,
    autoStart = false,
    onWake,
  } = opts;

  const supported = Boolean(getSpeechRecognitionCtor());
  const recRef = useRef<SpeechRecognition | null>(null);
  const wantActiveRef = useRef(false);
  const lastWakeRef = useRef<number>(0);
  const restartTimerRef = useRef<number | null>(null);
  const onWakeRef = useRef(onWake);
  const phrasesRef = useRef(phrases);

  const [active, setActive] = useState(false);
  const [lastWakeAt, setLastWakeAt] = useState<number | null>(null);

  useEffect(() => {
    onWakeRef.current = onWake;
  }, [onWake]);
  useEffect(() => {
    phrasesRef.current = phrases.map(normalize).filter(Boolean);
  }, [phrases]);

  const teardown = useCallback(() => {
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    const r = recRef.current;
    if (r) {
      try { r.onresult = null; r.onerror = null; r.onend = null; } catch { /* noop */ }
      try { r.abort(); } catch { /* noop */ }
    }
    recRef.current = null;
  }, []);

  const buildRecognizer = useCallback((): SpeechRecognition | null => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return null;
    const r = new Ctor();
    r.lang = language;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (event: SpeechRecognitionEvent) => {
      const list = phrasesRef.current;
      if (list.length === 0) return;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = normalize(event.results[i]?.[0]?.transcript ?? "");
        if (!transcript) continue;
        const matched = list.find((p) => transcript.includes(p));
        if (!matched) continue;
        const now = Date.now();
        if (now - lastWakeRef.current < cooldownMs) return;
        lastWakeRef.current = now;
        setLastWakeAt(now);
        try { onWakeRef.current?.(matched, transcript); } catch { /* noop */ }
        // Stop this recognizer so the orchestrator can take the mic.
        try { r.stop(); } catch { /* noop */ }
        return;
      }
    };

    r.onerror = (ev: Event) => {
      const err = (ev as unknown as { error?: string }).error ?? "wake_error";
      // `not-allowed` = mic permission denied → stop trying.
      if (err === "not-allowed" || err === "service-not-allowed") {
        wantActiveRef.current = false;
        setActive(false);
      }
    };

    r.onend = () => {
      setActive(false);
      // Auto-restart loop if still wanted (fires after every utterance ends).
      if (wantActiveRef.current) {
        restartTimerRef.current = window.setTimeout(() => {
          if (!wantActiveRef.current) return;
          try {
            r.start();
            setActive(true);
          } catch {
            // already started or transient — try a fresh recognizer next tick.
            teardown();
            const fresh = buildRecognizer();
            if (fresh) {
              recRef.current = fresh;
              try { fresh.start(); setActive(true); } catch { /* noop */ }
            }
          }
        }, 250);
      }
    };

    return r;
  }, [language, cooldownMs, teardown]);

  const start = useCallback(() => {
    if (!supported) return;
    wantActiveRef.current = true;
    if (recRef.current) {
      try { recRef.current.start(); setActive(true); } catch { /* already running */ }
      return;
    }
    const r = buildRecognizer();
    if (!r) return;
    recRef.current = r;
    try { r.start(); setActive(true); } catch { /* noop */ }
  }, [supported, buildRecognizer]);

  const stop = useCallback(() => {
    wantActiveRef.current = false;
    teardown();
    setActive(false);
  }, [teardown]);

  useEffect(() => {
    if (autoStart) start();
    return () => { stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { supported, active, lastWakeAt, start, stop };
}
