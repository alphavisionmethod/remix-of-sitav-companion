/* eslint-disable no-console */
// CI Gate 30 — Policy Resolver Coverage + Auth Page Reachability (Phase 19 / 19.1)
// Asserts that resolveUnifiedPolicy / useUnifiedPolicy / usePolicyDecision are
// referenced from at least the minimum required call sites in app + edge code,
// AND that security-critical pages (MFA, Passkey) are imported by a route file.

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const REQUIRED_EDGE_CALLERS = 6;
const REQUIRED_UI_CALLERS = 6;

const ROOTS = [
  { dir: "supabase/functions", kind: "edge" as const, pattern: /resolveUnifiedPolicy/ },
  { dir: "src", kind: "ui" as const, pattern: /useUnifiedPolicy|usePolicyDecision|resolveUnifiedPolicy/ },
];

// Phase 19.1.E — security-critical pages that MUST be reachable via a route
const SECURITY_PAGES = [
  { file: "src/pages/settings/MFAEnrollment.tsx", importToken: "MFAEnrollment" },
  { file: "src/pages/settings/PasskeyManagement.tsx", importToken: "PasskeyManagement" },
];
const ROUTES_DIR = "src/routes";

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

// Route reachability check
const routeFiles = walk(ROUTES_DIR);
const routeBlob = routeFiles.map((f) => readFileSync(f, "utf8")).join("\n");
const unreachablePages: string[] = [];
const reachablePages: string[] = [];
for (const page of SECURITY_PAGES) {
  if (!existsSync(page.file)) {
    unreachablePages.push(`${page.file} (page file missing)`);
    continue;
  }
  // Match either the export token or its file path being imported in any route file
  const tokenRe = new RegExp(`\\b${page.importToken}\\b`);
  const pathRe = new RegExp(page.file.replace("src/", "@/").replace(/\.tsx?$/, ""));
  if (tokenRe.test(routeBlob) || pathRe.test(routeBlob)) {
    reachablePages.push(page.file);
  } else {
    unreachablePages.push(`${page.file} (no route imports ${page.importToken})`);
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
for (const u of unreachablePages) {
  errors.push(`Security page unreachable: ${u}`);
}

const report = {
  generatedAt: new Date().toISOString(),
  edgeCallers: callSites.edge,
  uiCallers: callSites.ui,
  edgeCount: callSites.edge.length,
  uiCount: callSites.ui.length,
  requiredEdge: REQUIRED_EDGE_CALLERS,
  requiredUi: REQUIRED_UI_CALLERS,
  securityPagesReachable: reachablePages,
  securityPagesUnreachable: unreachablePages,
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
  `✅ Policy resolver coverage: edge=${callSites.edge.length} ui=${callSites.ui.length} security-pages-reachable=${reachablePages.length}/${SECURITY_PAGES.length}`
);
