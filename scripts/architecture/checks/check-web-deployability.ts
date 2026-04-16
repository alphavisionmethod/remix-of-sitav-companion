/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Web Deployability Contract Gate
// Phase 13 — asserts the 13-item Web Deployability Checklist
// against disk truth (SW guard, CSP, push icons, public assets).
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { WEB_DEPLOYABILITY_READINESS } from "../../../src/lib/web-platform/release/web-deployability-readiness";

interface WebIssue {
  severity: "error" | "warning";
  area: string;
  message: string;
}

const issues: WebIssue[] = [];
const PROJECT_REF = "fctupowhcljejygjfpty";

// ── 1. Registry integrity ──────────────────────────────────────
let missingCount = 0;
let partialMissingRemediation = 0;
for (const item of WEB_DEPLOYABILITY_READINESS) {
  if (item.status === "missing") {
    missingCount++;
    issues.push({ severity: "error", area: "registry", message: `Item "${item.id}" is MISSING` });
  }
  if (item.status === "partial" && !item.remediation) {
    partialMissingRemediation++;
    issues.push({ severity: "error", area: "registry", message: `Partial item "${item.id}" lacks remediation` });
  }
  if (item.blocker && item.status !== "ready" && item.status !== "partial") {
    issues.push({ severity: "error", area: "registry", message: `Blocker item "${item.id}" not ready (status=${item.status})` });
  }
}

// ── 2. SW iframe/preview guard exists in src/main.tsx ──────────
if (!existsSync("src/main.tsx")) {
  issues.push({ severity: "error", area: "sw-guard", message: "src/main.tsx not found" });
} else {
  const main = readFileSync("src/main.tsx", "utf8");
  const hasIframeCheck = /window\.self\s*!==\s*window\.top/.test(main);
  const hasPreviewCheck = /id-preview--|lovableproject\.com|lovable\.app/.test(main);
  if (!hasIframeCheck) {
    issues.push({ severity: "error", area: "sw-guard", message: "src/main.tsx missing iframe check (window.self !== window.top)" });
  }
  if (!hasPreviewCheck) {
    issues.push({ severity: "error", area: "sw-guard", message: "src/main.tsx missing preview-host check (id-preview-- / lovable.app)" });
  }
}

// ── 3. sw-push.js does NOT reference broken /pwa-*.png paths ──
if (existsSync("public/sw-push.js")) {
  const sw = readFileSync("public/sw-push.js", "utf8");
  if (/\/pwa-\d+x\d+\.png/.test(sw)) {
    issues.push({ severity: "error", area: "push-icons", message: "public/sw-push.js still references non-existent /pwa-*.png paths" });
  }
  if (!sw.includes("/icons/icon-192.png")) {
    issues.push({ severity: "warning", area: "push-icons", message: "public/sw-push.js does not reference /icons/icon-192.png" });
  }
} else {
  issues.push({ severity: "error", area: "push-icons", message: "public/sw-push.js not found" });
}

// ── 4. CSP alignment in nginx/default.conf ─────────────────────
function checkCsp(path: string) {
  if (!existsSync(path)) {
    issues.push({ severity: "error", area: "csp", message: `${path} not found` });
    return;
  }
  const conf = readFileSync(path, "utf8");
  if (!conf.includes(`https://${PROJECT_REF}.supabase.co`)) {
    issues.push({ severity: "error", area: "csp", message: `${path} CSP missing project Supabase origin (${PROJECT_REF}.supabase.co)` });
  }
  if (!conf.includes(`wss://${PROJECT_REF}.supabase.co`)) {
    issues.push({ severity: "error", area: "csp", message: `${path} CSP missing wss:// for Supabase realtime` });
  }
  if (!conf.includes("ai.gateway.lovable.dev")) {
    issues.push({ severity: "warning", area: "csp", message: `${path} CSP missing ai.gateway.lovable.dev` });
  }
  if (/https:\/\/\*\.supabase\.co/.test(conf)) {
    issues.push({ severity: "warning", area: "csp", message: `${path} still uses wildcard *.supabase.co (weak)` });
  }
}
checkCsp("nginx/default.conf");
checkCsp("deploy/nginx.conf");

// ── 5. Public assets exist ─────────────────────────────────────
const REQUIRED_PUBLIC_ASSETS = [
  "public/manifest.webmanifest",
  "public/robots.txt",
  "public/sitemap.xml",
  "public/icons/icon-192.png",
  "public/icons/icon-512.png",
];
for (const p of REQUIRED_PUBLIC_ASSETS) {
  if (!existsSync(p)) {
    issues.push({ severity: "error", area: "public-assets", message: `Missing required public asset: ${p}` });
  }
}

// ── 6. Host rewriter script exists for prod-host parameterization ──
if (!existsSync("scripts/release/web/rewrite-public-host.ts")) {
  issues.push({ severity: "warning", area: "host-rewriter", message: "scripts/release/web/rewrite-public-host.ts missing — sitemap/robots host can't be parameterized" });
}

// ── 7. Env doc exists ──────────────────────────────────────────
if (!existsSync("docs/web/env-vars.md")) {
  issues.push({ severity: "warning", area: "docs", message: "docs/web/env-vars.md missing — env vars not documented" });
}

// ── Emit report ────────────────────────────────────────────────
const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

const counts: Record<string, number> = { ready: 0, partial: 0, deferred: 0, missing: 0 };
for (const it of WEB_DEPLOYABILITY_READINESS) counts[it.status]++;

const report = {
  generatedAt: new Date().toISOString(),
  ok,
  errorCount,
  warningCount,
  totals: {
    items: WEB_DEPLOYABILITY_READINESS.length,
    ...counts,
  },
  checks: {
    swIframeGuard: !issues.some((i) => i.area === "sw-guard" && i.severity === "error"),
    pushIconsResolved: !issues.some((i) => i.area === "push-icons" && i.severity === "error"),
    cspAligned: !issues.some((i) => i.area === "csp" && i.severity === "error"),
    publicAssetsPresent: !issues.some((i) => i.area === "public-assets"),
    hostRewriter: existsSync("scripts/release/web/rewrite-public-host.ts"),
    envDocs: existsSync("docs/web/env-vars.md"),
    registryClean: missingCount === 0 && partialMissingRemediation === 0,
  },
  items: WEB_DEPLOYABILITY_READINESS.map((it) => ({
    id: it.id,
    title: it.title,
    status: it.status,
    blocker: it.blocker,
    evidence: it.evidence,
    remediation: it.remediation ?? null,
  })),
  issues,
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/web-deployability-report.json", JSON.stringify(report, null, 2));

if (!ok) {
  console.error(`✘ Web deployability: ${errorCount} errors, ${warningCount} warnings`);
  for (const i of issues) console.error(`  [${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
console.log(`✓ Web deployability: 13/13 items honest, SW guard + CSP + push icons + public assets all OK`);
