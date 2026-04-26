// ═══════════════════════════════════════════════════════════════
// SITA OS — Background Tasks Demo Fixture
// Sole canonical home for sample background-job rows.
// Imported by `business-background-tasks-service` ONLY when isDemoMode.
// ═══════════════════════════════════════════════════════════════

import "./_demo-source-marker";
import type { BackgroundJobVM } from "@/modules/business/domain/background-tasks/types";

function isoOffsetMinutes(min: number): string {
  return new Date(Date.now() + min * 60 * 1000).toISOString();
}

/** Build a fresh demo dataset relative to "now". */
export function buildDemoBackgroundJobs(): BackgroundJobVM[] {
  return [
    {
      id: "import:demo-1",
      kind: "import",
      title: "CSV Import — contacts_q1.csv",
      status: "running",
      progress: 67,
      startedAt: isoOffsetMinutes(-2),
      details: "1,340 of 2,000 rows · 4 errors",
      sourceTable: "crm_import_jobs",
      sourceId: "demo-1",
      canRetry: false,
      canCancel: true,
    },
    {
      id: "sync:demo-2",
      kind: "sync",
      title: "Sync — google_contacts (contact)",
      status: "running",
      progress: 50,
      startedAt: isoOffsetMinutes(-5),
      details: "450 records · pull",
      sourceTable: "connector_sync_runs",
      sourceId: "demo-2",
      canRetry: false,
      canCancel: false,
    },
    {
      id: "automation:demo-3",
      kind: "automation",
      title: "Automation — Follow-up sequence",
      status: "completed",
      progress: 100,
      startedAt: isoOffsetMinutes(-15),
      completedAt: isoOffsetMinutes(-12),
      durationMs: 222000,
      details: "12 total runs · contact",
      sourceTable: "crm_automations",
      sourceId: "demo-3",
      canRetry: false,
      canCancel: false,
    },
    {
      id: "export:demo-4",
      kind: "export",
      title: "Data export — PDF",
      status: "completed",
      progress: 100,
      startedAt: isoOffsetMinutes(-60),
      completedAt: isoOffsetMinutes(-59),
      durationMs: 28000,
      details: "1,420 rows across 6 tables",
      sourceTable: "data_export_requests",
      sourceId: "demo-4",
      canRetry: false,
      canCancel: false,
    },
    {
      id: "automation:demo-5",
      kind: "automation",
      title: "Automation — Lead scoring batch",
      status: "failed",
      progress: 34,
      startedAt: isoOffsetMinutes(-120),
      completedAt: isoOffsetMinutes(-119),
      durationMs: 75000,
      details: "Rate limit exceeded",
      error: "Provider rate limit exceeded — retry available",
      sourceTable: "crm_automations",
      sourceId: "demo-5",
      canRetry: true,
      canCancel: false,
      recoveryHref: "/admin/ar07-retry-failure-center?source=demo&id=demo-5",
    },
    {
      id: "import:demo-6",
      kind: "import",
      title: "CSV Import — deals_backfill.xlsx",
      status: "queued",
      progress: 0,
      startedAt: isoOffsetMinutes(-1),
      details: "Awaiting worker",
      sourceTable: "crm_import_jobs",
      sourceId: "demo-6",
      canRetry: false,
      canCancel: true,
    },
    {
      id: "workflow:demo-7",
      kind: "workflow",
      title: "Workflow run — step 3",
      status: "running",
      progress: 50,
      startedAt: isoOffsetMinutes(-8),
      details: "Executing step 3 of customer-onboarding",
      sourceTable: "workflow_runs",
      sourceId: "demo-7",
      canRetry: false,
      canCancel: true,
    },
  ];
}