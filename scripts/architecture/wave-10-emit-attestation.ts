#!/usr/bin/env tsx
/**
 * ════════════════════════════════════════════════════════════════════════
 * SITA OS — Wave 10 Architectural Attestation Generator
 * ════════════════════════════════════════════════════════════════════════
 *
 * Seals the canonicalized repository tree into a signed manifest:
 *   generated/audits/wave-10-architectural-attestation.json
 *
 * For every canonical surface (src/components, src/modules/<pillar>/components,
 * src/platform/<system>/components, src/pages, src/admin) we record:
 *   • file count
 *   • sorted file list
 *   • SHA-256 digest of (sortedPath\u0001sha256(fileBytes))*
 *
 * The top-level `manifestDigest` is a SHA-256 over all surface digests in
 * canonical order — a single 64-char fingerprint of the entire architecture.
 *
 * This manifest is committed and re-validated in CI by
 *   scripts/architecture/wave-10-check-attestation.ts
 *
 * Run:  npx tsx scripts/architecture/wave-10-emit-attestation.ts
 * ════════════════════════════════════════════════════════════════════════
 */
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "generated", "audits");
const OUT_FILE = join(OUT_DIR, "wave-10-architectural-attestation.json");

const SCHEMA_VERSION = 1;
const WAVE = 10;

/** Surfaces sealed by this attestation (canonical order). */
const SURFACES: Array<{ key: string; root: string; recursive: boolean }> = [
  { key: "src/components",  root: "src/components",  recursive: true },
  { key: "src/modules",     root: "src/modules",     recursive: true },
  { key: "src/platform",    root: "src/platform",    recursive: true },
  { key: "src/pages",       root: "src/pages",       recursive: true },
  { key: "src/admin",       root: "src/admin",       recursive: true },
  { key: "src/runtimes",    root: "src/runtimes",    recursive: true },
  { key: "src/routes",      root: "src/routes",      recursive: true },
];

const FILE_EXT = new Set([".ts", ".tsx"]);

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  const entries = readdirSync(dir);
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (st.isFile()) {
      const dot = name.lastIndexOf(".");
      const ext = dot >= 0 ? name.slice(dot) : "";
      if (FILE_EXT.has(ext)) out.push(full);
    }
  }
  return out;
}

function sha256(buf: Buffer | string): string {
  return createHash("sha256").update(buf).digest("hex");
}

function digestSurface(absRoot: string): { count: number; files: Array<{ path: string; sha256: string }>; digest: string } {
  const files = walk(absRoot)
    .map((abs) => relative(ROOT, abs).split(sep).join("/"))
    .sort();
  const entries = files.map((rel) => {
    const buf = readFileSync(join(ROOT, rel));
    return { path: rel, sha256: sha256(buf) };
  });
  const composite = entries.map((e) => `${e.path}\u0001${e.sha256}`).join("\n");
  const digest = sha256(composite);
  return { count: entries.length, files: entries, digest };
}

function main(): void {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const surfaces: Record<string, { count: number; digest: string }> = {};
  const surfaceFileLists: Record<string, Array<{ path: string; sha256: string }>> = {};
  const surfaceDigests: string[] = [];

  for (const s of SURFACES) {
    const abs = join(ROOT, s.root);
    const { count, files, digest } = digestSurface(abs);
    surfaces[s.key] = { count, digest };
    surfaceFileLists[s.key] = files;
    surfaceDigests.push(`${s.key}\u0001${digest}\u0001${count}`);
  }

  const manifestDigest = sha256(surfaceDigests.join("\n"));

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    wave: WAVE,
    generatedAt: new Date().toISOString(),
    title: "Repository Canonicalization — Final Architectural Attestation",
    description: [
      "Seals the post-Wave-9 canonical tree state.",
      "Single source of truth for what 'canonical' means at deploy time.",
      "Validators may compare any subset of these digests to detect drift.",
    ].join(" "),
    constitutionRef: "docs/architecture/REPOSITORY_CONSTITUTION.md",
    surfaces,
    manifestDigest,
    invariants: {
      lastWaveCompleted: 9,
      sealingWave: 10,
      maxAdapterLines: 12,
      sharedAllowlist: ["ui", "primitives", "shared", "cards", "navigation", "launcher", "__tests__"],
      rootFileAllowlist: ["NavLink.tsx"],
    },
  };

  // Write the slim public manifest (digests only — small + diff-friendly).
  writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n");

  // Write the verbose per-file inventory next to it for forensic auditing.
  const inventoryFile = join(OUT_DIR, "wave-10-architectural-attestation-inventory.json");
  writeFileSync(
    inventoryFile,
    JSON.stringify(
      {
        schemaVersion: SCHEMA_VERSION,
        wave: WAVE,
        generatedAt: manifest.generatedAt,
        manifestDigest,
        surfaces: surfaceFileLists,
      },
      null,
      2,
    ) + "\n",
  );

  // Console summary.
  console.log("════════════════════════════════════════════════════════════");
  console.log("Wave 10 — Architectural Attestation Sealed");
  console.log("════════════════════════════════════════════════════════════");
  for (const [k, v] of Object.entries(surfaces)) {
    console.log(`  ${k.padEnd(20)}  files=${String(v.count).padStart(5)}  digest=${v.digest.slice(0, 12)}…`);
  }
  console.log("────────────────────────────────────────────────────────────");
  console.log(`  manifestDigest      = ${manifestDigest}`);
  console.log(`  manifest            → ${relative(ROOT, OUT_FILE)}`);
  console.log(`  inventory           → ${relative(ROOT, inventoryFile)}`);
}

main();