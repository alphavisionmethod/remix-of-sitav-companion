#!/usr/bin/env tsx
/**
 * ════════════════════════════════════════════════════════════════════════
 * SITA OS — Wave 10 Architectural Attestation Drift Check
 * ════════════════════════════════════════════════════════════════════════
 *
 * Re-computes the canonical surface digests and compares them to the
 * sealed manifest at:
 *   generated/audits/wave-10-architectural-attestation.json
 *
 * Exit codes:
 *   0 — manifest matches the live tree (no drift)
 *   1 — drift detected (per-surface diff printed; CI fails)
 *   2 — sealed manifest is missing (run wave-10-emit-attestation first)
 *
 * Run:  npx tsx scripts/architecture/wave-10-check-attestation.ts
 *       npx tsx scripts/architecture/wave-10-check-attestation.ts --update
 * ════════════════════════════════════════════════════════════════════════
 */
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const MANIFEST = join(ROOT, "generated", "audits", "wave-10-architectural-attestation.json");
const UPDATE = process.argv.includes("--update");

const SURFACES = [
  "src/components",
  "src/modules",
  "src/platform",
  "src/pages",
  "src/admin",
  "src/runtimes",
  "src/routes",
] as const;

const FILE_EXT = new Set([".ts", ".tsx"]);

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) out.push(...walk(full));
    else if (st.isFile()) {
      const dot = name.lastIndexOf(".");
      if (FILE_EXT.has(dot >= 0 ? name.slice(dot) : "")) out.push(full);
    }
  }
  return out;
}

function sha256(buf: Buffer | string): string {
  return createHash("sha256").update(buf).digest("hex");
}

function digestSurface(absRoot: string): { count: number; digest: string } {
  const files = walk(absRoot)
    .map((abs) => relative(ROOT, abs).split(sep).join("/"))
    .sort();
  const composite = files
    .map((rel) => `${rel}\u0001${sha256(readFileSync(join(ROOT, rel)))}`)
    .join("\n");
  return { count: files.length, digest: sha256(composite) };
}

function main(): void {
  if (!existsSync(MANIFEST)) {
    console.error(`✗ Sealed manifest not found: ${relative(ROOT, MANIFEST)}`);
    console.error(`  Run: npx tsx scripts/architecture/wave-10-emit-attestation.ts`);
    process.exit(2);
  }

  const sealed = JSON.parse(readFileSync(MANIFEST, "utf8")) as {
    surfaces: Record<string, { count: number; digest: string }>;
    manifestDigest: string;
  };

  const live: Record<string, { count: number; digest: string }> = {};
  const surfaceDigests: string[] = [];

  for (const key of SURFACES) {
    live[key] = digestSurface(join(ROOT, key));
    surfaceDigests.push(`${key}\u0001${live[key].digest}\u0001${live[key].count}`);
  }
  const liveManifestDigest = sha256(surfaceDigests.join("\n"));

  console.log("════════════════════════════════════════════════════════════");
  console.log("Wave 10 — Architectural Attestation Drift Check");
  console.log("════════════════════════════════════════════════════════════");

  let drift = false;
  for (const key of SURFACES) {
    const a = sealed.surfaces[key];
    const b = live[key];
    if (!a) {
      console.log(`  ⚠ ${key.padEnd(20)} new surface  → ${b.digest.slice(0, 12)}…  files=${b.count}`);
      drift = true;
      continue;
    }
    const same = a.digest === b.digest && a.count === b.count;
    if (same) {
      console.log(`  ✓ ${key.padEnd(20)} ${b.digest.slice(0, 12)}…  files=${b.count}`);
    } else {
      drift = true;
      console.log(`  ✗ ${key.padEnd(20)} DRIFT`);
      console.log(`      sealed: ${a.digest.slice(0, 16)}…  files=${a.count}`);
      console.log(`      live  : ${b.digest.slice(0, 16)}…  files=${b.count}`);
    }
  }
  console.log("────────────────────────────────────────────────────────────");
  console.log(`  sealed manifestDigest = ${sealed.manifestDigest}`);
  console.log(`  live   manifestDigest = ${liveManifestDigest}`);

  if (!drift) {
    console.log("✅ No architectural drift detected.");
    process.exit(0);
  }

  if (UPDATE) {
    console.log("\n--update flag set: regenerating sealed manifest.");
    const r = spawnSync("npx", ["tsx", "scripts/architecture/wave-10-emit-attestation.ts"], {
      stdio: "inherit",
    });
    process.exit(r.status ?? 1);
  }

  console.error("\n✗ Architectural drift detected.");
  console.error("  If this drift is intentional, re-seal with:");
  console.error("    npx tsx scripts/architecture/wave-10-emit-attestation.ts");
  console.error("  and commit generated/audits/wave-10-architectural-attestation.json");
  process.exit(1);
}

main();