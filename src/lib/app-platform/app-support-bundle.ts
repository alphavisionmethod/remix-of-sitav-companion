// ═══════════════════════════════════════════════════════════════
// SITA OS — App Support Bundle Generator
// Collects redacted diagnostic data for support/operator review.
// ═══════════════════════════════════════════════════════════════

import { exportDiagnostics, type AppDiagnostics } from "./app-observability";
import { appInstallRegistry, type InstallRecord } from "./app-install-registry";
import { exportAudit } from "./app-permission-ledger";
import { appLifecycleManager } from "./app-lifecycle-manager";
import { listPendingRecoveries } from "./app-recovery-manager";

export interface AppSupportBundle {
  bundleVersion: "1.0";
  generatedAt: string;
  appId: string;
  diagnostics: AppDiagnostics;
  redactedFields: string[];
}

export interface SystemSupportBundle {
  bundleVersion: "1.0";
  generatedAt: string;
  totalApps: number;
  appSummaries: Array<{
    appId: string;
    name: string;
    installStatus: string;
    trustLevel: string;
    crashCount: number;
    hasRecoveryOffer: boolean;
  }>;
  pendingRecoveries: number;
  permissionAudit: {
    totalGrants: number;
    totalDenials: number;
    totalRevocations: number;
  };
  totalLifecycleReceipts: number;
}

const REDACT_KEYS = ["token", "secret", "password", "key", "authorization", "cookie"];

function redactRecord(record: Record<string, unknown>): { data: Record<string, unknown>; redacted: string[] } {
  const redacted: string[] = [];
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    if (typeof v === "string" && REDACT_KEYS.some(r => k.toLowerCase().includes(r))) {
      data[k] = "[REDACTED]";
      redacted.push(k);
    } else {
      data[k] = v;
    }
  }
  return { data, redacted };
}

/** Generate a support bundle for a single app. */
export function generateBundle(appId: string, record: InstallRecord | null): AppSupportBundle {
  const diagnostics = exportDiagnostics(appId, record);
  const { redacted } = record
    ? redactRecord(record as unknown as Record<string, unknown>)
    : { redacted: [] };

  return {
    bundleVersion: "1.0",
    generatedAt: new Date().toISOString(),
    appId,
    diagnostics,
    redactedFields: redacted,
  };
}

/** Generate a system-wide support bundle for operators. */
export function generateSystemBundle(records: InstallRecord[]): SystemSupportBundle {
  const audit = exportAudit();
  const recoveries = listPendingRecoveries();
  const allReceipts = appLifecycleManager.getReceipts();

  return {
    bundleVersion: "1.0",
    generatedAt: new Date().toISOString(),
    totalApps: records.length,
    appSummaries: records.map(r => ({
      appId: r.appId,
      name: r.name,
      installStatus: r.installStatus,
      trustLevel: r.trustLevel,
      crashCount: r.recoveryOffer?.crashCount ?? 0,
      hasRecoveryOffer: !!r.recoveryOffer,
    })),
    pendingRecoveries: recoveries.length,
    permissionAudit: {
      totalGrants: audit.summary.totalGrants,
      totalDenials: audit.summary.totalDenials,
      totalRevocations: audit.summary.totalRevocations,
    },
    totalLifecycleReceipts: allReceipts.length,
  };
}