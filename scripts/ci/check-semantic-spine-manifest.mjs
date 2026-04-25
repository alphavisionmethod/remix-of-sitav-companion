#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Phase 6 CI gate: emit deterministic semantic-spine manifest.
// Tracks vector embedding wiring, voice-spine surface, and
// the orchestrator's semantic retrieval RPCs/trust actions.
// Fails CI if the on-disk manifest drifts from the regenerated one.
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const OUT = "public/generated/semantic-spine-manifest.json";

const registry = readFileSync("src/modules/_trust/registry/trust-action-registry.ts", "utf8");
const semanticTrustKeys = [
  "shared.knowledge.reindex",
  "shared.voice.session.start",
].filter((k) => registry.includes(`"${k}"`));

const tables = ["voice_sessions", "voice_transcripts"];
const augmentedTables = ["knowledge_chunks", "memory_provenance"]; // gained vector(768)
const rpcs = [
  "semantic_workspace_memories",
  "semantic_knowledge_chunks",
  "promote_voice_transcript_to_memory",
];

const edgeFns = [
  ["knowledge-embedder", "supabase/functions/knowledge-embedder/index.ts"],
  ["voice-spine", "supabase/functions/voice-spine/index.ts"],
].filter(([, p]) => existsSync(p)).map(([n]) => n);

const surfaces = [
  ["VoiceTranscriptDrawer", "src/modules/_shared/knowledge/VoiceTranscriptDrawer.tsx"],
  ["SemanticContextBadge", "src/modules/_shared/knowledge/SemanticContextBadge.tsx"],
  ["EmbeddingHealthPanel", "src/modules/_shared/knowledge/EmbeddingHealthPanel.tsx"],
  ["useVoiceSession", "src/modules/_shared/knowledge/use-voice-spine.ts"],
  ["SemanticSpineBoard", "src/pages/admin/architecture/SemanticSpineBoard.tsx"],
].filter(([, p]) => existsSync(p)).map(([n]) => n);

const manifest = {
  schemaVersion: 1,
  phase: 6,
  embeddingDim: 768,
  embeddingModel: "google/text-embedding-004",
  tables: tables.sort(),
  augmentedTables: augmentedTables.sort(),
  rpcs: rpcs.sort(),
  trustActions: semanticTrustKeys.sort(),
  edgeFunctions: edgeFns.sort(),
  surfaces: surfaces.sort(),
  storageBuckets: ["voice-recordings"],
};

const next = JSON.stringify(manifest, null, 2) + "\n";

if (!existsSync(dirname(OUT))) mkdirSync(dirname(OUT), { recursive: true });

const flag = process.argv.includes("--check");
if (flag && existsSync(OUT)) {
  const prev = readFileSync(OUT, "utf8");
  if (prev !== next) {
    console.error("[semantic-spine-manifest] DRIFT — regenerate via: node scripts/ci/check-semantic-spine-manifest.mjs");
    console.error("--- expected ---\n" + next);
    console.error("--- actual ---\n" + prev);
    process.exit(1);
  }
  console.log("[semantic-spine-manifest] OK — manifest stable");
  process.exit(0);
}

writeFileSync(OUT, next);
console.log(`[semantic-spine-manifest] wrote ${OUT}`);
console.log(`  tables: ${manifest.tables.length}, rpcs: ${manifest.rpcs.length}, trustActions: ${manifest.trustActions.length}, edgeFns: ${manifest.edgeFunctions.length}, surfaces: ${manifest.surfaces.length}`);
