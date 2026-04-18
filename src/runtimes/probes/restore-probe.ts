// Runtime probe — GP-RESTORE
import type { ProbeDescriptor, ProbeResult } from "./index";

async function run(): Promise<ProbeResult> {
  const start = performance.now();
  const checks: Record<string, boolean> = {};
  try {
    checks.indexedDbAvailable = typeof indexedDB !== "undefined";
    checks.storageAvailable = typeof window !== "undefined" && !!window.localStorage;
    const allPass = Object.values(checks).every(Boolean);
    return {
      probeId: "probe.restore",
      pathId: "GP-RESTORE",
      status: allPass ? "pass" : "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
    };
  } catch (e) {
    return {
      probeId: "probe.restore",
      pathId: "GP-RESTORE",
      status: "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export const restoreProbe: ProbeDescriptor = {
  probeId: "probe.restore",
  pathId: "GP-RESTORE",
  title: "Restore: persistence primitives available",
  run,
};
