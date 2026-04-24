// ═══════════════════════════════════════════════════════════════
// SITA OS — Personality Controls (Phase H)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersonality } from "@/lib/sita-sentience/usePersonality";
import type { SitaPersona } from "@/lib/sita-sentience/personality";

const PERSONAS: { id: SitaPersona; label: string }[] = [
  { id: "sita", label: "Sita" },
  { id: "jarvis", label: "Jarvis" },
  { id: "warm", label: "Warm" },
  { id: "terse", label: "Terse" },
];

export function SitaPersonalityControls() {
  const { personality, update } = usePersonality();
  const [busy, setBusy] = useState(false);

  const setPersona = async (id: SitaPersona) => {
    setBusy(true);
    try { await update({ voice_persona: id }); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl bg-[hsl(0_0%_100%/0.04)] p-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <Heart className="h-3.5 w-3.5 text-[hsl(345_70%_65%)]" />
        <span className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.7)]">Persona</span>
        <Sparkles className="ml-auto h-3 w-3 text-[hsl(265_55%_65%)]" />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {PERSONAS.map((p) => {
          const active = personality.voice_persona === p.id;
          return (
            <button
              key={p.id}
              disabled={busy}
              onClick={() => setPersona(p.id)}
              className={cn(
                "px-2 py-1.5 rounded-lg text-[10px] font-medium transition",
                active
                  ? "bg-[hsl(345_70%_55%/0.22)] text-[hsl(345_70%_75%)]"
                  : "bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_100%/0.45)] hover:bg-[hsl(0_0%_100%/0.07)]",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}