import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Shield, Brain, TrendingUp, Eye, Target, ChevronRight, HelpCircle, Lightbulb, DollarSign } from "lucide-react";
import { useInvestmentOfficeData } from "@/hooks/useInvestmentOfficeData";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;

const LEARN_TOPICS = [
  { icon: "📊", title: "What is a portfolio?", desc: "Your portfolio is the collection of all your investments across platforms. Think of it as your investment library." },
  { icon: "⚖️", title: "What is risk?", desc: "Risk means how much your investments could lose. Higher risk means bigger possible gains AND losses." },
  { icon: "🎯", title: "What is a thesis?", desc: "A thesis is your reason for investing. Writing it down helps you make better decisions and learn from results." },
  { icon: "🔮", title: "What are event markets?", desc: "Event markets let you invest based on whether something will happen — like elections or rate decisions." },
  { icon: "🛡️", title: "What is diversification?", desc: "Spreading money across different types of investments so one bad bet doesn't hurt your whole portfolio." },
  { icon: "📈", title: "What are advisors?", desc: "SITA advisors are AI specialists that watch different parts of the market and give you guidance." },
];

export default function BeginnerMode() {
  const navigate = useNavigate();
  const p = PORTFOLIO;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <DemoModeBadge />
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3"><GraduationCap className="h-7 w-7 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome to Your Investment Office</h1>
            <p className="text-sm text-muted-foreground">Let's make investing clear, safe, and smart — one step at a time</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          This is your guided starting point. Everything here is explained in plain language. You'll simulate before you invest, and advisors will guide you along the way. No jargon, no pressure.
        </p>
      </motion.div>

      {/* Simple Capital View */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Your Money at a Glance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-secondary/30 p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold text-foreground mt-1">{fmt(p.totalValue + p.totalCash)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Everything you have invested + cash</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4 text-center">
            <p className="text-xs text-muted-foreground">How It's Doing</p>
            <p className={`text-2xl font-bold mt-1 ${p.totalPnl >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
              {p.totalPnl >= 0 ? "+" : ""}{p.totalPnlPct.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{p.totalPnl >= 0 ? "You're up overall — nice!" : "Down a bit — totally normal"}</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4 text-center">
            <p className="text-xs text-muted-foreground">Risk Level</p>
            <p className="text-2xl font-bold text-foreground mt-1">{p.riskScore > 70 ? "Higher" : p.riskScore > 40 ? "Moderate" : "Lower"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{p.riskScore}/100 — {p.riskScore > 70 ? "Consider diversifying" : "Looking balanced"}</p>
          </div>
        </div>
      </div>

      {/* Guided Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Lightbulb className="h-4 w-4 text-accent" /> What You Can Do</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: Eye, title: "Explore Markets", desc: "Browse stocks, crypto, and more with plain-language explanations", path: "/investments/markets", color: "text-primary" },
            { icon: Brain, title: "Ask Your Advisors", desc: "See what your AI investment team thinks about the market right now", path: "/investments/advisors", color: "text-accent" },
            { icon: Target, title: "Simulate First", desc: "Test an investment idea before risking real money", path: "/investments/strategy", color: "text-[hsl(var(--trust-safe))]" },
            { icon: Shield, title: "Check Your Risk", desc: "Understand how safe your portfolio is in simple terms", path: "/investments/risk", color: "text-[hsl(var(--trust-warn))]" },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)}
              className="rounded-2xl border border-border bg-card p-5 text-left hover:border-primary/20 transition-all flex items-start gap-3 group">
              <a.icon className={`h-5 w-5 ${a.color} shrink-0 mt-0.5`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Learn Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> Learn the Basics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEARN_TOPICS.map(t => (
            <div key={t.title} className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/15 transition-all cursor-pointer">
              <span className="text-2xl">{t.icon}</span>
              <p className="text-xs font-semibold text-foreground">{t.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Switch to Advanced */}
      <div className="text-center pt-4">
        <button onClick={() => navigate("/investments/advanced")}
          className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Ready for more? Switch to Advanced Mode →
        </button>
      </div>
    </div>
  );
}
