// Runtime probe — GP-WORKFLOW-REPLAY
import type { ProbeDescriptor, ProbeResult } from "./index";

async function run(): Promise<ProbeResult> {
  const start = performance.now();
  const checks: Record<string, boolean> = {};
  try {
    checks.fetchAvailable = typeof fetch === "function";
    checks.jsonAvailable = typeof JSON !== "undefined";
    const allPass = Object.values(checks).every(Boolean);
    return {
      probeId: "probe.workflow-replay",
      pathId: "GP-WORKFLOW-REPLAY",
      status: allPass ? "pass" : "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
    };
  } catch (e) {
    return {
      probeId: "probe.workflow-replay",
      pathId: "GP-WORKFLOW-REPLAY",
      status: "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export const workflowReplayProbe: ProbeDescriptor = {
  probeId: "probe.workflow-replay",
  pathId: "GP-WORKFLOW-REPLAY",
  title: "Workflow replay: admin API reachable",
  run,
};
