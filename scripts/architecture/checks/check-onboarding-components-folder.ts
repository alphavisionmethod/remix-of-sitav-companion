#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 23 — Onboarding components folder gate (BLOCK-tier).
// Asserts that src/components/onboarding/ exists as the canonical
// reusable primitives folder for the personalization ceremony, and
// that screen pages actually import from it. Drift-prevents the
// audit-flagged P2 ("folder does not exist; UI lives entirely under
// pages/").
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const issues: Array<{ severity: string; area: string; message: string }> = [];

const FOLDER = "src/components/onboarding";
const SCREENS_DIR = "src/pages/revenue-office/onboarding/screens";
const MIN_PRIMITIVES = 5;
const MIN_CONSUMERS = 5;
const REQUIRED_PRIMITIVES = [
  "OnboardingShell.tsx",
  "OnboardingProgress.tsx",
  "OnboardingChoiceCard.tsx",
  "OnboardingStepHeader.tsx",
  "OnboardingFooterNav.tsx",
  "OnboardingMomentReveal.tsx",
];

let primitiveCount = 0;
let hasBarrel = false;
const presentPrimitives: string[] = [];

if (!existsSync(FOLDER)) {
  issues.push({ severity: "error", area: "folder", message: `${FOLDER} does not exist` });
} else if (!statSync(FOLDER).isDirectory()) {
  issues.push({ severity: "error", area: "folder", message: `${FOLDER} is not a directory` });
} else {
  const entries = readdirSync(FOLDER);
  const tsxFiles = entries.filter((f) => f.endsWith(".tsx"));
  primitiveCount = tsxFiles.length;
  hasBarrel = entries.includes("index.ts") || entries.includes("index.tsx");
  for (const req of REQUIRED_PRIMITIVES) {
    if (entries.includes(req)) presentPrimitives.push(req);
    else issues.push({ severity: "error", area: "primitive-missing", message: `expected primitive ${req} not found in ${FOLDER}` });
  }
  if (!hasBarrel) {
    issues.push({ severity: "error", area: "barrel", message: `${FOLDER}/index.ts barrel export missing` });
  }
  if (primitiveCount < MIN_PRIMITIVES) {
    issues.push({
      severity: "error",
      area: "primitive-count",
      message: `expected ≥ ${MIN_PRIMITIVES} primitive .tsx files, found ${primitiveCount}`,
    });
  }
}

let consumerCount = 0;
const consumers: string[] = [];
if (!existsSync(SCREENS_DIR)) {
  issues.push({ severity: "error", area: "screens", message: `${SCREENS_DIR} not found` });
} else {
  const screenFiles = readdirSync(SCREENS_DIR).filter((f) => f.endsWith(".tsx"));
  for (const f of screenFiles) {
    const src = readFileSync(join(SCREENS_DIR, f), "utf8");
    if (src.includes('from "@/components/onboarding"') || src.includes("from '@/components/onboarding'")) {
      consumerCount++;
      consumers.push(f);
    }
  }
  if (consumerCount < MIN_CONSUMERS) {
    issues.push({
      severity: "error",
      area: "consumer-imports",
      message: `expected ≥ ${MIN_CONSUMERS} screens importing from @/components/onboarding, found ${consumerCount}`,
    });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync(
  "generated/onboarding-components-folder-report.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      gate: "onboarding-components-folder",
      ok,
      errorCount,
      warningCount,
      folder: FOLDER,
      screensDir: SCREENS_DIR,
      primitiveCount,
      hasBarrel,
      presentPrimitives,
      consumerCount,
      consumers,
      issues,
    },
    null,
    2,
  ),
);
console.log(`${ok ? "✅" : "❌"} onboarding-components-folder: ${errorCount} errors, ${warningCount} warnings`);
console.log(`   primitives=${primitiveCount} (barrel=${hasBarrel}), consumers=${consumerCount}`);
process.exit(ok ? 0 : 1);
