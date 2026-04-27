// ═══════════════════════════════════════════════════════════════
// Phase 8 — trust.edge-receipt-binding
//
// Proves that every edge function that interacts with the canonical
// receipt table (`ai_action_receipts`) does so under the canonical
// trust contract:
//   1. The canonical helper (`supabase/functions/_shared/receipt-emitter.ts`)
//      is the single documented writer entry point and persists the
//      required lineage columns.
//   2. Any *additional* writer (currently only `internal-agent-execute-action`)
//      MUST carry the same lineage columns the canonical helper guarantees:
//      `user_id`, `action_type`, `recommendation_summary`, `status`.
//   3. Read-side functions only SELECT — they never silently mutate the
//      receipt ledger.
//
// Honesty: read the real edge function source files from disk, no mocks.
// This test is the deployment gate for any new edge function that touches
// the trust ledger.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const FN_DIR = path.resolve(ROOT, "supabase/functions");

function readFn(rel: string): string {
  return fs.readFileSync(path.resolve(FN_DIR, rel), "utf8");
}

// ── Discovered (and fixed) inventory ───────────────────────────
// `scripts/architecture/check-finance-coverage.ts`-style discovery
// confirms only one writer outside the canonical helper. Any new
// writer MUST be added here and pass the lineage-column contract.

const CANONICAL_HELPER = "_shared/receipt-emitter.ts";

const KNOWN_WRITERS: ReadonlyArray<string> = [
  // The canonical helper itself.
  "_shared/receipt-emitter.ts",
  // The autonomous agent executor — only other writer in the repo.
  "internal-agent-execute-action/index.ts",
];

const KNOWN_READERS: ReadonlyArray<string> = [
  "external-workforce-api/index.ts",
  "sita-reflection-loop/index.ts",
  "sita-briefings-generate/index.ts",
  "internal-agent-slo-evaluator/index.ts",
  "ai-receipt-completeness-snapshot/index.ts",
];

const REQUIRED_LINEAGE_COLUMNS: ReadonlyArray<string> = [
  "user_id",
  "action_type",
  "recommendation_summary",
  "status",
];

describe("Phase 8 — trust.edge-receipt-binding", () => {
  // ── Canonical helper contract ───────────────────────────────

  it("the canonical helper exists and exports `emitActionReceipt`", () => {
    const src = readFn(CANONICAL_HELPER);
    expect(src).toMatch(/export async function emitActionReceipt/);
  });

  it("the canonical helper writes every required lineage column to ai_action_receipts", () => {
    const src = readFn(CANONICAL_HELPER);
    expect(src).toMatch(/from\(["']ai_action_receipts["']\)/);
    for (const col of REQUIRED_LINEAGE_COLUMNS) {
      expect(src).toMatch(new RegExp(`${col}\\s*:`));
    }
    // Receipt ID is also required so any downstream proof can be cited.
    expect(src).toMatch(/receipt_id\s*:/);
  });

  it("the canonical helper is fail-safe — it never throws on insert errors (fire-and-forget contract)", () => {
    const src = readFn(CANONICAL_HELPER);
    // Helper must contain a try/catch around the insert path.
    expect(src).toMatch(/try\s*\{/);
    expect(src).toMatch(/catch\s*\(/);
    // And must return null (not throw) on failure.
    expect(src).toMatch(/return null/);
  });

  // ── Writer contract ─────────────────────────────────────────

  it("every known writer carries the required lineage columns on its insert", () => {
    for (const rel of KNOWN_WRITERS) {
      const src = readFn(rel);
      // Skip files that don't actually call .insert (the helper file itself
      // does, but we assert each individually for clarity).
      const hasInsert = /from\(["']ai_action_receipts["']\)\s*\.insert\(/s.test(src) ||
        /\.insert\([^)]*ai_action_receipts/s.test(src) ||
        /\.from\(["']ai_action_receipts["']\)[\s\S]*?\.insert\(/.test(src);
      expect(hasInsert, `${rel} should write to ai_action_receipts`).toBe(true);
      for (const col of REQUIRED_LINEAGE_COLUMNS) {
        expect(
          src,
          `${rel} is missing required lineage column "${col}" on its ai_action_receipts insert`,
        ).toMatch(new RegExp(`${col}\\s*:`));
      }
    }
  });

  // ── Reader contract ─────────────────────────────────────────

  it("every known reader function only SELECTs from ai_action_receipts (no silent ledger mutation)", () => {
    for (const rel of KNOWN_READERS) {
      const src = readFn(rel);
      // Reader files must never insert/update/delete on the receipt table.
      // We assert this by checking that no `.from("ai_action_receipts")` chain
      // is followed by `.insert(`, `.update(`, or `.delete(`.
      const writePattern = /from\(["']ai_action_receipts["']\)[\s\S]{0,400}?\.(insert|update|delete)\(/;
      expect(
        writePattern.test(src),
        `${rel} unexpectedly mutates ai_action_receipts (this list is for readers only — promote it to KNOWN_WRITERS and add lineage columns)`,
      ).toBe(false);
    }
  });

  // ── Drift gate ──────────────────────────────────────────────

  it("there are no UNDECLARED writers to ai_action_receipts (drift gate)", () => {
    // Walk every supabase/functions/<name>/index.ts and assert it is either
    // declared in KNOWN_WRITERS, KNOWN_READERS, or doesn't touch the table.
    const declared = new Set<string>([...KNOWN_WRITERS, ...KNOWN_READERS]);
    const undeclaredWriters: string[] = [];

    const entries = fs.readdirSync(FN_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
      const indexPath = path.join(FN_DIR, entry.name, "index.ts");
      if (!fs.existsSync(indexPath)) continue;

      const src = fs.readFileSync(indexPath, "utf8");
      if (!src.includes("ai_action_receipts")) continue;

      const rel = `${entry.name}/index.ts`;
      const writes =
        /from\(["']ai_action_receipts["']\)[\s\S]{0,400}?\.(insert|update|delete|upsert)\(/.test(src);
      if (writes && !declared.has(rel)) {
        undeclaredWriters.push(rel);
      }
    }

    expect(
      undeclaredWriters,
      `Undeclared edge writers to ai_action_receipts found. Add them to KNOWN_WRITERS in this test (and ensure they carry the required lineage columns):\n${undeclaredWriters.join("\n")}`,
    ).toEqual([]);
  });

  // ── Documentation pointer ───────────────────────────────────

  it("the writer count matches the documented inventory (alerts when a new writer lands)", () => {
    let writerCount = 0;
    const entries = fs.readdirSync(FN_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const indexPath = path.join(FN_DIR, entry.name, "index.ts");
      if (!fs.existsSync(indexPath)) continue;
      const src = fs.readFileSync(indexPath, "utf8");
      if (
        /from\(["']ai_action_receipts["']\)[\s\S]{0,400}?\.(insert|update|delete|upsert)\(/.test(src)
      ) {
        writerCount++;
      }
    }
    // Helper file is NOT counted (it lives in _shared, scanned separately).
    // Currently exactly one user-function writer: internal-agent-execute-action.
    expect(writerCount).toBe(1);
  });
});
