// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Operations Home (Phase 8)
// Single landing surface for /business/revenue. Honest IA only:
// no logic moves, no pages get deleted, no metrics are invented.
// Operators see the four-tier Revenue hierarchy and jump into the
// existing surfaces via the windowed-app navigation context.
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useBusinessNavigation } from "@/contexts/BusinessNavigationContext";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import HierarchyHint, { type RevenueTier } from "@/modules/business/components/business/shared/HierarchyHint";
import { cn } from "@/lib/utils";
import {
  BarChart3, LineChart, TrendingUp, FileText, ClipboardList,
  Receipt, Banknote, Zap, ShieldCheck, Workflow, Rocket,
  ArrowUpRight, RefreshCw,
} from "lucide-react";

// ── Surface descriptors ────────────────────────────────────────

interface RevenueSurface {
  /** Module key consumed by BusinessNavigationContext + BusinessAppShell. */
  moduleKey: string;
  label: string;
  blurb: string;
  icon: typeof BarChart3;
  /** Optional honest tag clarifying the surface's role inside its tier. */
  honestRole?: string;
}

interface RevenueGroup {
  tier: RevenueTier;
  title: string;
  subtitle: string;
  surfaces: RevenueSurface[];
}

const GROUPS: RevenueGroup[] = [
  {
    tier: "insight",
    title: "Insight",
    subtitle: "See what's actually happening before you act.",
    surfaces: [
      {
        moduleKey: "revenue-forecast",
        label: "Revenue Forecast",
        blurb: "Projected revenue from open opportunities and pipelines.",
        icon: LineChart,
      },
      {
        moduleKey: "revenue-impact",
        label: "Revenue Impact",
        blurb: "Aggregated recovered + generated revenue across playbooks.",
        icon: BarChart3,
        honestRole: "Insight view",
      },
    ],
  },
  {
    tier: "workflow",
    title: "Workflow",
    subtitle: "Plan and shape revenue before it lands.",
    surfaces: [
      {
        moduleKey: "opportunities",
        label: "Opportunities",
        blurb: "Pipeline of open deals — the source of every quote and invoice.",
        icon: TrendingUp,
      },
      {
        moduleKey: "quotes",
        label: "Quotes",
        blurb: "Drafted, sent, accepted — the front door to revenue.",
        icon: FileText,
      },
      {
        moduleKey: "proposals",
        label: "Proposals",
        blurb: "Long-form contracts and statements of work.",
        icon: ClipboardList,
      },
    ],
  },
  {
    tier: "execution",
    title: "Execution",
    subtitle: "Bill, collect, and run autopilot.",
    surfaces: [
      {
        moduleKey: "invoices",
        label: "Invoices",
        blurb: "Issue, send, and track payable invoices.",
        icon: Receipt,
      },
      {
        moduleKey: "collections",
        label: "Collections",
        blurb: "Operator-led recovery on overdue invoices.",
        icon: Banknote,
      },
      {
        moduleKey: "revenue-autopilot",
        label: "Revenue Autopilot",
        blurb: "Live execution + results from autopilot policies.",
        icon: Zap,
        honestRole: "Execution view",
      },
      {
        moduleKey: "autopilot-hub",
        label: "Autopilot Hub",
        blurb: "Strategy and configuration for autopilot policies.",
        icon: Rocket,
        honestRole: "Strategy / config view",
      },
    ],
  },
  {
    tier: "result",
    title: "Result · Proof",
    subtitle: "Evidence the system actually moved revenue.",
    surfaces: [
      {
        moduleKey: "lead-recovery",
        label: "Recovered Value",
        blurb: "Closed-loop value from lead-recovery and no-show flows.",
        icon: RefreshCw,
      },
      {
        moduleKey: "proof",
        label: "Business Proof",
        blurb: "Receipts and lineage for every revenue-changing action.",
        icon: ShieldCheck,
        honestRole: "Revenue-filtered proof view",
      },
    ],
  },
];

const TIER_ACCENT: Record<RevenueTier, string> = {
  insight: "from-sky-500/15 to-sky-500/0 border-sky-500/20",
  workflow: "from-violet-500/15 to-violet-500/0 border-violet-500/20",
  execution: "from-amber-500/15 to-amber-500/0 border-amber-500/20",
  result: "from-emerald-500/15 to-emerald-500/0 border-emerald-500/20",
};

// ── Page ───────────────────────────────────────────────────────

export default function RevenueOpsHome() {
  const { navigateTo } = useBusinessNavigation();

  const open = useCallback(
    (moduleKey: string) => {
      navigateTo(moduleKey);
    },
    [navigateTo],
  );

  return (
    <div className="space-y-6 p-6">
      <PageTruthBanner
        page="RevenueOpsHome"
        domain="business"
        capabilityKey="business.revenue.home"
        truthMode="canonical"
      />

      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Revenue Operations</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            One coherent view of how revenue gets seen, planned, executed, and proven.
            Each tile opens an existing surface — no data is duplicated here.
          </p>
        </div>
        <HierarchyHint
          tier="insight"
          surface="Home"
          description="Four-tier hierarchy"
          hideBackToHome
        />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {GROUPS.map((group, idx) => (
          <motion.div
            key={group.tier}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <SitaCard
              className={cn(
                "h-full bg-gradient-to-br border",
                TIER_ACCENT[group.tier],
              )}
            >
              <div className="flex items-baseline justify-between mb-3">
                <SitaCardTitle>{group.title}</SitaCardTitle>
                <span className="text-xs text-muted-foreground capitalize">
                  {group.tier} tier
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{group.subtitle}</p>

              <ul className="space-y-2">
                {group.surfaces.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.moduleKey}>
                      <button
                        type="button"
                        onClick={() => open(s.moduleKey)}
                        className="w-full text-left rounded-md border border-border/60 bg-background/60 hover:bg-background hover:border-border transition-colors p-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Open ${s.label}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-md bg-muted/60 p-2 text-foreground/80 group-hover:text-foreground transition-colors">
                            <Icon className="h-4 w-4" aria-hidden />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium truncate">{s.label}</span>
                              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{s.blurb}</p>
                            {s.honestRole && (
                              <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/80">
                                {s.honestRole}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </SitaCard>
          </motion.div>
        ))}
      </div>

      <SitaCard className="text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <Workflow className="h-4 w-4 mt-0.5" aria-hidden />
          <p>
            <span className="font-medium text-foreground">IA only.</span>{" "}
            This Home is a reorganization of existing surfaces. No surface was
            removed; deep links continue to work. Each surface advertises its
            role via a HierarchyHint chip.
          </p>
        </div>
      </SitaCard>
    </div>
  );
}