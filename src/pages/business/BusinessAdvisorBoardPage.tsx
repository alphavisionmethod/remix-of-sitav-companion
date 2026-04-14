// ═══════════════════════════════════════════════════════════════
// Business Advisor Board Page — Full synthesis workspace
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
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
  synthesizeBusinessBoard,
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
  return [...home, ...leads, ...stages, ...recovery];
}

const BusinessAdvisorBoardPage = () => {
  const allAdvisors = useMemo(() => generateFullAdvisorSet(), []);
  const themes = useMemo(() => synthesizeBusinessBoard(allAdvisors), [allAdvisors]);

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      {/* Hero */}
      <div className="rounded-2xl border border-[hsl(265_55%_58%/0.15)] bg-gradient-to-r from-[hsl(265_55%_58%/0.06)] to-[hsl(38_85%_58%/0.04)] p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-[hsl(265_55%_58%/0.12)] flex items-center justify-center">
            <Brain className="h-6 w-6 text-[hsl(265_55%_58%)]" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-[hsl(0_0%_90%)]">Business Advisor Board</h1>
            <p className="text-[11px] text-[hsl(0_0%_50%)]">Cross-module intelligence synthesis · {allAdvisors.length} advisors active</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
            <span className="text-[10px] text-[hsl(265_55%_60%)]">{themes.length} themes · {themes.filter(t => t.escalationCandidate).length} escalation candidates</span>
          </div>
        </div>
        <p className="text-[11px] text-[hsl(0_0%_55%)] leading-relaxed max-w-2xl">
          This board synthesizes intelligence from all Business OS modules — Leads, Inbox, Scoring, Stages, and Recovery — into strategic themes, disagreements, and escalation candidates for Boardroom review.
        </p>
      </div>

      {/* Main panel */}
      <BusinessAdvisorBoardPanel allAdvisors={allAdvisors} themes={themes} />
    </motion.div>
  );
};

export default BusinessAdvisorBoardPage;
