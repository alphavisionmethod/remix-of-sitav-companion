// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Cortex Controls (Phase G)
// ═══════════════════════════════════════════════════════════════
// Control Center row exposing ambient listening, missions, and
// journal toggles. All flags are opt-in and persist to localStorage.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Brain, Ear, Target, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  startAmbientListening,
  stopAmbientListening,
  isAmbientActive,
  subscribeAmbient,
} from "@/lib/sita-cortex/ambient-listener";

const LS_KEY = "sita.cortex.flags.v1";

interface CortexFlags {
  ambient: boolean;
  missions: boolean;
  journal: boolean;
  council: boolean;
}

const DEFAULTS: CortexFlags = { ambient: false, missions: true, journal: true, council: true };

function loadFlags(): CortexFlags {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
}

function saveFlags(f: CortexFlags) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(f)); } catch { /* noop */ }
}

export function SitaCortexControls() {
  const [flags, setFlags] = useState<CortexFlags>(() => loadFlags());
  const [ambientLive, setAmbientLive] = useState(isAmbientActive());

  useEffect(() => subscribeAmbient(setAmbientLive), []);

  useEffect(() => {
    saveFlags(flags);
    if (flags.ambient && !isAmbientActive()) {
      void startAmbientListening();
    } else if (!flags.ambient && isAmbientActive()) {
      stopAmbientListening();
    }
  }, [flags]);

  const toggle = (k: keyof CortexFlags) => setFlags((f) => ({ ...f, [k]: !f[k] }));

  const tiles = [
    { id: "ambient", label: "Ambient", sub: ambientLive ? "Listening" : "Off", icon: <Ear className="h-3.5 w-3.5" />, active: flags.ambient, onClick: () => toggle("ambient") },
    { id: "missions", label: "Missions", sub: flags.missions ? "On" : "Off", icon: <Target className="h-3.5 w-3.5" />, active: flags.missions, onClick: () => toggle("missions") },
    { id: "journal", label: "Journal", sub: flags.journal ? "On" : "Off", icon: <BookOpen className="h-3.5 w-3.5" />, active: flags.journal, onClick: () => toggle("journal") },
    { id: "council", label: "Council", sub: flags.council ? "Active" : "Off", icon: <Sparkles className="h-3.5 w-3.5" />, active: flags.council, onClick: () => toggle("council") },
  ];

  return (
    <div className="rounded-xl bg-[hsl(0_0%_100%/0.04)] p-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <Brain className="h-3.5 w-3.5 text-[hsl(265_55%_65%)]" />
        <span className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.7)]">Sita Cortex</span>
        {ambientLive && (
          <span className="ml-auto flex items-center gap-1 text-[8px] text-[hsl(0_70%_60%)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(0_70%_55%)] animate-pulse" /> REC
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {tiles.map((t) => (
          <button
            key={t.id}
            onClick={t.onClick}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-150",
              t.active
                ? "bg-[hsl(265_55%_55%/0.22)] text-[hsl(265_55%_75%)]"
                : "bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_100%/0.4)] hover:bg-[hsl(0_0%_100%/0.07)]",
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center",
              t.active ? "bg-[hsl(265_55%_55%)]" : "bg-[hsl(0_0%_100%/0.08)]",
            )}>
              <span className={t.active ? "text-white" : ""}>{t.icon}</span>
            </div>
            <span className="text-[8px] font-medium leading-tight text-center">{t.label}</span>
            <span className="text-[7px] opacity-60 leading-tight">{t.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Read-only helper: are ambient/council/etc. enabled? */
export function readCortexFlags(): CortexFlags {
  return loadFlags();
}