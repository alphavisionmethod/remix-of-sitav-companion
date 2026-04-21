// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Avatar Preview (Settings section)
// Shows Business, Money, and Concierge portraits in light/dark.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { AdvisorImage, type AdvisorDomain } from "@/components/advisors/AdvisorImage";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const PREVIEW_ADVISORS: { domain: AdvisorDomain; label: string }[] = [
  { domain: "business", label: "Business" },
  { domain: "money", label: "Money" },
  { domain: "concierge", label: "Concierge" },
];

export function AdvisorAvatarPreview() {
  const [previewDark, setPreviewDark] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Advisor Portraits
        </h3>
        <button
          onClick={() => setPreviewDark((d) => !d)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg border border-border/30"
        >
          {previewDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
          {previewDark ? "Dark" : "Light"}
        </button>
      </div>
      <div
        className={cn(
          "rounded-2xl border p-6 transition-colors duration-300",
          previewDark
            ? "bg-[hsl(240_10%_8%)] border-[hsl(240_5%_18%)]"
            : "bg-[hsl(0_0%_98%)] border-[hsl(0_0%_90%)]",
        )}
      >
        <div className="flex items-center justify-center gap-8">
          {PREVIEW_ADVISORS.map(({ domain, label }) => (
            <div key={domain} className="flex flex-col items-center gap-2">
              <AdvisorImage domain={domain} size="xl" />
              <span
                className={cn(
                  "text-xs font-medium",
                  previewDark ? "text-[hsl(0_0%_70%)]" : "text-[hsl(0_0%_40%)]",
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}