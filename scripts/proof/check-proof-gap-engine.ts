import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/lib/proof/proof-gap-engine.ts")) issues.push({ severity: "error", area: "proof-gap-engine", message: "Source contract missing: src/lib/proof/proof-gap-engine.ts" });
if (!existsSync("generated/proof-gap-report.json")) issues.push({ severity: "warning", area: "proof-gap-engine", message: "Generated artifact missing: generated/proof-gap-report.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "proof-gap-engine", ok, issues });
console.log(ok ? "✅ proof-gap-engine: PASS" : "❌ proof-gap-engine: FAIL");
if (!ok) process.exit(1);
