// ═══════════════════════════════════════════════════════════════
// Admin Page Sprawl Tracker (Audit v4.0 — PM Corrective Action #13)
// Ratchet: admin page count must not increase above baseline
// without a documented consolidation plan.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const PAGES_DIR = "src/pages";
const ADMIN_DIR = path.join(PAGES_DIR, "admin");
const ADMIN_BASELINE = 580; // Ratchet baseline — must decrease, never increase
const TOTAL_PAGE_TARGET = 200;
const ADMIN_TARGET = 80;

function countFiles(dir: string, ext: string): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(path.join(d, entry.name));
      else if (entry.name.endsWith(ext)) count++;
    }
  };
  walk(dir);
  return count;
}

describe("Admin Page Sprawl Tracker", () => {
  const totalPages = countFiles(PAGES_DIR, ".tsx");
  const adminPages = countFiles(ADMIN_DIR, ".tsx");

  it("reports total page count", () => {
    console.log(`📊 Total pages: ${totalPages} (target: ${TOTAL_PAGE_TARGET})`);
    console.log(`📊 Ratio: ${(totalPages / TOTAL_PAGE_TARGET).toFixed(1)}x over target`);
    expect(totalPages).toBeGreaterThan(0);
  });

  it("reports admin page count", () => {
    console.log(`📊 Admin pages: ${adminPages} (target: ${ADMIN_TARGET})`);
    console.log(`📊 Ratio: ${(adminPages / ADMIN_TARGET).toFixed(1)}x over target`);
    expect(adminPages).toBeGreaterThanOrEqual(0);
  });

  it(`admin pages do not exceed ratchet baseline of ${ADMIN_BASELINE}`, () => {
    expect(
      adminPages,
      `Admin page count (${adminPages}) exceeds ratchet baseline (${ADMIN_BASELINE}). ` +
      `The consolidation target is ${ADMIN_TARGET}. ` +
      `Do NOT add new admin pages — consolidate existing ones via Mission Control. ` +
      `See PM Corrective Action #13 in the audit.`
    ).toBeLessThanOrEqual(ADMIN_BASELINE);
  });

  it("tracks consolidation progress", () => {
    const progress = adminPages <= ADMIN_TARGET
      ? 100
      : Math.max(0, ((ADMIN_BASELINE - adminPages) / (ADMIN_BASELINE - ADMIN_TARGET)) * 100);
    console.log(`📊 Consolidation progress: ${progress.toFixed(1)}% toward target of ${ADMIN_TARGET}`);
  });
});
