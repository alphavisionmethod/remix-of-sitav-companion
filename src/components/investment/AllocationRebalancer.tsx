import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, TrendingDown, RotateCcw, Check, AlertTriangle, Sparkles } from "lucide-react";

interface AssetClass {
  key: string;
  label: string;
  color: string;
  currentWeight: number;
}

interface RebalancerProps {
  totalValue: number;
  classes: AssetClass[];
  onApply?: (weights: Record<string, number>) => void;
}

const RISK_PROFILES: Record<string, Record<string, number>> = {
  conservative: { stocks: 30, etfs: 40, crypto: 0, commodities: 20, events: 0, cash: 10 },
  balanced: { stocks: 35, etfs: 25, crypto: 10, commodities: 15, events: 5, cash: 10 },
  growth: { stocks: 40, etfs: 15, crypto: 25, commodities: 10, events: 5, cash: 5 },
  aggressive: { stocks: 30, etfs: 5, crypto: 40, commodities: 5, events: 15, cash: 5 },
};

export default function AllocationRebalancer({ totalValue, classes, onApply }: RebalancerProps) {
  const originalWeights = useMemo(() => {
    const w: Record<string, number> = {};
    classes.forEach(c => { w[c.key] = c.currentWeight; });
    return w;
  }, [classes]);

  const [weights, setWeights] = useState<Record<string, number>>(() => ({ ...originalWeights }));
  const [locked, setLocked] = useState<Record<string, boolean>>({});

  const totalWeight = Object.values(weights).reduce((s, v) => s + v, 0);
  const isBalanced = Math.abs(totalWeight - 100) < 0.5;

  const handleSliderChange = (key: string, newVal: number) => {
    const old = weights[key];
    const diff = newVal - old;
    const unlocked = classes.filter(c => c.key !== key && !locked[c.key]);
    if (unlocked.length === 0) return;

    const newWeights = { ...weights, [key]: newVal };
    const totalUnlocked = unlocked.reduce((s, c) => s + weights[c.key], 0);

    if (totalUnlocked > 0) {
      unlocked.forEach(c => {
        const proportion = weights[c.key] / totalUnlocked;
        newWeights[c.key] = Math.max(0, Math.round((weights[c.key] - diff * proportion) * 10) / 10);
      });
    }

    // Normalize to 100
    const sum = Object.values(newWeights).reduce((s, v) => s + v, 0);
    if (sum > 0 && Math.abs(sum - 100) > 0.1) {
      const scale = 100 / sum;
      Object.keys(newWeights).forEach(k => {
        if (k !== key) newWeights[k] = Math.round(newWeights[k] * scale * 10) / 10;
      });
    }

    setWeights(newWeights);
  };

  const applyPreset = (preset: string) => {
    const p = RISK_PROFILES[preset];
    if (!p) return;
    const newW: Record<string, number> = {};
    classes.forEach(c => { newW[c.key] = p[c.key] ?? 0; });
    setWeights(newW);
  };

  const reset = () => setWeights({ ...originalWeights });

  const changes = useMemo(() => {
    return classes.map(c => {
      const oldVal = (originalWeights[c.key] / 100) * totalValue;
      const newVal = ((weights[c.key] ?? 0) / 100) * totalValue;
      const diff = newVal - oldVal;
      const pctChange = weights[c.key] - originalWeights[c.key];
      return { key: c.key, label: c.label, oldPct: originalWeights[c.key], newPct: weights[c.key], diff, pctChange };
    }).filter(c => Math.abs(c.pctChange) > 0.05);
  }, [weights, originalWeights, totalValue, classes]);

  const riskScore = useMemo(() => {
    const crypto = weights.crypto ?? 0;
    const events = weights.events ?? 0;
    const stocks = weights.stocks ?? 0;
    const score = Math.min(100, Math.round(crypto * 1.5 + events * 2 + stocks * 0.5 + (weights.commodities ?? 0) * 0.3));
    return score;
  }, [weights]);

  const riskLabel = riskScore < 25 ? "Conservative" : riskScore < 50 ? "Moderate" : riskScore < 75 ? "Growth" : "Aggressive";
  const riskColor = riskScore < 25 ? "text-[hsl(var(--trust-safe))]" : riskScore < 50 ? "text-primary" : riskScore < 75 ? "text-[hsl(var(--trust-warn))]" : "text-destructive";

  return (
    <div className="space-y-5">
      {/* Presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Presets:</span>
        {Object.keys(RISK_PROFILES).map(p => (
          <button key={p} onClick={() => applyPreset(p)}
            className="rounded-full bg-secondary px-3 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors capitalize">
            {p}
          </button>
        ))}
        <button onClick={reset}
          className="rounded-full bg-secondary px-3 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 ml-auto">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        {classes.map(c => {
          const val = weights[c.key] ?? 0;
          const diff = val - originalWeights[c.key];
          const dollarVal = (val / 100) * totalValue;
          return (
            <div key={c.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
                  <span className="text-xs font-medium text-foreground capitalize">{c.label}</span>
                  <button onClick={() => setLocked(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                    className={`text-[9px] px-1.5 py-0.5 rounded ${locked[c.key] ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {locked[c.key] ? "🔒" : "🔓"}
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">${dollarVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span className="font-bold text-foreground w-12 text-right">{val.toFixed(1)}%</span>
                  {Math.abs(diff) > 0.05 && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-medium w-16 ${diff > 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                      {diff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <Slider
                value={[val]}
                min={0}
                max={80}
                step={0.5}
                disabled={locked[c.key]}
                onValueChange={([v]) => handleSliderChange(c.key, v)}
                className="w-full"
              />
            </div>
          );
        })}
      </div>

      {/* Totals & Risk */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
            <p className={`text-lg font-bold ${isBalanced ? "text-foreground" : "text-destructive"}`}>{totalWeight.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Profile</p>
            <p className={`text-lg font-bold ${riskColor}`}>{riskLabel}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Score</p>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--trust-safe))] via-[hsl(var(--trust-warn))] to-destructive transition-all" style={{ width: `${riskScore}%` }} />
              </div>
              <span className={`text-xs font-bold ${riskColor}`}>{riskScore}</span>
            </div>
          </div>
        </div>
        {!isBalanced && (
          <span className="flex items-center gap-1 text-[10px] text-destructive font-medium">
            <AlertTriangle className="h-3 w-3" /> Must total 100%
          </span>
        )}
      </div>

      {/* Impact Preview */}
      {changes.length > 0 && (
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 space-y-3">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Rebalance Impact Preview
          </h4>
          <div className="space-y-2">
            {changes.map(ch => (
              <div key={ch.key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">{ch.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{ch.oldPct.toFixed(1)}%</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium text-foreground">{ch.newPct.toFixed(1)}%</span>
                  <span className={`font-medium ${ch.diff >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                    {ch.diff >= 0 ? "+" : ""}${Math.abs(ch.diff).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onApply?.(weights)} disabled={!isBalanced}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Check className="h-3.5 w-3.5" /> Apply Rebalance — Review & Simulate
          </button>
        </div>
      )}
    </div>
  );
}
