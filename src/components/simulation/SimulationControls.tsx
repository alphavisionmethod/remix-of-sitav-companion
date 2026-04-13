// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation Controls Panel
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Play, Loader2, RotateCcw, Zap, Brain, DollarSign, TrendingUp, Heart } from "lucide-react";
import { SIMULATION_PRESETS, type SimulationVariable } from "@/lib/simulation/monte-carlo-engine";

const DOMAINS = [
  { id: "Business", icon: Zap, color: "text-primary" },
  { id: "Finance", icon: DollarSign, color: "text-[hsl(var(--sita-gold))]" },
  { id: "Investment", icon: TrendingUp, color: "text-[hsl(var(--trust-safe))]" },
  { id: "Life", icon: Heart, color: "text-[hsl(var(--destructive))]" },
];

const ITERATION_OPTIONS = [
  { label: "10K", value: 10000, est: "~1s" },
  { label: "100K", value: 100000, est: "~5s" },
  { label: "1M", value: 1000000, est: "~30s" },
];

interface SimulationControlsProps {
  onStart: (config: { variables: SimulationVariable[]; iterations: number; presetId: string }) => void;
  isRunning: boolean;
  onReset: () => void;
}

export function SimulationControls({ onStart, isRunning, onReset }: SimulationControlsProps) {
  const [domain, setDomain] = useState("Business");
  const [question, setQuestion] = useState("");
  const [iterations, setIterations] = useState(100000);
  const [selectedPreset, setSelectedPreset] = useState(SIMULATION_PRESETS[0].id);
  const [variables, setVariables] = useState<SimulationVariable[]>(SIMULATION_PRESETS[0].variables);

  const filteredPresets = SIMULATION_PRESETS.filter(p => p.domain === domain || domain === "Life");
  const activePreset = SIMULATION_PRESETS.find(p => p.id === selectedPreset) || SIMULATION_PRESETS[0];

  const selectPreset = (id: string) => {
    const preset = SIMULATION_PRESETS.find(p => p.id === id);
    if (preset) {
      setSelectedPreset(id);
      setVariables([...preset.variables]);
      setQuestion(preset.question);
    }
  };

  const updateVariable = (idx: number, field: "mean", value: number) => {
    const updated = [...variables];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariables(updated);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-5 overflow-y-auto">
      {/* Domain Selector */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Domain</label>
        <div className="grid grid-cols-4 gap-1.5">
          {DOMAINS.map(d => {
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                onClick={() => { setDomain(d.id); }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-all border",
                  domain === d.id
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/50 bg-card/50 text-muted-foreground hover:border-primary/20"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {d.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Decision Question</label>
        <div className="relative">
          <Brain className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What if I..."
            className="pl-9 text-sm bg-card/80 border-border/50"
          />
        </div>
      </div>

      {/* Presets */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Scenario Template</label>
        <div className="space-y-1.5">
          {(filteredPresets.length > 0 ? filteredPresets : SIMULATION_PRESETS).map(p => (
            <button
              key={p.id}
              onClick={() => selectPreset(p.id)}
              className={cn(
                "w-full text-left rounded-xl px-3 py-2.5 text-xs transition-all border",
                selectedPreset === p.id
                  ? "border-primary/30 bg-primary/8 text-foreground"
                  : "border-border/40 bg-card/30 text-muted-foreground hover:bg-card/60"
              )}
            >
              <div className="font-semibold">{p.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{p.question}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Variables */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Variables</label>
        <div className="space-y-3">
          {variables.map((v, i) => (
            <div key={v.id} className="rounded-xl border border-border/40 bg-card/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-foreground">{v.label}</span>
                <span className="text-[10px] font-mono text-primary">
                  {v.mean >= 1000 ? `${(v.mean / 1000).toFixed(v.mean >= 100000 ? 0 : 1)}K` : v.mean.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[v.mean]}
                min={v.min}
                max={v.max}
                step={(v.max - v.min) / 100}
                onValueChange={([val]) => updateVariable(i, "mean", val)}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">{v.min.toLocaleString()}</span>
                <span className="text-[9px] text-muted-foreground">{v.max.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Iterations */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Iterations</label>
        <div className="grid grid-cols-3 gap-1.5">
          {ITERATION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setIterations(opt.value)}
              className={cn(
                "rounded-xl px-3 py-2 text-center transition-all border",
                iterations === opt.value
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/40 bg-card/30 text-muted-foreground hover:border-primary/20"
              )}
            >
              <div className="text-sm font-bold">{opt.label}</div>
              <div className="text-[9px]">{opt.est}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={() => onStart({ variables, iterations, presetId: selectedPreset })}
          disabled={isRunning}
          className="flex-1 gap-2"
          size="lg"
        >
          {isRunning ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Simulating...</>
          ) : (
            <><Play className="h-4 w-4" /> Simulate</>
          )}
        </Button>
        <Button variant="outline" size="lg" onClick={onReset} disabled={isRunning}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
