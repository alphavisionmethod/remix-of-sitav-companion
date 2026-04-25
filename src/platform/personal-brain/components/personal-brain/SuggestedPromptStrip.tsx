import { Button } from "@/components/ui/button";
import { BRAIN_MODES_BY_ID, type BrainModeId } from "./BRAIN_MODES";

interface SuggestedPromptStripProps {
  mode: BrainModeId;
  onPick: (prompt: string) => void;
}

export function SuggestedPromptStrip({ mode, onPick }: SuggestedPromptStripProps) {
  const meta = BRAIN_MODES_BY_ID[mode];
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Try a starter:</p>
      <div className="flex flex-wrap gap-2">
        {meta.starters.map((s) => (
          <Button
            key={s}
            variant="outline"
            size="sm"
            onClick={() => onPick(s)}
            className="h-auto whitespace-normal py-1.5 text-left text-xs"
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}