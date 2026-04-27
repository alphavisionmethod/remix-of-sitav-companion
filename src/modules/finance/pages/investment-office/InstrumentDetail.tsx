// truth-allow: ia-config
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, TrendingUp, TrendingDown, Shield, Zap, Brain, BarChart3,
  Target, AlertTriangle, ChevronRight, Calendar, Eye, Plus, Info, Activity, Link2
} from "lucide-react";
import LightweightChart from "@/modules/finance/components/investment/LightweightChart";
import { INVESTMENT_ADVISORS, PORTFOLIO, SAMPLE_THESES, PLATFORM_CONNECTIONS, getInstrument } from "@/modules/finance/hooks/useInvestmentOfficeData";
import { SAMPLE_SCENARIOS } from "@/domains/investment";
import { usePortfolioPositions } from "@/modules/finance/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const pctFmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
const fmt = (n: number) => n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T` : n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;

const RISK_COLORS = { "very-low": "text-[hsl(var(--trust-safe))]", "low": "text-[hsl(var(--trust-safe))]", "moderate": "text-primary", "high": "text-[hsl(var(--trust-warn))]", "very-high": "text-destructive" };

const ASSET_EXPLAINERS: Record<string, string> = {
  stocks: "A stock represents partial ownership in a company. When the company grows and profits, the stock price typically rises. Stocks can pay dividends and historically offer strong long-term returns, but prices can be volatile in the short term.",
  crypto: "Cryptocurrency is a digital asset that uses blockchain technology. Prices are driven by adoption, network effects, and market sentiment. Crypto is highly volatile — large gains and losses are common. Only invest what you can afford to lose.",
  commodities: "Commodities are physical goods like gold, oil, and agricultural products. They're influenced by supply/demand, geopolitical events, and inflation expectations. Gold is often used as a portfolio hedge against uncertainty.",
  events: "Event contracts let you invest based on whether something will happen — like a rate cut or election outcome. The price reflects the market's probability estimate. These are inherently uncertain and should be sized small.",
  etfs: "An ETF (Exchange-Traded Fund) holds a basket of assets — like stocks or bonds — and trades like a single stock. ETFs offer instant diversification and are a great starting point for building a portfolio.",
};

export default function InstrumentDetail() {
  const { data: liveData, isLoading } = usePortfolioPositions();
  const { instrumentId } = useParams();
  const navigate = useNavigate();
  const inst = getInstrument(instrumentId || "");

  if (!inst) return <div className="text-center py-20 text-muted-foreground">Instrument not found</div>;

  const holding = PORTFOLIO.holdings.find(h => h.instrumentId === inst.id);
  const thesis = SAMPLE_THESES.find(t => t.instrumentId === inst.id);
  const relevantAdvisors = INVESTMENT_ADVISORS.filter(a =>
    (inst.assetClass === "stocks" && (a.domain === "equity" || a.domain === "macro")) ||
    (inst.assetClass === "crypto" && a.domain === "crypto") ||
    (inst.assetClass === "commodities" && a.domain === "commodities") ||
    (inst.assetClass === "events" && a.domain === "events") ||
    a.domain === "risk"
  );

  const availablePlatforms = PLATFORM_CONNECTIONS.filter(pc => {
    if (inst.assetClass === "stocks" || inst.assetClass === "etfs") return pc.type === "brokerage";
    if (inst.assetClass === "crypto") return pc.type === "exchange" || pc.type === "wallet";
    if (inst.assetClass === "commodities") return pc.type === "brokerage";
    if (inst.assetClass === "events") return pc.type === "event-market";
    return false;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageTruthBanner truthState="partial" />
<button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="flex items-start gap-4">
        <span className="text-4xl">{inst.logoIcon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{inst.name}</h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize">{inst.assetClass}</span>
            {inst.sector && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{inst.sector}</span>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{inst.description}</p>
        </div>
        <button onClick={() => navigate("/investments/execute")}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Target className="h-4 w-4" /> Prepare Trade
        </button>
      </div>

      {/* Price Hero */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-end gap-6">
          <div>
            <p className="text-4xl font-bold text-foreground">${inst.price.toLocaleString()}</p>
            <p className={`text-sm font-medium mt-1 flex items-center gap-1 ${inst.changePct24h >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
              {inst.changePct24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              ${Math.abs(inst.change24h).toLocaleString()} ({pctFmt(inst.changePct24h)}) today
            </p>
          </div>
          <div className="flex gap-6 ml-auto text-xs text-muted-foreground">
            {inst.marketCap && <div><p className="font-medium text-foreground">{fmt(inst.marketCap)}</p><p>Market Cap</p></div>}
            {inst.volume24h && <div><p className="font-medium text-foreground">{fmt(inst.volume24h)}</p><p>24h Volume</p></div>}
            {inst.high52w && <div><p className="font-medium text-foreground">${inst.high52w.toLocaleString()}</p><p>52w High</p></div>}
            {inst.low52w && <div><p className="font-medium text-foreground">${inst.low52w.toLocaleString()}</p><p>52w Low</p></div>}
          </div>
        </div>
        <LightweightChart
          symbol={inst.symbol}
          basePrice={inst.price}
          changePct={inst.changePct24h}
          className="mt-4"
        />
      </div>

      {/* What It Is — Plain Language Explainer */}
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 space-y-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> What is this?</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{ASSET_EXPLAINERS[inst.assetClass] || inst.description}</p>
        <p className="text-[10px] text-muted-foreground italic">This is a {inst.assetClass === "events" ? "prediction contract" : inst.assetClass.slice(0, -1)} — {inst.riskLevel.replace("-", " ")} risk level</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bull / Bear / Uncertainty */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Investment View</h3>
          {inst.bullCase && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-[hsl(var(--trust-safe))] uppercase tracking-wider flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Bull Case</p>
              <p className="text-xs text-foreground leading-relaxed">{inst.bullCase}</p>
            </div>
          )}
          {inst.bearCase && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Bear Case</p>
              <p className="text-xs text-foreground leading-relaxed">{inst.bearCase}</p>
            </div>
          )}
          {inst.uncertainty && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-[hsl(var(--trust-warn))] uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Key Uncertainty</p>
              <p className="text-xs text-foreground leading-relaxed">{inst.uncertainty}</p>
            </div>
          )}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Risk Level:</span>
            <span className={`text-xs font-medium capitalize ${RISK_COLORS[inst.riskLevel]}`}>{inst.riskLevel.replace("-", " ")}</span>
          </div>
        </div>

        {/* Advisor Commentary */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Advisor Commentary</h3>
          {relevantAdvisors.slice(0, 4).map(adv => (
            <div key={adv.id} className="flex items-start gap-2.5">
              <span className="text-sm mt-0.5">{adv.icon}</span>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{adv.title}</p>
                <p className="text-[11px] text-foreground leading-tight mt-0.5">{adv.currentInsight}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Position & Thesis */}
        <div className="space-y-4">
          {holding && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Your Position</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">Quantity</p><p className="font-medium text-foreground">{holding.quantity}</p></div>
                <div><p className="text-muted-foreground">Avg Cost</p><p className="font-medium text-foreground">${holding.avgCost.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Value</p><p className="font-medium text-foreground">${holding.currentValue.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">P&L</p><p className={`font-medium ${holding.unrealizedPnl >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>{pctFmt(holding.unrealizedPnlPct)}</p></div>
              </div>
              <p className="text-[10px] text-muted-foreground">via {holding.platform} · {holding.weight.toFixed(1)}% of portfolio</p>
            </div>
          )}

          {thesis ? (
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Active Thesis</h3>
              <p className="text-xs font-medium text-foreground">{thesis.title}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-3">{thesis.rationale}</p>
              <div className="flex gap-2 text-[10px]">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium capitalize">Conviction: {thesis.conviction}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">{thesis.timeHorizon}</span>
              </div>
              <button onClick={() => navigate("/investments/journal")} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                View thesis <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button onClick={() => navigate("/investments/journal")}
              className="w-full rounded-2xl border border-dashed border-border bg-card p-5 text-center hover:border-primary/20 transition-colors">
              <Plus className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-medium text-muted-foreground">Create Investment Thesis</p>
            </button>
          )}
        </div>
      </div>

      {/* Risk Profile */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Risk Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-secondary/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Volatility</p>
            <p className={`text-sm font-bold capitalize ${RISK_COLORS[inst.riskLevel]}`}>{inst.riskLevel.replace("-", " ")}</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Liquidity</p>
            <p className="text-sm font-bold text-foreground">{inst.volume24h ? (inst.volume24h > 1e9 ? "Very High" : inst.volume24h > 1e7 ? "High" : "Moderate") : "—"}</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Portfolio Impact</p>
            <p className="text-sm font-bold text-foreground">{holding ? `${holding.weight.toFixed(1)}% weight` : "No position"}</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">52w Range Position</p>
            <p className="text-sm font-bold text-foreground">
              {inst.high52w && inst.low52w ? `${(((inst.price - inst.low52w) / (inst.high52w - inst.low52w)) * 100).toFixed(0)}%` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Simulator Preview */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Scenario Preview</h3>
          <button onClick={() => navigate("/investments/strategy")} className="text-[10px] text-primary hover:underline flex items-center gap-1">
            Full simulator <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_SCENARIOS.slice(0, 3).map(sc => {
            const positionValue = holding?.currentValue || inst.price * 10;
            const impactValue = positionValue * (sc.projectedReturn / 100);
            return (
              <div key={sc.id} className="rounded-xl border border-border bg-secondary/20 p-4 space-y-2">
                <p className="text-xs font-semibold text-foreground">{sc.name}</p>
                <p className="text-[10px] text-muted-foreground">{sc.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">Est. Impact</p>
                    <p className={`text-sm font-bold ${sc.projectedReturn >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                      {sc.projectedReturn >= 0 ? "+" : ""}{sc.projectedReturn}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground uppercase">Value Change</p>
                    <p className={`text-xs font-medium ${impactValue >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                      {impactValue >= 0 ? "+" : ""}${Math.abs(impactValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary/40" style={{ width: `${sc.probability}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{sc.probability}% prob</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Catalysts */}
      {inst.catalysts.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Upcoming Catalysts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inst.catalysts.map(c => (
              <div key={c.id} className="rounded-xl border border-border bg-secondary/20 p-3 flex items-start gap-3">
                <Zap className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground">{c.date} · {c.type}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Availability */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /> Where You Can Trade This</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {availablePlatforms.map(pc => (
            <div key={pc.id} className={`rounded-xl border p-3 flex items-center gap-3 ${pc.status === "connected" ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" : "border-border bg-secondary/20"}`}>
              <span className="text-xl">{pc.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{pc.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{pc.type}</p>
              </div>
              <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${pc.status === "connected" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" : "bg-secondary text-muted-foreground"}`}>
                {pc.status === "connected" ? "Ready" : "Connect"}
              </span>
            </div>
          ))}
          {availablePlatforms.length === 0 && (
            <p className="text-xs text-muted-foreground col-span-full text-center py-4">No connected platforms support this asset type</p>
          )}
        </div>
      </div>
    </div>
  );
}