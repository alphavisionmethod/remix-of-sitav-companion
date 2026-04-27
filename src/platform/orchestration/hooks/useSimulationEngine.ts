// ═══════════════════════════════════════════════════════════════
// SITA OS — useSimulationEngine Hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo } from "react";
import { getSimulationEngine } from "@/domains/engines/simulation-engine";
import type { ScenarioPack } from "@/packages/simulation-contracts/scenario-types";
import type { DryRunRequest } from "@/packages/simulation-contracts/dry-run-types";
import type { WhatIfScenario } from "@/packages/simulation-contracts/what-if-types";
import type { ChaosScript } from "@/packages/simulation-contracts/chaos-types";
import type { DigitalTwinModel } from "@/packages/simulation-contracts/digital-twin-types";
import type { TradeoffOption } from "@/packages/simulation-contracts/what-if-types";

export function useSimulationEngine() {
  const engine = useMemo(() => getSimulationEngine(), []);

  const runScenarioPack = useCallback((pack: ScenarioPack) =>
    engine.scenarios.runScenarioPack(pack), [engine]);

  const executeDryRun = useCallback(<TInput, TOutput>(request: DryRunRequest<TInput>) =>
    engine.dryRun.execute<TInput, TOutput>(request), [engine]);

  const analyzeWhatIf = useCallback((scenario: WhatIfScenario) =>
    engine.whatIf.project(scenario), [engine]);

  const compareTradeoffs = useCallback((name: string, options: TradeoffOption[]) =>
    engine.whatIf.compareTradeoffs(name, options), [engine]);

  const runChaos = useCallback((script: ChaosScript) =>
    engine.chaos.runChaosScript(script), [engine]);

  const registerTwin = useCallback(<T extends Record<string, unknown>>(twin: DigitalTwinModel<T>) =>
    engine.twins.createTwin(twin), [engine]);

  const syncTwin = useCallback((twinId: string) =>
    engine.twins.syncReport(twinId), [engine]);

  const getTwin = useCallback((twinId: string) =>
    engine.twins.getTwin(twinId), [engine]);

  const verifyPrediction = useCallback((
    predicted: Array<{ metric: string; value: number; confidence: number }>,
    actual: Array<{ metric: string; value: number }>,
  ) => engine.verification.verify(predicted, actual), [engine]);

  return {
    runScenarioPack, executeDryRun, analyzeWhatIf, compareTradeoffs,
    runChaos, registerTwin, syncTwin, getTwin, verifyPrediction,
  };
}
