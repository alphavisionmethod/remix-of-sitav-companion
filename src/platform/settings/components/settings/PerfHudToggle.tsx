// ═══════════════════════════════════════════════════════════════
// SITA OS — Portrait Perf HUD Toggle (Settings / Dev Tools)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { isPerfHudActive, togglePerfHud, startJankObserver, stopJankObserver } from "@/lib/advisors/portrait-perf-metrics";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PerfHudToggle() {
  const [active, setActive] = useState(isPerfHudActive);

  const handleToggle = () => {
    const next = togglePerfHud();
    setActive(next);
    if (next) {
      startJankObserver();
      toast.info("Perf HUD ON — portrait load times and jank are now tracked.");
    } else {
      stopJankObserver();
      toast.info("Perf HUD OFF.");
    }
  };

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Activity className="h-3 w-3" />
        Performance HUD
      </h3>
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-2 w-full rounded-xl border px-4 py-3 text-left text-xs transition-colors",
          active
            ? "border-primary/40 bg-primary/5 text-primary"
            : "border-border/30 bg-card text-muted-foreground hover:bg-secondary/30",
        )}
      >
        <Activity className={cn("h-4 w-4 shrink-0", active && "animate-pulse")} />
        <div className="flex-1">
          <p className="font-medium text-foreground">
            {active ? "Performance HUD Active" : "Show Performance HUD"}
          </p>
          <p className="text-[10px] mt-0.5 opacity-70">
            {active
              ? "Tracking portrait load time, decode time, and animation jank in real-time."
              : "Overlay showing per-portrait load/decode metrics and long-frame detection."}
          </p>
        </div>
        <div
          className={cn(
            "w-9 h-5 rounded-full relative transition-colors",
            active ? "bg-primary" : "bg-muted",
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
              active ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </div>
      </button>
    </section>
  );
}