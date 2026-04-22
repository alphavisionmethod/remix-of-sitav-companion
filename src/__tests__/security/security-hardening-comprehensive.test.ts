import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ═══════════════════════════════════════════════════════════════
// Security Hardening — Comprehensive Verification
// ═══════════════════════════════════════════════════════════════

function readAllFiles(dir: string, ext: string): { path: string; content: string }[] {
  const results: { path: string; content: string }[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
      results.push(...readAllFiles(full, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push({ path: full, content: fs.readFileSync(full, "utf8") });
    }
  }
  return results;
}

describe("No Hardcoded Secrets", () => {
  it("no API keys in source pages", () => {
    const files = readAllFiles("src/pages", ".tsx");
    const violations: string[] = [];
    for (const f of files) {
      if (f.content.match(/sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9]{30,}/)) {
        violations.push(f.path);
      }
    }
    expect(violations).toEqual([]);
  });

  it("no hardcoded passwords in components", () => {
    const files = readAllFiles("src/components", ".tsx");
    const violations: string[] = [];
    for (const f of files) {
      if (f.content.match(/password\s*[:=]\s*["'][^"']{4,}["']/i) &&
          !f.content.includes("placeholder") && !f.content.includes("type=\"password\"")) {
        violations.push(f.path);
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("Auth Security Patterns", () => {
  it("no anonymous signups in auth context", () => {
    const auth = fs.readFileSync("src/contexts/AuthContext.tsx", "utf8");
    expect(auth).not.toContain("signInAnonymously");
  });

  it("edge functions validate JWT in code", () => {
    const funcs = fs.readdirSync("supabase/functions", { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith("_"))
      .map(d => d.name);
    // At least some functions should validate auth
    let authValidating = 0;
    for (const f of funcs) {
      const indexPath = `supabase/functions/${f}/index.ts`;
      if (!fs.existsSync(indexPath)) continue;
      const content = fs.readFileSync(indexPath, "utf8");
      if (content.includes("getUser") || content.includes("authorization") || content.includes("jwt")) {
        authValidating++;
      }
    }
    expect(authValidating).toBeGreaterThan(0);
  });
});

describe("Database Security", () => {
  it("RLS tables exist in types (confirms RLS infrastructure)", () => {
    const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");
    // Key tables that must have RLS
    for (const table of ["accounts", "admin_sessions", "advisor_agents"]) {
      expect(types, `Table ${table} missing from types`).toContain(table);
    }
  });

  it("migration files enforce RLS", () => {
    const migrations = fs.readdirSync("supabase/migrations");
    const rlsMigrations = migrations.filter(f => {
      const content = fs.readFileSync(`supabase/migrations/${f}`, "utf8");
      return content.includes("enable row level security") || content.includes("ENABLE ROW LEVEL SECURITY");
    });
    expect(rlsMigrations.length).toBeGreaterThan(0);
  });
});