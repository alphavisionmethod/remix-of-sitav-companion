// Phase 6 — BLOCK validator: cross-council board page exists & exposes 3 tabs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const REPORT = "generated/cross-council-board-page-report.json";
const PAGE = "src/pages/admin/ai-runtime/CrossCouncilBoard.tsx";
const ROUTES = "src/routes/AdminRoutes.tsx";

const findings: string[] = [];

let pageContent = "";
try {
  pageContent = readFileSync(PAGE, "utf-8");
} catch {
  findings.push("CrossCouncilBoard.tsx missing");
}

if (pageContent) {
  if (!pageContent.includes('value="consensus"')) findings.push("Consensus tab missing");
  if (!pageContent.includes('value="cost"')) findings.push("Cost proposals tab missing");
  if (!pageContent.includes('value="healing"')) findings.push("Self-healing tab missing");
  if (!pageContent.includes("L3 hard ceiling")) findings.push("L3 ceiling banner missing");
  if (!pageContent.includes("never auto-applied") && !pageContent.includes("Never auto-applied")) {
    findings.push("Cost proposals 'never auto-applied' disclosure missing");
  }
}

const routes = readFileSync(ROUTES, "utf-8");
if (!routes.includes("/admin/ai-runtime/cross-council")) {
  findings.push("Route /admin/ai-runtime/cross-council not registered");
}
if (!routes.includes("CrossCouncilBoard")) {
  findings.push("CrossCouncilBoard not imported in routes");
}

const ok = findings.length === 0;
mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify({
  gate: "cross-council-board-page",
  level: "BLOCK",
  ok,
  findings,
  generated_at: new Date().toISOString(),
}, null, 2));

if (!ok) {
  console.error("❌ BLOCK: cross-council board:\n  - " + findings.join("\n  - "));
  process.exit(1);
}
console.log("✅ Cross-council board page wired.");
