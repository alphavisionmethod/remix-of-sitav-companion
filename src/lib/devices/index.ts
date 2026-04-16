// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Capability/Trust Layer Barrel
// Canonical import: @/lib/devices
// ═══════════════════════════════════════════════════════════════

export {
  computeDevicePopulationStats,
  filterDevicesByTrust,
  getDevicesByRole,
  getOnlineDevices,
  type DeviceFormFactor,
  type DeviceRole,
  type DeviceOS,
  type DeviceIdentityEntry,
  type DevicePopulationStats,
} from "./device-identity-registry";

export {
  DEVICE_CAPABILITY_REGISTRY,
  getCapabilitiesForFormFactor,
  getCapabilityById,
  getCapabilitiesByCategory,
  getTrustRequiredCapabilities,
  getCapabilityCategories,
  type DetectionMethod,
  type FallbackBehavior,
  type DeviceCapabilityEntry,
} from "./device-capability-registry";

export {
  DEVICE_TRUST_REGISTRY,
  getTrustProfile,
  getTrustPolicy,
  canPerformOperation,
  getMaxAchievableTrust,
  type DataAccessTier,
  type SyncPermission,
  type TrustPolicyEntry,
  type DeviceClassTrustProfile,
} from "./device-trust-registry";

export {
  DEVICE_ATTESTATION_MAP,
  getAttestationProfile,
  getRequiredAttestations,
  isAttestationAvailable,
  type AttestationType,
  type AttestationRequirement,
  type AttestationEntry,
  type DeviceAttestationProfile,
} from "./device-attestation-map";

export {
  ECOSYSTEM_DEVICE_MAP,
  getEcosystemDevice,
  getDevicesBySync,
  getAlwaysOnDevices,
  getFullReplicaDevices,
  type SyncTopology,
  type DataResidency,
  type EcosystemDeviceEntry,
} from "./ecosystem-device-map";

export {
  MOBILE_DEVICE_CAPABILITIES,
  getMobileCapability,
  getIOSCapabilities,
  getAndroidCapabilities,
  getPermissionRequiredCapabilities,
  type MobileCapability,
} from "./mobile-device-capabilities";

export {
  DESKTOP_DEVICE_CAPABILITIES,
  createDefaultDesktopCapabilities,
  getDesktopCapability,
  getElectronOnlyCapabilities,
  getCapabilitiesWithWebFallback,
  getDesktopCapabilitiesByCategory,
  type DesktopCapabilityMeta,
} from "./desktop-device-capabilities";

export {
  APPLIANCE_DEVICE_CAPABILITIES,
  getApplianceCapability,
  getCriticalApplianceCapabilities,
  getApplianceCapabilitiesByCategory,
  type ApplianceCapability,
} from "./appliance-device-capabilities";

export {
  BIOMETRIC_CAPABILITY_MAP,
  getBiometricProfile,
  getPrimaryBiometric,
  getAvailableBiometrics,
  supportsBiometric,
  type BiometricMethod,
  type BiometricAvailability,
  type BiometricMethodEntry,
  type DeviceBiometricProfile,
} from "./biometric-capability-map";
