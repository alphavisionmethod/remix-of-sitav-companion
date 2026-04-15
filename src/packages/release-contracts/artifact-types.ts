// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Artifact Types
// Version metadata, bundle metadata, SBOM, signing policy.
// ═══════════════════════════════════════════════════════════════

export interface ReleaseVersionMetadata {
  version: string;
  semver_major: number;
  semver_minor: number;
  semver_patch: number;
  prerelease?: string;
  build_number: number;
  git_sha: string;
  branch: string;
  built_at: string;
  built_by: string;
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
  created_at: string;
}

export interface BundleComponent {
  name: string;
  version: string;
  size_bytes: number;
  hash: string;
  entry_point?: string;
}

export interface SBOMReference {
  sbom_id: string;
  format: "spdx" | "cyclonedx";
  version: string;
  dependencies_count: number;
  vulnerabilities_known: number;
  license_compliant: boolean;
  generated_at: string;
  url?: string;
}

export interface SigningPolicy {
  policy_id: string;
  required_signers: number;
  trusted_signer_ids: string[];
  algorithm: "rsa" | "ecdsa" | "ed25519";
  key_rotation_days: number;
  revocation_check_required: boolean;
  timestamp_required: boolean;
}

export interface ArtifactVerification {
  artifact_id: string;
  bundle_id: string;
  hash_verified: boolean;
  signature_verified: boolean;
  signer_id?: string;
  sbom_verified: boolean;
  verified_at: string;
  issues: string[];
}
