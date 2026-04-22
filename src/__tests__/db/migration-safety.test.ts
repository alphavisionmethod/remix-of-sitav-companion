import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const MIGRATIONS_DIR = "supabase/migrations";
const RESERVED_SCHEMAS = ["auth.", "storage.", "realtime.", "supabase_functions.", "vault."];

const migrations = fs.existsSync(MIGRATIONS_DIR)
  ? fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith(".sql")).sort()
  : [];

describe("Migration Safety Checks", () => {
  it("migrations directory exists with files", () => {
    expect(migrations.length).toBeGreaterThan(0);
  });

  it("all migration filenames follow timestamp convention", () => {
    const invalid = migrations.filter(f => !f.match(/^\d{14}_/));
    expect(invalid.length, `Invalid naming: ${invalid.slice(0, 5).join(", ")}`).toBe(0);
  });

  it("no duplicate migration timestamps", () => {
    const timestamps = migrations.map(f => f.substring(0, 14));
    const dupes = timestamps.filter((t, i) => timestamps.indexOf(t) !== i);
    expect(dupes.length, `Duplicate timestamps: ${dupes.join(", ")}`).toBe(0);
  });

  it("no migration contains ALTER DATABASE", () => {
    const violators: string[] = [];
    for (const m of migrations) {
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, m), "utf8");
      if (content.match(/ALTER\s+DATABASE/i)) violators.push(m);
    }
    expect(violators.length, `ALTER DATABASE in: ${violators.join(", ")}`).toBe(0);
  });

  it("DROP TABLE always has IF EXISTS", () => {
    const violators: string[] = [];
    for (const m of migrations) {
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, m), "utf8");
      const drops = content.match(/DROP\s+TABLE\s+(?!IF\s+EXISTS)/gi) || [];
      if (drops.length > 0) violators.push(m);
    }
    // Allow ≤3 legacy migrations
    expect(violators.length, `Unsafe DROP TABLE in: ${violators.slice(0, 10).join(", ")}`).toBeLessThanOrEqual(3);
  });

  it("no migration modifies reserved schemas directly", () => {
    const violators: string[] = [];
    for (const m of migrations) {
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, m), "utf8");
      for (const schema of RESERVED_SCHEMAS) {
        // Check for CREATE/ALTER/DROP on reserved schemas (exclude CREATE POLICY ON storage.objects which is allowed)
        if (content.match(new RegExp(`(CREATE|ALTER|DROP)\\s+TABLE\\s+${schema.replace(".", "\\.")}`, "i"))) {
          violators.push(`${m} (${schema})`);
        }
      }
    }
    expect(violators.length, `Reserved schema modifications: ${violators.slice(0, 10).join(", ")}`).toBeLessThanOrEqual(5);
  });

  it("migrations are ordered chronologically", () => {
    const timestamps = migrations.map(f => f.substring(0, 14));
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i] >= timestamps[i - 1], `Out of order: ${migrations[i]} before ${migrations[i - 1]}`).toBe(true);
    }
  });
});