// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Artifact Types (Fully Advanced)
// Version metadata, bundle metadata, SBOM, signing policy,
// provenance, attestation, supply chain integrity.
// ═══════════════════════════════════════════════════════════════

export interface ReleaseVersionMetadata {
  version: string;
  semver_major: number;
  semver_minor: number;
  semver_patch: number;
  prerelease?: string;
  build_metadata?: string;
  build_number: number;
  git_sha: string;
  git_sha_short: string;
  branch: string;
  tag?: string;
  built_at: string;
  built_by: string;
  build_environment: BuildEnvironment;
  changelog_url?: string;
  release_notes_url?: string;
}

export interface BuildEnvironment {
  ci_system: string;
  ci_run_id: string;
  node_version: string;
  os: string;
  arch: string;
  env_hash: string;
  reproducible: boolean;
}

export interface ReleaseBundleMetadata {
  bundle_id: string;
  version: string;
  components: BundleComponent[];
  total_size_bytes: number;
  compressed_size_bytes: number;
  hash_algorithm: "sha256" | "sha384" | "sha512";
  hash: string;
  signature?: string;
  provenance: ArtifactProvenance;
  created_at: string;
  expires_at?: string;
}

export interface BundleComponent {
  name: string;
  version: string;
  size_bytes: number;
  compressed_size_bytes: number;
  hash: string;
  entry_point?: string;
  chunk_count?: number;
  tree_shaken: boolean;
  source_map_available: boolean;
}

export interface ArtifactProvenance {
  provenance_id: string;
  builder: string;
  source_repo: string;
  source_ref: string;
  build_invocation_id: string;
  materials: ProvenanceMaterial[];
  verified: boolean;
  verification_method: string;
}

export interface ProvenanceMaterial {
  uri: string;
  digest: Record<string, string>;
  type: "source" | "dependency" | "tool" | "config";
}

export interface SBOMReference {
  sbom_id: string;
  format: "spdx" | "cyclonedx";
  spec_version: string;
  version: string;
  dependencies_count: number;
  direct_dependencies_count: number;
  transitive_dependencies_count: number;
  vulnerabilities_known: number;
  vulnerabilities_critical: number;
  vulnerabilities_high: number;
  license_compliant: boolean;
  license_violations: LicenseViolation[];
  generated_at: string;
  url?: string;
}

export interface LicenseViolation {
  package_name: string;
  license: string;
  violation_type: "incompatible" | "unknown" | "copyleft_in_proprietary";
  severity: "blocker" | "warning";
}

export interface SigningPolicy {
  policy_id: string;
  name: string;
  required_signers: number;
  trusted_signer_ids: string[];
  algorithm: "rsa" | "ecdsa" | "ed25519";
  min_key_strength: number;
  key_rotation_days: number;
  revocation_check_required: boolean;
  timestamp_required: boolean;
  timestamp_authority?: string;
  transparency_log_required: boolean;
  transparency_log_url?: string;
  attestation_required: boolean;
}

export interface ArtifactVerification {
  artifact_id: string;
  bundle_id: string;
  hash_verified: boolean;
  signature_verified: boolean;
  signer_id?: string;
  signer_identity_verified: boolean;
  sbom_verified: boolean;
  provenance_verified: boolean;
  transparency_log_verified: boolean;
  attestations_verified: AttestationResult[];
  supply_chain_score: number;
  verified_at: string;
  issues: VerificationIssue[];
}

export interface AttestationResult {
  attestation_type: string;
  verified: boolean;
  verifier: string;
  detail?: string;
}

export interface VerificationIssue {
  issue_id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: "hash" | "signature" | "sbom" | "provenance" | "attestation" | "supply_chain";
  description: string;
  remediation?: string;
}
