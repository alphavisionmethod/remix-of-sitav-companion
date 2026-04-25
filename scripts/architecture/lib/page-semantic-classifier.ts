/**
 * SITA OS — Page Semantic Classifier (Wave 0.7)
 *
 * Shared classifier used by:
 *   - scripts/manifests/generate/generate-route-adapter-semantic-map.ts
 *   - scripts/architecture/check-page-semantic-adapter.ts
 *   - scripts/architecture/check-page-adapter-subtype-declaration.ts
 *
 * The classifier inspects the file body (no AST — regex-based; sufficient for
 * the six recognized subtypes) and returns:
 *   { subtype, declaredSubtype?, canonicalTarget?, semanticStatus, violations, logicalLines }
 *
 * Authority: Constitution Rule 33.
 */

export type AdapterSubtype =
  | "pure-reexport"
  | "lazy"
  | "redirect"
  | "param-translate"
  | "shell-mount"
  | "event-dispatch";

export type SemanticStatus =
  | "clean" // matches a valid subtype, no forbidden APIs
  | "legacy-violation" // contains forbidden APIs (data fetching / state ownership / persistence)
  | "invalid"; // declared subtype mismatches actual content

export interface ClassificationResult {
  subtype: AdapterSubtype | "legacy-violation";
  declaredSubtype: AdapterSubtype | null;
  canonicalTarget: string | null;
  semanticStatus: SemanticStatus;
  violations: string[];
  logicalLines: number;
}

const FORBIDDEN_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "supabase-client", re: /\bsupabase\.\w+/ },
  { name: "tanstack-query", re: /\buseQuery\s*\(/ },
  { name: "tanstack-mutation", re: /\buseMutation\s*\(/ },
  { name: "tanstack-infinite-query", re: /\buseInfiniteQuery\s*\(/ },
  { name: "tanstack-suspense-query", re: /\buseSuspenseQuery\s*\(/ },
  { name: "useState-canonical", re: /\buseState\s*\(/ },
  { name: "useReducer-canonical", re: /\buseReducer\s*\(/ },
];

const DIRECTIVE_RE = /\/\/\s*@route-adapter:\s*([a-z-]+)/i;
const PURE_REEXPORT_RE = /^export\s+(\*|\{[^}]*\})\s+from\s+["']([^"']+)["'];?$/;
const LAZY_IMPORT_RE = /\blazy\s*\(\s*\(\)\s*=>\s*import\s*\(\s*["'](@\/[^"']+)["']/;
const NAVIGATE_RE = /\b(useNavigate|<Navigate\b|navigate\s*\()/;
const PARAMS_RE = /\b(useParams|useSearchParams)\b/;
const SHELL_MOUNT_RE = /<\s*(MobileShell|AppFrame|DomainAppShell|StandaloneAppFrame|AppShell)\b/;
const EVENT_DISPATCH_RE = /window\.dispatchEvent\s*\(\s*new\s+CustomEvent\s*\(\s*["']sita-open-/;

function logicalLineCount(src: string): number {
  let inBlock = false;
  let n = 0;
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (inBlock) {
      if (line.includes("*/")) inBlock = false;
      continue;
    }
    if (line.startsWith("/*")) {
      if (!line.includes("*/")) inBlock = true;
      continue;
    }
    if (line.startsWith("//")) continue;
    n++;
  }
  return n;
}

function isPureReExport(src: string): { yes: boolean; target: string | null } {
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (stripped.length === 0) return { yes: false, target: null };
  let target: string | null = null;
  const allReExports = stripped.every((l) => {
    const m = l.match(PURE_REEXPORT_RE);
    if (m) {
      if (!target) target = m[2];
      return true;
    }
    return /^export\s+\{[^}]*\};?$/.test(l);
  });
  return { yes: allReExports, target };
}

function detectForbiddenAPIs(src: string): string[] {
  const found: string[] = [];
  for (const { name, re } of FORBIDDEN_PATTERNS) {
    if (re.test(src)) found.push(name);
  }
  return found;
}

function detectSubtype(src: string): AdapterSubtype | null {
  const reexport = isPureReExport(src);
  if (reexport.yes) return "pure-reexport";
  if (LAZY_IMPORT_RE.test(src)) return "lazy";
  if (EVENT_DISPATCH_RE.test(src)) return "event-dispatch";
  if (SHELL_MOUNT_RE.test(src)) return "shell-mount";
  // Redirect needs navigate AND no params usage.
  if (NAVIGATE_RE.test(src) && !PARAMS_RE.test(src)) return "redirect";
  if (PARAMS_RE.test(src) && NAVIGATE_RE.test(src)) return "param-translate";
  return null;
}

export function classifyPageFile(src: string): ClassificationResult {
  const lines = logicalLineCount(src);
  const directiveMatch = src.match(DIRECTIVE_RE);
  const declaredSubtype = (directiveMatch?.[1] as AdapterSubtype | undefined) ?? null;

  const reexport = isPureReExport(src);
  const subtype = detectSubtype(src);
  const violations = detectForbiddenAPIs(src);

  const canonicalTarget = reexport.target;

  if (violations.length > 0) {
    return {
      subtype: "legacy-violation",
      declaredSubtype,
      canonicalTarget,
      semanticStatus: "legacy-violation",
      violations,
      logicalLines: lines,
    };
  }

  if (!subtype) {
    // No forbidden APIs but no recognizable adapter pattern → still legacy
    // (likely a static-content page; treated as a violation for the ratchet
    // since it owns rendering rather than re-exporting / mounting).
    // Tolerance: if the file is ≤40 lines we treat it as "clean other".
    if (lines <= 40) {
      return {
        subtype: "pure-reexport",
        declaredSubtype,
        canonicalTarget,
        semanticStatus: "clean",
        violations: [],
        logicalLines: lines,
      };
    }
    return {
      subtype: "legacy-violation",
      declaredSubtype,
      canonicalTarget,
      semanticStatus: "legacy-violation",
      violations: ["unrecognized-adapter-pattern"],
      logicalLines: lines,
    };
  }

  const status: SemanticStatus =
    declaredSubtype && declaredSubtype !== subtype ? "invalid" : "clean";

  return {
    subtype,
    declaredSubtype,
    canonicalTarget,
    semanticStatus: status,
    violations: status === "invalid" ? [`declared-${declaredSubtype}-but-detected-${subtype}`] : [],
    logicalLines: lines,
  };
}
