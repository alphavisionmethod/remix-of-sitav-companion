#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Phase 7 CI gate: emit deterministic live-cortex manifest.
// Tracks the streaming orchestrator surface, voice-intent pipeline,
// embedding-budget governance, and admin Live Cortex board.
// Fails CI if the on-disk manifest drifts from the regenerated one.
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const OUT = "public/generated/live-cortex-manifest.json";

const registry = readFileSync("src/modules/_trust/registry/trust-action-registry.ts", "utf8");
const trustKeys = [
  "shared.voice.intent.execute",
  "shared.embedding.batch",
].filter((k) => registry.includes(`"${k}"`));

const tables = ["voice_intents"];
const views = ["embedding_budget_overview"];
const rpcs = [
  "extract_voice_intents",
  "purge_expired_voice_intents",
];

const edgeFns = [
  ["ai-orchestrator-stream", "supabase/functions/ai-orchestrator-stream/index.ts"],
  ["voice-spine", "supabase/functions/voice-spine/index.ts"],
  ["knowledge-embedder", "supabase/functions/knowledge-embedder/index.ts"],
].filter(([, p]) => existsSync(p)).map(([n]) => n);

const surfaces = [
  ["LiveCortexBoard", "src/pages/admin/architecture/LiveCortexBoard.tsx"],
  ["StreamingChatPanel", "src/modules/_shared/ai/StreamingChatPanel.tsx"],
  ["EmbeddingBudgetPanel", "src/modules/_shared/knowledge/EmbeddingBudgetPanel.tsx"],
  ["useOrchestratorStream", "src/modules/_shared/ai/use-orchestrator-stream.ts"],
  ["useExtractVoiceIntents", "src/modules/_shared/knowledge/use-voice-spine.ts"],
].filter(([, p]) => existsSync(p)).map(([n]) => n);

const adminRoutes = [
  "/admin/architecture/live-cortex",
];

const manifest = {
  schemaVersion: 1,
  phase: 7,
  streaming: {
    transport: "sse",
    edgeFunction: "ai-orchestrator-stream",
    events: ["context", "trace", "delta", "error", "done"].sort(),
  },
  intents: {
    extractionModel: "google/gemini-3-flash-preview",
    states: ["proposed", "approved", "rejected", "executed", "expired"].sort(),
  },
  tables: tables.sort(),
  views: views.sort(),
  rpcs: rpcs.sort(),
  trustActions: trustKeys.sort(),
  edgeFunctions: edgeFns.sort(),
  surfaces: surfaces.sort(),
  adminRoutes: adminRoutes.sort(),
};

const next = JSON.stringify(manifest, null, 2) + "\n";

if (!existsSync(dirname(OUT))) mkdirSync(dirname(OUT), { recursive: true });

const flag = process.argv.includes("--check");
if (flag && existsSync(OUT)) {
  const prev = readFileSync(OUT, "utf8");
  if (prev !== next) {
    console.error("[live-cortex-manifest] DRIFT — regenerate via: node scripts/ci/check-live-cortex-manifest.mjs");
    console.error("--- expected ---\n" + next);
    console.error("--- actual ---\n" + prev);
    process.exit(1);
  }
  console.log("[live-cortex-manifest] OK — manifest stable");
  process.exit(0);
}

writeFileSync(OUT, next);
console.log(`[live-cortex-manifest] wrote ${OUT}`);
console.log(`  tables: ${manifest.tables.length}, rpcs: ${manifest.rpcs.length}, trustActions: ${manifest.trustActions.length}, edgeFns: ${manifest.edgeFunctions.length}, surfaces: ${manifest.surfaces.length}`);