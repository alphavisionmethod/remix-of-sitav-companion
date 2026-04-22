// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Boardroom
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { Brain, ArrowRight } from "lucide-react";
import { MobileAdvisorCard, type MobileAdvisorData } from "@/components/mobile/MobileAdvisorCard";

const advisors: MobileAdvisorData[] = [
  {
    id: "biz",
    name: "Strategy",
    domain: "business",
    emoji: "📊",
    accentColor: "hsl(265 55% 58%)",
    confidence: 82,
    status: "active",
    summary: "Revenue up 12% MTD. 3 deals closing worth $28K. 2 customers flagged for churn risk.",
    kpis: [
      { label: "Pipeline", value: "$142K", trend: "up" },
      { label: "Win Rate", value: "34%", trend: "up" },
      { label: "Churn Risk", value: "2", trend: "down" },
      { label: "MRR", value: "$18.4K", trend: "up" },
    ],
    recentAction: "Drafted follow-up emails for 2 at-risk accounts (pending approval).",
  },
  {
    id: "fin",
    name: "Finance",
    domain: "finance",
    emoji: "💰",
    accentColor: "hsl(152 55% 48%)",
    confidence: 91,
    status: "active",
    summary: "Cash position healthy. $8,240 safe-to-spend. 2 subscriptions flagged for waste.",
    kpis: [
      { label: "Cash", value: "$39.5K", trend: "flat" },
      { label: "Reserves", value: "72%", trend: "up" },
      { label: "Waste", value: "$4.2K", trend: "down" },
      { label: "Runway", value: "8.2mo", trend: "up" },
    ],
    recentAction: "Identified $4,200/yr savings from unused Notion Teams subscription.",
  },
  {
    id: "ops",
    name: "Operations",
    domain: "concierge",
    emoji: "🏠",
    accentColor: "hsl(38 85% 58%)",
    confidence: 74,
    status: "thinking",
    summary: "6 active tasks, 1 overdue. Calendar conflict Thursday. Grocery list auto-generated.",
    kpis: [
      { label: "Tasks", value: "6", trend: "flat" },
      { label: "Overdue", value: "1", trend: "down" },
      { label: "Balance", value: "78%", trend: "up" },
      { label: "Conflicts", value: "1", trend: "down" },
    ],
    recentAction: "Auto-generated grocery list for weekend based on meal plan preferences.",
  },
  {
    id: "risk",
    name: "Risk",
    domain: "risk",
    emoji: "🛡️",
    accentColor: "hsl(200 50% 50%)",
    confidence: 88,
    status: "idle",
    summary: "No critical risks. 1 medium-priority compliance item due next week.",
    kpis: [
      { label: "Score", value: "92", trend: "up" },
      { label: "Open Items", value: "1", trend: "flat" },
      { label: "Resolved", value: "4", trend: "up" },
      { label: "SLA", value: "99.2%", trend: "up" },
    ],
  },
];

const recommendations = [
  "Schedule check-in with 2 at-risk customers this week",
  "Cancel Notion Teams before renewal (saves $2,400/yr)",
  "Resolve Thursday calendar conflict — reschedule pickup",
];

const MobileBoardroom = () => (
  <MobileShell title="Boardroom">
    <div className="flex items-center gap-2 mb-4">
      <Brain className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-semibold">Advisor Council</h2>
      <span className="text-[10px] text-muted-foreground ml-auto">
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
      </span>
    </div>

    <div className="space-y-2">
      {advisors.map((a) => (
        <MobileAdvisorCard key={a.id} advisor={a} />
      ))}
    </div>

    {/* Council recommendations */}
    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">
      Recommendations
    </h2>
    <div className="space-y-1.5">
      {recommendations.map((rec, i) => (
        <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-border/20 bg-card/50">
          <ArrowRight className="h-3 w-3 text-primary shrink-0" />
          <p className="text-xs">{rec}</p>
        </div>
      ))}
    </div>
  </MobileShell>
);

export default MobileBoardroom;
