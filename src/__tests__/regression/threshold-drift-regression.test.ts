// ═══════════════════════════════════════════════════════════════
// SITA OS — Threshold-Sensitive Regression Suite
// ───────────────────────────────────────────────────────────────
// Re-runs the three numeric assertions that gate deployment with
// REPEAT_COUNT iterations and fails if any iteration drifts beyond
// the allowed epsilon from the established baseline.
//
// The gated thresholds:
//   1. Generated artifact freshness ratio (>= 0.20)
//   2. Failing artifact count (ok:false) (<= 100)
//   3. Test file count baseline (>= 280)
//
// Drift is detected when any iteration's measured value differs
// from the iteration-0 baseline by more than EPSILON (relative).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const REPEAT_COUNT = 5;
const EPSILON_RATIO = 0.02;     // 2% drift tolerance for ratios
const EPSILON_COUNT_PCT = 0.05; // 5% drift tolerance for counts

// ── Baselines (locked thresholds) ────────────────────────────
const BASELINE = {
  freshRatioMin: 0.20,
  failingArtifactsMax: 100,
  testFileCountMin: 280,
};

// ── Measurement helpers (pure, deterministic per run) ────────

function measureFreshRatio(): { freshRatio: number; total: number; stale: number } {
  const dir = "generated";
  if (!fs.existsSync(dir)) return { freshRatio: 1, total: 0, stale: 0 };
  const files: string[] = [];
  const collect = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) collect(p);
      else if (e.name.endsWith(".json")) files.push(p);
    }
  };
  collect(dir);
  const cutoffMs = 168 * 3_600_000;
  const now = Date.now();
  let stale = 0;
  for (const f of files) {
    if (now - fs.statSync(f).mtimeMs > cutoffMs) stale++;
  }
  return {
    freshRatio: files.length > 0 ? (files.length - stale) / files.length : 1,
    total: files.length,
    stale,
  };
}

function measureFailingArtifacts(): number {
  const dir = "generated";
  if (!fs.existsSync(dir)) return 0;
  const files: string[] = [];
  const collect = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) collect(p);
      else if (e.name.endsWith(".json")) files.push(p);
    }
  };
  collect(dir);
  let failures = 0;
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(f, "utf8"));
      if (data && typeof data === "object" && data.ok === false) failures++;
    } catch {
      // unparseable — counted by separate gate
    }
  }
  return failures;
}

function measureTestFileCount(): number {
  let count = 0;
  const walk = (d: string) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".test.ts") || e.name.endsWith(".test.tsx")) count++;
    }
  };
  walk("src");
  return count;
}

// ── Drift checker ────────────────────────────────────────────

interface DriftRun<T extends number> {
  iteration: number;
  value: T;
  driftFromBaseline: number;
}

function repeatMeasure<T extends number>(
  measure: () => T,
  count: number,
): DriftRun<T>[] {
  const baseline = measure();
  const runs: DriftRun<T>[] = [{ iteration: 0, value: baseline, driftFromBaseline: 0 }];
  for (let i = 1; i < count; i++) {
    const value = measure();
    runs.push({
      iteration: i,
      value,
      driftFromBaseline: baseline === 0 ? 0 : Math.abs(value - baseline) / Math.abs(baseline),
    });
  }
  return runs;
}

// ── Tests ────────────────────────────────────────────────────

describe("Threshold-Drift Regression Suite", () => {
  describe(`Repeat measurement (${REPEAT_COUNT}× iterations)`, () => {
    it(`fresh-artifact ratio is stable within ε=${EPSILON_RATIO * 100}% and ≥ baseline ${BASELINE.freshRatioMin}`, () => {
      const runs = repeatMeasure(() => measureFreshRatio().freshRatio, REPEAT_COUNT);
      const baseline = runs[0].value;
      const drifted = runs.filter((r) => r.driftFromBaseline > EPSILON_RATIO);
      const log = runs.map((r) => `  iter${r.iteration}=${r.value.toFixed(4)} drift=${(r.driftFromBaseline * 100).toFixed(2)}%`).join("\n");

      expect(
        baseline,
        `freshRatio baseline ${baseline.toFixed(4)} below threshold ${BASELINE.freshRatioMin}\n${log}`,
      ).toBeGreaterThanOrEqual(BASELINE.freshRatioMin);

      expect(
        drifted.length,
        `Drift detected in ${drifted.length}/${REPEAT_COUNT} runs (ε=${EPSILON_RATIO}):\n${log}`,
      ).toBe(0);
    });

    it(`failing-artifact count is stable within ε=${EPSILON_COUNT_PCT * 100}% and ≤ baseline ${BASELINE.failingArtifactsMax}`, () => {
      const runs = repeatMeasure(() => measureFailingArtifacts(), REPEAT_COUNT);
      const baseline = runs[0].value;
      const drifted = runs.filter((r) => r.driftFromBaseline > EPSILON_COUNT_PCT);
      const log = runs.map((r) => `  iter${r.iteration}=${r.value} drift=${(r.driftFromBaseline * 100).toFixed(2)}%`).join("\n");

      expect(
        baseline,
        `failingArtifacts baseline ${baseline} exceeds ceiling ${BASELINE.failingArtifactsMax}\n${log}`,
      ).toBeLessThanOrEqual(BASELINE.failingArtifactsMax);

      expect(
        drifted.length,
        `Drift detected in ${drifted.length}/${REPEAT_COUNT} runs (ε=${EPSILON_COUNT_PCT}):\n${log}`,
      ).toBe(0);
    });

    it(`test-file count is stable within ε=${EPSILON_COUNT_PCT * 100}% and ≥ baseline ${BASELINE.testFileCountMin}`, () => {
      const runs = repeatMeasure(() => measureTestFileCount(), REPEAT_COUNT);
      const baseline = runs[0].value;
      const drifted = runs.filter((r) => r.driftFromBaseline > EPSILON_COUNT_PCT);
      const log = runs.map((r) => `  iter${r.iteration}=${r.value} drift=${(r.driftFromBaseline * 100).toFixed(2)}%`).join("\n");

      expect(
        baseline,
        `testFileCount baseline ${baseline} below threshold ${BASELINE.testFileCountMin}\n${log}`,
      ).toBeGreaterThanOrEqual(BASELINE.testFileCountMin);

      expect(
        drifted.length,
        `Drift detected in ${drifted.length}/${REPEAT_COUNT} runs (ε=${EPSILON_COUNT_PCT}):\n${log}`,
      ).toBe(0);
    });
  });

  describe("Cross-threshold consistency", () => {
    it("all three metrics measurable within deterministic bounds", () => {
      const f = measureFreshRatio();
      const fail = measureFailingArtifacts();
      const tests = measureTestFileCount();
      expect(f.freshRatio).toBeGreaterThanOrEqual(0);
      expect(f.freshRatio).toBeLessThanOrEqual(1);
      expect(fail).toBeGreaterThanOrEqual(0);
      expect(tests).toBeGreaterThan(0);
    });

    it("emits drift report for CI artifact upload", () => {
      const report = {
        generatedAt: new Date().toISOString(),
        gate: "threshold-drift-regression",
        repeatCount: REPEAT_COUNT,
        epsilonRatio: EPSILON_RATIO,
        epsilonCount: EPSILON_COUNT_PCT,
        thresholds: {
          freshRatio: {
            baseline: BASELINE.freshRatioMin,
            runs: repeatMeasure(() => measureFreshRatio().freshRatio, REPEAT_COUNT),
          },
          failingArtifacts: {
            baseline: BASELINE.failingArtifactsMax,
            runs: repeatMeasure(() => measureFailingArtifacts(), REPEAT_COUNT),
          },
          testFileCount: {
            baseline: BASELINE.testFileCountMin,
            runs: repeatMeasure(() => measureTestFileCount(), REPEAT_COUNT),
          },
        },
      };
      fs.mkdirSync("generated", { recursive: true });
      fs.writeFileSync(
        "generated/threshold-drift-regression-report.json",
        JSON.stringify(report, null, 2),
      );
      expect(true).toBe(true);
    });
  });
});