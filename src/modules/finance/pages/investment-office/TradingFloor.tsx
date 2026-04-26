// truth-allow: ia-config
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, Zap, BarChart3 } from "lucide-react";
import { INSTRUMENTS, PORTFOLIO } from "@/hooks/useInvestmentOfficeData";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// Sector groupings for heatmap
const SECTORS = [
  { name: "Technology", symbols: ["AAPL", "MSFT", "NVDA", "TSLA"], color: "hsl(var(--primary))" },
  { name: "Crypto", symbols: ["BTC", "ETH", "SOL"], color: "hsl(38 85% 58%)" },
  { name: "Commodities", symbols: ["GLD", "USO"], color: "hsl(25 75% 55%)" },
  { name: "Fixed Income", symbols: ["TLT", "BND"], color: "hsl(210 60% 55%)" },
];

function HeatmapBlock({ instrument, onClick }: { instrument: typeof INSTRUMENTS[0]; onClick: () => void }) {
  const intensity = Math.min(Math.abs(instrument.changePct24h) / 5, 1);
  const isUp = instrument.changePct24h >= 0;
  const bg = isUp
    ? `hsla(var(--trust-safe), ${0.1 + intensity * 0.4})`
    : `hsla(var(--destructive), ${0.1 + intensity * 0.4})`;

  return (
    <motion.button
      onClick={onClick}
      className="relative rounded-xl border border-border/50 p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:z-10"
      style={{ backgroundColor: bg }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{instrument.logoIcon}</span>
        <span className="text-sm font-bold text-foreground">{instrument.symbol}</span>
      </div>
      <p className="text-lg font-bold text-foreground">${instrument.price.toLocaleString()}</p>
      <div className={`flex items-center gap-1 text-sm font-semibold ${isUp ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
        {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        {isUp ? "+" : ""}{instrument.changePct24h.toFixed(2)}%
      </div>
      <p className="text-[9px] text-muted-foreground mt-1 truncate">{instrument.name}</p>
    </motion.button>
  );
}

function SectorRadar() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setRotation(r => r + 0.5), 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto">
      {/* Radar circles */}
      {[1, 2, 3].map(i => (
        <div key={i} className="absolute inset-0 rounded-full border border-primary/10"
          style={{ margin: `${i * 15}%` }} />
      ))}
      {/* Sweep line */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/2 h-0.5 bg-gradient-to-r from-primary/60 to-transparent origin-left"
          style={{ transform: `rotate(${rotation}deg)` }} />
      </div>
      {/* Sector dots */}
      {SECTORS.map((s, i) => {
        const angle = (i / SECTORS.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 35;
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        return (
          <div key={s.name} className="absolute flex flex-col items-center gap-1"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: s.color }} />
            <span className="text-[9px] font-semibold text-muted-foreground whitespace-nowrap">{s.name}</span>
          </div>
        );
      })}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-semibold text-primary">SECTOR FLOW</span>
      </div>
    </div>
  );
}

function VolumePulse() {
  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary/40"
          animate={{ height: [4, 8 + Math.random() * 20, 4] }}
          transition={{ duration: 0.8 + Math.random() * 1.2, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}

export default function TradingFloor() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [livePrices, setLivePrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(INSTRUMENTS.map(i => [i.id, i.price]))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices(prev => {
        const next = { ...prev };
        const keys = Object.keys(next);
        for (let i = 0; i < 3; i++) {
          const key = keys[Math.floor(Math.random() * keys.length)];
          next[key] = Math.max(0.01, next[key] + next[key] * (Math.random() - 0.5) * 0.003);
        }
        return next;
      });
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalValue = PORTFOLIO.totalValue + PORTFOLIO.totalCash;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageTruthBanner truthState="partial" />
{/* Header with pulse */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            Live Trading Floor
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--trust-safe))] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[hsl(var(--trust-safe))]" />
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time market visualization & action hotspots</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Capital</p>
        </div>
      </div>

      {/* Ticker ribbon */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur">
        <div className="flex animate-ticker-scroll whitespace-nowrap py-2">
          {[...INSTRUMENTS, ...INSTRUMENTS].map((inst, i) => {
            const isUp = inst.changePct24h >= 0;
            return (
              <div key={i} className="flex items-center gap-1.5 px-4 border-r border-border/30 shrink-0">
                <span className="text-xs">{inst.logoIcon}</span>
                <span className="text-[10px] font-semibold text-foreground">{inst.symbol}</span>
                <span className="text-[10px] font-mono text-foreground">
                  ${(livePrices[inst.id] ?? inst.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[9px] font-bold ${isUp ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                  {isUp ? "+" : ""}{inst.changePct24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main grid: Heatmap + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Heatmap */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Asset Heatmap</h2>
            <VolumePulse />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {INSTRUMENTS.map(inst => (
              <HeatmapBlock
                key={inst.id}
                instrument={inst}
                onClick={() => navigate(`/investments/instrument/${inst.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Sector Radar */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Sector Rotation
          </h3>
          <SectorRadar />
          <div className="space-y-2">
            {SECTORS.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] text-muted-foreground flex-1">{s.name}</span>
                <span className="text-[10px] font-semibold text-foreground">{s.symbols.length} assets</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Allocation bars */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Portfolio Allocation</h3>
        <div className="flex gap-1 h-6 rounded-full overflow-hidden">
          {Object.entries(PORTFOLIO.allocationByClass)
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([cls, pct], i) => (
              <motion.div
                key={cls}
                className="h-full rounded-sm"
                style={{
                  width: `${pct}%`,
                  backgroundColor: SECTORS[i % SECTORS.length]?.color || "hsl(var(--primary))",
                  opacity: 0.7,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                title={`${cls}: ${pct.toFixed(1)}%`}
              />
            ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PORTFOLIO.allocationByClass)
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([cls, pct], i) => (
              <span key={cls} className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTORS[i % SECTORS.length]?.color || "hsl(var(--primary))" }} />
                {cls}: {pct.toFixed(1)}%
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
