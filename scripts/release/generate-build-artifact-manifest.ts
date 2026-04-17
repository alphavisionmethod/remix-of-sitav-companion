#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Build Artifact Manifest Generator
// Scans dist/, electron-release/, build/ios/ipa/, and Android AAB
// outputs and writes generated/build-artifact-manifest.json with
// sha256 + size + commit metadata for each artifact found.
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { execSync } from "child_process";

interface Artifact {
  platform: string;
  name: string;
  path: string;
  sha256: string;
  bytes: number;
}

const SCAN_TARGETS: { platform: string; root: string; pattern?: RegExp }[] = [
  { platform: "web", root: "dist", pattern: /\.(html|js|css|svg|png|woff2?)$/ },
  { platform: "electron", root: "electron-release" },
  { platform: "ios", root: "build/ios/ipa", pattern: /\.ipa$/ },
  { platform: "android", root: "android/app/build/outputs/bundle/release", pattern: /\.aab$/ },
  { platform: "appliance", root: "build/appliance" },
];

function sha256(file: string): { hash: string; bytes: number } {
  const buf = fs.readFileSync(file);
  return { hash: crypto.createHash("sha256").update(buf).digest("hex"), bytes: buf.length };
}

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (entry.isFile()) acc.push(p);
  }
  return acc;
}

const artifacts: Artifact[] = [];
const platformSummary: Record<string, { count: number; bytes: number }> = {};

for (const target of SCAN_TARGETS) {
  const files = walk(target.root).filter((f) => !target.pattern || target.pattern.test(f));
  for (const f of files) {
    try {
      const { hash, bytes } = sha256(f);
      artifacts.push({
        platform: target.platform,
        name: path.basename(f),
        path: f,
        sha256: hash,
        bytes,
      });
      const s = (platformSummary[target.platform] ||= { count: 0, bytes: 0 });
      s.count += 1;
      s.bytes += bytes;
    } catch {
      // skip unreadable
    }
  }
}

function safeGit(cmd: string): string {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}

const manifest = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  commit: safeGit("git rev-parse HEAD"),
  shortCommit: safeGit("git rev-parse --short HEAD"),
  branch: safeGit("git rev-parse --abbrev-ref HEAD"),
  tag: safeGit("git describe --tags --abbrev=0"),
  totalArtifacts: artifacts.length,
  totalBytes: artifacts.reduce((a, b) => a + b.bytes, 0),
  byPlatform: platformSummary,
  artifacts,
};

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync("generated/build-artifact-manifest.json", JSON.stringify(manifest, null, 2));
console.log(`✅ generate-build-artifact-manifest: ${artifacts.length} artifacts across ${Object.keys(platformSummary).length} platform(s)`);
