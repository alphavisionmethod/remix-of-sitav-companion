// Validator: native mobile is out of scope (capacitor.config.ts + @capacitor/* deps)
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];

if (existsSync("capacitor.config.ts")) {
  issues.push({
    severity: "error",
    area: "stack",
    message: "capacitor.config.ts found at repo root — must remain archived under archive/capacitor/",
  });
}
if (existsSync("mobile")) {
  issues.push({
    severity: "error",
    area: "stack",
    message: "mobile/ directory found at repo root — must remain archived under archive/mobile/",
  });
}

let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } = {};
try {
  pkg = JSON.parse(readFileSync("package.json", "utf8"));
} catch {
  issues.push({ severity: "error", area: "deps", message: "package.json unreadable" });
}
const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
const caps = Object.keys(allDeps).filter((d) => d.startsWith("@capacitor/"));
for (const d of caps) {
  issues.push({
    severity: "error",
    area: "deps",
    message: `@capacitor/* dep present: ${d} — mobile-native is out of scope; remove from package.json`,
  });
}

const errors = issues.filter((i) => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "mobile-native-out-of-scope-truth",
  ok,
  issues,
  extra: { honestyDoc: "docs/MOBILE_HONESTY.md", capacitorDepsFound: caps },
});
console.log(`mobile-native-out-of-scope-truth: ${ok ? "GREEN" : "RED"} (${errors} errors)`);
process.exit(ok ? 0 : 1);
