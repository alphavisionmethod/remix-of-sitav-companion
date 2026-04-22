import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * FK Integrity Tests — validates foreign key constraints
 * from migration files on disk.
 */
describe("FK Integrity", () => {
  const migrationDir = path.resolve("supabase/migrations");
  const migrations = fs.existsSync(migrationDir)
    ? fs.readdirSync(migrationDir).filter((f) => f.endsWith(".sql"))
    : [];

  const allSql = migrations
    .map((f) => fs.readFileSync(path.join(migrationDir, f), "utf-8"))
    .join("\n");

  // Extract FK references
  const fkPattern =
    /REFERENCES\s+(?:public\.)?(\w+)\s*\((\w+)\)/gi;
  const fkRefs: Array<{ target: string; column: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = fkPattern.exec(allSql)) !== null) {
    fkRefs.push({ target: match[1], column: match[2] });
  }

  // Extract created tables
  const createPattern =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi;
  const createdTables = new Set<string>();
  while ((match = createPattern.exec(allSql)) !== null) {
    createdTables.add(match[1]);
  }

  it("has a meaningful number of FK constraints (>= 150)", () => {
    expect(fkRefs.length).toBeGreaterThanOrEqual(150);
  });

  it("every FK target table exists as a created table or is a system table", () => {
    const systemTables = new Set(["users"]); // auth.users referenced as just 'users' sometimes
    const missing = fkRefs.filter(
      (fk) => !createdTables.has(fk.target) && !systemTables.has(fk.target)
    );
    expect(
      missing,
      `FK refs to non-existent tables: ${missing.map((m) => m.target).join(", ")}`
    ).toHaveLength(0);
  });

  it("no duplicate FK constraint names in same migration", () => {
    const constraintPattern =
      /CONSTRAINT\s+(\w+)\s+FOREIGN\s+KEY/gi;
    const seen = new Map<string, string[]>();
    for (const f of migrations) {
      const content = fs.readFileSync(path.join(migrationDir, f), "utf-8");
      let m: RegExpExecArray | null;
      while ((m = constraintPattern.exec(content)) !== null) {
        const name = m[1];
        if (!seen.has(name)) seen.set(name, []);
        seen.get(name)!.push(f);
      }
    }
    const dupes = [...seen.entries()].filter(([, files]) => files.length > 1);
    expect(
      dupes.length,
      `Duplicate FK constraints: ${dupes.map(([n]) => n).join(", ")}`
    ).toBe(0);
  });
});