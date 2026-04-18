#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 7 Verification: Page Consolidation Results
//
// Aggregates all consolidation-related signals into a single
// truth artifact (PAGE_VERIFICATION_RESULTS.md + .json):
//   • Page audit results
//   • Redirect coverage
//   • Experimental isolation
//   • Admin route coherence
//   • Page registry completeness
//   • Build smoke (tsc --noEmit)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = "generated/page-consolidation";

interface CheckResult {
  name: string;
  ok: boolean;
  durationMs: number;
  output: string;
}

function runCheck(name: string, cmd: string): CheckResult {
  const start = Date.now();
  let ok = true;
  let output = "";
  try {
    output = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    ok = false;
    output = (e as { stdout?: string; stderr?: string }).stdout ?? "" +
      (e as { stderr?: string }).stderr ?? String(e);
  }
  return { name, ok, durationMs: Date.now() - start, output: output.split("\n").slice(-15).join("\n") };
}

const checks: CheckResult[] = [
  runCheck("audit", "npx tsx scripts/architecture/audits/page-consolidation-audit.ts"),
  runCheck("admin-classification-coverage", "npx tsx scripts/architecture/checks/check-admin-page-classification-coverage.ts"),
  runCheck("admin-domain-budget", "npx tsx scripts/architecture/checks/check-admin-domain-budget.ts"),
  runCheck("admin-route-coherence", "npx tsx scripts/architecture/checks/check-admin-route-coherence.ts"),
  runCheck("redirect-coverage", "npx tsx scripts/architecture/checks/check-redirect-coverage.ts"),
  runCheck("experimental-isolation", "npx tsx scripts/architecture/checks/check-experimental-isolation.ts"),
  runCheck("page-registry-completeness", "npx tsx scripts/architecture/checks/check-page-registry-completeness.ts"),
  runCheck("typecheck", "npx tsc --noEmit"),
];

const allOk = checks.every((c) => c.ok);
const generatedAt = new Date().toISOString();

const md = `# Page Verification Results
> Generated: ${generatedAt}
> Source: \`scripts/architecture/audits/page-verification-runner.ts\`
> Status: ${allOk ? "✅ **ALL CHECKS PASS**" : "❌ Some checks failed"}

## Summary

| Check | Result | Duration |
|---|---|---:|
${checks.map((c) => `| \`${c.name}\` | ${c.ok ? "✅ pass" : "❌ fail"} | ${c.durationMs}ms |`).join("\n")}

## Per-check tail output

${checks.map((c) => `### ${c.name}

\`\`\`
${c.output.trim()}
\`\`\`
`).join("\n")}
`;

const json = {
  generatedAt,
  ok: allOk,
  checks: checks.map((c) => ({ name: c.name, ok: c.ok, durationMs: c.durationMs })),
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUTPUT_DIR, "PAGE_VERIFICATION_RESULTS.md"), md);
fs.writeFileSync(path.join(OUTPUT_DIR, "page-verification-results.json"), JSON.stringify(json, null, 2));

console.log(`\n${allOk ? "✅" : "❌"} Page consolidation verification: ${checks.filter(c => c.ok).length}/${checks.length} passed.`);
console.log(`   → ${OUTPUT_DIR}/PAGE_VERIFICATION_RESULTS.md`);
process.exit(allOk ? 0 : 1);
