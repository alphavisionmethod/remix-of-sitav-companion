import { KPITile, SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { GlassCard } from "@/platform/sita/components/sita/PremiumPageComponents";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { ConciergeAdvisorInsightCard, RecurringAdminList, ConciergePageWrapper, ConciergeEmptyState } from "@/modules/concierge/components/concierge";
import type { RecurringAdminItem } from "@/modules/concierge/components/concierge";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Calendar, Clock, AlertCircle, CheckCircle, Sparkles, TrendingDown, Zap, Shield, FileText } from "lucide-react";

interface RecurringItem {
  id: string;
  title: string;
  category: "admin" | "health" | "finance" | "household" | "school" | "vehicle" | "personal";
  frequency: string;
  nextDue: string;
  lastCompleted?: string;
  status: "on-track" | "due-soon" | "overdue" | "review-needed";
  effort: "low" | "medium" | "high";
  automatable?: boolean;
}

const ITEMS: RecurringItem[] = [
  { id: "r1", title: "Mortgage payment", category: "finance", frequency: "Monthly", nextDue: "In 3 days", lastCompleted: "Mar 1", status: "on-track", effort: "low", automatable: true },
  { id: "r2", title: "HVAC filter replacement", category: "household", frequency: "Every 90 days", nextDue: "Overdue 7 days", lastCompleted: "Dec 15", status: "overdue", effort: "medium" },
  { id: "r3", title: "Car oil change", category: "vehicle", frequency: "Every 5,000 mi", nextDue: "This week", status: "due-soon", effort: "medium" },
  { id: "r4", title: "Dental checkup — family", category: "health", frequency: "Every 6 months", nextDue: "Today", lastCompleted: "Oct 10", status: "due-soon", effort: "high" },
  { id: "r5", title: "Water filter replacement", category: "household", frequency: "Every 60 days", nextDue: "In 12 days", lastCompleted: "Feb 8", status: "on-track", effort: "low", automatable: true },
  { id: "r6", title: "Parking permit renewal", category: "admin", frequency: "Annually", nextDue: "In 10 days", status: "on-track", effort: "low" },
  { id: "r7", title: "Pet vaccination — annual", category: "personal", frequency: "Annually", nextDue: "In 6 weeks", lastCompleted: "May 2025", status: "on-track", effort: "medium" },
  { id: "r8", title: "Smoke detector battery check", category: "household", frequency: "Every 6 months", nextDue: "In 2 weeks", status: "on-track", effort: "low" },
  { id: "r9", title: "Insurance policy review", category: "finance", frequency: "Annually", nextDue: "Overdue 3 weeks", status: "overdue", effort: "high" },
  { id: "r10", title: "School lunch balance refill", category: "school", frequency: "Bi-weekly", nextDue: "In 4 days", lastCompleted: "Mar 28", status: "on-track", effort: "low", automatable: true },
  { id: "r11", title: "Lawn service check-in", category: "household", frequency: "Monthly", nextDue: "Review needed", status: "review-needed", effort: "low" },
  { id: "r12", title: "Passport validity check", category: "admin", frequency: "Every 2 years", nextDue: "Expires Aug 2026", status: "review-needed", effort: "high" },
];

const statusStyle = {
  "on-track": { dot: "bg-chart-2", bg: "bg-chart-2/5 border-chart-2/10", label: "On Track" },
  "due-soon": { dot: "bg-amber-500", bg: "bg-amber-500/5 border-amber-500/10", label: "Due Soon" },
  "overdue": { dot: "bg-destructive", bg: "bg-destructive/5 border-destructive/10", label: "Overdue" },
  "review-needed": { dot: "bg-primary", bg: "bg-primary/5 border-primary/10", label: "Review" },
};

const catColors: Record<string, string> = {
  admin: "bg-amber-500/10 text-amber-500",
  health: "bg-chart-2/10 text-chart-2",
  finance: "bg-primary/10 text-primary",
  household: "bg-accent/10 text-accent",
  school: "bg-primary/10 text-primary",
  vehicle: "bg-secondary text-muted-foreground",
  personal: "bg-accent/10 text-accent",
};

type RecurringView = "all" | "due-soon" | "overdue" | "by-category" | "automatable";

const RecurringObligations = () => {
  const [view, setView] = useState<RecurringView>("all");

  const overdue = ITEMS.filter((i) => i.status === "overdue");
  const dueSoon = ITEMS.filter((i) => i.status === "due-soon");
  const automatable = ITEMS.filter((i) => i.automatable);

  const filtered = () => {
    switch (view) {
      case "due-soon": return dueSoon;
      case "overdue": return overdue;
      case "automatable": return automatable;
      default: return ITEMS;
    }
  };

  const categories = [...new Set(ITEMS.map((i) => i.category))];

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Total Recurring" value={String(ITEMS.length)} icon={RotateCcw} />
        <KPITile label="Due Soon" value={String(dueSoon.length)} icon={Clock} sub="This week" />
        <KPITile label="Overdue" value={String(overdue.length)} icon={AlertCircle} sub="Needs attention" />
        <KPITile label="Automatable" value={String(automatable.length)} icon={Zap} sub="Set & forget" />
        <KPITile label="On Track" value={String(ITEMS.filter((i) => i.status === "on-track").length)} icon={CheckCircle} sub="Running smoothly" />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All Recurring" },
          { key: "due-soon", label: "Due Soon" },
          { key: "overdue", label: "Overdue" },
          { key: "by-category", label: "By Category" },
          { key: "automatable", label: "Automatable" },
        ]}
        active={view}
        onChange={(k) => setView(k as RecurringView)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {view === "by-category" ? (
            categories.map((cat) => {
              const items = ITEMS.filter((i) => i.category === cat);
              return (
                <div key={cat} className="space-y-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]"></h3>
                  {items.map((item) => <RecurringItemCard key={item.id} item={item} />)}
                </div>
              );
            })
          ) : filtered().length === 0 ? (
            <ConciergeEmptyState domain="recurring" icon={RotateCcw} />
          ) : (
            filtered().map((item) => <RecurringItemCard key={item.id} item={item} />)
          )}
        </div>

        <div className="space-y-4">
          {/* Rhythm Overview */}
          <GlassCard glow="accent" intensity="subtle" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-accent" />
              <p className="text-xs font-semibold text-foreground">Monthly Rhythm</p>
            </div>
            <div className="space-y-2">
              {["Week 1", "Week 2", "Week 3", "Week 4"].map((week, i) => (
                <div key={week} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-14 shrink-0">{week}</span>
                  <div className="flex gap-1 flex-1">
                    {Array.from({ length: Math.max(1, 4 - i) }).map((_, j) => (
                      <div key={j} className="h-3 flex-1 rounded-sm bg-primary/15" />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{4 - i} items</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Simplification */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-chart-2" />
              <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Simplification Opportunities</h4>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Zap className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <p className="text-foreground"><strong>Auto-pay mortgage</strong> — already on schedule, remove from manual tracking</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <p className="text-foreground"><strong>Water filter subscription</strong> — set up auto-delivery to eliminate reminders</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <p className="text-foreground"><strong>School lunch balance</strong> — enable auto-refill above $20 threshold</p>
              </div>
            </div>
          </div>

          {/* Advisor */}
          <ConciergeAdvisorInsightCard insight={{
            role: "Obligations Advisor",
            message: "The HVAC filter and insurance review are both overdue — tackle the filter today (5 min) and schedule 30 min for the insurance review this weekend. 3 items can be automated to reduce recurring burden by ~25%.",
            linkedItems: ["HVAC filter", "Insurance review", "Automation suggestions"],
            confidence: "high",
          }} />
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

function RecurringItemCard({ item }: { item: RecurringItem }) {
  const style = statusStyle[item.status];
  return (
    <div className={`rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift ${style.bg}`}>
      <div className="flex items-start gap-3">
        <div className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${style.dot}`} />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-semibold rounded-full px-1.5 py-0.5 ${catColors[item.category]}`}>
                {item.category}
              </span>
              <TrustBadge level={item.status === "overdue" ? "high-impact" : item.status === "due-soon" ? "review" : "safe"} label={style.label} size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" />{item.frequency}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.nextDue}</span>
            {item.lastCompleted && <span>Last: {item.lastCompleted}</span>}
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Effort: {item.effort}</span>
          </div>
          {item.automatable && (
            <p className="text-[10px] text-primary flex items-center gap-1 mt-1">
              <Zap className="h-3 w-3" /> Can be automated
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecurringObligations;
