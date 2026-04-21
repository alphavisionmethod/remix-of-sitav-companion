// ═══════════════════════════════════════════════════════════════
// SITA OS — Game-Day Orchestrator
// Defines canonical game-day scenarios for chaos/resilience drills
// ═══════════════════════════════════════════════════════════════

import type { GameDay } from "@/packages/simulation-contracts/chaos-types";

export interface GameDayScenario {
  scenario_id: string;
  name: string;
  description: string;
  kill_switch_to_test: string;
  runbook_to_validate: string;
  expected_detection_seconds: number;
  expected_recovery_seconds: number;
  blast_radius: string;
  category: "infrastructure" | "application" | "data" | "security" | "network";
  criticality: "critical" | "high" | "medium";
}

export const CANONICAL_SCENARIOS: GameDayScenario[] = [
  {
    scenario_id: "gd-db-latency",
    name: "Database Latency Spike",
    description: "Simulate 500ms+ latency on primary DB connections to verify query timeout handling and connection pool resilience.",
    kill_switch_to_test: "KS-DB-WRITES",
    runbook_to_validate: "RB-DB-LATENCY",
    expected_detection_seconds: 15,
    expected_recovery_seconds: 60,
    blast_radius: "service_mesh",
    category: "infrastructure",
    criticality: "critical",
  },
  {
    scenario_id: "gd-auth-degrade",
    name: "Auth Service Degradation",
    description: "Degrade auth token validation to 50% failure rate. Verify graceful session handling and cached-token fallback.",
    kill_switch_to_test: "KS-AUTH",
    runbook_to_validate: "RB-AUTH-DEGRADE",
    expected_detection_seconds: 10,
    expected_recovery_seconds: 30,
    blast_radius: "single_instance",
    category: "security",
    criticality: "critical",
  },
  {
    scenario_id: "gd-event-bus-fail",
    name: "Event Bus Failure",
    description: "Kill the realtime subscription channel. Verify UI degrades to polling and no data loss occurs.",
    kill_switch_to_test: "KS-REALTIME",
    runbook_to_validate: "RB-EVENT-BUS",
    expected_detection_seconds: 20,
    expected_recovery_seconds: 45,
    blast_radius: "single_instance",
    category: "application",
    criticality: "high",
  },
  {
    scenario_id: "gd-edge-timeout",
    name: "Edge Function Timeout Cascade",
    description: "Inject 30s+ response times into AI gateway function. Verify circuit breaker activates and fallback models engage.",
    kill_switch_to_test: "KS-AI-GATEWAY",
    runbook_to_validate: "RB-EDGE-TIMEOUT",
    expected_detection_seconds: 15,
    expected_recovery_seconds: 120,
    blast_radius: "service_mesh",
    category: "application",
    criticality: "high",
  },
  {
    scenario_id: "gd-storage-write-fail",
    name: "Storage Write Failure",
    description: "Block all writes to storage buckets. Verify upload queues buffer correctly and no silent data loss.",
    kill_switch_to_test: "KS-STORAGE",
    runbook_to_validate: "RB-STORAGE-FAIL",
    expected_detection_seconds: 20,
    expected_recovery_seconds: 90,
    blast_radius: "single_instance",
    category: "data",
    criticality: "high",
  },
  {
    scenario_id: "gd-network-partition",
    name: "Full Network Partition",
    description: "Simulate complete network isolation. Verify offline mode activates, local cache persists state, and recovery sync completes.",
    kill_switch_to_test: "KS-NETWORK",
    runbook_to_validate: "RB-NETWORK-PARTITION",
    expected_detection_seconds: 5,
    expected_recovery_seconds: 180,
    blast_radius: "region",
    category: "network",
    criticality: "critical",
  },
];

export function buildGameDay(
  name: string,
  scenarioIds: string[],
  facilitator: string,
): GameDay {
  return {
    game_day_id: `gd-${Date.now()}`,
    name,
    theme: "Production Resilience",
    drills: scenarioIds,
    date: new Date().toISOString(),
    duration_hours: 2,
    participants: ["ops-team", "platform-team"],
    observers: ["leadership"],
    facilitator,
    status: "planned",
  };
}