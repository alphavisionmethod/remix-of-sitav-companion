import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/settings-coherence-map.ts")) issues.push({ severity: "error", area: "settings-coherence", message: "Source contract missing: src/platform/product/settings-coherence-map.ts" });
if (!existsSync("generated/settings-coherence-report.json")) issues.push({ severity: "warning", area: "settings-coherence", message: "Generated artifact missing: generated/settings-coherence-report.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "settings-coherence", ok, issues });
console.log(ok ? "✅ settings-coherence: PASS" : "❌ settings-coherence: FAIL");
if (!ok) process.exit(1);
