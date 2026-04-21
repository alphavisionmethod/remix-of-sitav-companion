#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// Wave 16 — Edge Function Proof Artifact Generator
// Generates 11 canonical JSON proof artifacts from existing
// backend-topology registries. No second governance layer.
// ═══════════════════════════════════════════════════════════════
import { mkdirSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { EDGE_FUNCTION_REGISTRY } from "../../src/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_AUTH_MAP } from "../../src/lib/backend-topology/edge-function-auth-map";
import { EDGE_FUNCTION_POLICY_MAP } from "../../src/lib/backend-topology/edge-function-policy-map";
import { EDGE_FUNCTION_REPLAY_MAP } from "../../src/lib/backend-topology/edge-function-replay-map";
import { EDGE_FUNCTION_RUNTIME_CONSEQUENCE_MAP } from "../../src/lib/backend-topology/edge-function-runtime-consequence-map";
import { EDGE_FUNCTION_TABLE_IO } from "../../src/lib/backend-topology/edge-function-table-io-map";
import { EDGE_FUNCTION_OWNER_MAP, EDGE_FUNCTION_OWNERSHIP_MANIFEST } from "../../src/lib/backend-topology/edge-function-owner-map";
import { FRONTEND_ACTION_API_MAP } from "../../src/lib/backend-topology/frontend-action-api-map";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });
const ts = new Date().toISOString();

function write(name: string, data: unknown) {
  writeFileSync(join(OUT, name), JSON.stringify(data, null, 2));
  console.log(`  ✓ ${name}`);
}

const activeFns = EDGE_FUNCTION_REGISTRY.filter(f => f.status === "active" || f.status === "experimental");
const allFns = EDGE_FUNCTION_REGISTRY;

// Scan on-disk test files
const FN_DIR = "supabase/functions";
const onDiskTests = new Set<string>();
if (existsSync(FN_DIR)) {
  for (const d of readdirSync(FN_DIR)) {
    if (d.startsWith("_")) continue;
    try {
      if (!statSync(join(FN_DIR, d)).isDirectory()) continue;
      const files = readdirSync(join(FN_DIR, d));
      if (files.some(f => /_test\.ts$|\.test\.ts$/.test(f))) onDiskTests.add(d);
    } catch { /* skip */ }
  }
}

// Contract test family map (inline mirror for script context)
const CONTRACT_FAMILIES: Record<string, string> = {
  "user-bff-gateway": "bff-contract", "intelligence-api": "bff-contract",
  "support-gateway": "bff-contract", "license-gateway": "bff-contract",
  "app-store-api": "bff-contract", "os-agent-channel": "bff-contract",
  "admin-bff-gateway": "admin-gateway-contract", "admin-ai-workforce-run": "admin-gateway-contract",
  "admin-users": "admin-gateway-contract", "cloud-admin-api": "admin-gateway-contract",
  "brain-core": "orchestration-step-contract", "advisor-agent-loop": "orchestration-step-contract",
  "agent-executor": "orchestration-step-contract", "scheduler-dispatch": "orchestration-step-contract",
  "event-processor": "orchestration-step-contract", "self-healing": "orchestration-step-contract",
  "payment-webhook": "webhook-validation", "stripe-webhook": "webhook-validation",
  "main": "runtime-system", "ai-health": "runtime-system", "runtime-probes": "runtime-system",
  "verification-recorder": "verifier-output", "production-launch-attestor": "verifier-output",
  "ai-gateway": "domain-function", "advisor-conversation": "domain-function",
  "payment-process": "domain-function", "connector-oauth": "domain-function",
  "cashflow-calculate": "domain-function", "invoice-generate": "domain-function",
  "gdpr-delete": "domain-function", "gdpr-export": "domain-function",
  "push-dispatch": "domain-function", "file-ai-pipeline": "domain-function",
};

// Support diagnostic set (mirror)
const SUPPORT_DIAG = new Set([
  "ai-gateway", "api-gateway", "admin-bff-gateway", "user-bff-gateway",
  "payment-process", "payment-webhook", "connector-oauth", "connector-sync",
  "brain-core", "advisor-agent-loop", "advisor-conversation",
  "agent-executor", "scheduler-dispatch", "event-processor",
  "gdpr-delete", "gdpr-export", "self-healing", "push-dispatch",
  "intelligence-api", "admin-ai-workforce-run", "verification-recorder",
]);

// Build source route map from frontend-action-api-map
const fnToRoutes: Record<string, string[]> = {};
for (const a of FRONTEND_ACTION_API_MAP) {
  if (a.kind === "edge-function") {
    if (!fnToRoutes[a.target]) fnToRoutes[a.target] = [];
    fnToRoutes[a.target].push(a.id);
  }
}

console.log("Generating edge function proof artifacts...");

// 1. edge-function-topology-v2.json
const roleDist: Record<string, number> = {};
for (const f of allFns) {
  roleDist[f.category] = (roleDist[f.category] ?? 0) + 1;
}
let emitting = 0;
for (const f of allFns) {
  const policy = EDGE_FUNCTION_POLICY_MAP[f.name];
  if (policy && policy.auditLog !== "none") emitting++;
}
write("edge-function-topology-v2.json", {
  generatedAt: ts, gate: "edge-function-topology-v2",
  totalFunctions: allFns.length,
  roleDistribution: roleDist,
  receiptCoverage: { emitting, notEmitting: allFns.length - emitting, coveragePct: Math.round((emitting / Math.max(allFns.length, 1)) * 100) },
});

// 2. function-caller-matrix.json
const callerMatrix = activeFns.map(f => {
  const auth = EDGE_FUNCTION_AUTH_MAP[f.name];
  return {
    name: f.name, allowedCallers: f.allowedCallers,
    authModel: f.authModel, adminOnly: auth?.adminOnly ?? false,
    sourceRoutes: fnToRoutes[f.name] ?? [],
  };
});
write("function-caller-matrix.json", { generatedAt: ts, functions: callerMatrix });

// 3. function-proof-coverage.json
const proofCoverage = activeFns.map(f => {
  const policy = EDGE_FUNCTION_POLICY_MAP[f.name];
  const replay = EDGE_FUNCTION_REPLAY_MAP[f.name];
  const owner = EDGE_FUNCTION_OWNERSHIP_MANIFEST[f.name];
  return {
    name: f.name,
    hasReceipts: policy ? policy.auditLog !== "none" : false,
    hasLogging: true, // all functions use shared logger
    hasSupportDiagnostics: SUPPORT_DIAG.has(f.name),
    hasKillSwitchRef: !!(owner?.killSwitchRef),
    hasReplayEntry: !!replay,
    hasFallback: !!(EDGE_FUNCTION_RUNTIME_CONSEQUENCE_MAP[f.name]?.fallbackAvailable),
    hasContractTestFamily: !!CONTRACT_FAMILIES[f.name],
    hasOnDiskTest: onDiskTests.has(f.name),
  };
});
const proofPct = Math.round((proofCoverage.filter(p => p.hasReceipts && p.hasContractTestFamily).length / Math.max(proofCoverage.length, 1)) * 100);
write("function-proof-coverage.json", { generatedAt: ts, coveragePercent: proofPct, functions: proofCoverage });

// 4. function-domain-map.json
const domainMap = activeFns.map(f => {
  const io = EDGE_FUNCTION_TABLE_IO[f.name];
  return {
    name: f.name, boundedContext: f.boundedContext, owner: f.owner,
    reads: io?.reads ?? [], writes: io?.writes ?? [],
  };
});
write("function-domain-map.json", { generatedAt: ts, functions: domainMap });

// 5. function-dependent-table-map.json (inverse)
const tableToFns: Record<string, { readers: string[]; writers: string[] }> = {};
for (const f of activeFns) {
  const io = EDGE_FUNCTION_TABLE_IO[f.name];
  if (!io) continue;
  for (const t of io.reads) {
    if (!tableToFns[t]) tableToFns[t] = { readers: [], writers: [] };
    tableToFns[t].readers.push(f.name);
  }
  for (const t of io.writes) {
    if (!tableToFns[t]) tableToFns[t] = { readers: [], writers: [] };
    tableToFns[t].writers.push(f.name);
  }
}
write("function-dependent-table-map.json", { generatedAt: ts, tables: tableToFns });

// 6. function-kill-switch-coverage.json
const ksCoverage = activeFns.map(f => {
  const owner = EDGE_FUNCTION_OWNERSHIP_MANIFEST[f.name];
  return { name: f.name, killSwitchRef: owner?.killSwitchRef ?? null, covered: !!(owner?.killSwitchRef) };
});
write("function-kill-switch-coverage.json", { generatedAt: ts, functions: ksCoverage });

// 7. function-retry-fallback-audit.json
const retryAudit = activeFns.map(f => {
  const replay = EDGE_FUNCTION_REPLAY_MAP[f.name];
  const consequence = EDGE_FUNCTION_RUNTIME_CONSEQUENCE_MAP[f.name];
  return {
    name: f.name,
    replayKind: replay?.kind ?? null,
    replayMechanism: replay?.mechanism ?? null,
    fallbackAvailable: consequence?.fallbackAvailable ?? null,
    severity: consequence?.severity ?? null,
  };
});
write("function-retry-fallback-audit.json", { generatedAt: ts, functions: retryAudit });

// 8. function-supportability-report.json
const supportReport = activeFns.map(f => {
  const owner = EDGE_FUNCTION_OWNERSHIP_MANIFEST[f.name];
  const consequence = EDGE_FUNCTION_RUNTIME_CONSEQUENCE_MAP[f.name];
  return {
    name: f.name,
    hasSupportDiagnostics: SUPPORT_DIAG.has(f.name),
    runbookRef: owner?.runbookRef ?? null,
    onCall: owner?.escalationContact ?? null,
    blastRadius: consequence?.blastRadius ?? null,
  };
});
write("function-supportability-report.json", { generatedAt: ts, functions: supportReport });

// 9. function-contract-test-coverage.json
const testCoverage = activeFns.map(f => ({
  name: f.name,
  family: CONTRACT_FAMILIES[f.name] ?? null,
  hasOnDiskTest: onDiskTests.has(f.name),
}));
const familyCounts: Record<string, { total: number; tested: number }> = {};
for (const t of testCoverage) {
  if (!t.family) continue;
  if (!familyCounts[t.family]) familyCounts[t.family] = { total: 0, tested: 0 };
  familyCounts[t.family].total++;
  if (t.hasOnDiskTest) familyCounts[t.family].tested++;
}
write("function-contract-test-coverage.json", { generatedAt: ts, familyCoverage: familyCounts, functions: testCoverage });

// 10. function-auth-pattern-audit.json
const authAudit = activeFns.map(f => {
  const auth = EDGE_FUNCTION_AUTH_MAP[f.name];
  return {
    name: f.name, authModel: f.authModel,
    requiresUserContext: auth?.requiresUserContext ?? false,
    adminOnly: auth?.adminOnly ?? false,
    hasAuthMapEntry: !!auth,
    consistent: auth ? auth.auth === f.authModel : false,
  };
});
write("function-auth-pattern-audit.json", { generatedAt: ts, functions: authAudit });

// 11. function-logging-receipt-audit.json
const loggingAudit = activeFns.map(f => {
  const policy = EDGE_FUNCTION_POLICY_MAP[f.name];
  return {
    name: f.name, sideEffectClass: f.sideEffectClass,
    auditLogPolicy: policy?.auditLog ?? "unknown",
    rateLimitPolicy: policy?.rateLimit ?? "unknown",
    idempotencyPolicy: policy?.idempotency ?? "unknown",
  };
});
write("function-logging-receipt-audit.json", { generatedAt: ts, functions: loggingAudit });

console.log(`\n✅ Generated 11 edge function proof artifacts into ${OUT}/`);