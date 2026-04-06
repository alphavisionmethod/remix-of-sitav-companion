import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase, TrendingUp, Shield, Brain, Link2, ChevronRight, Compass,
  GraduationCap, BarChart3, Eye, DollarSign, Zap, Globe
} from "lucide-react";
import { useInvestmentOfficeData } from "@/hooks/useInvestmentOfficeData";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;

export default function InvestmentGate() {
  const navigate = useNavigate();
  const p = PORTFOLIO;
  const connected = PLATFORM_CONNECTIONS.filter(c => c.status === "connected").length;
  const hasAccounts = connected > 0;
  const regime = INVESTMENT_ADVISORS.find(a => a.domain === "macro");

  const { portfolio: PORTFOLIO, advisors: INVESTMENT_ADVISORS, platformConnections: PLATFORM_CONNECTIONS, watchlists: WATCHLISTS, instruments: INSTRUMENTS } = useInvestmentOfficeData();

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <DemoModeBadge />
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3"><Briefcase className="h-7 w-7 text-primary" /></div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Investment Office</h1>
                <p className="text-sm text-muted-foreground">Your private capital command center</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Research, simulate, and execute across stocks, crypto, commodities, and event markets — guided by an elite council of AI advisors. Every decision is governed, explainable, and recorded.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={() => navigate("/investments/boardroom")}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                Enter Boardroom <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("/investments/beginner")}
                className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Guided Start
              </button>
              <button onClick={() => navigate("/investments/advanced")}
                className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Advanced Desk
              </button>
            </div>
          </div>

          {/* Capital Overview */}
          <div className="shrink-0 w-full lg:w-72 space-y-3">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4 space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Capital Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Capital</span><span className="font-bold text-foreground">{fmt(p.totalValue + p.totalCash)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Invested</span><span className="text-foreground">{fmt(p.totalValue)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Dry Powder</span><span className="text-foreground">{fmt(p.totalCash)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Performance</span>
                  <span className={p.totalPnl >= 0 ? "text-[hsl(var(--trust-safe))] font-medium" : "text-destructive font-medium"}>
                    {p.totalPnl >= 0 ? "+" : ""}{p.totalPnlPct.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Platforms</p>
              <p className="text-sm text-foreground font-medium">{connected} connected · {PLATFORM_CONNECTIONS.length - connected} available</p>
              {!hasAccounts && (
                <button onClick={() => navigate("/investments/platforms")}
                  className="mt-2 text-[10px] text-primary hover:underline flex items-center gap-1">
                  <Link2 className="h-3 w-3" /> Connect accounts
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Advisor Council Preview */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Advisor Council — Watching Now</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INVESTMENT_ADVISORS.slice(0, 4).map((adv, i) => (
            <motion.div key={adv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/15 transition-all cursor-pointer"
              onClick={() => navigate("/investments/advisors")}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{adv.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{adv.name}</p>
                  <p className="text-[9px] text-muted-foreground">{adv.title}</p>
                </div>
                <span className="text-[10px] font-bold text-primary">{adv.confidence}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{adv.currentInsight}</p>
            </motion.div>
          ))}
        </div>
        <button onClick={() => navigate("/investments/advisors")} className="text-[10px] text-primary hover:underline flex items-center gap-1">
          Full advisor council <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Market Regime + Watchlist Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {regime && (
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 space-y-2">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1"><Globe className="h-3 w-3" /> Market Regime</p>
            <p className="text-sm text-foreground">{regime.currentInsight}</p>
            <div className="flex gap-2 pt-1">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary uppercase">{PORTFOLIO.regime}</span>
              <span className="text-[10px] text-muted-foreground">Risk Score: {PORTFOLIO.riskScore}/100</span>
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Eye className="h-3 w-3" /> Watchlist Pulse</p>
          {WATCHLISTS[0].instruments.slice(0, 4).map(inst => (
            <button key={inst.id} onClick={() => navigate(`/investments/instrument/${inst.id}`)}
              className="w-full flex items-center gap-2 text-left hover:bg-secondary/50 rounded-lg p-1.5 -mx-1.5 transition-colors">
              <span className="text-sm">{inst.logoIcon}</span>
              <span className="text-xs font-medium text-foreground flex-1">{inst.symbol}</span>
              <span className="text-xs text-foreground">${inst.price.toLocaleString()}</span>
              <span className={`text-[10px] font-medium ${inst.changePct24h >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                {inst.changePct24h >= 0 ? "+" : ""}{inst.changePct24h.toFixed(2)}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: "Boardroom", icon: Briefcase, path: "/investments/boardroom" },
          { label: "Markets", icon: Globe, path: "/investments/markets" },
          { label: "Portfolio", icon: BarChart3, path: "/investments/portfolio" },
          { label: "Strategy", icon: Compass, path: "/investments/strategy" },
          { label: "Execute", icon: Zap, path: "/investments/execute" },
          { label: "Risk", icon: Shield, path: "/investments/risk" },
          { label: "Research", icon: Brain, path: "/investments/research" },
        ].map(l => (
          <button key={l.path} onClick={() => navigate(l.path)}
            className="rounded-xl border border-border bg-card p-3 text-center hover:border-primary/20 transition-all group">
            <l.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary mx-auto transition-colors" />
            <p className="text-[10px] font-medium text-muted-foreground mt-1.5 group-hover:text-foreground transition-colors">{l.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
