// Validator: mobile manifest stays archived (infra/deploy/mobile.yaml never returns to active path)
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];

if (existsSync("infra/deploy/mobile.yaml")) {
  issues.push({
    severity: "error",
    area: "manifest",
    message: "infra/deploy/mobile.yaml present at active path — must remain archived under archive/infra/mobile.yaml",
  });
}

const archivedManifest = "archive/infra/mobile.yaml";
if (!existsSync(archivedManifest)) {
  issues.push({
    severity: "error",
    area: "archive",
    message: `Archived mobile manifest missing: ${archivedManifest}`,
  });
} else {
  const content = readFileSync(archivedManifest, "utf8");
  if (!/ARCHIVED|FUTURE_VISION_ONLY/.test(content)) {
    issues.push({
      severity: "error",
      area: "banner",
      message: `${archivedManifest} must declare ARCHIVED / FUTURE_VISION_ONLY in its header banner`,
    });
  }
}

const archivedCap = "archive/capacitor/capacitor.config.ts";
if (!existsSync(archivedCap)) {
  issues.push({ severity: "error", area: "archive", message: `Archived capacitor config missing: ${archivedCap}` });
} else {
  const content = readFileSync(archivedCap, "utf8");
  if (!/ARCHIVED|FUTURE_VISION_ONLY/.test(content)) {
    issues.push({ severity: "error", area: "banner", message: `${archivedCap} must declare ARCHIVED / FUTURE_VISION_ONLY` });
  }
}

const errors = issues.filter((i) => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "mobile-manifest-archive-classification",
  ok,
  issues,
});
console.log(`mobile-manifest-archive-classification: ${ok ? "GREEN" : "RED"} (${errors} errors)`);
process.exit(ok ? 0 : 1);
