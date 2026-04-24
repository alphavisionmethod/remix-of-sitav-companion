import { useState } from "react";
import { motion } from "framer-motion";
import { Map, TrendingUp, Zap, Eye, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { INSTRUMENTS } from "@/hooks/useInvestmentOfficeData";
import { useMarketWatchlistItems } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const THEMES: any[] = [{ name: "—", instruments: [], conviction: 0, thesis: "" }];
export default function OpportunityMap() {
  const { data: liveData, isLoading } = useMarketWatchlistItems();
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Map className="h-6 w-6 text-primary" /> Opportunity Map</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Visual intelligence field of themes, narratives, and linked assets with crowding and uncertainty overlays</p>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {([] as never[]).map((theme, i) => (
          <motion.button key={theme.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedTheme(theme)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              selectedTheme.id === theme.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{theme.icon}</span>
              <p className="text-xs font-bold text-foreground flex-1">{theme.label}</p>
            </div>
            {/* Strength / Crowding / Uncertainty bars */}
            <div className="space-y-1.5">
              {[
                { label: "Strength", value: theme.strength, color: "bg-[hsl(var(--trust-safe))]" },
                { label: "Crowding", value: theme.crowding, color: "bg-[hsl(var(--trust-warn))]" },
                { label: "Uncertainty", value: theme.uncertainty, color: "bg-destructive" },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex justify-between text-[8px] text-muted-foreground mb-0.5">
                    <span>{b.label}</span>
                    <span>{b.value}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-2">
              {theme.instruments.map(s => (
                <span key={s} className="rounded-full bg-secondary px-1.5 py-0.5 text-[8px] text-muted-foreground">{s}</span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected Theme Detail */}
      <motion.div key={selectedTheme.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{selectedTheme.icon}</span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{selectedTheme.label}</h2>
            <p className="text-sm text-muted-foreground">{selectedTheme.advisorView}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-secondary/20 p-3 text-center">
            <p className="text-[9px] font-semibold text-[hsl(var(--trust-safe))] uppercase">Theme Strength</p>
            <p className="text-2xl font-bold text-foreground">{selectedTheme.strength}%</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/20 p-3 text-center">
            <p className="text-[9px] font-semibold text-[hsl(var(--trust-warn))] uppercase">Crowding Risk</p>
            <p className="text-2xl font-bold text-foreground">{selectedTheme.crowding}%</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/20 p-3 text-center">
            <p className="text-[9px] font-semibold text-destructive uppercase">Uncertainty</p>
            <p className="text-2xl font-bold text-foreground">{selectedTheme.uncertainty}%</p>
          </div>
        </div>

        {/* Linked Instruments */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Linked Instruments</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {selectedTheme.instruments.map(sym => {
              const inst = INSTRUMENTS.find(i => i.symbol === sym);
              if (!inst) return null;
              return (
                <button key={sym} onClick={() => navigate(`/investments/instrument/${inst.id}`)}
                  className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 hover:border-primary/20 transition-all group">
                  <span className="text-lg">{inst.logoIcon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-foreground">{inst.symbol}</p>
                    <p className="text-[10px] text-muted-foreground">{inst.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">${inst.price.toLocaleString()}</p>
                    <p className={`text-[10px] ${inst.changePct24h >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                      {inst.changePct24h >= 0 ? "+" : ""}{inst.changePct24h.toFixed(2)}%
                    </p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
