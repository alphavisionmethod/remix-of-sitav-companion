// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Lifecycle
// canary→nightly→beta→RC→stable→hotfix with promotion gates
// ═══════════════════════════════════════════════════════════════

export type ReleaseChannel = 'canary' | 'nightly' | 'dev' | 'beta' | 'rc' | 'stable' | 'hotfix';

export interface ReleaseVersion {
  version: string;
  channel: ReleaseChannel;
  buildDate: string;
  promotedFrom?: ReleaseChannel;
  promotionCriteria: PromotionCriteria;
  rolloutPercentage: number;
  hardwareBlocks: string[];
  notes: string;
}

export interface PromotionCriteria {
  minTestDays: number;
  maxCrashRate: number; // per 1000 users
  minBootSuccess: number; // percentage
  minUpdateSuccess: number;
  rollbackThreshold: number;
  requiresManualApproval: boolean;
  met: boolean;
}

const CHANNEL_ORDER: ReleaseChannel[] = ['canary', 'nightly', 'dev', 'beta', 'rc', 'stable'];

const DEFAULT_CRITERIA: Record<ReleaseChannel, PromotionCriteria> = {
  canary: { minTestDays: 0, maxCrashRate: 50, minBootSuccess: 90, minUpdateSuccess: 85, rollbackThreshold: 20, requiresManualApproval: false, met: false },
  nightly: { minTestDays: 1, maxCrashRate: 20, minBootSuccess: 95, minUpdateSuccess: 90, rollbackThreshold: 10, requiresManualApproval: false, met: false },
  dev: { minTestDays: 3, maxCrashRate: 10, minBootSuccess: 97, minUpdateSuccess: 95, rollbackThreshold: 5, requiresManualApproval: false, met: false },
  beta: { minTestDays: 7, maxCrashRate: 5, minBootSuccess: 99, minUpdateSuccess: 98, rollbackThreshold: 3, requiresManualApproval: true, met: false },
  rc: { minTestDays: 14, maxCrashRate: 2, minBootSuccess: 99.5, minUpdateSuccess: 99, rollbackThreshold: 1, requiresManualApproval: true, met: false },
  stable: { minTestDays: 0, maxCrashRate: 1, minBootSuccess: 99.9, minUpdateSuccess: 99.5, rollbackThreshold: 0.5, requiresManualApproval: true, met: false },
  hotfix: { minTestDays: 0, maxCrashRate: 5, minBootSuccess: 99, minUpdateSuccess: 98, rollbackThreshold: 2, requiresManualApproval: true, met: false },
};

class ReleaseLifecycleManager {
  private releases: ReleaseVersion[] = [];
  private currentChannel: ReleaseChannel = 'stable';
  private currentVersion = '2026.04.1';

  constructor() {
    this.releases.push({
      version: '2026.04.1', channel: 'stable', buildDate: '2026-04-15',
      promotionCriteria: { ...DEFAULT_CRITERIA.stable, met: true },
      rolloutPercentage: 100, hardwareBlocks: [], notes: 'Current stable release',
    });
  }

  getCurrent(): ReleaseVersion { return this.releases.find(r => r.version === this.currentVersion)!; }
  getCurrentChannel(): ReleaseChannel { return this.currentChannel; }

  /** Check if a version can be promoted to the next channel */
  canPromote(version: string): { canPromote: boolean; nextChannel?: ReleaseChannel; blockers: string[] } {
    const release = this.releases.find(r => r.version === version);
    if (!release) return { canPromote: false, blockers: ['Version not found'] };

    const idx = CHANNEL_ORDER.indexOf(release.channel);
    if (idx >= CHANNEL_ORDER.length - 1) return { canPromote: false, blockers: ['Already at stable'] };

    const nextChannel = CHANNEL_ORDER[idx + 1];
    const criteria = DEFAULT_CRITERIA[nextChannel];
    const blockers: string[] = [];

    if (criteria.requiresManualApproval) blockers.push('Requires manual approval');
    if (!release.promotionCriteria.met) blockers.push('Promotion criteria not yet met');

    return { canPromote: blockers.length === 0, nextChannel, blockers };
  }

  /** Promote a version to the next channel */
  promote(version: string): boolean {
    const check = this.canPromote(version);
    if (!check.canPromote || !check.nextChannel) return false;

    const release = this.releases.find(r => r.version === version)!;
    release.promotedFrom = release.channel;
    release.channel = check.nextChannel;
    release.promotionCriteria = { ...DEFAULT_CRITERIA[check.nextChannel], met: false };
    return true;
  }

  getPromotionCriteria(channel: ReleaseChannel): PromotionCriteria { return { ...DEFAULT_CRITERIA[channel] }; }
  allReleases(): ReleaseVersion[] { return [...this.releases]; }
  getByChannel(channel: ReleaseChannel): ReleaseVersion[] { return this.releases.filter(r => r.channel === channel); }
}

export const releaseLifecycle = new ReleaseLifecycleManager();
