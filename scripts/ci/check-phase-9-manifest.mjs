#!/usr/bin/env node
// SITA OS — Phase 9 manifest drift gate.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");
const manifest = JSON.parse(readFileSync(resolve(root, "public/generated/phase-9-manifest.json"), "utf8"));

if (manifest.phase !== 9) { console.error("[phase-9] phase != 9"); process.exit(1); }
for (const rpc of ["semantic_knowledge_chunks_federated", "semantic_workspace_memories_federated"]) {
  if (!manifest.federatedRetrieval?.rpcs?.includes(rpc)) {
    console.error(`[phase-9] missing rpc ${rpc}`); process.exit(1);
  }
}
if (manifest.federatedRetrieval?.retrievalKind !== "federated") {
  console.error("[phase-9] retrievalKind must be 'federated'"); process.exit(1);
}
if (manifest.agentMultiModal?.planner !== "sita-agent-planner") {
  console.error("[phase-9] planner reference missing"); process.exit(1);
}

const orchSrc = readFileSync(resolve(root, "supabase/functions/ai-orchestrator-stream/index.ts"), "utf8");
if (!orchSrc.includes("semantic_knowledge_chunks_federated") || !orchSrc.includes("semantic_workspace_memories_federated")) {
  console.error("[phase-9] orchestrator-stream not wired to federated rpcs"); process.exit(1);
}

const plannerSrc = readFileSync(resolve(root, "supabase/functions/sita-agent-planner/index.ts"), "utf8");
if (!plannerSrc.includes("fetchMultiModalContext") || !plannerSrc.includes("multiModalContext")) {
  console.error("[phase-9] planner missing multi-modal context wiring"); process.exit(1);
}

console.log("[phase-9] manifest OK — federated retrieval + agent multi-modal context verified.");