#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Runbook Surface Wiring (BLOCK gate #28)
//
// Asserts the runbook surface is wired into the canonical 12-domain IA:
//  1) ADMIN_ROUTE_REGISTRY declares /admin/support/runbooks (subnav, support,
//     component=FCC04RunbookCenter, workflow=support, permission=maintenance.view)
//  2) ADMIN_ROUTE_REGISTRY declares /admin/support/runbooks/:id (explorer,
//     component=AdminRunbookViewerPage)
//  3) AdminRoutes.tsx mounts /admin/support/runbooks
//  4) SupportHome HubModule[] includes id="runbooks" pointing at canonical path
//  5) Legacy /admin/founder/runbooks is marked nav:"deprecated"
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

interface Issue { severity: "error" | "warning"; area: string; message: string; }
const issues: Issue[] = [];

const REGISTRY = "src/platform/architecture/admin-route-registry.ts";
const ROUTES = "src/routes/AdminRoutes.tsx";
const HUB = "src/pages/admin/support/SupportHome.tsx";

function readOrFail(p: string): string {
  if (!existsSync(p)) {
    issues.push({ severity: "error", area: "missing", message: `Required file missing: ${p}` });
    return "";
  }
  return readFileSync(p, "utf8");
}

const reg = readOrFail(REGISTRY);
const routes = readOrFail(ROUTES);
const hub = readOrFail(HUB);

// 1) Canonical subnav entry
const canonicalRe = /path:\s*"\/admin\/support\/runbooks"[^}]*domain:\s*"support"[^}]*nav:\s*"subnav"[^}]*component:\s*"FCC04RunbookCenter"/s;
if (!canonicalRe.test(reg)) {
  issues.push({
    severity: "error",
    area: "registry",
    message: "ADMIN_ROUTE_REGISTRY missing canonical /admin/support/runbooks (subnav, support, FCC04RunbookCenter)",
  });
}
if (!/\/admin\/support\/runbooks"[^}]*permission:\s*"maintenance\.view"/s.test(reg)) {
  issues.push({ severity: "error", area: "registry", message: "Canonical runbook entry missing permission=maintenance.view" });
}
if (!/\/admin\/support\/runbooks"[^}]*workflows:\s*\["support"\]/s.test(reg)) {
  issues.push({ severity: "error", area: "registry", message: "Canonical runbook entry missing workflows=[support]" });
}

// 2) Deep-link viewer entry
const viewerRe = /path:\s*"\/admin\/support\/runbooks\/:id"[^}]*nav:\s*"explorer"[^}]*component:\s*"AdminRunbookViewerPage"/s;
if (!viewerRe.test(reg)) {
  issues.push({
    severity: "error",
    area: "registry",
    message: "ADMIN_ROUTE_REGISTRY missing /admin/support/runbooks/:id (explorer, AdminRunbookViewerPage)",
  });
}

// 5) Legacy deprecation
const legacyRe = /path:\s*"\/admin\/founder\/runbooks"[^}]*nav:\s*"deprecated"[^}]*replacedBy:\s*"\/admin\/support\/runbooks"/s;
if (!legacyRe.test(reg)) {
  issues.push({
    severity: "error",
    area: "registry",
    message: "Legacy /admin/founder/runbooks must be nav:\"deprecated\" with replacedBy:/admin/support/runbooks",
  });
}

// 3) Canonical route mount
if (!/path="\/admin\/support\/runbooks"\s+element=\{gated\("maintenance\.view",\s*<FCC04RunbookCenter\s*\/>\)\}/.test(routes)) {
  issues.push({
    severity: "error",
    area: "route-mount",
    message: "AdminRoutes.tsx does not mount canonical /admin/support/runbooks via gated FCC04RunbookCenter",
  });
}

// 4) Hub tab + canonical legacyPath
if (!/id:\s*"runbooks"/.test(hub)) {
  issues.push({ severity: "error", area: "hub", message: "SupportHome HubModule[] missing id=\"runbooks\" entry" });
}
if (!/legacyPath:\s*"\/admin\/support\/runbooks"/.test(hub)) {
  issues.push({
    severity: "error",
    area: "hub",
    message: "SupportHome runbooks HubModule legacyPath must be /admin/support/runbooks (canonical)",
  });
}

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync(
  "generated/admin-runbook-surface-report.json",
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    gate: "admin-runbook-surface-wiring",
    phase: "phase-28-runbook-ia-wiring",
    canonicalSubnav: canonicalRe.test(reg),
    canonicalViewer: viewerRe.test(reg),
    legacyDeprecated: legacyRe.test(reg),
    canonicalRouteMounted: /path="\/admin\/support\/runbooks"/.test(routes),
    hubModuleWired: /id:\s*"runbooks"/.test(hub) && /legacyPath:\s*"\/admin\/support\/runbooks"/.test(hub),
    errorCount,
    warningCount,
    ok,
    issues,
  }, null, 2)
);

console.log(`Admin runbook surface wiring: ${ok ? "✅ OK" : `❌ ${errorCount} errors`}`);
if (!ok) {
  for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
