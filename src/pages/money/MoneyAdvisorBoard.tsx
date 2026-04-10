// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Money Advisor Board
// 8 specialized advisors + Chief Money Strategist
// ═══════════════════════════════════════════════════════════════

import { SitaSectionHeader } from "@/components/sita/SitaCard";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { motion } from "framer-motion";

const advisors = [
  {
    intent: "cash_flow_advisory",
    demoName: "Cash Flow Advisor",
    demoRole: "Spending Rhythm & Burn Intelligence",
    demoConfidence: "High" as const,
    demoRecommendation: "Monthly net positive $2,150. Cash position strengthening. Watch Q2 tax payment timing — may create a 5-day tight window around April 15.",
    demoReasoning: "3-month rolling analysis of income timing vs. obligation schedule. Seasonal patterns considered.",
  },
  {
    intent: "budget_advisory",
    demoName: "Budget Advisor",
    demoRole: "Envelope & Category Health",
    demoConfidence: "High" as const,
    demoRecommendation: "Spending pace is on-track. Dining envelope at 78% with 12 days remaining — consider slowing. Groceries tracking well.",
    demoReasoning: "Day-of-month pace analysis against 14 active envelopes. 2 categories approaching overspend.",
  },
  {
    intent: "debt_advisory",
    demoName: "Debt Advisor",
    demoRole: "Payoff Strategy & Interest Drag",
    demoConfidence: "High" as const,
    demoRecommendation: "Avalanche strategy saves $3,200 vs. snowball. Focus extra payments on Visa Platinum (22.99% APR). $328/mo in interest drag.",
    demoReasoning: "Comparative payoff simulation across 4 debt accounts. Avalanche vs snowball difference calculated over 48-month horizon.",
  },
  {
    intent: "credit_advisory",
    demoName: "Credit Advisor",
    demoRole: "Score & Utilization Intelligence",
    demoConfidence: "Medium" as const,
    demoRecommendation: "Estimated score: 735 (improving). Utilization at 24.5% — good. Auto-pay on all accounts except auto loan — enable to protect payment history.",
    demoReasoning: "Multi-factor credit model: utilization 24.5%, DTI 10.4%, account mix diverse, 1 account without autopay.",
  },
  {
    intent: "tax_readiness_advisory",
    demoName: "Tax Readiness Advisor",
    demoRole: "Tax Preparation & Reserve Intelligence",
    demoConfidence: "High" as const,
    demoRecommendation: "75% of estimated Q2 tax obligation reserved. 3 deductible expense categories need receipt documentation. File quarterly estimate by April 15.",
    demoReasoning: "Deterministic bracket calculation against YTD income. Cross-referenced with receipt proof coverage.",
  },
  {
    intent: "household_advisory",
    demoName: "Household Finance Advisor",
    demoRole: "Shared Visibility & Family Goals",
    demoConfidence: "High" as const,
    demoRecommendation: "Household savings rate: 32%. Emergency fund 60% funded — on track for September. Home down payment needs acceleration to hit 2028 target.",
    demoReasoning: "Combined 2-member income/expense analysis. Goal pacing projections with contribution history.",
  },
  {
    intent: "founder_money_advisory",
    demoName: "Founder Money Advisor",
    demoRole: "Personal/Business Boundary Intelligence",
    demoConfidence: "Medium" as const,
    demoRecommendation: "Minor co-mingling detected: $120 personal in business, $45 business in personal. Low risk but address before tax season. Owner draw stable.",
    demoReasoning: "Transaction classification scan across business and personal accounts. Cross-entity pattern detection.",
  },
  {
    intent: "safe_to_spend_advisory",
    demoName: "Safe-to-Spend Advisor",
    demoRole: "Discretionary Room Intelligence",
    demoConfidence: "High" as const,
    demoRecommendation: "Safe to spend: $2,450 after all obligations, reserves, and tax set-asides. This covers 8 days of average discretionary spending.",
    demoReasoning: "Balance minus upcoming bills, reserve allocations, debt minimums, and tax escrow. 95% confidence for 7-day window.",
  },
];

const MoneyAdvisorBoard = () => {
  const { isDemoMode } = useDataMode();

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Money Advisor Board" subtitle="8 specialized advisors synthesizing your complete financial picture" />
      <DemoModeBadge />

      {/* Chief Strategist */}
      <SitaSectionHeader title="Chief Money Strategist" />
      <LiveAdvisorCard
        advisor="money"
        intent="chief_money_strategy"
        context={{ advisor_count: 8 }}
        demoName="Chief Money Strategist"
        demoRole="Holistic Financial Synthesis"
        demoConfidence="High"
        demoRecommendation="Overall financial health: B+ (76/100). Cash position strong, debt load manageable, savings rate above target. Three priorities: (1) Complete emergency fund by September, (2) Enable auto-pay on auto loan, (3) Document 3 deductible categories before Q2 filing."
        demoReasoning="Cross-domain synthesis from 8 specialized advisors. Weighted by urgency, impact, and confidence levels."
      />

      {/* Specialized Advisors Grid */}
      <SitaSectionHeader title="Specialized Advisors" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {advisors.map(a => (
          <LiveAdvisorCard
            key={a.intent}
            advisor="money"
            intent={a.intent}
            context={{}}
            demoName={a.demoName}
            demoRole={a.demoRole}
            demoConfidence={a.demoConfidence}
            demoRecommendation={a.demoRecommendation}
            demoReasoning={a.demoReasoning}
          />
        ))}
      </div>

      <TrustBadge level="verified" />
    </motion.div>
  );
};

export default MoneyAdvisorBoard;
