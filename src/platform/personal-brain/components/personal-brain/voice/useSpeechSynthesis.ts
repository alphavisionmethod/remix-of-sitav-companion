// ═══════════════════════════════════════════════════════════════
// Personal Brain — Speech synthesis hook (Phase 4)
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";

export interface SpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  language?: string;
}

export interface UseSpeechSynthesis {
  supported: boolean;
  speaking: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string, opts?: SpeechSynthesisOptions) => void;
  stop: () => void;
}

function stripMarkdownForTts(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " (code block) ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~>#]+/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function useSpeechSynthesis(): UseSpeechSynthesis {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) return;
    const refresh = () => setVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.onvoiceschanged = refresh;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, opts: SpeechSynthesisOptions = {}) => {
      if (!supported || !text) return;
      const cleaned = stripMarkdownForTts(text);
      if (!cleaned) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(cleaned);
      u.rate = opts.rate ?? 1;
      u.pitch = opts.pitch ?? 1;
      u.lang = opts.language ?? "en-US";
      if (opts.voiceURI) {
        const match = voices.find((v) => v.voiceURI === opts.voiceURI);
        if (match) u.voice = match;
      }
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    },
    [supported, voices],
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  return { supported, speaking, voices, speak, stop };
}