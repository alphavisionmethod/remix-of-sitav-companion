#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Outbound Communication Policy Check
// No raw fetch/HTTP in domain code — must go through connectors
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "./lib/utils";

const vc = new ViolationCollector();

const FORBIDDEN_PATTERNS = [
  { pattern: /\bfetch\s*\(/g, name: "raw-fetch", detail: "Direct fetch() call — use connector service" },
  { pattern: /new\s+XMLHttpRequest/g, name: "xhr", detail: "Direct XMLHttpRequest — use connector service" },
  { pattern: /axios\s*\.\s*(get|post|put|delete|patch)\s*\(/g, name: "raw-axios", detail: "Direct axios call — use connector service" },
  { pattern: /\bhttp\s*\.\s*(get|post|put|delete)\s*\(/g, name: "raw-http", detail: "Direct http call — use connector service" },
];

// Only check domain service code, not connectors or infrastructure
const DOMAIN_DIRS = [
  "src/lib/services/business",
  "src/lib/services/finance",
  "src/lib/services/concierge",
  "src/lib/services/advisor",
  "src/lib/services/workflow",
  "src/lib/engines",
];

const EXEMPT_PATTERNS = [
  /supabase/i,
  /\.from\(/,
  /\.rpc\(/,
  /connector/i,
  /proxy/i,
];

for (const dir of DOMAIN_DIRS) {
  const files = scanDir(dir, [".ts", ".tsx"]);
  for (const file of files) {
    if (file.includes(".test.") || file.includes(".spec.")) continue;
    const content = readFileContent(file);
    const lines = content.split("\n");

    for (const { pattern, name, detail } of FORBIDDEN_PATTERNS) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = content.substring(0, match.index).split("\n").length;
        const line = lines[lineNum - 1]?.trim() || "";
        // Skip if line matches exempt pattern
        if (EXEMPT_PATTERNS.some(p => p.test(line))) continue;
        vc.add(file, name, `${detail} (line ${lineNum})`, "warning");
      }
    }
  }
}

vc.report("check-outbound-communication-policy");
vc.exitIfErrors();
