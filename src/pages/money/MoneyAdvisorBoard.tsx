import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { SitaCard } from "@/components/sita/SitaCard";
import { AdvisorCouncilShell, type AdvisorConfig } from "@/components/advisors/AdvisorCouncilShell";
import { motion } from "framer-motion";
import { useState } from "react";
import { Zap } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

type MoneyMode = "stable" | "tighten" | "recovery" | "growth" | "expansion" | "debt-attack" | "tax-protection" | "founder-conservation" | "household-protection" | "launch";

const modePersonality: Record<MoneyMode, { tone: string; style: string; color: string }> = {
  stable: { tone: "Balanced & Steady", style: "Calm, measured guidance.", color: "bg-primary/10 text-primary" },
  tighten: { tone: "Conservative & Protective", style: "Cautious recommendations.", color: "bg-amber-500/10 text-amber-500" },
  recovery: { tone: "Gentle & Supportive", style: "Encouraging, non-judgmental.", color: "bg-emerald-500/10 text-emerald-500" },
  growth: { tone: "Ambitious & Strategic", style: "Forward-looking.", color: "bg-primary/10 text-primary" },
  expansion: { tone: "Bold & Opportunistic", style: "Highlight scaling opportunities.", color: "bg-violet-500/10 text-violet-500" },
  "debt-attack": { tone: "Aggressive & Focused", style: "Every dollar toward debt.", color: "bg-destructive/10 text-destructive" },
  "tax-protection": { tone: "Precise & Methodical", style: "Tax optimization focus.", color: "bg-amber-500/10 text-amber-500" },
  "founder-conservation": { tone: "Disciplined & Boundary-Aware", style: "Strict separation.", color: "bg-orange-500/10 text-orange-500" },
  "household-protection": { tone: "Collaborative & Secure", style: "Family-first decisions.", color: "bg-emerald-500/10 text-emerald-500" },
  launch: { tone: "Energized & Runway-Focused", style: "Burn rate awareness.", color: "bg-violet-500/10 text-violet-500" },
};

const modeLabels: Record<MoneyMode, string> = {
  stable: "Stable", tighten: "Tighten", recovery: "Recovery", growth: "Growth",
  expansion: "Expansion", "debt-attack": "Debt Attack", "tax-protection": "Tax Protection",
  "founder-conservation": "Founder Conservation", "household-protection": "Household Protection", launch: "Launch Mode",
};

const moneyAdvisors: AdvisorConfig[] = [
  { id: "cash-flow", name: "Cash Flow Advisor", role: "Spending Rhythm & Burn Intelligence", domain: "money", confidence: 88, status: "active", advisorId: "cash-flow", mission: "Monitor and optimize cash flow patterns for financial health", specialAbility: "3-month rolling spend analysis" },
  { id: "budget", name: "Budget Advisor", role: "Envelope & Category Health", domain: "money", confidence: 85, status: "active", advisorId: "budget", mission: "Keep spending within defined envelopes and categories", specialAbility: "Day-of-month pace analysis" },
  { id: "debt", name: "Debt Advisor", role: "Payoff Strategy & Interest Drag", domain: "money", confidence: 82, status: "active", advisorId: "debt", mission: "Optimize debt payoff strategy to minimize interest", specialAbility: "Comparative payoff simulation" },
  { id: "credit", name: "Credit Advisor", role: "Score & Utilization Intelligence", domain: "money", confidence: 72, status: "active", advisorId: "credit", mission: "Maintain and improve credit health metrics", specialAbility: "Multi-factor credit modeling" },
  { id: "tax", name: "Tax Readiness Advisor", role: "Tax Prep & Reserve Intelligence", domain: "money", confidence: 90, status: "active", advisorId: "tax", mission: "Ensure tax reserves are adequate and deductions tracked", specialAbility: "Deterministic bracket calculation" },
  { id: "household", name: "Household Finance Advisor", role: "Shared Visibility & Family Goals", domain: "money", confidence: 86, status: "active", advisorId: "household", mission: "Coordinate household financial goals and visibility", specialAbility: "Combined income/expense analysis" },
  { id: "founder", name: "Founder Money Advisor", role: "Personal/Business Boundary", domain: "money", confidence: 68, status: "active", advisorId: "founder", mission: "Maintain clean separation between personal and business finances", specialAbility: "Transaction classification scan" },
  { id: "safe-to-spend", name: "Safe-to-Spend Advisor", role: "Discretionary Room Intelligence", domain: "money", confidence: 91, status: "active", advisorId: "safe-to-spend", mission: "Calculate real-time discretionary spending room", specialAbility: "Obligation-aware balance calculation" },
];

const MoneyAdvisorBoard = () => {
  const [activeMode, setActiveMode] = useState<MoneyMode>("stable");
  const personality = modePersonality[activeMode];

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Money Advisor Board" subtitle="8 specialized advisors with adaptive personality" />
{/* Mode Personality Switcher */}
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

      {/* Interactive Advisor Council */}
      <AdvisorCouncilShell
        advisors={moneyAdvisors}
        domainLabel="Money"
        domainColor="hsl(var(--trust-safe))"
      />

      <TrustBadge level="verified" />
    </motion.div>
  );
};

export default MoneyAdvisorBoard;
