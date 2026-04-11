// ═══════════════════════════════════════════════════════════════
// SITA OS — Security: Three-Layer Capability Permission System
// Layer 1: POSIX DAC | Layer 2: Linux Capabilities | Layer 3: SITA Tokens
// ═══════════════════════════════════════════════════════════════

// ── Layer 1: POSIX DAC ─────────────────────────────────────────

export interface PosixPermission {
  uid: number;
  gid: number;
  mode: number; // Octal: owner(rwx) group(rwx) other(rwx)
}

export function checkPosixAccess(perm: PosixPermission, callerUid: number, callerGid: number, action: "read" | "write" | "execute"): boolean {
  const shift = callerUid === perm.uid ? 6 : callerGid === perm.gid ? 3 : 0;
  const bit = action === "read" ? 4 : action === "write" ? 2 : 1;
  return ((perm.mode >> shift) & bit) !== 0;
}

// ── Layer 2: Linux Capabilities ────────────────────────────────

export type LinuxCapability =
  | "CAP_CHOWN" | "CAP_DAC_OVERRIDE" | "CAP_FOWNER" | "CAP_FSETID"
  | "CAP_KILL" | "CAP_SETGID" | "CAP_SETUID" | "CAP_SETPCAP"
  | "CAP_NET_BIND_SERVICE" | "CAP_NET_RAW" | "CAP_NET_ADMIN"
  | "CAP_SYS_ADMIN" | "CAP_SYS_BOOT" | "CAP_SYS_CHROOT" | "CAP_SYS_NICE"
  | "CAP_SYS_PTRACE" | "CAP_SYS_TIME" | "CAP_IPC_LOCK"
  | "CAP_AUDIT_WRITE" | "CAP_AUDIT_CONTROL" | "CAP_MAC_ADMIN" | "CAP_MAC_OVERRIDE"
  // SITA-specific capabilities
  | "CAP_SITA_EXECUTE" | "CAP_SITA_APPROVE" | "CAP_SITA_RECEIPT"
  | "CAP_SITA_POLICY" | "CAP_SITA_MEMORY" | "CAP_SITA_ATTEST";

export interface CapabilitySet {
  pid: number;
  effective: Set<LinuxCapability>;
  permitted: Set<LinuxCapability>;
  inheritable: Set<LinuxCapability>;
  bounding: Set<LinuxCapability>;
  ambient: Set<LinuxCapability>;
}

// ── Layer 3: SITA Capability Tokens ────────────────────────────

export type TokenScope = "read" | "write" | "execute" | "approve" | "delegate" | "admin";

export interface SitaCapabilityToken {
  id: string;
  principalId: string;
  principalType: "user" | "service" | "device" | "agent";
  capabilityId: string; // From canonical capability registry
  scopes: Set<TokenScope>;
  domain: "finance-os" | "business-os" | "concierge-os" | "platform";
  constraints: {
    maxAmount?: number;
    requiresApproval: boolean;
    approvalThreshold?: "low" | "medium" | "high";
    timeWindowStart?: number;
    timeWindowEnd?: number;
    ipWhitelist?: string[];
    deviceTrustRequired?: "any" | "trusted" | "verified";
  };
  grantedBy: string;
  grantedAt: number;
  expiresAt: number | null;
  revoked: boolean;
  usageCount: number;
  lastUsedAt: number | null;
  proofChainId: string | null;
}

// ── Permission Engine ──────────────────────────────────────────

export class CapabilityPermissionSystem {
  private capSets = new Map<number, CapabilitySet>();
  private tokens = new Map<string, SitaCapabilityToken>();
  private auditLog: PermissionCheckRecord[] = [];

  // ── Layer 2: Linux Capabilities ──────────────────────────────

  createCapabilitySet(pid: number, caps: LinuxCapability[]): CapabilitySet {
    const set: CapabilitySet = {
      pid,
      effective: new Set(caps),
      permitted: new Set(caps),
      inheritable: new Set(),
      bounding: new Set(caps),
      ambient: new Set(),
    };
    this.capSets.set(pid, set);
    return set;
  }

  hasCapability(pid: number, cap: LinuxCapability): boolean {
    const set = this.capSets.get(pid);
    return set?.effective.has(cap) ?? false;
  }

  dropCapability(pid: number, cap: LinuxCapability): boolean {
    const set = this.capSets.get(pid);
    if (!set) return false;
    set.effective.delete(cap);
    set.permitted.delete(cap);
    set.bounding.delete(cap);
    return true;
  }

  // ── Layer 3: SITA Tokens ─────────────────────────────────────

  grantToken(token: Omit<SitaCapabilityToken, "id" | "grantedAt" | "usageCount" | "lastUsedAt" | "revoked">): SitaCapabilityToken {
    const full: SitaCapabilityToken = {
      ...token,
      id: `sita-cap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      grantedAt: Date.now(),
      usageCount: 0,
      lastUsedAt: null,
      revoked: false,
    };
    this.tokens.set(full.id, full);
    return full;
  }

  revokeToken(tokenId: string): boolean {
    const token = this.tokens.get(tokenId);
    if (!token) return false;
    token.revoked = true;
    return true;
  }

  checkToken(tokenId: string, scope: TokenScope, context?: {
    amount?: number;
    deviceTrust?: "any" | "trusted" | "verified";
    timestamp?: number;
  }): { allowed: boolean; reason: string } {
    const token = this.tokens.get(tokenId);
    if (!token) return { allowed: false, reason: "Token not found" };
    if (token.revoked) return { allowed: false, reason: "Token revoked" };
    if (token.expiresAt && Date.now() > token.expiresAt) return { allowed: false, reason: "Token expired" };
    if (!token.scopes.has(scope)) return { allowed: false, reason: `Scope '${scope}' not granted` };

    // Constraint checks
    if (token.constraints.maxAmount && context?.amount && context.amount > token.constraints.maxAmount) {
      return { allowed: false, reason: `Amount ${context.amount} exceeds max ${token.constraints.maxAmount}` };
    }
    if (token.constraints.deviceTrustRequired && token.constraints.deviceTrustRequired !== "any") {
      if (!context?.deviceTrust || context.deviceTrust === "any") {
        return { allowed: false, reason: `Device trust level '${token.constraints.deviceTrustRequired}' required` };
      }
    }

    token.usageCount++;
    token.lastUsedAt = Date.now();
    return { allowed: true, reason: "Authorized" };
  }

  // ── Combined Check ───────────────────────────────────────────

  checkFullPermission(params: {
    pid: number;
    uid: number;
    gid: number;
    resource: { mode: number; uid: number; gid: number };
    action: "read" | "write" | "execute";
    linuxCap?: LinuxCapability;
    sitaTokenId?: string;
    sitaScope?: TokenScope;
    context?: { amount?: number; deviceTrust?: "any" | "trusted" | "verified" };
  }): { allowed: boolean; layer: string; reason: string } {
    // Layer 1: POSIX DAC
    const posixOk = checkPosixAccess(
      { uid: params.resource.uid, gid: params.resource.gid, mode: params.resource.mode },
      params.uid, params.gid, params.action
    );

    // Layer 2: Linux capability override
    const capOverride = params.linuxCap ? this.hasCapability(params.pid, params.linuxCap) : false;

    if (!posixOk && !capOverride) {
      const record = this.logCheck(params.pid, "denied", "posix+cap", "DAC denied and no capability override");
      return { allowed: false, layer: "posix+cap", reason: record.reason };
    }

    // Layer 3: SITA token (if applicable)
    if (params.sitaTokenId && params.sitaScope) {
      const tokenResult = this.checkToken(params.sitaTokenId, params.sitaScope, params.context);
      if (!tokenResult.allowed) {
        this.logCheck(params.pid, "denied", "sita-token", tokenResult.reason);
        return { allowed: false, layer: "sita-token", reason: tokenResult.reason };
      }
    }

    this.logCheck(params.pid, "allowed", "all", "All permission layers passed");
    return { allowed: true, layer: "all", reason: "Authorized" };
  }

  // ── Queries ──────────────────────────────────────────────────

  getTokensForPrincipal(principalId: string): SitaCapabilityToken[] {
    return Array.from(this.tokens.values()).filter(t => t.principalId === principalId && !t.revoked);
  }

  getAuditLog(): PermissionCheckRecord[] { return [...this.auditLog]; }

  getStats() {
    const activeTokens = Array.from(this.tokens.values()).filter(t => !t.revoked);
    return {
      capabilitySets: this.capSets.size,
      totalTokens: this.tokens.size,
      activeTokens: activeTokens.length,
      auditEntries: this.auditLog.length,
      tokensByDomain: activeTokens.reduce((acc, t) => { acc[t.domain] = (acc[t.domain] ?? 0) + 1; return acc; }, {} as Record<string, number>),
    };
  }

  // ── Internal ─────────────────────────────────────────────────

  private logCheck(pid: number, result: "allowed" | "denied", layer: string, reason: string): PermissionCheckRecord {
    const record: PermissionCheckRecord = { pid, result, layer, reason, timestamp: Date.now() };
    this.auditLog.push(record);
    if (this.auditLog.length > 10000) this.auditLog = this.auditLog.slice(-5000);
    return record;
  }
}

interface PermissionCheckRecord {
  pid: number;
  result: "allowed" | "denied";
  layer: string;
  reason: string;
  timestamp: number;
}
