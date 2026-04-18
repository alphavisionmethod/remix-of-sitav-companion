#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 Gate 8: Launch Honesty Alignment
// Every doc claiming "DEPLOYABLE" / "production-ready" / "deployable=true" / "release-ready"
// MUST contain an `## Active Caveats` block in the same file.
import * as cp from "node:child_process";
import * as fs from "node:fs";

const QUALIFIER_REQUIRED = ["DEPLOYABLE", "production-ready", "deployable=true", "release-ready"];

const SCOPE = ["generated/", "docs/", "README.md"];

const ALLOWED = [
  /generated\/claim-safety-hardening\//,
  /scripts\/validation\//,
];

const flagged = new Set<string>();

for (const term of QUALIFIER_REQUIRED) {
  for (const path of SCOPE) {
    try {
      const out = cp.execSync(
        `grep -rln "${term}" ${path} --include="*.md" 2>/dev/null || true`,
        { encoding: "utf-8" },
      );
      out
        .split("\n")
        .filter(Boolean)
        .forEach((f) => {
          if (!ALLOWED.some((rx) => rx.test(f))) flagged.add(f);
        });
    } catch {}
  }
}

let violations: string[] = [];
for (const f of flagged) {
  try {
    const content = fs.readFileSync(f, "utf-8");
    if (!/## Active Caveats/.test(content)) {
      violations.push(`${f}: missing "## Active Caveats" block`);
    }
  } catch {}
}

const ok = violations.length === 0;
console.log(`${ok ? "✅" : "❌"} launch-honesty-alignment: ${flagged.size} claim-bearing docs, ${violations.length} missing caveats`);
violations.slice(0, 15).forEach((v) => console.error(`   ${v}`));
process.exit(ok ? 0 : 1);
