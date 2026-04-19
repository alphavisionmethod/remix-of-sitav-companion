#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Runtime Host Abstraction
// Asserts:
//   1. The 4 refactored hooks DO import useRuntimeHost
//   2. The canonical adapter file exists (single abstraction)
//   3. No second adapter file has been introduced
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const REFACTORED_HOOKS = [
  "src/hooks/useAppStatePersistence.ts",
  "src/hooks/use-zero-latency.ts",
  "src/hooks/use-session-restore.ts",
  "src/hooks/useSetupOrchestration.ts",
];

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

for (const f of REFACTORED_HOOKS) {
  if (!existsSync(f)) {
    issues.push({ severity: "error", area: f, message: "Refactored hook missing" });
    continue;
  }
  const src = readFileSync(f, "utf8");
  if (!src.includes("useRuntimeHost") && !src.includes("getRuntimeHostAdapter")) {
    issues.push({
      severity: "error",
      area: f,
      message: "Refactored hook does not import the canonical runtime-host adapter",
    });
  }
}

// Canonical adapter must exist
const ADAPTER = "src/runtimes/runtime-host-adapter.ts";
if (!existsSync(ADAPTER)) {
  issues.push({ severity: "error", area: ADAPTER, message: "Canonical runtime-host adapter missing" });
}

// Forbid second abstraction — scan src/ for any *host-adapter* file outside src/runtimes/
function walk(d: string): string[] {
  const out: string[] = [];
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) {
      if (f === "node_modules" || f === ".git") continue;
      out.push(...walk(p));
    } else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const all = walk("src");
const adapterCandidates = all.filter((f) =>
  /host-adapter|runtime-adapter|portability-adapter/i.test(f),
);
for (const f of adapterCandidates) {
  if (!f.startsWith("src/runtimes/")) {
    issues.push({
      severity: "error",
      area: f,
      message: "Second abstraction detected outside src/runtimes/ — use canonical adapter",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: "runtime-host-abstraction",
  ok,
  issues,
  extra: {
    refactoredCount: REFACTORED_HOOKS.length,
    canonicalAdapterPresent: existsSync(ADAPTER),
  },
});
console.log(`[runtime-host-abstraction] ${ok ? "PASS" : "FAIL"} (${issues.length} issues)`);
process.exit(ok ? 0 : 1);
