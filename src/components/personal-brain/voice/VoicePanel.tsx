// ═══════════════════════════════════════════════════════════════
// Personal Brain — Voice conversation panel (Phase 4)
// ═══════════════════════════════════════════════════════════════
// Full-screen overlay for hands-free voice chat with the Brain.
// Modes: Push-to-talk (hold orb) and Hands-free (tap to start, VAD-ish).
// Uses Web Speech API for STT (continuous in hands-free) and either
// browser speechSynthesis or ElevenLabs cloud TTS for replies.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Settings2, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { VoiceOrb, type VoiceOrbState } from "./VoiceOrb";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { useCloudVoice } from "./useCloudVoice";
import { usePbVoicePrefs } from "./usePbVoicePrefs";
import { probeVoiceCapabilities } from "./voice-capabilities";
import { BRAIN_MODES_BY_ID, type BrainModeId } from "../BRAIN_MODES";

interface VoicePanelProps {
  /** Optional pre-existing chat to continue. If omitted, a new chat is created on first turn. */
  initialChatId?: string;
  /** Mode to use for this voice session. Defaults to 'think'. */
  initialMode?: BrainModeId;
  /** Called when user closes the panel. */
  onClose: () => void;
}

type Turn = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function VoicePanel({ initialChatId, initialMode = "think", onClose }: VoicePanelProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { prefs, update: updatePrefs } = usePbVoicePrefs();
  const caps = useMemo(probeVoiceCapabilities, []);
  const synth = useSpeechSynthesis();
  const cloud = useCloudVoice();

  const [chatId, setChatId] = useState<string | null>(initialChatId ?? null);
  const [mode] = useState<BrainModeId>(initialMode);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [orbState, setOrbState] = useState<VoiceOrbState>("idle");
  const [muted, setMuted] = useState(false);

  const handsFree = (prefs?.input_mode ?? "ptt") === "handsfree";

  const sendingRef = useRef(false);
  const handsFreeAutoRestartRef = useRef(false);

  const stt = useSpeechRecognition({
    continuous: handsFree,
    interimResults: true,
    onError: (e) => {
      if (e !== "no-speech" && e !== "aborted") {
        toast.error("Voice error", { description: e });
      }
    },
  });

  // Push final transcripts → Brain when in hands-free mode (auto-send on natural pause)
  useEffect(() => {
    if (!handsFree) return;
    if (!stt.finalText || sendingRef.current) return;
    const text = stt.finalText.trim();
    if (text.length < 2) return;
    void handleUserTurn(text);
    stt.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stt.finalText, handsFree]);

  // Mirror orb state from underlying activity
  useEffect(() => {
    if (sendingRef.current) {
      setOrbState("thinking");
      return;
    }
    if (synth.speaking) {
      setOrbState("speaking");
      return;
    }
    if (stt.listening) {
      setOrbState("listening");
      return;
    }
    setOrbState("idle");
  }, [stt.listening, synth.speaking]);

  const ensureChat = useCallback(async (): Promise<string | null> => {
    if (chatId) return chatId;
    if (!user) return null;
    const { data, error } = await supabase
      .from("pb_chats")
      .insert({ user_id: user.id, title: "Voice session", mode })
      .select()
      .single();
    if (error || !data) {
      toast.error("Could not start chat");
      return null;
    }
    setChatId(data.id);
    return data.id;
  }, [chatId, user, mode]);

  const speakReply = useCallback(
    async (text: string) => {
      if (muted) return;
      // Try cloud TTS first if user opted in; fall back to browser.
      if (prefs?.use_cloud_stt) {
        const res = await cloud.tts(text, prefs?.voice_id);
        if (res.ok && res.audio_base64) {
          try {
            await cloud.playBase64Audio(res.audio_base64, res.mime_type ?? "audio/mpeg");
            return;
          } catch {
            /* fall through */
          }
        }
      }
      synth.speak(text, { rate: prefs?.rate ?? 1, pitch: prefs?.pitch ?? 1 });
    },
    [muted, prefs, cloud, synth],
  );

  const handleUserTurn = useCallback(
    async (text: string) => {
      if (!text.trim() || sendingRef.current) return;
      sendingRef.current = true;
      const turnId = `t-${Date.now()}`;
      setTurns((prev) => [...prev, { id: `${turnId}-u`, role: "user", content: text }]);
      setOrbState("thinking");

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
            messages: [...turns.map((t) => ({ role: t.role, content: t.content })), { role: "user", content: text }],
            mode,
            chatId: cid,
          }),
        });
        if (!resp.ok || !resp.body) throw new Error(await resp.text() || "stream_error");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assembled = "";
        const aId = `${turnId}-a`;
        setTurns((prev) => [...prev, { id: aId, role: "assistant", content: "" }]);

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
                setTurns((prev) => prev.map((p) => (p.id === aId ? { ...p, content: assembled } : p)));
              }
            } catch {
              /* ignore */
            }
          }
        }

        if (assembled.trim()) await speakReply(assembled);
      } catch (e) {
        toast.error("Voice turn failed", { description: e instanceof Error ? e.message : String(e) });
      } finally {
        sendingRef.current = false;
        // Hands-free: resume listening automatically after reply
        if (handsFree && handsFreeAutoRestartRef.current) {
          setTimeout(() => stt.start(), 600);
        }
      }
    },
    [turns, mode, ensureChat, speakReply, handsFree, stt],
  );

  // ── PTT handlers ──
  const handlePttDown = () => {
    if (handsFree) return;
    if (!stt.supported) {
      toast.error("Voice not supported in this browser");
      return;
    }
    stt.reset();
    stt.start();
  };
  const handlePttUp = async () => {
    if (handsFree) return;
    if (!stt.listening) return;
    stt.stop();
    // Wait a tick for finalText to settle
    setTimeout(() => {
      const text = (stt.finalText || stt.interimText).trim();
      if (text) void handleUserTurn(text);
      stt.reset();
    }, 250);
  };

  // ── Hands-free handlers ──
  const toggleHandsFree = () => {
    if (!stt.supported) {
      toast.error("Voice not supported in this browser");
      return;
    }
    if (stt.listening) {
      handsFreeAutoRestartRef.current = false;
      stt.stop();
    } else {
      handsFreeAutoRestartRef.current = true;
      stt.start();
    }
  };

  const setInputMode = (m: "ptt" | "handsfree") => {
    if (stt.listening) stt.stop();
    handsFreeAutoRestartRef.current = false;
    void updatePrefs({ input_mode: m });
  };

  // Stop everything on unmount
  useEffect(() => {
    return () => {
      stt.stop();
      synth.stop();
      handsFreeAutoRestartRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = BRAIN_MODES_BY_ID[mode];
  const liveText = stt.interimText || stt.finalText;

  if (!caps.speechRecognition && !caps.speechSynthesis) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/95 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold">Voice not available</h2>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Your browser doesn't support the Web Speech API. Try Chrome, Edge, or Safari on a secure (HTTPS) origin.
        </p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
          Close
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] capitalize">{meta.label} mode</Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute replies" : "Mute replies"}
            title={muted ? "Unmute replies" : "Mute replies"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/personal-brain/voice-settings")} aria-label="Voice settings">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center border-b border-border p-3">
        <ToggleGroup
          type="single"
          value={prefs?.input_mode ?? "ptt"}
          onValueChange={(v) => v && setInputMode(v as "ptt" | "handsfree")}
          className="rounded-lg border border-border bg-card p-0.5"
        >
          <ToggleGroupItem value="ptt" className="h-8 px-3 text-xs">Push-to-talk</ToggleGroupItem>
          <ToggleGroupItem value="handsfree" className="h-8 px-3 text-xs">Hands-free</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Conversation history */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {turns.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {handsFree ? "Tap the orb to start a hands-free conversation." : "Hold the orb and speak."}
          </div>
        )}
        {turns.map((t) => (
          <div key={t.id} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                t.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {t.content || (t.role === "assistant" && sendingRef.current ? <Loader2 className="h-4 w-4 animate-spin" /> : null)}
            </div>
          </div>
        ))}
      </div>

      {/* Live transcript */}
      <div className="min-h-[3.5rem] border-t border-border px-6 py-3 text-center text-sm text-muted-foreground">
        {liveText ? <span className="italic">"{liveText}"</span> : <span className="opacity-50">Listening will appear here…</span>}
      </div>

      {/* Orb controls */}
      <div className="flex flex-col items-center gap-3 border-t border-border p-6">
        <VoiceOrb
          state={orbState}
          size="lg"
          onClick={handsFree ? toggleHandsFree : undefined}
          onPointerDown={!handsFree ? handlePttDown : undefined}
          onPointerUp={!handsFree ? handlePttUp : undefined}
          onPointerLeave={!handsFree ? handlePttUp : undefined}
          ariaLabel={handsFree ? (stt.listening ? "Stop listening" : "Start listening") : "Hold to talk"}
        />
        <p className="text-xs text-muted-foreground">
          {handsFree
            ? stt.listening ? "Listening — tap orb to stop" : "Tap orb to start"
            : "Hold to talk · Release to send"}
        </p>
      </div>
    </div>
  );
}