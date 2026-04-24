// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Embodiment Controls (Phase I)
// ═══════════════════════════════════════════════════════════════
// Compact Control Center row that lets the user pick a system voice
// for the active persona and toggle the persona→voice bridge.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Mic2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isEmbodimentEnabled,
  setEmbodimentEnabled,
  getPreferredVoiceURI,
  setPreferredVoiceURI,
  pickVoiceForActivePersona,
} from "@/lib/sita-embodiment";
import { usePersonality } from "@/lib/sita-sentience/usePersonality";

export function SitaEmbodimentControls() {
  const personality = usePersonality();
  const [enabled, setEnabled] = useState<boolean>(() => isEmbodimentEnabled());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string | null>(() => getPreferredVoiceURI());

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const refresh = () => setVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", refresh);
  }, []);

  const suggested = useMemo(() => pickVoiceForActivePersona(voices), [voices, personality.voice_persona]);

  const onToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setEmbodimentEnabled(next);
  };

  const onPickVoice = (uri: string) => {
    const next = uri === "auto" ? null : uri;
    setVoiceURI(next);
    setPreferredVoiceURI(next);
  };

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  return (
    <div className="rounded-xl bg-[hsl(0_0%_100%/0.04)] p-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center",
            enabled ? "bg-[hsl(280_70%_55%/0.22)] text-[hsl(280_70%_75%)]" : "bg-[hsl(0_0%_100%/0.05)] text-[hsl(0_0%_100%/0.4)]",
          )}>
            <Mic2 className="h-3.5 w-3.5" />
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.85)]">Embodied Voice</div>
            <div className="text-[10px] text-[hsl(0_0%_100%/0.45)]">
              {supported ? `Persona: ${personality.voice_persona}` : "Not supported in this browser"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={!supported}
          aria-pressed={enabled}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            enabled ? "bg-[hsl(280_70%_55%)]" : "bg-[hsl(0_0%_100%/0.15)]",
            !supported && "opacity-40 cursor-not-allowed",
          )}
        >
          <span className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
            enabled ? "translate-x-4" : "translate-x-0.5",
          )} />
        </button>
      </div>

      {enabled && supported && voices.length > 0 && (
        <select
          value={voiceURI ?? "auto"}
          onChange={(e) => onPickVoice(e.target.value)}
          className="w-full text-[11px] bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_100%/0.85)] rounded-md px-2 py-1.5 outline-none border border-[hsl(0_0%_100%/0.05)]"
        >
          <option value="auto">Auto (suggested: {suggested?.name ?? "system default"})</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} — {v.lang}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}