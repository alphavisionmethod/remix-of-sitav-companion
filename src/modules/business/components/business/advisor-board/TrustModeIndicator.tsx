import { Shield, Pause, Play } from "lucide-react";
import { AUTONOMY_LEVELS, type TrustModeState } from "@/domains/engines/business-autonomy-engine";
import { Button } from "@/components/ui/button";

interface Props {
  state: TrustModeState;
  onTogglePause: () => void;
}

export function TrustModeIndicator({ state, onTogglePause }: Props) {
  const cfg = AUTONOMY_LEVELS[state.globalLevel];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)]">
      <Shield className="h-3 w-3" style={{ color: `hsl(${cfg.color})` }} />
      <span className="text-[9px] font-semibold" style={{ color: `hsl(${cfg.color})` }}>
        L{state.globalLevel} · {cfg.label}
      </span>
      {state.emergencyPaused && (
        <span className="text-[8px] font-bold text-[hsl(0_65%_50%)] animate-pulse">PAUSED</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 ml-1"
        onClick={onTogglePause}
      >
        {state.emergencyPaused ? (
          <Play className="h-2.5 w-2.5 text-[hsl(152_55%_48%)]" />
        ) : (
          <Pause className="h-2.5 w-2.5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
