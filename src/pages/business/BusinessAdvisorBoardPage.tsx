// ═══════════════════════════════════════════════════════════════
// Business Advisor Board Page — Full synthesis workspace
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Shield, TrendingUp, AlertTriangle, Activity, Zap, Crown } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { BusinessAdvisorBoardPanel } from "@/components/business/advisor-board/BusinessAdvisorBoardPanel";
import {
  generateHomeAdvisors,
  runLeadPrioritizationAdvisor,
  runOpportunityAdvisor,
  runQualificationAdvisor,
  runProgressionAdvisor,
  runStuckStageAdvisor,
  runLifecycleAdvisor,
  runRecoveryAdvisor,
  runCommunicationRecoveryAdvisor,
  runRevenueRescueAdvisor,
  runScoringAdvisor,
  runConversionAdvisor,
  runTimingAdvisor,
  synthesizeBusinessBoard,
  detectAdvisorDisagreements,
  type AdvisorOutput,
} from "@/lib/engines/business-advisor-engine";

function generateFullAdvisorSet(): AdvisorOutput[] {
  const home = generateHomeAdvisors();
  const leads = [
    runLeadPrioritizationAdvisor({ leads: [
      { id: "l1", name: "David Chen", score: 89, value: 17000, lastActivity: 3, fit: "strong" },
      { id: "l2", name: "Rachel Adams", score: 72, value: 28000, lastActivity: 8, fit: "strong" },
      { id: "l3", name: "Lisa Park", score: 64, value: 6400, lastActivity: 38, fit: "moderate" },
    ]}),
    runOpportunityAdvisor({ activeDeals: 12, totalPipelineValue: 185000, stuckDeals: 3, convertingThisWeek: 2 }),
    runQualificationAdvisor({ totalLeads: 42, strongFit: 18, weakFit: 8, missingInfo: 5 }),
  ];
  const scoring = [
    runScoringAdvisor({ leadName: "David Chen", score: 89, previousScore: 82, topFactors: ["High engagement", "Enterprise fit", "Recent consult"], bottomFactors: ["No phone number"] }),
    runConversionAdvisor({ leadName: "David Chen", likelihood: 78, engagementLevel: "High", fitScore: 88 }),
    runTimingAdvisor({ leadName: "Rachel Adams", daysSinceLastContact: 18, quoteAge: 22, buyingUrgency: "medium" }),
  ];
  const stages = [
    runProgressionAdvisor({ totalInPipeline: 42, advancedThisWeek: 4, avgDaysInStage: 11 }),
    runStuckStageAdvisor({ stuckLeads: [
      { id: "s1", name: "James Morton", stage: "Proposal", daysStuck: 45 },
      { id: "s2", name: "Taylor Kim", stage: "Demo", daysStuck: 30 },
    ]}),
    runLifecycleAdvisor({ avgCycleTime: 28, conversionRate: 32, dropoffStage: "Proposal", recoveryRateFromDropoff: 35 }),
  ];
  const recovery = [
    runRecoveryAdvisor({ name: "Rachel Adams", recoveryScore: 58, failureMode: "silent_high_value", valueAtRisk: 11000, daysSince: 60, successBand: "uncertain" }),
    runCommunicationRecoveryAdvisor({ name: "Rachel Adams", messageHistory: 4, noResponseCount: 3, lastTone: "professional", failureMode: "silent_high_value" }),
    runRevenueRescueAdvisor({ name: "Rachel Adams", valueAtRisk: 11000, recoveryProbability: 58, accountTier: "enterprise", strategicRelevance: "high" }),
  ];
  return [...home, ...leads, ...scoring, ...stages, ...recovery];
}

const BusinessAdvisorBoardPage = () => {
  const allAdvisors = useMemo(() => generateFullAdvisorSet(), []);
  const themes = useMemo(() => synthesizeBusinessBoard(allAdvisors), [allAdvisors]);
  const disagreements = useMemo(() => detectAdvisorDisagreements(allAdvisors), [allAdvisors]);

  const avgConfidence = Math.round(allAdvisors.reduce((s, a) => s + a.confidence, 0) / allAdvisors.length);
  const criticalCount = allAdvisors.filter(a => a.urgency === "critical" || a.urgency === "high").length;
  const escalationCount = themes.filter(t => t.escalationCandidate).length;
  const moduleCount = [...new Set(allAdvisors.map(a => a.module))].length;

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      {/* Hero */}
      <div className="rounded-2xl border border-[hsl(265_55%_58%/0.15)] bg-gradient-to-r from-[hsl(265_55%_58%/0.06)] to-[hsl(38_85%_58%/0.04)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[hsl(265_55%_58%/0.12)] flex items-center justify-center">
            <Brain className="h-6 w-6 text-[hsl(265_55%_58%)]" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-[hsl(0_0%_90%)]">Business Advisor Board</h1>
            <p className="text-[11px] text-[hsl(0_0%_50%)]">Cross-module intelligence synthesis · {allAdvisors.length} advisors active</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
            <span className="text-[10px] text-[hsl(265_55%_60%)]">{themes.length} themes · {escalationCount} escalation candidates</span>
          </div>
        </div>

        {/* Quick-stat strip */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { icon: Brain, label: "Active Advisors", value: allAdvisors.length, color: "hsl(265 55% 58%)" },
            { icon: Activity, label: "Modules Covered", value: moduleCount, color: "hsl(152 55% 48%)" },
            { icon: TrendingUp, label: "Themes Found", value: themes.length, color: "hsl(265 55% 68%)" },
            { icon: AlertTriangle, label: "High Priority", value: criticalCount, color: criticalCount > 5 ? "hsl(0 70% 55%)" : "hsl(38 85% 58%)" },
            { icon: Shield, label: "Board Health", value: `${avgConfidence}%`, color: avgConfidence > 75 ? "hsl(152 55% 48%)" : "hsl(38 85% 58%)" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-xl bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] p-3 text-center">
              <s.icon className="h-3.5 w-3.5 mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-lg font-bold font-display tabular-nums" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[8px] text-[hsl(0_0%_40%)]">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-[11px] text-[hsl(0_0%_55%)] leading-relaxed max-w-2xl mt-4">
          This board synthesizes intelligence from all Business OS modules — Leads, Inbox, Scoring, Stages, and Recovery — into strategic themes, disagreements, and escalation candidates for Boardroom review.
        </p>
      </div>

      {/* Escalation spotlight */}
      {escalationCount > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-[hsl(38_85%_58%/0.2)] bg-gradient-to-r from-[hsl(38_85%_58%/0.06)] to-transparent p-4 flex items-center gap-3">
          <Crown className="h-5 w-5 text-[hsl(38_85%_58%)]" />
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[hsl(38_85%_68%)]">{escalationCount} item{escalationCount > 1 ? "s" : ""} ready for Boardroom escalation</p>
            <p className="text-[9px] text-[hsl(0_0%_45%)]">Strategic matters requiring executive review have been identified across modules</p>
          </div>
          <Zap className="h-4 w-4 text-[hsl(38_85%_58%)] animate-pulse" />
        </motion.div>
      )}

      {/* Disagreement spotlight */}
      {disagreements.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="rounded-xl border border-[hsl(265_55%_58%/0.15)] bg-[hsl(265_55%_58%/0.03)] p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[hsl(265_55%_58%)]" />
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[hsl(265_55%_70%)]">{disagreements.length} advisor disagreement{disagreements.length > 1 ? "s" : ""} detected</p>
            <p className="text-[9px] text-[hsl(0_0%_45%)]">Productive tension between advisors — review to understand competing perspectives</p>
          </div>
        </motion.div>
      )}

      {/* Main panel */}
      <BusinessAdvisorBoardPanel allAdvisors={allAdvisors} themes={themes} />
    </motion.div>
  );
};

export default BusinessAdvisorBoardPage;
