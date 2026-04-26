// truth-allow: ia-config
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, TrendingDown, PieChart, Shield, RefreshCw, AlertTriangle, Wallet } from "lucide-react";
import { SparklineChart } from "@/platform/sita/components/sita/SparklineChart";
import { PLATFORM_CONNECTIONS, PORTFOLIO, SAMPLE_THESES } from "@/hooks/useInvestmentOfficeData";
import { SPARKLINE_DATA, PERFORMANCE_TIMELINE } from "@/domains/investment";
import { usePortfolioPositions } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;
const pctFmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

function getConvictionBadge(instrumentId: string) {
  const thesis = SAMPLE_THESES.find(t => t.instrumentId === instrumentId && t.status === "active");
  return thesis || null;
}

type AllocView = "class" | "sector" | "theme";

export default function PortfolioOffice() {
  const { data: liveData, isLoading } = usePortfolioPositions();
  const navigate = useNavigate();
  const [allocView, setAllocView] = useState<AllocView>("class");
  const [perfPeriod, setPerfPeriod] = useState("YTD");
  const p = PORTFOLIO;
  const sortedHoldings = [...p.holdings].sort((a, b) => b.currentValue - a.currentValue);

  // Compute allocation breakdowns
  const allocByClass = p.allocationByClass;
  const allocBySector: Record<string, number> = {};
  const allocByTheme: Record<string, number> = {};
  p.holdings.forEach(h => {
    const sector = h.instrument.sector || h.instrument.assetClass;
    allocBySector[sector] = (allocBySector[sector] || 0) + h.weight;
    (h.instrument.theme || []).forEach(t => {
      allocByTheme[t] = (allocByTheme[t] || 0) + h.weight;
    });
  });

  const currentAlloc = allocView === "class" ? allocByClass : allocView === "sector" ? allocBySector : allocByTheme;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageTruthBanner truthState="partial" />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><PieChart className="h-6 w-6 text-primary" /> Portfolio Office</h1>
          <p className="text-sm text-muted-foreground mt-1">All holdings across platforms</p>
        </div>
        <button className="rounded-xl bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Sync All
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Portfolio Value", value: fmt(p.totalValue), sub: `+ ${fmt(p.totalCash)} cash` },
          { label: "Unrealized P&L", value: fmt(p.totalPnl), sub: pctFmt(p.totalPnlPct), color: p.totalPnl >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive" },
          { label: "Positions", value: String(p.holdings.length), sub: `${new Set(p.holdings.map(h => h.platform)).size} platforms` },
          { label: "Risk Score", value: `${p.riskScore}/100`, sub: p.riskScore > 70 ? "Elevated" : "Moderate" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color || "text-foreground"}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Performance Timeline */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Performance</h3>
          <div className="flex gap-1">
            {Object.keys(PERFORMANCE_TIMELINE).map(period => (
              <button key={period} onClick={() => setPerfPeriod(period)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors ${perfPeriod === period ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className={`text-3xl font-bold ${PERFORMANCE_TIMELINE[perfPeriod] >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
            {PERFORMANCE_TIMELINE[perfPeriod] >= 0 ? "+" : ""}{PERFORMANCE_TIMELINE[perfPeriod]}%
          </p>
          <p className="text-xs text-muted-foreground">{perfPeriod} return across all positions</p>
        </div>
      </div>

      {/* Allocation Map */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Allocation Breakdown</h3>
          <div className="flex gap-1">
            {(["class", "sector", "theme"] as AllocView[]).map(v => (
              <button key={v} onClick={() => setAllocView(v)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-medium capitalize transition-colors ${allocView === v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {Object.entries(currentAlloc).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([label, pct]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-28 text-xs text-muted-foreground capitalize truncate">{label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pct > 40 ? "bg-[hsl(var(--trust-warn))]" : "bg-primary/60"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <span className={`text-xs font-medium w-14 text-right ${pct > 40 ? "text-[hsl(var(--trust-warn))]" : "text-foreground"}`}>{pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Holdings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-5 py-2.5 font-medium">Asset</th>
                <th className="text-center px-2 py-2.5 font-medium">7d</th>
                <th className="text-right px-3 py-2.5 font-medium">Price</th>
                <th className="text-right px-3 py-2.5 font-medium">Value</th>
                <th className="text-right px-3 py-2.5 font-medium">P&L</th>
                <th className="text-right px-3 py-2.5 font-medium">Weight</th>
                <th className="text-center px-3 py-2.5 font-medium">Conviction</th>
                <th className="text-right px-5 py-2.5 font-medium">Platform</th>
              </tr>
            </thead>
            <tbody>
              {sortedHoldings.map(h => {
                const thesis = getConvictionBadge(h.instrumentId);
                const riskLevel = h.weight > 15 ? "high" : h.weight > 8 ? "moderate" : "low";
                return (
                  <tr key={h.id} onClick={() => navigate(`/investments/instrument/${h.instrumentId}`)}
                    className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors">
                    <td className="px-5 py-3 flex items-center gap-2.5">
                      <span className="text-lg">{h.instrument.logoIcon}</span>
                      <div>
                        <p className="font-medium text-foreground">{h.instrument.symbol}</p>
                        <p className="text-[10px] text-muted-foreground">{h.instrument.name}</p>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      {SPARKLINE_DATA[h.instrumentId] && (
                        <SparklineChart data={SPARKLINE_DATA[h.instrumentId]} width={56} height={18} />
                      )}
                    </td>
                    <td className="text-right px-3 py-3 text-foreground">${h.instrument.price.toLocaleString()}</td>
                    <td className="text-right px-3 py-3 font-medium text-foreground">{fmt(h.currentValue)}</td>
                    <td className={`text-right px-3 py-3 font-medium ${h.unrealizedPnl >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                      {pctFmt(h.unrealizedPnlPct)}
                    </td>
                    <td className="text-right px-3 py-3 text-muted-foreground">{h.weight.toFixed(1)}%</td>
                    <td className="text-center px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {thesis ? (
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                            thesis.conviction === "high" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                            thesis.conviction === "medium" ? "bg-primary/10 text-primary" :
                            "bg-secondary text-muted-foreground"
                          }`}>{thesis.conviction}</span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground">—</span>
                        )}
                        {riskLevel === "high" && (
                          <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[8px] font-bold text-destructive" title="Concentrated position">
                            <AlertTriangle className="h-2.5 w-2.5 inline" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-right px-5 py-3 text-muted-foreground">{h.platform}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash & Reserves */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Cash & Reserves</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unallocated Cash</p>
            <p className="text-xl font-bold text-foreground mt-1">{fmt(p.totalCash)}</p>
            <p className="text-[10px] text-muted-foreground">{((p.totalCash / (p.totalValue + p.totalCash)) * 100).toFixed(1)}% of total capital</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Dry Powder Policy</p>
            <p className="text-xl font-bold text-foreground mt-1">10% minimum</p>
            <p className={`text-[10px] ${(p.totalCash / (p.totalValue + p.totalCash)) * 100 < 10 ? "text-[hsl(var(--trust-warn))]" : "text-[hsl(var(--trust-safe))]"}`}>
              {(p.totalCash / (p.totalValue + p.totalCash)) * 100 < 10 ? "⚠ Below target" : "✓ Within policy"}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Buying Power</p>
            <p className="text-xl font-bold text-[hsl(var(--trust-safe))] mt-1">{fmt(p.totalCash)}</p>
            <p className="text-[10px] text-muted-foreground">Available for new positions</p>
          </div>
        </div>
      </div>

      {/* Connected Platforms */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Connected Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PLATFORM_CONNECTIONS.map(pc => (
            <div key={pc.id} className="rounded-xl border border-border bg-secondary/20 p-3 flex items-center gap-3">
              <span className="text-xl">{pc.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{pc.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{pc.type} · {pc.status}</p>
                {pc.accountValue && <p className="text-[10px] text-foreground font-medium">{fmt(pc.accountValue)}</p>}
              </div>
              <div className={`h-2 w-2 rounded-full ${pc.status === "connected" ? "bg-[hsl(var(--trust-safe))]" : pc.status === "error" ? "bg-destructive" : "bg-muted-foreground"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}