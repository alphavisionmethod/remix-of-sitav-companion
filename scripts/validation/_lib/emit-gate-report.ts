// Shared gate report emitter for claim-safety validators.
// Writes generated/<gate>-report.json in the GateReport shape consumed by
// scripts/architecture/checks/check-os-release-readiness.ts.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface GateIssue {
  severity: "error" | "warning";
  area: string;
  message: string;
}

export interface EmitGateReportInput {
  gate: string;
  ok: boolean;
  issues?: GateIssue[];
  extra?: Record<string, unknown>;
}

export function emitGateReport(input: EmitGateReportInput): string {
  const { gate, ok, issues = [], extra = {} } = input;
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const report = {
    generatedAt: new Date().toISOString(),
    gate,
    ok,
    errorCount,
    warningCount,
    issues,
    ...extra,
  };
  const dir = "generated";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${gate}-report.json`);
  writeFileSync(file, JSON.stringify(report, null, 2));
  return file;
}
