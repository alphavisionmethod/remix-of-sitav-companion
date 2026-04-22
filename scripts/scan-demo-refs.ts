// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo-Mode Reference Scanner
// Scans src/pages/** for isDemoMode and DEMO_ references.
// Outputs JSON report + Markdown summary.
// Usage: npx tsx scripts/scan-demo-refs.ts
// ═══════════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";

interface FileReport {
  file: string;
  isDemoModeRefs: { line: number; text: string; kind: "usage" | "declaration" }[];
  demoConstRefs: { line: number; text: string; symbol: string; kind: "import" | "declaration" | "usage" }[];
  totalRefs: number;
}

interface ScanReport {
  timestamp: string;
  totalFiles: number;
  filesWithRefs: number;
  totalIsDemoMode: number;
  totalDemoConsts: number;
  files: FileReport[];
}

function walk(dir: string, ext: string[]): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full, ext));
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

function classifyDemoMode(line: string): "declaration" | "usage" {
  if (/const\s+isDemoMode\b/.test(line)) return "declaration";
  return "usage";
}

function classifyDemoConst(line: string): "import" | "declaration" | "usage" {
  if (/^\s*import\s/.test(line)) return "import";
  if (/^\s*const\s+DEMO_/.test(line)) return "declaration";
  return "usage";
}

function extractSymbol(line: string): string {
  const m = line.match(/\b(DEMO_\w+)\b/);
  return m?.[1] ?? "DEMO_*";
}

function scanFile(filePath: string): FileReport | null {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const report: FileReport = {
    file: filePath,
    isDemoModeRefs: [],
    demoConstRefs: [],
    totalRefs: 0,
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//")) return;

    if (/\bisDemoMode\b/.test(line)) {
      report.isDemoModeRefs.push({
        line: i + 1,
        text: trimmed.slice(0, 120),
        kind: classifyDemoMode(line),
      });
    }

    if (/\bDEMO_\w+\b/.test(line)) {
      report.demoConstRefs.push({
        line: i + 1,
        text: trimmed.slice(0, 120),
        symbol: extractSymbol(line),
        kind: classifyDemoConst(line),
      });
    }
  });

  report.totalRefs = report.isDemoModeRefs.length + report.demoConstRefs.length;
  return report.totalRefs > 0 ? report : null;
}

function generateMarkdown(report: ScanReport): string {
  const lines: string[] = [
    "# SITA OS — Demo Reference Scan Report",
    "",
    `**Generated:** ${report.timestamp}`,
    `**Total files scanned:** ${report.totalFiles}`,
    `**Files with references:** ${report.filesWithRefs}`,
    `**Total isDemoMode refs:** ${report.totalIsDemoMode}`,
    `**Total DEMO_ const refs:** ${report.totalDemoConsts}`,
    "",
    "---",
    "",
  ];

  for (const f of report.files) {
    lines.push(`## \`${f.file}\` (${f.totalRefs} refs)`);
    lines.push("");

    if (f.isDemoModeRefs.length > 0) {
      lines.push("### isDemoMode");
      lines.push("| Line | Kind | Code |");
      lines.push("|------|------|------|");
      for (const r of f.isDemoModeRefs) {
        lines.push(`| ${r.line} | ${r.kind} | \`${r.text.replace(/\|/g, "\\|")}\` |`);
      }
      lines.push("");
    }

    if (f.demoConstRefs.length > 0) {
      lines.push("### DEMO_ Constants");
      lines.push("| Line | Symbol | Kind | Code |");
      lines.push("|------|--------|------|------|");
      for (const r of f.demoConstRefs) {
        lines.push(`| ${r.line} | ${r.symbol} | ${r.kind} | \`${r.text.replace(/\|/g, "\\|")}\` |`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

// ── Main ──────────────────────────────────────────────────────
const pagesDir = path.resolve("src/pages");
const files = walk(pagesDir, [".tsx", ".ts"]);
const reports = files.map(scanFile).filter(Boolean) as FileReport[];

const scan: ScanReport = {
  timestamp: new Date().toISOString(),
  totalFiles: files.length,
  filesWithRefs: reports.length,
  totalIsDemoMode: reports.reduce((s, r) => s + r.isDemoModeRefs.length, 0),
  totalDemoConsts: reports.reduce((s, r) => s + r.demoConstRefs.length, 0),
  files: reports,
};

const outDir = path.resolve("reports");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "demo-refs.json"), JSON.stringify(scan, null, 2));
fs.writeFileSync(path.join(outDir, "demo-refs.md"), generateMarkdown(scan));

console.log(`✅ Scan complete`);
console.log(`   Files scanned:  ${scan.totalFiles}`);
console.log(`   Files with refs: ${scan.filesWithRefs}`);
console.log(`   isDemoMode refs: ${scan.totalIsDemoMode}`);
console.log(`   DEMO_ refs:      ${scan.totalDemoConsts}`);
console.log(`   Reports: reports/demo-refs.json, reports/demo-refs.md`);