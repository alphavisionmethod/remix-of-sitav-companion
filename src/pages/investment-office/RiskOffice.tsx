import { useState } from "react";
import { Shield, AlertTriangle, BarChart3, PieChart, Eye, Settings, Zap } from "lucide-react";
import { INVESTMENT_ADVISORS, PLATFORM_CONNECTIONS, PORTFOLIO } from "@/hooks/useInvestmentOfficeData";
import { STRESS_SCENARIOS, RISK_POLICIES } from "@/domains/investment/mock-data";
import { useRiskScenarios } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

export default function RiskOffice() {
  const { data: liveData, isLoading } = useRiskScenarios();
  const p = PORTFOLIO;
  const riskAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "risk");
  const behavAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "behavioral");
  const macroAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "macro");

  const concentrationWarnings = p.holdings
    .filter(h => h.weight > 15)
    .map(h => ({ name: h.instrument.symbol, weight: h.weight, msg: `${h.instrument.symbol} is ${h.weight.toFixed(1)}% of portfolio — consider trimming` }));

  const classConcentrations = Object.entries(p.allocationByClass)
    .filter(([, v]) => v > 40)
    .map(([cls, pct]) => ({ cls, pct, msg: `${cls} allocation at ${pct.toFixed(1)}% — above recommended 40% threshold` }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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

      {/* Scenario Stress Tests */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Zap className="h-4 w-4 text-destructive" /> Scenario Stress Tests</h3>
        <p className="text-[10px] text-muted-foreground">Estimated portfolio impact under adverse scenarios</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {STRESS_SCENARIOS.map(ss => (
            <div key={ss.id} className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{ss.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{ss.name}</p>
                  <p className="text-[10px] text-muted-foreground">{ss.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground uppercase">Portfolio Impact</span>
                <span className="text-sm font-bold text-destructive">{ss.impact}%</span>
              </div>
              <div className="space-y-1">
                {Object.entries(ss.portfolioImpact).filter(([, v]) => v !== 0).map(([cls, impact]) => (
                  <div key={cls} className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground capitalize">{cls}</span>
                    <span className={impact >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}>{impact >= 0 ? "+" : ""}{impact}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Policy Controls */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Risk Policy Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {RISK_POLICIES.map(rp => (
            <div key={rp.id} className={`rounded-xl border p-3 space-y-1 ${
              rp.status === "breach" ? "border-destructive/20 bg-destructive/5" :
              rp.status === "warn" ? "border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5" :
              "border-border bg-secondary/20"
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">{rp.label}</p>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                  rp.status === "breach" ? "bg-destructive/10 text-destructive" :
                  rp.status === "warn" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
                  "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]"
                }`}>{rp.status}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Limit: {rp.value}</span>
                <span className="text-foreground">Current: {rp.current}</span>
              </div>
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

      {/* Multi-Advisor Risk Council */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Risk Advisor Council</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[riskAdvisor, macroAdvisor, behavAdvisor].filter(Boolean).map(adv => adv && (
            <div key={adv.id} className="rounded-xl border border-border bg-secondary/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{adv.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{adv.title}</p>
                  <p className="text-[10px] text-muted-foreground">{adv.confidenceLevel} confidence</p>
                </div>
              </div>
              <p className="text-[11px] text-foreground leading-relaxed">{adv.portfolioAwareness}</p>
            </div>
          ))}
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