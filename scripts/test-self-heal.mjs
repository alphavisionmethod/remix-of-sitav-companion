#!/usr/bin/env node
// T0→T4 orchestrator. Default: T0–T2 only. Flags: --t3, --pr, --t4, --llm, --dry.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { runStrategy } from "./lib/heal-strategies/index.mjs";
import { emitReceipt } from "./lib/heal-receipt.mjs";

const args = new Set(process.argv.slice(2));
const FLAGS = {
  t3: args.has("--t3") || args.has("--full"),
  pr: args.has("--pr"),
  t4: args.has("--t4") && process.env.SITA_HEAL_T4 === "1",
  llm: args.has("--llm"),
  dry: args.has("--dry"),
  allowSnapshots: args.has("--allow-snapshot-updates"),
};

console.log(`[heal] flags: ${JSON.stringify(FLAGS)}`);

// Step 1: triage
try { execSync("node scripts/test-triage.mjs", { stdio: "inherit" }); }
catch (e) { console.error("[heal] triage failed; aborting."); process.exit(1); }

const triage = JSON.parse(readFileSync("coverage/triage/triage-report.json", "utf8"));
const PATCH_DIR = path.resolve("coverage/triage/proposed-patches");
mkdirSync(PATCH_DIR, { recursive: true });

let healed = 0, proposed = 0, refused = 0;
for (const t of triage.triaged) {
  if (t.tier === "REFUSAL") { refused++; continue; }
  const allowedTier = t.tier === "T1" || t.tier === "T2"
    || (t.tier === "T3" && FLAGS.t3)
    || (t.tier === "T4" && FLAGS.t4);
  if (!allowedTier) {
    console.log(`[heal] skip ${t.file} (tier ${t.tier} not enabled)`);
    continue;
  }
  if (FLAGS.dry) {
    console.log(`[heal] DRY would run ${t.action} on ${t.file}`);
    continue;
  }
  const result = runStrategy(t.action, { file: t.file, allow: FLAGS.allowSnapshots });
  const id = emitReceipt({
    file: t.file, failureClass: t.cls, tier: t.tier, action: t.action,
    before: { signals: t.signals }, after: result,
  });
  console.log(`[heal] ${t.tier} ${t.action} on ${t.file} → applied=${result.applied} (receipt ${id})`);
  if (result.applied) healed++;
  if (t.tier === "T3") {
    const diffPath = path.join(PATCH_DIR, `${path.basename(t.file)}.proposed.diff`);
    writeFileSync(diffPath,
      `# Proposed patch for ${t.file}\n# Class: ${t.cls}\n# Action: ${t.action}\n# DO NOT MERGE WITHOUT REVIEW\n# Signals: ${(t.signals||[]).join(", ")}\n`);
    proposed++;
  }
}

console.log(`[heal] healed=${healed} proposed=${proposed} refused=${refused}`);

if (FLAGS.llm) {
  console.log("[heal] T5 LLM RCA → see scripts/test-llm-rca.mjs (advisory only, never applied).");
}

if (FLAGS.pr && proposed > 0) {
  console.log("[heal] --pr requested; integrate with `gh pr create --draft` in CI (skipped locally).");
}
