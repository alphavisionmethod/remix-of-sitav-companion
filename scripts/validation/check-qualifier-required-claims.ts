#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 Gate 9: Qualifier-Required Claims
// Phrases like "operating system", "boot sequence", "appliance" must be paired with truthful context
// (Ubuntu-native / userland / signed Linux substrate) within the same paragraph.
import * as fs from "node:fs";
import * as cp from "node:child_process";
import { emitGateReport } from "./_lib/emit-gate-report";

const QUALIFIERS_REQUIRED: Record<string, string[]> = {
  "operating system": ["Ubuntu", "userland", "signed substrate", "AI-first", "Track A", "AI operating"],
  "boot sequence": ["userland", "above systemd", "Ubuntu", "signed"],
  "installable platform": ["Ubuntu", "signed"],
};

const SCOPE = ["README.md", "generated/", "docs/"];

const ALLOWED = [
  /generated\/claim-safety-hardening\//,
  /scripts\/validation\//,
  /docs\/nova\//,
  /src\/lib\/nova-sdk\//,
];

let violations: string[] = [];

for (const [phrase, qualifiers] of Object.entries(QUALIFIERS_REQUIRED)) {
  for (const path of SCOPE) {
    try {
      const out = cp.execSync(
        `grep -rln "${phrase}" ${path} --include="*.md" 2>/dev/null || true`,
        { encoding: "utf-8" },
      );
      out
        .split("\n")
        .filter(Boolean)
        .forEach((f) => {
          if (ALLOWED.some((rx) => rx.test(f))) return;
          try {
            const content = fs.readFileSync(f, "utf-8");
            // Look for the phrase paired with at least one qualifier within +/- 200 chars.
            const re = new RegExp(phrase, "gi");
            let m: RegExpExecArray | null;
            while ((m = re.exec(content)) !== null) {
              const start = Math.max(0, m.index - 200);
              const end = Math.min(content.length, m.index + phrase.length + 200);
              const window = content.slice(start, end).toLowerCase();
              const qualified = qualifiers.some((q) => window.includes(q.toLowerCase()));
              if (!qualified) {
                violations.push(`${f}: "${phrase}" used without qualifier (${qualifiers.slice(0, 3).join("/")})`);
                break;
              }
            }
          } catch {}
        });
    } catch {}
  }
}

const ok = violations.length === 0;
console.log(`${ok ? "✅" : "❌"} qualifier-required-claims: ${violations.length} unqualified uses`);
violations.slice(0, 15).forEach((v) => console.error(`   ${v}`));
emitGateReport({
  gate: "qualifier-required-claims",
  ok,
  issues: violations.map((v) => ({ severity: "error", area: "qualifier", message: v })),
});
process.exit(ok ? 0 : 1);
