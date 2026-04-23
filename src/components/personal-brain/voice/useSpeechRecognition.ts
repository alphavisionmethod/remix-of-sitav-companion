// ═══════════════════════════════════════════════════════════════
// Personal Brain — Web Speech API recognition hook (Phase 4)
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeechRecognitionCtor } from "./voice-capabilities";

export interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onFinalTranscript?: (text: string) => void;
  onError?: (err: string) => void;
}

export interface UseSpeechRecognition {
  supported: boolean;
  listening: boolean;
  interimText: string;
  finalText: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(
  opts: UseSpeechRecognitionOptions = {},
): UseSpeechRecognition {
  const {
    language = "en-US",
    continuous = false,
    interimResults = true,
    onFinalTranscript,
    onError,
  } = opts;

  const supported = Boolean(getSpeechRecognitionCtor());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalAccumRef = useRef("");
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const ensureRecognition = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return null;
    if (recognitionRef.current) return recognitionRef.current;
    const r = new Ctor();
    r.lang = language;
    r.continuous = continuous;
    r.interimResults = interimResults;
    r.maxAlternatives = 1;

    r.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalAccumRef.current = (finalAccumRef.current + " " + transcript).trim();
          setFinalText(finalAccumRef.current);
          onFinalTranscript?.(transcript.trim());
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
    };

    r.onerror = (ev: Event) => {
      const err = (ev as unknown as { error?: string }).error ?? "speech_error";
      setError(err);
      onError?.(err);
      setListening(false);
    };

    r.onend = () => {
      setListening(false);
      setInterimText("");
    };

    recognitionRef.current = r;
    return r;
  }, [language, continuous, interimResults, onFinalTranscript, onError]);

  const start = useCallback(() => {
    setError(null);
    finalAccumRef.current = "";
    setFinalText("");
    setInterimText("");
    const r = ensureRecognition();
    if (!r) {
      setError("not_supported");
      return;
    }
    try {
      r.start();
      setListening(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "start_failed");
    }
  }, [ensureRecognition]);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    finalAccumRef.current = "";
    setFinalText("");
    setInterimText("");
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, []);

  return { supported, listening, interimText, finalText, error, start, stop, reset };
}