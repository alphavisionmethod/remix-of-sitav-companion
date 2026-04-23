// ═══════════════════════════════════════════════════════════════
// Personal Brain — Cloud STT/TTS bridge (Phase 4)
// ═══════════════════════════════════════════════════════════════
// Routes through `personal-brain` edge function which falls back to
// browser APIs gracefully when ELEVENLABS_API_KEY is not configured.
// Both calls return `{ use_browser: true }` in fallback mode so the
// caller can degrade to Web Speech without a separate code path.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CloudTranscribeResult {
  ok: boolean;
  use_browser?: boolean;
  text?: string;
  language?: string;
  duration_ms?: number;
  reason?: string;
}

export interface CloudTtsResult {
  ok: boolean;
  use_browser?: boolean;
  audio_base64?: string;
  mime_type?: string;
  reason?: string;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function useCloudVoice() {
  const [transcribing, setTranscribing] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);

  const transcribe = useCallback(async (audio: Blob, language?: string): Promise<CloudTranscribeResult> => {
    setTranscribing(true);
    try {
      const audio_base64 = await blobToBase64(audio);
      const { data, error } = await supabase.functions.invoke("personal-brain", {
        body: {
          action: "voice.transcribe",
          payload: {
            audio_base64,
            mime_type: audio.type || "audio/webm",
            language,
          },
        },
      });
      if (error) return { ok: false, use_browser: true, reason: error.message };
      return (data as CloudTranscribeResult) ?? { ok: false, use_browser: true };
    } catch (e) {
      return { ok: false, use_browser: true, reason: e instanceof Error ? e.message : "transcribe_failed" };
    } finally {
      setTranscribing(false);
    }
  }, []);

  const tts = useCallback(async (text: string, voiceId?: string): Promise<CloudTtsResult> => {
    setSynthesizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("personal-brain", {
        body: {
          action: "voice.tts",
          payload: { text, voice_id: voiceId },
        },
      });
      if (error) return { ok: false, use_browser: true, reason: error.message };
      return (data as CloudTtsResult) ?? { ok: false, use_browser: true };
    } catch (e) {
      return { ok: false, use_browser: true, reason: e instanceof Error ? e.message : "tts_failed" };
    } finally {
      setSynthesizing(false);
    }
  }, []);

  const playBase64Audio = useCallback(async (base64: string, mime = "audio/mpeg") => {
    const audioUrl = `data:${mime};base64,${base64}`;
    const audio = new Audio(audioUrl);
    await audio.play();
    return audio;
  }, []);

  return { transcribe, tts, transcribing, synthesizing, playBase64Audio };
}