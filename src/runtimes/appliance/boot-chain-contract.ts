// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Boot Chain Contract
// Typed declaration of the full boot chain from firmware to shell.
// Honesty: Ubuntu is the host OS substrate.
// ═══════════════════════════════════════════════════════════════

export type BootStageOwner = "firmware" | "ubuntu-substrate" | "sita-os" | "sita-shell";

export interface BootChainStage {
  ordinal: number;
  stageId: string;
  name: string;
  owner: BootStageOwner;
  description: string;
  /** Where on disk or in the system this stage lives. */
  implementationLocation: string | null;
  /** Is this stage implemented today? */
  implemented: boolean;
  /** Can this stage fail gracefully? */
  failureSafe: boolean;
  /** Recovery path on failure. */
  recoveryAction: string;
  /** Honest note about substrate ownership. */
  honestyNote?: string;
}

export const BOOT_CHAIN_STAGES: readonly BootChainStage[] = [
  {
    ordinal: 0,
    stageId: "firmware-post",
    name: "Firmware POST",
    owner: "firmware",
    description: "Hardware power-on self-test. Owned by hypervisor/BIOS — outside SITA control.",
    implementationLocation: null,
    implemented: false,
    failureSafe: false,
    recoveryAction: "Hardware/hypervisor troubleshooting required.",
    honestyNote: "SITA does not own firmware. VMware/KVM/bare-metal BIOS is the host.",
  },
  {
    ordinal: 1,
    stageId: "bootloader",
    name: "GRUB Bootloader",
    owner: "ubuntu-substrate",
    description: "GRUB loads the Ubuntu kernel. Configured via autoinstall seed.",
    implementationLocation: "scripts/release/iso/sita-autoinstall.yaml",
    implemented: true,
    failureSafe: false,
    recoveryAction: "Boot from recovery ISO.",
    honestyNote: "Standard Ubuntu GRUB — not a custom bootloader.",
  },
  {
    ordinal: 2,
    stageId: "kernel-init",
    name: "Linux Kernel Init",
    owner: "ubuntu-substrate",
    description: "Ubuntu kernel initializes, mounts root filesystem.",
    implementationLocation: null,
    implemented: true,
    failureSafe: false,
    recoveryAction: "Boot into recovery mode (GRUB advanced options).",
    honestyNote: "Stock Ubuntu kernel — bespoke kernel is roadmap.",
  },
  {
    ordinal: 3,
    stageId: "systemd-init",
    name: "systemd Init",
    owner: "ubuntu-substrate",
    description: "systemd starts as PID 1, begins service ordering.",
    implementationLocation: null,
    implemented: true,
    failureSafe: true,
    recoveryAction: "systemd emergency shell.",
  },
  {
    ordinal: 4,
    stageId: "sita-os-service",
    name: "sita-os.service",
    owner: "sita-os",
    description: "Primary SITA service unit. Starts Supabase stack, edge runtime, watchdog.",
    implementationLocation: "scripts/release/iso/sita-os.service",
    implemented: true,
    failureSafe: true,
    recoveryAction: "systemctl restart sita-os.service or enter recovery mode.",
  },
  {
    ordinal: 5,
    stageId: "first-boot-ceremony",
    name: "First-Boot Ceremony",
    owner: "sita-os",
    description: "One-time appliance initialization: keys, network, owner binding.",
    implementationLocation: "scripts/release/iso/sita-first-boot.sh",
    implemented: true,
    failureSafe: true,
    recoveryAction: "Re-run first-boot via factory reset.",
  },
  {
    ordinal: 6,
    stageId: "runtime-services",
    name: "Runtime Services Start",
    owner: "sita-os",
    description: "Supabase, edge runtime, OTA agent, health watchdog.",
    implementationLocation: "scripts/release/iso/sita-os.service",
    implemented: true,
    failureSafe: true,
    recoveryAction: "Restart individual services or full sita-os.service.",
  },
  {
    ordinal: 7,
    stageId: "shell-handoff",
    name: "Shell Handoff",
    owner: "sita-shell",
    description: "Web UI becomes available. Owner accesses via browser.",
    implementationLocation: "src/components/sita/ShellLayout.tsx",
    implemented: true,
    failureSafe: true,
    recoveryAction: "Shell failure does not collapse runtime services. Restart nginx/web server.",
  },
] as const;

export function getBootStage(stageId: string): BootChainStage | undefined {
  return BOOT_CHAIN_STAGES.find((s) => s.stageId === stageId);
}

export function getBootChainLength(): number {
  return BOOT_CHAIN_STAGES.length;
}

/** Are all SITA-owned stages implemented? */
export function isSitaBootChainComplete(): boolean {
  return BOOT_CHAIN_STAGES
    .filter((s) => s.owner === "sita-os" || s.owner === "sita-shell")
    .every((s) => s.implemented);
}

/** Does shell failure collapse the runtime? */
export function isShellFailureIsolated(): boolean {
  const shell = BOOT_CHAIN_STAGES.find((s) => s.stageId === "shell-handoff");
  return shell?.failureSafe ?? false;
}