#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Slim Artifact Index Generator
// Emits generated/INDEX.json: a slim, externally-readable map
// joining artifact → producer-script → consuming-gates by
// reading the artifact-ownership-manifest (producer side) and
// scanning all check-*.ts files for readJsonSafe / readFileSync
// references (consumer side).
//
// Mirrored to public/generated/INDEX.json for HTTPS access by
// external validators and auditors.
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";

// ── Inputs ─────────────────────────────────────────────────────
const OWNERSHIP_MANIFEST = "generated/artifact-ownership-manifest.json";
const SCAN_DIRS = ["scripts/architecture/checks", "scripts/validation"];
const OUT_PATH = "generated/INDEX.json";
const MIRROR_PATH = "public/generated/INDEX.json";

interface OwnershipEntry {
  artifact: string;
  producer: string | null;
  npmScript?: string | null;
  owner?: string;
  consumers?: string[];
  declaredInRegistry?: boolean;
  source?: string;
}

interface OwnershipManifest {
  totalArtifacts: number;
  withProducer: number;
  entries: OwnershipEntry[];
}

interface IndexEntry {
  artifact: string;
  producer: string | null;
  npmScript: string | null;
  consumers: string[];
  owner: string;
}

interface IndexDoc {
  schemaVersion: number;
  generatedAt: string;
  generator: string;
  totalArtifacts: number;
  withProducer: number;
  withConsumers: number;
  fullyTraceable: number;
  coveragePercent: number;
  entries: IndexEntry[];
}

// ── Load producer side from ownership manifest ─────────────────
if (!fs.existsSync(OWNERSHIP_MANIFEST)) {
  console.error(`❌ Missing ${OWNERSHIP_MANIFEST}. Run: npm run generate:artifact-ownership first.`);
  process.exit(1);
}
const ownership = JSON.parse(fs.readFileSync(OWNERSHIP_MANIFEST, "utf8")) as OwnershipManifest;

// ── Build consumer reverse-index by scanning check scripts ─────
function walkTs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!e.name.startsWith(".") && e.name !== "node_modules") out.push(...walkTs(full));
    } else if (e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".tsx"))) {
      out.push(full);
    }
  }
  return out;
}

// Match readJsonSafe("generated/X.json"), readFileSync("generated/X.json", ...),
// JSON.parse(readFileSync("generated/X.json"...)), and join("generated", "X.json").
const ARTIFACT_REF_RE =
  /["'`](generated\/[A-Za-z0-9_./\\-]+\.(?:json|md|yaml|yml|csv))["'`]/g;

const consumersByArtifact = new Map<string, Set<string>>();

for (const dir of SCAN_DIRS) {
  for (const file of walkTs(dir)) {
    let src: string;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    let m: RegExpExecArray | null;
    ARTIFACT_REF_RE.lastIndex = 0;
    while ((m = ARTIFACT_REF_RE.exec(src)) !== null) {
      const artifact = m[1].replace(/\\/g, "/");
      // Skip self-write (the script also writes its own report); we only want
      // consumer-side reads. Heuristic: a file that contains writeFileSync
      // for the same path is the producer, but we count it as consumer too
      // only if it also reads it. To keep it simple and useful, just record
      // every reference; producer is filtered out below.
      if (!consumersByArtifact.has(artifact)) consumersByArtifact.set(artifact, new Set());
      consumersByArtifact.get(artifact)!.add(file.replace(/\\/g, "/"));
    }
  }
}

// ── Join producer + consumers ──────────────────────────────────
const entries: IndexEntry[] = [];
let withProducer = 0;
let withConsumers = 0;
let fullyTraceable = 0;

for (const e of ownership.entries) {
  const consumerSet = consumersByArtifact.get(e.artifact) ?? new Set<string>();
  // Filter producer out of consumer list (producer is not a consumer of itself)
  if (e.producer) consumerSet.delete(e.producer);
  const consumers = Array.from(consumerSet).sort();

  const hasProducer = !!e.producer;
  const hasConsumer = consumers.length > 0;
  if (hasProducer) withProducer++;
  if (hasConsumer) withConsumers++;
  if (hasProducer && hasConsumer) fullyTraceable++;

  entries.push({
    artifact: e.artifact,
    producer: e.producer ?? null,
    npmScript: e.npmScript ?? null,
    consumers,
    owner: e.owner ?? "unowned",
  });
}

// Deterministic ordering by artifact path
entries.sort((a, b) => a.artifact.localeCompare(b.artifact));

const total = entries.length;
const traceableEither = entries.filter((e) => e.producer || e.consumers.length > 0).length;
const coveragePercent = total === 0 ? 0 : Math.round((traceableEither / total) * 1000) / 10;

const doc: IndexDoc = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  generator: "scripts/manifests/generate/generate-artifact-index.ts",
  totalArtifacts: total,
  withProducer,
  withConsumers,
  fullyTraceable,
  coveragePercent,
  entries,
};

// ── Write ──────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(doc, null, 2));
fs.mkdirSync(path.dirname(MIRROR_PATH), { recursive: true });
fs.writeFileSync(MIRROR_PATH, JSON.stringify(doc, null, 2));

console.log(`✅ Wrote ${OUT_PATH} (${total} entries, ${coveragePercent}% traceable)`);
console.log(`   producers=${withProducer}, consumers=${withConsumers}, fully-traceable=${fullyTraceable}`);
console.log(`   Mirrored to ${MIRROR_PATH}`);
