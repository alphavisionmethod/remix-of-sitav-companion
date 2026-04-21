import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/trust-explanation-layer.ts")) issues.push({ severity: "error", area: "trust-explanation", message: "Source contract missing: src/platform/product/trust-explanation-layer.ts" });
if (!existsSync("generated/trust-explanation-coverage.json")) issues.push({ severity: "warning", area: "trust-explanation", message: "Generated artifact missing: generated/trust-explanation-coverage.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "trust-explanation", ok, issues });
console.log(ok ? "✅ trust-explanation: PASS" : "❌ trust-explanation: FAIL");
if (!ok) process.exit(1);
