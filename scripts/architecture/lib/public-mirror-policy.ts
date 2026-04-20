// ═══════════════════════════════════════════════════════════════
// SITA OS — Public Artifact Mirror Policy
// Single source of truth declaring which evidence artifacts get
// mirrored into public/generated/artifacts/ for the in-app viewer.
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";

export type MirrorCategory = "audits" | "manifests" | "registry" | "reports" | "docs";

export interface MirrorRule {
  category: MirrorCategory;
  sourceDir: string;
  /** Recursively walk subdirectories. */
  recursive: boolean;
  /** Allowed file extensions (lowercase, with leading dot). */
  extensions: string[];
  /** Optional regex; if set, only matching basenames are mirrored. */
  basenamePattern?: RegExp;
}

export interface MirrorMatch {
  category: MirrorCategory;
  /** Absolute or repo-relative source path. */
  sourcePath: string;
  /** Path relative to public/generated/artifacts/ (e.g. "manifests/routes.json"). */
  mirroredRelPath: string;
}

// ── Denylist (always skipped, even if matched by a rule) ──────────
const DENY_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".cache",
  ".turbo",
  ".lovable",
]);

const DENY_BASENAMES = new Set([
  ".env",
  ".env.local",
  ".env.production",
  "package-lock.json",
  "bun.lockb",
  "bun.lock",
]);

const DENY_EXTENSIONS = new Set([".lock", ".key", ".pem", ".crt"]);

// ── Mirror rules ──────────────────────────────────────────────────
export const MIRROR_RULES: MirrorRule[] = [
  // Top-level master audits & remediation docs already partially mirrored
  {
    category: "audits",
    sourceDir: "public/generated",
    recursive: false,
    extensions: [".md"],
    basenamePattern:
      /^(MISSING_AUDIT|PROJECT_TREE_AUDIT|MASTER_REMEDIATION|MOBILE_DEPLOYMENT_VERIFICATION).*\.md$/i,
  },
  // Architecture audits (canonical narrative docs)
  {
    category: "audits",
    sourceDir: "docs/architecture",
    recursive: true,
    extensions: [".md"],
  },
  // Registry YAMLs / JSONs under docs/architecture
  {
    category: "registry",
    sourceDir: "docs/architecture",
    recursive: true,
    extensions: [".yaml", ".yml"],
  },
  // Generated JSON manifests (routes, services, capabilities, evidence-graph, etc.)
  {
    category: "manifests",
    sourceDir: "generated",
    recursive: false,
    extensions: [".json"],
  },
  // Generated markdown reports (audits, governance reports)
  {
    category: "reports",
    sourceDir: "generated",
    recursive: false,
    extensions: [".md"],
  },
  // Top-level governance docs
  {
    category: "docs",
    sourceDir: "docs",
    recursive: false,
    extensions: [".md"],
  },
];

// ── Walker ────────────────────────────────────────────────────────
function walk(dir: string, recursive: boolean): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (DENY_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) out.push(...walk(full, true));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function isDenied(file: string): boolean {
  const base = path.basename(file);
  if (DENY_BASENAMES.has(base)) return true;
  const ext = path.extname(base).toLowerCase();
  if (DENY_EXTENSIONS.has(ext)) return true;
  return false;
}

/**
 * Resolve all artifact paths matched by the mirror policy.
 * De-duplicates if multiple rules would map the same source file.
 */
export function resolveMirrorMatches(): MirrorMatch[] {
  const seen = new Set<string>();
  const results: MirrorMatch[] = [];

  for (const rule of MIRROR_RULES) {
    const files = walk(rule.sourceDir, rule.recursive);
    for (const file of files) {
      if (isDenied(file)) continue;
      const ext = path.extname(file).toLowerCase();
      if (!rule.extensions.includes(ext)) continue;
      const base = path.basename(file);
      if (rule.basenamePattern && !rule.basenamePattern.test(base)) continue;

      // Mirror path: <category>/<relative-path-under-sourceDir>
      const rel = path.relative(rule.sourceDir, file).split(path.sep).join("/");
      const mirroredRelPath = `${rule.category}/${rel}`;

      // Skip if already mirrored under another rule (first rule wins)
      if (seen.has(mirroredRelPath)) continue;
      seen.add(mirroredRelPath);

      results.push({
        category: rule.category,
        sourcePath: file,
        mirroredRelPath,
      });
    }
  }

  // Deterministic ordering
  results.sort((a, b) => a.mirroredRelPath.localeCompare(b.mirroredRelPath));
  return results;
}

/** Public mirror root inside the SPA static asset tree. */
export const PUBLIC_MIRROR_ROOT = "public/generated/artifacts";

/** Public artifact index file path. */
export const PUBLIC_INDEX_PATH = "public/generated/artifact-index.json";

/** Minimum mirrored artifact count required by the BLOCK gate. */
export const MIRROR_MIN_THRESHOLD = 50;
