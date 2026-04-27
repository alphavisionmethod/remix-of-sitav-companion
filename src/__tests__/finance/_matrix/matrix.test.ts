import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  ALL_SURFACES,
  PAGE_SURFACES,
  SERVICE_SURFACES,
  ROUTE_SURFACES,
  TRUST_SURFACES,
  INTEGRATION_SURFACES,
  ADAPTIVE_SURFACES,
  E2E_SURFACES,
  PAGE_TEST_EXCLUSIONS,
  SERVICE_TEST_EXCLUSIONS,
} from "./finance-verification-matrix";

const PAGES_ROOT = "src/modules/finance/pages";
const PAGES_SUBDIRS = ["", "money", "investment-office"] as const;
const SERVICES_DIR = "src/lib/services/finance-os";

function listPagesAcrossSubdirs(): string[] {
  const out: string[] = [];
  for (const sub of PAGES_SUBDIRS) {
    const dir = sub ? path.join(PAGES_ROOT, sub) : PAGES_ROOT;
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) continue;
      out.push(f);
    }
  }
  return out;
}

describe("Finance OS Verification Matrix", () => {
  it("matrix is non-empty and unique", () => {
    expect(ALL_SURFACES.length).toBeGreaterThan(40);
    const ids = ALL_SURFACES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every classified service file exists on disk", () => {
    for (const s of SERVICE_SURFACES) {
      expect(fs.existsSync(s.ref), `Missing service file: ${s.ref}`).toBe(true);
    }
  });

  it("every classified page file exists on disk (or is a directory marker)", () => {
    for (const s of PAGE_SURFACES) {
      const exists = fs.existsSync(s.ref);
      expect(exists, `Missing page file: ${s.ref}`).toBe(true);
    }
  });

  it("every finance-os service is either tested or honestly noted", () => {
    const onDisk = fs
      .readdirSync(SERVICES_DIR)
      .filter((f) => f.endsWith(".service.ts") || f === "investment-office-runtime.ts")
      .map((f) => path.join(SERVICES_DIR, f));
    const classified = new Set(SERVICE_SURFACES.map((s) => s.ref));
    const missing = onDisk.filter(
      (p) => !classified.has(p) && !(p in SERVICE_TEST_EXCLUSIONS),
    );
    expect(
      missing,
      `Unclassified finance services in matrix: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("every finance page file is either in matrix or has a stable exclusion reason", () => {
    const onDisk = listPagesAcrossSubdirs();
    const classified = new Set(
      PAGE_SURFACES.map((s) => path.basename(s.ref)).filter((b) =>
        b.endsWith(".tsx"),
      ),
    );
    const missing: string[] = [];
    for (const f of onDisk) {
      if (classified.has(f)) continue;
      if (f in PAGE_TEST_EXCLUSIONS) continue;
      missing.push(f);
    }
    expect(
      missing,
      `Finance pages missing from matrix or exclusion list: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("all sections export at least one P0 surface", () => {
    for (const [label, group] of [
      ["pages", PAGE_SURFACES],
      ["services", SERVICE_SURFACES],
      ["routes", ROUTE_SURFACES],
      ["trust", TRUST_SURFACES],
      ["integration", INTEGRATION_SURFACES],
      ["adaptive", ADAPTIVE_SURFACES],
      ["e2e", E2E_SURFACES],
    ] as const) {
      const hasP0 = group.some((s) => s.priority === "P0");
      expect(hasP0, `No P0 surface in finance group ${label}`).toBe(true);
    }
  });
});