// Validator: no active native-mobile claims outside archive/
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const FORBIDDEN = [
  /\bstore[- ]ready\b/i,
  /\bApp Store submission ready\b/i,
  /\bPlay Store submission ready\b/i,
  /\bTestFlight ready\b/i,
  /\bAAB submission ready\b/i,
  /\bnative mobile app (?:is )?(?:available|live|shipping)\b/i,
  /\bCapacitor app (?:is )?live\b/i,
];

const SCAN_DIRS = ["docs", "src/pages", "src/components"];
const SKIP_DIRS = new Set(["node_modules", ".git", "archive", "dist", "build", "out"]);
const SKIP_FILES = new Set([
  "MOBILE_HONESTY.md",
  "MOBILE_SCOPE_REFERENCE_AUDIT.md",
  "MOBILE_SCOPE_CANONICAL_MODEL.md",
  "MOBILE_REACTIVATION_CONDITIONS.md",
]);

const issues: GateIssue[] = [];

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e)) continue;
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx|tsx?|jsx?)$/.test(e) && !SKIP_FILES.has(e)) out.push(p);
  }
  return out;
}

for (const root of SCAN_DIRS) {
  for (const file of walk(root)) {
    let content = "";
    try { content = readFileSync(file, "utf8"); } catch { continue; }
    for (const pattern of FORBIDDEN) {
      const m = content.match(pattern);
      if (m) {
        issues.push({
          severity: "error",
          area: "language",
          message: `Forbidden native-mobile claim "${m[0]}" in ${file}`,
        });
      }
    }
  }
}

const errors = issues.filter((i) => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "no-active-native-mobile-claims",
  ok,
  issues,
  extra: { scannedDirs: SCAN_DIRS, forbiddenPatterns: FORBIDDEN.length },
});
console.log(`no-active-native-mobile-claims: ${ok ? "GREEN" : "RED"} (${errors} errors)`);
process.exit(ok ? 0 : 1);
