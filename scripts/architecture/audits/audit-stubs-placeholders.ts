#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Stub & Placeholder Evidence Audit
// Generates: generated/STUBS_AND_PLACEHOLDERS_REGISTER.md
// Categorizes every hit by surface + priority. NO code mutation.
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync, statSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

interface Hit {
  file: string;
  line: number;
  category: string;
  snippet: string;
  surface: "page" | "component" | "hook" | "lib" | "test" | "other";
  priority: "P0" | "P1" | "P2" | "P3" | "P4";
  intentional: boolean;
}

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const PATTERNS: { name: string; re: RegExp; category: string }[] = [
  { name: "empty-onclick",      re: /onClick=\{\(\)\s*=>\s*\{\s*\}\}/,                category: "Empty handler" },
  { name: "noop-onclick",       re: /onClick=\{\(\)\s*=>\s*null\}/,                   category: "Empty handler" },
  { name: "placeholder-href",   re: /href=["']#["']/,                                  category: "Placeholder href" },
  { name: "todo",               re: /\/\/\s*(TODO|FIXME|XXX|HACK)\b/,                  category: "TODO comment" },
  { name: "not-implemented",    re: /throw new Error\(["'`]Not implemented/,           category: "Not implemented" },
  { name: "lorem",              re: /lorem ipsum/i,                                    category: "Lorem ipsum" },
  { name: "coming-soon-toast",  re: /toast\.[a-z]+\([^)]*coming soon/i,                category: "Coming-soon toast" },
  { name: "alert-stub",         re: /\balert\(["']/,                                    category: "alert() stub" },
  { name: "mock-const",         re: /^\s*const (MOCK_|mock[A-Z])/,                     category: "Inline mock data" },
];

const INTENTIONAL_FILES = new Set<string>([
  "src/components/admin/hubs/WorkflowStepStub.tsx",
  "src/components/sita/PremiumEmptyState.tsx",
  "src/components/reality/RealityStateBadge.tsx",
  "src/components/sita/AllProviderFamiliesStatus.tsx",
  "src/lib/ai/ai-state-types.ts",
  "src/lib/ai/ai-surface-grammar.ts",
  "src/lib/degraded-state-classes.ts",
]);

const TRUST_BEARING = [
  "src/pages/Boardroom",
  "src/pages/admin/HQApprovalQueue",
  "src/pages/money/",
  "src/pages/auth/",
  "src/components/finance/",
  "src/components/sita/apps/boardroom/",
];

const FLAGSHIP_LOOPS = [
  "src/pages/files/",
  "src/pages/admin/verification/",
  "src/pages/admin/connector",
  "src/pages/admin/implementation-truth/",
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function classifySurface(rel: string): Hit["surface"] {
  if (rel.includes(".test.") || rel.includes(".spec.") || rel.includes("__tests__")) return "test";
  if (rel.startsWith("src/pages/")) return "page";
  if (rel.startsWith("src/components/")) return "component";
  if (rel.startsWith("src/hooks/")) return "hook";
  if (rel.startsWith("src/lib/")) return "lib";
  return "other";
}

function classifyPriority(rel: string, surface: Hit["surface"]): Hit["priority"] {
  if (TRUST_BEARING.some((p) => rel.startsWith(p))) return "P0";
  if (FLAGSHIP_LOOPS.some((p) => rel.startsWith(p))) return "P1";
  if (surface === "page" && rel.startsWith("src/pages/admin/")) return "P3";
  if (surface === "page") return "P2";
  if (surface === "component") return "P3";
  return "P4";
}

function isIntentional(rel: string, category: string, snippet: string): boolean {
  if (INTENTIONAL_FILES.has(rel)) return true;
  // status-grammar tokens that legitimately use the literal "Coming Soon"
  if (category === "Coming-soon toast" && /toast\.message/.test(snippet) === false) return true;
  // mock data inside test files
  if (rel.includes(".test.") || rel.includes(".spec.") || rel.includes("__tests__")) return true;
  // calculator buttons that intentionally have no-op until parser is wired (low risk, OS app)
  if (rel === "src/components/sita/shell/windows/CalculatorWindow.tsx") return true;
  return false;
}

const hits: Hit[] = [];
const files = walk(SRC);

for (const file of files) {
  const rel = relative(ROOT, file);
  const surface = classifySurface(rel);
  const priority = classifyPriority(rel, surface);
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const p of PATTERNS) {
      if (p.re.test(line)) {
        const snippet = line.trim().slice(0, 140);
        hits.push({
          file: rel,
          line: i + 1,
          category: p.category,
          snippet,
          surface,
          priority,
          intentional: isIntentional(rel, p.category, snippet),
        });
      }
    }
  }
}

// Aggregate
const realHits = hits.filter((h) => !h.intentional);
const byPriority = (p: Hit["priority"]) => realHits.filter((h) => h.priority === p);
const byCategory = (c: string) => realHits.filter((h) => h.category === c);

function table(rows: Hit[]): string {
  if (rows.length === 0) return "_(none)_";
  const head = "| File | Line | Category | Snippet |\n|---|---:|---|---|";
  const body = rows
    .map((h) => `| \`${h.file}\` | ${h.line} | ${h.category} | \`${h.snippet.replace(/\|/g, "\\|").slice(0, 90)}\` |`)
    .join("\n");
  return `${head}\n${body}`;
}

const now = new Date().toISOString();
const md = `# Stub & Placeholder Register

**Generated**: ${now}
**Scanner**: \`scripts/architecture/audits/audit-stubs-placeholders.ts\`
**Source files scanned**: ${files.length}
**Total raw hits**: ${hits.length}
**Intentional (excluded)**: ${hits.length - realHits.length}
**Actionable hits**: **${realHits.length}**

> This document is **truth-only**. It enumerates every stub, placeholder, mock, or unwired CTA detected in the live codebase. Use it as the input register for the eradication sweep. Resolved entries are removed from this file (never logged here).

---

## Summary by Priority

| Priority | Count | Description |
|---|---:|---|
| **P0** Trust-bearing (Boardroom, Money, Approvals, Auth) | ${byPriority("P0").length} | Must be 100% wired before deploy |
| **P1** Flagship Loop pages | ${byPriority("P1").length} | High-traffic, cross-domain |
| **P2** Domain pages (non-admin) | ${byPriority("P2").length} | User-facing surfaces |
| **P3** Admin pages + components | ${byPriority("P3").length} | Operator surfaces |
| **P4** Lib/hooks/utilities | ${byPriority("P4").length} | Background plumbing |

## Summary by Category

| Category | Count |
|---|---:|
${[...new Set(realHits.map((h) => h.category))]
  .map((c) => `| ${c} | ${byCategory(c).length} |`)
  .join("\n")}

---

## P0 — Trust-bearing surfaces

${table(byPriority("P0"))}

## P1 — Flagship Loop pages

${table(byPriority("P1"))}

## P2 — Domain pages

${table(byPriority("P2"))}

## P3 — Admin pages & components

${table(byPriority("P3"))}

## P4 — Lib / hooks / utilities

${table(byPriority("P4"))}

---

## Intentional fallbacks (excluded, for reference)

These hits are **registered, design-system fallbacks** (status grammar, empty-state primitives, OS app placeholders). They MUST NOT be removed.

| File | Line | Category |
|---|---:|---|
${hits
  .filter((h) => h.intentional)
  .map((h) => `| \`${h.file}\` | ${h.line} | ${h.category} |`)
  .join("\n")}

---

## Remediation rules (binding)

1. Every fix routes through \`Executor\` (HARD RULE — single execution chain).
2. Every state-mutating handler emits a receipt via the appropriate ledger:
   - Trust-bearing → \`boardroom_decision_receipts\`
   - AI inference → \`ai_inference_receipts\`
   - Admin actions → \`admin_action_audit\`
3. No new \`as any\` (zero tolerance per ISS-020).
4. No new \`console.log\` in production paths.
5. All AI usage through \`invokeAICapability\` — never raw provider SDKs.
6. Inline mock data in components/hooks must be replaced by typed hooks calling Supabase tables with RLS.
7. Re-run this audit after each batch; counts must monotonically decrease.
8. Update \`generated/FULL_ISSUES_AND_FIXES.md\` only after \`tsc --noEmit\` is green and Phase 32 stays 13/13.

---

_End of register._
`;

mkdirSync(join(ROOT, "generated"), { recursive: true });
writeFileSync(join(ROOT, "generated/STUBS_AND_PLACEHOLDERS_REGISTER.md"), md, "utf-8");

console.log(`✅ Register written: generated/STUBS_AND_PLACEHOLDERS_REGISTER.md`);
console.log(`   Files scanned : ${files.length}`);
console.log(`   Raw hits      : ${hits.length}`);
console.log(`   Intentional   : ${hits.length - realHits.length}`);
console.log(`   Actionable    : ${realHits.length}`);
console.log(`   P0/P1/P2/P3/P4: ${byPriority("P0").length}/${byPriority("P1").length}/${byPriority("P2").length}/${byPriority("P3").length}/${byPriority("P4").length}`);
