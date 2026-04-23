// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Hub: Demo Connections (scaffolding mode)
// ═══════════════════════════════════════════════════════════════

import type { ConnectionStatus, RiskLevel, ActionStatus } from "./connector-sdk";

export interface DemoConnection {
  id: string;
  providerId: string;
  providerName: string;
  status: ConnectionStatus;
  externalAccountName: string;
  externalAccountId: string;
  scopes: string[];
  mode: "simple" | "agency";
  connectedAt: string;
  lastSyncAt: string | null;
  lastHealthCheck: string | null;
  lastHealthStatus: "healthy" | "degraded" | "error" | null;
  lastError: string | null;
  syncRuns: DemoSyncRun[];
}

export interface DemoSyncRun {
  id: string;
  type: "pull" | "push";
  status: "completed" | "running" | "failed";
  startedAt: string;
  endedAt: string | null;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
}

export interface DemoActionRequest {
  id: string;
  connectionId: string;
  providerName: string;
  actionType: string;
  actionName: string;
  riskLevel: RiskLevel;
  status: ActionStatus;
  requestedBy: string;
  requestedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  payload: Record<string, any>;
  dryRunResult: any | null;
  executionResult: any | null;
  executionError: string | null;
}

export interface DemoAuditEntry {
  id: string;
  eventType: string;
  summary: string;
  actor: string;
  connectionName: string;
  timestamp: string;
}

// ── Demo Data ─────────────────────────────────────────────────

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

export const CONNECTIONS: DemoConnection[] = [
  {
    id: "conn-1", providerId: "hubspot", providerName: "HubSpot", status: "connected",
    externalAccountName: "Acme Corp Portal", externalAccountId: "hub-12345",
    scopes: ["crm.objects.contacts.read", "crm.objects.contacts.write", "crm.objects.deals.read"],
    mode: "simple", connectedAt: h(720), lastSyncAt: h(0.5), lastHealthCheck: h(0.25),
    lastHealthStatus: "healthy", lastError: null,
    syncRuns: [
      { id: "sr-1", type: "pull", status: "completed", startedAt: h(0.5), endedAt: h(0.4), recordsProcessed: 342, recordsCreated: 12, recordsUpdated: 28, recordsFailed: 0 },
      { id: "sr-2", type: "pull", status: "completed", startedAt: h(24.5), endedAt: h(24.4), recordsProcessed: 335, recordsCreated: 5, recordsUpdated: 18, recordsFailed: 1 },
    ],
  },
  {
    id: "conn-2", providerId: "google-ads", providerName: "Google Ads", status: "connected",
    externalAccountName: "Acme Marketing", externalAccountId: "gads-67890",
    scopes: ["ads.readonly", "ads"],
    mode: "simple", connectedAt: h(480), lastSyncAt: h(1), lastHealthCheck: h(0.5),
    lastHealthStatus: "healthy", lastError: null,
    syncRuns: [
      { id: "sr-3", type: "pull", status: "completed", startedAt: h(1), endedAt: h(0.9), recordsProcessed: 15, recordsCreated: 0, recordsUpdated: 15, recordsFailed: 0 },
    ],
  },
  {
    id: "conn-3", providerId: "quickbooks", providerName: "QuickBooks Online", status: "connected",
    externalAccountName: "Acme Corp Books", externalAccountId: "qb-11111",
    scopes: ["com.intuit.quickbooks.accounting"],
    mode: "simple", connectedAt: h(360), lastSyncAt: h(2), lastHealthCheck: h(1),
    lastHealthStatus: "healthy", lastError: null,
    syncRuns: [
      { id: "sr-4", type: "pull", status: "completed", startedAt: h(2), endedAt: h(1.9), recordsProcessed: 89, recordsCreated: 3, recordsUpdated: 12, recordsFailed: 0 },
    ],
  },
  {
    id: "conn-4", providerId: "stripe", providerName: "Stripe", status: "connected",
    externalAccountName: "Acme Payments", externalAccountId: "acct_123",
    scopes: ["read_write"],
    mode: "simple", connectedAt: h(500), lastSyncAt: h(0.1), lastHealthCheck: h(0.1),
    lastHealthStatus: "healthy", lastError: null,
    syncRuns: [],
  },
  {
    id: "conn-5", providerId: "meta-ads", providerName: "Meta Ads", status: "expired",
    externalAccountName: "Acme Social", externalAccountId: "act_99999",
    scopes: ["ads_read"],
    mode: "simple", connectedAt: h(1200), lastSyncAt: h(168), lastHealthCheck: h(24),
    lastHealthStatus: "error", lastError: "OAuth token expired. Please reconnect.",
    syncRuns: [],
  },
];

export const ACTION_REQUESTS: DemoActionRequest[] = [
  {
    id: "ar-1", connectionId: "conn-1", providerName: "HubSpot", actionType: "create-contact", actionName: "Create Contact",
    riskLevel: "low", status: "succeeded", requestedBy: "You", requestedAt: h(2),
    approvedBy: null, approvedAt: null,
    payload: { firstName: "Sarah", lastName: "Chen", email: "sarah@example.com", company: "TechFlow" },
    dryRunResult: { valid: true, preview: [{ field: "Contact", currentValue: "—", newValue: "Sarah Chen (sarah@example.com)", action: "create" }], warnings: [], estimatedImpact: "1 contact created" },
    executionResult: { success: true, data: { id: "hub-contact-789", name: "Sarah Chen" } },
    executionError: null,
  },
  {
    id: "ar-2", connectionId: "conn-2", providerName: "Google Ads", actionType: "update-budget", actionName: "Update Campaign Budget",
    riskLevel: "high", status: "proposed", requestedBy: "You", requestedAt: h(0.5),
    approvedBy: null, approvedAt: null,
    payload: { campaignId: "camp-123", campaignName: "Spring Sale 2026", currentBudget: 5000, newBudget: 7500, currency: "USD" },
    dryRunResult: { valid: true, preview: [{ field: "Daily Budget", currentValue: "$50.00/day", newValue: "$75.00/day", action: "update" }, { field: "Est. Monthly Spend", currentValue: "$1,500", newValue: "$2,250", action: "update" }], warnings: ["This will increase monthly spend by ~$750"], estimatedImpact: "Budget increase of 50% on 1 campaign", estimatedCost: { amount: 2250, currency: "USD" } },
    executionResult: null, executionError: null,
  },
  {
    id: "ar-3", connectionId: "conn-3", providerName: "QuickBooks", actionType: "create-invoice", actionName: "Create Invoice",
    riskLevel: "high", status: "approved", requestedBy: "You", requestedAt: h(1),
    approvedBy: "You", approvedAt: h(0.8),
    payload: { customerName: "TechFlow Inc.", amount: 4500, items: [{ desc: "Consulting — March 2026", amount: 4500 }] },
    dryRunResult: { valid: true, preview: [{ field: "Invoice", currentValue: "—", newValue: "INV-2026-042 — TechFlow Inc. — $4,500.00", action: "create" }], warnings: [], estimatedImpact: "1 invoice created" },
    executionResult: null, executionError: null,
  },
  {
    id: "ar-4", connectionId: "conn-4", providerName: "Stripe", actionType: "refund-payment", actionName: "Refund Payment",
    riskLevel: "high", status: "rejected", requestedBy: "You", requestedAt: h(48),
    approvedBy: null, approvedAt: null,
    payload: { paymentId: "pi_abc123", amount: 250, reason: "Customer request" },
    dryRunResult: null, executionResult: null, executionError: null,
  },
];

export const AUDIT_LOG: DemoAuditEntry[] = [
  { id: "al-1", eventType: "connection.created", summary: "Connected HubSpot — Acme Corp Portal", actor: "You", connectionName: "HubSpot", timestamp: h(720) },
  { id: "al-2", eventType: "sync.completed", summary: "Synced 342 HubSpot contacts", actor: "System", connectionName: "HubSpot", timestamp: h(0.5) },
  { id: "al-3", eventType: "action.proposed", summary: "Proposed: Update Google Ads campaign budget ($50→$75/day)", actor: "You", connectionName: "Google Ads", timestamp: h(0.5) },
  { id: "al-4", eventType: "action.approved", summary: "Approved: Create QuickBooks invoice for TechFlow Inc.", actor: "You", connectionName: "QuickBooks", timestamp: h(0.8) },
  { id: "al-5", eventType: "action.executed", summary: "Executed: Created HubSpot contact Sarah Chen", actor: "System", connectionName: "HubSpot", timestamp: h(2) },
  { id: "al-6", eventType: "action.rejected", summary: "Rejected: Stripe refund $250 — insufficient documentation", actor: "You", connectionName: "Stripe", timestamp: h(48) },
  { id: "al-7", eventType: "health.warning", summary: "Meta Ads token expired — reconnection needed", actor: "System", connectionName: "Meta Ads", timestamp: h(24) },
  { id: "al-8", eventType: "connection.created", summary: "Connected Google Ads — Acme Marketing", actor: "You", connectionName: "Google Ads", timestamp: h(480) },
  { id: "al-9", eventType: "connection.created", summary: "Connected Stripe — Acme Payments", actor: "You", connectionName: "Stripe", timestamp: h(500) },
];

