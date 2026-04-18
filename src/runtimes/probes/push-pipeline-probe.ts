// Runtime probe — GP-PUSH-TO-APPROVAL
import type { ProbeDescriptor, ProbeResult } from "./index";

async function run(): Promise<ProbeResult> {
  const start = performance.now();
  const checks: Record<string, boolean> = {};
  try {
    checks.serviceWorkerAvailable = typeof navigator !== "undefined" && "serviceWorker" in navigator;
    checks.pushSupported = typeof PushManager !== "undefined";
    const allPass = Object.values(checks).every(Boolean);
    return {
      probeId: "probe.push-pipeline",
      pathId: "GP-PUSH-TO-APPROVAL",
      status: allPass ? "pass" : "skip",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
    };
  } catch (e) {
    return {
      probeId: "probe.push-pipeline",
      pathId: "GP-PUSH-TO-APPROVAL",
      status: "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export const pushPipelineProbe: ProbeDescriptor = {
  probeId: "probe.push-pipeline",
  pathId: "GP-PUSH-TO-APPROVAL",
  title: "Push pipeline: SW + push primitives available",
  run,
};
