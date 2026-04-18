// ═══════════════════════════════════════════════════════════════
// SITA OS — Security: Sandbox Engine
// 5-ring trust model, Seccomp-BPF, namespace isolation, Landlock
// ═══════════════════════════════════════════════════════════════

// ── Trust Rings ────────────────────────────────────────────────

export enum TrustRing {
  KERNEL    = 0, // Kernel-space only: scheduler, VMM, interrupt dispatch
  TRUSTED   = 1, // Signed SITA services: executor, receipt, policy
  VERIFIED  = 2, // Third-party signed apps with full review
  SANDBOXED = 3, // Third-party apps with restricted sandbox
  UNTRUSTED = 4, // Unknown/unsigned code — maximum restriction
}

export const RING_CONFIG: Record<TrustRing, {
  label: string;
  allowedSyscalls: number[];  // Syscall numbers from SYSCALL_TABLE
  maxFileDescriptors: number;
  maxMemoryMB: number;
  networkAccess: "full" | "localhost" | "none";
  filesystemScope: "full" | "app-private" | "none";
  canSpawnProcesses: boolean;
  canAccessHardware: boolean;
}> = {
  [TrustRing.KERNEL]: {
    label: "Kernel", allowedSyscalls: [], // All allowed
    maxFileDescriptors: -1, maxMemoryMB: -1,
    networkAccess: "full", filesystemScope: "full",
    canSpawnProcesses: true, canAccessHardware: true,
  },
  [TrustRing.TRUSTED]: {
    label: "Trusted",
    allowedSyscalls: Array.from({ length: 126 }, (_, i) => i), // All except hardware
    maxFileDescriptors: 4096, maxMemoryMB: 4096,
    networkAccess: "full", filesystemScope: "full",
    canSpawnProcesses: true, canAccessHardware: false,
  },
  [TrustRing.VERIFIED]: {
    label: "Verified",
    allowedSyscalls: [0,1,2,3,5,6,7,9,10,11,12, 20,21,22,23,26,27, 40,41,42,43,44,45,46,55,59,61,62,64,65, 70,71,72,73,74,76,77,79,80,81,82,83,84, 120,123,124,125],
    maxFileDescriptors: 1024, maxMemoryMB: 2048,
    networkAccess: "full", filesystemScope: "app-private",
    canSpawnProcesses: true, canAccessHardware: false,
  },
  [TrustRing.SANDBOXED]: {
    label: "Sandboxed",
    allowedSyscalls: [1,2,3,5,6,10,11,12, 20,21,23,26, 40,41,42,43,44,45,55,59,61, 79,80,84],
    maxFileDescriptors: 256, maxMemoryMB: 512,
    networkAccess: "localhost", filesystemScope: "app-private",
    canSpawnProcesses: false, canAccessHardware: false,
  },
  [TrustRing.UNTRUSTED]: {
    label: "Untrusted",
    allowedSyscalls: [1,3,5,6,12, 42,43,44,59],
    maxFileDescriptors: 64, maxMemoryMB: 128,
    networkAccess: "none", filesystemScope: "none",
    canSpawnProcesses: false, canAccessHardware: false,
  },
};

// ── Seccomp-BPF Filter ────────────────────────────────────────

export interface SeccompProfile {
  id: string;
  pid: number;
  ring: TrustRing;
  allowedSyscalls: Set<number>;
  deniedSyscalls: Set<number>;
  defaultAction: "allow" | "deny" | "log" | "trap";
  violations: SeccompViolation[];
}

export interface SeccompViolation {
  timestamp: number;
  pid: number;
  syscallNumber: number;
  syscallName: string;
  action: "denied" | "logged" | "trapped";
}

// ── Namespace Isolation ────────────────────────────────────────

export type NamespaceType = "pid" | "net" | "mnt" | "user" | "uts" | "ipc" | "cgroup";

export interface NamespaceConfig {
  id: string;
  pid: number;
  namespaces: Set<NamespaceType>;
  privateTmp: boolean;
  privateHome: string;
  readOnlyPaths: string[];
  hiddenPaths: string[];
}

// ── Landlock Rules ─────────────────────────────────────────────

export interface LandlockRule {
  id: string;
  type: "fs-read" | "fs-write" | "fs-execute" | "fs-make-dir" | "net-bind" | "net-connect";
  path?: string;
  port?: number;
  allowed: boolean;
}

export interface LandlockRuleset {
  id: string;
  pid: number;
  rules: LandlockRule[];
  enforced: boolean;
}

// ── Sandbox Engine ─────────────────────────────────────────────

export class SandboxEngine {
  private profiles = new Map<number, SeccompProfile>();
  private namespaces = new Map<number, NamespaceConfig>();
  private landlockRulesets = new Map<number, LandlockRuleset>();
  private violationLog: SeccompViolation[] = [];

  // ── Profile Management ───────────────────────────────────────

  createProfile(pid: number, ring: TrustRing): SeccompProfile {
    const config = RING_CONFIG[ring];
    const profile: SeccompProfile = {
      id: `seccomp-${pid}`,
      pid, ring,
      allowedSyscalls: new Set(config.allowedSyscalls),
      deniedSyscalls: new Set(),
      defaultAction: ring === TrustRing.KERNEL ? "allow" : "deny",
      violations: [],
    };
    this.profiles.set(pid, profile);
    return profile;
  }

  // ── Syscall Check ────────────────────────────────────────────

  checkSyscall(pid: number, syscallNumber: number, syscallName: string): {
    allowed: boolean;
    action: "allow" | "deny" | "log" | "trap";
  } {
    const profile = this.profiles.get(pid);
    if (!profile) return { allowed: true, action: "allow" }; // No profile = kernel

    if (profile.ring === TrustRing.KERNEL) return { allowed: true, action: "allow" };

    if (profile.deniedSyscalls.has(syscallNumber)) {
      this.recordViolation(pid, syscallNumber, syscallName, "denied");
      return { allowed: false, action: "deny" };
    }

    if (profile.allowedSyscalls.has(syscallNumber)) {
      return { allowed: true, action: "allow" };
    }

    // Not in allowlist — apply default action
    const action = profile.defaultAction;
    if (action === "deny" || action === "trap") {
      this.recordViolation(pid, syscallNumber, syscallName, action === "trap" ? "trapped" : "denied");
    }
    return { allowed: action === "allow" || action === "log", action };
  }

  // ── Namespace Isolation ──────────────────────────────────────

  isolate(pid: number, ring: TrustRing): NamespaceConfig {
    const nsTypes: Set<NamespaceType> = new Set();
    if (ring >= TrustRing.VERIFIED) nsTypes.add("pid").add("mnt").add("ipc");
    if (ring >= TrustRing.SANDBOXED) nsTypes.add("net").add("user").add("cgroup");
    if (ring >= TrustRing.UNTRUSTED) nsTypes.add("uts");

    const ns: NamespaceConfig = {
      id: `ns-${pid}`,
      pid,
      namespaces: nsTypes,
      privateTmp: ring >= TrustRing.VERIFIED,
      privateHome: ring >= TrustRing.SANDBOXED ? `/sandbox/${pid}/home` : `/home/app-${pid}`,
      readOnlyPaths: ring >= TrustRing.SANDBOXED ? ["/usr", "/lib", "/bin", "/etc"] : [],
      hiddenPaths: ring >= TrustRing.UNTRUSTED ? ["/proc/kcore", "/sys/firmware", "/dev/mem"] : [],
    };
    this.namespaces.set(pid, ns);
    return ns;
  }

  // ── Landlock ─────────────────────────────────────────────────

  createLandlock(pid: number, rules: Omit<LandlockRule, "id">[]): LandlockRuleset {
    const ruleset: LandlockRuleset = {
      id: `landlock-${pid}`,
      pid,
      rules: rules.map((r, i) => ({ ...r, id: `lr-${pid}-${i}` })),
      enforced: false,
    };
    this.landlockRulesets.set(pid, ruleset);
    return ruleset;
  }

  enforceLandlock(pid: number): boolean {
    const ruleset = this.landlockRulesets.get(pid);
    if (!ruleset) return false;
    ruleset.enforced = true;
    return true;
  }

  checkLandlock(pid: number, type: LandlockRule["type"], resource: string): boolean {
    const ruleset = this.landlockRulesets.get(pid);
    if (!ruleset || !ruleset.enforced) return true; // No rules = allow

    const matching = ruleset.rules.filter(r => r.type === type);
    if (matching.length === 0) return false; // No matching rules = deny by default

    return matching.some(r => {
      if (r.path && resource.startsWith(r.path)) return r.allowed;
      if (r.port && parseInt(resource) === r.port) return r.allowed;
      return false;
    });
  }

  // ── Queries ──────────────────────────────────────────────────

  getProfile(pid: number): SeccompProfile | undefined { return this.profiles.get(pid); }
  getNamespace(pid: number): NamespaceConfig | undefined { return this.namespaces.get(pid); }
  getViolations(): SeccompViolation[] { return [...this.violationLog]; }

  getStats() {
    const byRing: Record<string, number> = {};
    for (const p of this.profiles.values()) {
      const label = RING_CONFIG[p.ring].label;
      byRing[label] = (byRing[label] ?? 0) + 1;
    }
    return {
      totalProfiles: this.profiles.size,
      totalNamespaces: this.namespaces.size,
      totalLandlockRulesets: this.landlockRulesets.size,
      totalViolations: this.violationLog.length,
      byRing,
    };
  }

  // ── Internal ─────────────────────────────────────────────────

  private recordViolation(pid: number, syscallNumber: number, syscallName: string, action: SeccompViolation["action"]): void {
    const v: SeccompViolation = { timestamp: Date.now(), pid, syscallNumber, syscallName, action };
    this.violationLog.push(v);
    const profile = this.profiles.get(pid);
    if (profile) profile.violations.push(v);
    if (this.violationLog.length > 10000) this.violationLog = this.violationLog.slice(-5000);
  }
}
