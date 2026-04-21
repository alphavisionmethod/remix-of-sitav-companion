import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/navigation-model.ts")) issues.push({ severity: "error", area: "navigation-coherence", message: "Source contract missing: src/platform/product/navigation-model.ts" });
if (!existsSync("generated/navigation-coherence-report.json")) issues.push({ severity: "warning", area: "navigation-coherence", message: "Generated artifact missing: generated/navigation-coherence-report.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "navigation-coherence", ok, issues });
console.log(ok ? "✅ navigation-coherence: PASS" : "❌ navigation-coherence: FAIL");
if (!ok) process.exit(1);
