import { motion } from "framer-motion";
import { GitCompareArrows, AlertTriangle, Check, HelpCircle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useInvestmentDecisions } from "@/hooks/use-investment-office";

const DEMO_DISAGREEMENTS = [
  {
    id: "dis1", topic: "NVDA Add Position",
    advisorA: { name: "Maven (Equity)", emoji: "📈", stance: "Constructive", confidence: 78, reasoning: "AI capex cycle intact. Blackwell ramp strong. Earnings trajectory supports current valuation. Add on any dip." },
    advisorB: { name: "Sentinel (Risk)", emoji: "🛡️", stance: "Cautious", confidence: 72, reasoning: "Concentration already 6.2%. Adding creates 9.2% single-stock exposure. Tech correlation amplifies portfolio risk in drawdown." },
    keyAssumptionConflict: "Growth trajectory vs concentration risk — Equity sees upside justifying the bet; Risk sees portfolio fragility from concentration.",
    resolvingEvidence: "Next earnings report and Fed rate decision will clarify growth vs macro risk balance. Wait for both catalysts before deciding.",
    implication: "opportunity",
  },
  {
    id: "dis2", topic: "Crypto Sleeve Sizing",
    advisorA: { name: "Cipher (Crypto)", emoji: "🔐", stance: "Bullish", confidence: 70, reasoning: "ETF inflows structural. Halving dynamics playing out. Institutional adoption creating demand floor. Maintain or grow sleeve." },
    advisorB: { name: "Mirror (Behavioral)", emoji: "🪞", stance: "Cautious", confidence: 65, reasoning: "User has increased crypto 3x in 4 months. Pattern suggests momentum-chasing. Crypto sleeve already above policy target. Pause and review." },
    keyAssumptionConflict: "Market opportunity vs behavioral pattern — Crypto sees structural bull case; Behavioral sees potential FOMO-driven overallocation.",
    resolvingEvidence: "Compare pre-trade thesis documentation quality for recent crypto adds. If thesis quality is declining while position size is increasing, behavioral concern is valid.",
    implication: "caution",
  },
  {
    id: "dis3", topic: "Gold Allocation Increase",
    advisorA: { name: "Atlas (Macro)", emoji: "🌍", stance: "Strongly Supportive", confidence: 82, reasoning: "Rate cuts incoming. Central bank buying at record. Geopolitical risk premium justified. Gold is the regime hedge." },
    advisorB: { name: "Router (Execution)", emoji: "🔄", stance: "Supportive with Timing Note", confidence: 60, reasoning: "Gold at ATH. Entry price risk is elevated. Consider staged entry over 3 tranches to average in rather than lump-sum at peak." },
    keyAssumptionConflict: "Thesis strength vs entry timing — both agree on direction but disagree on execution approach.",
    resolvingEvidence: "This is an execution disagreement, not a thesis disagreement. Can be resolved by using staged entry as a compromise.",
    implication: "proceed",
  },
];

export default function DisagreementEngine() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useInvestmentDecisions();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><GitCompareArrows className="h-6 w-6 text-primary" /> Disagreement Engine</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Where advisors disagree, what assumptions conflict, and what evidence would resolve the debate</p>
      </div>

      {DEMO_DISAGREEMENTS.map((d, di) => (
        <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.06 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <GitCompareArrows className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">{d.topic}</h2>
            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
              d.implication === "opportunity" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
              d.implication === "caution" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
              "bg-primary/10 text-primary"
            }`}>{d.implication === "opportunity" ? "May signal opportunity" : d.implication === "caution" ? "Suggests caution" : "Proceed with nuance"}</span>
          </div>

          {/* Advisor Debate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[d.advisorA, d.advisorB].map((adv, i) => (
              <div key={i} className={`rounded-xl border p-4 space-y-2 ${
                adv.stance.includes("Bullish") || adv.stance.includes("Constructive") || adv.stance.includes("Supportive")
                  ? "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5"
                  : "border-[hsl(var(--trust-warn))]/15 bg-[hsl(var(--trust-warn))]/5"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{adv.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{adv.name}</p>
                    <p className="text-[10px] text-muted-foreground">Stance: {adv.stance} · Confidence: {adv.confidence}%</p>
                  </div>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{adv.reasoning}</p>
              </div>
            ))}
          </div>

          {/* Assumption Conflict */}
          <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 space-y-1">
            <p className="text-[9px] font-semibold text-primary uppercase flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Key Assumption Conflict</p>
            <p className="text-xs text-foreground">{d.keyAssumptionConflict}</p>
          </div>

          {/* Resolving Evidence */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-1">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1"><HelpCircle className="h-3 w-3" /> What Would Resolve This</p>
            <p className="text-xs text-foreground">{d.resolvingEvidence}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
