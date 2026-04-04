// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 8: Registry + Generated + Docs Sync
// Validates consistency between contracts, manifests, and docs
// Run: npx tsx scripts/sync-registry-manifests.ts
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface SyncResult {
  artifact: string;
  status: "in-sync" | "drift-detected" | "missing";
  details?: string;
}

const results: SyncResult[] = [];
const generatedDir = path.resolve(__dirname, "../generated");

function checkFile(filename: string, requiredFields: string[]): SyncResult {
  const filePath = path.join(generatedDir, filename);
  if (!fs.existsSync(filePath)) {
    return { artifact: filename, status: "missing", details: "File does not exist" };
  }
  try {
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const missing = requiredFields.filter((f) => !(f in content));
    if (missing.length > 0) {
      return { artifact: filename, status: "drift-detected", details: `Missing fields: ${missing.join(", ")}` };
    }
    return { artifact: filename, status: "in-sync" };
  } catch (e) {
    return { artifact: filename, status: "drift-detected", details: `Parse error: ${(e as Error).message}` };
  }
}

function checkDocsSync(): SyncResult {
  const arqPath = path.resolve(__dirname, "../infra/docs/ARQ_PLAN_FINAL.md");
  if (!fs.existsSync(arqPath)) {
    return { artifact: "ARQ_PLAN_FINAL.md", status: "missing" };
  }
  const content = fs.readFileSync(arqPath, "utf-8");

  // Verify key sections exist
  const requiredSections = [
    "Base OS Authority",
    "Secure Boot Posture",
    "Hardware Assumptions",
    "Kernel / Initramfs Policy",
    "Measured Boot Chain",
    "SITA Runtime Bootstrap",
  ];
  const missing = requiredSections.filter((s) => !content.includes(s));
  if (missing.length > 0) {
    return { artifact: "ARQ_PLAN_FINAL.md", status: "drift-detected", details: `Missing sections: ${missing.join(", ")}` };
  }

  // Cross-check: base-os-manifest should reference same OS version as ARQ doc
  const baseManifestPath = path.join(generatedDir, "base-os-manifest.json");
  if (fs.existsSync(baseManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(baseManifestPath, "utf-8"));
    if (manifest.os?.distribution && !content.includes(manifest.os.distribution)) {
      return {
        artifact: "ARQ_PLAN_FINAL.md",
        status: "drift-detected",
        details: `ARQ doc doesn't mention base-os-manifest distribution: ${manifest.os.distribution}`,
      };
    }
  }

  return { artifact: "ARQ_PLAN_FINAL.md", status: "in-sync" };
}

function checkContractManifestSync(): SyncResult {
  const manifestPath = path.join(generatedDir, "contract-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return { artifact: "contract-manifest.json", status: "missing" };
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    // Check that required fields exist
    const expectedFields = ["version", "totalContracts", "contracts"];
    const missing = expectedFields.filter((f) => !(f in manifest));
    if (missing.length > 0) {
      return { artifact: "contract-manifest.json", status: "drift-detected", details: `Missing fields: ${missing.join(", ")}` };
    }
    return { artifact: "contract-manifest.json", status: "in-sync" };
  } catch (e) {
    return { artifact: "contract-manifest.json", status: "drift-detected", details: `Parse error: ${(e as Error).message}` };
  }
}

function run() {
  console.log("═══ SITA OS Registry & Manifest Sync ═══\n");

  // Check boot chain manifests
  results.push(checkFile("base-os-manifest.json", ["version", "os", "kernel", "signingKeys"]));
  results.push(checkFile("boot-chain-manifest.json", ["version", "stages", "measurements"]));
  results.push(checkFile("first-boot-contract-manifest.json", ["version", "contracts"]));
  results.push(checkFile("first-boot-proof-receipts.json", ["version", "receiptTypes"]));

  // Check existing manifests
  results.push(checkFile("contract-manifest.json", ["version", "totalContracts", "contracts"]));
  results.push(checkFile("runtime-conformance-manifest.json", ["version", "entries"]));
  results.push(checkFile("startup-order.json", ["version"]));

  // Check docs
  results.push(checkDocsSync());
  results.push(checkContractManifestSync());

  // Report
  console.log("Sync Report:\n");
  for (const r of results) {
    const icon = r.status === "in-sync" ? "✓" : r.status === "missing" ? "✗" : "⚠";
    const detail = r.details ? ` — ${r.details}` : "";
    console.log(`  ${icon} [${r.status}] ${r.artifact}${detail}`);
  }

  const inSync = results.filter((r) => r.status === "in-sync").length;
  const drifted = results.filter((r) => r.status === "drift-detected").length;
  const missing = results.filter((r) => r.status === "missing").length;

  console.log(`\n${inSync} in-sync, ${drifted} drifted, ${missing} missing\n`);

  if (drifted > 0 || missing > 0) {
    process.exit(1);
  }
  console.log("All artifacts in sync.");
}

run();
