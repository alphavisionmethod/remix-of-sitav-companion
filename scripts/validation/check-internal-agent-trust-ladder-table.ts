#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const GATE = "internal-agent-trust-ladder-table";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

const migDir = "supabase/migrations";
const requiredObjects = [
  "internal_agent_trust_ladder",
  "internal_agent_ladder_history",
  "internal_agent_knowledge_bus",
  "evaluate_internal_agent_ladder",
  "publish_agent_learning",
  "summarize_trust_ladder",
];

let foundAll = false;
try {
  const { readdirSync } = await import("node:fs");
  const files = readdirSync(migDir).filter((f) => f.endsWith(".sql"));
  const blob = files.map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n");
  const missing = requiredObjects.filter((o) => !blob.includes(o));
  if (missing.length > 0) {
    issues.push({ severity: "error", area: "migration", message: `Missing objects: ${missing.join(", ")}` });
  } else {
    foundAll = true;
  }
  // RLS guard
  if (!blob.includes("ALTER TABLE public.internal_agent_trust_ladder ENABLE ROW LEVEL SECURITY")) {
    issues.push({ severity: "error", area: "rls", message: "internal_agent_trust_ladder must enable RLS" });
  }
  if (!blob.includes("ALTER TABLE public.internal_agent_knowledge_bus ENABLE ROW LEVEL SECURITY")) {
    issues.push({ severity: "error", area: "rls", message: "internal_agent_knowledge_bus must enable RLS" });
  }
} catch (e) {
  issues.push({ severity: "error", area: "filesystem", message: `Failed to scan migrations: ${e instanceof Error ? e.message : String(e)}` });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues, extra: { foundAll } });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
process.exit(ok ? 0 : 1);
