// ═══════════════════════════════════════════════════════════════
// Shared — Demo State Banner (for embedded demo indicators)
// ═══════════════════════════════════════════════════════════════

import { Play } from "lucide-react";

interface DemoStateBannerProps {
  scenarioPack?: string;
  providerSource?: string;
  subtle?: boolean;
}

export function DemoStateBanner({ scenarioPack, providerSource, subtle = true }: DemoStateBannerProps) {
  if (subtle) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-mono">
        <Play className="h-2.5 w-2.5" />
        Demo
        {scenarioPack && <span>· {scenarioPack}</span>}
      </div>
    );
  }

  return (
    <div className="bg-primary/5 rounded-md px-3 py-2 flex items-center gap-2 text-xs">
      <Play className="h-3.5 w-3.5 text-primary/50" />
      <div>
        <span className="font-medium text-primary/70">Demo Data</span>
        {scenarioPack && <span className="text-muted-foreground ml-1">from {scenarioPack}</span>}
        {providerSource && <span className="text-muted-foreground ml-1">via {providerSource}</span>}
      </div>
    </div>
  );
}
