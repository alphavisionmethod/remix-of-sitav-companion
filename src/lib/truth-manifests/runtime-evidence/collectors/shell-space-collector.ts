// ═══════════════════════════════════════════════════════════════
// Shell Space Collector
// Captures live shell-space registrations from the compositor.
// ═══════════════════════════════════════════════════════════════

import { makeRecord, safeGet } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";

interface ShellSpaceShape {
  id: string;
  label?: string;
  surface?: string;
}

function readShellSpaces(): ShellSpaceShape[] {
  if (typeof window === "undefined") return [];
  const w = window as unknown as {
    __SITA_SHELL_SPACES__?: ShellSpaceShape[];
    Compositor?: { listShellSpaces?: () => ShellSpaceShape[] };
  };
  const fromCompositor = safeGet(() => w.Compositor?.listShellSpaces?.() ?? [], []);
  if (fromCompositor.length > 0) return fromCompositor;
  return safeGet(() => w.__SITA_SHELL_SPACES__ ?? [], []);
}

export function collectShellSpaceEvidence(): RuntimeEvidenceRecord {
  const spaces = readShellSpaces();
  const warnings: string[] = [];
  if (spaces.length === 0) {
    warnings.push("No shell spaces observed at runtime");
  }
  return makeRecord(
    "collector.shell-space",
    "manifest-shell-space",
    { shellSpaces: spaces },
    { itemCount: spaces.length, warnings },
  );
}
