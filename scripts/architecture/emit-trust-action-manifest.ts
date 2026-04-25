#!/usr/bin/env -S bun run
// ════════════════════════════════════════════════════════════
// SITA OS — Trust Action Manifest Emitter (Phase 7)
// ════════════════════════════════════════════════════════════
// Serializes the in-code Trust Action Registry to a static JSON
// artifact under public/generated/. The artifact is consumed by:
//   - the AI capability proof matrix
//   - external Trust Center embeds
//   - audit tooling that needs a build-time snapshot of the
//     trust-gated mutation catalog without importing TS modules.
//
// Run via: bun scripts/architecture/emit-trust-action-manifest.ts

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  TRUST_ACTION_LIST,
  type TrustActionPreset,
} from "../../src/modules/_trust/registry/trust-action-registry";

interface Manifest {
  generatedAt: string;
  source: string;
  totals: {
    total: number;
    approvalGated: number;
    irreversible: number;
    byPillar: Record<string, number>;
    byRiskTier: Record<string, number>;
  };
  actions: TrustActionPreset[];
}

function buildManifest(): Manifest {
  const byPillar: Record<string, number> = {};
  const byRiskTier: Record<string, number> = {};
  for (const a of TRUST_ACTION_LIST) {
    byPillar[a.pillar] = (byPillar[a.pillar] ?? 0) + 1;
    byRiskTier[a.riskTier] = (byRiskTier[a.riskTier] ?? 0) + 1;
  }
  return {
    generatedAt: new Date().toISOString(),
    source: "src/modules/_trust/registry/trust-action-registry.ts",
    totals: {
      total: TRUST_ACTION_LIST.length,
      approvalGated: TRUST_ACTION_LIST.filter((a) => a.requireApproval).length,
      irreversible: TRUST_ACTION_LIST.filter((a) => !a.reversible).length,
      byPillar,
      byRiskTier,
    },
    actions: [...TRUST_ACTION_LIST],
  };
}

function main(): void {
  const out = resolve("public/generated");
  mkdirSync(out, { recursive: true });
  const target = resolve(out, "trust-action-registry.json");
  const manifest = buildManifest();
  writeFileSync(target, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(
    `✓ Wrote ${target} — ${manifest.totals.total} actions ` +
      `(${manifest.totals.approvalGated} approval-gated, ` +
      `${manifest.totals.irreversible} irreversible).`,
  );
}

main();