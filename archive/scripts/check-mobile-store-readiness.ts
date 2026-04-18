/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Gate: Mobile Store Readiness (Phase 12)
// Fails if any iOS / Android checklist item is `missing`, or if a
// `partial` item lacks a written remediation note.
// ═══════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync } from "node:fs";
import {
  IOS_APP_STORE_READINESS,
  ANDROID_PLAY_STORE_READINESS,
} from "../../../src/lib/mobile-platform/release";

interface Issue {
  surface: "ios" | "android";
  itemId: string;
  severity: "error" | "warning";
  message: string;
}

const issues: Issue[] = [];

function audit(surface: "ios" | "android", items: ReadonlyArray<{ id: string; status: string; remediation?: string; blocker: boolean; title: string }>) {
  for (const it of items) {
    if (it.status === "missing") {
      issues.push({ surface, itemId: it.id, severity: "error", message: `MISSING — ${it.title}` });
    }
    if (it.status === "partial" && !it.remediation) {
      issues.push({ surface, itemId: it.id, severity: "error", message: `PARTIAL with no remediation — ${it.title}` });
    }
    if (it.status === "deferred" && !it.remediation) {
      issues.push({ surface, itemId: it.id, severity: "warning", message: `DEFERRED with no remediation — ${it.title}` });
    }
    if (it.blocker && it.status !== "ready") {
      issues.push({ surface, itemId: it.id, severity: "error", message: `BLOCKER unresolved — ${it.title}` });
    }
  }
}

audit("ios", IOS_APP_STORE_READINESS);
audit("android", ANDROID_PLAY_STORE_READINESS);

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;

const summary = (items: ReadonlyArray<{ status: string }>) => {
  const c = { ready: 0, partial: 0, deferred: 0, missing: 0 } as Record<string, number>;
  for (const it of items) c[it.status] = (c[it.status] ?? 0) + 1;
  return c;
};

const report = {
  generatedAt: new Date().toISOString(),
  ok: errorCount === 0,
  errorCount,
  warningCount,
  ios: { total: IOS_APP_STORE_READINESS.length, ...summary(IOS_APP_STORE_READINESS) },
  android: { total: ANDROID_PLAY_STORE_READINESS.length, ...summary(ANDROID_PLAY_STORE_READINESS) },
  issues,
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/mobile-store-readiness-report.json", JSON.stringify(report, null, 2));

console.log(`Mobile store readiness: ${report.ok ? "OK" : "FAIL"} — ${errorCount} errors, ${warningCount} warnings`);
console.log(`  iOS: ${JSON.stringify(report.ios)}`);
console.log(`  Android: ${JSON.stringify(report.android)}`);

if (!report.ok) process.exitCode = 1;
