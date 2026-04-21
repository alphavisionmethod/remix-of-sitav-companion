import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/domain-boundary-map.ts")) issues.push({ severity: "error", area: "domain-boundary-clarity", message: "Source contract missing: src/platform/product/domain-boundary-map.ts" });
if (!existsSync("generated/domain-boundary-clarity-report.json")) issues.push({ severity: "warning", area: "domain-boundary-clarity", message: "Generated artifact missing: generated/domain-boundary-clarity-report.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "domain-boundary-clarity", ok, issues });
console.log(ok ? "✅ domain-boundary-clarity: PASS" : "❌ domain-boundary-clarity: FAIL");
if (!ok) process.exit(1);
