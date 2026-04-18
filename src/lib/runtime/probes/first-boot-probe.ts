// Runtime probe — GP-FIRST-BOOT
import type { ProbeDescriptor, ProbeResult } from "./index";

async function run(): Promise<ProbeResult> {
  const start = performance.now();
  const checks: Record<string, boolean> = {};
  try {
    checks.documentReady = typeof document !== "undefined" && document.readyState !== "loading";
    checks.localStorageAvailable = typeof window !== "undefined" && !!window.localStorage;
    checks.bootShellMounted = typeof document !== "undefined" && !!document.getElementById("root");
    const allPass = Object.values(checks).every(Boolean);
    return {
      probeId: "probe.first-boot",
      pathId: "GP-FIRST-BOOT",
      status: allPass ? "pass" : "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
    };
  } catch (e) {
    return {
      probeId: "probe.first-boot",
      pathId: "GP-FIRST-BOOT",
      status: "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export const firstBootProbe: ProbeDescriptor = {
  probeId: "probe.first-boot",
  pathId: "GP-FIRST-BOOT",
  title: "First boot: shell mounts and storage available",
  run,
};
