#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 0 — Canonical Paths Validator (BLOCK).
// Asserts that the foundational on-disk paths declared in the v3 audit exist.
import { existsSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Sentinel {
  path: string;
  kind: "dir" | "file";
  required: boolean;
  note?: string;
}

// Required sentinels are the load-bearing paths. Non-required sentinels are
// declared in the v3 audit but tolerated as warnings if missing/relocated —
// surfacing drift honestly without false-failing the gate.
const SENTINELS: Sentinel[] = [
  { path: "supabase/functions", kind: "dir", required: true },
  { path: "supabase/migrations", kind: "dir", required: true },
  { path: "scripts/architecture/checks", kind: "dir", required: true },
  { path: "generated", kind: "dir", required: true },
  { path: "public/generated", kind: "dir", required: true },
  { path: "src/lib/architecture", kind: "dir", required: false, note: "claimed in v3 audit — track drift" },
  { path: "src/lib/architecture/route-plane-map.ts", kind: "file", required: false, note: "claimed in v3 audit — track drift" },
  { path: "src/lib/architecture/plane-registry.ts", kind: "file", required: false, note: "claimed in v3 audit — track drift" },
  { path: "src/lib/runtime/desktop", kind: "dir", required: false, note: "claimed in v3 audit — track drift" },
  { path: "src/lib/nova-sdk", kind: "dir", required: false, note: "claimed in v3 audit — track drift" },
  { path: "electron/security", kind: "dir", required: false, note: "may be at electron/main/security" },
  { path: "os/runtime", kind: "dir", required: false, note: "claimed in v3 audit — track drift" },
  { path: "os/runtime/shell-watchdog.sh", kind: "file", required: false, note: "claimed in v3 audit — track drift" },
];

interface Issue {
  severity: "error" | "warning";
  area: string;
  message: string;
}

const issues: Issue[] = [];

for (const s of SENTINELS) {
  if (!existsSync(s.path)) {
    issues.push({
      severity: s.required ? "error" : "warning",
      area: "canonical-paths",
      message: `${s.kind} missing: ${s.path}${s.note ? ` (${s.note})` : ""}`,
    });
    continue;
  }
  try {
    const st = statSync(s.path);
    if (s.kind === "dir" && !st.isDirectory()) {
      issues.push({ severity: "error", area: "canonical-paths", message: `Expected directory, found file: ${s.path}` });
    } else if (s.kind === "file" && !st.isFile()) {
      issues.push({ severity: "error", area: "canonical-paths", message: `Expected file, found other: ${s.path}` });
    }
  } catch (e) {
    issues.push({ severity: "warning", area: "canonical-paths", message: `Cannot stat ${s.path}: ${(e as Error).message}` });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync(
  join("generated", "canonical-paths-report.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      gate: "canonical-paths",
      ok,
      errorCount,
      warningCount,
      sentinelsScanned: SENTINELS.length,
      issues,
    },
    null,
    2,
  ),
);

console.log(`canonical-paths: scanned ${SENTINELS.length} sentinels, ${errorCount} errors, ${warningCount} warnings`);
for (const i of issues.slice(0, 20)) console.log(`  [${i.severity}] ${i.message}`);

process.exit(errorCount === 0 ? 0 : 1);
