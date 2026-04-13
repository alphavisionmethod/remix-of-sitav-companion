// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation Engine — "Run a Million Futures"
// Cinematic Monte Carlo simulation with particle visualizations
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { SimulationCanvas } from "@/components/simulation/SimulationCanvas";
import { SimulationControls } from "@/components/simulation/SimulationControls";
import { SimulationResults } from "@/components/simulation/SimulationResults";
import { Atom, ChevronLeft, ChevronRight } from "lucide-react";
import {
  runSimulationBatch,
  SIMULATION_PRESETS,
  type SimulationProgress,
  type SimulationResult,
  type SimulationVariable,
} from "@/lib/simulation/monte-carlo-engine";

export default function SimulationEnginePage() {
  const [progress, setProgress] = useState<SimulationProgress | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const cancelRef = useRef<(() => void) | null>(null);

  const handleStart = useCallback(
    (config: { variables: SimulationVariable[]; iterations: number; presetId: string }) => {
      // Reset
      setProgress(null);
      setResult(null);
      setIsComplete(false);
      setIsRunning(true);
      if (cancelRef.current) cancelRef.current();

      const preset = SIMULATION_PRESETS.find((p) => p.id === config.presetId) || SIMULATION_PRESETS[0];

      const { cancel } = runSimulationBatch(
        {
          variables: config.variables,
          iterations: config.iterations,
          outputFormula: preset.formula,
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

  return (
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
                className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary/90 px-5 py-1.5 shadow-lg"
              >
                <span className="text-xs font-bold text-primary-foreground tracking-wide">
                  ✦ SIMULATION COMPLETE — {result?.total.toLocaleString()} Scenarios
                </span>
              </motion.div>
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

        {/* Right Panel — Results */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.div
              key="right"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-l border-border/30 bg-card/40 shrink-0 overflow-hidden"
            >
              <SimulationResults result={result} isComplete={isComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
