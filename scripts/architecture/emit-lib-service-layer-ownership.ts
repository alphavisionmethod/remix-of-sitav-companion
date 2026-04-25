#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Wave 1.3 — Emit lib-service-layer-ownership-map.json
//
// Walks src/lib/migration/service-authority-map.ts and projects every entry
// into a uniform { path, layer, vocabClass, canonical, family, purpose } shape.
// Emits the canonical manifest plus a sprawl/dedup audit.
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";
import {
  SERVICE_AUTHORITY_MAP,
  SERVICE_AUTHORITY_SUMMARY,
  type ServiceAuthorityEntry,
} from "../../src/lib/migration/service-authority-map";
import { vocabClassForLayer } from "../../src/lib/migration/service-vocabulary-bridge";

const REPO = process.cwd();
const MANIFEST = path.join(REPO, "generated/manifests/lib-service-layer-ownership-map.json");
const AUDIT = path.join(REPO, "generated/audits/service-sprawl-deduplication-report.json");

interface Projected {
  path: string;
  family: string;
  layer: string;
  vocabClass: string | null;
  canonical: boolean;
  redirectTo?: string;
  purpose: string;
  notes?: string;
}

function project(entry: ServiceAuthorityEntry): Projected {
  return {
    path: `${entry.root}/${entry.id}`,
    family: entry.family,
    layer: entry.layer,
    vocabClass: vocabClassForLayer(entry.layer as any) ?? null,
    canonical: entry.canonical,
    redirectTo: entry.redirectTo,
    purpose: entry.purpose,
    notes: entry.notes,
  };
}

function main() {
  const projected = SERVICE_AUTHORITY_MAP.map(project);

  // Counts per vocab class (canonical only)
  const vocabCounts: Record<string, number> = { service: 0, adapter: 0, client: 0, readModel: 0, _other: 0 };
  for (const p of projected) {
    if (!p.canonical) continue;
    if (p.vocabClass && p.vocabClass in vocabCounts) vocabCounts[p.vocabClass]++;
    else vocabCounts._other++;
  }

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    summary: SERVICE_AUTHORITY_SUMMARY,
    vocabCounts,
    entries: projected,
  };
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`✓ Emitted ${MANIFEST} (${projected.length} entries)`);

  // Sprawl / dedup audit
  const wrapperCompat = projected.filter((p) => p.layer === "WRAPPER_COMPAT_ONLY");
  const duplicateMerge = projected.filter((p) => p.layer === "DUPLICATE_MERGE_REQUIRED");
  const splitRequired = projected.filter((p) => p.layer === "SPLIT_REQUIRED");
  const removeAfter = projected.filter((p) => p.layer === "REMOVE_AFTER_SAFE_MIGRATION");

  // Heuristic: *-client.ts files inside src/lib/services/** (potential client misclass)
  const servicesDir = path.join(REPO, "src/lib/services");
  const clientShapedInServices: string[] = [];
  if (fs.existsSync(servicesDir)) {
    for (const f of fs.readdirSync(servicesDir)) {
      if (f.endsWith("-client.ts")) clientShapedInServices.push(`src/lib/services/${f}`);
    }
  }

  const audit = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    counts: {
      wrapperCompat: wrapperCompat.length,
      duplicateMerge: duplicateMerge.length,
      splitRequired: splitRequired.length,
      removeAfter: removeAfter.length,
      clientShapedInServices: clientShapedInServices.length,
    },
    wrapperCompat: wrapperCompat.map((p) => p.path),
    duplicateMerge: duplicateMerge.map((p) => p.path),
    splitRequired: splitRequired.map((p) => p.path),
    removeAfter: removeAfter.map((p) => p.path),
    clientShapedInServices,
  };
  fs.mkdirSync(path.dirname(AUDIT), { recursive: true });
  fs.writeFileSync(AUDIT, JSON.stringify(audit, null, 2));
  console.log(`✓ Emitted ${AUDIT}`);
}

main();