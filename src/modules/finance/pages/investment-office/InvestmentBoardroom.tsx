import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, PieChart, Shield, Eye, Calendar,
  ArrowRight, BarChart3, Briefcase, AlertTriangle, Clock, Brain, ChevronRight,
  RefreshCw, Zap, Info, Bell, Network, Activity, Siren
} from "lucide-react";
import { SparklineChart } from "@/platform/sita/components/sita/SparklineChart";
import { INSTRUMENTS, INVESTMENT_ADVISORS, PORTFOLIO, SAMPLE_ORDERS, SAMPLE_THESES, WATCHLISTS } from "@/hooks/useInvestmentOfficeData";
import { SPARKLINE_DATA, WHAT_CHANGED, ADVISOR_EVENT_ALERTS } from "@/domains/investment";
import { useInvestmentDecisions } from "@/hooks/use-investment-office";
import { PortfolioGlobe } from "@/modules/finance/components/investment/PortfolioGlobe";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fmt = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;
const pctFmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

// ── Animated Ticker Ribbon with simulated real-time prices ──
function TickerRibbon() {
  const [tick, setTick] = useState(0);
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(PORTFOLIO.holdings.map(h => [h.instrument.symbol, h.instrument.price]))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        const keys = Object.keys(next);
        // Randomly update 2-3 prices each tick
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          const key = keys[Math.floor(Math.random() * keys.length)];
          const change = next[key] * (Math.random() - 0.5) * 0.004;
          next[key] = Math.max(0.01, next[key] + change);
        }
        return next;
      });
      setTick(t => t + 1);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const tickerItems = PORTFOLIO.holdings.map(h => ({
    symbol: h.instrument.symbol,
    icon: h.instrument.logoIcon,
    price: prices[h.instrument.symbol] ?? h.instrument.price,
    pct: h.instrument.changePct24h,
    prevPrice: h.instrument.price,
  }));
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur">
      <div className="flex animate-ticker-scroll whitespace-nowrap py-2">
        {doubled.map((t, i) => {
          const dir = t.price > t.prevPrice ? "up" : t.price < t.prevPrice ? "down" : null;
          return (
            <div key={i} className="flex items-center gap-1.5 px-4 border-r border-border/30 shrink-0">
              <span className="text-xs">{t.icon}</span>
              <span className="text-[10px] font-semibold text-foreground">{t.symbol}</span>
              <span className={`text-[10px] font-mono tabular-nums transition-colors duration-500 ${
                dir === "up" ? "text-[hsl(var(--trust-safe))]" : dir === "down" ? "text-destructive" : "text-foreground"
              }`}>
                ${t.price >= 1000 ? t.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : t.price.toFixed(2)}
              </span>
              <span className={`text-[9px] font-bold ${t.pct >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                {t.pct >= 0 ? "+" : ""}{t.pct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── What Changed Card ──
function WhatChangedCard() {
  const severityColors = {
    info: "bg-primary/10 text-primary",
    warn: "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]",
    alert: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-primary" /> Since Last Visit
      </h3>
      {WHAT_CHANGED.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span className={`shrink-0 mt-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${severityColors[item.severity]}`}>
            {item.type}
          </span>
          <p className="text-[11px] text-foreground leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

export default function InvestmentBoardroom() {
  const { data: liveData, isLoading } = useInvestmentDecisions();
  const navigate = useNavigate();
  const p = PORTFOLIO;
  const topMovers = [...INSTRUMENTS].sort((a, b) => Math.abs(b.changePct24h) - Math.abs(a.changePct24h)).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
{/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" /> Investment Office
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your capital command center</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Markets", path: "/investments/markets" },
            { label: "Portfolio", path: "/investments/portfolio" },
            { label: "Strategy", path: "/investments/strategy" },
            { label: "Execute", path: "/investments/execute" },
            { label: "Research", path: "/investments/research" },
            { label: "Risk", path: "/investments/risk" },
            { label: "Trading Floor", path: "/investments/trading-floor", icon: Activity },
            { label: "War Room", path: "/investments/war-room", icon: Siren },
            { label: "Knowledge Graph", path: "/investments/knowledge-graph", icon: Network },
          ].map(l => (
            <button key={l.path} onClick={() => navigate(l.path)}
              className="rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              {l.icon && <l.icon className="h-3 w-3" />}
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Globe Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" /> Portfolio Globe
        </h3>
        <PortfolioGlobe />
      </motion.div>

      {/* Ticker Ribbon */}
      <TickerRibbon />

      {/* Capital Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Capital", value: fmt(p.totalValue + p.totalCash), icon: DollarSign, color: "text-primary" },
          { label: "Invested", value: fmt(p.totalValue), icon: BarChart3, color: "text-foreground" },
          { label: "Cash", value: fmt(p.totalCash), icon: DollarSign, color: "text-muted-foreground" },
          { label: "Total P&L", value: pctFmt(p.totalPnlPct), icon: p.totalPnl >= 0 ? TrendingUp : TrendingDown, color: p.totalPnl >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive" },
          { label: "Risk Score", value: `${p.riskScore}/100`, icon: Shield, color: p.riskScore > 70 ? "text-[hsl(var(--trust-warn))]" : "text-[hsl(var(--trust-safe))]" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <s.icon className="h-3.5 w-3.5" /><span className="text-[10px] uppercase tracking-wider font-medium">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* What Changed + Top Movers + Advisor Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WhatChangedCard />

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Top Movers</h3>
          {topMovers.map(inst => (
            <button key={inst.id} onClick={() => navigate(`/investments/instrument/${inst.id}`)}
              className="w-full flex items-center gap-3 text-left hover:bg-secondary/50 rounded-xl p-2 -mx-2 transition-colors">
              <span className="text-lg">{inst.logoIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{inst.symbol}</p>
                <p className="text-[10px] text-muted-foreground truncate">{inst.name}</p>
              </div>
              {SPARKLINE_DATA[inst.id] && (
                <SparklineChart data={SPARKLINE_DATA[inst.id]} width={60} height={20} />
              )}
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">${inst.price.toLocaleString()}</p>
                <p className={`text-[10px] font-medium ${inst.changePct24h >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                  {pctFmt(inst.changePct24h)}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Advisor Council</h3>
          {INVESTMENT_ADVISORS.slice(0, 5).map(adv => (
            <button key={adv.id} onClick={() => navigate("/investments/advisors")}
              className="w-full flex items-start gap-3 text-left hover:bg-secondary/50 rounded-xl p-2 -mx-2 transition-colors">
              <span className="text-sm mt-0.5">{adv.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{adv.title}</p>
                <p className="text-[11px] text-foreground leading-tight mt-0.5 line-clamp-2">{adv.currentInsight}</p>
              </div>
              <div className={`shrink-0 text-[9px] font-medium rounded-full px-2 py-0.5 ${
                adv.confidenceLevel === "high" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))] animate-pulse-safe" :
                adv.confidenceLevel === "moderate" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))] animate-pulse-warn" :
                "bg-destructive/10 text-destructive animate-pulse-danger"
              }`}>{adv.confidence}%</div>
            </button>
          ))}
          <button onClick={() => navigate("/investments/advisors")} className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1">
            Full council <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Upcoming Event Alerts (Advisor-Annotated) */}
      <div className="rounded-2xl border border-primary/15 bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Upcoming Event Alerts
        </h3>
        <p className="text-xs text-muted-foreground">Catalyst events with advisor intelligence attached.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ADVISOR_EVENT_ALERTS.slice(0, 4).map(alert => (
            <div key={alert.id} className={`rounded-xl border p-4 space-y-2.5 ${
              alert.urgency === "high" ? "border-destructive/20 bg-destructive/5" : "border-border bg-secondary/20"
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">{alert.advisorIcon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                      alert.urgency === "high" ? "bg-destructive/10 text-destructive" : "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]"
                    }`}>{alert.urgency}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{alert.advisorName} · {alert.advisorIcon}</p>
                </div>
              </div>
              <p className="text-[11px] text-foreground leading-relaxed">{alert.advisorNote}</p>
              <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-1.5">
                <p className="text-[10px] text-primary flex items-center gap-1"><ArrowRight className="h-3 w-3" /> {alert.actionSuggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Allocation</h3>
          {Object.entries(p.allocationByClass).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([cls, pct]) => (
            <div key={cls} className="flex items-center gap-3">
              <span className="w-20 text-xs text-muted-foreground capitalize">{cls}</span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-medium text-foreground w-12 text-right">{pct.toFixed(1)}%</span>
            </div>
          ))}
          <button onClick={() => navigate("/investments/portfolio")} className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-2">
            View full portfolio <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Upcoming Catalysts</h3>
          {INSTRUMENTS.flatMap(i => i.catalysts.map(c => ({ ...c, instrument: i }))).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(cat => (
            <div key={cat.id} className="flex items-start gap-3">
              <span className="text-sm">{cat.instrument.logoIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{cat.title}</p>
                <p className="text-[10px] text-muted-foreground">{cat.instrument.symbol} · {cat.date}</p>
              </div>
              <span className={`text-[9px] font-medium rounded-full px-2 py-0.5 ${
                cat.impact === "positive" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                cat.impact === "negative" ? "bg-destructive/10 text-destructive" :
                "bg-secondary text-muted-foreground"
              }`}>{cat.impact}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Pending Actions</h3>
          {SAMPLE_ORDERS.filter(o => o.status === "draft").map(ord => (
            <button key={ord.id} onClick={() => navigate("/investments/execute")}
              className="w-full flex items-start gap-3 text-left hover:bg-secondary/50 rounded-xl p-2 -mx-2 transition-colors">
              <span className="text-sm">{ord.instrument.logoIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground capitalize">{ord.action} {ord.instrument.symbol}</p>
                <p className="text-[10px] text-muted-foreground">{ord.quantity} shares · {ord.orderType}{ord.limitPrice ? ` @ $${ord.limitPrice}` : ""}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">Draft</span>
            </button>
          ))}
          {SAMPLE_THESES.filter(t => t.status === "active").slice(0, 2).map(th => (
            <button key={th.id} onClick={() => navigate("/investments/journal")}
              className="w-full flex items-start gap-3 text-left hover:bg-secondary/50 rounded-xl p-2 -mx-2 transition-colors">
              <Brain className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{th.title}</p>
                <p className="text-[10px] text-muted-foreground">Conviction: {th.conviction} · {th.timeHorizon}</p>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            </button>
          ))}
          {SAMPLE_ORDERS.filter(o => o.status === "draft").length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No pending actions</p>
          )}
        </div>
      </div>
    </div>
  );
}
