#!/usr/bin/env -S npx tsx
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Shell / Runtime Portability
// PASS 1: Shell-only modules (electron/, src/runtimes/desktop/,
//         src/shell/electron/) must NOT be imported from
//         src/hooks/ (shared) or src/lib/services/.
// PASS 2: Inline runtime probes (window.electron, navigator.userAgent,
//         import.meta.env.VITE_APPLIANCE_RUNTIME) must NOT appear
//         outside the canonical registry (src/runtimes/), the
//         observability sinks, the documented contract files, or
//         the canonical Electron bridge hook.
// ═══════════════════════════════════════════════════════════════
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

// ── Pass 1 config ───────────────────────────────────────────────
const SHARED_ROOTS = ["src/hooks", "src/lib/services"];
const SHELL_PATH_TOKENS = [
  "electron/",
  "src/runtimes/desktop/electron",
  "src/shell/electron",
  "@/shell/electron",
  "@electron/",
];

// ── Pass 2 config ───────────────────────────────────────────────
const PROBE_SCAN_ROOTS = ["src"];
const PROBE_PATTERNS: { token: RegExp; label: string }[] = [
  { token: /\bwindow\.electron\b/, label: "window.electron" },
  { token: /\bnavigator\.userAgent\b/, label: "navigator.userAgent" },
  { token: /import\.meta\.env\.VITE_APPLIANCE_RUNTIME/, label: "VITE_APPLIANCE_RUNTIME" },
];

/**
 * Files allowed to reference raw runtime probes. Every entry is
 * intentional and reviewed:
 *   - `src/runtimes/**` is the canonical registry
 *   - observability sinks attach raw UA as opaque telemetry
 *   - documentation/contract files describe the fallback surface
 *   - the canonical Electron bridge hook IS the consumer
 */
const RUNTIME_PROBE_ALLOWLIST = new Set<string>([
  // Canonical bridge consumer
  "src/hooks/useElectronBridge.ts",
  // Observability sinks (UA = opaque crash/heartbeat metadata)
  "src/lib/observability/runtime-error-context.ts",
  "src/lib/observability/uptime.ts",
  // Doc/contract surfaces describing fallbacks
  "src/runtimes/desktop/desktop-host-capabilities.ts",
  "src/runtimes/desktop/desktop-fallbacks.ts",
  "src/lib/surfaces/host-window-vs-simulated-map.ts",
  "src/lib/web-platform/release/web-runtime-min-contract.ts",
]);

const PROBE_ALLOWED_PREFIXES = ["src/runtimes/"];

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

function normalize(p: string): string {
  return p.split("\\").join("/");
}

// ─── PASS 1: shell imports from shared roots ────────────────────
const importViolations: { file: string; offendingImport: string }[] = [];
let pass1Scanned = 0;

for (const root of SHARED_ROOTS) {
  const files = walk(root);
  pass1Scanned += files.length;
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const importLines = src.match(/^\s*import[^;]+from\s+["'][^"']+["']/gm) || [];
    for (const line of importLines) {
      const m = line.match(/from\s+["']([^"']+)["']/);
      if (!m) continue;
      const spec = m[1];
      if (SHELL_PATH_TOKENS.some((tok) => spec.includes(tok))) {
        importViolations.push({ file: f, offendingImport: spec });
        issues.push({
          severity: "error",
          area: f,
          message: `Shared module imports shell-specific path: ${spec}`,
        });
      }
    }
  }
}

// ─── PASS 2: inline runtime probes outside the registry ─────────
const probeViolations: { file: string; tokens: string[] }[] = [];
let pass2Scanned = 0;

for (const root of PROBE_SCAN_ROOTS) {
  const files = walk(root);
  for (const f of files) {
    const norm = normalize(f);
    pass2Scanned++;

    // Allow the canonical registry and the curated allowlist.
    if (PROBE_ALLOWED_PREFIXES.some((pref) => norm.startsWith(pref))) continue;
    if (RUNTIME_PROBE_ALLOWLIST.has(norm)) continue;

    const src = readFileSync(f, "utf8");
    // Strip comments so doc-only mentions don't trigger
    const stripped = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

    const hits: string[] = [];
    for (const pat of PROBE_PATTERNS) {
      if (pat.token.test(stripped)) hits.push(pat.label);
    }
    if (hits.length > 0) {
      probeViolations.push({ file: norm, tokens: hits });
      issues.push({
        severity: "error",
        area: norm,
        message: `Inline runtime probe(s) [${hits.join(", ")}] outside src/runtimes/. Route through src/runtimes/runtime-platform.ts or useElectronBridge.`,
      });
    }
  }
}

const ok = importViolations.length === 0 && probeViolations.length === 0;
emitGateReport({
  gate: "shell-runtime-portability",
  ok,
  issues,
  extra: {
    pass1: {
      scanned: pass1Scanned,
      sharedRoots: SHARED_ROOTS,
      violations: importViolations.length,
    },
    pass2: {
      scanned: pass2Scanned,
      scanRoots: PROBE_SCAN_ROOTS,
      allowlistSize: RUNTIME_PROBE_ALLOWLIST.size,
      violations: probeViolations.length,
      offendingFiles: probeViolations.map((v) => v.file),
    },
  },
});

console.log(
  `[shell-runtime-portability] ${ok ? "PASS" : "FAIL"} ` +
    `(pass1: ${importViolations.length} cross-imports / ${pass1Scanned} files; ` +
    `pass2: ${probeViolations.length} inline probes / ${pass2Scanned} files)`,
);

if (!ok) {
  for (const v of probeViolations) {
    console.log(`  • ${v.file}  →  [${v.tokens.join(", ")}]`);
  }
}

process.exit(ok ? 0 : 1);
