import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/notification-center-model.ts")) issues.push({ severity: "error", area: "notification-center", message: "Source contract missing: src/platform/product/notification-center-model.ts" });
if (!existsSync("generated/notification-center-coverage.json")) issues.push({ severity: "warning", area: "notification-center", message: "Generated artifact missing: generated/notification-center-coverage.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "notification-center", ok, issues });
console.log(ok ? "✅ notification-center: PASS" : "❌ notification-center: FAIL");
if (!ok) process.exit(1);
