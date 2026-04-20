/* eslint-disable no-console */
// SITA OS — BLOCK Gate #22 — Internal Agent Deferred-Set Explicitness
//
// Enforces:
//   1. Every agent in ALL_DETAILED_AGENTS has an entry in
//      AGENT_RUNTIME_STATUS_MAP. Coverage MUST be 100%.
//   2. Every "deferred" entry carries both deferredReason and deferredEta.
//   3. Every "wired" entry's runtimeInvocationPath exists on disk AND
//      contains a reference to the canonical agentId or one of its aliases.
//   4. Emits generated/internal-agent-deferred-set-report.json with the
//      wired/scheduled-only/ui-surface-only/deferred breakdown.
//
// This is the runtime-truth gate that prevents "40 agents are wired" claims
// from being made when only ~14 actually are.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { ALL_DETAILED_AGENTS } from "../../../src/lib/internal-agents/agents/index";
import { AGENT_RUNTIME_STATUS_MAP } from "../../../src/lib/internal-agents/agent-runtime-status-map";
import { aliasesForCanonical } from "../../../src/lib/internal-agents/agent-id-alias-map";

const GATE = "internal-agent-deferred-set-explicitness";
const REPORT_DIR = "generated";
const REPORT_FILE = join(REPORT_DIR, `${GATE}-report.json`);

interface Issue {
  severity: "error" | "warning";
  area: string;
  message: string;
}
interface AgentRow {
  agentId: string;
  runtimeStatus: string | null;
  runtimeInvocationPath?: string;
  deferredReason?: string;
  deferredEta?: string;
  pathExists?: boolean;
  aliasReferencesFound?: string[];
}

const issues: Issue[] = [];
const rows: AgentRow[] = [];

function readDirSafe(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const stack: string[] = [dir];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    let entries: string[] = [];
    try {
      entries = readdirSync(cur);
    } catch {
      continue;
    }
    for (const name of entries) {
      const full = join(cur, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) stack.push(full);
      else if (st.isFile()) out.push(full);
    }
  }
  return out;
}

let wired = 0;
let scheduledOnly = 0;
let uiSurfaceOnly = 0;
let deferred = 0;

for (const agent of ALL_DETAILED_AGENTS) {
  const entry = AGENT_RUNTIME_STATUS_MAP[agent.agentId];
  if (!entry) {
    issues.push({
      severity: "error",
      area: "coverage",
      message: `Agent ${agent.agentId} has no entry in AGENT_RUNTIME_STATUS_MAP`,
    });
    rows.push({ agentId: agent.agentId, runtimeStatus: null });
    continue;
  }

  const row: AgentRow = {
    agentId: agent.agentId,
    runtimeStatus: entry.runtimeStatus,
    runtimeInvocationPath: entry.runtimeInvocationPath,
    deferredReason: entry.deferredReason,
    deferredEta: entry.deferredEta,
  };

  switch (entry.runtimeStatus) {
    case "wired": {
      wired++;
      if (!entry.runtimeInvocationPath) {
        issues.push({
          severity: "error",
          area: agent.agentId,
          message: `Status "wired" requires runtimeInvocationPath`,
        });
        break;
      }
      if (!existsSync(entry.runtimeInvocationPath)) {
        issues.push({
          severity: "error",
          area: agent.agentId,
          message: `runtimeInvocationPath does not exist: ${entry.runtimeInvocationPath}`,
        });
        row.pathExists = false;
        break;
      }
      row.pathExists = true;
      const files = readDirSafe(entry.runtimeInvocationPath);
      const aliases = aliasesForCanonical(agent.agentId);
      const matched: string[] = [];
      for (const alias of aliases) {
        const needle = `"${alias}"`;
        for (const f of files) {
          if (!/\.(ts|tsx|js|mjs|cjs|sql)$/.test(f)) continue;
          let src = "";
          try {
            src = readFileSync(f, "utf8");
          } catch {
            continue;
          }
          if (src.includes(needle)) {
            matched.push(alias);
            break;
          }
        }
      }
      row.aliasReferencesFound = matched;
      if (matched.length === 0) {
        issues.push({
          severity: "error",
          area: agent.agentId,
          message: `runtimeInvocationPath ${entry.runtimeInvocationPath} contains no reference to agent or any alias (${aliases.join(", ")})`,
        });
      }
      break;
    }
    case "scheduled-only":
      scheduledOnly++;
      if (!entry.deferredReason || !entry.deferredEta) {
        issues.push({
          severity: "error",
          area: agent.agentId,
          message: `Status "scheduled-only" requires deferredReason + deferredEta documenting executor gap`,
        });
      }
      break;
    case "ui-surface-only":
      uiSurfaceOnly++;
      if (!entry.deferredReason || !entry.deferredEta) {
        issues.push({
          severity: "error",
          area: agent.agentId,
          message: `Status "ui-surface-only" requires deferredReason + deferredEta`,
        });
      }
      break;
    case "deferred":
      deferred++;
      if (!entry.deferredReason || !entry.deferredEta) {
        issues.push({
          severity: "error",
          area: agent.agentId,
          message: `Status "deferred" requires deferredReason + deferredEta`,
        });
      }
      break;
    default:
      issues.push({
        severity: "error",
        area: agent.agentId,
        message: `Unknown runtimeStatus: ${String(entry.runtimeStatus)}`,
      });
  }

  rows.push(row);
}

// Stale entries (in map but not in registry) — warning only
for (const id of Object.keys(AGENT_RUNTIME_STATUS_MAP)) {
  if (!ALL_DETAILED_AGENTS.find(a => a.agentId === id)) {
    issues.push({
      severity: "warning",
      area: "stale",
      message: `AGENT_RUNTIME_STATUS_MAP has entry for ${id} not in ALL_DETAILED_AGENTS`,
    });
  }
}

const total = ALL_DETAILED_AGENTS.length;
const covered = rows.filter(r => r.runtimeStatus !== null).length;
const coveragePercent = total === 0 ? 0 : Math.round((covered / total) * 1000) / 10;
const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0 && coveragePercent === 100;

mkdirSync(REPORT_DIR, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  gate: GATE,
  ok,
  errorCount,
  warningCount,
  total,
  coveragePercent,
  breakdown: {
    wired,
    scheduledOnly,
    uiSurfaceOnly,
    deferred,
  },
  rows,
  issues,
};
writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

console.log(
  `[${GATE}] coverage=${coveragePercent}% wired=${wired} scheduledOnly=${scheduledOnly} uiSurfaceOnly=${uiSurfaceOnly} deferred=${deferred} errors=${errorCount}`,
);
process.exit(ok ? 0 : 1);
