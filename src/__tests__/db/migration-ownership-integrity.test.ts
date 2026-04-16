import { describe, it, expect } from "vitest";
import { MIGRATION_REGISTRY } from "@/lib/db/migration-registry";
import { DB_SCHEMA_REGISTRY } from "@/lib/db/schema-registry";

/**
 * Migration ownership integrity:
 * Every migration MUST declare a boundedContext, and that
 * boundedContext MUST be one used by at least one real table
 * in the schema registry. No phantom domains, no orphan
 * migrations.
 */
describe("Migration ownership integrity", () => {
  const knownDomains = new Set<string>(DB_SCHEMA_REGISTRY.map((t) => t.domain as string));

  it("has migrations to validate", () => {
    expect(MIGRATION_REGISTRY.length).toBeGreaterThan(100);
  });

  it("every migration has required ownership metadata", () => {
    for (const m of MIGRATION_REGISTRY) {
      expect(m.filename, "missing filename").toBeTruthy();
      expect(m.boundedContext, `missing boundedContext on ${m.filename}`).toBeTruthy();
      expect(m.category, `missing category on ${m.filename}`).toBeTruthy();
      expect(m.rollbackRisk, `missing rollbackRisk on ${m.filename}`).toBeTruthy();
    }
  });

  it("every migration boundedContext maps to a real schema domain", () => {
    const violations: string[] = [];
    for (const m of MIGRATION_REGISTRY) {
      if (!knownDomains.has(m.boundedContext)) {
        violations.push(`${m.filename} → ${m.boundedContext}`);
      }
    }
    expect(
      violations,
      `Migrations referencing unknown domains:\n${violations.join("\n")}\n\nKnown: ${[...knownDomains].sort().join(", ")}`,
    ).toEqual([]);
  });

  it("no two migrations share the same ordinal", () => {
    const seen = new Map<number, string>();
    const dupes: string[] = [];
    for (const m of MIGRATION_REGISTRY) {
      const prev = seen.get(m.ordinal);
      if (prev) dupes.push(`${prev} ↔ ${m.filename} (ordinal ${m.ordinal})`);
      seen.set(m.ordinal, m.filename);
    }
    expect(dupes, `Duplicate ordinals:\n${dupes.join("\n")}`).toEqual([]);
  });
});
