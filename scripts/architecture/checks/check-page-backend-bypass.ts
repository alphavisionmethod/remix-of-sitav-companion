#!/usr/bin/env tsx
/**
 * SITA OS — Page/Domain Backend Bypass Validator
 * Wave B / Constitution §B.2 — BLOCKING
 *
 * Reads generated/manifests/frontend-backend-boundary-map.json and the baseline
 * generated/baselines/page-backend-bypass-baseline.json.
 *
 * Fails (BLOCK) when:
 *   - any new src/pages/** file imports @/integrations/supabase beyond the baseline list
 *   - any new src/components/** file imports @/integrations/supabase (sealed at 0)
 *   - any new src/domains/** file imports @/integrations/supabase beyond baseline (monotone-decreasing)
 *
 * Usage: npx tsx scripts/architecture/checks/check-page-backend-bypass.ts [--warn]
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const WARN = process.argv.includes("--warn");
const MAP = path.join(ROOT, "generated/manifests/frontend-backend-boundary-map.json");
const BASELINE = path.join(ROOT, "generated/baselines/page-backend-bypass-baseline.json");

if (!fs.existsSync(MAP)) {
  console.error(`❌ Missing ${MAP}. Run: npx tsx scripts/architecture/generate/generate-frontend-backend-boundary-map.ts`);
  process.exit(WARN ? 0 : 1);
}
if (!fs.existsSync(BASELINE)) {
  console.error(`❌ Missing baseline ${BASELINE}.`);
  process.exit(WARN ? 0 : 1);
}

interface Surface { count: number; paths: string[] }
interface Map { pages: Surface; components: Surface; domains: Surface }

const m = JSON.parse(fs.readFileSync(MAP, "utf8")) as Map;
const b = JSON.parse(fs.readFileSync(BASELINE, "utf8")) as Map;

function diff(current: Surface, baseline: Surface, surfaceName: string, monotone: "decrease-only" | "zero-tolerance") {
  const baseSet = new Set(baseline.paths);
  const newViolators = current.paths.filter((p) => !baseSet.has(p));
  const removed = baseline.paths.filter((p) => !current.paths.includes(p));
  return { surfaceName, monotone, baselineCount: baseline.count, currentCount: current.count, newViolators, removed };
}

const checks = [
  diff(m.pages, b.pages, "src/pages/**", "decrease-only"),
  diff(m.components, b.components, "src/components/**", "zero-tolerance"),
  diff(m.domains, b.domains, "src/domains/**", "decrease-only"),
];

const errors: string[] = [];
const wins: string[] = [];

for (const c of checks) {
  if (c.newViolators.length > 0) {
    errors.push(`[BLOCK] ${c.surfaceName}: ${c.newViolators.length} NEW violator(s) beyond baseline:\n  ${c.newViolators.slice(0, 10).join("\n  ")}${c.newViolators.length > 10 ? `\n  ... and ${c.newViolators.length - 10} more` : ""}`);
  }
  if (c.removed.length > 0) wins.push(`✅ ${c.surfaceName}: ${c.removed.length} file(s) cleaned (baseline shrunk)`);
  console.log(`  ${c.surfaceName}: current=${c.currentCount} baseline=${c.baselineCount} new=${c.newViolators.length} removed=${c.removed.length}`);
}

const ok = errors.length === 0;
const reportPath = path.join(ROOT, "generated/page-backend-bypass-report.json");
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "page-backend-bypass",
  ok,
  errorCount: errors.length,
  surfaces: checks,
}, null, 2) + "\n", "utf8");

for (const w of wins) console.log(w);
for (const e of errors) console.error(e);

if (!ok && !WARN) {
  console.error("\n❌ Page/Domain backend-bypass check failed. Move logic to a service facade in src/lib/services/** per Constitution §B.2 / FRONTEND_BACKEND_OWNERSHIP_MODEL.md.");
  process.exit(1);
}
console.log(ok ? "\n✅ Page/Domain backend-bypass check passed." : "⚠️  WARN mode — exit 0");