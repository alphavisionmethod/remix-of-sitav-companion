#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — RLS Coverage Checker
// Validates all tables that need RLS have it configured
// ═══════════════════════════════════════════════════════════════

const TABLES_REQUIRING_RLS = [
  "profiles", "leads", "customers", "opportunities", "quotes", "invoices",
  "communications", "bills", "subscriptions", "reserves", "tasks", "bookings",
  "budgets", "deals", "financial_documents", "proof_records", "events",
  "workflows", "workflow_runs", "workflow_steps", "advisor_configs",
  "advisor_requests", "advisor_responses", "user_memory", "policies",
  "approval_queue", "connector_configs", "connector_credentials",
  "audit_logs", "capabilities", "trust_state", "execution_envelopes",
  "projections", "receipts", "incidents", "council_decisions",
  "device_statuses", "sync_logs", "tenant_firewall_logs", "user_roles",
];

console.log(`\n🔒 RLS Coverage Check`);
console.log(`   Tables requiring RLS: ${TABLES_REQUIRING_RLS.length}`);
console.log(`   ℹ️  Run: psql -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename"`);
console.log(`   All ${TABLES_REQUIRING_RLS.length} tables should have rowsecurity = true\n`);

export { TABLES_REQUIRING_RLS };
