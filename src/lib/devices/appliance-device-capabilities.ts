// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Device Capabilities
// Server/appliance-specific capability declarations
// ═══════════════════════════════════════════════════════════════

export interface ApplianceCapability {
  id: string;
  name: string;
  category: string;
  description: string;
  detectionMethod: string;
  fallback: string;
  criticalForOperation: boolean;
}

export const APPLIANCE_DEVICE_CAPABILITIES: ApplianceCapability[] = [
  { id: "headless-operation", name: "Headless Operation", category: "runtime", description: "No display required — CLI/API only", detectionMethod: "process.env.DISPLAY check", fallback: "none", criticalForOperation: true },
  { id: "fleet-management", name: "Fleet Management", category: "orchestration", description: "Remote device fleet enrollment and control", detectionMethod: "agent heartbeat", fallback: "manual SSH", criticalForOperation: false },
  { id: "ota-update", name: "OTA Updates", category: "lifecycle", description: "Over-the-air firmware/app updates", detectionMethod: "update-agent probe", fallback: "manual update", criticalForOperation: false },
  { id: "hardware-monitoring", name: "Hardware Monitoring", category: "health", description: "CPU, RAM, disk, temperature, fan monitoring", detectionMethod: "sysfs / IPMI probe", fallback: "basic /proc stats", criticalForOperation: true },
  { id: "raid-controller", name: "RAID Controller", category: "storage", description: "Hardware RAID status and management", detectionMethod: "mdadm / vendor CLI", fallback: "software RAID", criticalForOperation: false },
  { id: "ups-detection", name: "UPS Detection", category: "power", description: "Uninterruptible power supply monitoring", detectionMethod: "NUT / apcupsd probe", fallback: "none", criticalForOperation: false },
  { id: "network-bonding", name: "Network Bonding", category: "network", description: "Multi-NIC bonding for redundancy", detectionMethod: "bond interface check", fallback: "single NIC", criticalForOperation: false },
  { id: "tpm-server", name: "Server TPM", category: "security", description: "TPM 2.0 for measured boot and attestation", detectionMethod: "/dev/tpm0 probe", fallback: "software attestation", criticalForOperation: true },
  { id: "ecc-memory", name: "ECC Memory", category: "reliability", description: "Error-correcting memory detection", detectionMethod: "dmidecode", fallback: "none", criticalForOperation: false },
  { id: "ipmi-bmc", name: "IPMI / BMC", category: "management", description: "Out-of-band management controller", detectionMethod: "ipmitool probe", fallback: "SSH only", criticalForOperation: false },
  { id: "container-runtime", name: "Container Runtime", category: "orchestration", description: "Docker / Podman container execution", detectionMethod: "docker info / podman info", fallback: "bare-metal execution", criticalForOperation: false },
  { id: "secure-boot-server", name: "Secure Boot", category: "security", description: "UEFI Secure Boot chain verification", detectionMethod: "mokutil --sb-state", fallback: "log warning", criticalForOperation: true },
];

// ── Queries ──────────────────────────────────────────────────

export function getApplianceCapability(id: string): ApplianceCapability | undefined {
  return APPLIANCE_DEVICE_CAPABILITIES.find(c => c.id === id);
}

export function getCriticalApplianceCapabilities(): ApplianceCapability[] {
  return APPLIANCE_DEVICE_CAPABILITIES.filter(c => c.criticalForOperation);
}

export function getApplianceCapabilitiesByCategory(category: string): ApplianceCapability[] {
  return APPLIANCE_DEVICE_CAPABILITIES.filter(c => c.category === category);
}
