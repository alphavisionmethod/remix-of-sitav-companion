// ═══════════════════════════════════════════════════════════════
// Boot Chain Collector
// Reads the live Nova kernel boot log and emits ordered evidence.
// ═══════════════════════════════════════════════════════════════

import { makeRecord, safeGet } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";

interface BootLogEntryShape {
  subsystem: string;
  status: "ok" | "error";
  timestampMs: number;
  message: string;
}

/** Pull the kernel singleton off `window` if it has been booted. */
function readBootLog(): BootLogEntryShape[] {
  if (typeof window === "undefined") return [];
  const k = (window as unknown as { NovaKernel?: { getBootLog?: () => BootLogEntryShape[] } }).NovaKernel;
  return safeGet(() => k?.getBootLog?.() ?? [], []);
}

export function collectBootChainEvidence(): RuntimeEvidenceRecord {
  const log = readBootLog();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (log.length === 0) {
    warnings.push("No boot log captured — kernel may not have booted in this runtime");
  }

  const failures = log.filter((e) => e.status === "error");
  if (failures.length > 0) {
    errors.push(`${failures.length} subsystem(s) failed to boot: ${failures.map((f) => f.subsystem).join(", ")}`);
  }

  return makeRecord(
    "collector.boot-chain",
    "manifest-boot-chain",
    {
      subsystems: log.map((e) => ({
        subsystem: e.subsystem,
        status: e.status,
        timestampMs: e.timestampMs,
      })),
      successCount: log.filter((e) => e.status === "ok").length,
      failureCount: failures.length,
    },
    { itemCount: log.length, warnings, errors },
  );
}
