import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/lib/proof/failure-proof-map.ts")) issues.push({ severity: "error", area: "failure-proof", message: "Source contract missing: src/lib/proof/failure-proof-map.ts" });
if (!existsSync("generated/failure-proof-coverage.json")) issues.push({ severity: "warning", area: "failure-proof", message: "Generated artifact missing: generated/failure-proof-coverage.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "failure-proof", ok, issues });
console.log(ok ? "✅ failure-proof: PASS" : "❌ failure-proof: FAIL");
if (!ok) process.exit(1);
