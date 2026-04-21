// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Bundle Builder (Canonical Unified Builder)
// Fluent builder that assembles domain-specific packs into a
// single support bundle with mandatory redaction enforcement.
// ═══════════════════════════════════════════════════════════════

import type {
  BundlePack,
  BundleType,
  SupportBundle,
  KillSwitchSuggestion,
} from "./support-bundle-contract";
import { resolveExpiryPolicy, computeExpiresAt } from "./support-bundle-expiry-policy";
import { applyRedactionPolicy, verifyRedaction } from "./support-redaction-policy";

let bundleCounter = 0;

function generateBundleId(): string {
  bundleCounter += 1;
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `SB-${ts}-${rand}-${bundleCounter}`;
}

export class SupportBundleBuilder {
  private bundleType: BundleType = "system-wide";
  private sourceDomain = "unknown";
  private sourceEntityIds: string[] = [];
  private packs: BundlePack[] = [];
  private linkedRunbookIds: string[] = [];
  private linkedIncidentIds: string[] = [];
  private killSwitchSuggestions: string[] = [];
  private supportSessionId: string | null = null;

  /** Set the bundle type. */
  type(t: BundleType): this {
    this.bundleType = t;
    return this;
  }

  /** Set the source domain. */
  domain(d: string): this {
    this.sourceDomain = d;
    return this;
  }

  /** Add source entity IDs. */
  entities(...ids: string[]): this {
    this.sourceEntityIds.push(...ids);
    return this;
  }

  /** Add a domain-specific pack. */
  addPack(pack: BundlePack): this {
    this.packs.push(pack);
    return this;
  }

  /** Link runbook IDs. */
  linkRunbooks(...ids: string[]): this {
    this.linkedRunbookIds.push(...ids);
    return this;
  }

  /** Link incident IDs. */
  linkIncidents(...ids: string[]): this {
    this.linkedIncidentIds.push(...ids);
    return this;
  }

  /** Link kill-switch suggestion IDs. */
  linkKillSwitchSuggestions(...ids: string[]): this {
    this.killSwitchSuggestions.push(...ids);
    return this;
  }

  /** Attach to a support session. */
  session(id: string): this {
    this.supportSessionId = id;
    return this;
  }

  /**
   * Build the support bundle.
   * Redaction is enforced: every pack's data is re-redacted if needed.
   */
  build(): SupportBundle {
    const createdAt = new Date().toISOString();
    const expiryPolicy = resolveExpiryPolicy(this.bundleType);
    const expiresAt = computeExpiresAt(createdAt, expiryPolicy);

    // Enforce redaction on every pack
    let totalRedactions = 0;
    const redactedPacks: BundlePack[] = this.packs.map((pack) => {
      if (pack.redactedFields.length > 0) {
        // Already redacted — verify
        const verification = verifyRedaction(pack.data);
        totalRedactions += pack.redactedFields.length;
        if (!verification.clean) {
          // Re-redact
          const { data, redactions } = applyRedactionPolicy(pack.data);
          totalRedactions += redactions.length;
          return { ...pack, data, redactedFields: [...pack.redactedFields, ...redactions] };
        }
        return pack;
      }
      // Not yet redacted — apply
      const { data, redactions } = applyRedactionPolicy(pack.data);
      totalRedactions += redactions.length;
      return { ...pack, data, redactedFields: redactions };
    });

    return {
      bundleId: generateBundleId(),
      bundleType: this.bundleType,
      createdAt,
      expiresAt,
      expiryPolicy,
      sourceDomain: this.sourceDomain,
      sourceEntityIds: [...this.sourceEntityIds],
      redactionStatus: "applied",
      totalRedactions,
      supportSessionId: this.supportSessionId,
      packs: redactedPacks,
      linkedRunbookIds: [...new Set(this.linkedRunbookIds)],
      linkedIncidentIds: [...new Set(this.linkedIncidentIds)],
      linkedKillSwitchSuggestions: [...new Set(this.killSwitchSuggestions)],
      exportSafe: true,
    };
  }
}

/** Convenience: create a new builder. */
export function createSupportBundle(): SupportBundleBuilder {
  return new SupportBundleBuilder();
}