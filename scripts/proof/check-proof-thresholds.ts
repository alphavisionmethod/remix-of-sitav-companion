import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/lib/proof/proof-threshold-policy.ts")) issues.push({ severity: "error", area: "proof-thresholds", message: "Source contract missing: src/lib/proof/proof-threshold-policy.ts" });
if (!existsSync("generated/proof-threshold-audit.json")) issues.push({ severity: "warning", area: "proof-thresholds", message: "Generated artifact missing: generated/proof-threshold-audit.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "proof-thresholds", ok, issues });
console.log(ok ? "✅ proof-thresholds: PASS" : "❌ proof-thresholds: FAIL");
if (!ok) process.exit(1);
