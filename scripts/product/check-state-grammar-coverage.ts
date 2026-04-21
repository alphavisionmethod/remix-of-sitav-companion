import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/state-grammar.ts")) issues.push({ severity: "error", area: "state-grammar", message: "Source contract missing: src/platform/product/state-grammar.ts" });
if (!existsSync("generated/state-grammar-coverage.json")) issues.push({ severity: "warning", area: "state-grammar", message: "Generated artifact missing: generated/state-grammar-coverage.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "state-grammar", ok, issues });
console.log(ok ? "✅ state-grammar: PASS" : "❌ state-grammar: FAIL");
if (!ok) process.exit(1);
