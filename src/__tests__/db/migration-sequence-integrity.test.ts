import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { MIGRATION_REGISTRY } from "@/lib/db/migration-registry";

/**
 * Migration Sequence Integrity Tests
 * Validates migration files on disk match the registry and are properly ordered.
 */
describe("Migration Sequence Integrity", () => {
  const migrationDir = path.resolve("supabase/migrations");
  const diskFiles = fs.existsSync(migrationDir)
    ? fs.readdirSync(migrationDir).filter((f) => f.endsWith(".sql")).sort()
    : [];

  it("migration directory exists and has files", () => {
    expect(fs.existsSync(migrationDir)).toBe(true);
    expect(diskFiles.length).toBeGreaterThan(0);
  });

  it("migration count on disk matches registry (± 5)", () => {
    const diff = Math.abs(diskFiles.length - MIGRATION_REGISTRY.length);
    expect(
      diff,
      `Disk: ${diskFiles.length}, Registry: ${MIGRATION_REGISTRY.length}`
    ).toBeLessThanOrEqual(5);
  });

  it("every registry migration exists on disk", () => {
    const diskSet = new Set(diskFiles);
    const missing = MIGRATION_REGISTRY.filter(
      (m) => !diskSet.has(m.filename)
    );
    expect(
      missing,
      `Missing on disk: ${missing.map((m) => m.filename).join(", ")}`
    ).toHaveLength(0);
  });

  it("no two migrations share a timestamp prefix", () => {
    const prefixes = diskFiles.map((f) => f.substring(0, 14));
    const dupes = prefixes.filter(
      (p, i) => prefixes.indexOf(p) !== i
    );
    expect(
      dupes,
      `Duplicate timestamp prefixes: ${[...new Set(dupes)].join(", ")}`
    ).toHaveLength(0);
  });

  it("migrations are in chronological order", () => {
    for (let i = 1; i < diskFiles.length; i++) {
      const prev = diskFiles[i - 1].substring(0, 14);
      const curr = diskFiles[i].substring(0, 14);
      expect(
        curr >= prev,
        `Out of order: ${diskFiles[i - 1]} > ${diskFiles[i]}`
      ).toBe(true);
    }
  });

  it("every migration has valid SQL content (non-empty)", () => {
    const empty: string[] = [];
    for (const f of diskFiles) {
      const content = fs.readFileSync(path.join(migrationDir, f), "utf-8").trim();
      if (content.length === 0) empty.push(f);
    }
    expect(empty, `Empty migrations: ${empty.join(", ")}`).toHaveLength(0);
  });
});