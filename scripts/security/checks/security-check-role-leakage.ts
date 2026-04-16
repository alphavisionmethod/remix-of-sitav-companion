#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Security: Role Leakage Check
// Scans for localStorage role checks, client-side admin gates
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";

const vc = new ViolationCollector();

const ROLE_LEAKAGE_PATTERNS = [
  { pattern: /localStorage\s*\.\s*getItem\s*\(\s*["'](?:role|isAdmin|user_role|admin)["']\s*\)/g, name: "localStorage-role", detail: "Role check via localStorage — use server-side validation" },
  { pattern: /sessionStorage\s*\.\s*getItem\s*\(\s*["'](?:role|isAdmin|user_role|admin)["']\s*\)/g, name: "sessionStorage-role", detail: "Role check via sessionStorage — use server-side validation" },
  { pattern: /(?:isAdmin|is_admin)\s*===?\s*(?:true|"true"|'true')/g, name: "client-admin-check", detail: "Client-side admin check — must use server-side RLS/function" },
  { pattern: /password\s*[:=]\s*["'][^"']{3,}["']/g, name: "hardcoded-credential", detail: "Possible hardcoded credential" },
  { pattern: /(?:api_key|apiKey|API_KEY)\s*[:=]\s*["']sk_[^"']+["']/g, name: "hardcoded-api-key", detail: "Hardcoded API key detected" },
];

const sourceFiles = scanDir("src", [".ts", ".tsx"]);

for (const file of sourceFiles) {
  if (file.includes("node_modules") || file.includes(".test.")) continue;
  const content = readFileContent(file);

  for (const { pattern, name, detail } of ROLE_LEAKAGE_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      vc.add(file, name, detail);
    }
  }
}

vc.report("security-check-role-leakage");
vc.exitIfErrors();
