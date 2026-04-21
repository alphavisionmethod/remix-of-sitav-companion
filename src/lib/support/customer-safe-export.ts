// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer-Safe Export
// Strips internal-only content, enforces redaction, and labels
// omissions for customer-facing diagnostics delivery.
// ═══════════════════════════════════════════════════════════════

import type { SupportBundle, BundlePack } from "./support-bundle-contract";
import { applyRedactionPolicy, verifyRedaction } from "./support-redaction-policy";
import { isBundleExpired } from "./support-bundle-expiry-policy";

/** Internal-only pack types stripped from customer exports. */
const INTERNAL_ONLY_PACKS = new Set([
  "admin-operator-state",
  "security-audit",
  "kill-switch-state",
  "internal-metrics",
  "agent-memory",
]);

/** Internal-only data keys stripped from remaining packs. */
const INTERNAL_ONLY_KEYS = new Set([
  "internalNotes",
  "operatorOverrides",
  "debugTrace",
  "adminContext",
  "securityFlags",
  "rawSqlDiagnostics",
]);

export interface CustomerSafeExport {
  readonly bundleId: string;
  readonly bundleType: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly packs: readonly BundlePack[];
  readonly omittedPackTypes: readonly string[];
  readonly omittedFieldCount: number;
  readonly redactionVerified: boolean;
  readonly traceId: string;
}

/**
 * Transform a SupportBundle into a customer-safe export.
 * - Strips internal-only packs
 * - Removes internal-only keys from remaining pack data
 * - Re-applies redaction and verifies cleanliness
 * - Rejects expired bundles
 */
export function exportForCustomer(bundle: SupportBundle): CustomerSafeExport | { error: string } {
  if (isBundleExpired(bundle.expiresAt)) {
    return { error: "Bundle has expired and cannot be exported" };
  }

  const omittedPackTypes: string[] = [];
  let omittedFieldCount = 0;

  const safePacks: BundlePack[] = [];
  for (const pack of bundle.packs) {
    if (INTERNAL_ONLY_PACKS.has(pack.packType)) {
      omittedPackTypes.push(pack.packType);
      continue;
    }

    // Strip internal-only keys
    const cleanedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(pack.data)) {
      if (INTERNAL_ONLY_KEYS.has(key)) {
        omittedFieldCount += 1;
        continue;
      }
      cleanedData[key] = value;
    }

    // Re-apply redaction
    const { data, redactions } = applyRedactionPolicy(cleanedData);
    safePacks.push({
      ...pack,
      data,
      redactedFields: [...pack.redactedFields, ...redactions],
    });
  }

  // Final verification
  let allClean = true;
  for (const pack of safePacks) {
    const { clean } = verifyRedaction(pack.data);
    if (!clean) { allClean = false; break; }
  }

  return {
    bundleId: bundle.bundleId,
    bundleType: bundle.bundleType,
    createdAt: bundle.createdAt,
    expiresAt: bundle.expiresAt,
    packs: safePacks,
    omittedPackTypes,
    omittedFieldCount,
    redactionVerified: allClean,
    traceId: bundle.bundleId,
  };
}