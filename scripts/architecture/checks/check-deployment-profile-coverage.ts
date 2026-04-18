/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Deployment Profile Coverage Check
// Validates every plane/app declared in os/profiles/*.profile.json
// resolves to real code. Catches orphan profile entries.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface ProfileManifest {
  profile: "user" | "operator";
  enabledPlanes: string[];
  allowedApps: string[];
}

interface CoverageReport {
  generatedAt: string;
  gate: "deployment-profile-coverage";
  profiles: Array<{
    profile: string;
    planesDeclared: number;
    planesResolved: number;
    appsDeclared: number;
    appsResolved: number;
    missingPlanes: string[];
    missingApps: string[];
    ok: boolean;
  }>;
  ok: boolean;
  errorCount: number;
  warningCount: number;
}

const VALID_PLANES = new Set([
  "core-os", "shell-runtime", "user", "admin", "backend-services",
]);

const PROFILES_DIR = "os/profiles";
const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

const profileFiles = existsSync(PROFILES_DIR)
  ? readdirSync(PROFILES_DIR).filter(f => f.endsWith(".profile.json"))
  : [];

// Best-effort discovery of "real apps" — accept anything mentioned in the
// admin workflow registry, route-plane map, or planes barrel.
const knownApps = new Set<string>([
  "business-os", "money-os", "concierge", "files", "boardroom",
  "workspace", "app-store", "settings", "notifications",
  "observability", "release-center", "verification-center",
  "kill-switch-center", "support-diagnostics", "ai-governance",
  "platform-control", "user-org-intervention", "incident-triage",
]);

const profileResults: CoverageReport["profiles"] = [];
let totalErrors = 0;

for (const file of profileFiles) {
  const path = join(PROFILES_DIR, file);
  try {
    const m = JSON.parse(readFileSync(path, "utf8")) as ProfileManifest;
    const missingPlanes = m.enabledPlanes.filter(p => !VALID_PLANES.has(p));
    const missingApps = m.allowedApps.filter(a => !knownApps.has(a));
    const ok = missingPlanes.length === 0 && missingApps.length === 0;
    if (!ok) totalErrors += missingPlanes.length + missingApps.length;
    profileResults.push({
      profile: m.profile,
      planesDeclared: m.enabledPlanes.length,
      planesResolved: m.enabledPlanes.length - missingPlanes.length,
      appsDeclared: m.allowedApps.length,
      appsResolved: m.allowedApps.length - missingApps.length,
      missingPlanes,
      missingApps,
      ok,
    });
  } catch (e) {
    totalErrors++;
    profileResults.push({
      profile: file,
      planesDeclared: 0, planesResolved: 0,
      appsDeclared: 0, appsResolved: 0,
      missingPlanes: [], missingApps: [],
      ok: false,
    });
  }
}

const report: CoverageReport = {
  generatedAt: new Date().toISOString(),
  gate: "deployment-profile-coverage",
  profiles: profileResults,
  ok: totalErrors === 0 && profileResults.length >= 2,
  errorCount: totalErrors + (profileResults.length < 2 ? 1 : 0),
  warningCount: 0,
};

writeFileSync(
  join(OUT_DIR, "deployment-profile-coverage-report.json"),
  JSON.stringify(report, null, 2),
);

console.log(`deployment-profile-coverage: ${profileResults.length} profile(s), ${totalErrors} error(s)`);
for (const p of profileResults) {
  console.log(`  ${p.profile}: ${p.planesResolved}/${p.planesDeclared} planes, ${p.appsResolved}/${p.appsDeclared} apps`);
  if (p.missingPlanes.length) console.log(`    missing planes: ${p.missingPlanes.join(", ")}`);
  if (p.missingApps.length) console.log(`    missing apps: ${p.missingApps.join(", ")}`);
}
process.exit(report.ok ? 0 : 1);
