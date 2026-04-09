// SITA OS — Demo Data: Atlas

export const DEMO_connectors = [
  { id: "google-ads", name: "Google Ads", status: "active", health: 98, lastSync: h(0.5), syncStatus: "success", lifecycleState: "active", capabilities: ["read-campaigns", "read-metrics", "write-campaigns"], approvalRequired: true, auditEntries: 45, failureCount: 0, enterprise: true },
  { id: "meta-ads", name: "Meta Ads", status: "error", health: 0, lastSync: h(48), syncStatus: "auth-expired", lifecycleState: "error", capabilities: ["read-campaigns", "read-metrics"], approvalRequired: true, auditEntries: 23, failureCount: 3, enterprise: true },
  { id: "quickbooks", name: "QuickBooks", status: "active", health: 95, lastSync: h(1), syncStatus: "success", lifecycleState: "active", capabilities: ["read-invoices", "read-payments", "write-invoices"], approvalRequired: true, auditEntries: 67, failureCount: 1, enterprise: true },
  { id: "slack", name: "Slack", status: "active", health: 100, lastSync: h(0.1), syncStatus: "success", lifecycleState: "active", capabilities: ["send-message", "read-channels"], approvalRequired: false, auditEntries: 120, failureCount: 0, enterprise: false },
  { id: "stripe", name: "Stripe", status: "paused", health: 85, lastSync: h(24), syncStatus: "paused", lifecycleState: "paused", capabilities: ["read-payments", "read-subscriptions", "write-refunds"], approvalRequired: true, auditEntries: 34, failureCount: 0, enterprise: true },
];

export const DEMO_auditTimeline = [
  { connector: "google-ads", action: "sync-completed", time: h(0.5), actor: "system", receiptId: "rcpt-ga-1" },
  { connector: "meta-ads", action: "auth-token-expired", time: h(24), actor: "system", receiptId: "rcpt-ma-1" },
  { connector: "meta-ads", action: "reconnection-attempted", time: h(12), actor: "user", receiptId: "rcpt-ma-2" },
  { connector: "quickbooks", action: "sync-completed", time: h(1), actor: "system", receiptId: "rcpt-qb-1" },
  { connector: "slack", action: "message-sent", time: h(0.1), actor: "agent:notifier", receiptId: "rcpt-sl-1" },
  { connector: "stripe", action: "paused-by-user", time: h(24), actor: "user", receiptId: "rcpt-st-1" },
];

export const DEMO_services = [
  { name: "Supabase Database", status: "healthy", latency: 12, uptime: 99.98, lastCheck: h(0.02) },
  { name: "Supabase Auth", status: "healthy", latency: 45, uptime: 99.95, lastCheck: h(0.02) },
  { name: "Edge Functions", status: "healthy", latency: 120, uptime: 99.9, lastCheck: h(0.05) },
  { name: "Storage", status: "healthy", latency: 85, uptime: 99.99, lastCheck: h(0.02) },
  { name: "Realtime", status: "degraded", latency: 350, uptime: 99.5, lastCheck: h(0.02) },
  { name: "Connector Gateway", status: "healthy", latency: 200, uptime: 99.8, lastCheck: h(0.1) },
];

export const DEMO_slos = [
  { name: "API Availability", target: 99.9, current: 99.95, burnRate: 0.3, budget: 95, window: "30d" },
  { name: "Auth Latency P95", target: 200, current: 145, burnRate: 0.1, budget: 98, window: "30d", unit: "ms" },
  { name: "Edge Function P95", target: 500, current: 380, burnRate: 0.2, budget: 92, window: "7d", unit: "ms" },
  { name: "DB Query P95", target: 100, current: 42, burnRate: 0.05, budget: 99, window: "30d", unit: "ms" },
  { name: "Error Rate", target: 0.1, current: 0.02, burnRate: 0.15, budget: 97, window: "7d", unit: "%" },
];

export const DEMO_alerts = [
  { id: "a1", severity: "warning" as const, title: "Realtime latency elevated", source: "Supabase Realtime", time: h(0.5), acknowledged: false, runbookId: "rb-realtime-latency" },
  { id: "a2", severity: "info" as const, title: "Edge function cold starts increased", source: "Edge Functions", time: h(2), acknowledged: true, runbookId: "rb-cold-start" },
  { id: "a3", severity: "info" as const, title: "Storage usage approaching 80%", source: "Storage", time: h(6), acknowledged: true, runbookId: "rb-storage-pressure" },
];

export const DEMO_runbooks = [
  { id: "rb-realtime-latency", name: "Realtime Latency Spike", steps: 5, lastUsed: h(168), status: "available" },
  { id: "rb-cold-start", name: "Edge Function Cold Starts", steps: 4, lastUsed: h(72), status: "available" },
  { id: "rb-storage-pressure", name: "Storage Pressure Response", steps: 3, lastUsed: null, status: "available" },
  { id: "rb-db-pool", name: "DB Pool Exhaustion", steps: 6, lastUsed: h(720), status: "available" },
  { id: "rb-memory-leak", name: "Memory Leak Response", steps: 7, lastUsed: null, status: "available" },
  { id: "rb-error-rate", name: "High Error Rate Response", steps: 5, lastUsed: h(336), status: "available" },
  { id: "rb-approval-backlog", name: "Approval Queue Backlog", steps: 4, lastUsed: h(48), status: "available" },
  { id: "rb-api-latency", name: "API Latency Spike", steps: 5, lastUsed: h(168), status: "available" },
];

export const DEMO_incidents = [
  { id: "inc-1", title: "Realtime websocket connection drops", severity: "medium", status: "investigating", started: h(0.5), assignee: "system", relatedAlert: "a1" },
];
