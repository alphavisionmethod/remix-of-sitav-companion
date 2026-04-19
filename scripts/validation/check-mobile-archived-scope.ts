#!/usr/bin/env -S npx tsx
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Mobile Archived Scope
// Asserts native iOS/Android remain ARCHIVED:
//   • capacitor.config.ts must NOT exist at repo root
//   • @capacitor/* must NOT appear in package.json dependencies
//   • Active "ship to iOS / ship to Android" claims must not appear
//     in src/pages/ outside docs/links to MOBILE_HONESTY.md
// ═══════════════════════════════════════════════════════════════
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

// 1. capacitor config
if (existsSync("capacitor.config.ts") || existsSync("capacitor.config.js")) {
  issues.push({
    severity: "error",
    area: "capacitor.config.*",
    message: "Capacitor config reappeared at repo root — native mobile is ARCHIVED.",
  });
}

// 2. package.json deps
try {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const capacitorDeps = Object.keys(deps).filter((d) => d.startsWith("@capacitor/"));
  if (capacitorDeps.length > 0) {
    issues.push({
      severity: "error",
      area: "package.json",
      message: `Capacitor dependencies reappeared: ${capacitorDeps.join(", ")}`,
    });
  }
} catch {}

// 3. forbidden phrases in src/pages/ (outside files that link to MOBILE_HONESTY.md)
const FORBIDDEN = [
  /\bship(?:ping)?\s+(?:to\s+)?(?:iOS|Android|App\s+Store|Play\s+Store)\b/i,
  /\binstall(?:ed)?\s+from\s+(?:the\s+)?(?:App\s+Store|Play\s+Store)\b/i,
  /\bnative\s+iOS\s+app\s+available\b/i,
  /\bnative\s+Android\s+app\s+available\b/i,
];

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
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) out.push(p);
  }
  return out;
}

let scannedPages = 0;
let claimViolations = 0;
for (const f of walk("src/pages")) {
  scannedPages++;
  const src = readFileSync(f, "utf8");
  // honest exemption: if file already explicitly links to MOBILE_HONESTY truth, allow it.
  if (src.includes("MOBILE_HONESTY") || src.includes("mobile-scope-truth")) continue;
  for (const rx of FORBIDDEN) {
    if (rx.test(src)) {
      claimViolations++;
      issues.push({
        severity: "error",
        area: f,
        message: `Active native-mobile claim found: matches ${rx.source}`,
      });
      break;
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: "mobile-archived-scope",
  ok,
  issues,
  extra: {
    capacitorConfigPresent: existsSync("capacitor.config.ts") || existsSync("capacitor.config.js"),
    scannedPages,
    claimViolations,
  },
});
console.log(`[mobile-archived-scope] ${ok ? "PASS" : "FAIL"} (${issues.length} issues)`);
process.exit(ok ? 0 : 1);
