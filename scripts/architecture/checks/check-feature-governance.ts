// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Governance Validation Script
// Checks all registered features for owner boundary compliance,
// intake completeness, spec validation, capability registration
// audit, and schema coverage checks
// ═══════════════════════════════════════════════════════════════

import {
  getAllFeatures,
  validateFeatureMetadata,
  isHighRisk,
  type FeatureMetadata,
} from "../src/packages/feature-governance/index";

import {
  validateOwnerBoundary,
  classifyOwnerBoundary,
  type OwnerBoundaryDeclaration,
  type OwnerValidationContext,
} from "../src/packages/feature-governance/ownership";

import {
  CAPABILITY_CLASSES,
  validateCapabilityRegistration,
  type CapabilityRegistration,
} from "../src/packages/feature-governance/capability-protocol";

import {
  SCHEMA_FAMILIES_BY_RISK_TIER,
  type SchemaFamily,
} from "../src/packages/feature-governance/contract-schema-protocol";

interface GovernanceCheckResult {
  featureId: string;
  metadataErrors: string[];
  ownershipErrors: string[];
  ownershipRejections: string[];
  capabilityAudit: { mapped: number; unmapped: string[] };
  schemaCoverage: { covered: number; required: number; missing: SchemaFamily[] };
  compliant: boolean;
}

function checkAllFeatures(): GovernanceCheckResult[] {
  const features = getAllFeatures();
  const results: GovernanceCheckResult[] = [];

  const context: OwnerValidationContext = {
    existingOwners: features.map(f => f.primaryOwner),
    existingDomains: ["business", "finance", "concierge"],
    brainOwner: "brain-core",
    surfaceFiles: [],
  };

  for (const feature of features) {
    const metadataErrors = validateFeatureMetadata(feature);

    // Build an owner declaration from feature metadata
    const declaration: OwnerBoundaryDeclaration = {
      featureId: feature.featureId,
      primaryOwner: feature.primaryOwner,
      boundaryType: classifyOwnerBoundary(`src/${feature.primaryOwner}`),
      justification: "Registered feature — auto-validated",
      whyNotElsewhere: "Existing registration",
      ownerPreference: "extend-existing",
      secondaryOwners: feature.secondaryOwners,
      touchesTrustBearing: isHighRisk(feature.riskTier),
      extendsExisting: true,
    };

    const { errors: ownerErrors, rejections } = validateOwnerBoundary(declaration, context);

    // Capability audit: check that capabilityIds are non-empty
    const mapped = feature.capabilityIds.length;
    const unmapped: string[] = [];
    if (mapped === 0) {
      unmapped.push(feature.featureId);
    }

    // Schema coverage: check required families for risk tier
    const requiredFamilies = SCHEMA_FAMILIES_BY_RISK_TIER[feature.riskTier];
    const schemaCoverage = {
      covered: 0,
      required: requiredFamilies.length,
      missing: [...requiredFamilies] as SchemaFamily[],
    };

    results.push({
      featureId: feature.featureId,
      metadataErrors,
      ownershipErrors: ownerErrors,
      ownershipRejections: rejections,
      capabilityAudit: { mapped, unmapped },
      schemaCoverage,
      compliant: metadataErrors.length === 0 && ownerErrors.length === 0,
    });
  }

  return results;
}

// ── Main ────────────────────────────────────────────────────

const results = checkAllFeatures();
const total = results.length;
const compliant = results.filter(r => r.compliant).length;
const failing = results.filter(r => !r.compliant);

console.log(`\n═══ Feature Governance Check ═══`);
console.log(`Total features: ${total}`);
console.log(`Compliant: ${compliant}`);
console.log(`Failing: ${failing.length}`);

if (failing.length > 0) {
  console.log(`\n── Failures ──`);
  for (const f of failing) {
    console.log(`\n  ${f.featureId}:`);
    for (const e of f.metadataErrors) console.log(`    [metadata] ${e}`);
    for (const e of f.ownershipErrors) console.log(`    [ownership] ${e}`);
    for (const r of f.ownershipRejections) console.log(`    [rejection] ${r}`);
  }
}

// Capability audit summary
const totalCapabilities = results.reduce((sum, r) => sum + r.capabilityAudit.mapped, 0);
const unmappedFeatures = results.filter(r => r.capabilityAudit.unmapped.length > 0);
console.log(`\n── Capability Audit ──`);
console.log(`Total capability mappings: ${totalCapabilities}`);
console.log(`Features without capabilities: ${unmappedFeatures.length}`);
console.log(`Capability classes available: ${CAPABILITY_CLASSES.length}`);

// Schema coverage summary
console.log(`\n── Schema Coverage ──`);
for (const r of results) {
  console.log(`  ${r.featureId}: ${r.schemaCoverage.covered}/${r.schemaCoverage.required} families covered`);
  if (r.schemaCoverage.missing.length > 0) {
    console.log(`    Missing: ${r.schemaCoverage.missing.join(", ")}`);
  }
}

console.log(`\n═══ Done ═══\n`);
