// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain bridge (Phase B + C)
// ═══════════════════════════════════════════════════════════════
// Listens for "sita-voice-brain-request" events emitted by the
// voice-intent bridge, calls the personal-brain edge function with
// the user's utterance + (Phase C) the focused-window context, and
// emits "sita-voice-reply" with the spoken reply so the HUD bus
// can reflect speaking state.
//
// Speech is delegated to browser TTS for now (cloud TTS already
// runs from the Brain dashboard when that route is active).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSpeechSynthesis } from "@/platform/personal-brain/components/personal-brain/voice/useSpeechSynthesis";

interface BrainRequestDetail {
  utterance: string;
  instruction?: string;
  screenContext?: string;
}

export function useSitaBrainBridge() {
  const { user } = useAuth();
  const synth = useSpeechSynthesis();
  const inFlightRef = useRef(false);
  const chatIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handler = async (event: Event) => {
      const detail = (event as CustomEvent<BrainRequestDetail>).detail;
      if (!detail?.utterance || !user) return;
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (!token) throw new Error("not_signed_in");

        // Reuse a long-lived "Sita voice session" chat for context.
        if (!chatIdRef.current) {
          const { data } = await supabase
            .from("pb_chats")
            .insert({ user_id: user.id, title: "Sita voice session", mode: "think" })
            .select()
            .maybeSingle();
          if (data) chatIdRef.current = data.id;
        }
        const cid = chatIdRef.current;
        if (!cid) throw new Error("no_chat");

        const sysParts: string[] = [];
        if (detail.instruction) sysParts.push(detail.instruction);
        if (detail.screenContext) sysParts.push(detail.screenContext);

        const messages: Array<{ role: string; content: string }> = [];
        if (sysParts.length > 0) {
          messages.push({ role: "system", content: sysParts.join("\n\n") });
        }
        messages.push({ role: "user", content: detail.utterance });

        const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/personal-brain`;
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ messages, mode: "think", chatId: cid }),
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
              if (delta) assembled += delta;
            } catch { /* noop */ }
          }
        }

        if (assembled.trim()) {
          window.dispatchEvent(new CustomEvent("sita-voice-reply", {
            detail: { text: assembled },
          }));
          synth.speak(assembled, { rate: 1, pitch: 1 });
        }
      } catch (err) {
        console.warn("[SitaBrainBridge] turn failed", err);
      } finally {
        inFlightRef.current = false;
      }
    };
    window.addEventListener("sita-voice-brain-request", handler);
    return () => window.removeEventListener("sita-voice-brain-request", handler);
  }, [user, synth]);
}