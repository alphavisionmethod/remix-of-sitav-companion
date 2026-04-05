import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { replayable: boolean; className?: string }

export function ReplayabilityBadge({ replayable, className }: Props) {
  return (
    <Badge variant="outline" className={cn("text-[8px] gap-0.5", replayable ? "border-blue-500/30 text-blue-400" : "border-border/30 text-muted-foreground", className)}>
      <RotateCcw className="w-2 h-2" />{replayable ? "Replayable" : "No Replay"}
    </Badge>
  );
}
