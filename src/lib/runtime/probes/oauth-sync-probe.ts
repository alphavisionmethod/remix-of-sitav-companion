// Runtime probe — GP-OAUTH-AND-SYNC
import type { ProbeDescriptor, ProbeResult } from "./index";

async function run(): Promise<ProbeResult> {
  const start = performance.now();
  const checks: Record<string, boolean> = {};
  try {
    checks.fetchAvailable = typeof fetch === "function";
    checks.cryptoAvailable = typeof crypto !== "undefined" && !!crypto.subtle;
    const allPass = Object.values(checks).every(Boolean);
    return {
      probeId: "probe.oauth-sync",
      pathId: "GP-OAUTH-AND-SYNC",
      status: allPass ? "pass" : "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
    };
  } catch (e) {
    return {
      probeId: "probe.oauth-sync",
      pathId: "GP-OAUTH-AND-SYNC",
      status: "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export const oauthSyncProbe: ProbeDescriptor = {
  probeId: "probe.oauth-sync",
  pathId: "GP-OAUTH-AND-SYNC",
  title: "OAuth + sync: crypto + fetch primitives available",
  run,
};
