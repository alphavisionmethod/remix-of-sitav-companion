/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Deployability Contract Gate
// Phase 15 — asserts the 12-item VMware / ISO / Appliance Checklist
// against disk truth (build pipelines, systemd units, autoinstall,
// startup order, capability truthfulness).
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { APPLIANCE_DEPLOYABILITY_READINESS } from "../../../src/lib/runtime/appliance/release/appliance-deployability-readiness";
import { APPLIANCE_RUNTIME_CONTRACT } from "../../../src/lib/runtime/appliance/appliance-runtime-contract";

interface ApplianceIssue {
  severity: "error" | "warning";
  area: string;
  message: string;
}

const issues: ApplianceIssue[] = [];

function isExecutable(path: string): boolean {
  try {
    const m = statSync(path).mode & 0o111;
    return m !== 0;
  } catch {
    return false;
  }
}

// ── 1. Registry integrity ──────────────────────────────────────
let missingCount = 0;
for (const item of APPLIANCE_DEPLOYABILITY_READINESS) {
  if (item.status === "missing") {
    missingCount++;
    issues.push({ severity: "error", area: "registry", message: `Item "${item.id}" is MISSING` });
  }
  if (item.status === "partial" && !item.remediation) {
    issues.push({ severity: "error", area: "registry", message: `Partial item "${item.id}" lacks remediation` });
  }
  if (item.blocker && item.status !== "ready" && item.status !== "partial") {
    issues.push({
      severity: "error",
      area: "registry",
      message: `Blocker item "${item.id}" not ready (status=${item.status})`,
    });
  }
}

// ── 2. Build pipelines: ISO + OVA exist and are executable ─────
const buildIso = "scripts/release/appliance/build-iso.sh";
const buildOva = "scripts/release/vmware/build-ova.sh";
const buildIsoOk = existsSync(buildIso);
const buildOvaOk = existsSync(buildOva);
const buildIsoExec = buildIsoOk && isExecutable(buildIso);
const buildOvaExec = buildOvaOk && isExecutable(buildOva);
if (!buildIsoOk) issues.push({ severity: "error", area: "build", message: `${buildIso} missing` });
else if (!buildIsoExec) issues.push({ severity: "warning", area: "build", message: `${buildIso} not executable` });
if (!buildOvaOk) issues.push({ severity: "error", area: "build", message: `${buildOva} missing` });
else if (!buildOvaExec) issues.push({ severity: "warning", area: "build", message: `${buildOva} not executable` });

// ── 3. Runtime scripts exist and are executable ────────────────
const runtimeScripts = [
  "scripts/release/iso/sita-first-boot.sh",
  "scripts/release/iso/sita-ota-agent.sh",
  "scripts/release/iso/sita-backup.sh",
];
const scriptStatus: Record<string, { exists: boolean; executable: boolean }> = {};
for (const s of runtimeScripts) {
  const exists = existsSync(s);
  const exe = exists && isExecutable(s);
  scriptStatus[s] = { exists, executable: exe };
  if (!exists) issues.push({ severity: "error", area: "runtime-scripts", message: `${s} missing` });
  else if (!exe) issues.push({ severity: "warning", area: "runtime-scripts", message: `${s} not executable` });
}

// ── 4. systemd units present ───────────────────────────────────
const systemdUnits = [
  "scripts/release/iso/sita-os.service",
  "scripts/release/iso/sita-ota.service",
  "scripts/release/iso/sita-ota.timer",
  "scripts/release/iso/sita-backup.service",
  "scripts/release/iso/sita-backup.timer",
];
const systemdMissing: string[] = [];
for (const u of systemdUnits) {
  if (!existsSync(u)) {
    systemdMissing.push(u);
    issues.push({ severity: "error", area: "systemd", message: `${u} missing` });
  }
}

// ── 5. autoinstall configs present ─────────────────────────────
const autoinstall = [
  "scripts/release/iso/autoinstall/user-data",
  "scripts/release/iso/autoinstall/meta-data",
  "scripts/release/iso/autoinstall/network-config",
];
const autoinstallMissing: string[] = [];
for (const a of autoinstall) {
  if (!existsSync(a)) {
    autoinstallMissing.push(a);
    issues.push({ severity: "error", area: "autoinstall", message: `${a} missing` });
  }
}

// ── 6. OVF template present ────────────────────────────────────
const ovfTemplate = "scripts/release/templates/sita-os.ovf.template";
const ovfTemplateOk = existsSync(ovfTemplate);
if (!ovfTemplateOk) issues.push({ severity: "error", area: "ovf", message: `${ovfTemplate} missing` });

// ── 7. runtime-capability-matrix declares appliance column ─────
const matrixPath = "src/lib/runtime/runtime-capability-matrix.ts";
let matrixApplianceOk = false;
let matrixHasUnsupported = 0;
if (!existsSync(matrixPath)) {
  issues.push({ severity: "error", area: "matrix", message: `${matrixPath} missing` });
} else {
  const matrix = readFileSync(matrixPath, "utf8");
  matrixApplianceOk = /appliance\s*:\s*("native"|"fallback"|"unavailable")/.test(matrix);
  if (!matrixApplianceOk) {
    issues.push({
      severity: "error",
      area: "matrix",
      message: `${matrixPath} does not declare an appliance availability column.`,
    });
  }
  // Count rows missing the appliance: token (rough heuristic): every capability row should have it.
  const rows = matrix.match(/\{\s*capabilityId[^}]+\}/g) ?? [];
  for (const r of rows) {
    if (!/appliance\s*:/.test(r)) matrixHasUnsupported++;
  }
  if (matrixHasUnsupported > 0) {
    issues.push({
      severity: "error",
      area: "matrix",
      message: `${matrixHasUnsupported} capability rows in matrix lack an appliance column.`,
    });
  }
}

// ── 8. Truthfulness: no roadmap capability claimed as appliance:"native" ──
const roadmap = APPLIANCE_RUNTIME_CONTRACT.roadmapCapabilities;
const overclaims: string[] = [];
if (existsSync(matrixPath)) {
  const matrix = readFileSync(matrixPath, "utf8");
  for (const cap of roadmap) {
    // Pattern like { capabilityId: "tpm-attestation", ..., appliance: "native" }
    const re = new RegExp(`capabilityId\\s*:\\s*"${cap}"[^}]*appliance\\s*:\\s*"native"`);
    if (re.test(matrix)) overclaims.push(cap);
  }
  for (const c of overclaims) {
    issues.push({
      severity: "error",
      area: "truthfulness",
      message: `Capability "${c}" is in roadmapCapabilities but matrix marks appliance:"native" — overclaim.`,
    });
  }
}

// ── 9. startup-order present with ≥1 phase ─────────────────────
const startupOrder = "generated/startup-order.json";
let startupOrderPhases = 0;
let startupOrderServices = 0;
if (!existsSync(startupOrder)) {
  issues.push({ severity: "error", area: "startup-order", message: `${startupOrder} missing` });
} else {
  try {
    const json = JSON.parse(readFileSync(startupOrder, "utf8"));
    startupOrderPhases = Array.isArray(json.phases) ? json.phases.length : (typeof json.phaseCount === "number" ? json.phaseCount : 0);
    startupOrderServices = Array.isArray(json.services) ? json.services.length : (typeof json.serviceCount === "number" ? json.serviceCount : 0);
    if (startupOrderPhases < 1) {
      issues.push({ severity: "error", area: "startup-order", message: "startup-order.json has 0 phases" });
    }
  } catch (e) {
    issues.push({ severity: "warning", area: "startup-order", message: `${startupOrder} not valid JSON` });
  }
}

// ── 10. recovery-contract declares ≥1 boot-failure action ──────
const recoveryContract = "src/lib/runtime/appliance/recovery-contract.ts";
let recoveryActionCount = 0;
if (!existsSync(recoveryContract)) {
  issues.push({ severity: "error", area: "recovery", message: `${recoveryContract} missing` });
} else {
  const rc = readFileSync(recoveryContract, "utf8");
  const m = rc.match(/actionId\s*:/g);
  recoveryActionCount = m ? m.length : 0;
  if (recoveryActionCount < 1) {
    issues.push({
      severity: "error",
      area: "recovery",
      message: "recovery-contract.ts declares 0 recovery actions",
    });
  }
}

// ── Summary + report ───────────────────────────────────────────
const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;

const totals = {
  items: APPLIANCE_DEPLOYABILITY_READINESS.length,
  ready: APPLIANCE_DEPLOYABILITY_READINESS.filter((i) => i.status === "ready").length,
  partial: APPLIANCE_DEPLOYABILITY_READINESS.filter((i) => i.status === "partial").length,
  deferred: APPLIANCE_DEPLOYABILITY_READINESS.filter((i) => i.status === "deferred").length,
  missing: missingCount,
};

const report = {
  generatedAt: new Date().toISOString(),
  ok: errorCount === 0,
  errorCount,
  warningCount,
  totals,
  checks: {
    buildIsoExists: buildIsoOk,
    buildIsoExecutable: buildIsoExec,
    buildOvaExists: buildOvaOk,
    buildOvaExecutable: buildOvaExec,
    runtimeScripts: scriptStatus,
    systemdUnitsPresent: systemdUnits.length - systemdMissing.length,
    systemdUnitsTotal: systemdUnits.length,
    systemdMissing,
    autoinstallPresent: autoinstall.length - autoinstallMissing.length,
    autoinstallTotal: autoinstall.length,
    autoinstallMissing,
    ovfTemplateOk,
    matrixApplianceOk,
    matrixRowsMissingAppliance: matrixHasUnsupported,
    roadmapOverclaims: overclaims,
    startupOrderPhases,
    startupOrderServices,
    recoveryActionCount,
    registryClean: missingCount === 0,
  },
  items: APPLIANCE_DEPLOYABILITY_READINESS,
  issues,
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/appliance-deployability-report.json", JSON.stringify(report, null, 2));

console.log(
  `📦 appliance-deployability: items=${totals.items} ready=${totals.ready} partial=${totals.partial} ` +
    `deferred=${totals.deferred} missing=${totals.missing} errors=${errorCount} warnings=${warningCount}`,
);
for (const i of issues) {
  console.log(`  [${i.severity.toUpperCase()}] (${i.area}) ${i.message}`);
}

if (errorCount > 0) {
  console.error(`❌ check-appliance-deployability: ${errorCount} error(s)`);
  process.exit(1);
}
console.log(`✅ check-appliance-deployability passed (${warningCount} warning(s))`);
