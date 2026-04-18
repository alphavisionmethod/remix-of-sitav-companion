// Runtime probe — GP-MOBILE-APPROVAL
import type { ProbeDescriptor, ProbeResult } from "./index";

async function run(): Promise<ProbeResult> {
  const start = performance.now();
  const checks: Record<string, boolean> = {};
  try {
    checks.serviceWorkerAvailable = typeof navigator !== "undefined" && "serviceWorker" in navigator;
    checks.pushSupported = typeof PushManager !== "undefined";
    checks.notificationsSupported = typeof Notification !== "undefined";
    const allPass = Object.values(checks).every(Boolean);
    return {
      probeId: "probe.mobile-approval",
      pathId: "GP-MOBILE-APPROVAL",
      status: allPass ? "pass" : "skip",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
    };
  } catch (e) {
    return {
      probeId: "probe.mobile-approval",
      pathId: "GP-MOBILE-APPROVAL",
      status: "fail",
      latencyMs: Math.round(performance.now() - start),
      checkedAt: new Date().toISOString(),
      details: { checks },
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export const mobileApprovalProbe: ProbeDescriptor = {
  probeId: "probe.mobile-approval",
  pathId: "GP-MOBILE-APPROVAL",
  title: "Mobile approval: PWA push primitives available",
  run,
};
