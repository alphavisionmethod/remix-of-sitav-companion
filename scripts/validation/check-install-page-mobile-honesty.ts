// Validator: install surfaces link to docs/MOBILE_HONESTY.md
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const SURFACES = [
  "src/pages/DownloadPage.tsx",
  "src/pages/DownloadsCenter.tsx",
  "src/pages/app-platform/ExternalInstallerPage.tsx",
];
const HONESTY = "docs/MOBILE_HONESTY.md";

const issues: GateIssue[] = [];

if (!existsSync(HONESTY)) {
  issues.push({ severity: "error", area: "doc", message: `Canonical honesty doc missing: ${HONESTY}` });
}

for (const s of SURFACES) {
  if (!existsSync(s)) {
    issues.push({ severity: "error", area: "surface", message: `Install surface missing: ${s}` });
    continue;
  }
  const content = readFileSync(s, "utf8");
  const hasLink = /MOBILE_HONESTY\.md/.test(content) || /MobileHonestyNotice/.test(content);
  if (!hasLink) {
    issues.push({
      severity: "error",
      area: "honesty",
      message: `${s} must link to docs/MOBILE_HONESTY.md (or render <MobileHonestyNotice />)`,
    });
  }
}

const errors = issues.filter((i) => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "install-page-mobile-honesty",
  ok,
  issues,
  extra: { surfaces: SURFACES, honestyDoc: HONESTY },
});
console.log(`install-page-mobile-honesty: ${ok ? "GREEN" : "RED"} (${errors} errors)`);
process.exit(ok ? 0 : 1);
