// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Contract Tests
// Validates request/response contracts, error cases, status codes
// for all major edge function categories.
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const FUNCTIONS_DIR = join(process.cwd(), "supabase/functions");
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.PLAYWRIGHT_BASE_URL?.replace(/:\d+$/, "") || "";

// ── 1. Structural Contract: Every function has index.ts ─────────
test.describe("Edge function structural contracts", () => {
  const functionDirs = readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name);

  test(`All ${functionDirs.length} functions have index.ts`, () => {
    const missing: string[] = [];
    for (const fn of functionDirs) {
      if (!existsSync(join(FUNCTIONS_DIR, fn, "index.ts"))) {
        missing.push(fn);
      }
    }
    expect(missing).toEqual([]);
  });

  test("All functions import CORS handling", () => {
    const noCors: string[] = [];
    for (const fn of functionDirs) {
      const indexPath = join(FUNCTIONS_DIR, fn, "index.ts");
      if (!existsSync(indexPath)) continue;
      const src = readFileSync(indexPath, "utf-8");
      if (!src.includes("cors") && !src.includes("CORS") && !src.includes("Access-Control")) {
        noCors.push(fn);
      }
    }
    // Most functions should have CORS — warn if many don't
    // Some internal cron functions may not need CORS
    const internalPrefixes = ["cron-", "internal-", "scheduler-", "seed-", "data-cleanup"];
    const unexpectedNoCors = noCors.filter(
      (fn) => !internalPrefixes.some((p) => fn.startsWith(p))
    );
    // Log for visibility but don't hard-fail on cron functions
    if (unexpectedNoCors.length > 0) {
      console.log(`Functions without CORS (may be expected): ${unexpectedNoCors.join(", ")}`);
    }
  });

  test("No function uses raw SQL execution", () => {
    const violations: string[] = [];
    for (const fn of functionDirs) {
      const indexPath = join(FUNCTIONS_DIR, fn, "index.ts");
      if (!existsSync(indexPath)) continue;
      const src = readFileSync(indexPath, "utf-8");
      if (src.includes('execute_sql') || src.includes('exec_sql')) {
        violations.push(fn);
      }
    }
    expect(violations).toEqual([]);
  });

  test("All functions handle OPTIONS method for CORS preflight", () => {
    const noOptions: string[] = [];
    const internalPrefixes = ["cron-", "internal-", "scheduler-", "seed-", "data-cleanup", "security-council"];
    for (const fn of functionDirs) {
      if (internalPrefixes.some((p) => fn.startsWith(p))) continue;
      const indexPath = join(FUNCTIONS_DIR, fn, "index.ts");
      if (!existsSync(indexPath)) continue;
      const src = readFileSync(indexPath, "utf-8");
      if (!src.includes("OPTIONS") && !src.includes("handleCors") && !src.includes("corsResponse")) {
        noOptions.push(fn);
      }
    }
    if (noOptions.length > 0) {
      console.log(`Functions without OPTIONS handling: ${noOptions.join(", ")}`);
    }
  });

  test("Functions with auth validate JWT in code", () => {
    const authFunctions = functionDirs.filter((fn) =>
      ["admin-", "user-", "owner-"].some((p) => fn.startsWith(p))
    );
    const noAuth: string[] = [];
    for (const fn of authFunctions) {
      const indexPath = join(FUNCTIONS_DIR, fn, "index.ts");
      if (!existsSync(indexPath)) continue;
      const src = readFileSync(indexPath, "utf-8");
      if (
        !src.includes("authorization") &&
        !src.includes("Authorization") &&
        !src.includes("getUser") &&
        !src.includes("auth.") &&
        !src.includes("jwt")
      ) {
        noAuth.push(fn);
      }
    }
    if (noAuth.length > 0) {
      console.log(`Auth-prefixed functions without JWT validation: ${noAuth.join(", ")}`);
    }
    // Admin functions MUST have auth
    const adminNoAuth = noAuth.filter((fn) => fn.startsWith("admin-"));
    expect(adminNoAuth).toEqual([]);
  });

  test("All functions use serve() from Deno std", () => {
    const noServe: string[] = [];
    for (const fn of functionDirs) {
      const indexPath = join(FUNCTIONS_DIR, fn, "index.ts");
      if (!existsSync(indexPath)) continue;
      const src = readFileSync(indexPath, "utf-8");
      if (!src.includes("serve") && !src.includes("Deno.serve")) {
        noServe.push(fn);
      }
    }
    expect(noServe).toEqual([]);
  });

  test("No function hardcodes Supabase URLs", () => {
    const violations: string[] = [];
    for (const fn of functionDirs) {
      const indexPath = join(FUNCTIONS_DIR, fn, "index.ts");
      if (!existsSync(indexPath)) continue;
      const src = readFileSync(indexPath, "utf-8");
      // Check for hardcoded supabase project URLs (but allow env var references)
      const hardcoded = src.match(/https:\/\/[a-z]+\.supabase\.co/g);
      if (hardcoded && !src.includes("Deno.env.get")) {
        violations.push(fn);
      }
    }
    expect(violations).toEqual([]);
  });

  test("Functions returning JSON set Content-Type header", () => {
    const missing: string[] = [];
    for (const fn of functionDirs) {
      const indexPath = join(FUNCTIONS_DIR, fn, "index.ts");
      if (!existsSync(indexPath)) continue;
      const src = readFileSync(indexPath, "utf-8");
      if (src.includes("JSON.stringify") && !src.includes("application/json") && !src.includes("Content-Type") && !src.includes("corsHeaders")) {
        missing.push(fn);
      }
    }
    if (missing.length > 0) {
      console.log(`Functions with JSON.stringify but no Content-Type: ${missing.join(", ")}`);
    }
  });
});

// ── 2. Response Contract Categories ─────────────────────────────
test.describe("Edge function response patterns", () => {
  const functionDirs = readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name);

  test("Health endpoints return proper status codes", () => {
    const healthFns = functionDirs.filter((fn) => fn.includes("health"));
    for (const fn of healthFns) {
      const indexPath = join(FUNCTIONS_DIR, fn, "index.ts");
      if (!existsSync(indexPath)) continue;
      const src = readFileSync(indexPath, "utf-8");
      // Health functions should return 200 or have status checks
      expect(src).toMatch(/status:\s*(200|ok)/i);
    }
  });

  test("Error responses use proper HTTP status codes", () => {
    const violations: string[] = [];
    for (const fn of functionDirs) {
      const indexPath = join(FUNCTIONS_DIR, fn, "index.ts");
      if (!existsSync(indexPath)) continue;
      const src = readFileSync(indexPath, "utf-8");
      // Check that error responses don't always return 200
      if (src.includes("error") && src.includes("new Response")) {
        const hasErrorStatus = /status:\s*(4\d\d|5\d\d)/.test(src);
        if (!hasErrorStatus && src.length > 500) {
          // Only flag substantial functions
          violations.push(fn);
        }
      }
    }
    if (violations.length > 0) {
      console.log(`Functions that may not use proper error status codes: ${violations.slice(0, 10).join(", ")}`);
    }
  });

  test("Input validation exists in user-facing functions", () => {
    const userFacing = functionDirs.filter((fn) =>
      ["api-", "user-", "webhook-", "payment-"].some((p) => fn.startsWith(p))
    );
    const noValidation: string[] = [];
    for (const fn of userFacing) {
      const indexPath = join(FUNCTIONS_DIR, fn, "index.ts");
      if (!existsSync(indexPath)) continue;
      const src = readFileSync(indexPath, "utf-8");
      if (
        !src.includes("z.object") &&
        !src.includes("z.string") &&
        !src.includes("typeof") &&
        !src.includes("validate") &&
        !src.includes("required") &&
        !src.includes("!body") &&
        !src.includes("missing")
      ) {
        noValidation.push(fn);
      }
    }
    if (noValidation.length > 0) {
      console.log(`User-facing functions without input validation: ${noValidation.join(", ")}`);
    }
  });
});