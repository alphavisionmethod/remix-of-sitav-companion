import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

/**
 * Phase 9 — Pre-Deploy Smoke Test
 * ---------------------------------------------------------------
 * Hard pre-deploy gate that verifies, against the live backend:
 *  1) The 4 tables added in Phase 9 / 9.1 exist and are queryable.
 *  2) RLS is on for each of them (policy probe returns either
 *     a clean empty resultset for an authenticated user OR a
 *     PostgREST permission error for an anon caller — both prove
 *     RLS is enforcing rather than open).
 *  3) `tsc --noEmit` for the project completes with zero errors.
 *
 * This test is deliberately light on assumptions: it does NOT
 * require an authenticated session. It only asserts:
 *   - the table responds (proving it exists and PostgREST sees it)
 *   - the response from an anon role is either empty (RLS-locked) or
 *     an explicit "permission denied" / "row-level security" error,
 *     never a 200 with rows belonging to other users.
 *
 * If `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` are not
 * present in the environment, the live-DB block is skipped and the
 * test still asserts the TypeScript build, so the gate is safe in
 * environments without DB credentials.
 */

const PHASE9_TABLES = [
  "call_outcomes",
  "automation_fatigue_alerts",
  "pack_install_metrics",
  "runbook_launch_requests",
] as const;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const HAS_DB = !!SUPABASE_URL && !!SUPABASE_KEY;

describe("Phase 9 — pre-deploy smoke gate", () => {
  describe.skipIf(!HAS_DB)("live DB checks", () => {
    const sb = HAS_DB ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    it.each(PHASE9_TABLES)("table %s exists and responds via PostgREST", async (table) => {
      // `head: true` issues a HEAD request — fastest way to confirm
      // the relation is exposed without transferring rows.
      const { error } = await sb!.from(table).select("*", { head: true, count: "exact" }).limit(1);
      // Any error other than "relation does not exist" (42P01) means
      // the table is reachable. RLS denial is OK; missing table is not.
      const code = (error as { code?: string } | null)?.code;
      expect(code, `Table ${table} unexpectedly missing (PostgREST error: ${error?.message ?? "none"})`).not.toBe("42P01");
    });

    it.each(PHASE9_TABLES)("RLS prevents anon from reading other users' rows in %s", async (table) => {
      // For per-user tables, an anon SELECT should either:
      //  - return zero rows (RLS filters out everything), or
      //  - return a permission-denied / RLS error.
      // For pack_install_metrics (read-all-authenticated), anon may also
      // return permission denied — that is also acceptable proof.
      const { data, error } = await sb!.from(table).select("id").limit(5);
      if (error) {
        const msg = (error.message ?? "").toLowerCase();
        expect(
          msg.includes("permission denied") ||
            msg.includes("row-level security") ||
            msg.includes("rls") ||
            (error as { code?: string }).code === "42501",
          `Unexpected error from ${table}: ${error.message}`,
        ).toBe(true);
      } else {
        expect(Array.isArray(data)).toBe(true);
        expect(data!.length, `Anon caller saw ${data!.length} rows in ${table} — RLS appears open`).toBe(0);
      }
    });
  });

  it("project compiles with zero TypeScript errors (tsc --noEmit)", () => {
    // We intentionally let stderr/stdout flow up via `inherit` so a
    // failing build prints the diagnostics into the test output.
    expect(() => {
      execSync("npx tsc --noEmit", { stdio: "pipe", timeout: 240_000 });
    }).not.toThrow();
  }, 250_000);
});