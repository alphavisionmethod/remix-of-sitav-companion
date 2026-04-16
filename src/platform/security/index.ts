// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Barrel: Security
// Canonical import: @/platform/security
// ═══════════════════════════════════════════════════════════════

export * from "@/hooks/use-security-fabric";
export * from "@/hooks/useOSSecurity";

// Advanced Hardening — AI Leak Prevention & Session Security
export {
  scanAIOutput,
  getFirewallStatus,
  generateCanaryToken,
  getCanaryToken,
} from "@/lib/core-services/security/ai-output-firewall";
export {
  initSessionThreatDetector,
  assessThreat,
  getDetectorStatus,
  getDeviceFingerprint,
} from "@/lib/core-services/security/session-threat-detector";
export {
  vaultStore,
  vaultRetrieve,
  vaultDestroy,
  vaultPurge,
  initSecureVault,
  getVaultStatus,
  createSecretProxy,
} from "@/lib/core-services/security/secure-memory-vault";
