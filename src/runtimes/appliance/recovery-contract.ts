// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Recovery Contract
// ═══════════════════════════════════════════════════════════════

export type RecoveryTrigger =
  | "boot-failure"
  | "service-degraded"
  | "ota-rollback"
  | "owner-initiated"
  | "watchdog-escalation";

export interface RecoveryAction {
  id: string;
  trigger: RecoveryTrigger;
  description: string;
  destructive: boolean;
  requiresOwnerConfirmation: boolean;
  implementationLocation: string | null;
}

export const RECOVERY_ACTIONS: readonly RecoveryAction[] = [
  {
    id: "soft-restart",
    trigger: "service-degraded",
    description: "Restart degraded services without rebooting the host.",
    destructive: false,
    requiresOwnerConfirmation: false,
    implementationLocation: "scripts/release/iso/sita-os.service",
  },
  {
    id: "ota-rollback",
    trigger: "ota-rollback",
    description: "Revert to the previous good appliance image.",
    destructive: false,
    requiresOwnerConfirmation: true,
    implementationLocation: "scripts/release/iso/sita-ota-agent.sh",
  },
  {
    id: "boot-recovery-mode",
    trigger: "boot-failure",
    description: "Boot into recovery shell with read-only data.",
    destructive: false,
    requiresOwnerConfirmation: false,
    implementationLocation: "src/components/sita/boot/BootRecoveryCard.tsx",
  },
  {
    id: "factory-reset",
    trigger: "owner-initiated",
    description: "Wipe appliance and re-run first-boot ceremony.",
    destructive: true,
    requiresOwnerConfirmation: true,
    implementationLocation: "scripts/release/iso/sita-first-boot.sh",
  },
];
