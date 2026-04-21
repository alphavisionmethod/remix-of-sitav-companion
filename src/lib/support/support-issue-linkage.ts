// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Issue Linkage
// Deterministic issue→runbook linkage using runbook-resolver.
// ═══════════════════════════════════════════════════════════════

import {
  resolveRunbookForAlert,
  resolveRunbooksForIncident,
} from "./runbook-resolver";
import { RUNBOOK_SUBSYSTEM_REQUIREMENTS } from "./runbook-subsystem-map";
import type { RunbookSubsystem } from "./runbook-types";

export interface IssueLinkageResult {
  readonly issueClassification: string;
  readonly subsystem: RunbookSubsystem | null;
  readonly linkedRunbookIds: readonly string[];
  readonly escalationPath: string;
  readonly diagnosticsPackTypes: readonly string[];
}

/**
 * Given an issue classification string (e.g. "auth:mfa-failure"),
 * resolve linked runbooks and escalation path deterministically.
 */
export function linkIssueToRunbooks(
  classification: string,
  affectedServices: string[] = [],
  severity: "low" | "medium" | "high" | "critical" = "medium",
): IssueLinkageResult {
  // Try alert-based resolution first
  const alertResult = resolveRunbookForAlert({
    alertSource: classification.split(":")[0] ?? classification,
    affectedServices,
    severity,
  });

  // Try incident-based resolution
  const incidentResults = resolveRunbooksForIncident({
    affectedServices,
    severity,
  });

  const linkedRunbookIds = [
    ...(alertResult ? [alertResult.runbookId] : []),
    ...incidentResults.map((r) => r.runbookId),
  ];
  const uniqueIds = [...new Set(linkedRunbookIds)];

  // Determine subsystem from classification prefix
  const prefix = classification.split(":")[0] ?? "";
  const subsystemMatch = RUNBOOK_SUBSYSTEM_REQUIREMENTS.find(
    (r) => r.subsystem === prefix || r.displayName.toLowerCase().includes(prefix.toLowerCase()),
  );

  const diagnosticsPackTypes: string[] = ["environment-fingerprint"];
  if (subsystemMatch?.criticalIncidentClass) diagnosticsPackTypes.push("runtime-crash");
  if (prefix === "connectors" || prefix === "sync") diagnosticsPackTypes.push("integration-health");

  return {
    issueClassification: classification,
    subsystem: (subsystemMatch?.subsystem as RunbookSubsystem) ?? null,
    linkedRunbookIds: uniqueIds,
    escalationPath: alertResult?.escalationTarget ?? "platform",
    diagnosticsPackTypes,
  };
}