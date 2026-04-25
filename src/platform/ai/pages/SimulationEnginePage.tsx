// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation Engine — "Run a Million Futures"
// Cinematic Monte Carlo simulation with particle visualizations
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { SimulationCanvas } from "@/platform/ai/components/simulation/SimulationCanvas";
import { SimulationControls } from "@/platform/ai/components/simulation/SimulationControls";
import { SimulationResults } from "@/platform/ai/components/simulation/SimulationResults";
import { MarketIntelligencePanel } from "@/platform/ai/components/simulation/MarketIntelligencePanel";
import { ComparisonOverlay } from "@/platform/ai/components/simulation/ComparisonOverlay";
import { Atom, ChevronLeft, ChevronRight, Globe, BarChart3, GitCompareArrows } from "lucide-react";
import {
  runSimulationBatch,
  SIMULATION_PRESETS,
  type SimulationProgress,
  type SimulationResult,
  type SimulationVariable,
} from "@/domains/simulation/monte-carlo-engine";
import {
  fetchMarketIntelligence,
  applyIntelligenceToVariables,
  type IntelligenceReport,
} from "@/domains/simulation/market-intelligence";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

type RightTab = "results" | "intelligence";

export default function SimulationEnginePage() {
  const [progress, setProgress] = useState<SimulationProgress | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>("results");
  const cancelRef = useRef<(() => void) | null>(null);

  // Intelligence state
  const [intelligence, setIntelligence] = useState<IntelligenceReport | null>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);
  const [groundedVarIds, setGroundedVarIds] = useState<Set<string>>(new Set());

  // Comparison state
  const [savedRuns, setSavedRuns] = useState<{ label: string; result: SimulationResult }[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Track current scenario
  const [currentScenarioLabel, setCurrentScenarioLabel] = useState(SIMULATION_PRESETS[0].label);
  const [currentVariables, setCurrentVariables] = useState<SimulationVariable[]>(SIMULATION_PRESETS[0].variables);

  const handleStart = useCallback(
    (config: { variables: SimulationVariable[]; iterations: number; presetId: string; formula?: (v: Record<string, number>) => number }) => {
      setProgress(null);
      setResult(null);
      setIsComplete(false);
      setIsRunning(true);
      if (cancelRef.current) cancelRef.current();

      const preset = SIMULATION_PRESETS.find((p) => p.id === config.presetId) || SIMULATION_PRESETS[0];
      const formulaToUse = config.formula ?? preset.formula;
      setCurrentScenarioLabel(preset.label);
      setCurrentVariables(config.variables);

      const { cancel } = runSimulationBatch(
        {
          variables: config.variables,
          iterations: config.iterations,
          outputFormula: formulaToUse,
        },
        (p) => setProgress(p),
        (r) => {
          setResult(r);
          setProgress(r);
          setIsRunning(false);
          setIsComplete(true);
        }
      );
      cancelRef.current = cancel;
    },
    []
  );

  const handleReset = useCallback(() => {
    if (cancelRef.current) cancelRef.current();
    setProgress(null);
    setResult(null);
    setIsRunning(false);
    setIsComplete(false);
  }, []);

  const handleFetchIntelligence = useCallback(async () => {
    setIntelligenceLoading(true);
    try {
      const report = await fetchMarketIntelligence(currentVariables, currentScenarioLabel);
      setIntelligence(report);
      const { groundedIds } = applyIntelligenceToVariables(currentVariables, report);
      setGroundedVarIds(groundedIds);
    } finally {
      setIntelligenceLoading(false);
    }
  }, [currentVariables, currentScenarioLabel]);

  const handleSaveRun = useCallback(() => {
    if (result) {
      setSavedRuns(prev => [...prev.slice(-1), { label: currentScenarioLabel, result }]);
    }
  }, [result, currentScenarioLabel]);

  return (
    <PageShell>
    <div className="flex flex-col h-full min-h-0">
      <SitaPageHeader
        icon={<Atom className="h-6 w-6" />}
        title="Simulation Engine"
        subtitle="Run a million futures before deciding"
      />

      <div className="flex flex-1 min-h-0 mt-4 gap-0 rounded-2xl border border-border/40 overflow-hidden bg-card/20">
        {/* Left Panel — Controls */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.div
              key="left"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-r border-border/30 bg-card/40 shrink-0 overflow-hidden"
            >
              <SimulationControls
                onStart={handleStart}
                isRunning={isRunning}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle left */}
        <button
          onClick={() => setLeftOpen(!leftOpen)}
          className="flex items-center justify-center w-5 shrink-0 bg-card/30 hover:bg-card/60 transition-colors border-r border-border/20"
        >
          {leftOpen ? <ChevronLeft className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </button>

        {/* Center — Canvas */}
        <div className="flex-1 min-w-0 relative">
          <SimulationCanvas
            progress={progress}
            isRunning={isRunning}
            isComplete={isComplete}
          />

          {/* Complete overlay */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2"
              >
                <div className="rounded-full bg-primary/90 px-5 py-1.5 shadow-lg">
                  <span className="text-xs font-bold text-primary-foreground tracking-wide">
                    ✦ SIMULATION COMPLETE — {result?.total.toLocaleString()} Scenarios
                  </span>
                </div>
                {/* Save for comparison */}
                <button
                  onClick={handleSaveRun}
                  className="rounded-full bg-card/80 border border-border/40 px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                  title="Save this run for comparison"
                >
                  <GitCompareArrows className="h-3.5 w-3.5 inline mr-1" />
                  Save Run
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show comparison button */}
          {savedRuns.length >= 2 && (
            <button
              onClick={() => setShowComparison(true)}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-card/80 border border-border/40 px-4 py-2 text-xs font-medium text-foreground hover:bg-card transition-colors shadow-lg"
            >
              <GitCompareArrows className="h-3.5 w-3.5 inline mr-1.5" />
              Compare {savedRuns.length} Runs
            </button>
          )}

          {/* Comparison Overlay */}
          <AnimatePresence>
            {showComparison && savedRuns.length >= 2 && (
              <ComparisonOverlay
                runs={savedRuns}
                onClose={() => setShowComparison(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Toggle right */}
        <button
          onClick={() => setRightOpen(!rightOpen)}
          className="flex items-center justify-center w-5 shrink-0 bg-card/30 hover:bg-card/60 transition-colors border-l border-border/20"
        >
          {rightOpen ? <ChevronRight className="h-3 w-3 text-muted-foreground" /> : <ChevronLeft className="h-3 w-3 text-muted-foreground" />}
        </button>

        {/* Right Panel — Results / Intelligence */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.div
              key="right"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-l border-border/30 bg-card/40 shrink-0 overflow-hidden flex flex-col"
            >
              {/* Tab switcher */}
              <div className="flex border-b border-border/30 shrink-0">
                <button
                  onClick={() => setRightTab("results")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                    rightTab === "results"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BarChart3 className="h-3 w-3" /> Results
                </button>
                <button
                  onClick={() => setRightTab("intelligence")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                    rightTab === "intelligence"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Globe className="h-3 w-3" /> Intelligence
                </button>
              </div>

              {/* Tab content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {rightTab === "results" ? (
                  <SimulationResults
                    result={result}
                    isComplete={isComplete}
                    scenarioLabel={currentScenarioLabel}
                    groundedVarIds={groundedVarIds}
                    totalVars={currentVariables.length}
                  />
                ) : (
                  <MarketIntelligencePanel
                    intelligence={intelligence}
                    isLoading={intelligenceLoading}
                    groundedVarIds={groundedVarIds}
                    onFetchIntelligence={handleFetchIntelligence}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </PageShell>
  );
}
