// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance First-Boot Contract
// ═══════════════════════════════════════════════════════════════

export type FirstBootPhase =
  | "hardware-detection"
  | "secure-init-ceremony"
  | "network-bootstrap"
  | "runtime-services-start"
  | "first-user-handoff";

export interface FirstBootStep {
  phase: FirstBootPhase;
  ordinal: number;
  description: string;
  required: boolean;
  rollbackCapable: boolean;
  /** Where the implementation lives (or `null` if simulated UX only). */
  implementationLocation: string | null;
}

export const FIRST_BOOT_SEQUENCE: readonly FirstBootStep[] = [
  {
    phase: "hardware-detection",
    ordinal: 1,
    description: "Probe CPU/RAM/disk and verify minimum spec.",
    required: true,
    rollbackCapable: false,
    implementationLocation: "src/components/sita/boot/HardwareDetectionPanel.tsx",
  },
  {
    phase: "secure-init-ceremony",
    ordinal: 2,
    description: "Generate appliance keys and bind owner identity.",
    required: true,
    rollbackCapable: true,
    implementationLocation: "src/components/sita/boot/SecureInitCeremony.tsx",
  },
  {
    phase: "network-bootstrap",
    ordinal: 3,
    description: "Configure network, DNS, and outbound trust list.",
    required: true,
    rollbackCapable: true,
    implementationLocation: null,
  },
  {
    phase: "runtime-services-start",
    ordinal: 4,
    description: "Bring up Supabase stack, edge runtime, OTA agent, watchdog.",
    required: true,
    rollbackCapable: true,
    implementationLocation: null,
  },
  {
    phase: "first-user-handoff",
    ordinal: 5,
    description: "Hand control to the first owner with a recovery code.",
    required: true,
    rollbackCapable: false,
    implementationLocation: "src/components/sita/boot/BootHandoffTransition.tsx",
  },
];
