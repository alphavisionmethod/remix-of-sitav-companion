#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Launch Honesty Check
// Scans for forbidden capability claims in components.
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const FORBIDDEN_PHRASES: Array<{ phrase: RegExp; reason: string }> = [
  { phrase: /\bwe (?:are|run as) your operating system\b/i, reason: "Web/desktop tiers must not claim OS authority" },
  { phrase: /\bowns? the host\b/i, reason: "Host ownership claim — must be qualified" },
  { phrase: /\bkernel-level access\b/i, reason: "Kernel-level claims require appliance with real implementation" },
  { phrase: /\bbespoke (?:custom )?kernel\b/i, reason: "Bespoke kernel claim must be backed by real implementation" },
  { phrase: /\b(?:true|real) (?:native|operating) system\b/i, reason: "OS-truth claim must be tier-honest" },
];

const componentFiles = scanDir("src/components", [".tsx"]);
const pageFiles = scanDir("src/pages", [".tsx"]);
const sourceFiles = [...componentFiles, ...pageFiles];

let scanned = 0;
let flagged = 0;

for (const file of sourceFiles) {
  scanned++;
  const content = fs.readFileSync(file, "utf-8");
  for (const { phrase, reason } of FORBIDDEN_PHRASES) {
    const match = content.match(phrase);
    if (match) {
      flagged++;
      vc.add(file, "drift-claim", `Forbidden phrase "${match[0]}": ${reason}`, "warning");
    }
  }
}

console.log(`  📣 Scanned ${scanned} files, ${flagged} claims flagged for review`);

vc.report("check-launch-honesty");
vc.exitIfErrors();
