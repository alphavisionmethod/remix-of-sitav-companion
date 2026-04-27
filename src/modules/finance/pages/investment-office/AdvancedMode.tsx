// truth-allow: ia-config
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Brain, TrendingUp, TrendingDown, Shield, PieChart, Target, Eye,
  Zap, Globe, DollarSign, AlertTriangle, ChevronRight, Calendar
} from "lucide-react";
import { INSTRUMENTS, INVESTMENT_ADVISORS, PORTFOLIO, SAMPLE_ORDERS, SAMPLE_SCENARIOS, SAMPLE_THESES } from "@/modules/finance/hooks/useInvestmentOfficeData";
import { useInvestmentStrategyRecords } from "@/modules/finance/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fmt = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;
const pctFmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export default function AdvancedMode() {
  const { data: liveData, isLoading } = useInvestmentStrategyRecords();
  const navigate = useNavigate();
  const p = PORTFOLIO;
  const topMovers = [...INSTRUMENTS].sort((a, b) => Math.abs(b.changePct24h) - Math.abs(a.changePct24h)).slice(0, 8);
  const allCatalysts = INSTRUMENTS.flatMap(i => i.catalysts.map(c => ({ ...c, instrument: i }))).sort((a, b) => a.date.localeCompare(b.date));


  return (
    <div className="mx-auto max-w-[90rem] space-y-4">
      <PageTruthBanner truthState="partial" />
{/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Advanced Desk</h1>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold text-primary uppercase">{p.regime}</span>
          <span className="text-xs text-muted-foreground">Risk: {p.riskScore}/100</span>
        </div>
        <div className="flex gap-1.5">
          {[
            { l: "Board", p: "/investments/boardroom" }, { l: "Mkts", p: "/investments/markets" },
            { l: "Port", p: "/investments/portfolio" }, { l: "Strat", p: "/investments/strategy" },
            { l: "Exec", p: "/investments/execute" }, { l: "Risk", p: "/investments/risk" },
            { l: "Res", p: "/investments/research" }, { l: "Events", p: "/investments/events" },
          ].map(n => (
            <button key={n.p} onClick={() => navigate(n.p)}
              className="rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">{n.l}</button>
          ))}
        </div>
      </div>

      {/* Dense Capital Band */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { l: "Capital", v: fmt(p.totalValue + p.totalCash) },
          { l: "Invested", v: fmt(p.totalValue) },
          { l: "Cash", v: fmt(p.totalCash) },
          { l: "P&L", v: pctFmt(p.totalPnlPct), c: p.totalPnl >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive" },
          { l: "Positions", v: String(p.holdings.length) },
          { l: "Risk", v: `${p.riskScore}`, c: p.riskScore > 70 ? "text-[hsl(var(--trust-warn))]" : "text-foreground" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card p-3">
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
            <p className={`text-lg font-bold ${s.c || "text-foreground"}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Holdings - 4 cols */}
        <div className="col-span-4 rounded-2xl border border-border bg-card p-4 space-y-2 max-h-[480px] overflow-y-auto scrollbar-thin">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card pb-1">Holdings</p>
          {p.holdings.sort((a, b) => b.currentValue - a.currentValue).map(h => (
            <button key={h.id} onClick={() => navigate(`/investments/instrument/${h.instrumentId}`)}
              className="w-full flex items-center gap-2 text-left hover:bg-secondary/30 rounded-lg p-1.5 -mx-1.5 transition-colors">
              <span className="text-sm">{h.instrument.logoIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground">{h.instrument.symbol}</p>
                <p className="text-[9px] text-muted-foreground">{h.platform}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-foreground">{fmt(h.currentValue)}</p>
                <p className={`text-[9px] font-medium ${h.unrealizedPnl >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>{pctFmt(h.unrealizedPnlPct)}</p>
              </div>
              <p className="text-[9px] text-muted-foreground w-10 text-right">{h.weight.toFixed(1)}%</p>
            </button>
          ))}
        </div>

        {/* Movers + Advisors - 4 cols */}
        <div className="col-span-4 space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Movers</p>
            {topMovers.slice(0, 6).map(inst => (
              <button key={inst.id} onClick={() => navigate(`/investments/instrument/${inst.id}`)}
                className="w-full flex items-center gap-2 text-left hover:bg-secondary/30 rounded-lg p-1 transition-colors">
                <span className="text-sm">{inst.logoIcon}</span>
                <span className="text-[11px] font-medium text-foreground flex-1">{inst.symbol}</span>
                <span className="text-[11px] text-foreground">${inst.price.toLocaleString()}</span>
                <span className={`text-[10px] font-medium w-14 text-right ${inst.changePct24h >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>{pctFmt(inst.changePct24h)}</span>
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Advisor Pulse</p>
            {INVESTMENT_ADVISORS.map(adv => (
              <div key={adv.id} className="flex items-center gap-2">
                <span className="text-sm">{adv.icon}</span>
                <span className="text-[10px] text-muted-foreground w-16 shrink-0">{adv.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${adv.confidence}%`, backgroundColor: adv.color }} />
                </div>
                <span className="text-[9px] font-medium text-foreground w-8 text-right">{adv.confidence}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation + Scenarios + Catalysts - 4 cols */}
        <div className="col-span-4 space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Allocation</p>
            {Object.entries(p.allocationByClass).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([cls, pct]) => (
              <div key={cls} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-20 capitalize">{cls}</span>
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full ${pct > 40 ? "bg-[hsl(var(--trust-warn))]" : "bg-primary/60"}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-medium text-foreground w-10 text-right">{pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Scenarios</p>
            {SAMPLE_SCENARIOS.map(s => (
              <div key={s.id} className="flex items-center gap-2 text-[10px]">
                <span className="flex-1 text-muted-foreground truncate">{s.name}</span>
                <span className={`font-medium w-10 text-right ${s.projectedReturn >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>{s.projectedReturn > 0 ? "+" : ""}{s.projectedReturn}%</span>
                <span className="text-muted-foreground w-8 text-right">{s.probability}%</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Catalysts</p>
            {allCatalysts.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center gap-2 text-[10px]">
                <span className="text-sm">{c.instrument.logoIcon}</span>
                <span className="flex-1 text-foreground truncate">{c.title}</span>
                <span className="text-muted-foreground">{c.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Active Theses + Pending Orders */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Active Theses</p>
          {SAMPLE_THESES.map(th => (
            <button key={th.id} onClick={() => navigate("/investments/journal")}
              className="w-full flex items-center gap-2 text-left hover:bg-secondary/30 rounded-lg p-1.5 transition-colors">
              <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-[11px] font-medium text-foreground flex-1 truncate">{th.title}</span>
              <span className={`text-[9px] font-medium capitalize rounded-full px-2 py-0.5 ${th.conviction === "high" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" : "bg-primary/10 text-primary"}`}>{th.conviction}</span>
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pending Orders</p>
          {SAMPLE_ORDERS.map(ord => (
            <button key={ord.id} onClick={() => navigate("/investments/execute")}
              className="w-full flex items-center gap-2 text-left hover:bg-secondary/30 rounded-lg p-1.5 transition-colors">
              <span className="text-sm">{ord.instrument.logoIcon}</span>
              <span className="text-[11px] font-medium text-foreground capitalize">{ord.action} {ord.instrument.symbol}</span>
              <span className="text-[10px] text-muted-foreground flex-1">{ord.quantity} · {ord.orderType}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] text-primary capitalize">{ord.status}</span>
            </button>
          ))}
          {SAMPLE_ORDERS.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">No pending orders</p>}
        </div>
      </div>
    </div>
  );
}
