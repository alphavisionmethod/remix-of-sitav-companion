// ═══════════════════════════════════════════════════════════════
// SITA OS — WhatWouldChangePanel
// Lists conditions that would alter a recommendation
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface WhatWouldChangePanelProps {
  invalidators: string[];
  className?: string;
}

export function WhatWouldChangePanel({ invalidators, className }: WhatWouldChangePanelProps) {
  if (invalidators.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        What Would Change This
      </p>
      <ul className="space-y-1">
        {invalidators.map((inv, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
            <RefreshCw className="h-3 w-3 mt-0.5 shrink-0 text-amber-400" />
            {inv}
          </li>
        ))}
      </ul>
    </div>
  );
}