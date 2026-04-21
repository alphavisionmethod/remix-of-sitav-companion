#!/usr/bin/env node
/* eslint-disable no-console */
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { COMMAND_SURFACE_MERGE_MAP } from "../../src/platform/experience/command-surface-merge-map";
import { NOTIFICATION_MERGE_MAP } from "../../src/platform/experience/notification-merge-map";
import { SETTINGS_MERGE_MAP } from "../../src/platform/experience/settings-merge-map";

const issues: GateIssue[] = [];

if (COMMAND_SURFACE_MERGE_MAP.length < 2) issues.push({ severity: "error", area: "command-surfaces", message: "Fewer than 2 command surfaces defined" });
if (NOTIFICATION_MERGE_MAP.length < 3) issues.push({ severity: "error", area: "notification-surfaces", message: "Fewer than 3 notification surfaces defined" });
if (SETTINGS_MERGE_MAP.length < 5) issues.push({ severity: "error", area: "settings-sections", message: "Fewer than 5 settings sections defined" });

// Verify shell-level notification center exists
const hasCenter = NOTIFICATION_MERGE_MAP.some(n => n.surfaceId === "notification-center");
if (!hasCenter) issues.push({ severity: "error", area: "notification-center", message: "No shell-level notification-center defined" });

// Verify global command palette exists
const hasGlobal = COMMAND_SURFACE_MERGE_MAP.some(c => c.surfaceId === "global-command-palette");
if (!hasGlobal) issues.push({ severity: "error", area: "command-palette", message: "No global command palette defined" });

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({ gate: "command-notification-settings-coherence", ok: errorCount === 0, issues, extra: {
  commandSurfaces: COMMAND_SURFACE_MERGE_MAP.length,
  notificationSurfaces: NOTIFICATION_MERGE_MAP.length,
  settingsSections: SETTINGS_MERGE_MAP.length,
}});
console.log(`Command/notification/settings coherence: ${COMMAND_SURFACE_MERGE_MAP.length}+${NOTIFICATION_MERGE_MAP.length}+${SETTINGS_MERGE_MAP.length} → ${file}`);