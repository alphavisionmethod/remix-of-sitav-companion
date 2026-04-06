// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Boardroom
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { TrendingUp, DollarSign, Users, Home, Brain, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const briefings = [
  {
    domain: "Business",
    icon: TrendingUp,
    summary: "Revenue up 12% MTD. 3 deals in closing stage worth $28K. 2 customers flagged for churn risk.",
    kpis: [
      { label: "Pipeline", value: "$142K" },
      { label: "Win Rate", value: "34%" },
      { label: "Churn Risk", value: "2" },
    ],
    accent: "text-primary" as const,
  },
  {
    domain: "Finance",
    icon: DollarSign,
    summary: "Cash position healthy. $8,240 safe-to-spend. 2 subscriptions flagged for waste ($4,200/yr savings).",
    kpis: [
      { label: "Cash", value: "$39.5K" },
      { label: "Reserves", value: "72%" },
      { label: "Waste", value: "$4.2K" },
    ],
    accent: "text-[hsl(var(--trust-safe))]" as const,
  },
  {
    domain: "Household",
    icon: Home,
    summary: "6 active tasks, 1 overdue. Calendar conflict Thursday. Grocery list auto-generated for weekend.",
    kpis: [
      { label: "Tasks", value: "6" },
      { label: "Overdue", value: "1" },
      { label: "Balance", value: "78%" },
    ],
    accent: "text-[hsl(var(--trust-review))]" as const,
  },
];

const MobileBoardroom = () => (
  <MobileShell title="Boardroom">
    <div className="flex items-center gap-2 mb-4">
      <Brain className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-semibold">Morning Briefing</h2>
      <span className="text-[10px] text-muted-foreground ml-auto">
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
      </span>
    </div>

    <div className="space-y-3">
      {briefings.map((b) => {
        const Icon = b.icon;
        return (
          <div key={b.domain} className="rounded-xl border border-border/40 bg-card p-4">
      <DemoModeBadge />
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("h-4 w-4", b.accent)} />
              <h3 className="text-sm font-medium">{b.domain}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{b.summary}</p>
            <div className="flex gap-3">
              {b.kpis.map((kpi) => (
                <div key={kpi.label} className="flex-1 text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-xs font-semibold">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>

    {/* Council recommendations */}
    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">Recommendations</h2>
    <div className="space-y-1.5">
      {[
        "Schedule check-in with 2 at-risk customers this week",
        "Cancel Notion Teams before renewal (saves $2,400/yr)",
        "Resolve Thursday calendar conflict — reschedule pickup",
      ].map((rec, i) => (
        <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-border/20 bg-card/50">
          <ArrowRight className="h-3 w-3 text-primary shrink-0" />
          <p className="text-xs">{rec}</p>
        </div>
      ))}
    </div>
  </MobileShell>
);

export default MobileBoardroom;
