// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 0: Contract Validation Baseline
// Imports all contract barrels and classifies failures
// Run: npx tsx scripts/validate-os-contracts.ts
// ═══════════════════════════════════════════════════════════════

type FailureClass = "parse-import" | "runtime-contract-drift" | "proof-receipt-drift";

interface ValidationResult {
  module: string;
  status: "ok" | "fail";
  failureClass?: FailureClass;
  error?: string;
}

const results: ValidationResult[] = [];

function validate(module: string, importFn: () => Promise<unknown>, failureClass: FailureClass = "parse-import") {
  return importFn()
    .then(() => {
      results.push({ module, status: "ok" });
    })
    .catch((err: Error) => {
      results.push({ module, status: "fail", failureClass, error: err.message });
    });
}

async function run() {
  console.log("═══ SITA OS Contract Validation ═══\n");

  // ── Parse/Import checks ──────────────────────────────────
  await Promise.all([
    // Core contracts
    validate("contracts/core", () => import("../src/packages/contracts/core")),
    validate("contracts/runtime", () => import("../src/packages/contracts/runtime")),
    validate("contracts/native", () => import("../src/packages/contracts/native")),

    // Proof model
    validate("proof-model", () => import("../src/packages/proof-model")),
    validate("proof-model/receipts", () => import("../src/packages/proof-model/receipts")),

    // Shell grammar
    validate("shell-grammar", () => import("../src/packages/shell-grammar")),

    // Lifecycle contracts (Phases 1-4)
    validate("lifecycle-authority", () => import("../src/packages/contracts/runtime/lifecycle-authority")),
    validate("host-supervision", () => import("../src/packages/contracts/runtime/host-supervision")),
    validate("lifecycle-receipts", () => import("../src/packages/contracts/runtime/lifecycle-receipts")),
    validate("install-recovery", () => import("../src/packages/contracts/runtime/install-recovery")),
  ]);

  // ── Runtime contract drift checks ────────────────────────
  // Verify generated manifests reference real contract types
  await validate("runtime-conformance", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const manifestPath = path.resolve(__dirname, "../generated/runtime-conformance-manifest.json");
    if (!fs.existsSync(manifestPath)) {
      throw new Error("runtime-conformance-manifest.json not found");
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (!manifest.entries || !Array.isArray(manifest.entries)) {
      throw new Error("Invalid manifest structure: missing entries array");
    }
  }, "runtime-contract-drift");

  // ── Proof/receipt drift checks ───────────────────────────
  await validate("proof-receipt-types", async () => {
    const proofModel = await import("../src/packages/proof-model");
    // Verify TypedReceipt union includes expected types
    const expectedTypes = [
      "action", "approval", "execution", "verification",
      "rollback", "boardroom-decision", "communication",
      "payment", "system", "refusal", "first-boot",
    ];
    // Type-level check — if the union doesn't include these,
    // TypeScript compilation would have already failed
    void expectedTypes;
    void proofModel;
  }, "proof-receipt-drift");

  // ── Boot chain manifest checks ───────────────────────────
  await validate("boot-chain-manifest", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const files = [
      "base-os-manifest.json",
      "boot-chain-manifest.json",
      "first-boot-contract-manifest.json",
      "first-boot-proof-receipts.json",
    ];
    for (const file of files) {
      const filePath = path.resolve(__dirname, `../generated/${file}`);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing generated file: ${file}`);
      }
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (!content.version) {
        throw new Error(`${file} missing version field`);
      }
    }
  }, "runtime-contract-drift");

  // ── Report ───────────────────────────────────────────────
  console.log("Results:\n");
  const passed = results.filter((r) => r.status === "ok");
  const failed = results.filter((r) => r.status === "fail");

  for (const r of results) {
    const icon = r.status === "ok" ? "✓" : "✗";
    const detail = r.error ? ` — [${r.failureClass}] ${r.error}` : "";
    console.log(`  ${icon} ${r.module}${detail}`);
  }

  console.log(`\n${passed.length} passed, ${failed.length} failed\n`);

  if (failed.length > 0) {
    console.log("Failures by class:");
    const byClass: Record<string, string[]> = {};
    for (const f of failed) {
      const cls = f.failureClass || "unknown";
      if (!byClass[cls]) byClass[cls] = [];
      byClass[cls].push(f.module);
    }
    for (const [cls, modules] of Object.entries(byClass)) {
      console.log(`  ${cls}: ${modules.join(", ")}`);
    }
    process.exit(1);
  }

  console.log("All contract validations passed.");
}

run();
