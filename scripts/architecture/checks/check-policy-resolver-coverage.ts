/* eslint-disable no-console */
// CI Gate 30 — Policy Resolver Coverage (Phase 19.F)
// Asserts that resolveUnifiedPolicy / useUnifiedPolicy / usePolicyDecision are
// referenced from at least the minimum required call sites in app + edge code.

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const REQUIRED_EDGE_CALLERS = 6;
const REQUIRED_UI_CALLERS = 6;

const ROOTS = [
  { dir: "supabase/functions", kind: "edge" as const, pattern: /resolveUnifiedPolicy/ },
  { dir: "src", kind: "ui" as const, pattern: /useUnifiedPolicy|usePolicyDecision|resolveUnifiedPolicy/ },
];

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".git") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

const callSites: Record<"edge" | "ui", string[]> = { edge: [], ui: [] };

for (const root of ROOTS) {
  for (const file of walk(root.dir)) {
    if (
      file.includes("/lib/policy/") ||
      file.includes("/_shared/policy.ts") ||
      file.includes("/hooks/use-unified-policy") ||
      file.includes("/hooks/use-policy-decision") ||
      file.includes("__tests__")
    ) continue;
    const content = readFileSync(file, "utf8");
    if (root.pattern.test(content)) {
      callSites[root.kind].push(file.replace(/\\/g, "/"));
    }
  }
}

const errors: string[] = [];
if (callSites.edge.length < REQUIRED_EDGE_CALLERS) {
  errors.push(
    `Edge functions calling resolveUnifiedPolicy: ${callSites.edge.length}/${REQUIRED_EDGE_CALLERS}`
  );
}
if (callSites.ui.length < REQUIRED_UI_CALLERS) {
  errors.push(
    `UI surfaces consuming policy hooks: ${callSites.ui.length}/${REQUIRED_UI_CALLERS}`
  );
}

const report = {
  generatedAt: new Date().toISOString(),
  edgeCallers: callSites.edge,
  uiCallers: callSites.ui,
  edgeCount: callSites.edge.length,
  uiCount: callSites.ui.length,
  requiredEdge: REQUIRED_EDGE_CALLERS,
  requiredUi: REQUIRED_UI_CALLERS,
  errors,
  ok: errors.length === 0,
};

if (!existsSync("generated")) mkdirSync("generated");
writeFileSync(
  "generated/policy-resolver-coverage.json",
  JSON.stringify(report, null, 2)
);

if (errors.length > 0) {
  console.error("❌ Policy resolver coverage gate FAILED:");
  for (const e of errors) console.error(`   - ${e}`);
  process.exit(1);
}
console.log(
  `✅ Policy resolver coverage: edge=${callSites.edge.length} ui=${callSites.ui.length}`
);
