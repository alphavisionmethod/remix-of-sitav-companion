// ═══════════════════════════════════════════════════
// SITA OS — Admin Backend Mock Data
// Rich demo data for incidents, audit, fleet,
// council, policies, and intelligence
// ═══════════════════════════════════════════════════

export const mockAdminIncidents = [
  {
    id: "INC-051",
    title: "QuickBooks OAuth token expiring in 48h",
    severity: "SEV-2",
    status: "open",
    impact: "Financial data sync will halt — invoices, payments, and reconciliation affected",
    description: "The QuickBooks connector OAuth refresh token expires in 48 hours. Auto-renewal failed due to scope change.",
    created_at: "2026-04-02T08:30:00Z",
    created_by: "user-1",
    assigned_to: null,
    acknowledged_at: null,
    resolved_at: null,
    root_cause: null,
    timeline: [
      { action: "created", actor: "system", timestamp: "2026-04-02T08:30:00Z" },
      { action: "auto-detected", actor: "connector-monitor", timestamp: "2026-04-02T08:30:00Z" },
    ],
  },
  {
    id: "INC-050",
    title: "AI advisor latency spike — p99 > 3s",
    severity: "SEV-2",
    status: "acknowledged",
    impact: "User-facing advisor responses delayed — chat feels sluggish",
    description: "p99 latency crossed 3s threshold for business advisor. Correlated with increased token usage.",
    created_at: "2026-04-02T06:15:00Z",
    created_by: "user-1",
    assigned_to: "user-1",
    acknowledged_at: "2026-04-02T06:20:00Z",
    resolved_at: null,
    root_cause: null,
    timeline: [
      { action: "created", actor: "anomaly-detector", timestamp: "2026-04-02T06:15:00Z" },
      { action: "acknowledged", actor: "user-1", timestamp: "2026-04-02T06:20:00Z" },
      { action: "note", actor: "user-1", timestamp: "2026-04-02T06:25:00Z", notes: "Investigating model routing config" },
    ],
  },
  {
    id: "INC-049",
    title: "Stripe webhook signature verification failure",
    severity: "SEV-1",
    status: "open",
    impact: "Payment confirmations not processing — invoices stuck in pending",
    description: "Stripe webhooks returning 401. Likely webhook secret rotation needed.",
    created_at: "2026-04-02T04:00:00Z",
    created_by: "user-1",
    assigned_to: null,
    acknowledged_at: null,
    resolved_at: null,
    root_cause: null,
    timeline: [
      { action: "created", actor: "webhook-monitor", timestamp: "2026-04-02T04:00:00Z" },
    ],
  },
  {
    id: "INC-048",
    title: "Memory service high confidence drift detected",
    severity: "SEV-3",
    status: "resolved",
    impact: "Some user memory entries showing lower-than-expected confidence scores",
    description: "Memory processor confidence scores dropped 12% over 48h. Root cause: stale training data.",
    created_at: "2026-04-01T14:00:00Z",
    created_by: "user-1",
    assigned_to: "user-1",
    acknowledged_at: "2026-04-01T14:10:00Z",
    resolved_at: "2026-04-01T16:30:00Z",
    root_cause: "Stale training data in memory processor — retraining resolved the drift",
    timeline: [
      { action: "created", actor: "anomaly-detector", timestamp: "2026-04-01T14:00:00Z" },
      { action: "acknowledged", actor: "user-1", timestamp: "2026-04-01T14:10:00Z" },
      { action: "resolved", actor: "user-1", timestamp: "2026-04-01T16:30:00Z" },
    ],
  },
  {
    id: "INC-047",
    title: "Email delivery rate below 95% threshold",
    severity: "SEV-3",
    status: "resolved",
    impact: "2 follow-up emails bounced — client communication delayed",
    description: "Resend delivery rate dipped to 93%. Caused by invalid email addresses in lead database.",
    created_at: "2026-03-31T10:00:00Z",
    created_by: "user-1",
    assigned_to: "user-1",
    acknowledged_at: "2026-03-31T10:15:00Z",
    resolved_at: "2026-03-31T12:00:00Z",
    root_cause: "Invalid email addresses imported from CSV — data validation added",
    timeline: [
      { action: "created", actor: "email-monitor", timestamp: "2026-03-31T10:00:00Z" },
      { action: "acknowledged", actor: "user-1", timestamp: "2026-03-31T10:15:00Z" },
      { action: "resolved", actor: "user-1", timestamp: "2026-03-31T12:00:00Z" },
    ],
  },
];

export const mockAdminAuditLogs = [
  { id: "AL-001", actor_id: "user-1", action: "policy.created", resource_type: "policy", resource_id: "POL-001", result: "success", changes: { name: "Auto-pay under $500" }, ip_address: "192.168.1.10", user_agent: "SITA OS/1.0", created_at: "2026-04-02T09:00:00Z" },
  { id: "AL-002", actor_id: "user-1", action: "incident.acknowledged", resource_type: "incident", resource_id: "INC-050", result: "success", changes: {}, ip_address: "192.168.1.10", user_agent: "SITA OS/1.0", created_at: "2026-04-02T06:20:00Z" },
  { id: "AL-003", actor_id: "user-1", action: "device.restart", resource_type: "device", resource_id: "DEV-003", result: "success", changes: {}, ip_address: "192.168.1.10", user_agent: "SITA OS/1.0", created_at: "2026-04-01T15:00:00Z" },
  { id: "AL-004", actor_id: "user-1", action: "policy.updated", resource_type: "policy", resource_id: "POL-002", result: "success", changes: { approval_required: true }, ip_address: "192.168.1.10", user_agent: "SITA OS/1.0", created_at: "2026-04-01T11:00:00Z" },
  { id: "AL-005", actor_id: "user-1", action: "incident.resolved", resource_type: "incident", resource_id: "INC-048", result: "success", changes: { root_cause: "Stale training data" }, ip_address: "10.0.0.5", user_agent: "SITA OS/1.0", created_at: "2026-04-01T16:30:00Z" },
  { id: "AL-006", actor_id: "system", action: "connector.sync", resource_type: "connector", resource_id: "slack-1", result: "success", changes: {}, ip_address: "internal", user_agent: "SITA Scheduler", created_at: "2026-04-02T08:00:00Z" },
  { id: "AL-007", actor_id: "user-1", action: "council.vote", resource_type: "decision", resource_id: "CD-001", result: "success", changes: { vote: "for" }, ip_address: "192.168.1.10", user_agent: "SITA OS/1.0", created_at: "2026-04-01T09:00:00Z" },
  { id: "AL-008", actor_id: "system", action: "anomaly.detected", resource_type: "metric", resource_id: "latency_p99", result: "success", changes: { sigma: 4.2, value: 3200 }, ip_address: "internal", user_agent: "Intelligence Service", created_at: "2026-04-02T06:15:00Z" },
];

export const mockAdminPolicies = [
  { id: "POL-001", name: "Auto-pay bills under $500", category: "money", conditions: { max_amount: 500, recurring: true }, actions: { type: "auto_pay" }, approval_required: false, active: true, version: 2, created_at: "2026-03-15T10:00:00Z" },
  { id: "POL-002", name: "Require approval for new subscriptions", category: "money", conditions: { action_type: "subscribe" }, actions: { type: "request_approval" }, approval_required: true, active: true, version: 1, created_at: "2026-03-18T14:00:00Z" },
  { id: "POL-003", name: "Block external data sharing", category: "security", conditions: { blocked_actions: ["export_data", "share_external"] }, actions: { type: "deny" }, approval_required: false, active: true, version: 1, created_at: "2026-03-20T09:00:00Z" },
  { id: "POL-004", name: "Auto-send follow-up after 3 days", category: "business", conditions: { silence_days: 3, lead_status: "contacted" }, actions: { type: "send_followup" }, approval_required: false, active: true, version: 3, created_at: "2026-03-10T08:00:00Z" },
  { id: "POL-005", name: "Escalate high-value deals", category: "business", conditions: { min_value: 25000 }, actions: { type: "escalate_to_owner" }, approval_required: true, active: false, version: 1, created_at: "2026-03-25T11:00:00Z" },
  { id: "POL-006", name: "Auto-grocery reorder on depletion", category: "concierge", conditions: { stock_level: "depleted", recurring: true }, actions: { type: "reorder" }, approval_required: false, active: true, version: 1, created_at: "2026-03-28T16:00:00Z" },
];

export const mockAdminDevices = [
  { device_id: "DEV-001", name: "Primary Workstation", type: "desktop", connectivity: "online", health: "healthy", battery: null, last_heartbeat: "2026-04-02T09:55:00Z", issues: [], latitude: 37.7749, longitude: -122.4194 },
  { device_id: "DEV-002", name: "MacBook Pro", type: "laptop", connectivity: "online", health: "healthy", battery: 87, last_heartbeat: "2026-04-02T09:54:00Z", issues: [], latitude: 37.7749, longitude: -122.4194 },
  { device_id: "DEV-003", name: "iPad Pro", type: "tablet", connectivity: "online", health: "degraded", battery: 23, last_heartbeat: "2026-04-02T09:50:00Z", issues: ["Low battery", "Sync delayed"], latitude: 37.7849, longitude: -122.4094 },
  { device_id: "DEV-004", name: "iPhone 15 Pro", type: "phone", connectivity: "online", health: "healthy", battery: 62, last_heartbeat: "2026-04-02T09:55:00Z", issues: [], latitude: 37.7749, longitude: -122.4194 },
  { device_id: "DEV-005", name: "Home Server", type: "server", connectivity: "offline", health: "offline", battery: null, last_heartbeat: "2026-04-01T22:00:00Z", issues: ["No heartbeat for 12h"], latitude: 37.7749, longitude: -122.4194 },
  { device_id: "DEV-006", name: "Smart Display", type: "iot", connectivity: "online", health: "healthy", battery: null, last_heartbeat: "2026-04-02T09:53:00Z", issues: [], latitude: 37.7749, longitude: -122.4194 },
];

export const mockAdminCouncilDecisions = [
  { id: "CD-001", title: "Approve Q2 marketing budget allocation", status: "pending", domain: "business", description: "Allocate $12,000 for Q2 digital marketing across Google Ads and LinkedIn", votes_for: 2, votes_against: 0, votes_abstained: 1, created_at: "2026-04-01T10:00:00Z", deadline: "2026-04-05T23:59:00Z" },
  { id: "CD-002", title: "Switch primary AI model to GPT-4.5", status: "pending", domain: "system", description: "Migrate business advisor from GPT-4o to GPT-4.5 for improved reasoning", votes_for: 1, votes_against: 1, votes_abstained: 0, created_at: "2026-04-01T14:00:00Z", deadline: "2026-04-07T23:59:00Z" },
  { id: "CD-003", title: "Implement auto-invoice follow-up policy", status: "approved", domain: "money", description: "Automatically send payment reminders for invoices overdue by 7+ days", votes_for: 3, votes_against: 0, votes_abstained: 0, created_at: "2026-03-28T09:00:00Z", deadline: "2026-04-01T23:59:00Z" },
  { id: "CD-004", title: "Reduce data retention to 90 days", status: "rejected", domain: "security", description: "Reduce audit log and activity data retention from 365 to 90 days", votes_for: 0, votes_against: 3, votes_abstained: 0, created_at: "2026-03-25T11:00:00Z", deadline: "2026-03-30T23:59:00Z" },
];

export const mockAdminIntelligence = {
  anomalies: {
    metrics: {
      latency: {
        stats: { mean: 820, stddev: 340, min: 120, max: 3200, count: 142 },
        anomalies: [
          { index: 89, value: 3200, sigma: 6.97, severity: "critical" },
          { index: 102, value: 2800, sigma: 5.82, severity: "warning" },
          { index: 45, value: 2100, sigma: 3.76, severity: "info" },
        ],
      },
      tokens: {
        stats: { mean: 1200, stddev: 450, min: 150, max: 4500, count: 142 },
        anomalies: [
          { index: 67, value: 4500, sigma: 7.33, severity: "critical" },
        ],
      },
      confidence: {
        stats: { mean: 0.87, stddev: 0.08, min: 0.42, max: 0.99, count: 142 },
        anomalies: [
          { index: 120, value: 0.42, sigma: 5.63, severity: "warning" },
        ],
      },
    },
    total_anomalies: 5,
    severity_summary: { critical: 2, warning: 2, info: 1 },
  },
  forecasts: [
    {
      id: "forecast-latency",
      type: "latency-degradation",
      title: "Latency trending above threshold",
      description: "Average latency 820ms trending toward 1500ms threshold within 48h",
      probability: 0.65,
      timeWindow: "48h",
      severity: "warning",
      preventiveMeasures: [
        "Optimize database queries and indexes",
        "Check connection pool saturation",
        "Review cache hit rates",
        "Consider scaling out API instances",
      ],
    },
    {
      id: "forecast-clear",
      type: "all-clear",
      title: "Incident frequency stable",
      description: "No increase in incident rate detected — system operating normally",
      probability: 0.88,
      timeWindow: "7d",
      severity: "info",
      preventiveMeasures: [],
    },
  ],
  optimization: {
    suggestions: [
      {
        id: "opt-model-routing",
        type: "model-routing",
        title: "Route high-confidence queries to lighter models",
        description: "42 of 98 GPT-4o queries had >90% confidence and could use GPT-4o-mini",
        projectedSavings: "~$0.84/period",
        confidence: 0.82,
        effort: "low",
      },
      {
        id: "opt-caching",
        type: "response-caching",
        title: "Cache repeated query patterns",
        description: "High request volume detected — semantic caching could reduce costs",
        projectedSavings: "15-25% reduction in API calls",
        confidence: 0.75,
        effort: "medium",
      },
    ],
    current_usage: {
      total_tokens: 68400,
      total_requests: 142,
      by_model: {
        "gpt-4o": { tokens: 52000, count: 98, avgLatency: 920, avgConfidence: 0.89 },
        "gpt-4o-mini": { tokens: 16400, count: 44, avgLatency: 580, avgConfidence: 0.85 },
      },
    },
  },
};

// ═══════════════════════════════════════════════════
// INTERNAL AI WORKFORCE — Mock Runtime State
// ═══════════════════════════════════════════════════

export const mockAgentRuntimeStates = [
  { agentId: "aw-product-manager", status: "active" as const, invocationCount: 284, lastAction: "Tracked feature completeness for Sprint 14", lastActionTimestamp: "2026-04-02T08:45:00Z", confidenceAvg: 0.87, costTokens: 12400, costCompute: 0.42, escalationCount: 3, failureCount: 0, simulationOnly: false },
  { agentId: "aw-ux-research", status: "active" as const, invocationCount: 156, lastAction: "Analyzed accessibility scores across 12 routes", lastActionTimestamp: "2026-04-02T07:30:00Z", confidenceAvg: 0.82, costTokens: 6200, costCompute: 0.18, escalationCount: 1, failureCount: 0, simulationOnly: false },
  { agentId: "aw-design-system", status: "active" as const, invocationCount: 198, lastAction: "Detected 2 token violations in MoneyCenter", lastActionTimestamp: "2026-04-02T09:15:00Z", confidenceAvg: 0.91, costTokens: 8800, costCompute: 0.28, escalationCount: 5, failureCount: 1, simulationOnly: false },
  { agentId: "aw-frontend-engineer", status: "active" as const, invocationCount: 342, lastAction: "Bundle size analysis — 487KB (within budget)", lastActionTimestamp: "2026-04-02T09:30:00Z", confidenceAvg: 0.88, costTokens: 15600, costCompute: 0.52, escalationCount: 2, failureCount: 0, simulationOnly: false },
  { agentId: "aw-backend-engineer", status: "active" as const, invocationCount: 267, lastAction: "Validated API contract for brain-core v2", lastActionTimestamp: "2026-04-02T08:00:00Z", confidenceAvg: 0.85, costTokens: 11200, costCompute: 0.38, escalationCount: 4, failureCount: 1, simulationOnly: false },
  { agentId: "aw-mobile-engineer", status: "paused" as const, invocationCount: 45, lastAction: "Reviewed trust companion build #34", lastActionTimestamp: "2026-04-01T16:00:00Z", confidenceAvg: 0.79, costTokens: 2100, costCompute: 0.08, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-documentation", status: "active" as const, invocationCount: 412, lastAction: "Synced 3 registry YAML files after merge", lastActionTimestamp: "2026-04-02T09:00:00Z", confidenceAvg: 0.83, costTokens: 18400, costCompute: 0.62, escalationCount: 2, failureCount: 0, simulationOnly: false },
  { agentId: "aw-qa-architect", status: "active" as const, invocationCount: 189, lastAction: "Coverage report: 78% unit, 45% integration, 12% E2E", lastActionTimestamp: "2026-04-02T07:45:00Z", confidenceAvg: 0.86, costTokens: 8400, costCompute: 0.32, escalationCount: 3, failureCount: 0, simulationOnly: false },
  { agentId: "aw-incident-response", status: "active" as const, invocationCount: 523, lastAction: "Triaged INC-051: QuickBooks OAuth expiry", lastActionTimestamp: "2026-04-02T08:30:00Z", confidenceAvg: 0.92, costTokens: 24800, costCompute: 0.88, escalationCount: 12, failureCount: 2, simulationOnly: false },
  { agentId: "aw-workflow-recovery", status: "active" as const, invocationCount: 167, lastAction: "Recovered stuck grocery-reorder workflow", lastActionTimestamp: "2026-04-02T06:00:00Z", confidenceAvg: 0.84, costTokens: 7200, costCompute: 0.24, escalationCount: 4, failureCount: 1, simulationOnly: false },
  { agentId: "aw-connector-health", status: "active" as const, invocationCount: 892, lastAction: "QuickBooks degraded — credential expiry in 48h", lastActionTimestamp: "2026-04-02T09:55:00Z", confidenceAvg: 0.89, costTokens: 4200, costCompute: 0.14, escalationCount: 6, failureCount: 0, simulationOnly: false },
  { agentId: "aw-release-safety", status: "active" as const, invocationCount: 78, lastAction: "Release v2.4.1 gate check — PASS", lastActionTimestamp: "2026-04-01T22:00:00Z", confidenceAvg: 0.94, costTokens: 3400, costCompute: 0.12, escalationCount: 1, failureCount: 0, simulationOnly: false },
  { agentId: "aw-rollback", status: "active" as const, invocationCount: 12, lastAction: "Prepared rollback plan for edge-function v2.3", lastActionTimestamp: "2026-04-01T20:00:00Z", confidenceAvg: 0.91, costTokens: 1800, costCompute: 0.06, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-sre", status: "active" as const, invocationCount: 1240, lastAction: "SLO compliance check — 99.4% availability", lastActionTimestamp: "2026-04-02T09:50:00Z", confidenceAvg: 0.93, costTokens: 9800, costCompute: 0.34, escalationCount: 3, failureCount: 0, simulationOnly: false },
  { agentId: "aw-fleet-health", status: "active" as const, invocationCount: 2100, lastAction: "Fleet scan — 5/6 devices healthy", lastActionTimestamp: "2026-04-02T09:55:00Z", confidenceAvg: 0.88, costTokens: 3600, costCompute: 0.12, escalationCount: 2, failureCount: 0, simulationOnly: false },
  { agentId: "aw-support-diagnostics", status: "active" as const, invocationCount: 34, lastAction: "Generated diagnostic bundle for INC-050", lastActionTimestamp: "2026-04-02T06:25:00Z", confidenceAvg: 0.81, costTokens: 4800, costCompute: 0.18, escalationCount: 1, failureCount: 0, simulationOnly: false },
  { agentId: "aw-security-monitor", status: "active" as const, invocationCount: 4200, lastAction: "Continuous scan — no threats detected", lastActionTimestamp: "2026-04-02T09:58:00Z", confidenceAvg: 0.96, costTokens: 32000, costCompute: 1.12, escalationCount: 2, failureCount: 0, simulationOnly: false },
  { agentId: "aw-permission-drift", status: "active" as const, invocationCount: 720, lastAction: "Permission audit — no drift detected", lastActionTimestamp: "2026-04-02T09:00:00Z", confidenceAvg: 0.94, costTokens: 5600, costCompute: 0.18, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-policy-review", status: "active" as const, invocationCount: 89, lastAction: "Reviewed POL-006 auto-grocery reorder", lastActionTimestamp: "2026-04-01T16:00:00Z", confidenceAvg: 0.88, costTokens: 3200, costCompute: 0.12, escalationCount: 1, failureCount: 0, simulationOnly: false },
  { agentId: "aw-audit-trail", status: "active" as const, invocationCount: 1560, lastAction: "Audit completeness: 100% — 8 logs validated", lastActionTimestamp: "2026-04-02T09:30:00Z", confidenceAvg: 0.97, costTokens: 6800, costCompute: 0.22, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-trust-threshold", status: "active" as const, invocationCount: 3400, lastAction: "Trust scores stable — avg 0.91", lastActionTimestamp: "2026-04-02T09:55:00Z", confidenceAvg: 0.90, costTokens: 4200, costCompute: 0.14, escalationCount: 1, failureCount: 0, simulationOnly: false },
  { agentId: "aw-fraud-abuse", status: "active" as const, invocationCount: 1800, lastAction: "No fraud patterns detected in last 24h", lastActionTimestamp: "2026-04-02T09:50:00Z", confidenceAvg: 0.93, costTokens: 12400, costCompute: 0.42, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-privacy-boundary", status: "active" as const, invocationCount: 680, lastAction: "Privacy scan — 0 PII exposures", lastActionTimestamp: "2026-04-02T09:00:00Z", confidenceAvg: 0.95, costTokens: 4800, costCompute: 0.16, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-token-budget", status: "active" as const, invocationCount: 2800, lastAction: "Token budget: 68.4K of 100K used (68.4%)", lastActionTimestamp: "2026-04-02T09:55:00Z", confidenceAvg: 0.96, costTokens: 2400, costCompute: 0.08, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-ai-spend-control", status: "active" as const, invocationCount: 720, lastAction: "Monthly spend: $27.40 — within budget", lastActionTimestamp: "2026-04-02T09:00:00Z", confidenceAvg: 0.91, costTokens: 3600, costCompute: 0.12, escalationCount: 1, failureCount: 0, simulationOnly: false },
  { agentId: "aw-model-routing", status: "active" as const, invocationCount: 1400, lastAction: "Routed 42 queries to gpt-4o-mini (cost savings)", lastActionTimestamp: "2026-04-02T09:50:00Z", confidenceAvg: 0.87, costTokens: 5200, costCompute: 0.18, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-latency-optimizer", status: "active" as const, invocationCount: 3200, lastAction: "p99 latency: 820ms — within threshold", lastActionTimestamp: "2026-04-02T09:55:00Z", confidenceAvg: 0.85, costTokens: 4800, costCompute: 0.16, escalationCount: 2, failureCount: 0, simulationOnly: false },
  { agentId: "aw-capacity-planning", status: "active" as const, invocationCount: 90, lastAction: "Capacity headroom: 62% — no scaling needed", lastActionTimestamp: "2026-04-02T06:00:00Z", confidenceAvg: 0.78, costTokens: 2200, costCompute: 0.08, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-cache-compression", status: "active" as const, invocationCount: 560, lastAction: "Cache hit rate: 87% — healthy", lastActionTimestamp: "2026-04-02T09:00:00Z", confidenceAvg: 0.84, costTokens: 2800, costCompute: 0.10, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-arch-consistency", status: "active" as const, invocationCount: 134, lastAction: "20/20 architecture invariants passing", lastActionTimestamp: "2026-04-02T08:00:00Z", confidenceAvg: 0.92, costTokens: 4200, costCompute: 0.14, escalationCount: 1, failureCount: 0, simulationOnly: false },
  { agentId: "aw-registry-truth", status: "active" as const, invocationCount: 245, lastAction: "18 registry files in sync", lastActionTimestamp: "2026-04-02T09:00:00Z", confidenceAvg: 0.89, costTokens: 8400, costCompute: 0.28, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-generated-manifest", status: "active" as const, invocationCount: 178, lastAction: "36 manifests validated — all current", lastActionTimestamp: "2026-04-02T08:30:00Z", confidenceAvg: 0.91, costTokens: 7200, costCompute: 0.24, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-contract-integrity", status: "active" as const, invocationCount: 112, lastAction: "No breaking contract changes detected", lastActionTimestamp: "2026-04-02T07:00:00Z", confidenceAvg: 0.93, costTokens: 3800, costCompute: 0.12, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-boundary-enforcement", status: "active" as const, invocationCount: 156, lastAction: "Import boundary check — 0 violations", lastActionTimestamp: "2026-04-02T08:00:00Z", confidenceAvg: 0.94, costTokens: 3200, costCompute: 0.10, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-change-control", status: "active" as const, invocationCount: 67, lastAction: "ADR coverage: 85% — 2 missing ADRs flagged", lastActionTimestamp: "2026-04-02T06:00:00Z", confidenceAvg: 0.82, costTokens: 1800, costCompute: 0.06, escalationCount: 1, failureCount: 0, simulationOnly: false },
  { agentId: "aw-knowledge-curator", status: "active" as const, invocationCount: 134, lastAction: "Updated 3 runbooks after incident resolution", lastActionTimestamp: "2026-04-02T08:00:00Z", confidenceAvg: 0.80, costTokens: 6200, costCompute: 0.22, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-release-notes", status: "active" as const, invocationCount: 24, lastAction: "Generated release notes for v2.4.1", lastActionTimestamp: "2026-04-01T22:30:00Z", confidenceAvg: 0.83, costTokens: 4800, costCompute: 0.18, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-sprint-planning", status: "active" as const, invocationCount: 56, lastAction: "Sprint 14 velocity: 42 points (stable)", lastActionTimestamp: "2026-04-02T06:00:00Z", confidenceAvg: 0.76, costTokens: 2400, costCompute: 0.08, escalationCount: 0, failureCount: 0, simulationOnly: false },
  { agentId: "aw-tpm", status: "active" as const, invocationCount: 89, lastAction: "2 cross-team dependencies on track", lastActionTimestamp: "2026-04-02T07:00:00Z", confidenceAvg: 0.78, costTokens: 3200, costCompute: 0.10, escalationCount: 1, failureCount: 0, simulationOnly: false },
  { agentId: "aw-repo-drift", status: "active" as const, invocationCount: 178, lastAction: "Drift scan: 1 stale doc detected", lastActionTimestamp: "2026-04-02T08:00:00Z", confidenceAvg: 0.81, costTokens: 3600, costCompute: 0.12, escalationCount: 0, failureCount: 0, simulationOnly: false },
];

export const mockSupervisorRuntimeStates = [
  { supervisorId: "chief-of-staff", status: "active" as const, overrideCount: 3, activeEscalations: 2, lastOverride: "2026-04-02T08:30:00Z" },
  { supervisorId: "sup-product", status: "active" as const, overrideCount: 1, activeEscalations: 1, lastOverride: "2026-04-01T14:00:00Z" },
  { supervisorId: "sup-reliability", status: "active" as const, overrideCount: 5, activeEscalations: 3, lastOverride: "2026-04-02T08:30:00Z" },
  { supervisorId: "sup-security", status: "active" as const, overrideCount: 2, activeEscalations: 0, lastOverride: "2026-04-01T10:00:00Z" },
  { supervisorId: "sup-runtime", status: "active" as const, overrideCount: 0, activeEscalations: 0, lastOverride: null },
  { supervisorId: "sup-architecture", status: "active" as const, overrideCount: 1, activeEscalations: 0, lastOverride: "2026-04-01T08:00:00Z" },
  { supervisorId: "sup-knowledge", status: "active" as const, overrideCount: 0, activeEscalations: 0, lastOverride: null },
];

// ═══════════════════════════════════════════════════
// NEW: Trust Center, Releases, Model Routing, etc.
// ═══════════════════════════════════════════════════

export const mockTrustCenter = {
  overallScore: 94,
  trend: "stable" as const,
  domains: [
    { domain: "Data Integrity", score: 97, status: "healthy" as const },
    { domain: "Connector Health", score: 85, status: "degraded" as const },
    { domain: "Execution Reliability", score: 98, status: "healthy" as const },
    { domain: "Model Confidence", score: 91, status: "healthy" as const },
    { domain: "Policy Compliance", score: 100, status: "healthy" as const },
    { domain: "Privacy Boundary", score: 96, status: "healthy" as const },
  ],
  verificationStatus: {
    receiptChain: "complete" as const,
    auditLog: "enabled" as const,
    approvalGates: "enforced" as const,
    tenantIsolation: "verified" as const,
  },
  recentEvents: [
    { event: "Trust score recalculated", time: "5 min ago", delta: 0 },
    { event: "Connector health degraded (QuickBooks)", time: "2h ago", delta: -3 },
    { event: "Privacy audit passed", time: "6h ago", delta: +1 },
  ],
};

export const mockReleases = {
  currentVersion: "v2.4.1",
  frozen: false,
  rings: [
    { ring: 0, name: "Canary", status: "deployed" as const, version: "v2.4.2-rc.1", progress: 100, approvedBy: "release-safety-agent", deployedAt: "2026-04-02T04:00:00Z" },
    { ring: 1, name: "Early Access", status: "deploying" as const, version: "v2.4.2-rc.1", progress: 45, approvedBy: null, deployedAt: null },
    { ring: 2, name: "General Availability", status: "waiting" as const, version: "v2.4.1", progress: 0, approvedBy: null, deployedAt: null },
  ],
  recentReleases: [
    { version: "v2.4.1", date: "2026-04-01", status: "live" as const, changes: 14, rollback: false },
    { version: "v2.4.0", date: "2026-03-28", status: "superseded" as const, changes: 22, rollback: false },
    { version: "v2.3.2", date: "2026-03-25", status: "superseded" as const, changes: 8, rollback: true },
  ],
  gates: [
    { name: "Unit Tests", passed: true },
    { name: "Integration Tests", passed: true },
    { name: "Architecture Compliance", passed: true },
    { name: "Tenant Isolation", passed: true },
    { name: "Canary Health", passed: true },
    { name: "Rollback Plan", passed: true },
  ],
};

export const mockModelRouting = {
  models: [
    { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", costPer1kTokens: 0.005, qualityScore: 94, latencyP95: 1240, requestCount: 98, tokenCount: 52000, autoRoute: true },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", costPer1kTokens: 0.00015, qualityScore: 87, latencyP95: 580, requestCount: 44, tokenCount: 16400, autoRoute: true },
    { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", costPer1kTokens: 0.003, qualityScore: 92, latencyP95: 980, requestCount: 0, tokenCount: 0, autoRoute: false },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", costPer1kTokens: 0.00125, qualityScore: 89, latencyP95: 860, requestCount: 0, tokenCount: 0, autoRoute: false },
  ],
  routingPolicy: "cost-optimized" as const,
  autoRoutingEnabled: true,
  totalCost: 27.40,
  totalTokens: 68400,
};

export const mockKnowledgeHealth = {
  totalDocs: 42,
  freshDocs: 38,
  staleDocs: 3,
  missingDocs: 1,
  registryFiles: 18,
  registryInSync: 17,
  lastAudit: "2026-04-02T08:00:00Z",
  staleDcosList: [
    { name: "deployment-runbook.md", lastUpdated: "2026-03-15", staleDays: 18 },
    { name: "connector-quickbooks.md", lastUpdated: "2026-03-20", staleDays: 13 },
    { name: "api-rate-limits.md", lastUpdated: "2026-03-22", staleDays: 11 },
  ],
  driftDetections: [
    { file: "service-topology.yaml", status: "synced" as const },
    { file: "capability-map.yaml", status: "synced" as const },
    { file: "event-topology.yaml", status: "drifted" as const, detail: "Missing 2 new event types" },
  ],
};

export const mockSupportCases = [
  { id: "SC-001", title: "QuickBooks sync investigation", status: "open" as const, priority: "high" as const, created: "2026-04-02T08:30:00Z", assignedTo: "aw-support-diagnostics", diagnosticBundle: true },
  { id: "SC-002", title: "Latency spike root cause", status: "in-progress" as const, priority: "medium" as const, created: "2026-04-02T06:15:00Z", assignedTo: "aw-incident-response", diagnosticBundle: true },
  { id: "SC-003", title: "Memory confidence drift review", status: "resolved" as const, priority: "low" as const, created: "2026-04-01T14:00:00Z", assignedTo: "aw-support-diagnostics", diagnosticBundle: true },
];

export const mockChangeReviews = [
  { id: "ADR-014", title: "Adopt event-driven connector health", status: "approved" as const, author: "aw-arch-consistency", date: "2026-04-01", impact: "medium" as const },
  { id: "ADR-013", title: "Migrate to structured logging", status: "approved" as const, author: "aw-sre", date: "2026-03-28", impact: "low" as const },
  { id: "ADR-012", title: "Add model routing fallback chain", status: "pending" as const, author: "aw-model-routing", date: "2026-04-02", impact: "high" as const },
  { id: "ADR-011", title: "Enforce receipt-proof on all side effects", status: "approved" as const, author: "aw-policy-review", date: "2026-03-25", impact: "high" as const },
];

export const mockRollbackCenter = {
  services: [
    { name: "brain-core", version: "v2.4.1", previousVersion: "v2.4.0", rollbackReady: true, lastRollback: null, healthScore: 99 },
    { name: "executor-service", version: "v2.4.1", previousVersion: "v2.4.0", rollbackReady: true, lastRollback: null, healthScore: 98 },
    { name: "policy-engine", version: "v2.4.1", previousVersion: "v2.4.0", rollbackReady: true, lastRollback: "2026-03-25T14:00:00Z", healthScore: 100 },
    { name: "receipt-service", version: "v2.4.1", previousVersion: "v2.4.0", rollbackReady: true, lastRollback: null, healthScore: 99 },
    { name: "event-bus", version: "v2.4.1", previousVersion: "v2.4.0", rollbackReady: true, lastRollback: null, healthScore: 97 },
    { name: "connector-runtime", version: "v2.4.1", previousVersion: "v2.3.2", rollbackReady: false, lastRollback: "2026-03-25T14:00:00Z", healthScore: 85 },
  ],
  globalRollbackReady: true,
};

export const mockServiceMap = {
  layers: [
    { id: "surface", name: "A. Surface Layer", serviceCount: 8, healthyCount: 8, services: ["web", "mobile", "admin", "desktop", "device-ui", "holodeck-ui", "spatial", "unity"] },
    { id: "brain", name: "B. Brain & Orchestration", serviceCount: 8, healthyCount: 8, services: ["brain-core", "council-orchestrator", "capability-router", "constitution-engine", "policy-engine", "trust-governor", "approval-service", "simulator"] },
    { id: "domain", name: "C. Domain Layer", serviceCount: 12, healthyCount: 11, services: ["finance-os", "business-os", "concierge-os", "identity", "household-org-graph", "boardroom", "timeline-calendar", "opportunity-engine", "pack-management", "document-engine", "file-ingestion", "service-providers"] },
    { id: "trust", name: "D. Trust & Governance", serviceCount: 12, healthyCount: 12, services: ["policy-engine", "constitution-engine", "approval-service", "receipt-service", "verification-engine", "trust-governor", "trust-state", "role-permission", "trusted-device", "audit-ledger", "duress-detection", "emergency-halt"] },
    { id: "execution", name: "E. Execution & Integration", serviceCount: 10, healthyCount: 9, services: ["executor-service", "connector-control-plane", "connector-runners", "realtime-gateway", "workflow-engine", "notifications", "billing", "integration-concierge", "service-registry", "action-queue"] },
    { id: "data", name: "F. Data & Memory", serviceCount: 10, healthyCount: 10, services: ["database", "event-bus", "entity-graph", "mnemosyne", "projection-service", "analytics", "audit-ledger", "personal-operating-model", "opportunity-graph", "digital-twins"] },
    { id: "os", name: "G. OS Unification", serviceCount: 2, healthyCount: 2, services: ["os-unification", "owner-control-room"] },
    { id: "intelligence", name: "H. Intelligence & Economics", serviceCount: 5, healthyCount: 5, services: ["ai-economics", "ai-workforce", "revenue-autopilot", "capital-allocation", "observability"] },
    { id: "infra", name: "I. Infra & Deployment", serviceCount: 12, healthyCount: 11, services: ["cloud-control-plane", "edge-device-runtime", "incident-systems", "secrets-kms", "ci", "release-rings", "fleet-ota", "schema-migrations", "feature-flags", "tenant-rollout-flags", "freeze-mode", "emergency-stop"] },
  ],
  totalServices: 79,
  totalHealthy: 76,
  executionChain: [
    { step: "Intent", service: "Surface Layer", status: "healthy" as const },
    { step: "Brain Core", service: "brain-core", status: "healthy" as const },
    { step: "Policy Engine", service: "policy-engine", status: "healthy" as const },
    { step: "Capability Router", service: "capability-router", status: "healthy" as const },
    { step: "Executor", service: "executor-service", status: "healthy" as const },
    { step: "Receipt", service: "receipt-service", status: "healthy" as const },
    { step: "Event Bus", service: "event-bus", status: "healthy" as const },
    { step: "Read Models", service: "projection-service", status: "healthy" as const },
  ],
};

// SLO data for SystemStatus
export const mockSLOs = [
  { service: "api-gateway", slo: 99.95, current: 99.92, burnRate: "normal" as const, period: "30d" },
  { service: "brain-core", slo: 99.9, current: 99.4, burnRate: "medium" as const, period: "30d" },
  { service: "approval-service", slo: 99.99, current: 99.99, burnRate: "normal" as const, period: "30d" },
  { service: "receipt-service", slo: 99.99, current: 100, burnRate: "normal" as const, period: "30d" },
  { service: "policy-engine", slo: 99.95, current: 99.97, burnRate: "normal" as const, period: "30d" },
  { service: "event-bus", slo: 99.9, current: 99.85, burnRate: "fast" as const, period: "30d" },
];

// Architecture gates for MissionControl
export const mockArchGates = [
  { name: "Tenant Isolation", status: "pass" as const, lastRun: "2026-04-02T08:00:00Z", details: "All queries scoped to tenant" },
  { name: "Import Boundaries", status: "pass" as const, lastRun: "2026-04-02T08:00:00Z", details: "No cross-module violations" },
  { name: "Surface Ownership", status: "pass" as const, lastRun: "2026-04-02T08:00:00Z", details: "All surfaces are thin shells" },
  { name: "Policy Binding", status: "pass" as const, lastRun: "2026-04-02T08:00:00Z", details: "All side effects gate through policy" },
  { name: "Receipt Completeness", status: "pass" as const, lastRun: "2026-04-02T08:00:00Z", details: "All executions emit receipts" },
  { name: "Registry Freshness", status: "warn" as const, lastRun: "2026-04-02T08:00:00Z", details: "1 registry file has drift" },
];

export const mockDeploymentRings = [
  { ring: 0, name: "Canary (1%)", version: "v2.4.2-rc.1", status: "healthy" as const, progress: 100 },
  { ring: 1, name: "Early Access (10%)", version: "v2.4.2-rc.1", status: "deploying" as const, progress: 45 },
  { ring: 2, name: "GA (100%)", version: "v2.4.1", status: "stable" as const, progress: 100 },
];

export const mockTestCoverage = {
  unit: 78,
  integration: 45,
  e2e: 12,
  contract: 92,
};
