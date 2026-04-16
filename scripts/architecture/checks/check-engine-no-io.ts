#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Engine No-IO Check
// Ensures engines in src/lib/engines/ don't import from
// @/integrations/supabase or perform direct network calls
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const files = scanDir("src/lib/engines", [".ts"]);

for (const file of files) {
  if (file.endsWith("index.ts")) continue;
  const content = readFileContent(file);

  if (/from\s+["']@\/integrations\/supabase/.test(content)) {
    vc.add(file, "engine-imports-supabase", "Engines must not import from @/integrations/supabase (use services layer)", "error");
  }
  if (/\bfetch\s*\(/.test(content) && !/\/\/.*fetch/.test(content)) {
    vc.add(file, "engine-uses-fetch", "Engines must not call fetch() directly (use services layer)", "warning");
  }
  if (/from\s+["']@\/pages\//.test(content) || /from\s+["']@\/components\//.test(content)) {
    vc.add(file, "engine-imports-ui", "Engines must not import UI components", "error");
  }
}

vc.report("check-engine-no-io");
vc.exitIfErrors();
