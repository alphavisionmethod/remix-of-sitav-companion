#!/usr/bin/env -S npx tsx
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Shell / Runtime Portability
// Asserts that shell-specific code (Electron preload, native shells)
// does not leak into shared/portable surfaces by reverse-import scanning.
// Shell-only modules (electron/, src/runtimes/desktop/, src/shell/electron/)
// must NOT be imported from src/hooks/ (shared) or src/lib/services/.
// ═══════════════════════════════════════════════════════════════
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const SHARED_ROOTS = ["src/hooks", "src/lib/services"];
const SHELL_PATH_TOKENS = [
  "electron/",
  "src/runtimes/desktop/electron",
  "src/shell/electron",
  "@/shell/electron",
  "@electron/",
];

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

function walk(d: string): string[] {
  const out: string[] = [];
  if (!existsSync(d)) return out;
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    let s;
    try {
      s = statSync(p);
    } catch {
      continue;
    }
    if (s.isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const violations: { file: string; offendingImport: string }[] = [];
let scanned = 0;

for (const root of SHARED_ROOTS) {
  const files = walk(root);
  scanned += files.length;
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const importLines = src.match(/^\s*import[^;]+from\s+["'][^"']+["']/gm) || [];
    for (const line of importLines) {
      const m = line.match(/from\s+["']([^"']+)["']/);
      if (!m) continue;
      const spec = m[1];
      if (SHELL_PATH_TOKENS.some((tok) => spec.includes(tok))) {
        violations.push({ file: f, offendingImport: spec });
        issues.push({
          severity: "error",
          area: f,
          message: `Shared module imports shell-specific path: ${spec}`,
        });
      }
    }
  }
}

const ok = violations.length === 0;
emitGateReport({
  gate: "shell-runtime-portability",
  ok,
  issues,
  extra: { scanned, sharedRoots: SHARED_ROOTS, violations: violations.length },
});
console.log(
  `[shell-runtime-portability] ${ok ? "PASS" : "FAIL"} (${violations.length} cross-import violations / ${scanned} files)`,
);
process.exit(ok ? 0 : 1);
