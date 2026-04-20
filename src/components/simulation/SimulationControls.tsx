// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation Controls Panel
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Play, Loader2, RotateCcw, Zap, Brain, DollarSign, TrendingUp, Heart,
  Search, Plus, Pencil, Trash2, Star,
} from "lucide-react";
import {
  SIMULATION_PRESETS,
  loadCustomScenarios,
  saveCustomScenarios,
  compileFormula,
  type SimulationVariable,
  type SimulationPreset,
  type CustomScenario,
} from "@/domains/simulation/monte-carlo-engine";
import { CustomScenarioBuilder } from "./CustomScenarioBuilder";

const DOMAINS = [
  { id: "All", icon: Star, color: "text-muted-foreground" },
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
  onStart: (config: { variables: SimulationVariable[]; iterations: number; presetId: string; formula?: (v: Record<string, number>) => number }) => void;
  isRunning: boolean;
  onReset: () => void;
}

export function SimulationControls({ onStart, isRunning, onReset }: SimulationControlsProps) {
  const [domain, setDomain] = useState("All");
  const [question, setQuestion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [iterations, setIterations] = useState(100000);
  const [selectedPreset, setSelectedPreset] = useState(SIMULATION_PRESETS[0].id);
  const [variables, setVariables] = useState<SimulationVariable[]>(SIMULATION_PRESETS[0].variables);
  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>(loadCustomScenarios);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingScenario, setEditingScenario] = useState<CustomScenario | null>(null);
  const [activeFormula, setActiveFormula] = useState<((v: Record<string, number>) => number) | null>(null);

  // Merge built-in and custom presets
  const allPresets = useMemo(() => {
    const customs: (SimulationPreset & { isCustom?: boolean; customData?: CustomScenario })[] = customScenarios.map(cs => ({
      id: cs.id,
      label: cs.label,
      domain: cs.domain,
      question: cs.question,
      variables: cs.variables,
      formula: compileFormula(cs.formulaNodes, cs.variables),
      isCustom: true,
      customData: cs,
    }));
    return [...SIMULATION_PRESETS.map(p => ({ ...p, isCustom: false as const })), ...customs];
  }, [customScenarios]);

  const filteredPresets = useMemo(() => {
    let list = allPresets;
    if (domain !== "All") list = list.filter(p => p.domain === domain);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.label.toLowerCase().includes(q) || p.question.toLowerCase().includes(q)
      );
    }
    // Sort: popular first, then alphabetical
    return list.sort((a, b) => {
      if ('popular' in a && a.popular && !('popular' in b && b.popular)) return -1;
      if ('popular' in b && b.popular && !('popular' in a && a.popular)) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [allPresets, domain, searchQuery]);

  const selectPreset = useCallback((id: string) => {
    const preset = allPresets.find(p => p.id === id);
    if (preset) {
      setSelectedPreset(id);
      setVariables([...preset.variables]);
      setQuestion(preset.question);
      setActiveFormula(() => preset.formula);
    }
  }, [allPresets]);

  const updateVariable = (idx: number, field: "mean", value: number) => {
    const updated = [...variables];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariables(updated);
  };

  const handleSaveCustom = (scenario: CustomScenario) => {
    const existing = customScenarios.findIndex(s => s.id === scenario.id);
    let updated: CustomScenario[];
    if (existing >= 0) {
      updated = [...customScenarios];
      updated[existing] = scenario;
    } else {
      updated = [...customScenarios, scenario];
    }
    setCustomScenarios(updated);
    saveCustomScenarios(updated);
    setShowBuilder(false);
    setEditingScenario(null);
    selectPreset(scenario.id);
  };

  const handleDeleteCustom = (id: string) => {
    const updated = customScenarios.filter(s => s.id !== id);
    setCustomScenarios(updated);
    saveCustomScenarios(updated);
    if (selectedPreset === id) selectPreset(SIMULATION_PRESETS[0].id);
  };

  const handleStart = () => {
    const preset = allPresets.find(p => p.id === selectedPreset);
    const formula = activeFormula ?? preset?.formula;
    onStart({ variables, iterations, presetId: selectedPreset, formula: formula ?? undefined });
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-5 overflow-y-auto">
      {/* Domain Selector */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Domain</label>
        <div className="grid grid-cols-5 gap-1">
          {DOMAINS.map(d => {
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                onClick={() => setDomain(d.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[9px] font-medium transition-all border",
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
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Scenario Template ({filteredPresets.length})
        </label>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scenarios..."
            className="pl-8 text-xs h-8 bg-card/50 border-border/40"
          />
        </div>

        <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
          {filteredPresets.map(p => (
            <div
              key={p.id}
              className={cn(
                "group relative w-full text-left rounded-xl px-3 py-2.5 text-xs transition-all border cursor-pointer",
                selectedPreset === p.id
                  ? "border-primary/30 bg-primary/8 text-foreground"
                  : "border-border/40 bg-card/30 text-muted-foreground hover:bg-card/60"
              )}
              onClick={() => selectPreset(p.id)}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-semibold flex-1">{p.label}</span>
                {'popular' in p && p.popular && (
                  <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4">Popular</Badge>
                )}
                {p.isCustom && (
                  <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 border-primary/30 text-primary">Custom</Badge>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{p.question}</div>
              <div className="text-[9px] text-muted-foreground/60 mt-0.5">{p.domain} · {p.variables.length} vars</div>

              {/* Custom scenario actions */}
              {p.isCustom && (
                <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingScenario((p as any).customData);
                      setShowBuilder(true);
                    }}
                    className="p-1 rounded bg-card/80 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustom(p.id);
                    }}
                    className="p-1 rounded bg-card/80 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredPresets.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-4">
              No scenarios match your search.
            </div>
          )}
        </div>

        {/* Create Custom */}
        <AnimatePresence>
          {showBuilder && (
            <div className="mt-2">
              <CustomScenarioBuilder
                onSave={handleSaveCustom}
                onCancel={() => { setShowBuilder(false); setEditingScenario(null); }}
                editing={editingScenario}
              />
            </div>
          )}
        </AnimatePresence>

        {!showBuilder && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBuilder(true)}
            className="w-full mt-2 gap-1.5 text-xs border border-dashed border-primary/20 text-primary hover:bg-primary/5"
          >
            <Plus className="h-3.5 w-3.5" /> Create Your Own
          </Button>
        )}
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
          onClick={handleStart}
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
