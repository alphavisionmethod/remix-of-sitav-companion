// ═══════════════════════════════════════════════════════════════
// SITA OS — Orchestration Health Hook
// React hook for pipeline observability
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from "react";
import { getEventBus } from "@/platform/core-services/event-bus";
import { getTransmissionLog } from "@/lib/services/orchestration-pipeline/signal-emitter";
import { initAdvisorConsumer, getAdvisorOutputs } from "@/lib/services/orchestration-pipeline/module-advisor-consumer";
import { initAppBoardSynthesizer, getSynthesisForDomain } from "@/lib/services/orchestration-pipeline/app-board-synthesizer";
import { getWiringManifest, validateWiring } from "@/lib/services/orchestration-pipeline/wiring-manifest";
import { runAllProbes, type ProbeResult } from "@/lib/services/orchestration-pipeline/pipeline-probe";
import type { Domain, AppBoardSynthesis, TransmissionLogEntry, AdvisorOutputPacket } from "@/lib/services/orchestration-pipeline/types";

export interface OrchestrationHealthState {
  initialized: boolean;
  wiringValid: boolean;
  wiringIssues: string[];
  nodeCount: number;
  edgeCount: number;
  transmissionLog: TransmissionLogEntry[];
  advisorOutputCount: number;
  syntheses: Record<Domain, AppBoardSynthesis | null>;
  deadLetterCount: number;
  lastProbeResults: ProbeResult[] | null;
  isProbing: boolean;
}

export function useOrchestrationHealth() {
  const [state, setState] = useState<OrchestrationHealthState>({
    initialized: false,
    wiringValid: true,
    wiringIssues: [],
    nodeCount: 0,
    edgeCount: 0,
    transmissionLog: [],
    advisorOutputCount: 0,
    syntheses: { business: null, finance: null, concierge: null },
    deadLetterCount: 0,
    lastProbeResults: null,
    isProbing: false,
  });

  const cleanupRef = useRef<(() => void)[]>([]);

  // Initialize pipeline consumers
  useEffect(() => {
    const cleanup1 = initAdvisorConsumer();
    const cleanup2 = initAppBoardSynthesizer();
    cleanupRef.current = [cleanup1, cleanup2];

    // Validate wiring
    const manifest = getWiringManifest();
    const validation = validateWiring();

    setState((prev) => ({
      ...prev,
      initialized: true,
      wiringValid: validation.valid,
      wiringIssues: validation.issues,
      nodeCount: manifest.nodes.length,
      edgeCount: manifest.edges.length,
    }));

    return () => {
      cleanupRef.current.forEach((fn) => fn());
    };
  }, []);

  // Refresh observability data
  const refresh = useCallback(() => {
    const bus = getEventBus();
    setState((prev) => ({
      ...prev,
      transmissionLog: getTransmissionLog(),
      advisorOutputCount: getAdvisorOutputs().length,
      syntheses: {
        business: getSynthesisForDomain("business"),
        finance: getSynthesisForDomain("finance"),
        concierge: getSynthesisForDomain("concierge"),
      },
      deadLetterCount: bus.getDeadLetterQueue().length,
    }));
  }, []);

  // Run probes
  const runProbes = useCallback(async () => {
    setState((prev) => ({ ...prev, isProbing: true }));
    const results = await runAllProbes();
    setState((prev) => ({
      ...prev,
      isProbing: false,
      lastProbeResults: results,
    }));
    refresh();
    return results;
  }, [refresh]);

  return {
    ...state,
    refresh,
    runProbes,
    getManifest: getWiringManifest,
  };
}
