import { useState } from "react";
import { motion } from "framer-motion";
import { FileSearch, Brain, TrendingUp, TrendingDown, AlertTriangle, Calendar, Globe, Shield, Layers } from "lucide-react";
import { INSTRUMENTS, INVESTMENT_ADVISORS } from "@/hooks/useInvestmentOfficeData";
import { useInvestmentThesisEntries } from "@/hooks/use-investment-office";
import { EXPLAINABILITY_LAYERS, type ExplainabilityDepth } from "@/domains/investment/mock-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const DEPTH_OPTIONS: { value: ExplainabilityDepth; label: string; description: string }[] = [
  { value: "simple", label: "Simple", description: "Plain language" },
  { value: "analyst", label: "Analyst", description: "Structured detail" },
  { value: "committee", label: "Committee", description: "Multi-advisor view" },
  { value: "execution", label: "Execution", description: "Action plan" },
  { value: "risk", label: "Risk", description: "Risk-focused" },
];

export default function IntelligenceDossier() {
  const { data: liveData, isLoading } = useInvestmentThesisEntries();
  const [selectedId, setSelectedId] = useState("nvda");
  const [explainDepth, setExplainDepth] = useState<ExplainabilityDepth>("simple");
  const inst = INSTRUMENTS.find(i => i.id === selectedId)!;
  const relevantAdvisors = INVESTMENT_ADVISORS.filter(a =>
    a.domain === "macro" || a.domain === "risk" ||
    (inst.assetClass === "stocks" && a.domain === "equity") ||
    (inst.assetClass === "crypto" && a.domain === "crypto") ||
    (inst.assetClass === "commodities" && a.domain === "commodities") ||
    (inst.assetClass === "events" && a.domain === "events")
  );

  const layers = EXPLAINABILITY_LAYERS[selectedId];
  const activeLayer = layers?.find(l => l.depth === explainDepth);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileSearch className="h-6 w-6 text-primary" /> Public Intelligence Dossier</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Institutional-quality intelligence packets generated from public information</p>
      </div>

      {/* Asset Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {INSTRUMENTS.slice(0, 8).map(i => (
          <button key={i.id} onClick={() => setSelectedId(i.id)}
            className={`shrink-0 rounded-xl border px-4 py-2.5 flex items-center gap-2 transition-all ${
              selectedId === i.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"
            }`}>
            <span>{i.logoIcon}</span>
            <span className="text-xs font-bold text-foreground">{i.symbol}</span>
          </button>
        ))}
      </div>

      {/* Dossier */}
      <motion.div key={selectedId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Hero */}
        <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-8">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{inst.logoIcon}</span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{inst.name}</h2>
              <p className="text-sm text-muted-foreground">{inst.symbol} · {inst.assetClass.toUpperCase()} · {inst.description}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">${inst.price.toLocaleString()}</p>
              <p className={`text-sm font-medium ${inst.changePct24h >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                {inst.changePct24h >= 0 ? "+" : ""}{inst.changePct24h.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Layer Explainability */}
        {layers && (
          <div className="rounded-2xl border border-primary/15 bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Multi-Layer Explainability
            </h3>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {DEPTH_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setExplainDepth(opt.value)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    explainDepth === opt.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}>
                  <span className="block">{opt.label}</span>
                  <span className="block text-[8px] opacity-70 mt-0.5">{opt.description}</span>
                </button>
              ))}
            </div>
            {activeLayer && (
              <motion.div key={explainDepth} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                className={`rounded-xl p-5 ${
                  explainDepth === "simple" ? "bg-secondary/20" :
                  explainDepth === "analyst" ? "bg-primary/5 border border-primary/10" :
                  explainDepth === "committee" ? "bg-accent/5 border border-accent/10" :
                  explainDepth === "execution" ? "bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10" :
                  "bg-destructive/5 border border-destructive/10"
                }`}>
                <p className={`leading-relaxed whitespace-pre-line ${
                  explainDepth === "simple" ? "text-base text-foreground" : "text-sm text-foreground"
                }`}>{activeLayer.content}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* What Matters Now */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> What Matters Now</h3>
          <p className="text-sm text-foreground leading-relaxed">{inst.description}. Current regime context and key public drivers create a specific environment for this asset.</p>
          <div className="flex gap-2 flex-wrap">
            {inst.theme?.map(t => <span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">{t}</span>)}
          </div>
        </div>

        {/* Bull / Bear / Uncertainty */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5 p-5 space-y-2">
            <p className="text-[10px] font-semibold text-[hsl(var(--trust-safe))] uppercase tracking-wider flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Bull Case</p>
            <p className="text-sm text-foreground">{inst.bullCase || "No specific bull case documented"}</p>
          </div>
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 space-y-2">
            <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Bear Case</p>
            <p className="text-sm text-foreground">{inst.bearCase || "No specific bear case documented"}</p>
          </div>
          <div className="rounded-2xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-5 space-y-2">
            <p className="text-[10px] font-semibold text-[hsl(var(--trust-warn))] uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Key Uncertainty</p>
            <p className="text-sm text-foreground">{inst.uncertainty || "Uncertainty factors not yet documented"}</p>
          </div>
        </div>

        {/* Catalysts */}
        {inst.catalysts.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Catalyst Calendar</h3>
            {inst.catalysts.map(c => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3">
                <div className="text-center shrink-0 w-12">
                  <p className="text-sm font-bold text-foreground">{new Date(c.date).getDate()}</p>
                  <p className="text-[9px] text-muted-foreground">{new Date(c.date).toLocaleDateString("en-US", { month: "short" })}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground">{c.description}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                  c.impact === "positive" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                  c.impact === "negative" ? "bg-destructive/10 text-destructive" :
                  "bg-secondary text-muted-foreground"
                }`}>{c.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Risk Profile */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Risk Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Risk Level", value: inst.riskLevel },
              { label: "52W Range", value: inst.high52w && inst.low52w ? `$${inst.low52w.toLocaleString()} – $${inst.high52w.toLocaleString()}` : "N/A" },
              { label: "Market Cap", value: inst.marketCap ? `$${(inst.marketCap / 1e9).toFixed(0)}B` : "N/A" },
              { label: "Volume 24h", value: inst.volume24h ? `$${(inst.volume24h / 1e6).toFixed(0)}M` : "N/A" },
            ].map(m => (
              <div key={m.label} className="rounded-xl bg-secondary/20 p-3">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase">{m.label}</p>
                <p className="text-sm font-bold text-foreground capitalize">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Advisor Commentary */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Advisor Commentary</h3>
          <div className="space-y-2">
            {relevantAdvisors.slice(0, 4).map(adv => (
              <div key={adv.id} className="rounded-xl border border-border bg-secondary/20 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span>{adv.icon}</span>
                  <p className="text-xs font-bold text-foreground">{adv.name} — {adv.title}</p>
                  <span className="ml-auto text-[9px] font-medium text-muted-foreground">{adv.confidence}%</span>
                </div>
                <p className="text-[11px] text-foreground leading-relaxed">{adv.beginnerExplanation}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
