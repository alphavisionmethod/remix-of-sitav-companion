import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/lib/proof/behavior-proof-map.ts")) issues.push({ severity: "error", area: "behavior-proof", message: "Source contract missing: src/lib/proof/behavior-proof-map.ts" });
if (!existsSync("generated/behavior-proof-coverage.json")) issues.push({ severity: "warning", area: "behavior-proof", message: "Generated artifact missing: generated/behavior-proof-coverage.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "behavior-proof", ok, issues });
console.log(ok ? "✅ behavior-proof: PASS" : "❌ behavior-proof: FAIL");
if (!ok) process.exit(1);
