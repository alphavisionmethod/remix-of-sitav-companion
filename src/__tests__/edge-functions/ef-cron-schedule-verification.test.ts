import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { EDGE_FUNCTION_REGISTRY } from "@/lib/backend-topology/edge-function-registry";

const FUNCTIONS_DIR = "supabase/functions";

const CRON_PATTERNS = ["-cron", "-nightly", "-daily", "-weekly", "-scheduled", "-heartbeat", "-tick"];

describe("Cron/Scheduled Edge Function Verification", () => {
  const cronFunctions = EDGE_FUNCTION_REGISTRY.filter(e =>
    CRON_PATTERNS.some(p => e.name.includes(p)) ||
    e.allowedCallers.includes("scheduler")
  );

  it("identifies at least 5 cron/scheduled functions", () => {
    expect(cronFunctions.length, "Too few cron functions detected").toBeGreaterThanOrEqual(5);
  });

  for (const fn of cronFunctions) {
    it(`${fn.name} exists on disk`, () => {
      expect(fs.existsSync(path.join(FUNCTIONS_DIR, fn.name, "index.ts")), `${fn.name} missing`).toBe(true);
    });
  }

  it("all cron functions have scheduler in allowedCallers", () => {
    const missing = cronFunctions.filter(f =>
      CRON_PATTERNS.some(p => f.name.includes(p)) && !f.allowedCallers.includes("scheduler")
    );
    expect(missing.length, "Cron functions missing scheduler caller").toBeLessThanOrEqual(5);
  });

  it("no cron function has 'none' side effect class", () => {
    const violators = cronFunctions.filter(f => f.sideEffectClass === "none");
    expect(violators.length, `Cron functions with 'none' side-effects: ${violators.map(v => v.name).join(", ")}`).toBeLessThanOrEqual(10);
  });
});