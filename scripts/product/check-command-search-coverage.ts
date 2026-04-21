import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/command-search-model.ts")) issues.push({ severity: "error", area: "command-search", message: "Source contract missing: src/platform/product/command-search-model.ts" });
if (!existsSync("generated/command-search-coverage.json")) issues.push({ severity: "warning", area: "command-search", message: "Generated artifact missing: generated/command-search-coverage.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "command-search", ok, issues });
console.log(ok ? "✅ command-search: PASS" : "❌ command-search: FAIL");
if (!ok) process.exit(1);
