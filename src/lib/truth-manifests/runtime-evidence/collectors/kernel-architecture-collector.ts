// ═══════════════════════════════════════════════════════════════
// Kernel Architecture Collector
// Snapshots kernel subsystem availability at runtime.
// ═══════════════════════════════════════════════════════════════

import { makeRecord, safeGet } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";

const KERNEL_SUBSYSTEMS = [
  "MemoryManager",
  "ProcessTable",
  "Scheduler",
  "Compositor",
  "PowerManager",
  "PrivilegeEnforcement",
  "IPCManager",
  "CrashResilience",
  "WaylandServer",
  "DriverManager",
] as const;

export function collectKernelArchitectureEvidence(): RuntimeEvidenceRecord {
  const w = (typeof window !== "undefined" ? window : {}) as Record<string, unknown>;
  const subsystems = KERNEL_SUBSYSTEMS.map((name) => ({
    name,
    available: safeGet(() => w[name] != null, false),
  }));
  const present = subsystems.filter((s) => s.available);
  const warnings: string[] = [];
  if (present.length === 0) {
    warnings.push("No kernel subsystems exposed on window — runtime may not have kernel layer");
  }
  return makeRecord(
    "collector.kernel-architecture",
    "manifest-kernel",
    { subsystems, presentCount: present.length, totalChecked: subsystems.length },
    { itemCount: present.length, warnings },
  );
}
