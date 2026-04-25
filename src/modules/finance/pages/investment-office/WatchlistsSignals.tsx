import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus, Bell, Brain, TrendingUp, TrendingDown, ChevronRight, Star, Zap, Shield } from "lucide-react";
import { SparklineChart } from "@/platform/sita/components/sita/SparklineChart";
import { INSTRUMENTS, PORTFOLIO, WATCHLISTS } from "@/hooks/useInvestmentOfficeData";
import { SPARKLINE_DATA } from "@/domains/investment/mock-data";
import { useMarketWatchlistItems } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function WatchlistsSignals() {
  const { data: liveData, isLoading } = useMarketWatchlistItems();
  const navigate = useNavigate();
  const [activeList, setActiveList] = useState(WATCHLISTS[0].id);
  const [specialView, setSpecialView] = useState<"none" | "advisor" | "risk" | "catalyst">("none");
  const current = WATCHLISTS.find(w => w.id === activeList) || WATCHLISTS[0];

  const highRiskHoldings = PORTFOLIO.holdings.filter(h => h.weight > 12);
  const catalystInstruments = INSTRUMENTS.filter(i => i.catalysts.length > 0);

  const displayInstruments = specialView === "advisor"
    ? highRiskHoldings.map(h => h.instrument)
    : specialView === "catalyst"
    ? catalystInstruments
    : specialView === "risk"
    ? highRiskHoldings.map(h => h.instrument)
    : current.instruments;

  const displayTitle = specialView === "advisor" ? "Advisor Picks"
    : specialView === "catalyst" ? "Catalyst Watch"
    : specialView === "risk" ? "Risk Watch"
    : current.name;

  const handleSelectWatchlist = (id: string) => {
    setActiveList(id);
    setSpecialView("none");
  };

  const handleSpecialView = (view: "advisor" | "risk" | "catalyst") => {
    setSpecialView(prev => prev === view ? "none" : view);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Eye className="h-6 w-6 text-primary" /> Watchlists & Signals</h1>
          <p className="text-sm text-muted-foreground mt-1">Track assets, themes, catalysts, and advisor-driven signals</p>
        </div>
        <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Watchlist
        </button>
      </div>

      {/* Watchlist tabs */}
      <div className="flex gap-2 flex-wrap">
        {WATCHLISTS.map(w => (
          <button key={w.id} onClick={() => handleSelectWatchlist(w.id)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              specialView === "none" && activeList === w.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>
            <Star className="h-3 w-3" /> {w.name}
          </button>
        ))}
        <button onClick={() => handleSpecialView("advisor")}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
            specialView === "advisor" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}>
          <Brain className="h-3 w-3" /> Advisor Picks
        </button>
        <button onClick={() => handleSpecialView("risk")}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
            specialView === "risk" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}>
          <Shield className="h-3 w-3" /> Risk Watch
        </button>
        <button onClick={() => handleSpecialView("catalyst")}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
            specialView === "catalyst" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}>
          <Zap className="h-3 w-3" /> Catalyst Watch
        </button>
      </div>

      {/* Active Watchlist */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{displayTitle}</h3>
          <span className="text-[10px] text-muted-foreground">{displayInstruments.length} instruments</span>
        </div>
        <div className="divide-y divide-border/50">
          {displayInstruments.map(inst => (
            <button key={inst.id} onClick={() => navigate(`/investments/instrument/${inst.id}`)}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors text-left">
              <span className="text-xl">{inst.logoIcon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{inst.symbol}</p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground capitalize">{inst.assetClass}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{inst.name}</p>
              </div>
              {SPARKLINE_DATA[inst.id] && (
                <SparklineChart data={SPARKLINE_DATA[inst.id]} width={64} height={20} />
              )}
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-foreground">${inst.price.toLocaleString()}</p>
                <p className={`text-[10px] font-medium ${inst.changePct24h >= 0 ? "text-trust-safe" : "text-destructive"}`}>
                  {inst.changePct24h >= 0 ? "+" : ""}{inst.changePct24h.toFixed(2)}%
                </p>
              </div>
              {inst.catalysts.length > 0 && (
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] text-accent flex items-center gap-0.5 shrink-0">
                  <Zap className="h-2.5 w-2.5" /> {inst.catalysts.length}
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Signal Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Zap className="h-4 w-4 text-accent" /> Catalyst Alerts</h3>
          {catalystInstruments.slice(0, 4).map(inst => (
            <div key={inst.id} className="flex items-start gap-3">
              <span className="text-sm">{inst.logoIcon}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{inst.symbol} — {inst.catalysts[0].title}</p>
                <p className="text-[10px] text-muted-foreground">{inst.catalysts[0].date} · {inst.catalysts[0].type}</p>
              </div>
              <span className={`text-[9px] font-medium rounded-full px-2 py-0.5 ${
                inst.catalysts[0].impact === "positive" ? "bg-[hsl(var(--trust-safe))]/10 text-trust-safe" : "bg-secondary text-muted-foreground"
              }`}>{inst.catalysts[0].impact}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-[hsl(var(--trust-warn))]" /> Risk Watch</h3>
          {highRiskHoldings.map(h => (
            <div key={h.id} className="flex items-center gap-3">
              <span className="text-sm">{h.instrument.logoIcon}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{h.instrument.symbol}</p>
                <p className="text-[10px] text-muted-foreground">{h.weight.toFixed(1)}% portfolio weight</p>
              </div>
              <span className="text-[9px] font-medium rounded-full bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))] px-2 py-0.5">Concentrated</span>
            </div>
          ))}
          {highRiskHoldings.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No concentration warnings</p>}
        </div>
      </div>
    </div>
  );
}
