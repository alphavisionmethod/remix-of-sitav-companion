import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/offline-degraded-matrix.ts")) issues.push({ severity: "error", area: "offline-degraded", message: "Source contract missing: src/platform/product/offline-degraded-matrix.ts" });
if (!existsSync("generated/offline-degraded-coverage.json")) issues.push({ severity: "warning", area: "offline-degraded", message: "Generated artifact missing: generated/offline-degraded-coverage.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "offline-degraded", ok, issues });
console.log(ok ? "✅ offline-degraded: PASS" : "❌ offline-degraded: FAIL");
if (!ok) process.exit(1);
