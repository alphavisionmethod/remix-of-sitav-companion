/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — No Inline Empty States (C-018)
// Forbids raw inline empty-state divs in src/pages/**.
// All empty states must use canonical primitives:
//   - @/components/sita/EmptyState
//   - @/components/sita/PremiumEmptyState
//   - @/components/sita/ConciergeEmptyState  (legacy alias of concierge/)
//   - @/components/concierge/ConciergeEmptyState
//   - @/components/primitives/feedback/EmptyState
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PAGES_DIR = join(ROOT, "src", "pages");

// Pattern: vertically centered, padded, centered text — the classic empty-state shape.
// Match: flex flex-col items-center justify-center py-1X ... text-center
const INLINE_EMPTY_RE =
  /flex\s+flex-col\s+items-center\s+justify-center[^"'`]*py-\d{2}[^"'`]*text-center/;

// Files allowed to define the canonical primitives themselves.
const ALLOWED_FILES = new Set<string>([
  "src/components/sita/EmptyState.tsx",
  "src/components/sita/EmptyStateCard.tsx",
  "src/components/sita/EmptyStateCTA.tsx",
  "src/components/sita/PremiumEmptyState.tsx",
  "src/components/sita/ConciergeEmptyState.tsx",
  "src/components/concierge/ConciergeEmptyState.tsx",
  "src/components/primitives/feedback/EmptyState.tsx",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(tsx|jsx)$/.test(name)) out.push(full);
  }
  return out;
}

const violations: { file: string; line: number; snippet: string }[] = [];
const files = walk(PAGES_DIR);

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (ALLOWED_FILES.has(rel)) continue;
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (INLINE_EMPTY_RE.test(line)) {
      // Heuristic: skip if line is part of a canonical-primitive import call.
      if (/EmptyState|PremiumEmptyState|ConciergeEmptyState/.test(line)) continue;
      violations.push({ file: rel, line: i + 1, snippet: line.trim().slice(0, 140) });
    }
  }
}

console.log(`Inline empty-state scan: ${files.length} page files checked`);

if (violations.length > 0) {
  console.error(`❌ Found ${violations.length} inline empty-state pattern(s) in src/pages/**:`);
  for (const v of violations) {
    console.error(`   - ${v.file}:${v.line}  ${v.snippet}`);
  }
  console.error("\n   Use the canonical primitive instead:");
  console.error("     import { EmptyState } from '@/components/sita/EmptyState';");
  console.error("     import { PremiumEmptyState } from '@/components/sita/PremiumEmptyState';");
  process.exit(1);
}

console.log("✅ Pass — no inline empty states in src/pages/**");
