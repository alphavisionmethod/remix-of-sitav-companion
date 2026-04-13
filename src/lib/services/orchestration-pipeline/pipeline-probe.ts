// ═══════════════════════════════════════════════════════════════
// SITA OS — Pipeline Probe
// End-to-end verification of the orchestration pipeline
// ═══════════════════════════════════════════════════════════════

import { getEventBus } from "@/lib/core-services/event-bus";
import { createDomainSignal, emitDomainSignal, getTransmissionLog } from "./signal-emitter";
import { getAdvisorOutputs } from "./module-advisor-consumer";
import { getSynthesisForDomain } from "./app-board-synthesizer";
import { validateWiring } from "./wiring-manifest";
import type { Domain, Severity } from "./types";

export interface ProbeTraceEntry {
  layer: string;
  timestamp: number;
  packet_type: string;
  status: "pass" | "fail" | "skip";
  detail: string;
}

export interface ProbeResult {
  scenario: string;
  success: boolean;
  trace: ProbeTraceEntry[];
  duration_ms: number;
  wiring_valid: boolean;
}

export interface ProbeScenario {
  name: string;
  domain: Domain;
  module: string;
  severity: Severity;
  summary: string;
}

// ── Built-in Scenarios ──────────────────────────────────────────

export const BUILT_IN_SCENARIOS: ProbeScenario[] = [
  {
    name: "stalled-lead",
    domain: "business",
    module: "leads",
    severity: "high",
    summary: "High-value lead stalled for 14+ days — follow-up window closing",
  },
  {
    name: "reserve-breach",
    domain: "finance",
    module: "overview",
    severity: "critical",
    summary: "Reserve buffer dropped below 60% of 90-day target",
  },
  {
    name: "travel-prep-incomplete",
    domain: "concierge",
    module: "calendar",
    severity: "medium",
    summary: "Travel prep incomplete 48 hours before departure",
  },
];

/**
 * Run an end-to-end probe that fires a test signal through the full pipeline.
 */
export async function runEndToEndProbe(scenario: ProbeScenario): Promise<ProbeResult> {
  const start = Date.now();
  const trace: ProbeTraceEntry[] = [];

  // Step 1: Validate wiring
  const wiringResult = validateWiring();
  trace.push({
    layer: "wiring-manifest",
    timestamp: Date.now(),
    packet_type: "WiringValidation",
    status: wiringResult.valid ? "pass" : "fail",
    detail: wiringResult.valid ? "All connections valid" : `Issues: ${wiringResult.issues.join("; ")}`,
  });

  // Step 2: Emit test signal
  const signal = createDomainSignal({
    module: scenario.module,
    domain: scenario.domain,
    severity: scenario.severity,
    summary: `[PROBE] ${scenario.summary}`,
    source: "pipeline-probe",
    trigger_type: "immediate",
  });

  emitDomainSignal(signal);
  trace.push({
    layer: "A:signal-emitter",
    timestamp: Date.now(),
    packet_type: "DomainSignal",
    status: "pass",
    detail: `Signal ${signal.signal_id} emitted to domain.signal.${scenario.module}`,
  });

  // Step 3: Check advisor outputs (allow small delay for async dispatch)
  await new Promise((r) => setTimeout(r, 100));
  const outputs = getAdvisorOutputs(scenario.domain);
  const probeOutputs = outputs.filter((o) => o.signal_ref === signal.signal_id);
  trace.push({
    layer: "C:advisor-consumer",
    timestamp: Date.now(),
    packet_type: "AdvisorOutputPacket",
    status: probeOutputs.length > 0 ? "pass" : "fail",
    detail: `${probeOutputs.length} advisor output(s) generated`,
  });

  // Step 4: Check synthesis
  await new Promise((r) => setTimeout(r, 100));
  const synthesis = getSynthesisForDomain(scenario.domain);
  trace.push({
    layer: "D:app-board-synthesizer",
    timestamp: Date.now(),
    packet_type: "AppBoardSynthesis",
    status: synthesis ? "pass" : "fail",
    detail: synthesis
      ? `Synthesis score: ${synthesis.boardroom_worthiness_score.toFixed(2)}`
      : "No synthesis generated",
  });

  // Step 5: Check transmission log
  const txLog = getTransmissionLog();
  const probeTransmissions = txLog.filter((t) => t.packet_id === signal.signal_id);
  trace.push({
    layer: "observability",
    timestamp: Date.now(),
    packet_type: "TransmissionLog",
    status: probeTransmissions.length > 0 ? "pass" : "fail",
    detail: `${probeTransmissions.length} transmission(s) logged`,
  });

  const allPass = trace.every((t) => t.status === "pass");

  return {
    scenario: scenario.name,
    success: allPass,
    trace,
    duration_ms: Date.now() - start,
    wiring_valid: wiringResult.valid,
  };
}

/**
 * Run all built-in probe scenarios.
 */
export async function runAllProbes(): Promise<ProbeResult[]> {
  const results: ProbeResult[] = [];
  for (const scenario of BUILT_IN_SCENARIOS) {
    results.push(await runEndToEndProbe(scenario));
  }
  return results;
}
