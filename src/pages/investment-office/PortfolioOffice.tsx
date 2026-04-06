import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, TrendingDown, PieChart, Shield, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";
import { PORTFOLIO, PLATFORM_CONNECTIONS } from "@/lib/investment-office/mock-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;
const pctFmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export default function PortfolioOffice() {
  const navigate = useNavigate();
  const p = PORTFOLIO;
  const sortedHoldings = [...p.holdings].sort((a, b) => b.currentValue - a.currentValue);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DemoModeBadge />
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
                <th className="text-right px-3 py-2.5 font-medium">Price</th>
                <th className="text-right px-3 py-2.5 font-medium">Qty</th>
                <th className="text-right px-3 py-2.5 font-medium">Value</th>
                <th className="text-right px-3 py-2.5 font-medium">Avg Cost</th>
                <th className="text-right px-3 py-2.5 font-medium">P&L</th>
                <th className="text-right px-3 py-2.5 font-medium">Weight</th>
                <th className="text-right px-5 py-2.5 font-medium">Platform</th>
              </tr>
            </thead>
            <tbody>
              {sortedHoldings.map(h => (
                <tr key={h.id} onClick={() => navigate(`/investments/instrument/${h.instrumentId}`)}
                  className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors">
                  <td className="px-5 py-3 flex items-center gap-2.5">
                    <span className="text-lg">{h.instrument.logoIcon}</span>
                    <div><p className="font-medium text-foreground">{h.instrument.symbol}</p><p className="text-[10px] text-muted-foreground">{h.instrument.name}</p></div>
                  </td>
                  <td className="text-right px-3 py-3 text-foreground">${h.instrument.price.toLocaleString()}</td>
                  <td className="text-right px-3 py-3 text-foreground">{h.quantity}</td>
                  <td className="text-right px-3 py-3 font-medium text-foreground">{fmt(h.currentValue)}</td>
                  <td className="text-right px-3 py-3 text-muted-foreground">${h.avgCost.toLocaleString()}</td>
                  <td className={`text-right px-3 py-3 font-medium ${h.unrealizedPnl >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                    {pctFmt(h.unrealizedPnlPct)}
                  </td>
                  <td className="text-right px-3 py-3 text-muted-foreground">{h.weight.toFixed(1)}%</td>
                  <td className="text-right px-5 py-3 text-muted-foreground">{h.platform}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
