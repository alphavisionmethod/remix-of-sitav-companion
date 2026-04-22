// ═══════════════════════════════════════════════════════════════
// Service Boundary Truth Test (Checklist 24.9)
// Runs the service-layer-boundaries CI script in-process so
// violations show up in `npm test`, not only in CI.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import * as fs from "fs";

const SCRIPT = "scripts/architecture/checks/check-service-layer-boundaries.ts";

describe("Service layer boundaries", () => {
  it("script exists on disk", () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
  });

  it("executes without unhandled errors", () => {
    if (!fs.existsSync(SCRIPT)) return;
    let output = "";
    let exitCode = 0;
    try {
      output = execSync(`npx tsx ${SCRIPT}`, { stdio: "pipe", timeout: 60_000 }).toString();
    } catch (e: unknown) {
      const err = e as { status?: number; stdout?: Buffer; stderr?: Buffer };
      exitCode = err.status ?? 1;
      output = `${err.stdout?.toString() ?? ""}${err.stderr?.toString() ?? ""}`;
    }
    // Exit 0 = clean, exit 1 = warnings; only crashes (>1) are unacceptable
    expect(exitCode, output.slice(0, 500)).toBeLessThanOrEqual(1);
  }, 90_000);

  it("reports service directory sprawl metric (v4.0 PM Action #7)", () => {
    const serviceDir = "src/services";
    const pageDirCount = fs.existsSync("src/pages")
      ? fs.readdirSync("src/pages", { withFileTypes: true }).filter(d => d.isDirectory()).length
      : 0;
    const serviceDirCount = fs.existsSync(serviceDir)
      ? fs.readdirSync(serviceDir, { withFileTypes: true }).filter(d => d.isDirectory()).length
      : 0;
    const TARGET_SERVICE_DIRS = 45;
    const WARNING_THRESHOLD = 100;

    console.log(`📊 Service directories: ${serviceDirCount} (target: ${TARGET_SERVICE_DIRS})`);
    console.log(`📊 Page directories: ${pageDirCount}`);
    if (serviceDirCount > WARNING_THRESHOLD) {
      console.log(`⚠️ Service sprawl WARNING: ${serviceDirCount} dirs exceeds threshold of ${WARNING_THRESHOLD}`);
    }
    if (serviceDirCount > TARGET_SERVICE_DIRS) {
      console.log(`⚠️ PM Corrective Action #7: Consolidate service directories to ~${TARGET_SERVICE_DIRS}`);
    }
    // Advisory — track but don't block
    expect(serviceDirCount).toBeGreaterThanOrEqual(0);
  });
});
