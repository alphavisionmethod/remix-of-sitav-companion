#!/usr/bin/env -S bun run
// ════════════════════════════════════════════════════════════
// SITA OS — Trust Action Manifest Freshness Check (Phase 8)
// ════════════════════════════════════════════════════════════
// Verifies that public/generated/trust-action-registry.json is
// in sync with the in-code registry. CI fails if a registry
// change was committed without re-running the manifest emitter.
//
// Usage:
//   bun scripts/architecture/check-trust-action-manifest.ts

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  TRUST_ACTION_LIST,
  type TrustActionPreset,
} from "../../src/modules/_trust/registry/trust-action-registry";

const MANIFEST_PATH = resolve("public/generated/trust-action-registry.json");

function canonicalize(action: TrustActionPreset): string {
  // Stable string form, key-sorted, ignores prop ordering.
  return JSON.stringify({
    description: action.description,
    key: action.key,
    label: action.label,
    pillar: action.pillar,
    requireApproval: action.requireApproval,
    reversible: action.reversible,
    riskTier: action.riskTier,
  });
}

function main(): number {
  if (!existsSync(MANIFEST_PATH)) {
    console.error(
      `✗ Manifest missing at ${MANIFEST_PATH}.\n` +
        `  Run: bun scripts/architecture/emit-trust-action-manifest.ts`,
    );
    return 1;
  }

  const raw = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as {
    actions?: TrustActionPreset[];
  };
  const onDisk = (raw.actions ?? []).map(canonicalize).sort();
  const inCode = TRUST_ACTION_LIST.map(canonicalize).sort();

  if (onDisk.length !== inCode.length) {
    console.error(
      `✗ Manifest out of sync — disk has ${onDisk.length} actions, code has ${inCode.length}.\n` +
        `  Run: bun scripts/architecture/emit-trust-action-manifest.ts`,
    );
    return 1;
  }

  for (let i = 0; i < onDisk.length; i++) {
    if (onDisk[i] !== inCode[i]) {
      console.error(
        `✗ Manifest entry mismatch at index ${i}:\n` +
          `  disk: ${onDisk[i]}\n` +
          `  code: ${inCode[i]}\n` +
          `  Run: bun scripts/architecture/emit-trust-action-manifest.ts`,
      );
      return 1;
    }
  }

  console.log(
    `✓ Trust action manifest is in sync (${inCode.length} actions).`,
  );
  return 0;
}

process.exit(main());