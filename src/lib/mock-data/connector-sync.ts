// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared demo data: Connector sync dashboard
// Extracted from ConnectorSyncDashboard for boundary compliance
// ═══════════════════════════════════════════════════════════════

export const DEMO_SYNC_CONNECTORS = [
  { id: "1", connector_type: "gmail", display_name: "Gmail", status: "active", last_sync_at: new Date(Date.now() - 600000).toISOString(), sync_count: 72, error_rate: 0.3 },
  { id: "2", connector_type: "stripe", display_name: "Stripe Payments", status: "active", last_sync_at: new Date(Date.now() - 300000).toISOString(), sync_count: 96, error_rate: 0 },
  { id: "3", connector_type: "google-cal", display_name: "Google Calendar", status: "degraded", last_sync_at: new Date(Date.now() - 7200000).toISOString(), sync_count: 24, error_rate: 2.1 },
  { id: "4", connector_type: "quickbooks", display_name: "QuickBooks", status: "disconnected", last_sync_at: null, sync_count: 0, error_rate: 0 },
];

export type DemoSyncConnector = (typeof DEMO_SYNC_CONNECTORS)[number];
