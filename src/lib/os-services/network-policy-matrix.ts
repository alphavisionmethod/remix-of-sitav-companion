// ═══════════════════════════════════════════════════════════════
// SITA OS — Network Policy Matrix
// 5-dimension policy matrix for network decisions
// ═══════════════════════════════════════════════════════════════

export type InterfaceType = 'wifi' | 'ethernet' | 'hotspot' | 'vpn' | 'loopback' | 'cellular';
export type NetworkTrust = 'private' | 'public' | 'captive' | 'metered' | 'enterprise';
export type AppTrust = 'trusted' | 'sandboxed' | 'blocked' | 'system';
export type SessionType = 'user' | 'guest' | 'locked' | 'remote' | 'kiosk';
export type NetworkMode = 'home' | 'work' | 'school' | 'travel' | 'public';

export interface NetworkPolicyDecision {
  autoVPN: boolean;
  allowBackgroundSync: boolean;
  allowUpdates: boolean;
  allowTethering: boolean;
  allowLocalDiscovery: boolean;
  allowIncomingTraffic: boolean;
  allowGuestSavedCreds: boolean;
  bandwidthLimit?: number; // KB/s, undefined = unlimited
  dnsOverride?: string;
  firewallProfile: 'strict' | 'standard' | 'permissive';
}

export interface NetworkPolicyInput {
  interface: InterfaceType;
  trust: NetworkTrust;
  appTrust: AppTrust;
  session: SessionType;
  mode: NetworkMode;
}

type PolicyRule = {
  condition: (input: NetworkPolicyInput) => boolean;
  apply: (decision: NetworkPolicyDecision) => void;
  priority: number;
};

class NetworkPolicyMatrix {
  private rules: PolicyRule[] = [];

  constructor() {
    this.initDefaultRules();
  }

  private initDefaultRules(): void {
    // Public network -> strict firewall, auto VPN
    this.rules.push({
      priority: 10,
      condition: (i) => i.trust === 'public',
      apply: (d) => { d.autoVPN = true; d.firewallProfile = 'strict'; d.allowLocalDiscovery = false; d.allowIncomingTraffic = false; },
    });

    // Captive portal -> block background, no auto VPN until resolved
    this.rules.push({
      priority: 5,
      condition: (i) => i.trust === 'captive',
      apply: (d) => { d.autoVPN = false; d.allowBackgroundSync = false; d.allowUpdates = false; d.firewallProfile = 'strict'; },
    });

    // Metered -> limit bandwidth, no updates
    this.rules.push({
      priority: 15,
      condition: (i) => i.trust === 'metered',
      apply: (d) => { d.allowUpdates = false; d.bandwidthLimit = 512; d.allowBackgroundSync = false; },
    });

    // Guest session -> no saved creds, no tethering
    this.rules.push({
      priority: 8,
      condition: (i) => i.session === 'guest',
      apply: (d) => { d.allowGuestSavedCreds = false; d.allowTethering = false; },
    });

    // Locked session -> minimal network
    this.rules.push({
      priority: 3,
      condition: (i) => i.session === 'locked',
      apply: (d) => { d.allowBackgroundSync = false; d.allowTethering = false; d.allowLocalDiscovery = false; },
    });

    // Blocked app -> no network
    this.rules.push({
      priority: 1,
      condition: (i) => i.appTrust === 'blocked',
      apply: (d) => { d.allowBackgroundSync = false; d.bandwidthLimit = 0; d.firewallProfile = 'strict'; },
    });

    // Sandboxed app -> limited
    this.rules.push({
      priority: 12,
      condition: (i) => i.appTrust === 'sandboxed',
      apply: (d) => { d.allowLocalDiscovery = false; d.allowIncomingTraffic = false; },
    });

    // Work mode -> enterprise DNS, auto VPN
    this.rules.push({
      priority: 20,
      condition: (i) => i.mode === 'work',
      apply: (d) => { d.autoVPN = true; d.dnsOverride = 'enterprise'; d.firewallProfile = 'standard'; },
    });

    // Home + private -> permissive
    this.rules.push({
      priority: 25,
      condition: (i) => i.mode === 'home' && i.trust === 'private',
      apply: (d) => { d.firewallProfile = 'permissive'; d.allowLocalDiscovery = true; d.allowTethering = true; },
    });

    // VPN interface -> always standard firewall
    this.rules.push({
      priority: 7,
      condition: (i) => i.interface === 'vpn',
      apply: (d) => { d.autoVPN = false; d.firewallProfile = 'standard'; },
    });
  }

  /** Evaluate the policy matrix for given inputs */
  evaluate(input: NetworkPolicyInput): NetworkPolicyDecision {
    // Start with permissive defaults
    const decision: NetworkPolicyDecision = {
      autoVPN: false,
      allowBackgroundSync: true,
      allowUpdates: true,
      allowTethering: true,
      allowLocalDiscovery: true,
      allowIncomingTraffic: true,
      allowGuestSavedCreds: true,
      firewallProfile: 'standard',
    };

    // Apply rules in priority order (lower = higher priority = applied last to win)
    const applicable = this.rules
      .filter(r => r.condition(input))
      .sort((a, b) => b.priority - a.priority);

    applicable.forEach(r => r.apply(decision));

    return decision;
  }

  /** Explain why a decision was made */
  explain(input: NetworkPolicyInput): { decision: NetworkPolicyDecision; appliedRules: string[] } {
    const decision = this.evaluate(input);
    const applied: string[] = [];

    if (input.trust === 'public') applied.push('Public network: strict firewall, auto VPN');
    if (input.trust === 'captive') applied.push('Captive portal: blocked background until resolved');
    if (input.trust === 'metered') applied.push('Metered connection: bandwidth limited, updates disabled');
    if (input.session === 'guest') applied.push('Guest session: saved credentials hidden');
    if (input.session === 'locked') applied.push('Locked session: minimal network activity');
    if (input.appTrust === 'blocked') applied.push('Blocked app: no network access');
    if (input.mode === 'work') applied.push('Work mode: enterprise DNS, VPN required');
    if (input.mode === 'home' && input.trust === 'private') applied.push('Home private: permissive profile');

    return { decision, appliedRules: applied };
  }
}

export const networkPolicyMatrix = new NetworkPolicyMatrix();
