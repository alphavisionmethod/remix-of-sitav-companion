import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Shield, Brain, TrendingUp, Eye, Target, ChevronRight, HelpCircle, Lightbulb, DollarSign, CheckCircle2, BarChart3, Wallet } from "lucide-react";
import { PORTFOLIO } from "@/hooks/useInvestmentOfficeData";
import { useInvestmentStrategyRecords } from "@/hooks/use-investment-office";
import { DEMO_LEARN_TOPICS } from "@/data/seed/investment";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;

const WIZARD_STEPS = [
  { id: 1, title: "Explore Markets", icon: Eye, description: "Browse assets with plain-language explanations. No jargon — just clear information about stocks, crypto, and more.", action: "Let's Explore", path: "/investments/markets" },
  { id: 2, title: "Ask Your Advisors", icon: Brain, description: "Your investment team watches the market for you. See what they think before you make any decisions.", action: "Meet Advisors", path: "/investments/advisors" },
  { id: 3, title: "Simulate First", icon: BarChart3, description: "Test any investment idea without risking real money. See what would happen in different scenarios.", action: "Try Simulator", path: "/investments/strategy" },
  { id: 4, title: "Invest With Confidence", icon: Target, description: "When you're ready, execute with full risk review, advisor guidance, and a receipt for every decision.", action: "Open Desk", path: "/investments/execute" },
];

export default function BeginnerMode() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useInvestmentStrategyRecords();
  const navigate = useNavigate();
  const p = PORTFOLIO;
  const [wizardStep, setWizardStep] = useState(0);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
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

      {/* First Investment Wizard */}
      <div className="rounded-2xl border border-primary/15 bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Your First Investment — 4 Steps</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {WIZARD_STEPS.map((step, i) => (
            <button key={step.id} onClick={() => setWizardStep(i)}
              className={`rounded-xl p-1.5 text-center transition-all ${wizardStep === i ? "bg-primary/10 border border-primary/20" : "bg-secondary/30 border border-transparent"}`}>
              <p className={`text-[10px] font-bold ${wizardStep === i ? "text-primary" : "text-muted-foreground"}`}>Step {step.id}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{step.title}</p>
            </button>
          ))}
        </div>
        <motion.div key={wizardStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
          className="rounded-xl border border-border bg-secondary/20 p-5 space-y-3">
          <div className="flex items-center gap-3">
            {(() => { const StepIcon = WIZARD_STEPS[wizardStep].icon; return <StepIcon className="h-6 w-6 text-primary" />; })()}
            <div>
              <p className="text-sm font-semibold text-foreground">{WIZARD_STEPS[wizardStep].title}</p>
              <p className="text-[10px] text-muted-foreground">Step {wizardStep + 1} of 4</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{WIZARD_STEPS[wizardStep].description}</p>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(WIZARD_STEPS[wizardStep].path)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
              {WIZARD_STEPS[wizardStep].action} <ChevronRight className="h-3.5 w-3.5" />
            </button>
            {wizardStep < 3 && (
              <button onClick={() => setWizardStep(wizardStep + 1)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Skip to next step →
              </button>
            )}
          </div>
          {/* Safety Reminder */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Shield className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
            <p className="text-[10px] text-[hsl(var(--trust-safe))]">
              {wizardStep === 0 && "Browsing is free — no risk, no commitment"}
              {wizardStep === 1 && "Advisors help you understand — they don't pressure you"}
              {wizardStep === 2 && "Simulations use play money — nothing is real yet"}
              {wizardStep === 3 && "Every trade gets a risk review and a receipt"}
            </p>
          </div>
        </motion.div>
      </div>

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
          {(isDemoMode ? DEMO_LEARN_TOPICS : [] as typeof DEMO_LEARN_TOPICS).map(t => (
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