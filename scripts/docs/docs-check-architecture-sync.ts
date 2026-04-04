#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Documentation Architecture Sync Check
// Validates docs/architecture/ are in sync with source code
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, scanDir, readFileContent, loadServiceManifest } from "../architecture/lib/utils";

const vc = new ViolationCollector();
const DOCS_DIR = "docs/architecture";

if (!fs.existsSync(DOCS_DIR)) {
  console.log("⚠️ No docs/architecture directory found — skipping");
  process.exit(0);
}

const docFiles = scanDir(DOCS_DIR, [".md"]);
const manifest = loadServiceManifest();
const serviceIds = new Set((manifest?.services || []).map((s: any) => s.id || s.name));

// Check for stale service references in docs
for (const doc of docFiles) {
  const content = readFileContent(doc);
  const serviceRefs = content.match(/`([a-z][\w-]*-service)`/g);
  if (serviceRefs) {
    for (const ref of serviceRefs) {
      const svcName = ref.replace(/`/g, "").replace("-service", "");
      if (serviceIds.size > 0 && !serviceIds.has(svcName) && !serviceIds.has(svcName + "-service")) {
        vc.add(doc, "stale-reference", `References unknown service: ${ref}`, "warning");
      }
    }
  }
}

// Check for broken internal links
for (const doc of docFiles) {
  const content = readFileContent(doc);
  const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
  if (links) {
    for (const link of links) {
      const href = link.match(/\(([^)]+)\)/)?.[1];
      if (href && !href.startsWith("http") && !href.startsWith("#")) {
        const resolved = path.resolve(path.dirname(doc), href);
        if (!fs.existsSync(resolved)) {
          vc.add(doc, "broken-link", `Broken link: ${href}`, "warning");
        }
      }
    }
  }
}

console.log(`  📄 ${docFiles.length} architecture docs checked`);
vc.report("docs-check-architecture-sync");
vc.exitIfErrors();
