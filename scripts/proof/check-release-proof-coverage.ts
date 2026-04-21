import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/lib/proof/system-proof-registry.ts")) issues.push({ severity: "error", area: "release-proof", message: "Source contract missing: src/lib/proof/system-proof-registry.ts" });
if (!existsSync("generated/release-proof-coverage.json")) issues.push({ severity: "warning", area: "release-proof", message: "Generated artifact missing: generated/release-proof-coverage.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "release-proof", ok, issues });
console.log(ok ? "✅ release-proof: PASS" : "❌ release-proof: FAIL");
if (!ok) process.exit(1);
