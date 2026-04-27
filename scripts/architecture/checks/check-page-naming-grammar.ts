#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// IA Phase 7 — Page Naming-Grammar Lint
// ───────────────────────────────────────────────────────────────
// Bans the legacy IA suffixes `Center` and `Hub` from any
// manifest descriptor's `component` class name UNLESS the
// descriptor explicitly opts out via `legacyNameAllowed: true`.
//
// Documented exemptions (real wealth-management vocabulary):
//   • Suffix `Office` (FamilyOffice, RiskOffice, PortfolioOffice…)
//   • Suffix `Room`   (DealRoom, WarRoom, CatalystWarRoom…)
// These are listed in ALLOWED_INDUSTRY_SUFFIXES on page-role.ts
// and never trip the lint regardless of `legacyNameAllowed`.
//
// The lint also forbids legacy suffixes leaking into sidebar
// `label` strings unless the descriptor opts out.
//
// Exits non-zero on any violation. Designed for CI + the wrapper
// test src/__tests__/ia/phase-7-naming-grammar.test.ts.
// ═══════════════════════════════════════════════════════════════
import { ALL_IA_DESCRIPTORS } from "../../../src/platform/ia/module-ia-manifest";
import {
  BANNED_NAME_SUFFIXES,
} from "../../../src/platform/ia/page-role";
import type { PageDescriptor } from "../../../src/platform/ia/page-role";

function endsWithBannedSuffix(name: string): string | null {
  for (const sfx of BANNED_NAME_SUFFIXES) {
    if (name.endsWith(sfx)) return sfx;
  }
  return null;
}

/** Label hits any banned suffix as a stand-alone word (case-insensitive). */
function labelHasBannedWord(label: string): string | null {
  for (const sfx of BANNED_NAME_SUFFIXES) {
    const rx = new RegExp(`(^|\\s)${sfx}(\\s|$|\\.|,)`, "i");
    if (rx.test(label)) return sfx;
  }
  return null;
}

const violations: string[] = [];

for (const d of ALL_IA_DESCRIPTORS as readonly PageDescriptor[]) {
  const tag = `[${d.pillar}/${d.id}]`;

  // Component class-name suffix check
  const compHit = endsWithBannedSuffix(d.component);
  if (compHit && !d.legacyNameAllowed) {
    violations.push(
      `${tag} component "${d.component}" ends in banned suffix "${compHit}". ` +
      `Rename to <Name>Workspace / <Name>Console / <Name>Overview, ` +
      `OR opt-out by setting legacyNameAllowed: true in module-ia-manifest.ts ` +
      `with a 'notes' rationale.`,
    );
  }

  // Sidebar label word check
  const labelHit = labelHasBannedWord(d.label);
  if (labelHit && !d.legacyNameAllowed) {
    violations.push(
      `${tag} sidebar label "${d.label}" contains banned word "${labelHit}". ` +
      `Rename the label OR opt-out by setting legacyNameAllowed: true.`,
    );
  }

  // Legacy opt-outs MUST carry a 'notes' rationale (audit trail).
  if (d.legacyNameAllowed && !(d.notes && d.notes.trim().length > 0)) {
    violations.push(
      `${tag} legacyNameAllowed=true but no 'notes' rationale. ` +
      `Document why this name is kept (industry vocabulary / migration in progress / etc.).`,
    );
  }
}

if (violations.length > 0) {
  console.error("\n❌ Page naming-grammar lint failed:\n");
  for (const v of violations) console.error("  • " + v);
  console.error(`\nTotal: ${violations.length} violation(s) across ${ALL_IA_DESCRIPTORS.length} descriptors.\n`);
  process.exit(1);
}

console.log(
  `✅ Page naming-grammar lint clean (${ALL_IA_DESCRIPTORS.length} descriptors; banned suffixes: ${BANNED_NAME_SUFFIXES.join(", ")}).`,
);
process.exit(0);