#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform-Local Contract Scope (Wave 1.2, BLOCKING)
//
// Enforces Rule 42: files under src/platform/<X>/contracts/** MUST
// only be imported from inside src/platform/<X>/**. Cross-system,
// cross-pillar, or page-level importers indicate the contract is
// app-wide and must be promoted to src/packages/<family>-contracts/.
//
// Deprecated re-export shims (frontmatter `@deprecated Wave 1.2`)
// are exempted and tracked under the Rule 23 shim baseline.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      if (e === "node_modules" || e === ".git") continue;
      walk(full, acc);
    } else if (/\.(ts|tsx)$/.test(e)) {
      acc.push(full);
    }
  }
  return acc;
}

// 1) Discover every platform-local contract file and its owning system
interface PlatformContractFile {
  rel: string; // e.g. src/platform/contracts/pillar-contract.ts
  system: string; // e.g. "contracts" or "trust"
  importAlias: string; // e.g. @/platform/contracts/pillar-contract
  isDeprecatedShim: boolean;
}

const platformContractFiles: PlatformContractFile[] = [];
for (const f of walk("src/platform")) {
  const rel = relative(".", f);
  // src/platform/<system>/contracts/<file>  OR  src/platform/<system>/contracts.ts
  // For Wave 1.2, src/platform/contracts/ itself is the legacy pre-promotion folder.
  const m = rel.match(/^src\/platform\/([^/]+)\/contracts\/(.+\.tsx?)$/);
  let system: string | null = null;
  if (m) system = m[1];
  else if (/^src\/platform\/contracts\/.+\.tsx?$/.test(rel)) system = "__legacy_root__";
  if (!system) continue;

  const content = readFileSync(f, "utf8");
  const isDeprecatedShim = /@deprecated\s+Wave\s+1\.2/i.test(content) && /export\s+\*\s+from\s+["']@\/packages\//.test(content);
  const importAlias = "@/" + rel.replace(/^src\//, "").replace(/\.tsx?$/, "");
  platformContractFiles.push({ rel, system, importAlias, isDeprecatedShim });
}

// 2) For each non-shim platform-local contract file, scan all consumers
const allFiles = walk("src");

interface Violation {
  contractFile: string;
  contractSystem: string;
  importer: string;
  importerLayer: string;
  importPath: string;
}

const violations: Violation[] = [];

function importerLayer(rel: string): string {
  if (rel.startsWith("src/pages/")) return "pages";
  if (rel.startsWith("src/modules/")) return "modules";
  if (rel.startsWith("src/admin/")) return "admin";
  if (rel.startsWith("src/components/")) return "components";
  const m = rel.match(/^src\/platform\/([^/]+)\//);
  if (m) return `platform/${m[1]}`;
  return "other";
}

for (const cf of platformContractFiles) {
  if (cf.isDeprecatedShim) continue; // exempt deprecated shims
  // Build set of allowed importer prefixes
  const ownerPrefix = cf.system === "__legacy_root__"
    ? "src/platform/contracts/"
    : `src/platform/${cf.system}/`;

  // Match imports against the canonical alias and any deeper sub-path
  const aliasEsc = cf.importAlias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const importRe = new RegExp(`from\\s+["']${aliasEsc}(?:["']|/)`);

  for (const consumer of allFiles) {
    const rel = relative(".", consumer);
    if (rel === cf.rel) continue;
    if (rel.startsWith(ownerPrefix)) continue; // same owning system OK
    // Skip generators / scripts / docs
    if (rel.startsWith("scripts/") || rel.startsWith("docs/")) continue;
    let content: string;
    try {
      content = readFileSync(consumer, "utf8");
    } catch {
      continue;
    }
    if (!importRe.test(content)) continue;
    // Allow another deprecated shim file to also re-export
    if (/@deprecated\s+Wave\s+1\.2/i.test(content)) continue;
    violations.push({
      contractFile: cf.rel,
      contractSystem: cf.system,
      importer: rel,
      importerLayer: importerLayer(rel),
      importPath: cf.importAlias,
    });
  }
}

const ok = violations.length === 0;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "platform-local-contract-scope",
  level: "block",
  ok,
  inspectedFiles: platformContractFiles.length,
  exemptedDeprecatedShims: platformContractFiles.filter((c) => c.isDeprecatedShim).length,
  violationCount: violations.length,
  violations: violations.slice(0, 200),
};
writeFileSync(join(OUT_DIR, "platform-local-contract-scope-report.json"), JSON.stringify(report, null, 2));
console.log(
  `platform-local-contract-scope: ${violations.length} violation(s); ${platformContractFiles.length} files inspected (${platformContractFiles.filter((c) => c.isDeprecatedShim).length} deprecated shims exempted) — ${ok ? "OK" : "BLOCK"}`,
);
process.exit(ok ? 0 : 1);