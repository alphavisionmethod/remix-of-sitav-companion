#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Guard: No Empty Canonical Domain Barrels
//
// Locks in the Phase 1–3 canonicalization of the trusted domain
// layer. The listed canonical domains MUST expose real exports —
// they may never regress to `export {};` or to a comments-only
// barrel. Other domains under src/domains/ are intentionally
// scoped out of this guard until they are formally canonicalized
// (add them to CANONICAL_DOMAINS when their barrel is populated).
//
// Exit codes:
//   0 — every canonical barrel exposes ≥1 real export
//   1 — at least one canonical barrel is empty / re-export-less
//
// Report: generated/empty-domain-barrels-report.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";

const ROOT = process.cwd();
const DOMAINS_DIR = path.join(ROOT, "src/domains");
const REPORT_DIR = path.join(ROOT, "generated");
const REPORT_PATH = path.join(REPORT_DIR, "empty-domain-barrels-report.json");

/**
 * Domains whose top-level barrel is contractually populated and must
 * stay populated. Add a new domain here once its `index.ts` is
 * promoted from the placeholder `export {};` to a real surface.
 */
const CANONICAL_DOMAINS = ["business", "concierge", "finance", "investment"] as const;

interface BarrelResult {
  domain: string;
  barrelPath: string;
  exists: boolean;
  empty: boolean;
  exportNodeCount: number;
  reason?: string;
}

function stripCommentsAndWhitespace(source: string): string {
  // Strip /* ... */ block comments, then // line comments, then collapse whitespace.
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .trim();
}

function inspectBarrel(domain: string): BarrelResult {
  const barrelPath = path.join(DOMAINS_DIR, domain, "index.ts");
  const rel = path.relative(ROOT, barrelPath);

  if (!fs.existsSync(barrelPath)) {
    return {
      domain,
      barrelPath: rel,
      exists: false,
      empty: true,
      exportNodeCount: 0,
      reason: "barrel index.ts does not exist",
    };
  }

  const raw = fs.readFileSync(barrelPath, "utf8");
  const stripped = stripCommentsAndWhitespace(raw);

  // Hard-fail patterns: literal `export {}` (with or without semicolon, alone in file).
  if (/^export\s*\{\s*\}\s*;?$/.test(stripped)) {
    return {
      domain,
      barrelPath: rel,
      exists: true,
      empty: true,
      exportNodeCount: 0,
      reason: "barrel is `export {};` placeholder",
    };
  }

  // AST-level count of real export-bearing nodes.
  const sf = ts.createSourceFile(barrelPath, raw, ts.ScriptTarget.Latest, true);
  let exportCount = 0;
  for (const stmt of sf.statements) {
    if (ts.isExportDeclaration(stmt) || ts.isExportAssignment(stmt)) {
      // Skip `export {};` (no clause / empty named bindings).
      if (
        ts.isExportDeclaration(stmt) &&
        stmt.exportClause &&
        ts.isNamedExports(stmt.exportClause) &&
        stmt.exportClause.elements.length === 0
      ) {
        continue;
      }
      exportCount += 1;
      continue;
    }
    // `export const`, `export function`, `export class`, `export type`, `export interface`, `export enum`
    const mods = ts.canHaveModifiers(stmt) ? ts.getModifiers(stmt) ?? [] : [];
    if (mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      exportCount += 1;
    }
  }

  if (exportCount === 0) {
    return {
      domain,
      barrelPath: rel,
      exists: true,
      empty: true,
      exportNodeCount: 0,
      reason: "no export-bearing statements found",
    };
  }

  return {
    domain,
    barrelPath: rel,
    exists: true,
    empty: false,
    exportNodeCount: exportCount,
  };
}

function main(): number {
  const results: BarrelResult[] = CANONICAL_DOMAINS.map(inspectBarrel);
  const violations = results.filter((r) => r.empty);

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        canonicalDomains: CANONICAL_DOMAINS,
        results,
        violationCount: violations.length,
      },
      null,
      2,
    ),
    "utf8",
  );

  if (violations.length > 0) {
    console.error("❌ Empty canonical domain barrels detected:");
    for (const v of violations) {
      console.error(`  - ${v.barrelPath}: ${v.reason ?? "empty"}`);
    }
    console.error(`\nReport written to ${path.relative(ROOT, REPORT_PATH)}`);
    return 1;
  }

  console.log(
    `✅ All ${CANONICAL_DOMAINS.length} canonical domain barrels are populated:`,
  );
  for (const r of results) {
    console.log(`  - ${r.domain} (${r.exportNodeCount} export node${r.exportNodeCount === 1 ? "" : "s"})`);
  }
  return 0;
}

process.exit(main());
