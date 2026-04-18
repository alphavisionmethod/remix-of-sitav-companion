// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Markdown Loader (Section B.5)
// Loads the .md content for a runbook so the in-app viewer can
// render it without a network round-trip. Markdown is bundled at
// build time via Vite's import.meta.glob.
// ═══════════════════════════════════════════════════════════════

import { RUNBOOK_REGISTRY, type RunbookEntry } from "./runbook-registry";

// Eagerly import all runbook markdown files at build time.
const MARKDOWN_MODULES = import.meta.glob("/docs/runbooks/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

// Map runbook id → markdown filename slug (manually curated to match docs).
const FILENAME_BY_RUNBOOK_ID: Record<string, string> = {
  "RB-001": "auth-outage",
  "RB-002": "provider-outage",
  "RB-003": "sync-lag",
  "RB-005": "payments",  // handled below as fallback
  "RB-006": "generated-vs-runtime-drift",
  "RB-007": "push-failure",
  "RB-009": "release-rollback",
  "RB-010": "ai-provider-degradation",
  "RB-019": "support-escalation-failure",
  "RB-CONNECTOR-TOKEN-FAILURE": "connector-token-failure",
  "RB-PUSH-FAILURE": "push-failure",
  "RB-AI-PROVIDER-DEGRADATION": "ai-provider-degradation",
  "RB-STUCK-WORKFLOW": "stuck-workflow",
  "RB-RELEASE-ROLLBACK": "release-rollback",
  "RB-VMWARE-BOOT-FAILURE": "vmware-boot-failure",
  "RB-SUPPORT-ESCALATION-FAILURE": "support-escalation-failure",
  "RB-PROOF-MISMATCH": "proof-mismatch",
  "RB-DB-RESTORE": "db-restore-failure",
  "RB-RLS-MISCONFIG": "rls-misconfig",
  "RB-MOBILE-PUSH-REGISTRATION": "mobile-push-registration",
  "RB-RUNTIME-PROBE-FAILURE": "runtime-probe-failure",
  "RB-INGRESS-FAILURE": "ingress-failure",
  "RB-DESKTOP-HOST-BRIDGE": "desktop-host-bridge-failure",
  "RB-APPROVAL-QUEUE-JAM": "approval-queue-jam",
  "RB-SETUP-CHECKPOINT-CORRUPTION": "setup-checkpoint-corruption",
};

export function getRunbookEntry(runbookId: string): RunbookEntry | null {
  return RUNBOOK_REGISTRY.find((r) => r.runbookId === runbookId) ?? null;
}

export function loadRunbookMarkdown(runbookId: string): string | null {
  const slug = FILENAME_BY_RUNBOOK_ID[runbookId];
  if (!slug) return null;
  // Try the explicit slug first
  const candidates = [
    `/docs/runbooks/${slug}.md`,
    `../../../docs/runbooks/${slug}.md`,
  ];
  for (const key of Object.keys(MARKDOWN_MODULES)) {
    if (candidates.some((c) => key.endsWith(slug + ".md"))) {
      return MARKDOWN_MODULES[key];
    }
  }
  // Fallback: find by filename containing slug
  const match = Object.entries(MARKDOWN_MODULES).find(([k]) => k.endsWith(`/${slug}.md`));
  return match ? match[1] : null;
}

export function listAvailableRunbooks(): Array<{ runbookId: string; title: string; severity: string; hasMarkdown: boolean }> {
  return RUNBOOK_REGISTRY.map((r) => ({
    runbookId: r.runbookId,
    title: r.title,
    severity: r.severity,
    hasMarkdown: loadRunbookMarkdown(r.runbookId) !== null,
  }));
}
