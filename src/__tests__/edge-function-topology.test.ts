// ═══════════════════════════════════════════════════════════════
// Edge Function Topology Truth Test (Checklist 24.10)
// Asserts the on-disk supabase/functions/* set ↔ the authority map.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { EDGE_FUNCTION_AUTHORITY } from "@/lib/migration/edge-function-authority-map";

const FUNCTIONS_DIR = "supabase/functions";

describe("Edge Function Topology truth", () => {
  it("authority map is non-empty and has unique names", () => {
    const names = EDGE_FUNCTION_AUTHORITY.map((e) => e.name);
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(names.length);
  });

  it("no phantom entries — every authority entry has on-disk index.ts (when functions dir exists)", () => {
    if (!fs.existsSync(FUNCTIONS_DIR)) return;
    const phantoms: string[] = [];
    for (const entry of EDGE_FUNCTION_AUTHORITY) {
      const indexPath = path.join(FUNCTIONS_DIR, entry.name, "index.ts");
      if (!fs.existsSync(indexPath)) phantoms.push(entry.name);
    }
    expect(phantoms, `Phantom entries: ${phantoms.slice(0, 5).join(", ")}`).toHaveLength(0);
  });

  it("orphan rate stays bounded — most on-disk functions are registered", () => {
    if (!fs.existsSync(FUNCTIONS_DIR)) return;
    const onDisk = fs
      .readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
      .map((d) => d.name)
      .filter((name) => fs.existsSync(path.join(FUNCTIONS_DIR, name, "index.ts")));
    const registered = new Set(EDGE_FUNCTION_AUTHORITY.map((e) => e.name));
    const orphans = onDisk.filter((n) => !registered.has(n));
    // Hard ceiling — registry must cover ≥98% of on-disk fns.
    const coverage = (onDisk.length - orphans.length) / Math.max(onDisk.length, 1);
    expect(coverage, `Orphans: ${orphans.length}/${onDisk.length}`).toBeGreaterThanOrEqual(0.98);
  });
});
