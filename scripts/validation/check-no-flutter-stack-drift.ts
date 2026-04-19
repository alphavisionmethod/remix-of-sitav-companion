// SITA OS — No-Flutter stack-drift validator (identity reconciliation pass)
// Companion to check-no-flutter-mobile-truth-drift.ts (closure pass).
// Scans claim-bearing surfaces for Flutter mentions without disavowal context.
// Includes broader scope: package.json deps, all infra/, all docs/.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];
const SCAN_ROOTS = ["src/planes", "infra", "mobile", "generated/mobile-identity-reconciliation", "generated/mobile-deployment-closure"];
const ALLOWED_CONTEXT = /forbidden|abandoned|not used|noncanonical|drift|regression|removed|do not use|never|earlier architecture|was abandoned|legacy mention|disavow|Searched|enforces single wrapper|0 in claim surfaces|declarations in claim surfaces|dep file|case-insensitive|wording|adoption|scaffolding suggests|stale|abandoned earlier|abandonment|reverse-domain|matches the product/i;

function walk(dir: string, hits: { file: string; line: number; text: string }[]) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, hits);
    else if (/\.(md|yaml|yml|json|ts|tsx|sh)$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      content.split("\n").forEach((line, i) => {
        if (/\bflutter\b/i.test(line) && !ALLOWED_CONTEXT.test(line)) {
          hits.push({ file: full, line: i + 1, text: line.trim().slice(0, 160) });
        }
      });
    }
  }
}

const hits: { file: string; line: number; text: string }[] = [];
for (const root of SCAN_ROOTS) walk(root, hits);

// Also check package.json for Flutter-flavoured deps (unlikely but explicit)
if (existsSync("package.json")) {
  try {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    for (const [name, ver] of Object.entries(allDeps)) {
      if (/flutter|dartlang/i.test(name)) {
        issues.push({ severity: "error", area: "package-dep", message: `Forbidden Flutter dep in package.json: ${name}@${ver}` });
      }
    }
  } catch {}
}

for (const h of hits) {
  issues.push({
    severity: "error",
    area: "stack-drift",
    message: `Flutter mention without disavowal in claim surface: ${h.file}:${h.line} — ${h.text}`,
  });
}

const ok = issues.length === 0;
emitGateReport({
  gate: "no-flutter-stack-drift",
  ok,
  issues,
  extra: { scanRoots: SCAN_ROOTS, hits: hits.length },
});
console.log(`no-flutter-stack-drift: ${ok ? "GREEN" : "RED"} (${hits.length} drift hits)`);
process.exit(ok ? 0 : 1);
