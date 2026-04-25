#!/usr/bin/env node
// SITA OS — Phase 10 manifest drift gate.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");
const manifest = JSON.parse(
  readFileSync(resolve(root, "public/generated/phase-10-manifest.json"), "utf8"),
);

if (manifest.phase !== 10) {
  console.error("[phase-10] phase != 10");
  process.exit(1);
}

for (const rpc of [
  "request_cross_workspace_approval",
  "decide_cross_workspace_approval",
]) {
  if (!manifest.approvals?.rpcs?.includes(rpc)) {
    console.error(`[phase-10] missing rpc ${rpc}`);
    process.exit(1);
  }
}

if (manifest.attribution?.view !== "attribution_summary_v") {
  console.error("[phase-10] attribution view name mismatch");
  process.exit(1);
}

const indexSrc = readFileSync(
  resolve(root, "src/modules/_shared/knowledge/index.ts"),
  "utf8",
);
for (const sym of [
  "FederatedAttributionPanel",
  "CrossWorkspaceApprovalQueue",
  "useCrossWorkspaceApprovals",
  "useAttributionSummary",
  "fetchAttributionSummary",
  "requestCrossWorkspaceApproval",
  "decideCrossWorkspaceApproval",
]) {
  if (!indexSrc.includes(sym)) {
    console.error(`[phase-10] knowledge index missing export: ${sym}`);
    process.exit(1);
  }
}

const boardSrc = readFileSync(
  resolve(root, "src/pages/admin/architecture/WorkspaceFederationBoard.tsx"),
  "utf8",
);
if (!boardSrc.includes("CrossWorkspaceApprovalQueue")) {
  console.error("[phase-10] WorkspaceFederationBoard does not embed CrossWorkspaceApprovalQueue");
  process.exit(1);
}

const svcSrc = readFileSync(
  resolve(root, "src/modules/_shared/knowledge/cross-workspace-approval-service.ts"),
  "utf8",
);
for (const sym of [
  "request_cross_workspace_approval",
  "decide_cross_workspace_approval",
  "cross_workspace_approvals",
]) {
  if (!svcSrc.includes(sym)) {
    console.error(`[phase-10] approval service missing reference: ${sym}`);
    process.exit(1);
  }
}

const attrSrc = readFileSync(
  resolve(root, "src/modules/_shared/knowledge/attribution-service.ts"),
  "utf8",
);
if (!attrSrc.includes("attribution_summary_v")) {
  console.error("[phase-10] attribution service does not reference view");
  process.exit(1);
}

console.log(
  "[phase-10] manifest OK — federated attribution + cross-workspace approvals verified.",
);