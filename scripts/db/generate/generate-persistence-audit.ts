#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Persistence-Critical Domain Audit
// Cross-references 9 persistence domains against schema-registry.
// Emits generated/persistence-audit.json
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";

const SCHEMA_PATH = "src/lib/db/schema-registry.ts";
if (!fs.existsSync(SCHEMA_PATH)) {
  console.error("❌ schema-registry.ts not found");
  process.exit(1);
}

const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
const tables: string[] = [];
const RE = /name:\s*"([a-z_]+)"/g;
let m: RegExpExecArray | null;
while ((m = RE.exec(schema)) !== null) tables.push(m[1]);

interface DomainSpec {
  key: string;
  label: string;
  patterns: RegExp[];
  required: boolean;
}

const DOMAINS: DomainSpec[] = [
  { key: "setup_checkpoints", label: "Setup checkpoints / resume tokens", patterns: [/setup/, /onboard/, /checkpoint/], required: true },
  { key: "device_registry", label: "Environment / device registry", patterns: [/device/, /biometric_credentials/, /trusted_device/], required: true },
  { key: "prompt_versions", label: "Prompt versions / model routing", patterns: [/prompt/, /ai_workforce_roles/, /model_/], required: true },
  { key: "model_provider_config", label: "Model / provider config", patterns: [/ai_workforce/, /provider/, /model_/], required: true },
  { key: "feature_flags", label: "Feature flags / kill switches", patterns: [/feature_flag/, /kill_switch/, /flag/], required: true },
  { key: "oauth_tokens", label: "OAuth tokens / connector state", patterns: [/connector_token/, /oauth/, /connector_/], required: true },
  { key: "workflow_runtime", label: "Workflow runtime state", patterns: [/workflow/, /command_steps/, /runtime_agent/], required: true },
  { key: "memory_persistence", label: "Memory objects / corrections", patterns: [/memory/, /memories/], required: true },
  { key: "action_proof_reversal", label: "Action / proof / reversal trail", patterns: [/proof/, /reversal/, /receipt/, /audit/, /timeline_event/], required: true },
];

const results = DOMAINS.map(d => {
  const matched = tables.filter(t => d.patterns.some(p => p.test(t)));
  return {
    key: d.key,
    label: d.label,
    required: d.required,
    backingTables: matched,
    coverage: matched.length,
    status: matched.length === 0 ? "missing" : matched.length < 2 ? "thin" : "covered",
  };
});

const summary = {
  totalDomains: DOMAINS.length,
  covered: results.filter(r => r.status === "covered").length,
  thin: results.filter(r => r.status === "thin").length,
  missing: results.filter(r => r.status === "missing").length,
};

writeJsonOutput("generated/persistence-audit.json", envelope("1.0.0", {
  totalTablesScanned: tables.length,
  summary,
  domains: results,
}));

console.log(`✅ persistence-audit: ${summary.covered}/${DOMAINS.length} covered, ${summary.thin} thin, ${summary.missing} missing`);
for (const r of results) {
  const icon = r.status === "covered" ? "✅" : r.status === "thin" ? "⚠️" : "❌";
  console.log(`  ${icon} ${r.label}: ${r.backingTables.length} table(s)`);
}
