/**
 * Coverage Ratchet — prevents coverage regression below last-known actuals.
 * Run after vitest to compare current coverage against the baseline.
 * Updates the baseline when coverage improves. Fails CI when it regresses.
 *
 * Usage: npx tsx scripts/root/coverage-ratchet.ts
 */
import * as fs from "fs";
import * as path from "path";

const BASELINE_PATH = path.resolve("generated/coverage-baseline.json");
const SUMMARY_PATH = path.resolve("coverage/coverage-summary.json");

interface CoverageMetrics {
  lines: number;
  branches: number;
  functions: number;
  statements: number;
}

function loadBaseline(): CoverageMetrics | null {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(BASELINE_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function loadCurrent(): CoverageMetrics | null {
  if (!fs.existsSync(SUMMARY_PATH)) return null;
  try {
    const summary = JSON.parse(fs.readFileSync(SUMMARY_PATH, "utf-8"));
    const total = summary.total;
    if (!total) return null;
    return {
      lines: total.lines?.pct ?? 0,
      branches: total.branches?.pct ?? 0,
      functions: total.functions?.pct ?? 0,
      statements: total.statements?.pct ?? 0,
    };
  } catch {
    return null;
  }
}

function main() {
  const current = loadCurrent();
  if (!current) {
    console.log("⚠️  No coverage summary found — run tests with --coverage first");
    process.exit(0);
  }

  const baseline = loadBaseline();

  if (!baseline) {
    // First run — establish baseline
    fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(current, null, 2));
    console.log("📊 Coverage baseline established:");
    console.log(`   Lines: ${current.lines}% | Branches: ${current.branches}% | Functions: ${current.functions}% | Statements: ${current.statements}%`);
    process.exit(0);
  }

  // Compare
  const regressions: string[] = [];
  const improvements: string[] = [];
  const metrics: (keyof CoverageMetrics)[] = ["lines", "branches", "functions", "statements"];

  for (const m of metrics) {
    const delta = current[m] - baseline[m];
    if (delta < -0.5) {
      regressions.push(`${m}: ${baseline[m]}% → ${current[m]}% (Δ ${delta.toFixed(1)}%)`);
    } else if (delta > 0.5) {
      improvements.push(`${m}: ${baseline[m]}% → ${current[m]}% (Δ +${delta.toFixed(1)}%)`);
    }
  }

  if (improvements.length > 0) {
    console.log("📈 Coverage improvements:");
    for (const i of improvements) console.log(`   ✅ ${i}`);
    // Update baseline to new higher values
    const updated: CoverageMetrics = { ...baseline };
    for (const m of metrics) {
      if (current[m] > baseline[m]) updated[m] = current[m];
    }
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(updated, null, 2));
    console.log("   Baseline updated ↑");
  }

  if (regressions.length > 0) {
    console.error("❌ Coverage regressions detected:");
    for (const r of regressions) console.error(`   ${r}`);
    console.error("\n   Coverage must not decrease. Add tests to restore coverage before merging.");
    process.exit(1);
  }

  console.log("✅ Coverage stable — no regressions detected");
}

main();