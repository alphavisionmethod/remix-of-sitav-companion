#!/usr/bin/env node
// T0+T1 — read sequential report, classify failures, emit triage report.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { classify } from "./lib/failure-classifier.mjs";

const SEQ = path.resolve("coverage/sequential-report.json");
const OUT_DIR = path.resolve("coverage/triage");
mkdirSync(OUT_DIR, { recursive: true });

if (!existsSync(SEQ)) {
  console.error(`[triage] No sequential report at ${SEQ}. Run 'npm run test:seq' first or pass --synthetic.`);
  if (!process.argv.includes("--synthetic")) process.exit(1);
}

const report = existsSync(SEQ) ? JSON.parse(readFileSync(SEQ, "utf8")) : { results: [] };
const failed = (report.results || []).filter((r) => r.status !== "pass" && r.status !== "passed");

const triaged = failed.map((r) => {
  const c = classify(r.stdout || "", r.stderr || "", r.exitCode ?? 1, r.file || "");
  return { file: r.file, duration: r.duration, ...c };
});

const summary = {
  generatedAt: new Date().toISOString(),
  totalFailed: failed.length,
  byClass: triaged.reduce((acc, t) => ((acc[t.cls] = (acc[t.cls] || 0) + 1), acc), {}),
  triaged,
};

writeFileSync(path.join(OUT_DIR, "triage-report.json"), JSON.stringify(summary, null, 2));

const md = [
  `# Test Triage Report`, ``, `Generated: ${summary.generatedAt}`,
  `Total failing files: **${summary.totalFailed}**`, ``,
  `## By failure class`, ...Object.entries(summary.byClass).map(([k, v]) => `- \`${k}\`: ${v}`),
  ``, `## Per-file root cause`, ``,
  ...triaged.map((t) =>
    `### \`${t.file}\`\n- **Class:** \`${t.cls}\` (confidence ${t.confidence?.toFixed?.(2) ?? "?"})\n- **Suggested tier:** ${t.tier}\n- **Suggested action:** ${t.action}\n- **Signals:** ${(t.signals || []).join(", ") || "—"}\n`
  ),
].join("\n");
writeFileSync(path.join(OUT_DIR, "triage-report.md"), md);

console.log(`[triage] ${summary.totalFailed} failing files classified.`);
console.log(`[triage] → coverage/triage/triage-report.{json,md}`);
