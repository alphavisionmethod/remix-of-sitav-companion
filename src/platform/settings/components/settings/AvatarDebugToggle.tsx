// ═══════════════════════════════════════════════════════════════
// SITA OS — Avatar Debug Toggle (Settings / Dev Tools)
// Lets devs force-break all avatar URLs to verify:
//   • Skeleton shimmer during loading
//   • Exponential retry backoff (800ms → 1.5s → 3s)
//   • Graceful fallback to domain icon after 3 retries
//   • Failure analytics logging
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { isAvatarDebugActive, toggleAvatarDebug } from "@/lib/advisors/avatar-debug";
import { Bug, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AvatarDebugToggle() {
  const [active, setActive] = useState(isAvatarDebugActive);

  const handleToggle = () => {
    const next = toggleAvatarDebug();
    setActive(next);
    toast.info(
      next
        ? "Avatar debug ON — all portraits will 404. Reload the page to see shimmer → retry → fallback."
        : "Avatar debug OFF — portraits restored. Reload to apply.",
    );
  };

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Bug className="h-3 w-3" />
        Avatar Debug
      </h3>
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-2 w-full rounded-xl border px-4 py-3 text-left text-xs transition-colors",
          active
            ? "border-destructive/40 bg-destructive/5 text-destructive"
            : "border-border/30 bg-card text-muted-foreground hover:bg-secondary/30",
        )}
      >
        <AlertTriangle className={cn("h-4 w-4 shrink-0", active && "animate-pulse")} />
        <div className="flex-1">
          <p className="font-medium text-foreground">
            {active ? "Broken Avatars Active" : "Force-Break Avatars"}
          </p>
          <p className="text-[10px] mt-0.5 opacity-70">
            {active
              ? "All portraits return 404. Skeleton → retry (×3) → fallback icon. Reload page to see full cycle."
              : "Replace every portrait URL with a 404 to test loading states and fallback rendering."}
          </p>
        </div>
        <div
          className={cn(
            "w-9 h-5 rounded-full relative transition-colors",
            active ? "bg-destructive" : "bg-muted",
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