// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Money Advisor Board
// 8 specialized advisors + Chief Money Strategist + Adaptive Personality
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { motion } from "framer-motion";
import { useState } from "react";
import { Shield, Zap } from "lucide-react";

type MoneyMode = "stable" | "tighten" | "recovery" | "growth" | "expansion" | "debt-attack" | "tax-protection" | "founder-conservation" | "household-protection" | "launch";

const modePersonality: Record<MoneyMode, { tone: string; style: string; color: string }> = {
  stable: { tone: "Balanced & Steady", style: "Calm, measured guidance. Focus on maintaining trajectory.", color: "bg-primary/10 text-primary" },
  tighten: { tone: "Conservative & Protective", style: "Cautious recommendations. Emphasize savings and risk reduction.", color: "bg-amber-500/10 text-amber-500" },
  recovery: { tone: "Gentle & Supportive", style: "Encouraging, non-judgmental. Small wins matter.", color: "bg-emerald-500/10 text-emerald-500" },
  growth: { tone: "Ambitious & Strategic", style: "Forward-looking. Identify growth opportunities and calculated risks.", color: "bg-primary/10 text-primary" },
  expansion: { tone: "Bold & Opportunistic", style: "Highlight scaling opportunities. Accept higher risk tolerance.", color: "bg-violet-500/10 text-violet-500" },
  "debt-attack": { tone: "Aggressive & Focused", style: "Every dollar toward debt. Minimize discretionary. Celebrate payoff milestones.", color: "bg-destructive/10 text-destructive" },
  "tax-protection": { tone: "Precise & Methodical", style: "Focus on tax optimization, deduction tracking, reserve adequacy.", color: "bg-amber-500/10 text-amber-500" },
  "founder-conservation": { tone: "Disciplined & Boundary-Aware", style: "Strict personal/business separation. Conservative owner draw.", color: "bg-orange-500/10 text-orange-500" },
  "household-protection": { tone: "Collaborative & Secure", style: "Family-first decisions. Shared visibility. Emergency readiness.", color: "bg-emerald-500/10 text-emerald-500" },
  launch: { tone: "Energized & Runway-Focused", style: "Burn rate awareness. Milestone-based spending. Protect runway.", color: "bg-violet-500/10 text-violet-500" },
};

const modeLabels: Record<MoneyMode, string> = {
  stable: "Stable", tighten: "Tighten", recovery: "Recovery", growth: "Growth",
  expansion: "Expansion", "debt-attack": "Debt Attack", "tax-protection": "Tax Protection",
  "founder-conservation": "Founder Conservation", "household-protection": "Household Protection", launch: "Launch Mode",
};

const advisors: Array<{
  intent: string;
  demoName: string;
  demoRole: string;
  demoConfidence: "High" | "Medium" | "Low";
  recommendations: Record<MoneyMode, string>;
  demoReasoning: string;
}> = [
  {
    intent: "cash_flow_advisory",
    demoName: "Cash Flow Advisor",
    demoRole: "Spending Rhythm & Burn Intelligence",
    demoConfidence: "High",
    recommendations: {
      stable: "Monthly net positive $2,150. Cash position strengthening. Watch Q2 tax payment timing.",
      tighten: "Reduce discretionary by 20% this month. Cash cushion needs reinforcement before Q2 taxes.",
      recovery: "You're making progress. Net positive for 2 months now. Keep the momentum — small consistent gains.",
      growth: "Cash position strong enough to increase investment allocation by $500/mo. Consider automating.",
      expansion: "Runway supports hiring. Cash position can absorb 1 additional FTE at current burn rate.",
      "debt-attack": "Redirect $800 from discretionary to debt payments. This accelerates payoff by 4 months.",
      "tax-protection": "Set aside an additional $400 this month for Q2 estimated payment. Currently 75% reserved.",
      "founder-conservation": "Owner draw stable but reduce by 10% this quarter to build operating reserve.",
      "household-protection": "Household cash flow strong. Ensure emergency fund contribution continues at $500/mo.",
      launch: "Burn rate: $4,200/mo. At current cash, runway is 8.2 months. Monitor weekly.",
    },
    demoReasoning: "3-month rolling analysis of income timing vs. obligation schedule.",
  },
  {
    intent: "budget_advisory",
    demoName: "Budget Advisor",
    demoRole: "Envelope & Category Health",
    demoConfidence: "High",
    recommendations: {
      stable: "Spending pace on-track. Dining at 78% with 12 days remaining — manageable.",
      tighten: "Freeze non-essential envelopes. Dining should pause. Groceries only for remainder of month.",
      recovery: "Focus on 3 essential categories only. Don't worry about optimization yet — just stay within bounds.",
      growth: "Consider adding an 'investments' envelope. Increase savings allocation by $200.",
      expansion: "Business expense envelopes may need upward revision for scaling activities.",
      "debt-attack": "Minimize all discretionary envelopes. Redirect savings to debt acceleration.",
      "tax-protection": "Add a tax reserve envelope if not present. Auto-fund 25% of each income deposit.",
      "founder-conservation": "Strict separation: business and personal envelopes must not cross-fund.",
      "household-protection": "Shared household envelopes are healthy. Individual discretionary needs alignment.",
      launch: "Keep only essential envelopes active. All non-critical categories should be at minimum.",
    },
    demoReasoning: "Day-of-month pace analysis against 14 active envelopes.",
  },
  {
    intent: "debt_advisory",
    demoName: "Debt Advisor",
    demoRole: "Payoff Strategy & Interest Drag",
    demoConfidence: "High",
    recommendations: {
      stable: "Avalanche strategy saves $3,200 vs snowball. Continue current payoff schedule.",
      tighten: "Make minimum payments only. Preserve cash for obligations.",
      recovery: "Pay minimums consistently. That's a win right now. Build the habit first.",
      growth: "Consider accelerating highest-APR debt payoff. Extra $200/mo saves $1,100 in interest.",
      expansion: "Debt load is manageable. No acceleration needed unless rates rise.",
      "debt-attack": "ALL extra cash to Visa Platinum (22.99% APR). Then auto loan. Total payoff in 18 months.",
      "tax-protection": "Maintain current payments. Tax reserve takes priority over extra debt payments.",
      "founder-conservation": "Separate business debt from personal. Do not cross-collateralize.",
      "household-protection": "Coordinate household debt payments. Both partners should see the full picture.",
      launch: "Minimize debt service. Consider deferment options if available to protect runway.",
    },
    demoReasoning: "Comparative payoff simulation across 4 debt accounts.",
  },
  {
    intent: "credit_advisory",
    demoName: "Credit Advisor",
    demoRole: "Score & Utilization Intelligence",
    demoConfidence: "Medium",
    recommendations: {
      stable: "Estimated score: 735. Utilization at 24.5% — good. Enable auto-pay on auto loan.",
      tighten: "Keep utilization below 30%. Avoid new credit applications this quarter.",
      recovery: "Focus on on-time payments. That's 35% of your score. Set up auto-pay for everything.",
      growth: "Score positioning good for new credit if needed. Consider a limit increase request.",
      expansion: "Credit profile supports business credit applications if scaling requires it.",
      "debt-attack": "Utilization will improve as balances drop. Score should rise 20-40 points over payoff period.",
      "tax-protection": "No credit actions needed. Maintain current utilization and payment history.",
      "founder-conservation": "Keep personal and business credit profiles strictly separate.",
      "household-protection": "Monitor both household members' utilization. Combined profile matters for major purchases.",
      launch: "Preserve credit availability as emergency runway. Don't draw down credit lines.",
    },
    demoReasoning: "Multi-factor credit model: utilization 24.5%, DTI 10.4%.",
  },
  {
    intent: "tax_readiness_advisory",
    demoName: "Tax Readiness Advisor",
    demoRole: "Tax Preparation & Reserve Intelligence",
    demoConfidence: "High",
    recommendations: {
      stable: "75% of Q2 tax reserved. 3 deductible categories need receipts. File by April 15.",
      tighten: "Tax reserve is non-negotiable even in tighten mode. Maintain current set-aside rate.",
      recovery: "If tax reserves are behind, start with even small weekly contributions. Build the habit.",
      growth: "Explore additional deduction opportunities. Consider retirement account contributions.",
      expansion: "Business growth may change tax bracket. Model scenarios for Q3-Q4 liability.",
      "debt-attack": "Tax reserve takes priority over extra debt payments. No exceptions.",
      "tax-protection": "PRIORITY MODE: Increase reserve to 100% of estimated liability. Document all deductions. Review quarterly.",
      "founder-conservation": "Ensure business tax obligations are separate. Owner draw has tax implications — model them.",
      "household-protection": "Coordinate filing strategy. Joint vs separate may affect household tax burden.",
      launch: "Track all business expenses meticulously. Every deduction matters during launch phase.",
    },
    demoReasoning: "Deterministic bracket calculation against YTD income.",
  },
  {
    intent: "household_advisory",
    demoName: "Household Finance Advisor",
    demoRole: "Shared Visibility & Family Goals",
    demoConfidence: "High",
    recommendations: {
      stable: "Household savings rate: 32%. Emergency fund 60% funded. On track for September.",
      tighten: "Communicate tighten mode to household. Align on reduced spending together.",
      recovery: "Recovery is a team effort. Share progress with household. Celebrate small wins together.",
      growth: "Household income strong. Discuss increasing shared goal contributions.",
      expansion: "Family financial position supports expansion plans. Ensure emergency fund stays intact.",
      "debt-attack": "Household should agree on debt attack timeline. Shared sacrifice, shared celebration.",
      "tax-protection": "Review household tax strategy. Coordinate deductions across both earners.",
      "founder-conservation": "Protect household finances from business volatility. Firewall personal reserves.",
      "household-protection": "PRIORITY MODE: Emergency fund to 100%. Insurance coverage review. Estate planning check.",
      launch: "Household must understand launch runway. Set clear 'abort criteria' together.",
    },
    demoReasoning: "Combined 2-member income/expense analysis.",
  },
  {
    intent: "founder_money_advisory",
    demoName: "Founder Money Advisor",
    demoRole: "Personal/Business Boundary Intelligence",
    demoConfidence: "Medium",
    recommendations: {
      stable: "Minor co-mingling: $120 personal in business, $45 business in personal. Low risk.",
      tighten: "Tighten boundary controls. No cross-entity spending until cash normalizes.",
      recovery: "Focus on clean separation going forward. Don't stress past co-mingling — just fix the pattern.",
      growth: "Boundary is clean. Safe to increase owner draw proportionally with revenue growth.",
      expansion: "As business scales, formalize financial separation. Consider separate bookkeeping.",
      "debt-attack": "Keep business and personal debt attacks separate. Don't rob one to pay the other.",
      "tax-protection": "Clean separation is critical for tax season. Resolve any co-mingling before filing.",
      "founder-conservation": "PRIORITY MODE: Zero tolerance for co-mingling. Weekly boundary audit. Reduce owner draw 10%.",
      "household-protection": "Business finances must not create household risk. Maintain firewall.",
      launch: "Launch spending must come from business accounts only. Personal runway is sacred.",
    },
    demoReasoning: "Transaction classification scan across business and personal accounts.",
  },
  {
    intent: "safe_to_spend_advisory",
    demoName: "Safe-to-Spend Advisor",
    demoRole: "Discretionary Room Intelligence",
    demoConfidence: "High",
    recommendations: {
      stable: "Safe to spend: $2,450 after all obligations. Covers 8 days of average discretionary.",
      tighten: "Safe to spend reduced to $1,200. Essential spending only. 4 days of cushion.",
      recovery: "Safe to spend: $800. Small purchases okay but check before anything over $50.",
      growth: "Safe to spend: $3,100. Room for strategic purchases and small investments.",
      expansion: "Discretionary room is healthy. Focus spending on growth-enabling purchases.",
      "debt-attack": "Safe to spend: $600. All excess goes to debt. This is temporary — stay focused.",
      "tax-protection": "Safe to spend after tax reserve: $1,800. Don't touch the tax allocation.",
      "founder-conservation": "Personal safe-to-spend: $1,500. Business safe-to-spend calculated separately.",
      "household-protection": "Household safe-to-spend: $2,000 shared. Coordinate on purchases over $200.",
      launch: "Minimize personal spending. Every dollar extends runway. Safe-to-spend: $500.",
    },
    demoReasoning: "Balance minus upcoming bills, reserve allocations, debt minimums, and tax escrow.",
  },
];

const MoneyAdvisorBoard = () => {
  const { isDemoMode } = useDataMode();
  const [activeMode, setActiveMode] = useState<MoneyMode>("stable");
  const personality = modePersonality[activeMode];

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Money Advisor Board" subtitle="8 specialized advisors with adaptive personality based on your current mode" />
      <DemoModeBadge />

      {/* Active Mode Badge + Personality */}
      <SitaCard hover={false} className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <p className="font-display text-sm font-semibold">Adaptive Advisor Personality</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${personality.color}`}>
            {modeLabels[activeMode]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          <span className="font-semibold text-foreground">Tone: {personality.tone}</span> — {personality.style}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(modeLabels) as MoneyMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`text-[10px] px-2.5 py-1 rounded-full transition-all ${activeMode === mode
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}
            >
              {modeLabels[mode]}
            </button>
          ))}
        </div>
      </SitaCard>

      {/* Chief Strategist */}
      <SitaSectionHeader title="Chief Money Strategist" />
      <LiveAdvisorCard
        advisor="money"
        intent="chief_money_strategy"
        context={{ advisor_count: 8, mode: activeMode }}
        demoName="Chief Money Strategist"
        demoRole="Holistic Financial Synthesis"
        demoConfidence="High"
        demoRecommendation={`[${modeLabels[activeMode]} Mode] Overall financial health: B+ (76/100). ${personality.tone} posture active. Three priorities adapted to current mode. All 8 advisors aligned to ${modeLabels[activeMode]} personality.`}
        demoReasoning={`Cross-domain synthesis from 8 specialized advisors. Mode: ${modeLabels[activeMode]}. ${personality.style}`}
      />

      {/* Specialized Advisors Grid */}
      <SitaSectionHeader title="Specialized Advisors" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {advisors.map(a => (
          <div key={a.intent} className="relative">
            <div className={`absolute top-2 right-2 z-10 text-[9px] font-medium px-1.5 py-0.5 rounded ${personality.color}`}>
              {modeLabels[activeMode]}
            </div>
            <LiveAdvisorCard
              advisor="money"
              intent={a.intent}
              context={{ mode: activeMode }}
              demoName={a.demoName}
              demoRole={a.demoRole}
              demoConfidence={a.demoConfidence}
              demoRecommendation={a.recommendations[activeMode]}
              demoReasoning={`${a.demoReasoning} Tone: ${personality.tone}.`}
            />
          </div>
        ))}
      </div>

      <TrustBadge level="verified" />
    </motion.div>
  );
};

export default MoneyAdvisorBoard;
