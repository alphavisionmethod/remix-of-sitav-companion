/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — CTA Wiring (Phase 9)
// Scans registered pages for placeholder CTAs:
//   - onClick={() => {}}
//   - href="#" (without explicit comment)
//   - TODO / FIXME inside JSX
// Severity: warning (does not block release, but reported).
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync } from "node:fs";
import { PAGE_STATE_REGISTRY } from "../../../src/lib/reality/page-state-registry";

interface Hit {
  file: string;
  line: number;
  pattern: string;
  snippet: string;
}

const PATTERNS: { name: string; re: RegExp }[] = [
  { name: "empty-onclick",   re: /onClick=\{\(\)\s*=>\s*\{\s*\}\}/ },
  { name: "noop-handler",    re: /onClick=\{\(\)\s*=>\s*null\}/ },
  { name: "placeholder-href", re: /href=["']#["']/ },
  { name: "todo-comment",    re: /\/\/\s*TODO|\/\*\s*TODO|\/\/\s*FIXME/i },
  { name: "alert-stub",      re: /\balert\(["']/ },
];

const hits: Hit[] = [];

for (const entry of PAGE_STATE_REGISTRY) {
  if (!existsSync(entry.file)) continue;
  const content = readFileSync(entry.file, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const p of PATTERNS) {
      if (p.re.test(line)) {
        hits.push({ file: entry.file, line: i + 1, pattern: p.name, snippet: line.trim().slice(0, 120) });
      }
    }
  }
}

console.log(`CTA wiring scan: ${PAGE_STATE_REGISTRY.length} pages scanned, ${hits.length} placeholder hits`);
if (hits.length > 0) {
  console.warn("⚠️  Placeholder CTAs detected:");
  for (const h of hits) {
    console.warn(`   - ${h.file}:${h.line} [${h.pattern}] ${h.snippet}`);
  }
  // Warning gate — exit 0
}
console.log("✅ Pass (warnings only)");
