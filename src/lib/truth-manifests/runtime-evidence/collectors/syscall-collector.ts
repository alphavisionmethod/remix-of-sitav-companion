// ═══════════════════════════════════════════════════════════════
// Syscall Collector
// Snapshots syscall surface area available at runtime.
// ═══════════════════════════════════════════════════════════════

import { makeRecord, safeGet } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";

interface SyscallShape {
  name: string;
  category?: string;
}

function readSyscalls(): SyscallShape[] {
  if (typeof window === "undefined") return [];
  const w = window as unknown as { Syscall?: { listSyscalls?: () => SyscallShape[] } };
  return safeGet(() => w.Syscall?.listSyscalls?.() ?? [], []);
}

export function collectSyscallEvidence(): RuntimeEvidenceRecord {
  const syscalls = readSyscalls();
  const warnings: string[] = [];
  if (syscalls.length === 0) {
    warnings.push("No syscall surface exposed at runtime");
  }
  return makeRecord(
    "collector.syscall",
    "manifest-syscall",
    { syscalls, count: syscalls.length },
    { itemCount: syscalls.length, warnings },
  );
}
