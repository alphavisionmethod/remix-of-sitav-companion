#!/usr/bin/env -S npx tsx
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Runtime Host Boundaries
// Verifies every shared hook in src/hooks/ that touches browser
// globals either:
//   (a) imports useRuntimeHost / getRuntimeHostAdapter, or
//   (b) is explicitly classified in PORTABILITY_CLASSIFICATIONS
//       as leaf-browser-only / shell-specific.
// BLOCK on any unclassified shared hook with browser-global access.
// ═══════════════════════════════════════════════════════════════
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";
import {
  PORTABILITY_CLASSIFICATIONS,
  LEAF_BROWSER_HOOK_ALLOWLIST,
} from "../../src/runtimes/portability-boundary-model";

const HOOKS_DIR = "src/hooks";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

function walk(d: string): string[] {
  const out: string[] = [];
  if (!existsSync(d)) return out;
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const PATTERNS = [
  /\bwindow\.[a-zA-Z]/,
  /\bdocument\.[a-zA-Z]/,
  /\bnavigator\.[a-zA-Z]/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
];

const classified = new Set([
  ...PORTABILITY_CLASSIFICATIONS.map((c) => c.path),
  ...LEAF_BROWSER_HOOK_ALLOWLIST,
]);

const files = walk(HOOKS_DIR);
let portableOk = 0;
let adapterRouted = 0;
let leafClassified = 0;
const violations: string[] = [];

for (const f of files) {
  const src = readFileSync(f, "utf8");
  const stripped = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const touchesGlobals = PATTERNS.some((p) => p.test(stripped));
  if (!touchesGlobals) {
    portableOk++;
    continue;
  }
  if (classified.has(f)) {
    leafClassified++;
    continue;
  }
  const usesAdapter = src.includes("useRuntimeHost") || src.includes("getRuntimeHostAdapter");
  if (usesAdapter) {
    adapterRouted++;
    continue;
  }
  violations.push(f);
  issues.push({
    severity: "error",
    area: f,
    message:
      "Shared hook touches browser globals but is neither classified in portability-boundary-model nor adapter-routed.",
  });
}

const ok = violations.length === 0;
emitGateReport({
  gate: "runtime-host-boundaries",
  ok,
  issues,
  extra: {
    scanned: files.length,
    portableOk,
    adapterRouted,
    leafClassified,
    violations: violations.length,
  },
});
console.log(
  `[runtime-host-boundaries] ${ok ? "PASS" : "FAIL"} (${violations.length} unclassified / ${files.length} hooks)`,
);
process.exit(ok ? 0 : 1);
