// SITA OS — Admin Integrations Health Visibility (BLOCK gate)
//
// Asserts that the Integrations Hub exposes the streak panel and that the
// OAuth Refresh Health board uses the canonical ConnectorStateBadge plus the
// canonical receipt drawer & reauth CTA. Also greps remaining connector
// surfaces for forbidden duplicate local color maps.
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "admin-integrations-health-visibility";
const issues: GateIssue[] = [];

const HUB = "src/pages/admin/integrations/IntegrationsHome.tsx";
const STREAK = "src/components/admin/integrations/IntegrationStreakPanel.tsx";
const RECEIPT = "src/components/admin/integrations/IntegrationReceiptDrawer.tsx";
const OAUTH = "src/components/admin/OAuthRefreshHealthBoard.tsx";
const BADGE = "src/components/primitives/status/ConnectorStateBadge.tsx";

for (const f of [HUB, STREAK, RECEIPT, OAUTH, BADGE]) {
  if (!existsSync(f)) {
    issues.push({ severity: "error", area: "files", message: `Missing required file: ${f}` });
  }
}

if (existsSync(HUB)) {
  const src = readFileSync(HUB, "utf8");
  if (!src.includes("IntegrationStreakPanel")) {
    issues.push({
      severity: "error",
      area: "hub",
      message: "IntegrationsHome does not include IntegrationStreakPanel module",
    });
  }
  if (!src.includes("OAuthRefreshHealthBoard")) {
    issues.push({
      severity: "error",
      area: "hub",
      message: "IntegrationsHome does not include OAuthRefreshHealthBoard module",
    });
  }
}

if (existsSync(OAUTH)) {
  const src = readFileSync(OAUTH, "utf8");
  if (!src.includes("ConnectorStateBadge")) {
    issues.push({
      severity: "error",
      area: "oauth-board",
      message: "OAuthRefreshHealthBoard does not use the canonical ConnectorStateBadge",
    });
  }
  if (!src.includes("IntegrationReceiptDrawer")) {
    issues.push({
      severity: "error",
      area: "oauth-board",
      message: "OAuthRefreshHealthBoard does not open the IntegrationReceiptDrawer",
    });
  }
  if (!src.includes("ReauthCTAButton")) {
    issues.push({
      severity: "error",
      area: "oauth-board",
      message: "OAuthRefreshHealthBoard does not surface ReauthCTAButton",
    });
  }
}

// Forbidden local color maps in connector surfaces — must use canonical badge.
const REFACTORED = [
  "src/pages/admin/CN01ConnectorRealityOverview.tsx",
  "src/pages/admin/CN05ConnectorHealthBoard.tsx",
];
for (const f of REFACTORED) {
  if (!existsSync(f)) continue;
  const src = readFileSync(f, "utf8");
  if (/const\s+statusColors\s*:/.test(src)) {
    issues.push({
      severity: "error",
      area: "drift",
      message: `${f} still defines a local statusColors map — must use ConnectorStateBadge`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
