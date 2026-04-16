#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulated OS Truth Check
// Surfaces flagged in surface-simulation-rules must have disclosure
// markers (badges, comments, or TierGate gating).
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

interface SimRule {
  surfacePathPrefix: string;
  surfaceId: string;
  requiredMarker: RegExp;
  remediation: string;
}

const RULES: SimRule[] = [
  {
    surfacePathPrefix: "src/components/sita/boot/",
    surfaceId: "boot-sequence",
    requiredMarker: /(simulation|TierGate|useFeatureRuntimeTier|APPLIANCE_RUNTIME|RuntimeFallback|simulated)/i,
    remediation: "Boot UI must reference simulation context outside APPLIANCE_RUNTIME.",
  },
  {
    surfacePathPrefix: "src/components/sita/menu-bar/",
    surfaceId: "menu-bar",
    requiredMarker: /(useCapability|TierGate|isElectronRuntime|DESKTOP_HOST)/,
    remediation: "Menu bar must gate on `menu-bar` capability.",
  },
  {
    surfacePathPrefix: "src/components/sita/tray/",
    surfaceId: "tray-icon",
    requiredMarker: /(useCapability|TierGate|isElectronRuntime|DESKTOP_HOST)/,
    remediation: "Tray must gate on `tray-icon` capability.",
  },
];

let checked = 0;
let warnings = 0;

for (const rule of RULES) {
  if (!fs.existsSync(rule.surfacePathPrefix)) continue;
  const files = scanDir(rule.surfacePathPrefix, [".tsx", ".ts"]);
  for (const file of files) {
    checked++;
    const content = fs.readFileSync(file, "utf-8");
    if (!rule.requiredMarker.test(content)) {
      warnings++;
      vc.add(file, "missing-disclosure", `${rule.surfaceId} surface lacks tier disclosure. ${rule.remediation}`, "warning");
    }
  }
}

console.log(`  🎭 ${checked} simulated-surface files checked, ${warnings} missing disclosure`);

vc.report("check-simulated-os-truth");
vc.exitIfErrors();
