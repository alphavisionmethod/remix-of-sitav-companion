import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/task-action-model.ts")) issues.push({ severity: "error", area: "task-action-model", message: "Source contract missing: src/platform/product/task-action-model.ts" });
if (!existsSync("generated/task-action-model-report.json")) issues.push({ severity: "warning", area: "task-action-model", message: "Generated artifact missing: generated/task-action-model-report.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "task-action-model", ok, issues });
console.log(ok ? "✅ task-action-model: PASS" : "❌ task-action-model: FAIL");
if (!ok) process.exit(1);
