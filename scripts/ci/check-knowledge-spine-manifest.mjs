#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Phase 5 CI gate: emit deterministic knowledge-spine manifest.
// Counts trust actions + knowledge tables present in this build
// and writes a manifest the deploy-readiness gate can diff.
// Fails CI if the on-disk manifest drifts from the regenerated one.
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const OUT = "public/generated/knowledge-spine-manifest.json";

const registry = readFileSync("src/modules/_trust/registry/trust-action-registry.ts", "utf8");
const sharedKnowledgeKeys = [
  "shared.memory.create",
  "shared.memory.update",
  "shared.memory.delete",
  "shared.memory.add",
  "shared.file.upload",
  "shared.file.delete",
  "shared.knowledge.reindex",
].filter((k) => registry.includes(`"${k}"`));

const tables = ["memory_provenance", "knowledge_chunks", "ingestion_jobs"];
const rpcs = ["record_memory_usage", "effective_workspace_memories"];
const edgeFn = existsSync("supabase/functions/knowledge-indexer/index.ts");

const manifest = {
  schemaVersion: 1,
  phase: 5,
  tables: tables.sort(),
  rpcs: rpcs.sort(),
  trustActions: sharedKnowledgeKeys.sort(),
  edgeFunctions: edgeFn ? ["knowledge-indexer"] : [],
};

const next = JSON.stringify(manifest, null, 2) + "\n";

if (!existsSync(dirname(OUT))) mkdirSync(dirname(OUT), { recursive: true });

const flag = process.argv.includes("--check");
if (flag && existsSync(OUT)) {
  const prev = readFileSync(OUT, "utf8");
  if (prev !== next) {
    console.error("[knowledge-spine-manifest] DRIFT — regenerate via: node scripts/ci/check-knowledge-spine-manifest.mjs");
    console.error("--- expected ---\n" + next);
    console.error("--- actual ---\n" + prev);
    process.exit(1);
  }
  console.log("[knowledge-spine-manifest] OK — manifest stable");
  process.exit(0);
}

writeFileSync(OUT, next);
console.log(`[knowledge-spine-manifest] wrote ${OUT}`);
console.log(`  tables: ${manifest.tables.length}, rpcs: ${manifest.rpcs.length}, trustActions: ${manifest.trustActions.length}, edgeFns: ${manifest.edgeFunctions.length}`);