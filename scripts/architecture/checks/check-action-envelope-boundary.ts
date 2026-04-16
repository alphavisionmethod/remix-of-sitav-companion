#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — ActionEnvelope Boundary Check
// Ensures no raw execution parameters bypass the ActionEnvelope.
// Part of the kernel's constitutional enforcement.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface Violation {
  file: string;
  rule: string;
  detail: string;
  line?: number;
}

const violations: Violation[] = [];

function scanDir(dir: string, extensions: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes("node_modules") && !entry.name.includes("__tests__")) {
      files.push(...scanDir(full, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(process.cwd(), filePath);
  const lines = content.split("\n");

  // Rule 1: Contracts must have zero runtime imports
  if (relPath.includes("packages/contracts/")) {
    const runtimeImports = [
      /from\s+["']@\/lib\/core-services/,
      /from\s+["']@\/lib\/persistence/,
      /from\s+["']@\/integrations/,
      /from\s+["']react/,
      /from\s+["']@supabase/,
    ];
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of runtimeImports) {
        if (pattern.test(lines[i])) {
          violations.push({
            file: relPath,
            rule: "CONTRACT_RUNTIME_IMPORT",
            detail: `Contract file imports runtime dependency: ${lines[i].trim()}`,
            line: i + 1,
          });
        }
      }
    }
  }

  // Rule 2: No direct LLM/model calls outside ai-gateway
  if (!relPath.includes("ai-gateway") && !relPath.includes("edge-functions") && !relPath.includes("supabase/functions")) {
    const llmPatterns = [
      /openai\.chat\.completions\.create/,
      /anthropic\.messages\.create/,
      /new\s+OpenAI\(/,
    ];
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of llmPatterns) {
        if (pattern.test(lines[i])) {
          violations.push({
            file: relPath,
            rule: "DIRECT_LLM_CALL",
            detail: `Direct LLM call outside ai-gateway boundary: ${lines[i].trim()}`,
            line: i + 1,
          });
        }
      }
    }
  }

  // Rule 3: No circular imports between kernel layers
  if (relPath.includes("packages/contracts/kernel/")) {
    const forbiddenImports = [
      /from\s+["']@\/lib\//,
      /from\s+["']@\/services\//,
      /from\s+["']@\/hooks\//,
      /from\s+["']@\/pages\//,
    ];
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of forbiddenImports) {
        if (pattern.test(lines[i])) {
          violations.push({
            file: relPath,
            rule: "KERNEL_CONTRACT_BOUNDARY",
            detail: `Kernel contract imports from runtime layer: ${lines[i].trim()}`,
            line: i + 1,
          });
        }
      }
    }
  }
}

// Run
const srcFiles = scanDir("src", [".ts", ".tsx"]);
for (const f of srcFiles) {
  checkFile(f);
}

if (violations.length === 0) {
  console.log("✅ ActionEnvelope boundary check passed — no violations found");
  process.exit(0);
} else {
  console.error(`❌ ${violations.length} boundary violation(s) found:\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}${v.line ? `:${v.line}` : ""}`);
    console.error(`    → ${v.detail}\n`);
  }
  process.exit(1);
}
