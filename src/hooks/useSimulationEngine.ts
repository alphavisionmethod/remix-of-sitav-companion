// ═══════════════════════════════════════════════════════════════
// SITA OS — useSimulationEngine Hook
// Exposes scenario runner, dry-run executor, what-if analyzer,
// chaos orchestrator, verification pipeline, and twin manager.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo } from "react";
import { SimulationEngine, getSimulationEngine } from "@/lib/engines/simulation-engine";
import type { ScenarioPack } from "@/packages/simulation-contracts/scenario-types";
import type { DryRunRequest } from "@/packages/simulation-contracts/dry-run-types";
import type { WhatIfScenario } from "@/packages/simulation-contracts/what-if-types";
import type { ChaosScript } from "@/packages/simulation-contracts/chaos-types";
import type { DigitalTwinModel } from "@/packages/simulation-contracts/digital-twin-types";

export function useSimulationEngine() {
  const engine = useMemo(() => getSimulationEngine(), []);

  const runScenarioPack = useCallback((pack: ScenarioPack) =>
    engine.runScenarioPack(pack), [engine]);

  const executeDryRun = useCallback(<TInput, TOutput>(request: DryRunRequest<TInput>) =>
    engine.executeDryRun<TInput, TOutput>(request), [engine]);

  const analyzeWhatIf = useCallback((scenario: WhatIfScenario) =>
    engine.analyzeWhatIf(scenario), [engine]);

  const compareTradeoffs = useCallback((options: Array<{
    option_id: string;
    label: string;
    scenario: WhatIfScenario;
  }>) => engine.compareTradeoffs(options), [engine]);

  const runChaos = useCallback((script: ChaosScript) =>
    engine.runChaos(script), [engine]);

  const registerTwin = useCallback((twin: DigitalTwinModel) =>
    engine.registerTwin(twin), [engine]);

  const syncTwin = useCallback((twinId: string) =>
    engine.syncTwin(twinId), [engine]);

  const getTwinReport = useCallback((twinId: string) =>
    engine.getTwinReport(twinId), [engine]);

  const verifyPrediction = useCallback((params: {
    prediction_id: string;
    predicted: { metric: string; value: number; confidence: number };
    actual: { metric: string; value: number; measured_at: string };
  }) => engine.verifyPrediction(params), [engine]);

  return {
    runScenarioPack,
    executeDryRun,
    analyzeWhatIf,
    compareTradeoffs,
    runChaos,
    registerTwin,
    syncTwin,
    getTwinReport,
    verifyPrediction,
  };
}
