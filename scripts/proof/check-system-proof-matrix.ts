import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/lib/proof/system-proof-registry.ts")) issues.push({ severity: "error", area: "system-proof-matrix", message: "Source contract missing: src/lib/proof/system-proof-registry.ts" });
if (!existsSync("generated/system-proof-matrix.json")) issues.push({ severity: "warning", area: "system-proof-matrix", message: "Generated artifact missing: generated/system-proof-matrix.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "system-proof-matrix", ok, issues });
console.log(ok ? "✅ system-proof-matrix: PASS" : "❌ system-proof-matrix: FAIL");
if (!ok) process.exit(1);
