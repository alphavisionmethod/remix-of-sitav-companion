// ═══════════════════════════════════════════════════════════════
// Architecture Test — Canonical Domain Barrels
//
// Asserts that every canonical domain barrel (Phases 1–3) exposes
// real export *statements* (counted via TypeScript AST — `export
// type` re-exports DO count, but `export {};` does NOT) AND that
// the architecture guard script is itself green. Mirrors the
// in-process pattern used by src/__tests__/service-boundary-truth.test.ts.
//
// We deliberately do NOT count runtime `Object.keys(mod)` because
// `export type` re-exports are erased at runtime and would cause
// false negatives for type-only canonical barrels.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";

const SCRIPT = "scripts/architecture/audits/check-no-empty-domain-barrels.ts";
const CANONICAL_DOMAINS = ["business", "concierge", "finance", "investment"] as const;

function countExportNodes(barrelPath: string): number {
  const raw = fs.readFileSync(barrelPath, "utf8");
  const sf = ts.createSourceFile(barrelPath, raw, ts.ScriptTarget.Latest, true);
  let count = 0;
  for (const stmt of sf.statements) {
    if (ts.isExportDeclaration(stmt) || ts.isExportAssignment(stmt)) {
      if (
        ts.isExportDeclaration(stmt) &&
        stmt.exportClause &&
        ts.isNamedExports(stmt.exportClause) &&
        stmt.exportClause.elements.length === 0
      ) {
        continue;
      }
      count += 1;
      continue;
    }
    const mods = ts.canHaveModifiers(stmt) ? ts.getModifiers(stmt) ?? [] : [];
    if (mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) count += 1;
  }
  return count;
}

describe("Canonical domain barrels", () => {
  it("guard script exists on disk", () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
  });

  it.each(CANONICAL_DOMAINS)(
    "@/domains/%s barrel has ≥1 export statement (AST)",
    (domain) => {
      const barrelPath = path.join("src/domains", domain, "index.ts");
      expect(fs.existsSync(barrelPath), `missing ${barrelPath}`).toBe(true);
      const count = countExportNodes(barrelPath);
      expect(count, `${barrelPath} has zero export statements`).toBeGreaterThan(0);
    },
  );

  it("guard script exits 0 (no empty canonical barrels)", () => {
    let exitCode = 0;
    let output = "";
    try {
      output = execSync(`npx tsx ${SCRIPT}`, { stdio: "pipe", timeout: 60_000 }).toString();
    } catch (e: unknown) {
      const err = e as { status?: number; stdout?: Buffer; stderr?: Buffer };
      exitCode = err.status ?? 1;
      output = `${err.stdout?.toString() ?? ""}${err.stderr?.toString() ?? ""}`;
    }
    expect(exitCode, output.slice(0, 800)).toBe(0);
  }, 90_000);
});
