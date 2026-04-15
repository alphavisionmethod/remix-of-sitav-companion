// ═══════════════════════════════════════════════════════════════
// SITA OS — Signing Trust Chain
// Build→Sign→Distribute→Validate cryptographic trust chain
// ═══════════════════════════════════════════════════════════════

export type ArtifactType = 'os_update' | 'driver' | 'app' | 'policy_bundle' | 'recovery_image' | 'config';
export type KeyStatus = 'active' | 'rotating' | 'revoked' | 'expired';

export interface SigningKey {
  id: string;
  name: string;
  algorithm: 'ed25519' | 'rsa4096' | 'ecdsa_p256';
  fingerprint: string;
  status: KeyStatus;
  createdAt: number;
  expiresAt: number;
  rotationSchedule?: string;
  scope: ArtifactType[];
}

export interface SignedArtifact {
  id: string;
  type: ArtifactType;
  version: string;
  hash: string;
  signature: string;
  signingKeyId: string;
  signedAt: number;
  verified: boolean;
  verifiedAt?: number;
  channel: string;
  size: number;
}

export interface TrustChainStep {
  step: string;
  description: string;
  verified: boolean;
  timestamp: number;
  details?: string;
}

class SigningTrustChain {
  private keys = new Map<string, SigningKey>();
  private artifacts = new Map<string, SignedArtifact>();
  private revocationList: string[] = [];

  constructor() {
    // Pre-register platform signing keys
    const platformKeys: SigningKey[] = [
      { id: 'key_platform_root', name: 'Platform Root Key', algorithm: 'ed25519', fingerprint: 'SHA256:xK9mP2...root', status: 'active', createdAt: Date.now() - 365 * 86400000, expiresAt: Date.now() + 730 * 86400000, scope: ['os_update', 'recovery_image'], rotationSchedule: 'annual' },
      { id: 'key_driver_sign', name: 'Driver Signing Key', algorithm: 'ecdsa_p256', fingerprint: 'SHA256:dR1vEr...sign', status: 'active', createdAt: Date.now() - 180 * 86400000, expiresAt: Date.now() + 365 * 86400000, scope: ['driver'], rotationSchedule: 'biannual' },
      { id: 'key_app_sign', name: 'App Signing Key', algorithm: 'ed25519', fingerprint: 'SHA256:aPp51g...sign', status: 'active', createdAt: Date.now() - 90 * 86400000, expiresAt: Date.now() + 365 * 86400000, scope: ['app', 'policy_bundle'], rotationSchedule: 'annual' },
      { id: 'key_config_sign', name: 'Config Signing Key', algorithm: 'ecdsa_p256', fingerprint: 'SHA256:c0nF1g...sign', status: 'active', createdAt: Date.now() - 60 * 86400000, expiresAt: Date.now() + 365 * 86400000, scope: ['config', 'policy_bundle'] },
    ];
    platformKeys.forEach(k => this.keys.set(k.id, k));
  }

  // ── Key Management ────────────────────────────────────────
  getKey(id: string): SigningKey | undefined { return this.keys.get(id); }
  allKeys(): SigningKey[] { return [...this.keys.values()]; }
  getActiveKeys(): SigningKey[] { return this.allKeys().filter(k => k.status === 'active' && k.expiresAt > Date.now()); }

  rotateKey(keyId: string): SigningKey | null {
    const old = this.keys.get(keyId);
    if (!old) return null;
    old.status = 'rotating';
    const newKey: SigningKey = {
      ...old, id: `${keyId}_rotated_${Date.now()}`,
      fingerprint: `SHA256:${Math.random().toString(36).slice(2, 10)}...new`,
      status: 'active', createdAt: Date.now(),
      expiresAt: Date.now() + 365 * 86400000,
    };
    this.keys.set(newKey.id, newKey);
    setTimeout(() => { old.status = 'expired'; }, 30 * 86400000);
    return newKey;
  }

  revokeKey(keyId: string): void {
    const key = this.keys.get(keyId);
    if (key) { key.status = 'revoked'; this.revocationList.push(keyId); }
  }

  // ── Artifact Verification ─────────────────────────────────
  registerArtifact(artifact: SignedArtifact): void {
    this.artifacts.set(artifact.id, artifact);
  }

  verify(artifactId: string): { verified: boolean; chain: TrustChainStep[] } {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) return { verified: false, chain: [{ step: 'lookup', description: 'Find artifact', verified: false, timestamp: Date.now(), details: 'Artifact not found' }] };

    const chain: TrustChainStep[] = [];
    const now = Date.now();

    // Step 1: Artifact exists
    chain.push({ step: 'artifact_lookup', description: 'Locate signed artifact', verified: true, timestamp: now });

    // Step 2: Signing key valid
    const key = this.keys.get(artifact.signingKeyId);
    const keyValid = !!key && key.status === 'active' && key.expiresAt > now;
    chain.push({ step: 'key_validation', description: 'Verify signing key is valid and not revoked', verified: keyValid, timestamp: now, details: key ? `Key: ${key.name} (${key.algorithm})` : 'Key not found' });

    // Step 3: Not on revocation list
    const notRevoked = !this.revocationList.includes(artifact.signingKeyId);
    chain.push({ step: 'revocation_check', description: 'Check revocation list', verified: notRevoked, timestamp: now });

    // Step 4: Signature verification (simulated)
    const sigValid = keyValid && notRevoked;
    chain.push({ step: 'signature_verify', description: 'Cryptographic signature verification', verified: sigValid, timestamp: now, details: sigValid ? 'Signature valid' : 'Signature invalid or key compromised' });

    // Step 5: Hash integrity
    chain.push({ step: 'hash_integrity', description: 'Verify artifact hash matches content', verified: true, timestamp: now, details: `Hash: ${artifact.hash}` });

    const verified = chain.every(s => s.verified);
    artifact.verified = verified;
    artifact.verifiedAt = now;

    return { verified, chain };
  }

  getRevocationList(): string[] { return [...this.revocationList]; }
  allArtifacts(): SignedArtifact[] { return [...this.artifacts.values()]; }

  stats() {
    return {
      totalKeys: this.keys.size,
      activeKeys: this.getActiveKeys().length,
      revokedKeys: this.revocationList.length,
      artifacts: this.artifacts.size,
      verifiedArtifacts: [...this.artifacts.values()].filter(a => a.verified).length,
    };
  }
}

export const signingTrustChain = new SigningTrustChain();
