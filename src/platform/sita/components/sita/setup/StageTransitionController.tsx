import { ChevronRight, SkipForward, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StageTransitionControllerProps {
  onPrev: () => void;
  onNext: () => void;
  canAdvance: boolean;
  extra?: React.ReactNode;
  showSkip?: boolean;
  onSkip?: () => void;
  showRollback?: boolean;
  onRollback?: () => void;
  nextLabel?: string;
}

export function StageTransitionController({
  onPrev, onNext, canAdvance, extra, showSkip, onSkip, showRollback, onRollback, nextLabel = "Continue",
}: StageTransitionControllerProps) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        {showRollback && onRollback && (
          <button onClick={onRollback} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="h-3 w-3" /> Rollback
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {extra}
        {showSkip && onSkip && (
          <button onClick={onSkip} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="h-3.5 w-3.5" /> Skip
          </button>
        )}
        <button onClick={onNext} disabled={!canAdvance}
          className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
            canAdvance ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
          )}>
          {nextLabel} <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
