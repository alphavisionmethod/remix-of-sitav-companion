import { existsSync } from "node:fs";
import { emitGateReport } from "../validation/_lib/emit-gate-report";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
if (!existsSync("src/platform/product/deep-link-registry.ts")) issues.push({ severity: "error", area: "deep-link", message: "Source contract missing: src/platform/product/deep-link-registry.ts" });
if (!existsSync("generated/deep-link-coverage.json")) issues.push({ severity: "warning", area: "deep-link", message: "Generated artifact missing: generated/deep-link-coverage.json — run generate-product-proof-artifacts.ts" });
const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "deep-link", ok, issues });
console.log(ok ? "✅ deep-link: PASS" : "❌ deep-link: FAIL");
if (!ok) process.exit(1);
