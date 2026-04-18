// Phase 8 — BLOCK validator: phase 8 admin pages exist and are routed
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "phase8-admin-pages";
const issues: GateIssue[] = [];
const pages = [
  "src/pages/admin/ai-runtime/AssuranceChaosBoard.tsx",
  "src/pages/admin/ai-runtime/ExternalWorkforceApiBoard.tsx",
  "src/pages/admin/ai-runtime/KnowledgeFederationBoard.tsx",
];
for (const p of pages) {
  if (!existsSync(p)) issues.push({ severity: "error", area: p, message: `missing page ${p}` });
}
const routes = "src/routes/AdminRoutes.tsx";
if (existsSync(routes)) {
  const src = readFileSync(routes, "utf8");
  for (const [name, path] of [
    ["AssuranceChaosBoard", "/admin/ai-runtime/assurance"],
    ["ExternalWorkforceApiBoard", "/admin/ai-runtime/external-api"],
    ["KnowledgeFederationBoard", "/admin/ai-runtime/federation"],
  ] as const) {
    if (!src.includes(name)) issues.push({ severity: "error", area: name, message: `${name} not lazy-imported` });
    if (!src.includes(path)) issues.push({ severity: "error", area: path, message: `route ${path} not registered` });
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
