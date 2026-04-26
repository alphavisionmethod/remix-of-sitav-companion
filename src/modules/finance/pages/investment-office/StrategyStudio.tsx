// truth-allow: ia-config
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, ChevronRight, Play, Sliders, Layers, Sparkles, MessageSquare } from "lucide-react";
import { PORTFOLIO, SAMPLE_SCENARIOS, SAMPLE_THESES } from "@/hooks/useInvestmentOfficeData";
import { STRATEGY_TEMPLATES, STRATEGY_ADVISOR_COMMENTS } from "@/domains/investment";
import { useInvestmentStrategyRecords } from "@/hooks/use-investment-office";
import AllocationRebalancer from "@/modules/finance/components/investment/AllocationRebalancer";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const pctFmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
const ALLOC_COLORS: Record<string, string> = {
  stocks: "bg-primary", etfs: "bg-primary/60", crypto: "bg-[hsl(var(--trust-warn))]",
  commodities: "bg-[hsl(38,85%,58%)]", events: "bg-[hsl(280,60%,55%)]", cash: "bg-muted-foreground",
};
const STANCE_COLORS: Record<string, string> = {
  supportive: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  cautious: "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]",
  opposed: "bg-destructive/10 text-destructive",
  conditional: "bg-primary/10 text-primary",
};

export default function StrategyStudio() {
  const { data: liveData, isLoading } = useInvestmentStrategyRecords();
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState(SAMPLE_SCENARIOS[0].id);
  const currentScenario = SAMPLE_SCENARIOS.find(s => s.id === activeScenario)!;
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const advisorComments = selectedTemplate ? STRATEGY_ADVISOR_COMMENTS[selectedTemplate] : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Sliders className="h-6 w-6 text-primary" /> Strategy Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">Scenario analysis, what-if simulations, and allocation planning</p>
      </div>

      {/* Strategy Templates Gallery */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Strategy Templates</h3>
        <p className="text-xs text-muted-foreground">Pre-built allocation strategies. Select one to preview, simulate, or see advisor commentary.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {STRATEGY_TEMPLATES.map(tmpl => (
            <button key={tmpl.id} onClick={() => setSelectedTemplate(selectedTemplate === tmpl.id ? null : tmpl.id)}
              className={`rounded-xl border p-4 text-left transition-all space-y-3 ${
                selectedTemplate === tmpl.id ? "border-primary bg-primary/5" : "border-border bg-secondary/20 hover:border-primary/20"
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{tmpl.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{tmpl.name}</p>
                  <p className="text-[10px] text-muted-foreground">{tmpl.description}</p>
                </div>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
                {Object.entries(tmpl.allocation).filter(([, v]) => v > 0).map(([cls, pct]) => (
                  <div key={cls} className={`h-full ${ALLOC_COLORS[cls] || "bg-muted-foreground"}`} style={{ width: `${pct}%` }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(tmpl.allocation).filter(([, v]) => v > 0).map(([cls, pct]) => (
                  <span key={cls} className="text-[8px] text-muted-foreground capitalize">{cls} {pct}%</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Expected: <span className="text-foreground font-medium">{tmpl.expectedReturn}</span></span>
                <span className="text-muted-foreground">Max DD: <span className="text-destructive font-medium">{tmpl.maxDrawdown}</span></span>
              </div>
              {selectedTemplate === tmpl.id && (
                <div className="flex gap-2 pt-1">
                  <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Apply & Simulate
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Advisor Debate on Selected Strategy */}
      {advisorComments && (
        <div className="rounded-2xl border border-primary/15 bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Advisor Debate: {STRATEGY_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
          </h3>
          <p className="text-xs text-muted-foreground">How each advisor views this strategy for your current portfolio and market conditions.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {advisorComments.map(ac => (
              <div key={ac.advisorId} className="rounded-xl border border-border bg-secondary/20 p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ac.advisorIcon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{ac.advisorName}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${STANCE_COLORS[ac.stance]}`}>
                    {ac.stance}
                  </span>
                </div>
                <p className="text-[11px] text-foreground leading-relaxed">{ac.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario Simulator */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Play className="h-4 w-4 text-primary" /> Scenario Simulator</h3>
        <div className="flex gap-2 flex-wrap">
          {SAMPLE_SCENARIOS.map(s => (
            <button key={s.id} onClick={() => setActiveScenario(s.id)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeScenario === s.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>{s.name}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-sm text-foreground">{currentScenario.description}</p>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Assumptions</p>
              {currentScenario.assumptions.map(a => (
                <div key={a.label} className="flex justify-between text-xs border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">{a.label}</span>
                  <span className="font-medium text-foreground">{a.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-secondary/20 p-4 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Return</p>
              <p className={`text-2xl font-bold mt-1 ${currentScenario.projectedReturn >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                {pctFmt(currentScenario.projectedReturn)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-4 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Drawdown</p>
              <p className="text-2xl font-bold mt-1 text-destructive">{pctFmt(currentScenario.projectedDrawdown)}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-4 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Probability</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{currentScenario.probability}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Theses */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Active Theses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_THESES.map(th => (
            <div key={th.id} className="rounded-xl border border-border bg-secondary/20 p-4 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{th.title}</p>
                  <p className="text-[10px] text-muted-foreground">{th.timeHorizon}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${
                  th.conviction === "high" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                  th.conviction === "medium" ? "bg-primary/10 text-primary" :
                  "bg-secondary text-muted-foreground"
                }`}>{th.conviction} conviction</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{th.rationale}</p>
              <div className="flex gap-2 text-[10px]">
                {th.entryPrice && <span className="text-muted-foreground">Entry: ${th.entryPrice}</span>}
                {th.targetPrice && <span className="text-[hsl(var(--trust-safe))]">Target: ${th.targetPrice}</span>}
                {th.stopLoss && <span className="text-destructive">Stop: ${th.stopLoss}</span>}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {th.riskFactors.slice(0, 2).map(r => (
                  <span key={r} className="rounded-md bg-destructive/5 px-1.5 py-0.5 text-[9px] text-destructive flex items-center gap-0.5">
                    <AlertTriangle className="h-2 w-2" /> {r}
                  </span>
                ))}
              </div>
              <button onClick={() => navigate("/investments/journal")} className="text-[10px] text-primary hover:underline flex items-center gap-1 pt-1">
                Open thesis <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Allocation Rebalancer */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sliders className="h-4 w-4 text-primary" /> Allocation Rebalancer</h3>
        <p className="text-xs text-muted-foreground">Drag sliders to adjust weights. Lock classes to preserve them. See real-time portfolio impact below.</p>
        <AllocationRebalancer
          totalValue={PORTFOLIO.totalValue}
          classes={[
            { key: "stocks", label: "Stocks", color: "bg-primary", currentWeight: PORTFOLIO.allocationByClass.stocks || 0 },
            { key: "etfs", label: "ETFs", color: "bg-primary/60", currentWeight: PORTFOLIO.allocationByClass.etfs || 0 },
            { key: "crypto", label: "Crypto", color: "bg-[hsl(var(--trust-warn))]", currentWeight: PORTFOLIO.allocationByClass.crypto || 0 },
            { key: "commodities", label: "Commodities", color: "bg-[hsl(38,85%,58%)]", currentWeight: PORTFOLIO.allocationByClass.commodities || 0 },
            { key: "events", label: "Events", color: "bg-[hsl(280,60%,55%)]", currentWeight: PORTFOLIO.allocationByClass.events || 0 },
            { key: "cash", label: "Cash", color: "bg-muted-foreground", currentWeight: PORTFOLIO.allocationByClass.cash || 0 },
          ]}
          onApply={(weights) => toast.success("Rebalance simulation ready — review in Decision Theater", { description: Object.entries(weights).map(([k,v]) => `${k}: ${v.toFixed(1)}%`).join(" · ") })}
        />
      </div>

      {/* Current Allocation */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Current Allocation</h3>
        <div className="space-y-3">
          {Object.entries(PORTFOLIO.allocationByClass).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([cls, pct]) => (
            <div key={cls} className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted-foreground capitalize">{cls}</span>
              <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-medium text-foreground w-14 text-right">{pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
