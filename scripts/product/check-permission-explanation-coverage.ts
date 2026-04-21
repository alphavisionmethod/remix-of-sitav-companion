import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/permission-explanation-policy.ts")) issues.push({ severity: "error", area: "permission-explanation", message: "Source contract missing: src/platform/product/permission-explanation-policy.ts" });
if (!existsSync("generated/permission-explanation-coverage.json")) issues.push({ severity: "warning", area: "permission-explanation", message: "Generated artifact missing: generated/permission-explanation-coverage.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "permission-explanation", ok, issues });
console.log(ok ? "✅ permission-explanation: PASS" : "❌ permission-explanation: FAIL");
if (!ok) process.exit(1);
