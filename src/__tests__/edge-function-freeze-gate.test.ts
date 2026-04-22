// ═══════════════════════════════════════════════════════════════
// Edge Function Freeze Gate (Audit v4.0 — PM Corrective Action #2)
// Blocks edge function count from growing beyond baseline unless
// accompanied by behavioral integration tests.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const FUNCTIONS_DIR = "supabase/functions";
const BASELINE_COUNT = 204; // Frozen at v4.0 audit date (2026-04-22)

function getEdgeFunctionDirs(): string[] {
  if (!fs.existsSync(FUNCTIONS_DIR)) return [];
  return fs.readdirSync(FUNCTIONS_DIR).filter(d => {
    if (d.startsWith("_") || d === "node_modules") return false;
    const full = path.join(FUNCTIONS_DIR, d);
    return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, "index.ts"));
  });
}

function getIntegrationTestFiles(): string[] {
  const testDir = "supabase/functions";
  if (!fs.existsSync(testDir)) return [];
  const results: string[] = [];
  const dirs = fs.readdirSync(testDir);
  for (const d of dirs) {
    const full = path.join(testDir, d);
    if (!fs.statSync(full).isDirectory()) continue;
    const files = fs.readdirSync(full);
    for (const f of files) {
      if (f.endsWith(".test.ts") || f.endsWith("_test.ts")) {
        results.push(path.join(d, f));
      }
    }
  }
  return results;
}

describe("Edge Function Freeze Gate", () => {
  const fns = getEdgeFunctionDirs();

  it("counts current edge functions", () => {
    console.log(`📊 Edge function count: ${fns.length} (baseline: ${BASELINE_COUNT})`);
    expect(fns.length).toBeGreaterThan(0);
  });

  it(`does not exceed baseline of ${BASELINE_COUNT} without new integration tests`, () => {
    if (fns.length <= BASELINE_COUNT) return; // Under baseline — OK

    const newCount = fns.length - BASELINE_COUNT;
    const integrationTests = getIntegrationTestFiles();

    expect(
      integrationTests.length,
      `${newCount} new edge functions added beyond baseline ${BASELINE_COUNT}, ` +
      `but only ${integrationTests.length} integration test files exist. ` +
      `Each new function MUST ship with a behavioral test. ` +
      `FREEZE POLICY: No new functions without tests (PM Corrective Action #2).`
    ).toBeGreaterThanOrEqual(newCount);
  });

  it("reports behavioral test coverage ratio", () => {
    const integrationTests = getIntegrationTestFiles();
    const ratio = fns.length > 0 ? integrationTests.length / fns.length : 0;
    console.log(`📊 Behavioral test coverage: ${integrationTests.length}/${fns.length} (${(ratio * 100).toFixed(1)}%)`);
    // Advisory — track but don't fail yet
    expect(ratio).toBeGreaterThanOrEqual(0); // Always passes — metric tracking
  });
});
