#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — HTML Trace Report Generator
//
// Reads JSON trace output from generated/ and produces a styled
// HTML report highlighting broken traces with direct links to
// UI source files/lines and edge function code.
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { readJsonSafe } from "../lib/utils";

const GENERATED_DIR = "generated";
const OUT_PATH = join(GENERATED_DIR, "trace-report.html");

// ── Gather all JSON reports ────────────────────────────────────

interface TraceSource {
  file: string;
  report: any;
}

const REPORT_FILES = [
  "edge-function-rls-auth-extraction.json",
  "ui-action-coverage-report.json",
  "edge-function-alerting-rules.json",
  "env-config-validation-report.json",
  "edge-function-mutation-traceability.json",
];

const reports: TraceSource[] = [];
for (const rf of REPORT_FILES) {
  const fullPath = join(GENERATED_DIR, rf);
  if (existsSync(fullPath)) {
    reports.push({ file: rf, report: readJsonSafe(fullPath) });
  }
}

// Also gather any trace-output files
const TRACE_DIR = join(GENERATED_DIR, "trace-output");
if (existsSync(TRACE_DIR)) {
  for (const f of readdirSync(TRACE_DIR).filter(f => f.endsWith(".json"))) {
    reports.push({ file: `trace-output/${f}`, report: readJsonSafe(join(TRACE_DIR, f)) });
  }
}

// ── Build HTML ─────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fileLink(file: string, line?: number): string {
  const display = line ? `${file}:${line}` : file;
  return `<span class="file-link" title="${escapeHtml(file)}">${escapeHtml(display)}</span>`;
}

function severityBadge(sev: string): string {
  const cls = sev === "error" ? "badge-error" : sev === "warning" ? "badge-warn" : "badge-info";
  return `<span class="badge ${cls}">${escapeHtml(sev)}</span>`;
}

function renderAuthExtractionSection(report: any): string {
  if (!report?.traces) return "";
  const broken = report.traces.filter((t: any) => t.issues?.length > 0);
  const ok = report.traces.filter((t: any) => !t.issues?.length);

  let html = `<section class="report-section">
    <h2>🔐 Edge Function Auth/RLS Extraction</h2>
    <div class="summary-bar">
      <span class="stat">${report.totalFunctions} functions</span>
      <span class="stat">${report.functionsWithIssues} with issues</span>
      <span class="stat">${report.errorCount} errors</span>
      <span class="stat">${report.warningCount} warnings</span>
    </div>`;

  if (broken.length > 0) {
    html += `<h3>❌ Broken Traces (${broken.length})</h3><table>
      <tr><th>Function</th><th>Declared Auth</th><th>Detected</th><th>DB Writes</th><th>Issues</th></tr>`;
    for (const t of broken) {
      html += `<tr class="row-error">
        <td>${fileLink(t.filePath)}</td>
        <td>${escapeHtml(t.declaredAuth ?? "none")}${t.declaredAdminOnly ? " 🛡️admin" : ""}</td>
        <td>${t.detectedPatterns.map(escapeHtml).join(", ") || "—"}</td>
        <td>${t.dbWrites.map(escapeHtml).join(", ") || "—"}</td>
        <td>${t.issues.map((i: string) => `<div class="issue">${escapeHtml(i)}</div>`).join("")}</td>
      </tr>`;
    }
    html += "</table>";
  }

  if (ok.length > 0) {
    html += `<details><summary>✅ Passing (${ok.length})</summary><table>
      <tr><th>Function</th><th>Auth</th><th>Patterns</th><th>DB Writes</th></tr>`;
    for (const t of ok) {
      html += `<tr>
        <td>${fileLink(t.filePath)}</td>
        <td>${escapeHtml(t.declaredAuth ?? "none")}</td>
        <td>${t.detectedPatterns.map(escapeHtml).join(", ") || "—"}</td>
        <td>${t.dbWrites.map(escapeHtml).join(", ") || "—"}</td>
      </tr>`;
    }
    html += "</table></details>";
  }

  html += "</section>";
  return html;
}

function renderUiCoverageSection(report: any): string {
  if (!report?.entries) return "";
  const uncovered = report.entries.filter((e: any) => !e.covered);
  const covered = report.entries.filter((e: any) => e.covered);

  let html = `<section class="report-section">
    <h2>📊 UI-Action Backend Coverage</h2>
    <div class="summary-bar">
      <span class="stat">${report.totalUiBackendCalls} total calls</span>
      <span class="stat">${report.uniqueTargets} unique targets</span>
      <span class="stat">${report.coveragePct}% covered</span>
    </div>`;

  if (uncovered.length > 0) {
    html += `<h3>⚠️ Uncovered in CI (${uncovered.length})</h3><table>
      <tr><th>Target</th><th>Type</th><th>UI Sources</th></tr>`;
    for (const e of uncovered) {
      const sources = e.uiSources.map((s: any) => fileLink(s.file, s.line)).join("<br>");
      html += `<tr class="row-warn">
        <td><strong>${escapeHtml(e.target)}</strong></td>
        <td>${escapeHtml(e.callType)}</td>
        <td>${sources}</td>
      </tr>`;
    }
    html += "</table>";
  }

  if (covered.length > 0) {
    html += `<details><summary>✅ Covered (${covered.length})</summary><table>
      <tr><th>Target</th><th>Type</th><th>CI Count</th><th>UI Sources</th></tr>`;
    for (const e of covered) {
      const sources = e.uiSources.slice(0, 3).map((s: any) => fileLink(s.file, s.line)).join("<br>");
      html += `<tr>
        <td>${escapeHtml(e.target)}</td>
        <td>${escapeHtml(e.callType)}</td>
        <td>${e.ciInvocationCount}</td>
        <td>${sources}${e.uiSources.length > 3 ? `<br><em>+${e.uiSources.length - 3} more</em>` : ""}</td>
      </tr>`;
    }
    html += "</table></details>";
  }

  html += "</section>";
  return html;
}

function renderGenericSection(file: string, report: any): string {
  if (!report) return "";
  const isOk = report.ok !== false;
  const icon = isOk ? "✅" : "❌";
  let html = `<section class="report-section">
    <h2>${icon} ${escapeHtml(report.gate ?? file)}</h2>
    <div class="summary-bar">
      <span class="stat">Status: ${isOk ? "PASS" : "FAIL"}</span>
      ${report.errorCount != null ? `<span class="stat">${report.errorCount} errors</span>` : ""}
      ${report.warningCount != null ? `<span class="stat">${report.warningCount} warnings</span>` : ""}
    </div>`;

  // Render issues/violations if present
  const issues = report.issues ?? report.violations ?? report.errors ?? [];
  if (Array.isArray(issues) && issues.length > 0) {
    html += `<table><tr><th>Item</th><th>Severity</th><th>Detail</th></tr>`;
    for (const issue of issues.slice(0, 50)) {
      const sev = issue.severity ?? issue.level ?? "warning";
      html += `<tr class="${sev === "error" ? "row-error" : "row-warn"}">
        <td>${fileLink(issue.fn ?? issue.file ?? issue.rule ?? "—")}</td>
        <td>${severityBadge(sev)}</td>
        <td>${escapeHtml(issue.message ?? issue.detail ?? JSON.stringify(issue))}</td>
      </tr>`;
    }
    html += "</table>";
  }

  html += "</section>";
  return html;
}

// ── Assemble full HTML ─────────────────────────────────────────

const now = new Date().toISOString();
const totalErrors = reports.reduce((sum, r) => sum + (r.report?.errorCount ?? 0), 0);
const totalWarnings = reports.reduce((sum, r) => sum + (r.report?.warningCount ?? 0), 0);
const allOk = reports.every(r => r.report?.ok !== false);

let sectionsHtml = "";
for (const r of reports) {
  if (r.file === "edge-function-rls-auth-extraction.json") {
    sectionsHtml += renderAuthExtractionSection(r.report);
  } else if (r.file === "ui-action-coverage-report.json") {
    sectionsHtml += renderUiCoverageSection(r.report);
  } else {
    sectionsHtml += renderGenericSection(r.file, r.report);
  }
}

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SITA OS — Trace Report</title>
  <style>
    :root { --bg: #0f1117; --surface: #1a1d27; --border: #2a2d3a; --text: #e4e4e7; --muted: #71717a;
      --red: #ef4444; --amber: #f59e0b; --green: #22c55e; --blue: #3b82f6; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text);
      line-height: 1.6; padding: 2rem; max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    h3 { font-size: 1rem; margin: 1rem 0 0.5rem; color: var(--muted); }
    .header { margin-bottom: 2rem; }
    .header-meta { color: var(--muted); font-size: 0.85rem; }
    .header-status { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 600;
      font-size: 0.9rem; margin-top: 0.5rem; }
    .header-status.pass { background: rgba(34,197,94,0.15); color: var(--green); }
    .header-status.fail { background: rgba(239,68,68,0.15); color: var(--red); }
    .report-section { background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
      padding: 1.5rem; margin-bottom: 1.5rem; }
    .summary-bar { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .stat { background: rgba(59,130,246,0.1); color: var(--blue); padding: 0.25rem 0.75rem;
      border-radius: 6px; font-size: 0.85rem; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; font-size: 0.85rem; }
    th { text-align: left; padding: 0.5rem; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border);
      color: var(--muted); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    td { padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: top; }
    tr.row-error { background: rgba(239,68,68,0.05); }
    tr.row-warn { background: rgba(245,158,11,0.05); }
    .badge { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge-error { background: rgba(239,68,68,0.15); color: var(--red); }
    .badge-warn { background: rgba(245,158,11,0.15); color: var(--amber); }
    .badge-info { background: rgba(59,130,246,0.15); color: var(--blue); }
    .file-link { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--blue);
      cursor: pointer; text-decoration: underline; text-decoration-style: dotted; }
    .issue { margin: 0.25rem 0; padding: 0.25rem 0.5rem; background: rgba(239,68,68,0.08);
      border-left: 3px solid var(--red); border-radius: 0 4px 4px 0; font-size: 0.8rem; }
    details { margin-top: 1rem; }
    summary { cursor: pointer; color: var(--muted); font-weight: 500; padding: 0.5rem 0; }
    summary:hover { color: var(--text); }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 SITA OS Trace Report</h1>
    <div class="header-meta">Generated: ${now} · ${reports.length} report sources</div>
    <div class="header-status ${allOk ? "pass" : "fail"}">${allOk ? "ALL GATES PASS" : "ISSUES DETECTED"} · ${totalErrors} errors · ${totalWarnings} warnings</div>
  </div>
  ${sectionsHtml}
</body>
</html>`;

mkdirSync(GENERATED_DIR, { recursive: true });
writeFileSync(OUT_PATH, fullHtml);
console.log(`📄 HTML trace report written to ${OUT_PATH}`);