import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, Filter, BarChart3, Globe, Zap, ChevronRight } from "lucide-react";
import type { AssetClass } from "@/domains/investment";
import { SparklineChart } from "@/platform/sita/components/sita/SparklineChart";
import { INSTRUMENTS, INVESTMENT_ADVISORS } from "@/hooks/useInvestmentOfficeData";
import { SPARKLINE_DATA } from "@/domains/investment";
import { useMarketWatchlistItems } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const pctFmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export default function MarketExplorer() {
  const { data: liveData, isLoading } = useMarketWatchlistItems();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeClass, setActiveClass] = useState<AssetClass | "all">("all");

  const filtered = INSTRUMENTS.filter(i =>
    (activeClass === "all" || i.assetClass === activeClass) &&
    (!query || i.name.toLowerCase().includes(query.toLowerCase()) || i.symbol.toLowerCase().includes(query.toLowerCase()))
  );

  const regimeAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "macro");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Globe className="h-6 w-6 text-primary" /> Market Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">Stocks, crypto, commodities, and event markets</p>
      </div>

      {/* Market Regime */}
      {regimeAdvisor && (
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 flex items-start gap-3">
          <span className="text-xl">{regimeAdvisor.icon}</span>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{regimeAdvisor.title} · Market Regime</p>
            <p className="text-sm text-foreground mt-1">{regimeAdvisor.currentInsight}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">{regimeAdvisor.confidence}% confidence</span>
        </div>
      )}

      {/* Search + Tabs */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search instruments…" value={query} onChange={e => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none transition-all" />
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([] as any[]).map(tab => (
          <button key={tab.value} onClick={() => setActiveClass(tab.value as typeof activeClass)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeClass === tab.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Instruments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(inst => (
          <button key={inst.id} onClick={() => navigate(`/investments/instrument/${inst.id}`)}
            className="rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/20 transition-all group">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{inst.logoIcon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{inst.symbol}</p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground capitalize">{inst.assetClass}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{inst.name}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-end justify-between mt-3">
              <div>
                <p className="text-lg font-bold text-foreground">${inst.price.toLocaleString()}</p>
                <p className={`text-xs font-medium ${inst.changePct24h >= 0 ? "text-trust-safe" : "text-destructive"}`}>
                  {inst.changePct24h >= 0 ? <TrendingUp className="h-3 w-3 inline mr-1" /> : <TrendingDown className="h-3 w-3 inline mr-1" />}
                  {pctFmt(inst.changePct24h)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {SPARKLINE_DATA[inst.id] && (
                  <SparklineChart data={SPARKLINE_DATA[inst.id]} width={64} height={22} />
                )}
                {inst.catalysts.length > 0 && (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-medium text-accent flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5" /> {inst.catalysts.length}
                  </span>
                )}
              </div>
            </div>
            {inst.theme && inst.theme.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {inst.theme.slice(0, 3).map(t => (
                  <span key={t} className="rounded-md bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
