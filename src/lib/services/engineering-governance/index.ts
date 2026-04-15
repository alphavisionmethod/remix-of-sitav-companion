// ═══════════════════════════════════════════════════════════════
// SITA OS — Engineering Governance Service
// Self-regulating validation, simulation, rollback, chaos, standards
// ═══════════════════════════════════════════════════════════════

export type ValidationStage =
  | "author_proposal"
  | "independent_review"
  | "static_analysis"
  | "test_generation"
  | "security_scan"
  | "policy_gate"
  | "simulation"
  | "canary_rollout"
  | "health_check"
  | "rollback_ready";

export type StageStatus = "pending" | "running" | "passed" | "failed" | "skipped" | "blocked";

export interface ValidationStageResult {
  stage: ValidationStage;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  duration_ms?: number;
  findings: string[];
  blockers: string[];
  confidence: number;
  agent_id?: string;
}

export interface ValidationPipelineRun {
  id: string;
  change_id: string;
  change_title: string;
  author_agent_id: string;
  reviewer_agent_id: string | null;
  stages: ValidationStageResult[];
  overall_status: "in_progress" | "passed" | "failed" | "blocked";
  author_equals_reviewer: boolean;
  created_at: string;
  completed_at?: string;
}

export interface BuilderCriticExchange {
  id: string;
  change_id: string;
  builder_proposal: string;
  builder_rationale: string;
  critic_attacks: CriticAttack[];
  arbiter_decision?: ArbiterDecision;
  status: "open" | "resolved" | "escalated";
  unresolved_count: number;
  created_at: string;
}

export interface CriticAttack {
  id: string;
  category: "assumption" | "edge_case" | "regression" | "security" | "performance" | "rollback";
  concern: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  builder_response?: string;
  evidence?: string;
}

export interface ArbiterDecision {
  outcome: "approve" | "reject" | "escalate_human";
  rationale: string;
  conditions: string[];
  decided_at: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  category: "load" | "latency" | "failure" | "network" | "storage" | "security" | "rollout" | "chaos";
  description: string;
  params: Record<string, number | string | boolean>;
  last_result?: SimulationResult;
  run_count: number;
}

export interface SimulationResult {
  scenario_id: string;
  status: "passed" | "degraded" | "failed";
  metrics: Record<string, number>;
  recovery_time_ms?: number;
  incidents_detected: string[];
  ran_at: string;
  duration_ms: number;
}

export interface CodeStandardRule {
  id: string;
  category: "style" | "correctness" | "concurrency" | "memory" | "api_contract" | "architecture" | "performance" | "observability" | "error_handling" | "rollback" | "test_coverage";
  rule: string;
  description: string;
  severity: "warning" | "error" | "blocker";
  violations_count: number;
  enforced: boolean;
  auto_fix_available: boolean;
}

export interface TestProposal {
  id: string;
  change_id: string;
  test_type: "unit" | "integration" | "contract" | "load" | "stress" | "chaos" | "regression" | "performance" | "rollback" | "rollout_guard";
  description: string;
  generated: boolean;
  status: "proposed" | "generated" | "passing" | "failing";
  coverage_impact: number;
}

export interface ChaosExperiment {
  id: string;
  fault_type: "service_crash" | "db_latency" | "storage_failure" | "websocket_fanout" | "network_drop" | "packet_loss" | "cache_corruption" | "duplicate_events" | "clock_skew" | "rollout_interrupt";
  name: string;
  description: string;
  environment: "staging" | "sandbox" | "canary";
  policy_approved: boolean;
  last_run?: ChaosResult;
  run_count: number;
}

export interface ChaosResult {
  experiment_id: string;
  survived: boolean;
  self_recovered: boolean;
  degradation_level: "none" | "minor" | "moderate" | "severe";
  rollback_triggered: boolean;
  incident_signals_detected: string[];
  duration_ms: number;
  ran_at: string;
}

export interface RollbackTrigger {
  id: string;
  condition: string;
  metric: string;
  threshold: number;
  current_value: number;
  layer: "feature_flag" | "service_deploy" | "config" | "canary_halt" | "os_update";
  armed: boolean;
  last_triggered_at?: string;
  trigger_count: number;
}

export interface RollbackEvent {
  id: string;
  trigger_id: string;
  layer: string;
  reason: string;
  initiated_at: string;
  completed_at?: string;
  status: "initiated" | "in_progress" | "completed" | "failed";
  affected_users: number;
  reverted_change: string;
}

export interface VersionCommit {
  id: string;
  sha: string;
  message: string;
  author_type: "agent" | "human";
  author_id: string;
  author_name: string;
  reviewer_id?: string;
  tests_added: number;
  rollout_target: string;
  affected_systems: string[];
  regression_links: string[];
  incident_links: string[];
  rollback_links: string[];
  suspect_score: number;
  created_at: string;
}

export interface PerformanceBudget {
  id: string;
  metric: string;
  category: "cpu" | "memory" | "sync_latency" | "api_response" | "startup" | "agent_cost" | "rollout_degradation" | "queue_growth";
  limit: number;
  current: number;
  unit: string;
  status: "within" | "warning" | "exceeded";
  enforcement: "reject" | "downgrade_confidence" | "block_deploy" | "alert";
}

export interface OptimizationProposal {
  id: string;
  category: "debt_cleanup" | "reliability_fix" | "policy_tuning" | "architecture_warning" | "cost_reduction" | "performance_improvement";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  status: "proposed" | "approved" | "in_progress" | "completed" | "rejected";
  confidence: number;
  created_at: string;
}

// ── Demo Data Generators ──

export function getValidationPipelines(): ValidationPipelineRun[] {
  return [
    {
      id: "vp-001", change_id: "CHG-1042", change_title: "Refactor sync conflict resolver",
      author_agent_id: "dev-agent-alpha", reviewer_agent_id: "review-agent-beta",
      author_equals_reviewer: false, overall_status: "passed", created_at: "2026-04-15T08:00:00Z", completed_at: "2026-04-15T08:42:00Z",
      stages: [
        { stage: "author_proposal", status: "passed", confidence: 0.92, findings: [], blockers: [], duration_ms: 12000 },
        { stage: "independent_review", status: "passed", confidence: 0.88, findings: ["Minor naming inconsistency"], blockers: [], duration_ms: 45000, agent_id: "review-agent-beta" },
        { stage: "static_analysis", status: "passed", confidence: 0.95, findings: [], blockers: [], duration_ms: 8000 },
        { stage: "test_generation", status: "passed", confidence: 0.90, findings: ["4 new unit tests generated"], blockers: [], duration_ms: 30000 },
        { stage: "security_scan", status: "passed", confidence: 0.97, findings: [], blockers: [], duration_ms: 15000 },
        { stage: "policy_gate", status: "passed", confidence: 1.0, findings: [], blockers: [], duration_ms: 2000 },
        { stage: "simulation", status: "passed", confidence: 0.85, findings: ["2ms latency increase under load"], blockers: [], duration_ms: 120000 },
        { stage: "canary_rollout", status: "passed", confidence: 0.91, findings: [], blockers: [], duration_ms: 300000 },
        { stage: "health_check", status: "passed", confidence: 0.94, findings: [], blockers: [], duration_ms: 60000 },
        { stage: "rollback_ready", status: "passed", confidence: 1.0, findings: [], blockers: [], duration_ms: 5000 },
      ],
    },
    {
      id: "vp-002", change_id: "CHG-1043", change_title: "Add batch upload API endpoint",
      author_agent_id: "dev-agent-gamma", reviewer_agent_id: "review-agent-delta",
      author_equals_reviewer: false, overall_status: "blocked", created_at: "2026-04-15T10:15:00Z",
      stages: [
        { stage: "author_proposal", status: "passed", confidence: 0.88, findings: [], blockers: [], duration_ms: 18000 },
        { stage: "independent_review", status: "passed", confidence: 0.82, findings: ["Missing rate-limit on batch endpoint", "No idempotency key"], blockers: [], duration_ms: 55000, agent_id: "review-agent-delta" },
        { stage: "static_analysis", status: "passed", confidence: 0.91, findings: [], blockers: [], duration_ms: 9000 },
        { stage: "test_generation", status: "passed", confidence: 0.85, findings: ["6 tests generated"], blockers: [], duration_ms: 35000 },
        { stage: "security_scan", status: "failed", confidence: 0.45, findings: ["Unbounded payload size"], blockers: ["SEC-BLOCK: payload size must be capped"], duration_ms: 12000 },
        { stage: "policy_gate", status: "blocked", confidence: 0, findings: [], blockers: ["Blocked by security failure"], duration_ms: 0 },
        { stage: "simulation", status: "pending", confidence: 0, findings: [], blockers: [], duration_ms: 0 },
        { stage: "canary_rollout", status: "pending", confidence: 0, findings: [], blockers: [], duration_ms: 0 },
        { stage: "health_check", status: "pending", confidence: 0, findings: [], blockers: [], duration_ms: 0 },
        { stage: "rollback_ready", status: "pending", confidence: 0, findings: [], blockers: [], duration_ms: 0 },
      ],
    },
    {
      id: "vp-003", change_id: "CHG-1044", change_title: "Optimize cache eviction strategy",
      author_agent_id: "perf-agent-omega", reviewer_agent_id: "review-agent-beta",
      author_equals_reviewer: false, overall_status: "in_progress", created_at: "2026-04-15T12:30:00Z",
      stages: [
        { stage: "author_proposal", status: "passed", confidence: 0.94, findings: [], blockers: [], duration_ms: 10000 },
        { stage: "independent_review", status: "passed", confidence: 0.90, findings: [], blockers: [], duration_ms: 40000, agent_id: "review-agent-beta" },
        { stage: "static_analysis", status: "passed", confidence: 0.96, findings: [], blockers: [], duration_ms: 7000 },
        { stage: "test_generation", status: "passed", confidence: 0.88, findings: ["3 perf tests generated"], blockers: [], duration_ms: 25000 },
        { stage: "security_scan", status: "passed", confidence: 0.99, findings: [], blockers: [], duration_ms: 10000 },
        { stage: "policy_gate", status: "passed", confidence: 1.0, findings: [], blockers: [], duration_ms: 1500 },
        { stage: "simulation", status: "running", confidence: 0, findings: [], blockers: [], duration_ms: 0 },
        { stage: "canary_rollout", status: "pending", confidence: 0, findings: [], blockers: [], duration_ms: 0 },
        { stage: "health_check", status: "pending", confidence: 0, findings: [], blockers: [], duration_ms: 0 },
        { stage: "rollback_ready", status: "pending", confidence: 0, findings: [], blockers: [], duration_ms: 0 },
      ],
    },
  ];
}

export function getBuilderCriticExchanges(): BuilderCriticExchange[] {
  return [
    {
      id: "bce-001", change_id: "CHG-1042", status: "resolved", unresolved_count: 0,
      created_at: "2026-04-15T08:05:00Z",
      builder_proposal: "Replace mutex-based conflict resolution with CRDT merge for sync operations",
      builder_rationale: "CRDTs eliminate lock contention and provide mathematically guaranteed convergence. Benchmarks show 3.2x throughput improvement.",
      critic_attacks: [
        { id: "ca-1", category: "assumption", concern: "CRDT merge assumes commutative operations — but file rename + move are not commutative", severity: "high", resolved: true, builder_response: "Added operation ordering via Lamport timestamps for non-commutative ops" },
        { id: "ca-2", category: "edge_case", concern: "What happens with 100+ concurrent editors on same document?", severity: "medium", resolved: true, builder_response: "Load tested with 500 concurrent editors — p99 merge latency 12ms" },
        { id: "ca-3", category: "regression", concern: "Existing conflict resolution tests may break silently", severity: "high", resolved: true, builder_response: "All 47 existing tests migrated and passing, 12 new edge case tests added" },
      ],
    },
    {
      id: "bce-002", change_id: "CHG-1043", status: "open", unresolved_count: 2,
      created_at: "2026-04-15T10:20:00Z",
      builder_proposal: "Add batch upload endpoint supporting up to 1000 files per request",
      builder_rationale: "Enterprise customers need bulk operations. Single-file uploads cause N+1 API calls and excessive latency.",
      critic_attacks: [
        { id: "ca-4", category: "security", concern: "No payload size limit — attacker could send 1000 x 100MB files", severity: "critical", resolved: false },
        { id: "ca-5", category: "performance", concern: "Memory pressure from buffering 1000 files before processing", severity: "high", resolved: false },
        { id: "ca-6", category: "rollback", concern: "Partial batch failure — how do you rollback 500 successful uploads if file 501 fails?", severity: "high", resolved: true, builder_response: "Added transactional batch with atomic commit/rollback via staging area" },
      ],
      arbiter_decision: { outcome: "reject", rationale: "2 unresolved critical/high concerns remain — security and memory", conditions: ["Must add per-file size limit (50MB)", "Must implement streaming processing"], decided_at: "2026-04-15T11:00:00Z" },
    },
    {
      id: "bce-003", change_id: "CHG-1044", status: "resolved", unresolved_count: 0,
      created_at: "2026-04-15T12:35:00Z",
      builder_proposal: "Switch cache eviction from LRU to ARC (Adaptive Replacement Cache)",
      builder_rationale: "ARC adapts to workload patterns automatically, reducing cache miss rate by 18% in benchmarks.",
      critic_attacks: [
        { id: "ca-7", category: "assumption", concern: "ARC patent expired 2023 but implementation complexity is higher — worth the maintenance cost?", severity: "low", resolved: true, builder_response: "Using well-tested open-source implementation, complexity delta is 40 LOC" },
        { id: "ca-8", category: "performance", concern: "ARC has slightly higher per-operation overhead — verified under our workload?", severity: "medium", resolved: true, builder_response: "Benchmarked: 0.3μs overhead per op, net positive due to fewer cache misses", evidence: "bench-arc-vs-lru-20260415.json" },
      ],
    },
  ];
}

export function getSimulationScenarios(): SimulationScenario[] {
  return [
    { id: "sim-001", name: "500-Device Sync Storm", category: "load", description: "500 devices syncing simultaneously with 10MB average payload", params: { devices: 500, payload_mb: 10, duration_s: 300 }, run_count: 14, last_result: { scenario_id: "sim-001", status: "passed", metrics: { p99_latency_ms: 340, throughput_mbps: 1200, error_rate: 0.001 }, recovery_time_ms: 0, incidents_detected: [], ran_at: "2026-04-14T22:00:00Z", duration_ms: 312000 } },
    { id: "sim-002", name: "Storage Latency Spike", category: "latency", description: "Object storage latency increases to 2000ms during peak upload", params: { latency_ms: 2000, duration_s: 120, concurrent_uploads: 100 }, run_count: 8, last_result: { scenario_id: "sim-002", status: "degraded", metrics: { upload_success_rate: 0.94, queue_depth: 847, timeout_count: 6 }, recovery_time_ms: 45000, incidents_detected: ["Queue depth warning"], ran_at: "2026-04-14T23:00:00Z", duration_ms: 135000 } },
    { id: "sim-003", name: "WebSocket Reconnect Storm", category: "network", description: "All 1000 connected clients disconnect and reconnect within 5 seconds", params: { clients: 1000, reconnect_window_s: 5, message_backlog: 500 }, run_count: 6, last_result: { scenario_id: "sim-003", status: "passed", metrics: { reconnect_success_rate: 0.998, backlog_drain_ms: 8200, memory_peak_mb: 512 }, recovery_time_ms: 12000, incidents_detected: [], ran_at: "2026-04-13T18:00:00Z", duration_ms: 60000 } },
    { id: "sim-004", name: "Admin Policy Change During Sync", category: "security", description: "Admin changes storage quota mid-sync for 200 active users", params: { active_users: 200, new_quota_mb: 500, sync_in_progress: true }, run_count: 3, last_result: { scenario_id: "sim-004", status: "passed", metrics: { graceful_interrupts: 200, data_loss_events: 0, policy_propagation_ms: 1200 }, recovery_time_ms: 0, incidents_detected: [], ran_at: "2026-04-12T15:00:00Z", duration_ms: 30000 } },
    { id: "sim-005", name: "Low Battery + Active Sync", category: "failure", description: "Device at 3% battery during large file sync — tests graceful pause/resume", params: { battery_pct: 3, file_size_mb: 500, network: "4G" }, run_count: 5, last_result: { scenario_id: "sim-005", status: "passed", metrics: { pause_triggered: 1, resume_success: 1, data_integrity: 1.0 }, recovery_time_ms: 0, incidents_detected: [], ran_at: "2026-04-11T10:00:00Z", duration_ms: 15000 } },
    { id: "sim-006", name: "Rollout Under High Load", category: "rollout", description: "Deploy new version while 80% of infrastructure is under heavy load", params: { load_pct: 80, rollout_strategy: "canary", canary_pct: 5 }, run_count: 4, last_result: { scenario_id: "sim-006", status: "passed", metrics: { canary_error_rate: 0.002, baseline_error_rate: 0.001, latency_delta_ms: 8 }, recovery_time_ms: 0, incidents_detected: [], ran_at: "2026-04-14T06:00:00Z", duration_ms: 600000 } },
    { id: "sim-007", name: "Cascading Service Failure", category: "chaos", description: "Auth service goes down — tests cascading impact on sync, storage, API", params: { failed_service: "auth", cascade_delay_s: 30, recovery_type: "auto" }, run_count: 2, last_result: { scenario_id: "sim-007", status: "degraded", metrics: { services_affected: 4, graceful_degradation: 0.85, circuit_breaker_trips: 3 }, recovery_time_ms: 90000, incidents_detected: ["Auth cascade detected", "Circuit breaker activated"], ran_at: "2026-04-10T20:00:00Z", duration_ms: 180000 } },
  ];
}

export function getCodeStandardRules(): CodeStandardRule[] {
  return [
    { id: "cs-01", category: "correctness", rule: "All async functions must have error boundaries", description: "Unhandled promise rejections crash the runtime", severity: "blocker", violations_count: 0, enforced: true, auto_fix_available: false },
    { id: "cs-02", category: "concurrency", rule: "No unbounded retry loops", description: "Retry loops must have max attempts and exponential backoff", severity: "blocker", violations_count: 0, enforced: true, auto_fix_available: true },
    { id: "cs-03", category: "memory", rule: "Cache entries must have TTL or max-size eviction", description: "Unbounded caches cause memory leaks under sustained load", severity: "error", violations_count: 1, enforced: true, auto_fix_available: false },
    { id: "cs-04", category: "api_contract", rule: "All public endpoints must validate input schema", description: "Unvalidated input enables injection and malformed data", severity: "blocker", violations_count: 0, enforced: true, auto_fix_available: true },
    { id: "cs-05", category: "architecture", rule: "No App-layer imports from Kernel layer", description: "Layer boundary violation breaks encapsulation", severity: "error", violations_count: 2, enforced: true, auto_fix_available: false },
    { id: "cs-06", category: "performance", rule: "No synchronous I/O on main thread", description: "Blocking I/O causes UI freeze and ANR", severity: "blocker", violations_count: 0, enforced: true, auto_fix_available: false },
    { id: "cs-07", category: "observability", rule: "New critical paths must emit metrics", description: "Unmonitored critical paths are invisible during incidents", severity: "error", violations_count: 3, enforced: true, auto_fix_available: true },
    { id: "cs-08", category: "error_handling", rule: "All error responses must include error codes", description: "Unstructured errors prevent automated diagnosis", severity: "warning", violations_count: 5, enforced: true, auto_fix_available: true },
    { id: "cs-09", category: "rollback", rule: "Schema migrations must include reverse migration", description: "Irreversible migrations block rollback", severity: "blocker", violations_count: 0, enforced: true, auto_fix_available: false },
    { id: "cs-10", category: "test_coverage", rule: "Bug fixes must include regression test", description: "Untested fixes will re-regress", severity: "error", violations_count: 1, enforced: true, auto_fix_available: false },
    { id: "cs-11", category: "style", rule: "No inline magic numbers in business logic", description: "Magic numbers reduce readability and maintainability", severity: "warning", violations_count: 8, enforced: true, auto_fix_available: true },
    { id: "cs-12", category: "security", rule: "No audit log suppression on privileged paths", description: "Suppressed audit logs hide unauthorized activity", severity: "blocker", violations_count: 0, enforced: true, auto_fix_available: false },
  ];
}

export function getChaosExperiments(): ChaosExperiment[] {
  return [
    { id: "cx-01", fault_type: "service_crash", name: "Auth Service Crash", description: "Kill the auth service and verify graceful degradation and circuit breaker activation", environment: "staging", policy_approved: true, run_count: 5, last_run: { experiment_id: "cx-01", survived: true, self_recovered: true, degradation_level: "moderate", rollback_triggered: false, incident_signals_detected: ["Auth unavailable", "Circuit breaker tripped"], duration_ms: 120000, ran_at: "2026-04-14T14:00:00Z" } },
    { id: "cx-02", fault_type: "db_latency", name: "Database 5x Latency", description: "Inject 5x latency on all database reads for 60 seconds", environment: "staging", policy_approved: true, run_count: 8, last_run: { experiment_id: "cx-02", survived: true, self_recovered: true, degradation_level: "minor", rollback_triggered: false, incident_signals_detected: [], duration_ms: 75000, ran_at: "2026-04-14T16:00:00Z" } },
    { id: "cx-03", fault_type: "storage_failure", name: "Object Storage Unavailable", description: "Block all object storage read/write for 30 seconds", environment: "staging", policy_approved: true, run_count: 4, last_run: { experiment_id: "cx-03", survived: true, self_recovered: true, degradation_level: "moderate", rollback_triggered: false, incident_signals_detected: ["Upload queue backing up"], duration_ms: 90000, ran_at: "2026-04-13T20:00:00Z" } },
    { id: "cx-04", fault_type: "network_drop", name: "Network Partition", description: "Simulate complete network partition between services for 15 seconds", environment: "sandbox", policy_approved: true, run_count: 3, last_run: { experiment_id: "cx-04", survived: true, self_recovered: true, degradation_level: "severe", rollback_triggered: false, incident_signals_detected: ["Network partition detected", "Retries exhausted"], duration_ms: 60000, ran_at: "2026-04-12T10:00:00Z" } },
    { id: "cx-05", fault_type: "packet_loss", name: "30% Packet Loss", description: "Introduce 30% packet loss on all inter-service communication", environment: "staging", policy_approved: true, run_count: 6, last_run: { experiment_id: "cx-05", survived: true, self_recovered: true, degradation_level: "minor", rollback_triggered: false, incident_signals_detected: [], duration_ms: 45000, ran_at: "2026-04-14T12:00:00Z" } },
    { id: "cx-06", fault_type: "cache_corruption", name: "Cache Corruption", description: "Inject corrupted entries into distributed cache layer", environment: "sandbox", policy_approved: true, run_count: 2, last_run: { experiment_id: "cx-06", survived: true, self_recovered: true, degradation_level: "minor", rollback_triggered: false, incident_signals_detected: ["Cache integrity check failed"], duration_ms: 30000, ran_at: "2026-04-11T08:00:00Z" } },
    { id: "cx-07", fault_type: "duplicate_events", name: "Duplicate Event Storm", description: "Send duplicate events at 10x normal rate for 30 seconds", environment: "staging", policy_approved: true, run_count: 4, last_run: { experiment_id: "cx-07", survived: true, self_recovered: true, degradation_level: "none", rollback_triggered: false, incident_signals_detected: [], duration_ms: 35000, ran_at: "2026-04-14T09:00:00Z" } },
    { id: "cx-08", fault_type: "clock_skew", name: "Clock Skew ±30s", description: "Skew system clocks by ±30 seconds across service instances", environment: "sandbox", policy_approved: false, run_count: 1, last_run: { experiment_id: "cx-08", survived: false, self_recovered: false, degradation_level: "severe", rollback_triggered: true, incident_signals_detected: ["Token validation failures", "Event ordering broken"], duration_ms: 60000, ran_at: "2026-04-10T14:00:00Z" } },
    { id: "cx-09", fault_type: "rollout_interrupt", name: "Canary Rollout Interruption", description: "Kill canary instances mid-rollout and verify safe fallback", environment: "canary", policy_approved: true, run_count: 3, last_run: { experiment_id: "cx-09", survived: true, self_recovered: true, degradation_level: "none", rollback_triggered: true, incident_signals_detected: ["Canary health check failed"], duration_ms: 180000, ran_at: "2026-04-13T06:00:00Z" } },
  ];
}

export function getRollbackTriggers(): RollbackTrigger[] {
  return [
    { id: "rt-01", condition: "Error rate exceeds threshold", metric: "error_rate_5m", threshold: 0.05, current_value: 0.008, layer: "service_deploy", armed: true, trigger_count: 2, last_triggered_at: "2026-03-28T14:00:00Z" },
    { id: "rt-02", condition: "Crash rate delta above maximum", metric: "crash_rate_delta", threshold: 0.02, current_value: 0.001, layer: "os_update", armed: true, trigger_count: 1 },
    { id: "rt-03", condition: "Sync success rate drops", metric: "sync_success_rate", threshold: 0.95, current_value: 0.987, layer: "service_deploy", armed: true, trigger_count: 3, last_triggered_at: "2026-04-01T09:30:00Z" },
    { id: "rt-04", condition: "API latency budget exceeded", metric: "p99_latency_ms", threshold: 500, current_value: 142, layer: "service_deploy", armed: true, trigger_count: 0 },
    { id: "rt-05", condition: "Canary cohort unhealthy", metric: "canary_health_score", threshold: 0.8, current_value: 0.96, layer: "canary_halt", armed: true, trigger_count: 1, last_triggered_at: "2026-04-10T18:00:00Z" },
    { id: "rt-06", condition: "Security gate failure post-deploy", metric: "security_gate_pass", threshold: 1.0, current_value: 1.0, layer: "feature_flag", armed: true, trigger_count: 0 },
    { id: "rt-07", condition: "Trust anomaly spike", metric: "trust_anomaly_score", threshold: 0.3, current_value: 0.05, layer: "feature_flag", armed: true, trigger_count: 0 },
  ];
}

export function getRollbackHistory(): RollbackEvent[] {
  return [
    { id: "re-01", trigger_id: "rt-03", layer: "service_deploy", reason: "Sync success rate dropped to 91.2% after deploy v2.14.3", initiated_at: "2026-04-01T09:30:00Z", completed_at: "2026-04-01T09:34:00Z", status: "completed", affected_users: 1247, reverted_change: "v2.14.3 → v2.14.2" },
    { id: "re-02", trigger_id: "rt-01", layer: "service_deploy", reason: "Error rate spiked to 7.2% after auth service update", initiated_at: "2026-03-28T14:00:00Z", completed_at: "2026-03-28T14:02:30Z", status: "completed", affected_users: 3890, reverted_change: "auth-v1.8.0 → auth-v1.7.4" },
    { id: "re-03", trigger_id: "rt-05", layer: "canary_halt", reason: "Canary health score dropped to 0.62 during feature rollout", initiated_at: "2026-04-10T18:00:00Z", completed_at: "2026-04-10T18:01:15Z", status: "completed", affected_users: 89, reverted_change: "Feature flag batch-upload-v2 disabled" },
  ];
}

export function getVersionCommits(): VersionCommit[] {
  return [
    { id: "vc-01", sha: "a3f9e2b", message: "Refactor sync conflict resolver to use CRDT merge", author_type: "agent", author_id: "dev-agent-alpha", author_name: "Dev Agent Alpha", reviewer_id: "review-agent-beta", tests_added: 12, rollout_target: "canary", affected_systems: ["sync-engine", "storage-layer"], regression_links: [], incident_links: [], rollback_links: [], suspect_score: 0.05, created_at: "2026-04-15T08:42:00Z" },
    { id: "vc-02", sha: "b7d1c4e", message: "Add batch upload API endpoint", author_type: "agent", author_id: "dev-agent-gamma", author_name: "Dev Agent Gamma", reviewer_id: "review-agent-delta", tests_added: 6, rollout_target: "staging", affected_systems: ["api-gateway", "storage-layer", "auth"], regression_links: [], incident_links: [], rollback_links: [], suspect_score: 0.72, created_at: "2026-04-15T10:50:00Z" },
    { id: "vc-03", sha: "c2e8f5a", message: "Optimize cache eviction from LRU to ARC", author_type: "agent", author_id: "perf-agent-omega", author_name: "Perf Agent Omega", reviewer_id: "review-agent-beta", tests_added: 3, rollout_target: "canary", affected_systems: ["cache-layer"], regression_links: [], incident_links: [], rollback_links: [], suspect_score: 0.12, created_at: "2026-04-15T13:00:00Z" },
    { id: "vc-04", sha: "d5a3b7f", message: "Fix auth token refresh race condition", author_type: "human", author_id: "eng-sarah", author_name: "Sarah Chen", reviewer_id: "review-agent-beta", tests_added: 8, rollout_target: "production", affected_systems: ["auth", "session-manager"], regression_links: [], incident_links: ["INC-2041"], rollback_links: [], suspect_score: 0.08, created_at: "2026-04-14T16:30:00Z" },
    { id: "vc-05", sha: "e1f6d9c", message: "Update storage quota enforcement logic", author_type: "agent", author_id: "dev-agent-alpha", author_name: "Dev Agent Alpha", reviewer_id: "review-agent-delta", tests_added: 5, rollout_target: "staging", affected_systems: ["storage-layer", "billing"], regression_links: ["REG-089"], incident_links: [], rollback_links: ["re-01"], suspect_score: 0.65, created_at: "2026-04-13T11:00:00Z" },
  ];
}

export function getPerformanceBudgets(): PerformanceBudget[] {
  return [
    { id: "pb-01", metric: "API p99 Response Time", category: "api_response", limit: 500, current: 142, unit: "ms", status: "within", enforcement: "reject" },
    { id: "pb-02", metric: "Memory Growth Rate", category: "memory", limit: 50, current: 38, unit: "MB/hr", status: "within", enforcement: "block_deploy" },
    { id: "pb-03", metric: "Sync Latency p95", category: "sync_latency", limit: 200, current: 178, unit: "ms", status: "warning", enforcement: "downgrade_confidence" },
    { id: "pb-04", metric: "CPU Usage Peak", category: "cpu", limit: 80, current: 62, unit: "%", status: "within", enforcement: "alert" },
    { id: "pb-05", metric: "Startup Overhead", category: "startup", limit: 3000, current: 2100, unit: "ms", status: "within", enforcement: "reject" },
    { id: "pb-06", metric: "AI Agent Cost per Hour", category: "agent_cost", limit: 25, current: 18.4, unit: "cents", status: "within", enforcement: "block_deploy" },
    { id: "pb-07", metric: "Queue Growth Rate", category: "queue_growth", limit: 100, current: 94, unit: "items/min", status: "warning", enforcement: "alert" },
    { id: "pb-08", metric: "Rollout Degradation", category: "rollout_degradation", limit: 5, current: 1.2, unit: "%", status: "within", enforcement: "reject" },
  ];
}

export function getOptimizationProposals(): OptimizationProposal[] {
  return [
    { id: "op-01", category: "reliability_fix", title: "Add circuit breaker to storage client", description: "Storage client retries indefinitely on 503 — add circuit breaker with 3-strike threshold", impact: "high", effort: "low", status: "approved", confidence: 0.92, created_at: "2026-04-14T10:00:00Z" },
    { id: "op-02", category: "debt_cleanup", title: "Remove deprecated v1 sync protocol", description: "v1 sync protocol has 0 active users but 2,400 LOC maintenance burden", impact: "medium", effort: "medium", status: "in_progress", confidence: 0.88, created_at: "2026-04-12T14:00:00Z" },
    { id: "op-03", category: "performance_improvement", title: "Enable connection pooling for edge workers", description: "Each edge worker creates new DB connection — pooling would reduce latency by ~40ms", impact: "high", effort: "low", status: "proposed", confidence: 0.85, created_at: "2026-04-15T09:00:00Z" },
    { id: "op-04", category: "cost_reduction", title: "Migrate cold storage to archive tier", description: "35% of stored objects haven't been accessed in 90+ days — move to archive tier for 70% cost savings", impact: "high", effort: "medium", status: "proposed", confidence: 0.90, created_at: "2026-04-15T11:00:00Z" },
    { id: "op-05", category: "architecture_warning", title: "Event bus single point of failure", description: "All domain events flow through single bus instance — add redundancy before scaling past 10K events/sec", impact: "high", effort: "high", status: "proposed", confidence: 0.78, created_at: "2026-04-13T16:00:00Z" },
    { id: "op-06", category: "policy_tuning", title: "Relax sync retry backoff for mobile", description: "Current 30s max backoff too aggressive for mobile users on intermittent connections — suggest 10s", impact: "medium", effort: "low", status: "approved", confidence: 0.82, created_at: "2026-04-14T08:00:00Z" },
  ];
}

export function getTestProposals(): TestProposal[] {
  return [
    { id: "tp-01", change_id: "CHG-1042", test_type: "unit", description: "Test CRDT merge with conflicting timestamps", generated: true, status: "passing", coverage_impact: 2.1 },
    { id: "tp-02", change_id: "CHG-1042", test_type: "integration", description: "End-to-end sync with 3 concurrent devices", generated: true, status: "passing", coverage_impact: 1.8 },
    { id: "tp-03", change_id: "CHG-1042", test_type: "performance", description: "Benchmark CRDT merge under 500 concurrent ops", generated: true, status: "passing", coverage_impact: 0.5 },
    { id: "tp-04", change_id: "CHG-1043", test_type: "contract", description: "Validate batch upload API schema compliance", generated: true, status: "failing", coverage_impact: 1.2 },
    { id: "tp-05", change_id: "CHG-1043", test_type: "load", description: "1000 concurrent batch uploads with varying sizes", generated: true, status: "failing", coverage_impact: 0.8 },
    { id: "tp-06", change_id: "CHG-1043", test_type: "rollback", description: "Verify partial batch rollback on failure", generated: true, status: "passing", coverage_impact: 1.5 },
    { id: "tp-07", change_id: "CHG-1044", test_type: "regression", description: "Ensure no cache miss regression after ARC switch", generated: true, status: "passing", coverage_impact: 1.0 },
    { id: "tp-08", change_id: "CHG-1044", test_type: "stress", description: "ARC cache under memory pressure with 10M entries", generated: true, status: "passing", coverage_impact: 0.6 },
  ];
}
