#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// IA Manifest Coverage Check (Phase 1)
// ───────────────────────────────────────────────────────────────
// For each of the three app shells (BusinessAppShell,
// ConciergeAppShell, FinanceAppShell), parse its PAGE_COMPONENTS
// (or `pages`) map and prove:
//   1. every shell-mounted slug has a manifest descriptor
//   2. every manifest descriptor with sidebarVisible=true is
//      mounted in the corresponding shell
//   3. no archived descriptor is mounted in any shell
//
// Exits non-zero on any mismatch.
// ═══════════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import {
  BUSINESS_IA,
  CONCIERGE_IA,
  FINANCE_IA,
} from "../../../src/platform/ia/module-ia-manifest";
import type { PageDescriptor } from "../../../src/platform/ia/page-role";

const ROOT = process.cwd();

interface ShellSpec {
  pillar: "business" | "concierge" | "finance";
  file: string;
  manifest: readonly PageDescriptor[];
  /** Variable name of the page map inside the shell. */
  pageMapVar: "pages" | "PAGE_COMPONENTS";
}

const SHELLS: ShellSpec[] = [
  {
    pillar: "business",
    file: "src/platform/sita/components/sita/apps/business/BusinessAppShell.tsx",
    manifest: BUSINESS_IA,
    pageMapVar: "pages",
  },
  {
    pillar: "concierge",
    file: "src/platform/sita/components/sita/apps/concierge/ConciergeAppShell.tsx",
    manifest: CONCIERGE_IA,
    pageMapVar: "PAGE_COMPONENTS",
  },
  {
    pillar: "finance",
    file: "src/platform/sita/components/sita/apps/finance/FinanceAppShell.tsx",
    manifest: FINANCE_IA,
    pageMapVar: "pages",
  },
];

/**
 * Extract slug keys from a page map literal in the shell file.
 * Looks for `const <var>: ... = {` and extracts top-level quoted-or-bare keys
 * up to the matching `};`. Tolerant of trailing commas, comments, and whitespace.
 */
function extractSlugs(text: string, mapVar: string): string[] {
  const re = new RegExp(`const\\s+${mapVar}\\s*:?[^=]*=\\s*\\{`);
  const m = re.exec(text);
  if (!m) return [];
  const start = m.index + m[0].length;
  // Find matching closing brace by counting depth.
  let depth = 1;
  let i = start;
  while (i < text.length && depth > 0) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }
  const body = text.slice(start, i - 1);
  // Match keys: either "quoted" or bareword followed by ':' (not '::' or inside parens).
  const slugs: string[] = [];
  // Strip line comments
  const cleaned = body.replace(/\/\/[^\n]*/g, "");
  const keyRe = /(^|[\n,{])\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z_][\w-]*))\s*:/g;
  let km: RegExpExecArray | null;
  while ((km = keyRe.exec(cleaned)) !== null) {
    const key = km[2] ?? km[3] ?? km[4];
    if (key) slugs.push(key);
  }
  return Array.from(new Set(slugs));
}

const errors: string[] = [];

for (const shell of SHELLS) {
  const abs = path.join(ROOT, shell.file);
  if (!fs.existsSync(abs)) {
    errors.push(`[${shell.pillar}] shell file not found: ${shell.file}`);
    continue;
  }
  const text = fs.readFileSync(abs, "utf8");
  const shellSlugs = extractSlugs(text, shell.pageMapVar);
  if (shellSlugs.length === 0) {
    errors.push(`[${shell.pillar}] could not extract any slugs from \`${shell.pageMapVar}\` in ${shell.file}`);
    continue;
  }
  const manifestById = new Map(shell.manifest.map((d) => [d.id, d]));
  const shellSet = new Set(shellSlugs);

  // 1. every shell slug ⇒ manifest descriptor
  for (const slug of shellSlugs) {
    const d = manifestById.get(slug);
    if (!d) {
      errors.push(`[${shell.pillar}] shell slug "${slug}" has NO manifest descriptor in module-ia-manifest.ts`);
      continue;
    }
    // 3. archived descriptors must not be mounted
    if (d.role === "archived") {
      errors.push(`[${shell.pillar}] shell mounts ARCHIVED descriptor "${slug}" — remove from PAGE map`);
    }
  }

  // 2. every sidebar-visible non-archived descriptor must be mounted
  for (const d of shell.manifest) {
    if (d.role === "archived") continue;
    if (d.role === "labs" && d.featureFlag) continue; // gated — not required mount
    if (!d.sidebarVisible) continue; // internal-but-visible-false descriptors needn't mount
    if (!shellSet.has(d.id)) {
      errors.push(`[${shell.pillar}] manifest descriptor "${d.id}" (sidebarVisible) is NOT mounted in shell PAGE map`);
    }
  }
}

if (errors.length > 0) {
  console.error("\n❌ IA manifest coverage failed:\n");
  for (const e of errors) console.error("  • " + e);
  console.error(`\nTotal: ${errors.length} error(s)\n`);
  process.exit(1);
}

console.log(`✅ IA manifest coverage clean (${SHELLS.length} shells × ${BUSINESS_IA.length + CONCIERGE_IA.length + FINANCE_IA.length} descriptors).`);
process.exit(0);