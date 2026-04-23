import { useState } from "react";
import { Check, MoreVertical, Pause, Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { PbMemory, PbMemoryStatus } from "./hooks/usePbMemories";

interface Props {
  memory: PbMemory;
  onToggle: (id: string, status: PbMemoryStatus) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onApprove?: (id: string) => Promise<void> | void;
}

export function MemoryRow({ memory, onToggle, onDelete, onApprove }: Props) {
  const [busy, setBusy] = useState(false);
  const conf = Math.round(Number(memory.confidence) * 100);
  const isInferred = memory.kind === "inferred";
  const isDisabled = memory.status === "disabled";
  const isPending = memory.status === "pending";

  const wrap = async (fn: () => Promise<void> | void) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-3 transition-opacity",
        isDisabled && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] capitalize">
            {memory.category.replace(/_/g, " ")}
          </Badge>
          <Badge
            variant={isInferred ? "secondary" : "default"}
            className="text-[10px]"
          >
            {isInferred ? "inferred" : "explicit"}
          </Badge>
          {isPending && (
            <Badge variant="outline" className="border-amber-500/40 text-[10px] text-amber-600 dark:text-amber-400">
              pending review
            </Badge>
          )}
          {isDisabled && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              paused
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={busy}>
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {isPending && onApprove && (
              <DropdownMenuItem onClick={() => void wrap(() => onApprove(memory.id))}>
                <Check className="mr-2 h-4 w-4" /> Approve
              </DropdownMenuItem>
            )}
            {!isPending && (
              isDisabled ? (
                <DropdownMenuItem onClick={() => void wrap(() => onToggle(memory.id, "active"))}>
                  <Play className="mr-2 h-4 w-4" /> Resume
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => void wrap(() => onToggle(memory.id, "disabled"))}>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </DropdownMenuItem>
              )
            )}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => void wrap(() => onDelete(memory.id))}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{memory.content}</p>
      {isInferred && (
        <div className="mt-2.5 flex items-center gap-2">
          <Progress value={conf} className="h-1 flex-1" />
          <span className="text-[10px] tabular-nums text-muted-foreground">{conf}%</span>
        </div>
      )}
    </div>
  );
}
