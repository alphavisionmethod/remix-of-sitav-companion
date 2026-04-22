#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — PageShell Wrapping Codemod
// Scans standalone pages and wraps them in PageShell if missing.
// Usage: node scripts/design/codemod-pageshell.mjs [--dry-run]
// ═══════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = path.resolve(__dirname, "../../src/pages");
const DRY_RUN = process.argv.includes("--dry-run");

// Pages that are intentionally full-bleed (no shell)
const FULL_BLEED = new Set([
  "LandingPage", "NotFound", "MoneyOnboarding", "Boardroom",
  "DownloadPage", "DesktopPage", "Index", "FirstBootSetup",
  "OnboardingWrapper",
]);

// Shell patterns that indicate page is already wrapped
const SHELL_PATTERNS = [
  "PageShell", "DomainAppShell", "Navigate", "redirect",
  "CenterPageShell", "AdminControlPlaneShell", "MissionControlLayout",
  "SetupExperience", "WindowManager",
];

function getPageFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Skip admin, workspace, and domain directories (they have their own shells)
      if (["admin", "workspace"].includes(entry.name)) continue;
      results.push(...getPageFiles(path.join(dir, entry.name)));
    } else if (entry.name.endsWith(".tsx") && !entry.name.startsWith("_")) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

const pages = getPageFiles(PAGES_DIR);
let wrapped = 0;
let skipped = 0;

for (const filePath of pages) {
  const basename = path.basename(filePath, ".tsx");
  if (FULL_BLEED.has(basename)) { skipped++; continue; }

  let content = fs.readFileSync(filePath, "utf-8");
  if (SHELL_PATTERNS.some((p) => content.includes(p))) { skipped++; continue; }

  // Detect the outermost JSX wrapper pattern
  // Look for: return ( <div className="... or <motion.div ...
  const returnMatch = content.match(
    /return\s*\(\s*\n?\s*<(div|motion\.div)\s+className="([^"]*)"[^>]*>/
  );
  if (!returnMatch) { skipped++; continue; }

  const [fullMatch, tag, classes] = returnMatch;

  // Determine width from existing classes
  let width = "wide";
  if (classes.includes("max-w-3xl")) width = "narrow";
  else if (classes.includes("max-w-5xl")) width = "standard";
  else if (classes.includes("max-w-[1400px]") || classes.includes("max-w-[1600px]")) width = "full";

  // Preserve non-structural classes as className override
  const preserveClasses = classes
    .replace(/mx-auto|max-w-\S+|min-h-screen|bg-background|p-\d+|md:p-\d+|space-y-\d+/g, "")
    .trim();

  const extraSpacing = classes.match(/space-y-(\d+)/)?.[0];
  const classAttr = preserveClasses || extraSpacing
    ? ` className="${[extraSpacing, preserveClasses].filter(Boolean).join(" ").trim()}"`
    : "";

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would wrap: ${path.relative(PAGES_DIR, filePath)} (width="${width}")`);
    wrapped++;
    continue;
  }

  // Add import if not present
  if (!content.includes("PageShell")) {
    content = `import { PageShell } from "@/components/sita/PageShell";\n${content}`;
  }

  // Replace opening tag
  const newOpen = `<PageShell width="${width}"${classAttr}>`;
  content = content.replace(fullMatch, `return (\n    ${newOpen}`);

  // Replace closing tag (last occurrence of </div> or </motion.div>)
  const closeTag = tag === "div" ? "</div>" : "</motion.div>";
  const lastIdx = content.lastIndexOf(closeTag);
  if (lastIdx !== -1) {
    content = content.slice(0, lastIdx) + "</PageShell>" + content.slice(lastIdx + closeTag.length);
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Wrapped: ${path.relative(PAGES_DIR, filePath)} (width="${width}")`);
  wrapped++;
}

console.log(`\n📊 Summary: ${wrapped} wrapped, ${skipped} skipped (${pages.length} total scanned)`);
if (DRY_RUN) console.log("   (dry run — no files modified)");