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
} from "./business-os-verification-matrix";

const PAGES_DIR = "src/modules/business/pages";
const SERVICES_DIR = "src/lib/services/business-os";

describe("Business OS Verification Matrix", () => {
  it("matrix is non-empty and unique", () => {
    expect(ALL_SURFACES.length).toBeGreaterThan(20);
    const ids = ALL_SURFACES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every classified service file exists on disk", () => {
    for (const s of SERVICE_SURFACES) {
      expect(fs.existsSync(s.ref), `Missing service file: ${s.ref}`).toBe(true);
    }
  });

  it("every classified page file exists on disk", () => {
    for (const s of PAGE_SURFACES) {
      expect(fs.existsSync(s.ref), `Missing page file: ${s.ref}`).toBe(true);
    }
  });

  it("every Business OS service is either tested or honestly noted", () => {
    const onDisk = fs.readdirSync(SERVICES_DIR)
      .filter((f) => f.endsWith(".service.ts"))
      .map((f) => path.join(SERVICES_DIR, f));
    const classified = new Set(SERVICE_SURFACES.map((s) => s.ref));
    const missing = onDisk.filter((p) => !classified.has(p) && !(p in SERVICE_TEST_EXCLUSIONS));
    expect(missing, `Unclassified services in matrix: ${missing.join(", ")}`).toEqual([]);
  });

  it("every Business OS page file is either in matrix or has a stable exclusion reason", () => {
    const onDisk = fs.readdirSync(PAGES_DIR);
    const classified = new Set(PAGE_SURFACES.map((s) => path.basename(s.ref)));
    const missing: string[] = [];
    for (const f of onDisk) {
      if (classified.has(f)) continue;
      if (f in PAGE_TEST_EXCLUSIONS) continue;
      missing.push(f);
    }
    expect(missing, `Pages missing from matrix or exclusion list: ${missing.join(", ")}`).toEqual([]);
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
      expect(hasP0, `No P0 surface in group ${label}`).toBe(true);
    }
  });
});