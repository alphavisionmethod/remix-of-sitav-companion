// ═══════════════════════════════════════════════════════════════
// SITA OS — Control Center voice row (Phase B)
// ═══════════════════════════════════════════════════════════════
// Lets the user arm / mute / disable Sita voice from the global
// control center. Visible mic-state guarantee — user always knows
// whether the wake loop is hot.
// ═══════════════════════════════════════════════════════════════

import { Mic, MicOff, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSitaVoice } from "@/platform/sita/contexts/SitaVoiceContext";

export function SitaVoiceControlRow() {
  const voice = useSitaVoice();
  if (!voice) return null;

  const armed = voice.armed;
  const muted = voice.muted;

  const stateLabel = !voice.supported
    ? "Not supported in this browser"
    : !armed
    ? "Off"
    : muted
    ? "Muted"
    : "Listening for wake phrase";

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              armed && !muted && "bg-primary text-primary-foreground",
              armed && muted && "bg-muted text-muted-foreground",
              !armed && "bg-muted/40 text-muted-foreground",
            )}
            aria-hidden
          >
            {armed && !muted ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">Sita</div>
            <div className="truncate text-[11px] text-muted-foreground">{stateLabel}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => voice.setMuted(!muted)}
            disabled={!armed}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              "border border-border/60",
              muted
                ? "bg-muted text-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground",
              !armed && "cursor-not-allowed opacity-50",
            )}
          >
            {muted ? "Unmute" : "Mute"}
          </button>
          <button
            type="button"
            onClick={() => voice.setArmed(!armed)}
            disabled={!voice.supported}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              armed
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border/60 text-foreground hover:bg-muted",
              !voice.supported && "cursor-not-allowed opacity-50",
            )}
          >
            <Power className="h-3 w-3" />
            {armed ? "Disarm" : "Arm"}
          </button>
        </div>
      </div>
    </div>
  );
}