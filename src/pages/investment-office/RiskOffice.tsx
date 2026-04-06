import { Shield, AlertTriangle, BarChart3, PieChart, TrendingDown, Eye } from "lucide-react";
import { PORTFOLIO, INVESTMENT_ADVISORS, PLATFORM_CONNECTIONS } from "@/lib/investment-office/mock-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

export default function RiskOffice() {
  const p = PORTFOLIO;
  const riskAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "risk");
  const behavAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "behavioral");

  const concentrationWarnings = p.holdings
    .filter(h => h.weight > 15)
    .map(h => ({ name: h.instrument.symbol, weight: h.weight, msg: `${h.instrument.symbol} is ${h.weight.toFixed(1)}% of portfolio — consider trimming` }));

  const classConcentrations = Object.entries(p.allocationByClass)
    .filter(([, v]) => v > 40)
    .map(([cls, pct]) => ({ cls, pct, msg: `${cls} allocation at ${pct.toFixed(1)}% — above recommended 40% threshold` }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> Risk Office</h1>
        <p className="text-sm text-muted-foreground mt-1">Exposure monitoring, concentration warnings, and risk controls</p>
      </div>

      {/* Risk Advisor */}
      {riskAdvisor && (
        <div className="rounded-2xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-4 flex items-start gap-3">
          <span className="text-xl">{riskAdvisor.icon}</span>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-[hsl(var(--trust-warn))] uppercase tracking-wider">{riskAdvisor.title}</p>
            <p className="text-sm text-foreground mt-1">{riskAdvisor.currentInsight}</p>
          </div>
          <span className="rounded-full bg-[hsl(var(--trust-warn))]/10 px-2.5 py-1 text-[10px] font-bold text-[hsl(var(--trust-warn))]">{riskAdvisor.confidence}%</span>
        </div>
      )}

      {/* Risk Score */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Risk Score", value: `${p.riskScore}/100`, color: p.riskScore > 70 ? "text-[hsl(var(--trust-warn))]" : "text-[hsl(var(--trust-safe))]" },
          { label: "Market Regime", value: p.regime.toUpperCase(), color: "text-primary" },
          { label: "Positions", value: String(p.holdings.length), color: "text-foreground" },
          { label: "Warnings", value: String(concentrationWarnings.length + classConcentrations.length), color: concentrationWarnings.length > 0 ? "text-[hsl(var(--trust-warn))]" : "text-[hsl(var(--trust-safe))]" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Concentration Warnings */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[hsl(var(--trust-warn))]" /> Concentration Alerts</h3>
          {concentrationWarnings.length === 0 && classConcentrations.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No concentration warnings</p>
          ) : (
            <>
              {concentrationWarnings.map(w => (
                <div key={w.name} className="rounded-xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-3">
                  <p className="text-xs font-medium text-foreground">{w.msg}</p>
                </div>
              ))}
              {classConcentrations.map(w => (
                <div key={w.cls} className="rounded-xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-3">
                  <p className="text-xs font-medium text-foreground capitalize">{w.msg}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Exposure by Class */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Exposure by Class</h3>
          {Object.entries(p.allocationByClass).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([cls, pct]) => (
            <div key={cls} className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted-foreground capitalize">{cls}</span>
              <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pct > 40 ? "bg-[hsl(var(--trust-warn))]" : "bg-primary/60"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <span className={`text-xs font-medium w-14 text-right ${pct > 40 ? "text-[hsl(var(--trust-warn))]" : "text-foreground"}`}>{pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform / Counterparty Risk */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Platform & Counterparty Risk</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLATFORM_CONNECTIONS.filter(p => p.status === "connected").map(pc => {
            const platformHoldings = PORTFOLIO.holdings.filter(h => h.platform === pc.name);
            const platformValue = platformHoldings.reduce((s, h) => s + h.currentValue, 0);
            const platformPct = (platformValue / PORTFOLIO.totalValue) * 100;
            return (
              <div key={pc.id} className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{pc.icon}</span>
                  <p className="text-xs font-medium text-foreground">{pc.name}</p>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Value</span><span className="text-foreground">${platformValue.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">% of Total</span><span className={platformPct > 50 ? "text-[hsl(var(--trust-warn))]" : "text-foreground"}>{platformPct.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Positions</span><span className="text-foreground">{platformHoldings.length}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Behavioral */}
      {behavAdvisor && (
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 flex items-start gap-3">
          <span className="text-xl">{behavAdvisor.icon}</span>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{behavAdvisor.title}</p>
            <p className="text-sm text-foreground mt-1">{behavAdvisor.currentInsight}</p>
          </div>
        </div>
      )}
    </div>
  );
}
