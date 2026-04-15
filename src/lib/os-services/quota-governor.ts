// ═══════════════════════════════════════════════════════════════
// SITA OS — Quota Governor
// Per-app and per-daemon resource limits with emergency behavior
// ═══════════════════════════════════════════════════════════════

export type ResourceType = 'memory' | 'cpu' | 'background_time' | 'network' | 'disk' | 'log_growth' | 'cache';
export type QuotaScope = 'app' | 'daemon' | 'user' | 'system';
export type QuotaAction = 'warn' | 'throttle' | 'suspend' | 'terminate';

export interface QuotaRule {
  id: string;
  entityId: string;
  scope: QuotaScope;
  resource: ResourceType;
  limitValue: number;
  unit: string;
  currentUsage: number;
  warningThreshold: number; // percentage 0-1
  action: QuotaAction;
  enforced: boolean;
}

export interface QuotaViolation {
  ruleId: string;
  entityId: string;
  resource: ResourceType;
  usage: number;
  limit: number;
  percentage: number;
  action: QuotaAction;
  timestamp: number;
}

export interface EmergencyResourcePolicy {
  trigger: 'low_memory' | 'low_disk' | 'thermal' | 'low_battery';
  threshold: number;
  actions: QuotaAction[];
  targetScopes: QuotaScope[];
  description: string;
}

class QuotaGovernor {
  private rules = new Map<string, QuotaRule>();
  private violations: QuotaViolation[] = [];
  private emergencyPolicies: EmergencyResourcePolicy[] = [];

  constructor() {
    this.initDefaults();
  }

  private initDefaults(): void {
    // Default emergency policies
    this.emergencyPolicies = [
      { trigger: 'low_memory', threshold: 90, actions: ['throttle', 'suspend'], targetScopes: ['app'], description: 'Throttle/suspend apps when memory > 90%' },
      { trigger: 'low_disk', threshold: 95, actions: ['warn', 'throttle'], targetScopes: ['app', 'daemon'], description: 'Warn and throttle when disk > 95%' },
      { trigger: 'thermal', threshold: 85, actions: ['throttle'], targetScopes: ['app', 'daemon'], description: 'Throttle all processes on thermal alert' },
      { trigger: 'low_battery', threshold: 10, actions: ['suspend', 'terminate'], targetScopes: ['app'], description: 'Suspend background apps when battery < 10%' },
    ];

    // Default per-app quotas
    const defaultApps = ['com.nova.notes', 'com.nova.browser', 'com.nova.terminal', 'com.nova.files'];
    defaultApps.forEach(app => {
      this.addRule({ id: `${app}:memory`, entityId: app, scope: 'app', resource: 'memory', limitValue: 512, unit: 'MB', currentUsage: 0, warningThreshold: 0.8, action: 'throttle', enforced: true });
      this.addRule({ id: `${app}:cpu`, entityId: app, scope: 'app', resource: 'cpu', limitValue: 25, unit: '%', currentUsage: 0, warningThreshold: 0.9, action: 'throttle', enforced: true });
      this.addRule({ id: `${app}:background_time`, entityId: app, scope: 'app', resource: 'background_time', limitValue: 300, unit: 'seconds', currentUsage: 0, warningThreshold: 0.8, action: 'suspend', enforced: true });
    });

    // Default per-daemon quotas
    const defaultDaemons = ['healthd', 'crashd', 'timed', 'wifid', 'btd'];
    defaultDaemons.forEach(d => {
      this.addRule({ id: `${d}:memory`, entityId: d, scope: 'daemon', resource: 'memory', limitValue: 64, unit: 'MB', currentUsage: 0, warningThreshold: 0.9, action: 'warn', enforced: true });
      this.addRule({ id: `${d}:log_growth`, entityId: d, scope: 'daemon', resource: 'log_growth', limitValue: 50, unit: 'MB', currentUsage: 0, warningThreshold: 0.8, action: 'throttle', enforced: true });
    });
  }

  addRule(rule: QuotaRule): void { this.rules.set(rule.id, rule); }

  updateUsage(ruleId: string, usage: number): QuotaViolation | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;
    rule.currentUsage = usage;

    const pct = usage / rule.limitValue;
    if (pct >= 1 && rule.enforced) {
      const v: QuotaViolation = {
        ruleId, entityId: rule.entityId, resource: rule.resource,
        usage, limit: rule.limitValue, percentage: pct, action: rule.action, timestamp: Date.now(),
      };
      this.violations.push(v);
      return v;
    }
    return null;
  }

  checkEmergency(trigger: EmergencyResourcePolicy['trigger'], currentValue: number): EmergencyResourcePolicy | null {
    return this.emergencyPolicies.find(p => p.trigger === trigger && currentValue >= p.threshold) ?? null;
  }

  getViolations(entityId?: string): QuotaViolation[] {
    return entityId ? this.violations.filter(v => v.entityId === entityId) : [...this.violations];
  }

  getRulesForEntity(entityId: string): QuotaRule[] {
    return [...this.rules.values()].filter(r => r.entityId === entityId);
  }

  allRules(): QuotaRule[] { return [...this.rules.values()]; }

  stats(): { totalRules: number; violations: number; enforced: number } {
    const rules = [...this.rules.values()];
    return {
      totalRules: rules.length,
      violations: this.violations.length,
      enforced: rules.filter(r => r.enforced).length,
    };
  }
}

export const quotaGovernor = new QuotaGovernor();
