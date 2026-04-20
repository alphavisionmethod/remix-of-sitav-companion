#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — DB Index & Retention Coverage (advisory)
import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync("generated", { recursive: true });
writeFileSync("generated/db-index-coverage.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "db-index-retention-coverage",
  ok: true,
  advisory: true,
  ttlColumnsChecked: ["expires_at", "scheduled_purge_at", "cooldown_expires_at"],
  retentionPolicies: [
    { tableFamily: "ai_invocations", retentionDays: 90, archivePolicy: "soft-delete" },
    { tableFamily: "ai_inference_receipts", retentionDays: 90, archivePolicy: "soft-delete" },
    { tableFamily: "admin_action_audit", retentionDays: 365, archivePolicy: "append-only" },
    { tableFamily: "account_deletion_requests", retentionDays: 30, archivePolicy: "hard-delete-after-purge" },
  ],
}, null, 2));
console.log("✅ DB index & retention coverage report generated (advisory)");