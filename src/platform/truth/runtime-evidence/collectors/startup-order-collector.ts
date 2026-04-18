// ═══════════════════════════════════════════════════════════════
// Startup Order Collector
// Records observed startup ordering from boot log timestamps.
// ═══════════════════════════════════════════════════════════════

import { makeRecord, safeGet } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";

interface BootLogEntryShape {
  subsystem: string;
  status: string;
  timestampMs: number;
}

function readBootLog(): BootLogEntryShape[] {
  if (typeof window === "undefined") return [];
  const k = (window as unknown as { NovaKernel?: { getBootLog?: () => BootLogEntryShape[] } }).NovaKernel;
  return safeGet(() => k?.getBootLog?.() ?? [], []);
}

export function collectStartupOrderEvidence(): RuntimeEvidenceRecord {
  const log = readBootLog();
  const ordered = [...log].sort((a, b) => a.timestampMs - b.timestampMs);
  const warnings: string[] = [];
  if (ordered.length === 0) {
    warnings.push("No startup ordering observed — boot log empty");
  }
  return makeRecord(
    "collector.startup-order",
    "manifest-startup-order",
    {
      order: ordered.map((e, i) => ({
        index: i,
        subsystem: e.subsystem,
        timestampMs: e.timestampMs,
      })),
      durationMs: ordered.length > 0 ? ordered[ordered.length - 1].timestampMs - ordered[0].timestampMs : 0,
    },
    { itemCount: ordered.length, warnings },
  );
}
