#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Public Artifact Mirror Generator
// Copies policy-matched evidence artifacts into public/generated/artifacts/
// and emits a typed artifact-index.json for the in-app document viewer.
// Idempotent: skips unchanged files (sha256 compare) to avoid git churn.
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import {
  resolveMirrorMatches,
  PUBLIC_MIRROR_ROOT,
  PUBLIC_INDEX_PATH,
  MirrorCategory,
} from "../../architecture/lib/public-mirror-policy";

interface IndexedFile {
  path: string;          // relative to public/generated/artifacts/
  sourcePath: string;    // original repo-relative source
  sizeBytes: number;
  lastModified: string;  // ISO
  sha256: string;
}

interface IndexedCategory {
  name: MirrorCategory;
  count: number;
  files: IndexedFile[];
}

interface ArtifactIndex {
  generatedAt: string;
  totalArtifacts: number;
  categories: IndexedCategory[];
  policyVersion: string;
}

function sha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfChanged(src: string, dest: string, content: Buffer): boolean {
  if (fs.existsSync(dest)) {
    const existing = fs.readFileSync(dest);
    if (sha256(existing) === sha256(content)) return false;
  }
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, content);
  return true;
}

function main(): void {
  const matches = resolveMirrorMatches();
  ensureDir(PUBLIC_MIRROR_ROOT);

  const byCategory = new Map<MirrorCategory, IndexedFile[]>();
  let copiedCount = 0;
  let skippedCount = 0;

  // Track files we wrote so we can detect drift (orphans)
  const expectedDestFiles = new Set<string>();

  for (const match of matches) {
    const dest = path.join(PUBLIC_MIRROR_ROOT, match.mirroredRelPath);
    expectedDestFiles.add(path.normalize(dest));

    const content = fs.readFileSync(match.sourcePath);
    const changed = copyIfChanged(match.sourcePath, dest, content);
    if (changed) copiedCount++;
    else skippedCount++;

    const stat = fs.statSync(dest);
    const indexed: IndexedFile = {
      path: match.mirroredRelPath,
      sourcePath: match.sourcePath.split(path.sep).join("/"),
      sizeBytes: stat.size,
      lastModified: stat.mtime.toISOString(),
      sha256: sha256(content),
    };
    const list = byCategory.get(match.category) ?? [];
    list.push(indexed);
    byCategory.set(match.category, list);
  }

  // Prune orphans (files in mirror root not matched by current policy)
  function walkDest(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walkDest(full));
      else if (entry.isFile()) out.push(full);
    }
    return out;
  }
  let prunedCount = 0;
  for (const existing of walkDest(PUBLIC_MIRROR_ROOT)) {
    if (!expectedDestFiles.has(path.normalize(existing))) {
      fs.unlinkSync(existing);
      prunedCount++;
    }
  }

  // Build index
  const categories: IndexedCategory[] = [];
  for (const [name, files] of byCategory.entries()) {
    files.sort((a, b) => a.path.localeCompare(b.path));
    categories.push({ name, count: files.length, files });
  }
  categories.sort((a, b) => a.name.localeCompare(b.name));

  const index: ArtifactIndex = {
    generatedAt: new Date().toISOString(),
    totalArtifacts: matches.length,
    categories,
    policyVersion: "1.0.0",
  };

  ensureDir(path.dirname(PUBLIC_INDEX_PATH));
  fs.writeFileSync(PUBLIC_INDEX_PATH, JSON.stringify(index, null, 2) + "\n");

  console.log(`📦 Public Artifact Mirror`);
  console.log(`   - matched:  ${matches.length}`);
  console.log(`   - copied:   ${copiedCount}`);
  console.log(`   - skipped:  ${skippedCount} (unchanged)`);
  console.log(`   - pruned:   ${prunedCount} (orphans)`);
  console.log(`   - index:    ${PUBLIC_INDEX_PATH}`);
  console.log(`   - root:     ${PUBLIC_MIRROR_ROOT}`);
}

main();
