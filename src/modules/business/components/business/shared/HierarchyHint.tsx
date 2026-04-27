// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Operations HierarchyHint chip (Phase 8)
// A small, honest "you are here" badge that anchors each Revenue
// surface inside the four-tier IA: Insight · Workflow · Execution
// · Result. Pure presentational — no logic, no data fetching.
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";
import { cn } from "@/lib/utils";
import { BarChart3, Workflow, Rocket, ShieldCheck, ChevronRight } from "lucide-react";

export type RevenueTier = "insight" | "workflow" | "execution" | "result";

const TIER_META: Record<
  RevenueTier,
  { label: string; icon: typeof BarChart3; tone: string; ring: string }
> = {
  insight: {
    label: "Insight",
    icon: BarChart3,
    tone: "text-sky-600 dark:text-sky-300",
    ring: "border-sky-500/30 bg-sky-500/5",
  },
  workflow: {
    label: "Workflow",
    icon: Workflow,
    tone: "text-violet-600 dark:text-violet-300",
    ring: "border-violet-500/30 bg-violet-500/5",
  },
  execution: {
    label: "Execution",
    icon: Rocket,
    tone: "text-amber-600 dark:text-amber-300",
    ring: "border-amber-500/30 bg-amber-500/5",
  },
  result: {
    label: "Result",
    icon: ShieldCheck,
    tone: "text-emerald-600 dark:text-emerald-300",
    ring: "border-emerald-500/30 bg-emerald-500/5",
  },
};

interface HierarchyHintProps {
  tier: RevenueTier;
  /** The page's display name within the tier — e.g. "Quotes", "Invoices". */
  surface: string;
  /** Optional small subtitle that clarifies the surface's role. */
  description?: string;
  /** Hide the back-to-Revenue-Home affordance when embedded inside the home itself. */
  hideBackToHome?: boolean;
  className?: string;
}

/**
 * Small status chip rendered at the top of every Revenue surface so the
 * operator always knows which slice of the Revenue hierarchy they are in.
 * Clicking the "Revenue Home" affordance navigates back via the
 * windowed-app navigation context (no router push, preserves window state).
 */
export default function HierarchyHint({
  tier,
  surface,
  description,
  hideBackToHome,
  className,
}: HierarchyHintProps) {
  const meta = TIER_META[tier];
  const Icon = meta.icon;
  const { navigateTo } = useBusinessNavigation();

  const handleHome = useCallback(() => {
    navigateTo("revenue-home");
  }, [navigateTo]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border px-3 py-1.5 text-xs",
        meta.ring,
        className,
      )}
      role="navigation"
      aria-label={`Revenue hierarchy: ${meta.label} · ${surface}`}
    >
      {!hideBackToHome && (
        <button
          type="button"
          onClick={handleHome}
          className="font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          Revenue Home
        </button>
      )}
      {!hideBackToHome && (
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" aria-hidden />
      )}
      <span className={cn("flex items-center gap-1.5 font-semibold", meta.tone)}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {meta.label}
      </span>
      <ChevronRight className="h-3 w-3 text-muted-foreground/60" aria-hidden />
      <span className="font-medium text-foreground">{surface}</span>
      {description && (
        <span className="text-muted-foreground/80 hidden sm:inline">
          · {description}
        </span>
      )}
    </div>
  );
}