#!/usr/bin/env node
// SITA OS — Wave 7b: Per-folder classification of src/lib/services
// Reads every immediate child of src/lib/services and assigns a canonical
// destination based on name/content heuristics. Output is consumed by
// the migrate step but DOES NOT MOVE FILES — humans approve the map first.

import * as fs from "fs";
import * as path from "path";

type Klass = "domain" | "platform" | "data" | "runtime" | "integration" | "contract" | "shared-internal" | "legacy";
type Entry = { name: string; isDir: boolean; files: number; klass: Klass; target: string; reason: string };

const ROOT = path.resolve("src/lib/services");
const OUT_JSON = "generated/lib-decomposition/services-unclassified-classification.json";
const OUT_MD = "generated/lib-decomposition/SERVICES_UNCLASSIFIED_CLASSIFICATION.md";

// Heuristic routing table — folder/file basename → (klass, target prefix, reason)
const ROUTE: Array<{ match: RegExp; klass: Klass; targetDir: string; reason: string }> = [
  // Domain (business contexts)
  { match: /^(business-os|revenue-autopilot|revenue-growth|revenue-leak-detector|revenue-ticker|opportunity-(engine|graph|radar)|lead-.*|client-sentiment|website-management|booking-scheduling|autonomous-negotiation|relationship-intelligence|attribution-analytics|competitive-intelligence|chief-of-staff|founder-orchestrator|owner-control-room)$/i, klass: "domain", targetDir: "src/domains/business", reason: "business-context" },
  { match: /^(finance-os|capital-allocation|sovereign-calculation|payment-execution-service|billing|sovereign-exporter)/i, klass: "domain", targetDir: "src/domains/finance", reason: "finance-context" },
  { match: /^(concierge-os|family-(command-center|constitution)|household-org-graph|legacy-planning|digital-legacy-vault|life-(growth|score|simulation)|compound-life-score|habit-tracker|personal-(graph|operating-model)|sovereign-time|time-wealth|timeline-calendar|routine-detector)/i, klass: "domain", targetDir: "src/domains/concierge", reason: "concierge-context" },
  { match: /^(boardroom-(bridge|service)|board-api-client|advisor-(feedback|knowledge|memory)|council-orchestrator|multi-agent-debate|decision-intelligence|natural-language-policy)/i, klass: "domain", targetDir: "src/domains/boardroom", reason: "boardroom-context" },
  { match: /^(ai-workforce|ai-economics|ai-memory-graph)/i, klass: "domain", targetDir: "src/domains/ai-workforce", reason: "ai-workforce" },
  { match: /^(app-store|app-ingestion|native-apps|pack-management-service|widget-marketplace)/i, klass: "domain", targetDir: "src/domains/apps", reason: "apps-domain" },
  { match: /^(setup|onboarding|onboarding-daemon|integration-concierge)/i, klass: "domain", targetDir: "src/domains/setup", reason: "setup-context" },
  { match: /^(release-intelligence|launch-readiness|launch-gate|engineering-governance|platform-readiness)/i, klass: "domain", targetDir: "src/domains/strategic-intelligence", reason: "release/governance domain" },

  // Data layer
  { match: /^(database|projections?|projection-service|persistence|offline-(queue|sync)|session-persistence|boot-persistence|release-persistence-service|universal-state-sync)/i, klass: "data", targetDir: "src/data/persistence", reason: "persistence" },

  // Integration
  { match: /^(integration-hub|google-provider-family|provider-family|messaging-gateway|push-notification|connector-runners|connector-control-plane|connector-truth|connector-health-service|connector-notification-honesty-seed|realtime-gateway|inference-gateway)/i, klass: "integration", targetDir: "src/integrations/external", reason: "external-provider" },

  // Runtime / device / surface
  { match: /^(device-mesh|trusted-device|biometric-auth|edge-device-runtime|fleet|fleet-health|fleet-ota|surface-detection|surface-portability|domain-runtime|sita-modes|window-physics|adaptive-visual-system|ambient-context-engine|background-intelligence|predictive-prefetch|os-awareness)/i, klass: "runtime", targetDir: "src/runtimes/core", reason: "runtime-substrate" },

  // Platform — security
  { match: /^(security|security-privacy|tenant-firewall|injection-firewall|fraud-sentinel|duress-detection|keyvault|trust-(actions|governor|state-service)|epistemic-firewall|conscience-gate)/i, klass: "platform", targetDir: "src/platform/security", reason: "platform-security" },
  // Platform — observability
  { match: /^(observability|observability-hub|alerting|anomaly-alert|performance-monitor|error-monitoring-service|audit-(ledger|trail-timeline)|golden-trace-runner)/i, klass: "platform", targetDir: "src/platform/observability", reason: "platform-observability" },
  // Platform — orchestration / brain / pipelines
  { match: /^(brain-core|orchestration-pipeline|canonical-pipeline|os-orchestration|os-unification|ecosystem-orchestrator|intent-orchestrator|recommendation-execution|proof-orchestrator|flagship-loops|outcome-engine|rex|protocol-bridge|handoff|executor-service|workflow-engine|capability-router|operating-autopilot)/i, klass: "platform", targetDir: "src/platform/orchestration", reason: "orchestration" },
  // Platform — AI gateway / memory / model routing
  { match: /^(ai-gateway|model-router|prompt-assembler|memory-(governance|service)|mnemosyne|self-learning|self-healing|immune-controller|explainability|accuracy-classifier|adaptive-interface|personalization-engine|predictive-(intent|needs)|attention-os|experience-signature|context-graph|opportunity-graph|workspace-intelligence|timing-intelligence|digest-(engine|journal))/i, klass: "platform", targetDir: "src/platform/ai", reason: "platform-ai" },
  // Platform — control / governance / admin
  { match: /^(cloud-control-plane-infra|enterprise-control-plane|admin-(service|route-truth-service)|action-(queue|safety)|approval-engine|governance-simulator|incident-management|launch-gate|emergency-halt|degraded-mode|memory-governance|meta-governance|policy-engine|constitution-(compiler|engine)|family-constitution|role-permission-engine|service-registry|truth-indices|verification-engine|update-daemon|system-updates|notifications|search-fabric|i18n|preferences|profiles|identity|identity-auth|auth|api-gateway|ci-launch-gate-service|continuity-engine|digital-twins|entity-graph|event-bus|file-ingestion|lease-manager|life-simulation|onboarding|simulator|support-diagnostics|desk|intent-inbox|communication-service|document-(engine|signature)|data-scope-model|boundary-engine|architecture|frontend|auto-proposal|board-api-client)/i, klass: "platform", targetDir: "src/platform/core-services", reason: "platform-core-service" },

  // Tests stay with sources
  { match: /^__tests__$/i, klass: "shared-internal", targetDir: "src/lib/__tests__", reason: "tests-stay" },
  { match: /^index\.ts$/, klass: "shared-internal", targetDir: "src/lib/services", reason: "barrel-stay" },
];

function classify(name: string): { klass: Klass; targetDir: string; reason: string } {
  for (const r of ROUTE) {
    if (r.match.test(name)) return { klass: r.klass, targetDir: r.targetDir, reason: r.reason };
  }
  return { klass: "platform", targetDir: "src/platform/services-unclassified", reason: "fallback-needs-review" };
}

function countFiles(p: string): number {
  if (!fs.existsSync(p)) return 0;
  const st = fs.statSync(p);
  if (st.isFile()) return 1;
  let n = 0;
  for (const e of fs.readdirSync(p)) n += countFiles(path.join(p, e));
  return n;
}

function main() {
  if (!fs.existsSync(ROOT)) {
    console.error("src/lib/services not found");
    process.exit(0);
  }
  const entries: Entry[] = [];
  for (const name of fs.readdirSync(ROOT).sort()) {
    const full = path.join(ROOT, name);
    const st = fs.statSync(full);
    const c = classify(name);
    entries.push({
      name,
      isDir: st.isDirectory(),
      files: countFiles(full),
      klass: c.klass,
      target: `${c.targetDir}/${name.replace(/\.tsx?$/, "")}`,
      reason: c.reason,
    });
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify({ generatedAt: new Date().toISOString(), totalEntries: entries.length, totalFiles: entries.reduce((s, e) => s + e.files, 0), entries }, null, 2));

  // MD report
  const byClass = new Map<string, Entry[]>();
  for (const e of entries) {
    if (!byClass.has(e.klass)) byClass.set(e.klass, []);
    byClass.get(e.klass)!.push(e);
  }
  const lines: string[] = [];
  lines.push("# Wave 7b — services-unclassified Classification");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Total entries scanned: ${entries.length}`);
  lines.push(`Total files covered: ${entries.reduce((s, e) => s + e.files, 0)}`);
  lines.push("");
  lines.push("## Class Summary");
  lines.push("");
  lines.push("| Class | Entries | Files |");
  lines.push("|---|---:|---:|");
  for (const [k, list] of [...byClass.entries()].sort()) {
    lines.push(`| ${k} | ${list.length} | ${list.reduce((s, e) => s + e.files, 0)} |`);
  }
  for (const [k, list] of [...byClass.entries()].sort()) {
    lines.push("");
    lines.push(`## ${k}`);
    lines.push("");
    lines.push("| Entry | Files | Target | Reason |");
    lines.push("|---|---:|---|---|");
    for (const e of list.sort((a, b) => b.files - a.files)) {
      lines.push(`| \`${e.name}\` | ${e.files} | \`${e.target}\` | ${e.reason} |`);
    }
  }
  fs.writeFileSync(OUT_MD, lines.join("\n"));
  console.log(`✅ Wrote ${OUT_JSON} (${entries.length} entries) and ${OUT_MD}`);

  // Print summary
  for (const [k, list] of [...byClass.entries()].sort()) {
    console.log(`  ${k.padEnd(18)} ${String(list.length).padStart(4)} entries  ${list.reduce((s, e) => s + e.files, 0)} files`);
  }
}
main();
