#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Capability Enforcement Check
// Verifies that runtime-sensitive APIs exist behind capability gates.
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const RUNTIME_SENSITIVE_PATTERNS = [
  { pattern: /window\.electron\b/, capability: "any-electron-bridge" },
  { pattern: /window\.showOpenFilePicker/, capability: "filesystem-local" },
  { pattern: /new\s+Notification\(/, capability: "notifications-native" },
  { pattern: /navigator\.serviceWorker\.register/, capability: "service-worker-cache" },
];

const GATE_MARKERS = [
  "useCapability",
  "useFeatureRuntimeTier",
  "TierGate",
  "checkDesktopFeature",
  "isElectronRuntime",
  "isApplianceRuntime",
  "isDesktopHost",
  "RuntimeFallback",
  "withCapabilityCheck",
];

const sourceFiles = [
  ...scanDir("src/components", [".tsx", ".ts"]),
  ...scanDir("src/pages", [".tsx", ".ts"]),
  ...scanDir("src/hooks", [".tsx", ".ts"]),
];

let scanned = 0;
let gated = 0;

for (const file of sourceFiles) {
  // Skip the gating implementation itself
  if (file.includes("/runtime/") || file.includes("electron-bridge") || file.includes("desktop-feature-gates")) continue;
  const content = fs.readFileSync(file, "utf-8");
  for (const { pattern, capability } of RUNTIME_SENSITIVE_PATTERNS) {
    if (pattern.test(content)) {
      scanned++;
      const hasGate = GATE_MARKERS.some((m) => content.includes(m));
      if (hasGate) {
        gated++;
      } else {
        vc.add(file, "ungated-capability", `Uses runtime-sensitive API for "${capability}" without a capability gate`, "warning");
      }
    }
  }
}

console.log(`  🛡️  ${gated}/${scanned} runtime-sensitive call sites have a capability gate`);

vc.report("check-runtime-capability-enforcement");
vc.exitIfErrors();
