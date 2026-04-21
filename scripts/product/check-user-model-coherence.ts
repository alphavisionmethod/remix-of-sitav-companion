import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/user-model-contract.ts")) issues.push({ severity: "error", area: "user-model-coherence", message: "Source contract missing: src/platform/product/user-model-contract.ts" });
if (!existsSync("generated/product-model-closure.json")) issues.push({ severity: "warning", area: "user-model-coherence", message: "Generated artifact missing: generated/product-model-closure.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "user-model-coherence", ok, issues });
console.log(ok ? "✅ user-model-coherence: PASS" : "❌ user-model-coherence: FAIL");
if (!ok) process.exit(1);
