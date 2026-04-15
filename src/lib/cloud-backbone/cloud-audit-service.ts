// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Audit Service
// Security events, suspicious behavior, admin actions audit
// ═══════════════════════════════════════════════════════════════

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditEvent {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  severity: AuditSeverity;
  createdAt: string;
}

export interface SuspiciousBehavior {
  id: string;
  userId: string;
  userName: string;
  behaviorType: string;
  description: string;
  severity: AuditSeverity;
  detectedAt: string;
  resolved: boolean;
  details: Record<string, unknown>;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  category: string;
  createdAt: string;
  acknowledged: boolean;
}

class CloudAuditService {
  private static instance: CloudAuditService;
  static getInstance() {
    if (!this.instance) this.instance = new CloudAuditService();
    return this.instance;
  }

  getRecentEvents(limit = 50): AuditEvent[] {
    const actions = [
      { action: "user.suspend", target: "user", sev: "warning" as const },
      { action: "device.revoke", target: "device", sev: "warning" as const },
      { action: "plan.upgrade", target: "user_plan", sev: "info" as const },
      { action: "job.trigger", target: "sync_job", sev: "info" as const },
      { action: "policy.update", target: "policy", sev: "info" as const },
      { action: "flag.toggle", target: "feature_flag", sev: "info" as const },
      { action: "user.delete", target: "user", sev: "critical" as const },
      { action: "storage.reconcile", target: "storage", sev: "info" as const },
      { action: "device.force_reauth", target: "device", sev: "warning" as const },
      { action: "quota.grant_bonus", target: "user_plan", sev: "info" as const },
    ];
    const actors = ["Admin User", "System Bot", "Ops Engineer"];
    return Array.from({ length: Math.min(limit, 30) }, (_, i) => {
      const a = actions[i % actions.length];
      return {
        id: crypto.randomUUID(),
        actorUserId: crypto.randomUUID(),
        actorName: actors[i % actors.length],
        action: a.action,
        targetType: a.target,
        targetId: crypto.randomUUID().slice(0, 8),
        details: {},
        ipAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        severity: a.sev,
        createdAt: new Date(Date.now() - i * 1800000).toISOString(),
      };
    });
  }

  getSuspiciousBehaviors(): SuspiciousBehavior[] {
    return [
      {
        id: "sb1", userId: "u1", userName: "Unknown Actor",
        behaviorType: "mass_deletion", description: "Deleted 847 files in 2 minutes",
        severity: "critical", detectedAt: new Date(Date.now() - 3600000).toISOString(),
        resolved: false, details: { fileCount: 847, duration: "2m" },
      },
      {
        id: "sb2", userId: "u2", userName: "Bob Martinez",
        behaviorType: "rapid_token_refresh", description: "Token refreshed 45 times in 10 minutes",
        severity: "warning", detectedAt: new Date(Date.now() - 7200000).toISOString(),
        resolved: false, details: { refreshCount: 45, window: "10m" },
      },
      {
        id: "sb3", userId: "u3", userName: "Eve Johnson",
        behaviorType: "unusual_ip", description: "Login from new country (Nigeria) after long inactivity",
        severity: "warning", detectedAt: new Date(Date.now() - 14400000).toISOString(),
        resolved: true, details: { country: "Nigeria", previousCountry: "USA" },
      },
    ];
  }

  getSecurityAlerts(): SecurityAlert[] {
    return [
      { id: "a1", title: "Mass Deletion Detected", description: "User deleted 847 files rapidly — possible data wipe attack", severity: "critical", category: "Data Protection", createdAt: new Date(Date.now() - 3600000).toISOString(), acknowledged: false },
      { id: "a2", title: "Outdated Client Versions", description: "3 devices running version <2.0 with known vulnerabilities", severity: "warning", category: "Version Health", createdAt: new Date(Date.now() - 7200000).toISOString(), acknowledged: false },
      { id: "a3", title: "Token Anomaly", description: "Unusual token refresh pattern detected for 1 user", severity: "warning", category: "Authentication", createdAt: new Date(Date.now() - 14400000).toISOString(), acknowledged: true },
      { id: "a4", title: "Storage Backend Latency", description: "Object storage p95 latency exceeded 500ms threshold", severity: "info", category: "Performance", createdAt: new Date(Date.now() - 28800000).toISOString(), acknowledged: true },
    ];
  }

  getTokenRevocations() {
    return [
      { id: "tr1", userId: "u1", userName: "Eve Johnson", reason: "Device revoked", revokedAt: new Date(Date.now() - 86400000).toISOString(), tokenType: "refresh" },
      { id: "tr2", userId: "u2", userName: "Bob Martinez", reason: "Suspicious activity", revokedAt: new Date(Date.now() - 172800000).toISOString(), tokenType: "access" },
    ];
  }

  getSeverityColor(severity: AuditSeverity): string {
    return { info: "text-blue-400", warning: "text-amber-400", critical: "text-red-400" }[severity];
  }

  getSeverityBadge(severity: AuditSeverity): "default" | "secondary" | "destructive" {
    return { info: "default" as const, warning: "secondary" as const, critical: "destructive" as const }[severity];
  }
}

export const cloudAuditService = CloudAuditService.getInstance();
