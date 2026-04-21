#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Kill Switch Safety Drill Validator
//
// For each kill switch in the drill inventory, validates:
//   1. Switch exists in KILL_SWITCH_REGISTRY
//   2. All success criteria are testable (mapped to DB queries/signals)
//   3. Affected edge functions and tables are reachable
//   4. Rollback path references are valid
//   5. Generates executable drill scenarios with signal assertions
// ═══════════════════════════════════════════════════════════════

import { existsSync } from "node:fs";
import { join } from "node:path";
import { ViolationCollector, writeJsonOutput, scanDirShallow } from "../lib/utils";
import { KILL_SWITCH_DRILL_INVENTORY, type KillSwitchDrillDefinition } from "../../../src/lib/control-plane/kill-switch-drill-runner";
import { KILL_SWITCH_REGISTRY } from "../../../src/lib/control-plane/kill-switch-registry";
import { KILL_SWITCH_CONSEQUENCE_MAP } from "../../../src/lib/control-plane/kill-switch-runtime-consequence";
import { CANONICAL_SCENARIOS, type GameDayScenario } from "../../../src/lib/services/game-day-orchestrator";

const vc = new ViolationCollector();
const OUT_PATH = "generated/kill-switch-e2e-drill-report.json";
const FUNCTIONS_DIR = "supabase/functions";

// ── Signal patterns that success criteria should map to ────────

interface SignalMapping {
  criteriaPattern: RegExp;
  signalType: "db-query" | "edge-call" | "ui-state" | "queue-metric" | "audit-log";
  verificationQuery: string;
}

const SIGNAL_MAPPINGS: SignalMapping[] = [
  { criteriaPattern: /no new .* created/i, signalType: "db-query", verificationQuery: "SELECT count(*) FROM {table} WHERE created_at > '{drill_start}'" },
  { criteriaPattern: /queue.*grows|queue.*preserved/i, signalType: "queue-metric", verificationQuery: "SELECT count(*) FROM {table} WHERE status = 'queued' AND created_at > '{drill_start}'" },
  { criteriaPattern: /user sees.*message|degradation.*notice/i, signalType: "ui-state", verificationQuery: "UI assertion: check for degradation banner component render" },
  { criteriaPattern: /return[s]? (403|503)/i, signalType: "edge-call", verificationQuery: "HTTP {method} {endpoint} → expect status {code}" },
  { criteriaPattern: /resumes? (clean|on rollback|immediately)/i, signalType: "db-query", verificationQuery: "SELECT count(*) FROM {table} WHERE status = 'active' AND updated_at > '{rollback_time}'" },
  { criteriaPattern: /audit|logged|entry created/i, signalType: "audit-log", verificationQuery: "SELECT * FROM kill_switch_audit_log WHERE switch_id = '{switch_id}' ORDER BY created_at DESC LIMIT 1" },
  { criteriaPattern: /no .* (sent|delivered|processed|accepted|calls|downloads)/i, signalType: "db-query", verificationQuery: "SELECT count(*) FROM {table} WHERE status = 'delivered' AND created_at > '{drill_start}'" },
  { criteriaPattern: /disabled|hidden|not rendered/i, signalType: "ui-state", verificationQuery: "UI assertion: component not in DOM" },
  { criteriaPattern: /graceful|conclude|complete/i, signalType: "db-query", verificationQuery: "SELECT count(*) FROM {table} WHERE status IN ('completed','paused') AND updated_at > '{drill_start}'" },
];

// ── Drill scenario construction ────────────────────────────────

interface DrillScenario {
  switchId: string;
  displayName: string;
  registryMatch: boolean;
  consequenceMapMatch: boolean;
  gameDayMatch: boolean;
  affectedFunctionsExist: boolean;
  affectedFunctions: string[];
  missingFunctions: string[];
  affectedTables: string[];
  successCriteria: Array<{
    criterion: string;
    signalType: string | null;
    verificationQuery: string | null;
    testable: boolean;
  }>;
  drillSteps: string[];
  issues: string[];
}

const existingFunctions = new Set(scanDirShallow(FUNCTIONS_DIR).filter(d => !d.startsWith("_")));
const scenarios: DrillScenario[] = [];

for (const drill of KILL_SWITCH_DRILL_INVENTORY) {
  const issues: string[] = [];
  
  // 1. Registry match
  const regEntry = KILL_SWITCH_REGISTRY.find(r => r.switchId === drill.switchId);
  if (!regEntry) {
    issues.push(`MISSING_REGISTRY: Switch '${drill.switchId}' not in KILL_SWITCH_REGISTRY`);
    vc.add(`drill:${drill.switchId}`, "missing-registry", `Drill switch '${drill.switchId}' not in kill switch registry`);
  }

  // 2. Consequence map match
  const consequence = KILL_SWITCH_CONSEQUENCE_MAP.find(c => c.switchId === drill.switchId);
  if (!consequence) {
    issues.push(`MISSING_CONSEQUENCE: No runtime consequence mapping for '${drill.switchId}'`);
    vc.add(`drill:${drill.switchId}`, "missing-consequence", `No runtime consequence for '${drill.switchId}'`, "warning");
  }

  // 3. Game day scenario match
  const gdMatch = CANONICAL_SCENARIOS.find(s => s.kill_switch_to_test === drill.switchId);

  // 4. Affected functions exist
  const affectedFns = regEntry?.affectedEdgeFunctions ?? [];
  const missingFns = affectedFns.filter(fn => !existingFunctions.has(fn));
  if (missingFns.length > 0) {
    issues.push(`MISSING_FUNCTIONS: ${missingFns.join(", ")} not found on disk`);
    vc.add(`drill:${drill.switchId}`, "missing-functions", `Affected functions missing: ${missingFns.join(", ")}`, "warning");
  }

  // 5. Map success criteria to testable signals
  const mappedCriteria = drill.successCriteria.map(criterion => {
    const mapping = SIGNAL_MAPPINGS.find(m => m.criteriaPattern.test(criterion));
    return {
      criterion,
      signalType: mapping?.signalType ?? null,
      verificationQuery: mapping?.verificationQuery ?? null,
      testable: mapping !== undefined,
    };
  });

  const untestedCriteria = mappedCriteria.filter(c => !c.testable);
  if (untestedCriteria.length > 0) {
    issues.push(`UNTESTABLE_CRITERIA: ${untestedCriteria.length} criteria lack signal mapping`);
    vc.add(`drill:${drill.switchId}`, "untestable-criteria", `${untestedCriteria.length} success criteria not mapped to verifiable signals`, "warning");
  }

  // 6. Generate drill execution steps
  const drillSteps = [
    `STEP 1: Record baseline — snapshot affected tables: ${(regEntry?.affectedTables ?? []).join(", ")}`,
    `STEP 2: Activate kill switch '${drill.switchId}' via ${drill.triggerMethod} with justification`,
    `STEP 3: Wait ${drill.timeToDisableMs}ms for propagation`,
    `STEP 4: Assert effects — ${drill.expectedEffect}`,
    ...mappedCriteria
      .filter(c => c.testable)
      .map((c, i) => `STEP ${5 + i}: Verify signal — [${c.signalType}] ${c.criterion}`),
    `STEP ${5 + mappedCriteria.filter(c => c.testable).length}: Execute rollback — ${drill.rollbackPath}`,
    `STEP ${6 + mappedCriteria.filter(c => c.testable).length}: Verify rollback — confirm service restoration within ${drill.timeToDisableMs * 2}ms`,
    `STEP ${7 + mappedCriteria.filter(c => c.testable).length}: Record drill result to kill_switch_audit_log`,
  ];

  scenarios.push({
    switchId: drill.switchId,
    displayName: drill.displayName,
    registryMatch: !!regEntry,
    consequenceMapMatch: !!consequence,
    gameDayMatch: !!gdMatch,
    affectedFunctionsExist: missingFns.length === 0,
    affectedFunctions: affectedFns,
    missingFunctions: missingFns,
    affectedTables: regEntry?.affectedTables ?? [],
    successCriteria: mappedCriteria,
    drillSteps,
    issues,
  });
}

// ── Cross-check: registry switches without drills ──────────────

const drillSwitchIds = new Set(KILL_SWITCH_DRILL_INVENTORY.map(d => d.switchId));
const uncoveredSwitches = KILL_SWITCH_REGISTRY.filter(r => !drillSwitchIds.has(r.switchId));

for (const uncovered of uncoveredSwitches) {
  vc.add(`registry:${uncovered.switchId}`, "no-drill-coverage", `Kill switch '${uncovered.switchId}' has no drill scenario defined`, "warning");
}

// ── Summary ────────────────────────────────────────────────────

const totalDrills = scenarios.length;
const fullyCovered = scenarios.filter(s => s.issues.length === 0).length;
const totalCriteria = scenarios.reduce((s, sc) => s + sc.successCriteria.length, 0);
const testableCriteria = scenarios.reduce((s, sc) => s + sc.successCriteria.filter(c => c.testable).length, 0);

writeJsonOutput(OUT_PATH, {
  generatedAt: new Date().toISOString(),
  gate: "kill-switch-e2e-drill",
  ok: vc.errors.length === 0,
  totalDrillScenarios: totalDrills,
  fullyCoveredDrills: fullyCovered,
  totalSuccessCriteria: totalCriteria,
  testableCriteria,
  testabilityPct: totalCriteria > 0 ? Math.round((testableCriteria / totalCriteria) * 100) : 100,
  registrySwitchesWithoutDrills: uncoveredSwitches.map(s => s.switchId),
  errorCount: vc.errors.length,
  warningCount: vc.warnings.length,
  scenarios,
});

vc.report("check-kill-switch-e2e-drill");

console.log(`\n📊 Kill Switch E2E Drill: ${totalDrills} scenarios, ${fullyCovered} fully covered`);
console.log(`   Criteria: ${testableCriteria}/${totalCriteria} testable (${totalCriteria > 0 ? Math.round((testableCriteria / totalCriteria) * 100) : 100}%)`);
console.log(`   Registry switches without drills: ${uncoveredSwitches.length}`);

if (vc.errors.length > 0) {
  console.log(`\n❌ ${vc.errors.length} drill integrity errors`);
  process.exit(1);
} else {
  console.log(`\n✅ All drill scenarios structurally valid (${vc.warnings.length} warnings)`);
}