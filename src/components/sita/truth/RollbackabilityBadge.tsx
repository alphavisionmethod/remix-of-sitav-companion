import { Badge } from "@/components/ui/badge";
import { Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { rollbackable: boolean; className?: string }

export function RollbackabilityBadge({ rollbackable, className }: Props) {
  return (
    <Badge variant="outline" className={cn("text-[8px] gap-0.5", rollbackable ? "border-green-500/30 text-green-400" : "border-border/30 text-muted-foreground", className)}>
      <Undo2 className="w-2 h-2" />{rollbackable ? "Rollback" : "No Rollback"}
    </Badge>
  );
}
