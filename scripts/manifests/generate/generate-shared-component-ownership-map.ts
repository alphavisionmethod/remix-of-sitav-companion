#!/usr/bin/env tsx
/**
 * ════════════════════════════════════════════════════════════════════════
 * SITA OS — Shared Component Ownership Map Generator (Wave 0.9)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Implements the 3-test concept rule from
 * `docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md`.
 *
 * Walks src/components/** (excluding ui/, __tests__/) and classifies each
 * file as one of:
 *   - shared-clean
 *   - pillar-semantic
 *   - platform-semantic
 *   - admin-semantic
 *   - shell-runtime-semantic
 *   - barrel-only-reexport
 *   - wrapper-with-platform-import
 *   - deprecated-shim
 *
 * Emits: generated/manifests/shared-component-ownership-map.json
 *
 * Constitution rules: 36, 37, 38.
 * ════════════════════════════════════════════════════════════════════════
 */
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const COMPONENTS_DIR = join(ROOT, "src", "components");
const OUT_PATH = join(ROOT, "generated", "manifests", "shared-component-ownership-map.json");

/** Subtrees excluded from concept-rule classification. */
const EXCLUDED_SUBTREES = new Set<string>(["ui", "__tests__"]);

/** Vocabulary buckets — case-insensitive, whole-word match. */
const PILLAR_TOKENS = [
  "business", "concierge", "finance", "health", "money", "revenue",
  "investment", "digital-presence",
];
const PLATFORM_TOKENS = [
  "sita", "advisor", "boardroom", "proof", "receipt", "governance",
  "trust", "observability", "release", "verification", "cloud", "oauth",
  "connector", "personal-brain", "intelligence", "mission", "atlas",
];
const ADMIN_TOKENS = [
  "admin", "operator", "founder", "engineering-ops", "killswitch",
  "kill-switch", "runbook",
];
const OPERATOR_PHRASES = [
  "signals fired", "release window", "approval queue", "runbook drill",
  "kill switch",
];
/** Shell-runtime singletons / hardcoded pillar enumerations. */
const SHELL_RUNTIME_HINTS = [
  "TRUST_LAYER", "AI_GATEWAY", "EVENT_BUS", "usePillarPriority",
  "PILLAR_ICON",
];

type Classification =
  | "shared-clean"
  | "pillar-semantic"
  | "platform-semantic"
  | "admin-semantic"
  | "shell-runtime-semantic"
  | "barrel-only-reexport"
  | "wrapper-with-platform-import"
  | "deprecated-shim";

interface FileReport {
  file: string;
  classification: Classification;
  targetOwner: string | null;
  vocabularyHits: string[];
  importViolations: string[];
  shellHints: string[];
  isBarrel: boolean;
  isDeprecatedShim: boolean;
  reason: string;
}

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    let s; try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) {
      // Skip excluded subtrees only at the top level under src/components/.
      const rel = relative(COMPONENTS_DIR, p);
      if (!rel.includes("/") && EXCLUDED_SUBTREES.has(rel)) continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(e)) {
      out.push(p);
    }
  }
  return out;
}

function logicalLines(src: string): string[] {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));
}

const RE_PURE_REEXPORT = /^export\s+(?:\*|\{[^}]*\}|default|type\s+\{[^}]*\})\s+from\s+["']([^"']+)["'];?$/;

function findImportTargets(src: string): string[] {
  const targets: string[] = [];
  const re = /(?:from\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\))/g;
  let m;
  while ((m = re.exec(src)) !== null) targets.push(m[1] || m[2]);
  return targets;
}

function matchVocabulary(src: string, tokens: string[]): string[] {
  const hits: string[] = [];
  for (const tok of tokens) {
    // Case-insensitive whole-word match. For multi-word phrases, just substring.
    const re = tok.includes(" ")
      ? new RegExp(tok.replace(/\s+/g, "\\s+"), "i")
      : new RegExp(`\\b${tok.replace(/-/g, "[-_]?")}\\b`, "i");
    if (re.test(src)) hits.push(tok);
  }
  return hits;
}

function targetForOwner(rel: string, hits: string[]): string {
  if (hits.includes("sita") || hits.includes("advisor") || hits.includes("boardroom")) {
    return "@/platform/sita/components/sita/";
  }
  if (hits.includes("trust")) return "@/platform/trust/components/trust/";
  if (hits.includes("cloud")) return "@/platform/cloud/components/cloud/";
  if (hits.includes("admin") || hits.includes("operator")) {
    return "@/admin/modules/<domain>/components/";
  }
  return "@/platform/<system>/components/";
}

function classifyFile(absPath: string): FileReport {
  const rel = relative(ROOT, absPath).replace(/\\/g, "/");
  const rawSrc = readFileSync(absPath, "utf-8");
  // Strip comments before vocabulary scanning so doc-comments don't generate false positives.
  // Keep imports for the import scan (run on rawSrc).
  let src = rawSrc
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(/\r?\n/)
    .map((l) => l.replace(/\/\/.*$/, ""))
    .join("\n");
  // Strip lucide-react icon import lists so icon names like `Cloud`, `Receipt`,
  // `Shield` don't trigger vocabulary matches.
  src = src.replace(/from\s+["']lucide-react["']/g, 'from "lucide-react"');
  src = src.replace(/import\s*\{[^}]*\}\s*from\s+["']lucide-react["']/g, "");
  // Strip tailwind utility prefixes attached to vocabulary (e.g. `bg-trust-safe`,
  // `text-trust-warn`, `border-trust-danger`) — these are design-system tokens,
  // not platform-trust semantics.
  const TW_PREFIXES = ["bg", "text", "border", "ring", "from", "to", "via", "fill", "stroke", "shadow", "outline", "decoration", "divide", "placeholder", "accent", "caret"];
  for (const p of TW_PREFIXES) {
    src = src.replace(new RegExp(`${p}-(?:trust|cloud|admin|operator|sita|advisor|boardroom|proof|receipt|governance|observability|release|verification|connector|atlas|mission|intelligence)(?:-[a-z]+)?`, "g"), "");
  }
  // Strip CSS custom-property references like `var(--trust-safe)` so design
  // tokens don't trigger vocabulary matches.
  src = src.replace(/var\(\s*--[a-z-]+\s*\)/g, "");
  src = src.replace(/--(?:trust|cloud|admin|operator|sita|advisor|boardroom|proof|receipt|governance|observability|release|verification|connector|atlas|mission|intelligence)(?:-[a-z]+)?/g, "");
  const lines = logicalLines(src);
  const imports = findImportTargets(rawSrc);

  const isBarrel = lines.length > 0 && lines.every((l) => RE_PURE_REEXPORT.test(l));
  const isDeprecatedShim = /DEPRECATED/i.test(rawSrc) && imports.some((i) => i.startsWith("@/platform/"));

  const importViolations = imports.filter((i) =>
    i.startsWith("@/modules/") ||
    i.startsWith("@/platform/") ||
    i.startsWith("@/admin/") ||
    i.startsWith("@/pages/")
  );

  const pillarHits   = matchVocabulary(src, PILLAR_TOKENS);
  const platformHits = matchVocabulary(src, PLATFORM_TOKENS);
  const adminHits    = matchVocabulary(src, ADMIN_TOKENS);
  const phraseHits   = matchVocabulary(src, OPERATOR_PHRASES);
  const vocabularyHits = [...pillarHits, ...platformHits, ...adminHits, ...phraseHits];

  const shellHints = SHELL_RUNTIME_HINTS.filter((h) => src.includes(h));

  // Classification priority order matters.
  if (isDeprecatedShim) {
    return {
      file: rel,
      classification: "deprecated-shim",
      targetOwner: imports.find((i) => i.startsWith("@/platform/")) ?? null,
      vocabularyHits, importViolations, shellHints, isBarrel, isDeprecatedShim,
      reason: "Self-marked DEPRECATED re-export shim — tracked in deprecated-shim baseline.",
    };
  }

  if (shellHints.length > 0 || /pillars\.map|PILLAR_ICON|\bbusiness:\s*\w+,\s*concierge:/m.test(src)) {
    return {
      file: rel,
      classification: "shell-runtime-semantic",
      targetOwner: "@/platform/sita/components/sita/shell/",
      vocabularyHits, importViolations, shellHints, isBarrel, isDeprecatedShim,
      reason: `Imports shell/runtime singletons (${shellHints.join(", ") || "hardcoded pillar enumeration"}).`,
    };
  }

  if (isBarrel && importViolations.length > 0) {
    const target = importViolations[0].split("/").slice(0, 4).join("/") + "/index.ts";
    return {
      file: rel,
      classification: "barrel-only-reexport",
      targetOwner: target,
      vocabularyHits, importViolations, shellHints, isBarrel, isDeprecatedShim,
      reason: `Pure barrel re-exporting from ${importViolations.length} platform/module path(s); should be a barrel under that owner.`,
    };
  }

  if (importViolations.length > 0 && !isBarrel) {
    return {
      file: rel,
      classification: "wrapper-with-platform-import",
      targetOwner: targetForOwner(rel, [...platformHits, ...adminHits]),
      vocabularyHits, importViolations, shellHints, isBarrel, isDeprecatedShim,
      reason: `Composes platform component(s): ${importViolations.join(", ")}.`,
    };
  }

  if (adminHits.length > 0 || phraseHits.length > 0) {
    return {
      file: rel, classification: "admin-semantic",
      targetOwner: "@/admin/modules/<domain>/components/",
      vocabularyHits, importViolations, shellHints, isBarrel, isDeprecatedShim,
      reason: `Admin/operator vocabulary: ${[...adminHits, ...phraseHits].join(", ")}.`,
    };
  }
  if (platformHits.length > 0) {
    return {
      file: rel, classification: "platform-semantic",
      targetOwner: targetForOwner(rel, platformHits),
      vocabularyHits, importViolations, shellHints, isBarrel, isDeprecatedShim,
      reason: `Platform vocabulary: ${platformHits.join(", ")}.`,
    };
  }
  if (pillarHits.length > 0) {
    return {
      file: rel, classification: "pillar-semantic",
      targetOwner: `@/modules/${pillarHits[0]}/components/`,
      vocabularyHits, importViolations, shellHints, isBarrel, isDeprecatedShim,
      reason: `Pillar vocabulary: ${pillarHits.join(", ")}.`,
    };
  }

  return {
    file: rel, classification: "shared-clean", targetOwner: null,
    vocabularyHits, importViolations, shellHints, isBarrel, isDeprecatedShim,
    reason: "Passes all three concept tests.",
  };
}

function main() {
  const files = walk(COMPONENTS_DIR);
  const reports = files.map(classifyFile).sort((a, b) => a.file.localeCompare(b.file));

  const summary = reports.reduce<Record<Classification, number>>((acc, r) => {
    acc[r.classification] = (acc[r.classification] ?? 0) + 1;
    return acc;
  }, {} as Record<Classification, number>);

  const violatorClasses: Classification[] = [
    "pillar-semantic", "platform-semantic", "admin-semantic",
    "shell-runtime-semantic", "barrel-only-reexport", "wrapper-with-platform-import",
  ];
  const violators = reports.filter((r) => violatorClasses.includes(r.classification));

  mkdirSync(join(ROOT, "generated", "manifests"), { recursive: true });
  const out = {
    generatedAt: new Date().toISOString(),
    rule: "Constitution Rules 36, 37, 38",
    model: "docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md",
    totals: {
      filesScanned: reports.length,
      sharedClean: summary["shared-clean"] ?? 0,
      deprecatedShim: summary["deprecated-shim"] ?? 0,
      violators: violators.length,
    },
    classificationBreakdown: summary,
    files: reports,
    violators: violators.map((v) => ({
      file: v.file, classification: v.classification, targetOwner: v.targetOwner, reason: v.reason,
    })),
  };
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`[shared-component-ownership-map] wrote ${OUT_PATH}`);
  console.log(`  files scanned: ${reports.length}`);
  console.log(`  shared-clean : ${summary["shared-clean"] ?? 0}`);
  console.log(`  violators    : ${violators.length}`);
  console.log(`  breakdown    : ${JSON.stringify(summary)}`);
}

main();