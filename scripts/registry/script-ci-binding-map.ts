#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Script CI Binding Map
// Maps scripts to their CI execution phases
// ═══════════════════════════════════════════════════════════════

import type { CIPhase } from "./script-taxonomy";

export interface CIBinding {
  scriptPattern: string;
  phase: CIPhase;
  required: boolean;
  blocksMerge: boolean;
  blocksRelease: boolean;
}

export const CI_BINDINGS: CIBinding[] = [
  // ── PR-blocking checks ──
  { scriptPattern: "scripts/architecture/assertions/*", phase: "pr", required: true, blocksMerge: true, blocksRelease: true },
  { scriptPattern: "scripts/architecture/checks/*", phase: "pr", required: true, blocksMerge: true, blocksRelease: true },
  { scriptPattern: "scripts/contracts/checks/*", phase: "pr", required: true, blocksMerge: true, blocksRelease: true },
  { scriptPattern: "scripts/manifests/validate/*", phase: "pr", required: true, blocksMerge: true, blocksRelease: true },
  { scriptPattern: "scripts/manifests/generate/*", phase: "pr", required: true, blocksMerge: false, blocksRelease: true },
  { scriptPattern: "scripts/runtime/checks/*", phase: "pr", required: true, blocksMerge: true, blocksRelease: true },
  { scriptPattern: "scripts/db/checks/*", phase: "pr", required: true, blocksMerge: true, blocksRelease: true },
  { scriptPattern: "scripts/security/checks/*", phase: "pr", required: true, blocksMerge: true, blocksRelease: true },

  // ── Nightly ──
  { scriptPattern: "scripts/manifests/reports/*", phase: "nightly", required: false, blocksMerge: false, blocksRelease: false },
  { scriptPattern: "scripts/runtime/generate/*", phase: "nightly", required: false, blocksMerge: false, blocksRelease: true },
  { scriptPattern: "scripts/db/generate/*", phase: "nightly", required: false, blocksMerge: false, blocksRelease: false },

  // ── Release gates ──
  { scriptPattern: "scripts/release/checks/*", phase: "release-gate", required: true, blocksMerge: false, blocksRelease: true },
  { scriptPattern: "scripts/deployment/checks/*", phase: "deploy-gate", required: true, blocksMerge: false, blocksRelease: true },

  // ── Support drills ──
  { scriptPattern: "scripts/support/drills/*", phase: "support-drill", required: false, blocksMerge: false, blocksRelease: false },
  { scriptPattern: "scripts/support/coverage/*", phase: "nightly", required: false, blocksMerge: false, blocksRelease: false },

  // ── Local only ──
  { scriptPattern: "scripts/bootstrap/*", phase: "local-only", required: false, blocksMerge: false, blocksRelease: false },
  { scriptPattern: "scripts/codemods/*", phase: "local-only", required: false, blocksMerge: false, blocksRelease: false },
  { scriptPattern: "scripts/legacy/*", phase: "local-only", required: false, blocksMerge: false, blocksRelease: false },

  // ── Manual ops ──
  { scriptPattern: "scripts/security/rotation/*", phase: "manual", required: false, blocksMerge: false, blocksRelease: false },
  { scriptPattern: "scripts/support/recovery/*", phase: "manual", required: false, blocksMerge: false, blocksRelease: false },
];

export function getCIPhase(scriptPath: string): CIPhase {
  const normalized = scriptPath.replace(/\\/g, "/");
  for (const binding of CI_BINDINGS) {
    const pattern = binding.scriptPattern.replace("*", "");
    if (normalized.includes(pattern.replace("*", ""))) return binding.phase;
  }
  return "local-only";
}

console.log(`✅ script-ci-binding-map: ${CI_BINDINGS.length} CI bindings defined across ${new Set(CI_BINDINGS.map(b => b.phase)).size} phases`);
