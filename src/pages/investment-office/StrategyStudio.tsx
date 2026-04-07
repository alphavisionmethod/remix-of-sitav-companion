import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, ChevronRight, Play, Sliders } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { PORTFOLIO, SAMPLE_SCENARIOS, SAMPLE_THESES } from "@/hooks/useInvestmentOfficeData";
import { useInvestmentStrategyRecords } from "@/hooks/use-investment-office";
import { useDataMode } from "@/contexts/DataModeContext";

const pctFmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

export default function StrategyStudio() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useInvestmentStrategyRecords();
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState(SAMPLE_SCENARIOS[0].id);
  const currentScenario = SAMPLE_SCENARIOS.find(s => s.id === activeScenario)!;


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Sliders className="h-6 w-6 text-primary" /> Strategy Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">Scenario analysis, what-if simulations, and allocation planning</p>
      </div>

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

      {/* Allocation Planning */}
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
