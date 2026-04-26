import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LeadScoreResult, PriorityTier } from "@/domains/business";
import { PRIORITY_TIER_META } from "@/domains/engines/lead-scoring-engine";
import type { InboxItem } from "./mock-inbox-data";
import { LeadScoreRadar } from "./LeadScoreRadar";
import { LeadConversionFunnel } from "./LeadConversionFunnel";
import { LeadValuePipeline } from "./LeadValuePipeline";
import { LeadHeatMap } from "./LeadHeatMap";
import { LeadInboxOverviewCards } from "./LeadInboxOverviewCards";
import { ModuleAdvisorPanel } from "@/modules/business/components/business/advisor-board/ModuleAdvisorPanel";
import { runScoringAdvisor, runConversionAdvisor, runTimingAdvisor, type AdvisorOutput } from "@/domains/engines/business-advisor-engine";
import { Flame, TrendingUp, AlertTriangle, RotateCcw, Star, Target } from "lucide-react";

interface Props {
  scores: LeadScoreResult[];
  items: InboxItem[];
  scoreMap: Map<string, LeadScoreResult>;
  onSelectLead?: (id: string) => void;
  selectedId?: string | null;
}

const DashCard = ({ icon: Icon, label, value, sublabel, accent, pulse }: {
  icon: typeof Flame; label: string; value: string | number; sublabel?: string; accent: string; pulse?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative rounded-2xl border border-border/40 bg-card p-4 overflow-hidden group hover:border-border/60 transition-all"
  >
    <div className="flex items-start justify-between">
      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", accent)}>
        <Icon className="h-4.5 w-4.5" />
        {pulse && (
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[hsl(var(--urgency-critical))]">
            <span className="absolute inset-0 rounded-full bg-[hsl(var(--urgency-critical))] animate-ping" />
          </span>
        )}
      </div>
    </div>
    <p className="font-display text-2xl font-bold text-foreground leading-none mt-3">{value}</p>
    <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    {sublabel && <p className="text-[9px] text-muted-foreground/60 mt-0.5">{sublabel}</p>}
  </motion.div>
);

export const LeadScoringDashboard = ({ scores, items, scoreMap, onSelectLead, selectedId }: Props) => {
  const active = scores.filter(s => s.priorityTier !== "low-priority");
  const critical = scores.filter(s => s.priorityTier === "critical-now").length;
  const high = scores.filter(s => s.priorityTier === "high-priority").length;
  const atRisk = scores.filter(s => s.staleRisk > 50).length;
  const recovery = scores.filter(s => s.recoveryPotential > 50).length;
  const boardroom = scores.filter(s => s.boardroomWorthy).length;
  const avgScore = active.length > 0
    ? Math.round(active.reduce((s, r) => s + r.priorityScore, 0) / active.length)
    : 0;

  // Generate scoring advisors from top leads
  const scoringAdvisors = useMemo<AdvisorOutput[]>(() => {
    const topScores = [...scores].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3);
    return topScores.flatMap(s => {
      const item = items.find(i => i.id === s.leadId);
      const name = item?.contact_name || "Unknown";
      return [
        runScoringAdvisor({ leadName: name, score: s.priorityScore, previousScore: Math.max(0, s.priorityScore - 8), topFactors: s.topPositiveFactors.slice(0, 2).map(f => f.label), bottomFactors: s.topNegativeFactors.slice(0, 2).map(f => f.label) }),
        runConversionAdvisor({ leadName: name, likelihood: Math.min(95, s.priorityScore + 5), engagementLevel: s.heatStatus === "hot" ? "High" : "Moderate", fitScore: s.priorityScore }),
        runTimingAdvisor({ leadName: name, daysSinceLastContact: s.staleRisk > 50 ? 18 : 5, quoteAge: 10, buyingUrgency: s.urgencyBand === "needs-response-today" ? "high" : "medium" }),
      ];
    }).slice(0, 6);
  }, [scores, items]);

  const tiers: PriorityTier[] = ["critical-now", "high-priority", "active-watch", "nurture", "recovery-candidate", "low-priority"];
  const distribution = tiers.map(t => ({
    tier: t,
    count: scores.filter(s => s.priorityTier === t).length,
    meta: PRIORITY_TIER_META[t],
  }));
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  // Find selected lead score for radar
  const selectedScore = selectedId ? scoreMap.get(selectedId) : scores[0];

  // Top opportunities table
  const topOpps = [...scores]
    .filter(s => s.priorityTier !== "low-priority")
    .slice(0, 5)
    .map(s => ({ score: s, item: items.find(i => i.id === s.leadId)! }))
    .filter(x => x.item);

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <DashCard icon={Flame} label="Critical Now" value={critical} accent="bg-[hsl(var(--urgency-critical))]/10 text-[hsl(var(--urgency-critical))]" pulse={critical > 0} />
        <DashCard icon={TrendingUp} label="High Priority" value={high} accent="bg-[hsl(var(--urgency-high))]/10 text-[hsl(var(--urgency-high))]" />
        <DashCard icon={Target} label="Avg Score" value={avgScore} sublabel="active leads" accent="bg-primary/10 text-primary" />
        <DashCard icon={AlertTriangle} label="At Risk" value={atRisk} sublabel="stale risk >50%" accent="bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" />
        <DashCard icon={RotateCcw} label="Recovery" value={recovery} sublabel="potential >50%" accent="bg-accent/10 text-accent" />
        <DashCard icon={Star} label="Boardroom" value={boardroom} sublabel="strategic leads" accent="bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" pulse={boardroom > 0} />
      </div>

      {/* Overview Cards (Source Mix, Quality Gauge, Arrival Velocity) */}
      <LeadInboxOverviewCards items={items} />

      {/* Charts Grid: Funnel + Pipeline + Radar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LeadConversionFunnel items={items} scoreMap={scoreMap} />
        <LeadValuePipeline items={items} scoreMap={scoreMap} />
        <div className="rounded-2xl border border-border/40 bg-card p-5 flex flex-col items-center">
          <p className="text-xs font-semibold text-foreground mb-3 self-start">
            {selectedScore ? "Factor Radar" : "Select a Lead"}
          </p>
          {selectedScore && (
            <>
              <LeadScoreRadar factors={selectedScore.allFactors} size={200} />
              <p className="text-[10px] text-muted-foreground mt-2">
                {items.find(i => i.id === selectedScore.leadId)?.contact_name ?? "Lead"} — Score {selectedScore.priorityScore}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Heat Map */}
      <LeadHeatMap items={items} scoreMap={scoreMap} onSelect={onSelectLead} selectedId={selectedId} />

      {/* Priority Distribution */}
      <div className="rounded-2xl border border-border/40 bg-card p-4">
        <p className="text-[11px] font-semibold text-muted-foreground mb-3">Priority Distribution</p>
        <div className="flex items-end gap-1.5 h-12">
          {distribution.map(d => (
            <div key={d.tier} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${Math.max(4, (d.count / maxCount) * 48)}px`,
                  backgroundColor: d.meta.color,
                  opacity: d.count > 0 ? 0.8 : 0.15,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          {distribution.map(d => (
            <div key={d.tier} className="flex-1 text-center">
              <p className="text-[8px] text-muted-foreground truncate">{d.meta.label}</p>
              <p className="text-[10px] font-bold text-foreground">{d.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Opportunities Table */}
      {topOpps.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <div className="p-4 pb-2">
            <p className="text-xs font-semibold text-foreground">Top Opportunities</p>
          </div>
          <div className="divide-y divide-border/20">
            {topOpps.map(({ score: s, item }) => (
              <button
                key={s.leadId}
                onClick={() => onSelectLead?.(s.leadId)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors text-left",
                  selectedId === s.leadId && "bg-primary/5"
                )}
              >
                <div className="h-8 w-8 rounded-lg gradient-sita flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                  {item.contact_name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.contact_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.company || "—"}</p>
                </div>
                <div className={cn(
                  "font-display text-lg font-bold tabular-nums",
                  s.priorityScore >= 70 ? "text-[hsl(var(--trust-safe))]" : s.priorityScore >= 50 ? "text-[hsl(var(--sita-gold))]" : "text-[hsl(var(--trust-degraded))]"
                )}>
                  {s.priorityScore}
                </div>
                <span className="text-[9px] text-muted-foreground capitalize">{s.nextBestActionType.replace("-", " ")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scoring Advisor Intelligence */}
      {scoringAdvisors.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card p-4">
          <ModuleAdvisorPanel
            advisors={scoringAdvisors}
            title="Scoring & Conversion Advisors"
            defaultExpanded={false}
            compact
          />
        </div>
      )}
    </div>
  );
};
