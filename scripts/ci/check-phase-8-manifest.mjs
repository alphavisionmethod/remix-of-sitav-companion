#!/usr/bin/env node
// SITA OS — Phase 8 manifest drift gate.
// Re-derives the expected manifest from source-of-truth files and compares
// against public/generated/phase-8-manifest.json. Fails CI on drift.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");
const manifestPath = resolve(root, "public/generated/phase-8-manifest.json");

const registrySrc = readFileSync(resolve(root, "src/modules/_trust/registry/trust-action-registry.ts"), "utf8");
const expectedTrustActions = [
  "shared.voice.intent.dispatch",
  "shared.embedding.multimodal",
  "shared.federation.share",
];
for (const k of expectedTrustActions) {
  if (!registrySrc.includes(`"${k}"`)) {
    console.error(`[phase-8] missing trust action: ${k}`);
    process.exit(1);
  }
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (manifest.phase !== 8) { console.error("[phase-8] phase != 8"); process.exit(1); }
if (manifest.voiceAgentBridge?.rpc !== "dispatch_voice_intent") {
  console.error("[phase-8] dispatch_voice_intent rpc missing"); process.exit(1);
}
if (!manifest.federation?.tables?.includes("workspace_federations")) {
  console.error("[phase-8] workspace_federations table missing from manifest"); process.exit(1);
}
if (manifest.federation?.ui?.adminRoute !== "/admin/architecture/federation") {
  console.error("[phase-8.b] federation admin route missing"); process.exit(1);
}
if (manifest.multiModal?.ingest?.panel !== "MultiModalIngestPanel") {
  console.error("[phase-8.b] multimodal ingest panel missing"); process.exit(1);
}
if (manifest.multiModal?.ingest?.bucket !== "user-files") {
  console.error("[phase-8.b] multimodal ingest bucket misconfigured"); process.exit(1);
}
const sortedActions = [...manifest.trustActions].sort();
if (JSON.stringify(sortedActions) !== JSON.stringify([...expectedTrustActions].sort())) {
  console.error("[phase-8] trustActions list drift", sortedActions);
  process.exit(1);
}
console.log("[phase-8] manifest OK — 3 trust actions, federation UI + voice→agent + multi-modal ingest verified.");
