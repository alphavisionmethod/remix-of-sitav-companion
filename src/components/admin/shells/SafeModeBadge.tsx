import { cn } from "@/lib/utils";
import { Shield, ShieldCheck } from "lucide-react";
import { useSafeMode } from "./SafeModeProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SafeModeBadge({ onClick }: { onClick?: () => void }) {
  const { enabled } = useSafeMode();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold transition-all border",
              enabled
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-muted/20 text-muted-foreground border-border/30 hover:bg-muted/40"
            )}
          >
            {enabled ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
            Safe Mode {enabled ? "ON" : "OFF"}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-64 text-xs">
          {enabled ? (
            <div className="space-y-1">
              <p className="font-semibold text-emerald-400">Safe Mode Active</p>
              <ul className="text-[10px] text-muted-foreground space-y-0.5 list-disc pl-3">
                <li>All actions run in sandbox/simulation first</li>
                <li>Only canary rollouts unless explicitly expanded</li>
                <li>Destructive actions are blocked or heavily gated</li>
                <li>Automatic rollback is armed on every change</li>
                <li>Policy limits are tightened</li>
                <li>No permanent mutation without confirmation</li>
              </ul>
            </div>
          ) : (
            <p className="text-muted-foreground">Click to enable Safe Mode — sandbox-first execution, canary-only rollouts, and automatic rollback protection.</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
