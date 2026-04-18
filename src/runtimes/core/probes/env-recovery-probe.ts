// Runtime probe — GP-ENV-RECOVERY
import type { ProbeDescriptor, ProbeResult } from "./index";

async function run(): Promise<ProbeResult> {
  const start = performance.now();
  const checks: Record<string, boolean> = {};
  try {
    checks.fetchAvailable = typeof fetch === "function";
    checks.navigatorOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const allPass = Object.values(checks).every(Boolean);
    return {
      probeId: "probe.env-recovery",
      pathId: "GP-ENV-RECOVERY",
      status: allPass ? "pass" : "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
    };
  } catch (e) {
    return {
      probeId: "probe.env-recovery",
      pathId: "GP-ENV-RECOVERY",
      status: "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export const envRecoveryProbe: ProbeDescriptor = {
  probeId: "probe.env-recovery",
  pathId: "GP-ENV-RECOVERY",
  title: "Env recovery: network reachable for rollback ops",
  run,
};
