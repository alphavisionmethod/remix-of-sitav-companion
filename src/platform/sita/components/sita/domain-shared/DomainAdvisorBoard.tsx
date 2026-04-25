// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Advisor Board
// Roundtable, Ask One, Synthesis, Debate, Evidence modes
// All modes fully populated with rich mock content
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getAdvisorRoster, type AdvisorRole } from "@/domains/advisors/topology";
import { Users, MessageCircle, Sparkles, Swords, FileCheck, Brain, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives";

type BoardMode = "roundtable" | "ask-one" | "synthesis" | "debate" | "evidence";

interface DomainAdvisorBoardProps {
  domain: string;
  className?: string;
}

// Rich mock stances per advisor
const ADVISOR_STANCES: Record<string, { stance: string; reasoning: string; confidence: number; evidenceCount: number }> = {
  "biz-revenue": { stance: "Prioritize collections — $18.5K overdue threatens Q2 target", reasoning: "Pipeline analysis shows $23K shortfall against quarterly target. Overdue accounts represent highest-probability recovery.", confidence: 78, evidenceCount: 6 },
  "biz-relationship": { stance: "Segment by client value before outreach — protect top accounts", reasoning: "CRM data shows TechCorp has 92/100 relationship health. Aggressive outreach risks 15% churn for top-tier clients.", confidence: 72, evidenceCount: 4 },
  "biz-followthrough": { stance: "Pipeline velocity needs attention — 3 deals stalled 14+ days", reasoning: "Deal aging analysis shows 3 opportunities past expected close date. Each day of delay reduces win probability by 2%.", confidence: 74, evidenceCount: 5 },
  "biz-support": { stance: "Support queue stable but NPS trending down — investigate root cause", reasoning: "Ticket volume is normal but satisfaction scores dropped 8 points this month. Two escalated tickets may be causing perception shift.", confidence: 60, evidenceCount: 2 },
  "biz-collections": { stance: "Accelerate TechCorp outreach — largest overdue at $12.5K", reasoning: "TechCorp payment history shows 7-day response to follow-up. Personal outreach recommended given account value.", confidence: 82, evidenceCount: 5 },
  "biz-operations": { stance: "Reduce response time to protect NPS before it impacts renewals", reasoning: "Correlation analysis: NPS below 70 leads to 22% higher churn in following quarter. Current trajectory hits that threshold in 3 weeks.", confidence: 60, evidenceCount: 2 },
  "fin-obligations": { stance: "Defer 3 subscriptions ($342/mo) to restore reserve buffer", reasoning: "Zero-usage audit identified 3 tools with no activity in 30 days. Deferral has no operational impact.", confidence: 78, evidenceCount: 5 },
  "fin-spending": { stance: "AWS billing spike detected — investigate before next cycle", reasoning: "Cost anomaly: $480 above baseline traced to idle dev environment. Immediate fix available.", confidence: 74, evidenceCount: 4 },
  "fin-planning": { stance: "Q2 forecast needs adjustment based on pipeline slowdown", reasoning: "Revenue pipeline velocity dropped 18% vs Q1. Forecast model shows $15K-$22K range vs original $28K target.", confidence: 65, evidenceCount: 3 },
  "fin-reserve": { stance: "Reserves critical at 72% — accelerate AR collection", reasoning: "Current buffer below safety threshold. Combined subscription deferral + AR acceleration restores target in 5 weeks.", confidence: 65, evidenceCount: 3 },
  "fin-approvals": { stance: "2 pending payments need review — one may be fraudulent", reasoning: "Pattern detection flagged unusual vendor payment of $2,100. Vendor verification pending.", confidence: 82, evidenceCount: 4 },
  "fin-receivables": { stance: "3 receivables aging past 30 days — prioritize collection", reasoning: "Invoice aging: $4,200 + $2,800 + $1,400 = $8,400 total. Historical: 85% recovery within 2 weeks of follow-up.", confidence: 76, evidenceCount: 5 },
  "con-travel": { stance: "NYC prep fully cleared — safe to approve logistics package", reasoning: "All 8 checklist items complete. Flight, hotel, dinner confirmed. Documents current.", confidence: 92, evidenceCount: 7 },
  "con-lifeadmin": { stance: "School enrollment deadline Apr 18 — needs decision this week", reasoning: "Deadline in 5 days. Application complete but requires signature and $250 deposit.", confidence: 55, evidenceCount: 2 },
  "con-logistics": { stance: "Errand batch available — save 45 min with optimized route", reasoning: "3 errands can be combined: pharmacy, dry cleaning, post office. Optimal route saves 45 min vs separate trips.", confidence: 82, evidenceCount: 3 },
  "con-support": { stance: "3 tasks identified for automation — reduce weekly burden by 2 hrs", reasoning: "Recurring tasks analysis: invoice filing, appointment reminders, and grocery reordering are all automatable.", confidence: 70, evidenceCount: 3 },
  "con-prep": { stance: "All prep items cleared — no outstanding requirements", reasoning: "Checklist audit: 12/12 items complete across all upcoming appointments and commitments.", confidence: 95, evidenceCount: 6 },
  "con-household": { stance: "Household coordination normal — grocery run due Thursday", reasoning: "Inventory check shows 4 essentials running low. Thursday timing optimal for weekly restock pattern.", confidence: 85, evidenceCount: 4 },
};

// Deep analysis for Ask One mode
const DEEP_ANALYSIS: Record<string, { recommendation: string; steps: string[]; uncertainties: string[]; needsMore: string }> = {
  "biz-revenue": {
    recommendation: "Initiate phased collections starting with TechCorp personal outreach, followed by automated sequences for remaining accounts.",
    steps: ["Analyzed Q2 pipeline: $23K gap between forecast and target", "Cross-referenced overdue accounts with relationship scores", "Modeled recovery scenarios: phased vs aggressive vs deferred", "Conclusion: phased approach yields 91% recovery vs 76% aggressive"],
    uncertainties: ["TechCorp billing dispute may reduce collectible amount by $3,200", "Pipeline deals may close before collections resolve the shortfall"],
    needsMore: "Confirmation of TechCorp dispute status and updated pipeline close probabilities",
  },
  "biz-relationship": {
    recommendation: "Segment all overdue accounts into three tiers and apply appropriate outreach intensity per tier.",
    steps: ["Pulled CRM engagement scores for all overdue accounts", "Classified: Tier 1 (high-value, personal), Tier 2 (mid, warm email), Tier 3 (low, automated)", "Analyzed churn risk per approach: personal touch reduces churn by 65%", "Recommendation: protect relationships while maximizing recovery"],
    uncertainties: ["Client sentiment may have shifted since last CRM update 3 weeks ago", "Tier classification depends on revenue data accuracy"],
    needsMore: "Fresh client sentiment survey or recent communication logs",
  },
  "fin-obligations": {
    recommendation: "Defer subscriptions immediately AND fix AWS billing anomaly for combined $582/mo savings.",
    steps: ["Audited all recurring obligations for usage patterns", "Identified 3 zero-usage subscriptions totaling $342/mo", "Cross-referenced with spending advisor's AWS finding ($240/mo)", "Combined approach restores reserve buffer 40% faster"],
    uncertainties: ["One subscription may have upcoming planned usage next quarter", "AWS fix assumes the idle environment isn't needed for testing"],
    needsMore: "Confirmation from team that deferred tools won't be needed in next 30 days",
  },
  "con-travel": {
    recommendation: "Approve travel package with one addition: pre-book airport car service for 5 AM pickup.",
    steps: ["Verified all logistics: flight, hotel, restaurant — all confirmed", "Document check: passport current, business cards ordered, deck reviewed", "Identified gap: no airport transfer booked for early departure", "Historical data: ride-share at 5 AM has 30% surge and 15-min wait"],
    uncertainties: ["Flight price may still change if not locked with seat selection", "Weather forecast for Apr 22 not yet available"],
    needsMore: "Airport transfer booking confirmation",
  },
};

// Debate pairs with full arguments
const DEBATE_PAIRS: Record<string, { topic: string; sideA: { advisor: string; position: string; points: string[]; risks: string[]; confidence: number }; sideB: { advisor: string; position: string; points: string[]; risks: string[]; confidence: number }; verdict: string; verdictReasoning: string }> = {
  business: {
    topic: "Collections Approach: Immediate vs Phased",
    sideA: { advisor: "biz-revenue", position: "Immediate outreach to all overdue accounts", points: ["Cash urgency: $18.5K overdue threatens Q2 target", "Delay compounds — each week adds $200+ in opportunity cost", "Automated sequences can run in parallel without resource strain"], risks: ["May damage TechCorp relationship", "Billing dispute could escalate"], confidence: 72 },
    sideB: { advisor: "biz-relationship", position: "Phased approach — personal touch for top accounts first", points: ["TechCorp is top-5 client ($45K/yr revenue)", "Historical: phased recovery rate 91% vs 76% immediate", "Relationship preservation has compounding value"], risks: ["Slower initial cash recovery", "Smaller accounts may age further"], confidence: 68 },
    verdict: "Adopt phased approach with parallel automated sequences for smaller accounts",
    verdictReasoning: "Net recovery is higher (+15%) with phased approach while preserving the most valuable client relationship. The $6K from smaller accounts can be collected via automation simultaneously.",
  },
  finance: {
    topic: "Reserve Recovery: Cut Costs vs Accelerate Revenue",
    sideA: { advisor: "fin-obligations", position: "Cut non-essential subscriptions immediately", points: ["3 subscriptions with zero usage = pure waste", "Immediate savings with no operational disruption", "Simple to execute — just cancel or pause"], risks: ["May need tools later — resubscription costs", "Savings alone insufficient to close full gap"], confidence: 78 },
    sideB: { advisor: "fin-receivables", position: "Focus on accelerating receivables collection", points: ["$8,400 in aging receivables available for collection", "85% recovery probability within 2 weeks", "Addresses root cause (revenue timing) not symptoms"], risks: ["Collection may take longer than expected", "Clients may push back on accelerated terms"], confidence: 76 },
    verdict: "Execute both in parallel — defer subscriptions AND accelerate top receivables",
    verdictReasoning: "Combined approach restores buffer 40% faster than either alone. Subscription deferral is low-risk and immediate; receivables acceleration addresses the larger amount.",
  },
  concierge: {
    topic: "Travel Logistics: Full Approval vs Additional Prep",
    sideA: { advisor: "con-travel", position: "Approve full package now — everything is ready", points: ["All 8 prep items completed", "Flight, hotel, dinner confirmed", "Documents current and verified"], risks: ["Airport transfer still unbooked", "Weather unknown for travel date"], confidence: 92 },
    sideB: { advisor: "con-logistics", position: "Hold approval until airport transfer is booked", points: ["5 AM departure needs guaranteed transport", "Ride-share at 5 AM: 30% surge, 15-min wait", "Pre-booked car service eliminates travel-day stress"], risks: ["Slight delay in final approval", "Car service may cost more than ride-share"], confidence: 82 },
    verdict: "Approve package with conditional: book car service within 24 hours",
    verdictReasoning: "The package is 95% ready. Adding the car service booking as a condition rather than a blocker allows progress while ensuring the gap is closed.",
  },
};

// Evidence chain data
const EVIDENCE_DATA: Record<string, { source: string; type: "verified" | "inferred" | "assumed"; freshness: string; confidence: number }[]> = {
  "biz-revenue": [
    { source: "Invoice aging report — QuickBooks sync", type: "verified", freshness: "12 min ago", confidence: 95 },
    { source: "Q2 pipeline forecast — CRM data", type: "verified", freshness: "3 hours ago", confidence: 88 },
    { source: "Revenue target — board-approved plan", type: "verified", freshness: "30 days ago", confidence: 100 },
    { source: "Recovery probability — historical pattern", type: "inferred", freshness: "Based on 4 prior cycles", confidence: 78 },
    { source: "Opportunity cost estimate", type: "assumed", freshness: "Model-generated", confidence: 65 },
  ],
  "biz-relationship": [
    { source: "CRM engagement score — TechCorp", type: "verified", freshness: "3 weeks ago", confidence: 82 },
    { source: "Client revenue contribution — annual", type: "verified", freshness: "Quarterly report", confidence: 95 },
    { source: "Churn risk model — aggressive outreach", type: "inferred", freshness: "Model v2.1", confidence: 68 },
    { source: "Recovery comparison — phased vs immediate", type: "inferred", freshness: "4 prior instances", confidence: 78 },
  ],
  "fin-obligations": [
    { source: "Subscription usage audit — 30-day window", type: "verified", freshness: "24 hours ago", confidence: 92 },
    { source: "Monthly cost breakdown — bank feed", type: "verified", freshness: "Real-time", confidence: 98 },
    { source: "Reserve target — financial plan", type: "verified", freshness: "Set 60 days ago", confidence: 100 },
    { source: "Recovery timeline estimate", type: "inferred", freshness: "Model-generated", confidence: 75 },
    { source: "Operational impact assessment", type: "assumed", freshness: "Based on team input", confidence: 70 },
  ],
};

const evidenceTypeStyles = {
  verified: { color: "text-[hsl(152_55%_48%)]", bg: "bg-[hsl(152_55%_48%/0.1)]", label: "Verified" },
  inferred: { color: "text-[hsl(38_85%_58%)]", bg: "bg-[hsl(38_85%_58%/0.1)]", label: "Inferred" },
  assumed: { color: "text-[hsl(0_70%_55%)]", bg: "bg-[hsl(0_70%_55%/0.1)]", label: "Assumed" },
};

function AdvisorSeat({ advisor, selected, onClick }: { advisor: AdvisorRole; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200",
        selected
          ? "border-[hsl(265_55%_58%/0.4)] bg-[hsl(265_55%_58%/0.08)]"
          : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.04)]"
      )}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md"
        style={{ background: `linear-gradient(135deg, ${advisor.accentColor}, ${advisor.accentColor}88)` }}
      >
        {advisor.emoji}
      </div>
      <div className="text-center">
        <p className="text-[11px] font-medium text-[hsl(0_0%_100%/0.8)] leading-tight">{advisor.name}</p>
        <p className="text-[9px]" style={{ color: advisor.accentColor }}>{advisor.role}</p>
      </div>
    </motion.button>
  );
}

/* ── Roundtable — Each advisor's current stance with speech bubble ── */
function RoundtableView({ advisors }: { advisors: AdvisorRole[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {advisors.map((advisor, i) => {
        const stance = ADVISOR_STANCES[advisor.id];
        const isExpanded = expanded === advisor.id;
        if (!stance) return null;

        return (
          <motion.div
            key={advisor.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 relative"
          >
            <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: advisor.accentColor }} />
            <div className="flex items-start gap-3 ml-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-md"
                style={{ background: `linear-gradient(135deg, ${advisor.accentColor}, ${advisor.accentColor}88)` }}
              >
                {advisor.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-[hsl(0_0%_100%/0.85)]">{advisor.name}</span>
                  <span className="text-[9px] font-medium" style={{ color: advisor.accentColor }}>{advisor.role}</span>
                </div>
                <div className="rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] p-3 mb-2">
                  <p className="text-[11px] text-[hsl(0_0%_100%/0.65)] leading-relaxed italic flex items-start gap-1.5">
                    <MessageCircle size={10} className="shrink-0 mt-0.5 text-[hsl(280_50%_60%/0.4)]" />
                    "{stance.stance}"
                  </p>
                </div>
                <button
                  onClick={() => setExpanded(isExpanded ? null : advisor.id)}
                  className="flex items-center gap-1 text-[9px] font-semibold text-[hsl(280_50%_65%/0.6)] hover:text-[hsl(280_50%_75%)] transition-colors mb-2"
                >
                  <Brain size={10} />
                  {isExpanded ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
                  Reasoning
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[10px] text-[hsl(0_0%_100%/0.4)] italic leading-relaxed mb-2 pl-2 border-l-2 border-[hsl(280_50%_50%/0.15)]">
                        {stance.reasoning}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-4">
                  <ConfidenceBar value={stance.confidence} size="sm" className="w-20" />
                  <span className="text-[8px] text-[hsl(0_0%_100%/0.25)]">{stance.evidenceCount} sources</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Ask One — Deep focus on a single advisor ── */
function AskOneView({ advisors }: { advisors: AdvisorRole[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedAdvisor = advisors.find(a => a.id === selected);
  const deep = selected ? DEEP_ANALYSIS[selected] : null;
  const stance = selected ? ADVISOR_STANCES[selected] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {advisors.map((advisor) => (
          <AdvisorSeat
            key={advisor.id}
            advisor={advisor}
            selected={selected === advisor.id}
            onClick={() => setSelected(selected === advisor.id ? null : advisor.id)}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        {selectedAdvisor && (
          <motion.div
            key={selectedAdvisor.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg"
                style={{ background: `linear-gradient(135deg, ${selectedAdvisor.accentColor}, ${selectedAdvisor.accentColor}88)` }}
              >
                {selectedAdvisor.emoji}
              </div>
              <div>
                <p className="text-sm font-bold text-[hsl(0_0%_100%/0.9)]">{selectedAdvisor.name}</p>
                <p className="text-[10px]" style={{ color: selectedAdvisor.accentColor }}>{selectedAdvisor.role}</p>
                <p className="text-[9px] text-[hsl(0_0%_100%/0.35)] mt-0.5">{selectedAdvisor.specialty}</p>
              </div>
            </div>

            {stance && (
              <div className="rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] p-3">
                <p className="text-[12px] text-[hsl(0_0%_100%/0.7)] italic">"{stance.stance}"</p>
                <ConfidenceBar value={stance.confidence} size="sm" className="mt-2" />
              </div>
            )}

            {deep ? (
              <>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(280_50%_65%/0.6)] mb-2">Recommendation</p>
                  <p className="text-[12px] text-[hsl(0_0%_100%/0.75)] leading-relaxed">{deep.recommendation}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(280_50%_65%/0.6)] mb-2 flex items-center gap-1"><Brain size={10} /> Reasoning Chain</p>
                  <div className="space-y-2">
                    {deep.steps.map((step, si) => (
                      <motion.div key={si} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.1 }} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-[hsl(280_50%_50%/0.1)] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-[hsl(280_50%_65%)]">{si + 1}</span>
                        </div>
                        <p className="text-[11px] text-[hsl(0_0%_100%/0.55)] leading-relaxed">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(38_85%_58%/0.7)] mb-2 flex items-center gap-1"><AlertTriangle size={10} /> Uncertainties</p>
                  <div className="space-y-1">
                    {deep.uncertainties.map((u, ui) => (
                      <p key={ui} className="text-[10px] text-[hsl(38_85%_58%/0.6)] flex items-start gap-1.5">
                        <span className="text-[hsl(38_85%_58%)] mt-0.5">•</span> {u}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-[hsl(210_70%_55%/0.05)] border border-[hsl(210_70%_55%/0.15)] p-3">
                  <p className="text-[10px] font-bold text-[hsl(210_70%_55%/0.7)] mb-1">Needs More Information</p>
                  <p className="text-[10px] text-[hsl(0_0%_100%/0.45)]">{deep.needsMore}</p>
                </div>
              </>
            ) : (
              <p className="text-[10px] text-[hsl(0_0%_100%/0.35)] italic">Deep analysis available for key advisors. Select an advisor to see their full reasoning.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Debate — Two advisors with full opposing arguments + verdict ── */
function DebateView({ advisors, domain }: { advisors: AdvisorRole[]; domain: string }) {
  const debate = DEBATE_PAIRS[domain];
  if (!debate) return <p className="text-[10px] text-[hsl(0_0%_100%/0.35)]">No active debates for this domain.</p>;

  const advA = advisors.find(a => a.id === debate.sideA.advisor) || advisors[0];
  const advB = advisors.find(a => a.id === debate.sideB.advisor) || advisors[1];

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <p className="text-[11px] font-bold text-[hsl(0_0%_100%/0.8)]">{debate.topic}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[{ side: debate.sideA, adv: advA, label: "Position A", borderColor: "hsl(210_70%_55%/0.2)", bgColor: "hsl(210_70%_55%/0.04)" },
          { side: debate.sideB, adv: advB, label: "Position B", borderColor: "hsl(0_70%_55%/0.2)", bgColor: "hsl(0_70%_55%/0.04)" }].map(({ side, adv, label, borderColor, bgColor }, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: idx === 0 ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border p-4"
            style={{ borderColor, background: `linear-gradient(to bottom right, ${bgColor}, transparent)` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md"
                style={{ background: `linear-gradient(135deg, ${adv.accentColor}, ${adv.accentColor}88)` }}>
                {adv.emoji}
              </div>
              <div>
                <p className="text-[11px] font-bold text-[hsl(0_0%_100%/0.8)]">{adv.name}</p>
                <p className="text-[8px] uppercase tracking-wider text-[hsl(0_0%_100%/0.35)]">{label}</p>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.7)] mb-2 italic">"{side.position}"</p>
            <div className="space-y-1 mb-3">
              {side.points.map((p, pi) => (
                <p key={pi} className="text-[10px] text-[hsl(0_0%_100%/0.5)] flex items-start gap-1.5">
                  <CheckCircle size={9} className="shrink-0 mt-0.5 text-[hsl(152_55%_48%/0.5)]" /> {p}
                </p>
              ))}
            </div>
            <div className="space-y-1 mb-3">
              {side.risks.map((r, ri) => (
                <p key={ri} className="text-[10px] text-[hsl(38_85%_58%/0.6)] flex items-start gap-1.5">
                  <AlertTriangle size={9} className="shrink-0 mt-0.5" /> {r}
                </p>
              ))}
            </div>
            <ConfidenceBar value={side.confidence} size="sm" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-[hsl(280_50%_50%/0.2)] bg-[hsl(280_40%_50%/0.06)] p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={14} className="text-[hsl(280_50%_65%)]" />
          <p className="text-[11px] font-bold text-[hsl(280_50%_75%)]">Board Verdict</p>
        </div>
        <p className="text-[12px] font-semibold text-[hsl(0_0%_100%/0.85)] mb-1">{debate.verdict}</p>
        <p className="text-[10px] text-[hsl(0_0%_100%/0.5)] leading-relaxed italic">{debate.verdictReasoning}</p>
      </motion.div>
    </div>
  );
}

/* ── Synthesis — Combined board output ── */
function SynthesisView({ advisors, domain }: { advisors: AdvisorRole[]; domain: string }) {
  const avgConf = Math.round(advisors.reduce((s, a) => s + (ADVISOR_STANCES[a.id]?.confidence || 50), 0) / advisors.length);
  const agreements = advisors.filter(a => (ADVISOR_STANCES[a.id]?.confidence || 50) >= 70);
  const concerns = advisors.filter(a => (ADVISOR_STANCES[a.id]?.confidence || 50) < 70);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="rounded-xl border border-[hsl(265_55%_58%/0.15)] bg-gradient-to-br from-[hsl(265_55%_58%/0.04)] to-[hsl(38_85%_58%/0.02)] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(265_55%_58%)] to-[hsl(38_85%_58%)] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[hsl(0_0%_100%/0.9)]">Unified Board Recommendation</p>
            <p className="text-[10px] text-[hsl(0_0%_100%/0.4)]">{advisors.length} advisors · Overall confidence: {avgConf}%</p>
          </div>
        </div>

        <ConfidenceBar value={avgConf} label="Board Confidence" className="mb-4" />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg border border-[hsl(152_55%_48%/0.15)] bg-[hsl(152_55%_48%/0.04)] p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[hsl(152_55%_48%/0.7)] mb-2">Advisors Aligned ({agreements.length})</p>
            {agreements.map(a => (
              <div key={a.id} className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">{a.emoji}</span>
                <span className="text-[10px] text-[hsl(0_0%_100%/0.6)]">{a.name}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-[hsl(38_85%_58%/0.15)] bg-[hsl(38_85%_58%/0.04)] p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[hsl(38_85%_58%/0.7)] mb-2">Concerns / Lower Confidence ({concerns.length})</p>
            {concerns.map(a => (
              <div key={a.id} className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">{a.emoji}</span>
                <span className="text-[10px] text-[hsl(0_0%_100%/0.6)]">{a.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-[hsl(280_40%_50%/0.06)] border border-[hsl(280_50%_50%/0.15)] p-3">
          <p className="text-[10px] font-bold text-[hsl(280_50%_75%)] mb-1">Final Motion</p>
          <p className="text-[11px] text-[hsl(0_0%_100%/0.7)] leading-relaxed">
            {domain === "business" && "Initiate phased collections (personal for TechCorp, automated for others) while monitoring pipeline velocity and resolving the open billing dispute."}
            {domain === "finance" && "Execute dual savings strategy: defer zero-usage subscriptions AND fix AWS billing anomaly, while accelerating top receivables to restore reserve buffer within 5 weeks."}
            {domain === "concierge" && "Approve NYC travel package with conditional: book airport car service within 24 hours. All other logistics confirmed and ready."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Evidence — Proof chain with source types and freshness ── */
function EvidenceView({ advisors, domain }: { advisors: AdvisorRole[]; domain: string }) {
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <div className="rounded-xl border border-[hsl(152_55%_48%/0.15)] bg-[hsl(152_55%_48%/0.03)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileCheck className="h-4 w-4 text-[hsl(152_55%_48%)]" />
          <p className="text-sm font-bold text-[hsl(0_0%_100%/0.85)]">Evidence Chain</p>
        </div>

        <div className="space-y-2">
          {advisors.map((advisor, i) => {
            const evidence = EVIDENCE_DATA[advisor.id];
            const isExpanded = expandedAdvisor === advisor.id;
            const hasEvidence = !!evidence;

            return (
              <motion.div
                key={advisor.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <button
                  onClick={() => hasEvidence && setExpandedAdvisor(isExpanded ? null : advisor.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    isExpanded
                      ? "border-[hsl(152_55%_48%/0.2)] bg-[hsl(152_55%_48%/0.04)]"
                      : "border-[hsl(0_0%_100%/0.04)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.04)]",
                  )}
                >
                  <span className="text-sm">{advisor.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-[hsl(0_0%_100%/0.75)] truncate">{advisor.name}</p>
                    <p className="text-[9px] text-[hsl(0_0%_100%/0.35)]">{advisor.role}</p>
                  </div>
                  {hasEvidence ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[hsl(152_55%_48%)]" />
                      <span className="text-[9px] text-[hsl(152_55%_48%/0.7)]">{evidence.length} sources</span>
                      {isExpanded ? <ChevronDown size={10} className="text-[hsl(0_0%_100%/0.3)]" /> : <ChevronRight size={10} className="text-[hsl(0_0%_100%/0.3)]" />}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[hsl(0_0%_40%)]" />
                      <span className="text-[9px] text-[hsl(0_0%_100%/0.25)]">Pending</span>
                    </div>
                  )}
                </button>
                <AnimatePresence>
                  {isExpanded && evidence && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-8 mt-1 space-y-1 pb-2">
                        {evidence.map((e, ei) => {
                          const style = evidenceTypeStyles[e.type];
                          return (
                            <motion.div
                              key={ei}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: ei * 0.05 }}
                              className="flex items-center gap-2 p-2 rounded-md bg-[hsl(0_0%_100%/0.02)]"
                            >
                              <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded", style.bg, style.color)}>
                                {style.label}
                              </span>
                              <p className="text-[10px] text-[hsl(0_0%_100%/0.55)] flex-1 truncate">{e.source}</p>
                              <span className="text-[8px] text-[hsl(0_0%_100%/0.25)] shrink-0">{e.freshness}</span>
                              <ConfidenceBar value={e.confidence} size="sm" showValue={false} className="w-12" />
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function DomainAdvisorBoard({ domain, className }: DomainAdvisorBoardProps) {
  const [mode, setMode] = useState<BoardMode>("roundtable");
  const roster = getAdvisorRoster(domain);

  const modes: { key: BoardMode; label: string; icon: typeof Users }[] = [
    { key: "roundtable", label: "Roundtable", icon: Users },
    { key: "ask-one", label: "Ask One", icon: MessageCircle },
    { key: "debate", label: "Debate", icon: Swords },
    { key: "synthesis", label: "Synthesis", icon: Sparkles },
    { key: "evidence", label: "Evidence", icon: FileCheck },
  ];

  return (
    <div className={cn("space-y-4 p-4", className)}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-[hsl(0_0%_100%/0.85)]">{roster.label}</h3>
          <p className="text-[10px] text-[hsl(0_0%_100%/0.35)]">{roster.advisors.length} specialized advisors</p>
        </div>
        <div className="flex gap-0.5 p-0.5 rounded-lg bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.06)]">
          {modes.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-150",
                  mode === m.key
                    ? "bg-[hsl(265_55%_58%/0.15)] text-[hsl(0_0%_100%/0.85)]"
                    : "text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.7)]"
                )}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
          {mode === "roundtable" && <RoundtableView advisors={roster.advisors} />}
          {mode === "ask-one" && <AskOneView advisors={roster.advisors} />}
          {mode === "debate" && <DebateView advisors={roster.advisors} domain={domain} />}
          {mode === "synthesis" && <SynthesisView advisors={roster.advisors} domain={domain} />}
          {mode === "evidence" && <EvidenceView advisors={roster.advisors} domain={domain} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
