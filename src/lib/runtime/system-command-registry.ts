// ═══════════════════════════════════════════════════════════════
// SITA OS — System Command Registry
// All system commands with authority requirements
// ═══════════════════════════════════════════════════════════════

export type CommandAuthority = "system" | "admin" | "owner" | "user" | "public";

export interface SystemCommandEntry {
  commandId: string;
  name: string;
  description: string;
  /** Minimum authority level required */
  requiredAuthority: CommandAuthority;
  /** Whether the command requires MFA */
  requiresMFA: boolean;
  /** Minimum trust score */
  minTrustScore: number;
  /** Whether the command produces a proof receipt */
  emitsProof: boolean;
  /** Whether the command requires approval */
  requiresApproval: boolean;
  /** Whether the command is reversible */
  reversible: boolean;
  /** Domain this command belongs to */
  domain: string;
}

export const SYSTEM_COMMANDS: SystemCommandEntry[] = [
  // ── Platform ──
  { commandId: "system.boot", name: "System Boot", description: "Initialize all services", requiredAuthority: "system", requiresMFA: false, minTrustScore: 0, emitsProof: true, requiresApproval: false, reversible: false, domain: "platform" },
  { commandId: "system.shutdown", name: "System Shutdown", description: "Gracefully stop all services", requiredAuthority: "admin", requiresMFA: true, minTrustScore: 0.9, emitsProof: true, requiresApproval: true, reversible: false, domain: "platform" },
  { commandId: "system.safe-mode", name: "Enter Safe Mode", description: "Boot with minimal services", requiredAuthority: "admin", requiresMFA: true, minTrustScore: 0.8, emitsProof: true, requiresApproval: false, reversible: true, domain: "platform" },

  // ── Trust ──
  { commandId: "trust.reset", name: "Reset Trust Score", description: "Reset user trust to baseline", requiredAuthority: "admin", requiresMFA: true, minTrustScore: 0.9, emitsProof: true, requiresApproval: true, reversible: false, domain: "trust" },
  { commandId: "trust.elevate", name: "Elevate Trust", description: "Temporarily elevate trust level", requiredAuthority: "owner", requiresMFA: true, minTrustScore: 0.7, emitsProof: true, requiresApproval: false, reversible: true, domain: "trust" },

  // ── Orchestration ──
  { commandId: "orchestration.emergency-stop", name: "Emergency Stop", description: "Halt all active orchestration", requiredAuthority: "admin", requiresMFA: false, minTrustScore: 0.5, emitsProof: true, requiresApproval: false, reversible: true, domain: "orchestration" },
  { commandId: "orchestration.resume", name: "Resume Orchestration", description: "Resume halted orchestration", requiredAuthority: "admin", requiresMFA: true, minTrustScore: 0.8, emitsProof: true, requiresApproval: true, reversible: true, domain: "orchestration" },

  // ── Data ──
  { commandId: "data.export", name: "Data Export", description: "Export all user data", requiredAuthority: "owner", requiresMFA: true, minTrustScore: 0.8, emitsProof: true, requiresApproval: false, reversible: false, domain: "platform" },
  { commandId: "data.purge", name: "Data Purge", description: "Permanently delete all user data", requiredAuthority: "owner", requiresMFA: true, minTrustScore: 0.95, emitsProof: true, requiresApproval: true, reversible: false, domain: "platform" },

  // ── Recovery ──
  { commandId: "recovery.restart-service", name: "Restart Service", description: "Restart a specific service", requiredAuthority: "admin", requiresMFA: false, minTrustScore: 0.6, emitsProof: true, requiresApproval: false, reversible: true, domain: "platform" },
  { commandId: "recovery.factory-reset", name: "Factory Reset", description: "Reset to factory defaults", requiredAuthority: "admin", requiresMFA: true, minTrustScore: 0.95, emitsProof: true, requiresApproval: true, reversible: false, domain: "platform" },
];

export function getCommand(commandId: string): SystemCommandEntry | undefined {
  return SYSTEM_COMMANDS.find((c) => c.commandId === commandId);
}

export function getCommandsByDomain(domain: string): SystemCommandEntry[] {
  return SYSTEM_COMMANDS.filter((c) => c.domain === domain);
}

export function getCommandsByAuthority(authority: CommandAuthority): SystemCommandEntry[] {
  return SYSTEM_COMMANDS.filter((c) => c.requiredAuthority === authority);
}
