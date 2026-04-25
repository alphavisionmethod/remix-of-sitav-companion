#!/usr/bin/env tsx
/**
 * SITA OS — Repository Canonicalization Baseline Emitter
 *
 * Captures a snapshot of file counts per ownership zone before any wave of
 * the Repository Tree Canonicalization runs. Each subsequent wave compares
 * against this baseline to prove progress (files moved out of src/pages/<pillar>/
 * and into src/modules/<pillar>/, platform duplicates collapsed, etc.).
 *
 * Output: generated/audits/repository-canonicalization-baseline.json
 *
 * Run: npx tsx scripts/architecture/emit-canonicalization-baseline.ts
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "generated", "audits");
const OUT_FILE = join(OUT_DIR, "repository-canonicalization-baseline.json");

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e);
    let s;
    try {
      s = statSync(p);
    } catch {
      continue;
    }
    if (s.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e)) out.push(p);
  }
  return out;
}

function count(dir: string): number {
  return walk(join(ROOT, dir)).length;
}

function listSubdirs(dir: string): string[] {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).filter((e) => {
    try {
      return statSync(join(abs, e)).isDirectory();
    } catch {
      return false;
    }
  });
}

function main() {
  const snapshot = {
    generatedAt: new Date().toISOString(),
    schemaVersion: 1,
    note: "Baseline file counts captured before Repository Tree Canonicalization waves. See docs/architecture/REPOSITORY_CONSTITUTION.md.",
    topLevel: {
      "src/pages": count("src/pages"),
      "src/modules": count("src/modules"),
      "src/platform": count("src/platform"),
      "src/components": count("src/components"),
      "src/lib": count("src/lib"),
      "src/domains": count("src/domains"),
      "src/runtimes": count("src/runtimes"),
      "src/admin": count("src/admin"),
      "src/routes": count("src/routes"),
      "src/hooks": count("src/hooks"),
      "src/contexts": count("src/contexts"),
    },
    pillars: {
      business: {
        moduleOwned: count("src/modules/business"),
        legacyPages: count("src/pages/business"),
        revenueOffice: count("src/pages/revenue-office"),
        digitalPresence: count("src/pages/digital-presence"),
      },
      concierge: {
        moduleOwned: count("src/modules/concierge"),
        legacyPages: count("src/pages/concierge"),
      },
      finance: {
        moduleOwned: count("src/modules/finance"),
        legacyMoney: count("src/pages/money"),
        legacyInvestmentOffice: count("src/pages/investment-office"),
      },
      health: {
        moduleOwned: count("src/modules/health"),
        legacyPages: count("src/pages/health"),
      },
    },
    platformDuplicateCandidates: {
      ai_vs_ai_gateway: {
        ai: count("src/platform/ai"),
        ai_gateway: count("src/platform/ai-gateway"),
      },
      nova_sdk_vs_nova_runtime_sdk: {
        nova_sdk: count("src/platform/nova-sdk"),
        nova_runtime_sdk: count("src/platform/nova-runtime-sdk"),
      },
      policy_vs_policies: {
        policy: count("src/platform/policy"),
        policies: count("src/platform/policies"),
      },
      sync_vs_sync_engine: {
        sync: count("src/platform/sync"),
        sync_engine: count("src/platform/sync-engine"),
      },
      core_vs_core_services_vs_os_services: {
        core: count("src/platform/core"),
        core_services: count("src/platform/core-services"),
        os_services: count("src/platform/os-services"),
      },
      services_unclassified: count("src/platform/services-unclassified"),
    },
    adminTrees: {
      "src/admin": count("src/admin"),
      "src/pages/admin": count("src/pages/admin"),
    },
    generatedTrees: {
      "generated": count("generated"),
      "public/generated": count("public/generated"),
    },
    pagesSubdirInventory: listSubdirs("src/pages").map((d) => ({
      dir: `src/pages/${d}`,
      files: count(`src/pages/${d}`),
    })),
    platformSubdirInventory: listSubdirs("src/platform").map((d) => ({
      dir: `src/platform/${d}`,
      files: count(`src/platform/${d}`),
    })),
  };

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  console.log(`✅ Wrote baseline → ${relative(ROOT, OUT_FILE)}`);
  console.log(
    `   src/pages=${snapshot.topLevel["src/pages"]} src/modules=${snapshot.topLevel["src/modules"]} src/platform=${snapshot.topLevel["src/platform"]}`,
  );
}

main();