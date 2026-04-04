#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Markdown Conformance Report Generator
// Scans all markdown files, validates structure, outputs report
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { scanDir, readFileContent, writeJsonOutput, envelope } from "../architecture/lib/utils";

interface MarkdownIssue {
  file: string;
  line: number;
  rule: string;
  detail: string;
  severity: "error" | "warning";
}

const issues: MarkdownIssue[] = [];
const MD_DIRS = ["docs", "security", "generated"];
const allMdFiles: string[] = [];

for (const dir of MD_DIRS) {
  allMdFiles.push(...scanDir(dir, [".md"]));
}

// Also check root markdown files
const rootMds = fs.readdirSync(".").filter(f => f.endsWith(".md"));
allMdFiles.push(...rootMds);

for (const file of allMdFiles) {
  const content = readFileContent(file);
  if (!content) continue;
  const lines = content.split("\n");

  // Check: single H1
  const h1Lines = lines.filter(l => /^#\s/.test(l));
  if (h1Lines.length === 0) {
    issues.push({ file, line: 1, rule: "no-h1", detail: "No H1 heading found", severity: "warning" });
  } else if (h1Lines.length > 1) {
    issues.push({ file, line: 1, rule: "multiple-h1", detail: `${h1Lines.length} H1 headings found`, severity: "warning" });
  }

  // Check: heading hierarchy (no skipping levels)
  let lastLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const headingMatch = lines[i].match(/^(#{1,6})\s/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      if (lastLevel > 0 && level > lastLevel + 1) {
        issues.push({ file, line: i + 1, rule: "heading-skip", detail: `Heading level jumped from H${lastLevel} to H${level}`, severity: "warning" });
      }
      lastLevel = level;
    }
  }

  // Check: no trailing whitespace on non-empty lines
  for (let i = 0; i < Math.min(lines.length, 500); i++) {
    if (lines[i].length > 0 && lines[i] !== lines[i].trimEnd() && !lines[i].includes("  \n")) {
      issues.push({ file, line: i + 1, rule: "trailing-whitespace", detail: "Trailing whitespace", severity: "warning" });
      break; // Only report first occurrence per file
    }
  }
}

const report = envelope("1.0.0", {
  summary: {
    totalFiles: allMdFiles.length,
    totalIssues: issues.length,
    errors: issues.filter(i => i.severity === "error").length,
    warnings: issues.filter(i => i.severity === "warning").length,
  },
  issues,
});

writeJsonOutput("generated/markdown-conformance-report.json", report);

// Also generate markdown report
const mdReport = `# Markdown Conformance Report

Generated: ${new Date().toISOString()}

## Summary

- **Files scanned**: ${allMdFiles.length}
- **Issues found**: ${issues.length}
- **Errors**: ${report.summary.errors}
- **Warnings**: ${report.summary.warnings}

## Issues

${issues.slice(0, 50).map(i => `- **${i.rule}** in \`${i.file}\` (line ${i.line}): ${i.detail}`).join("\n")}
${issues.length > 50 ? `\n... and ${issues.length - 50} more` : ""}
`;

fs.writeFileSync("generated/markdown-conformance-report.md", mdReport);
console.log(`✅ Markdown conformance: ${allMdFiles.length} files, ${issues.length} issues`);
