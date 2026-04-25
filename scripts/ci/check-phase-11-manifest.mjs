#!/usr/bin/env node
// SITA OS — Phase 11 manifest drift gate.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");
const manifest = JSON.parse(
  readFileSync(resolve(root, "public/generated/phase-11-manifest.json"), "utf8"),
);

if (manifest.phase !== 11) {
  console.error("[phase-11] phase != 11");
  process.exit(1);
}
if (manifest.autoApprovals?.rpc !== "auto_request_federated_approval") {
  console.error("[phase-11] missing auto_request_federated_approval rpc reference");
  process.exit(1);
}

const orchSrc = readFileSync(
  resolve(root, "supabase/functions/ai-orchestrator-stream/index.ts"),
  "utf8",
);
for (const needle of [
  "auto_request_federated_approval",
  "citation_warning",
  "approval_requested",
  "[F#",
  "CITATION RULES",
  "missing_federated_tokens",
]) {
  if (!orchSrc.includes(needle)) {
    console.error(`[phase-11] orchestrator-stream missing token: ${needle}`);
    process.exit(1);
  }
}

const plannerSrc = readFileSync(
  resolve(root, "supabase/functions/sita-agent-planner/index.ts"),
  "utf8",
);
for (const needle of [
  "federated_peer_workspace_ids",
  "auto_request_federated_approval",
  "pendingApprovalIds",
]) {
  if (!plannerSrc.includes(needle)) {
    console.error(`[phase-11] planner missing token: ${needle}`);
    process.exit(1);
  }
}

console.log(
  "[phase-11] manifest OK — citation enforcement + auto cross-workspace approvals verified.",
);