#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Internal Agent Runtime Status Manifest Generator
//
// Emits an admin-UI-consumable transparency manifest summarizing which of the
// 40 internal agents are wired vs deferred. Mirrored to public/ for in-app
// consumption.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { ALL_DETAILED_AGENTS } from "../../../src/lib/internal-agents/agents/index";
import { AGENT_RUNTIME_STATUS_MAP } from "../../../src/lib/internal-agents/agent-runtime-status-map";

interface ManifestRow {
  agentId: string;
  name: string;
  council: string;
  runtimeStatus: string;
  runtimeInvocationPath?: string;
  runtimeAliasId?: string;
  deferredReason?: string;
  deferredEta?: string;
}

const rows: ManifestRow[] = [];
let wired = 0;
let scheduledOnly = 0;
let uiSurfaceOnly = 0;
let deferred = 0;

for (const agent of ALL_DETAILED_AGENTS) {
  const entry = AGENT_RUNTIME_STATUS_MAP[agent.agentId];
  const status = entry?.runtimeStatus ?? "unknown";
  if (status === "wired") wired++;
  else if (status === "scheduled-only") scheduledOnly++;
  else if (status === "ui-surface-only") uiSurfaceOnly++;
  else if (status === "deferred") deferred++;

  rows.push({
    agentId: agent.agentId,
    name: agent.name,
    council: agent.council,
    runtimeStatus: status,
    runtimeInvocationPath: entry?.runtimeInvocationPath,
    runtimeAliasId: entry?.runtimeAliasId,
    deferredReason: entry?.deferredReason,
    deferredEta: entry?.deferredEta,
  });
}

const manifest = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  total: ALL_DETAILED_AGENTS.length,
  breakdown: { wired, scheduledOnly, uiSurfaceOnly, deferred },
  honestClaim: `${wired} of ${ALL_DETAILED_AGENTS.length} internal agents have a real runtime invocation path; ${scheduledOnly + uiSurfaceOnly + deferred} are explicitly classified as scheduled-only, ui-surface-only, or deferred (with documented reason + ETA).`,
  rows,
};

for (const dir of ["generated", "public/generated"]) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "internal-agent-runtime-status.json"),
    JSON.stringify(manifest, null, 2),
  );
}

console.log(
  `✅ internal-agent-runtime-status: total=${ALL_DETAILED_AGENTS.length} wired=${wired} scheduledOnly=${scheduledOnly} uiSurfaceOnly=${uiSurfaceOnly} deferred=${deferred}`,
);
