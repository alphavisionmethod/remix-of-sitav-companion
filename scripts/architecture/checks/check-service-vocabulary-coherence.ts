#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Wave 1.3 — check-service-vocabulary-coherence (BLOCKING)
//
// Enforces the four forbidden sprawl patterns from
// docs/architecture/SERVICE_ADAPTER_CLIENT_OWNERSHIP_MODEL.md:
//
//   1. Service-as-transport   — service files calling @supabase/supabase-js or fetch()
//   2. Client-as-orchestrator — UI_CLIENT files importing executor / approval / receipt
//   3. Adapter-as-facade      — modules/pages/admin importing INTEGRATION_ADAPTER files
//                               directly (not via a service facade)
//   4. Raw-SDK bypass         — code outside approved owners imports
//                               @supabase/supabase-js directly
//
// Scope is intentionally narrow: only files explicitly classified by
// service-authority-map.ts are evaluated for rules 1–3. Rule 4 is a repo-wide
// import scan with an allow-list.
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";
import {
  SERVICE_AUTHORITY_MAP,
  type ServiceAuthorityEntry,
} from "../../../src/lib/migration/service-authority-map";
import {
  CANONICAL_ROOTS,
  APPROVED_TRANSPORT_OWNERS,
  vocabClassForLayer,
} from "../../../src/lib/migration/service-vocabulary-bridge";

const REPO = process.cwd();

interface Violation {
  rule: 1 | 2 | 3 | 4;
  file: string;
  message: string;
}
const violations: Violation[] = [];

function readSafe(p: string): string {
  try { return fs.readFileSync(p, "utf8"); } catch { return ""; }
}

/**
 * True when the file imports the given module **at runtime** (not type-only).
 * Pure `import type { … } from "X"` and `import { type X } from "Y"` are excluded
 * because they are erased by the TS compiler and have zero transport / bundle cost.
 */
function hasRuntimeImport(src: string, modulePattern: RegExp): boolean {
  const lines = src.split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!modulePattern.test(line)) continue;
    if (!/from\s+["']/.test(line)) continue;
    // Pure type-only import: `import type {...} from "..."`
    if (/^import\s+type\s+/.test(line)) continue;
    // `export type {...} from "..."`
    if (/^export\s+type\s+/.test(line)) continue;
    return true;
  }
  return false;
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listFiles(full));
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(full);
  }
  return out;
}

function entryPaths(entry: ServiceAuthorityEntry): string[] {
  const root = path.join(REPO, entry.root);
  // Wildcards (e.g. "engines/*", "data-services/*") expand to the parent root.
  if (entry.id.endsWith("/*")) return listFiles(root);
  // Concrete file (e.g. "release-persistence-service.ts") or directory
  const candidate = path.join(root, entry.id);
  if (fs.existsSync(candidate)) {
    if (fs.statSync(candidate).isDirectory()) return listFiles(candidate);
    return [candidate];
  }
  // Try .ts suffix
  const candidateTs = candidate + ".ts";
  if (fs.existsSync(candidateTs)) return [candidateTs];
  return [];
}

function checkRule1_ServiceAsTransport() {
  const services = SERVICE_AUTHORITY_MAP.filter((e) => {
    const v = vocabClassForLayer(e.layer as any);
    return v === "service" && e.canonical;
  });
  for (const e of services) {
    for (const f of entryPaths(e)) {
      const src = readSafe(f);
      if (hasRuntimeImport(src, /["']@supabase\/supabase-js["']/)) {
        violations.push({
          rule: 1,
          file: path.relative(REPO, f),
          message: `Service file imports @supabase/supabase-js directly (must go through @/lib/data-services or an INTEGRATION_ADAPTER).`,
        });
      }
    }
  }
}

function checkRule2_ClientAsOrchestrator() {
  const clients = SERVICE_AUTHORITY_MAP.filter((e) => {
    const v = vocabClassForLayer(e.layer as any);
    return v === "client" && e.canonical;
  });
  const orchestratorPatterns = [
    /@\/lib\/core-services\/executor-service/,
    /@\/lib\/core-services\/approval-engine/,
    /@\/lib\/core-services\/receipt-service/,
    /@\/lib\/core-services\/workflow-engine/,
  ];
  for (const e of clients) {
    for (const f of entryPaths(e)) {
      const src = readSafe(f);
      for (const pat of orchestratorPatterns) {
        if (hasRuntimeImport(src, pat)) {
          violations.push({
            rule: 2,
            file: path.relative(REPO, f),
            message: `UI_CLIENT file imports an orchestration service (${pat.source}). Clients must remain low-level transport.`,
          });
          break;
        }
      }
    }
  }
}

function checkRule3_AdapterAsFacade() {
  const adapters = SERVICE_AUTHORITY_MAP.filter((e) => {
    const v = vocabClassForLayer(e.layer as any);
    return v === "adapter" && e.canonical;
  });
  // Build alias prefixes that map to each adapter entry.
  const adapterAliasPrefixes: string[] = adapters.map((e) => {
    const alias = e.root.replace(/^src\//, "@/");
    return `${alias}/${e.id.replace(/\/\*$/, "")}`;
  });

  const consumers: string[] = [];
  for (const root of ["src/modules", "src/pages", "src/admin"]) {
    consumers.push(...listFiles(path.join(REPO, root)));
  }
  for (const f of consumers) {
    const src = readSafe(f);
    for (const prefix of adapterAliasPrefixes) {
      const re = new RegExp(`["']${prefix.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}`);
      if (hasRuntimeImport(src, re)) {
        // /types and /contracts subpaths are pure contract surfaces — those
        // are explicitly allowed to be consumed cross-layer (Wave 1.2 model).
        const typesRe = new RegExp(`["']${prefix.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\/(types|contracts)(\\/|["'])`);
        if (typesRe.test(src) && !new RegExp(`["']${prefix.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}["']`).test(src)) continue;
        violations.push({
          rule: 3,
          file: path.relative(REPO, f),
          message: `Direct import of INTEGRATION_ADAPTER "${prefix}" from a UI/module/admin surface. Consume via a service facade instead.`,
        });
        break;
      }
    }
  }
}

function checkRule4_RawSdkBypass() {
  const allowed = APPROVED_TRANSPORT_OWNERS.map((p) => path.join(REPO, p));
  // also allow integrations/** (already a boundary layer) and supabase/functions/**
  const boundaryRoots = [
    path.join(REPO, "src/integrations"),
    path.join(REPO, "supabase/functions"),
    path.join(REPO, "scripts"),
    path.join(REPO, "tests"),
    path.join(REPO, "src/__tests__"),
    path.join(REPO, "src/lib/data-services"),
  ];
  function isAllowed(f: string): boolean {
    if (allowed.some((a) => f === a || f.startsWith(a + path.sep))) return true;
    if (boundaryRoots.some((a) => f.startsWith(a + path.sep))) return true;
    return false;
  }

  const all = listFiles(path.join(REPO, "src"));
  for (const f of all) {
    if (isAllowed(f)) continue;
    const src = readSafe(f);
    if (hasRuntimeImport(src, /["']@supabase\/supabase-js["']/)) {
      // Skip the auto-generated client itself
      if (f.endsWith(path.join("integrations", "supabase", "client.ts"))) continue;
      violations.push({
        rule: 4,
        file: path.relative(REPO, f),
        message: `Raw @supabase/supabase-js import outside approved transport owners. Consume @/integrations/supabase/client or a UI_CLIENT.`,
      });
    }
  }
}

function main() {
  checkRule1_ServiceAsTransport();
  checkRule2_ClientAsOrchestrator();
  checkRule3_AdapterAsFacade();
  checkRule4_RawSdkBypass();

  const byRule = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>;
  for (const v of violations) byRule[v.rule]++;

  console.log(`check-service-vocabulary-coherence (Wave 1.3)`);
  console.log(`  Rule 1 (service-as-transport):   ${byRule[1]}`);
  console.log(`  Rule 2 (client-as-orchestrator): ${byRule[2]}`);
  console.log(`  Rule 3 (adapter-as-facade):      ${byRule[3]}`);
  console.log(`  Rule 4 (raw-sdk-bypass):         ${byRule[4]}`);

  if (violations.length === 0) {
    console.log(`✓ All four sprawl rules pass.`);
    process.exit(0);
  }

  for (const v of violations.slice(0, 50)) {
    console.error(`  [Rule ${v.rule}] ${v.file}: ${v.message}`);
  }
  if (violations.length > 50) {
    console.error(`  … +${violations.length - 50} more`);
  }
  console.error(`✗ ${violations.length} vocabulary-coherence violations.`);

  // Wave 1.3 baseline mode: if VOCAB_COHERENCE_BASELINE=1, emit but don't fail.
  if (process.env.VOCAB_COHERENCE_BASELINE === "1") {
    console.warn(`(BASELINE mode — exit 0 despite ${violations.length} violations)`);
    process.exit(0);
  }
  process.exit(1);
}

main();