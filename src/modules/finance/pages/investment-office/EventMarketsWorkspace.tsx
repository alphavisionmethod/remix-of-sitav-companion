// truth-allow: ia-config
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Calendar, TrendingUp, TrendingDown, AlertTriangle, Target, Shield, ChevronRight, BarChart3 } from "lucide-react";
import { INSTRUMENTS, INVESTMENT_ADVISORS, SAMPLE_SCENARIOS } from "@/hooks/useInvestmentOfficeData";
import { useMarketWatchlistItems } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const eventInstruments = INSTRUMENTS.filter(i => i.assetClass === "events");
const allCatalysts = INSTRUMENTS.flatMap(i => i.catalysts.map(c => ({ ...c, instrument: i }))).sort((a, b) => a.date.localeCompare(b.date));
const eventAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "events");

export default function EventMarketsWorkspace() {
  const { data: liveData, isLoading } = useMarketWatchlistItems();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"markets" | "catalysts" | "scenarios">("markets");


  return (
    <div className="mx-auto max-w-7xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> Event & Prediction Markets</h1>
        <p className="text-sm text-muted-foreground mt-1">Probability intelligence, catalysts, and disciplined event positioning</p>
      </div>

      {/* Event Advisor */}
      {eventAdvisor && (
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 flex items-start gap-3">
          <span className="text-xl">{eventAdvisor.icon}</span>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{eventAdvisor.title}</p>
            <p className="text-sm text-foreground mt-1">{eventAdvisor.currentInsight}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">{eventAdvisor.confidence}%</span>
        </div>
      )}

      {/* Important notice */}
      <div className="rounded-xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-3 flex items-start gap-2.5">
        <Shield className="h-4 w-4 text-[hsl(var(--trust-warn))] shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-semibold text-[hsl(var(--trust-warn))] uppercase tracking-wider">Probability Office — Not a Gambling Desk</p>
          <p className="text-[11px] text-foreground">Event markets are tools for scenario intelligence and disciplined positioning. Every position should be thesis-backed with defined risk limits.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {(["markets", "catalysts", "scenarios"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-xs font-medium capitalize transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {t === "markets" ? "Event Markets" : t === "catalysts" ? "Catalyst Calendar" : "Scenario Impact"}
          </button>
        ))}
      </div>

      {tab === "markets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventInstruments.map(inst => (
            <button key={inst.id} onClick={() => navigate(`/investments/instrument/${inst.id}`)}
              className="rounded-2xl border border-border bg-card p-5 text-left hover:border-primary/20 transition-all space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{inst.logoIcon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{inst.name}</p>
                  <p className="text-[10px] text-muted-foreground">{inst.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{(inst.price * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-muted-foreground">probability</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{inst.description}</p>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-medium flex items-center gap-0.5 ${inst.changePct24h >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                  {inst.changePct24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {inst.changePct24h >= 0 ? "+" : ""}{inst.changePct24h.toFixed(2)}% 24h
                </span>
                {inst.riskLevel === "high" || inst.riskLevel === "very-high" ? (
                  <span className="text-[9px] rounded-full bg-destructive/10 text-destructive px-2 py-0.5 flex items-center gap-0.5">
                    <AlertTriangle className="h-2.5 w-2.5" /> {inst.riskLevel}
                  </span>
                ) : null}
              </div>
              {/* Bull / Bear */}
              {inst.bullCase && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div><p className="text-[9px] text-[hsl(var(--trust-safe))] font-medium uppercase">For</p><p className="text-[10px] text-foreground">{inst.bullCase}</p></div>
                  <div><p className="text-[9px] text-destructive font-medium uppercase">Against</p><p className="text-[10px] text-foreground">{inst.bearCase}</p></div>
                </div>
              )}
            </button>
          ))}
          {eventInstruments.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">No event markets available</div>
          )}
        </div>
      )}

      {tab === "catalysts" && (
        <div className="space-y-3">
          {allCatalysts.map(cat => (
            <div key={cat.id} className="rounded-2xl border border-border bg-card p-4 flex items-start gap-4 hover:border-primary/15 transition-all">
              <div className="rounded-xl bg-secondary p-2.5 text-center shrink-0 w-16">
                <p className="text-lg font-bold text-foreground">{new Date(cat.date).getDate()}</p>
                <p className="text-[9px] text-muted-foreground uppercase">{new Date(cat.date).toLocaleDateString("en", { month: "short", year: "2-digit" })}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{cat.instrument.logoIcon}</span>
                  <p className="text-sm font-semibold text-foreground">{cat.title}</p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground capitalize">{cat.type}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{cat.instrument.symbol} · {cat.instrument.name}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-medium capitalize ${
                cat.impact === "positive" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                cat.impact === "negative" ? "bg-destructive/10 text-destructive" :
                "bg-secondary text-muted-foreground"
              }`}>{cat.impact}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "scenarios" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_SCENARIOS.map(s => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">{s.probability}% prob</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.description}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-secondary/30 p-2.5 text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">Return</p>
                  <p className={`text-lg font-bold ${s.projectedReturn >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                    {s.projectedReturn >= 0 ? "+" : ""}{s.projectedReturn}%
                  </p>
                </div>
                <div className="rounded-xl bg-secondary/30 p-2.5 text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">Drawdown</p>
                  <p className="text-lg font-bold text-destructive">{s.projectedDrawdown}%</p>
                </div>
                <div className="rounded-xl bg-secondary/30 p-2.5 text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">Likelihood</p>
                  <p className="text-lg font-bold text-foreground">{s.probability}%</p>
                </div>
              </div>
              <div className="space-y-1 pt-1 border-t border-border">
                {s.assumptions.map(a => (
                  <div key={a.label} className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{a.label}</span>
                    <span className="font-medium text-foreground">{a.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
