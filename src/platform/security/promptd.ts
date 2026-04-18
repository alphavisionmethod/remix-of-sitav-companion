// ═══════════════════════════════════════════════════════════════
// SITA OS — promptd: Trusted Prompt Daemon
// Non-spoofable privilege elevation prompts, risk-aware messaging,
// state machine, rate limiting, accessibility, remember policy
// ═══════════════════════════════════════════════════════════════

import {
  type PromptState, type TrustedPromptConfig, type TrustedPromptResult,
  type OSAuthMethod, type AuditSeverity, type ElevationRequest,
} from "./types";
import { getAuditDaemon } from "./auditd";

// ── Risk-Aware Message Templates ────────────────────────────

const RISK_MESSAGES: Record<string, { title: string; body: string; risk: string; alternative?: string }> = {
  "shield.firewall.disable": {
    title: "Disable Firewall Protection",
    body: "Administrator approval is required to disable Firewall protection.",
    risk: "Disabling the firewall removes network-level protection. Your device will be exposed to unsolicited inbound connections.",
    alternative: "Consider adding a specific firewall rule instead of disabling the entire firewall.",
  },
  "cert.install.system": {
    title: "Install System Certificate",
    body: "Installing a root certificate can affect all secure connections on this device.",
    risk: "A malicious root certificate could allow an attacker to intercept encrypted traffic (HTTPS, TLS).",
  },
  "shield.vpn.configure": {
    title: "Configure VPN",
    body: "VPN configuration changes require administrator approval.",
    risk: "Incorrect VPN settings could expose network traffic or route data through untrusted servers.",
  },
  "secrets.read.vpn": {
    title: "Access VPN Private Key",
    body: "A service is requesting access to a VPN private key.",
    risk: "Private keys provide identity authentication. Unauthorized access could allow impersonation.",
  },
  "security.baseline.change": {
    title: "Change Security Baseline",
    body: "Modifying the security baseline affects all system protections.",
    risk: "Weakening the security baseline may expose the system to known attack vectors.",
  },
  "user.manage": {
    title: "Manage User Accounts",
    body: "User account management requires administrator privileges.",
    risk: "Account changes affect system access and data ownership.",
  },
  "user.promote": {
    title: "Grant Administrator Access",
    body: "Promoting a user to administrator grants full system privileges.",
    risk: "Administrators can modify security settings, access all data, and install system software.",
  },
};

function getDefaultMessage(action: string): { title: string; body: string; risk: string } {
  return {
    title: "Administrator Approval Required",
    body: `The action "${action}" requires elevated privileges.`,
    risk: "This action may affect system security or configuration.",
  };
}

// ── Prompt Entry ────────────────────────────────────────────

interface PromptEntry {
  config: TrustedPromptConfig;
  state: PromptState;
  createdAt: number;
  resolvedAt?: number;
  timeoutHandle?: ReturnType<typeof setTimeout>;
  resolve?: (result: TrustedPromptResult) => void;
}

// ── Remember Cache ──────────────────────────────────────────

interface RememberedApproval {
  action: string;
  userId: string;
  method: OSAuthMethod;
  expiresAt: number;
}

// ── PromptD Service ─────────────────────────────────────────

export class PromptDaemon {
  private prompts: Map<string, PromptEntry> = new Map();
  private history: TrustedPromptResult[] = [];
  private rememberedApprovals: RememberedApproval[] = [];
  private rateLimiter: Map<string, number[]> = new Map(); // userId -> timestamps
  private maxPromptsPerMinute = 5;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  // ── Create Prompt from Elevation Request ────────────────

  createPrompt(elevationRequest: ElevationRequest, sessionType: "local" | "remote" = "local"): TrustedPromptConfig {
    const msgTemplate = RISK_MESSAGES[elevationRequest.action] || getDefaultMessage(elevationRequest.action);

    const config: TrustedPromptConfig = {
      promptId: crypto.randomUUID(),
      requester: elevationRequest.requesterApp || "System",
      action: elevationRequest.action,
      riskLevel: elevationRequest.riskLevel,
      messaging: {
        title: msgTemplate.title,
        body: msgTemplate.body,
        riskExplanation: msgTemplate.risk,
        safeAlternative: (msgTemplate as any).alternative,
      },
      supportedAuthMethods: ["password", "pin", "biometric", "security-key"],
      timeoutMs: elevationRequest.riskLevel === "critical" ? 30000 : 60000,
      rememberAllowed: elevationRequest.riskLevel !== "critical",
      rememberMaxMinutes: elevationRequest.riskLevel === "high" ? 5 : 15,
      screenReaderLabels: {
        promptRole: "Security approval dialog",
        actionDescription: `Approve ${msgTemplate.title}`,
        approveButton: "Approve with authentication",
        denyButton: "Deny and cancel",
      },
      remoteSessionRestricted: sessionType === "remote" && elevationRequest.riskLevel === "critical",
    };

    return config;
  }

  // ── Enqueue Prompt ──────────────────────────────────────

  async enqueuePrompt(config: TrustedPromptConfig, userId: string): Promise<TrustedPromptResult> {
    // Rate limit check
    if (!this.checkRateLimit(userId)) {
      return {
        promptId: config.promptId, state: "cancelled", approved: false,
        resolvedAt: Date.now(),
      };
    }

    // Check remote session restriction
    if (config.remoteSessionRestricted) {
      return {
        promptId: config.promptId, state: "cancelled", approved: false,
        resolvedAt: Date.now(),
      };
    }

    // Check remembered approvals
    const remembered = this.checkRemembered(config.action, userId);
    if (remembered) {
      const result: TrustedPromptResult = {
        promptId: config.promptId, state: "resolved", approved: true,
        method: remembered.method, resolvedAt: Date.now(),
      };
      this.history.push(result);
      return result;
    }

    // Enqueue
    return new Promise((resolve) => {
      const entry: PromptEntry = {
        config, state: "presenting", createdAt: Date.now(),
        resolve: (result) => resolve(result),
      };

      entry.timeoutHandle = setTimeout(() => {
        entry.state = "timed_out";
        const result: TrustedPromptResult = {
          promptId: config.promptId, state: "timed_out", approved: false,
          resolvedAt: Date.now(),
        };
        this.history.push(result);
        this.prompts.delete(config.promptId);
        resolve(result);
      }, config.timeoutMs);

      this.prompts.set(config.promptId, entry);
    });
  }

  // ── Resolve Prompt ──────────────────────────────────────

  resolvePrompt(
    promptId: string, approved: boolean, method?: OSAuthMethod,
    rememberMinutes?: number
  ): TrustedPromptResult | null {
    const entry = this.prompts.get(promptId);
    if (!entry) return null;

    if (entry.timeoutHandle) clearTimeout(entry.timeoutHandle);
    entry.state = approved ? "resolved" : "cancelled";
    entry.resolvedAt = Date.now();

    const result: TrustedPromptResult = {
      promptId, state: entry.state, approved, method, resolvedAt: Date.now(),
    };

    // Handle remember
    if (approved && rememberMinutes && entry.config.rememberAllowed && method) {
      const maxMin = entry.config.rememberMaxMinutes;
      const actualMin = Math.min(rememberMinutes, maxMin);
      this.rememberedApprovals.push({
        action: entry.config.action,
        userId: entry.config.requester,
        method,
        expiresAt: Date.now() + actualMin * 60 * 1000,
      });
      result.rememberedUntil = Date.now() + actualMin * 60 * 1000;
    }

    this.history.push(result);
    this.prompts.delete(promptId);
    entry.resolve?.(result);

    // Audit
    const auditd = getAuditDaemon();
    auditd.record({
      actorUserId: "system", actorSessionId: "promptd",
      action: `prompt.${approved ? "approved" : "denied"}`,
      resource: entry.config.action,
      decision: approved ? "elevated" : "denied",
      severity: entry.config.riskLevel === "critical" ? "critical" : "high",
      metadata: { promptId, method, remembered: !!rememberMinutes },
    });

    return result;
  }

  // ── Cancel Prompt ───────────────────────────────────────

  cancelPrompt(promptId: string): void {
    this.resolvePrompt(promptId, false);
  }

  // ── Query ───────────────────────────────────────────────

  getActivePrompts(): TrustedPromptConfig[] {
    return Array.from(this.prompts.values()).map(e => e.config);
  }

  getPromptState(promptId: string): PromptState {
    return this.prompts.get(promptId)?.state || "idle";
  }

  getHistory(limit = 50): TrustedPromptResult[] {
    return this.history.slice(-limit).reverse();
  }

  getRememberedApprovals(): RememberedApproval[] {
    const now = Date.now();
    this.rememberedApprovals = this.rememberedApprovals.filter(a => a.expiresAt > now);
    return [...this.rememberedApprovals];
  }

  clearRemembered(): void {
    this.rememberedApprovals = [];
  }

  // ── Rate Limiting ───────────────────────────────────────

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const timestamps = this.rateLimiter.get(userId) || [];
    const recent = timestamps.filter(t => now - t < 60000);
    if (recent.length >= this.maxPromptsPerMinute) return false;
    recent.push(now);
    this.rateLimiter.set(userId, recent);
    return true;
  }

  // ── Remember Check ──────────────────────────────────────

  private checkRemembered(action: string, userId: string): RememberedApproval | null {
    const now = Date.now();
    this.rememberedApprovals = this.rememberedApprovals.filter(a => a.expiresAt > now);
    return this.rememberedApprovals.find(a => a.action === action && a.userId === userId) || null;
  }

  getStats() {
    return {
      activePrompts: this.prompts.size,
      totalHistory: this.history.length,
      rememberedApprovals: this.rememberedApprovals.filter(a => a.expiresAt > Date.now()).length,
      approvedCount: this.history.filter(h => h.approved).length,
      deniedCount: this.history.filter(h => !h.approved).length,
      timedOutCount: this.history.filter(h => h.state === "timed_out").length,
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _promptd: PromptDaemon | null = null;
export function getPromptDaemon(): PromptDaemon {
  if (!_promptd) _promptd = new PromptDaemon();
  return _promptd;
}
