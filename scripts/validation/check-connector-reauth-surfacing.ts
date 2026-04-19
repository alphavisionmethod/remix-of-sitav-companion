#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// check-connector-reauth-surfacing
//
// Canonical PART-6 gate from Connector Truth Closure spec.
//
// Asserts:
//   1. Every reauth_required token in DB truth has a matching UI surface
//      (ConnectorStateBadge + admin OAuth refresh health board both
//      render the canonical 'reauth_required' state).
//   2. Connector-specific reauth surfacing exists in the canonical
//      ConnectorTruthSummaryPanel (admin AI Engineer hub).
//   3. The reauth count in connector-reauth-status.json is reflected
//      consistently — no silent ambiguous "connected" state for any
//      token whose lifecycle_state = 'reauth_required'.
//
// Reuses _lib/emit-gate-report. No new tables, no new dashboards.
// ═══════════════════════════════════════════════════════════════
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const ARTIFACT = "generated/connector-truth-closure/connector-reauth-status.json";

interface ReauthArtifact {
  generatedAt: string;
  reauth_required_count_24h: number;
  per_provider: Record<string, number>;
}

function grepCount(needle: string, dirs: string[]): number {
  try {
    const dirArgs = dirs.filter((d) => existsSync(d)).join(" ");
    if (!dirArgs) return 0;
    const out = execSync(
      `grep -rl ${JSON.stringify(needle)} ${dirArgs} 2>/dev/null || true`,
      { encoding: "utf-8" },
    );
    return out.trim().split("\n").filter(Boolean).length;
  } catch {
    return 0;
  }
}

function main() {
  const issues: GateIssue[] = [];

  // ── 1. Canonical artifact must exist ───────────────────────────
  if (!existsSync(ARTIFACT)) {
    issues.push({
      severity: "error",
      area: "artifact",
      message: `${ARTIFACT} not found — run 'npm run connector:truth:emit' first`,
    });
    emitGateReport({ gate: "connector-reauth-surfacing", ok: false, issues });
    console.log("❌ connector-reauth-surfacing: missing artifact");
    process.exit(1);
  }

  const reauth: ReauthArtifact = JSON.parse(readFileSync(ARTIFACT, "utf-8"));

  // ── 2. ConnectorStateBadge must render reauth_required ─────────
  const badgePath = "src/components/primitives/status/ConnectorStateBadge.tsx";
  const grammarPath = "src/lib/connectors/connector-state-grammar.ts";
  let grammarHasReauth = false;
  if (existsSync(grammarPath)) {
    const grammar = readFileSync(grammarPath, "utf-8");
    grammarHasReauth = /reauth_required/.test(grammar);
  }
  if (!existsSync(badgePath)) {
    issues.push({
      severity: "error",
      area: "ui-primitive",
      message: "ConnectorStateBadge primitive missing",
    });
  } else if (!grammarHasReauth) {
    issues.push({
      severity: "error",
      area: "state-grammar",
      message: "connector-state-grammar.ts does not declare reauth_required",
    });
  }

  // ── 3. Admin OAuth refresh health board surfaces reauth ────────
  const adminDirs = ["src/components", "src/pages"];
  const reauthRenderCount = grepCount("reauth_required", adminDirs);
  if (reauthRenderCount < 3) {
    issues.push({
      severity: "error",
      area: "admin-surface",
      message: `Only ${reauthRenderCount} surfaces render reauth_required (need ≥3: badge consumer + OAuth board + truth panel)`,
    });
  }

  // ── 4. ConnectorTruthSummaryPanel must surface reauth count ────
  const truthPanel = "src/components/admin/ai-runtime/ConnectorTruthSummaryPanel.tsx";
  if (!existsSync(truthPanel)) {
    issues.push({
      severity: "error",
      area: "ai-engineer-hub",
      message: "ConnectorTruthSummaryPanel missing from admin AI Engineer hub",
    });
  } else {
    const panelSrc = readFileSync(truthPanel, "utf-8");
    if (!/reauth/i.test(panelSrc)) {
      issues.push({
        severity: "error",
        area: "ai-engineer-hub",
        message: "ConnectorTruthSummaryPanel does not surface reauth state",
      });
    }
  }

  // ── 5. OAuthRefreshHealthBoard must exist (canonical admin surface)
  const healthBoardCandidates = grepCount("OAuthRefreshHealthBoard", ["src"]);
  if (healthBoardCandidates < 1) {
    issues.push({
      severity: "error",
      area: "admin-surface",
      message: "OAuthRefreshHealthBoard not present in admin surfaces",
    });
  }

  // ── 6. Truth-vs-UI consistency: if DB has reauth tokens, UI MUST
  //     show them (no silent ambiguous connected state).
  if (reauth.reauth_required_count_24h > 0 && reauthRenderCount === 0) {
    issues.push({
      severity: "error",
      area: "truth-consistency",
      message: `${reauth.reauth_required_count_24h} reauth tokens in DB but 0 UI surfaces render reauth_required — silent ambiguous state`,
    });
  }

  const ok = issues.filter((i) => i.severity === "error").length === 0;
  emitGateReport({
    gate: "connector-reauth-surfacing",
    ok,
    issues,
    extra: {
      reauthCount24h: reauth.reauth_required_count_24h,
      perProvider: reauth.per_provider,
      uiRenderSurfaces: reauthRenderCount,
    },
  });
  console.log(
    `${ok ? "✅" : "❌"} connector-reauth-surfacing: ${reauth.reauth_required_count_24h} reauth tokens, ${reauthRenderCount} UI surfaces, ${issues.length} issues`,
  );
  process.exit(ok ? 0 : 1);
}

main();
