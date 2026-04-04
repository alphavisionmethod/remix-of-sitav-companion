// ═══════════════════════════════════════════════════════════════
// SITA OS — Owner Control Room Service
// Owner mode state, delegation controls, trust overview
// Canonical contracts: workspace-runtime, core trust/workflow
// ═══════════════════════════════════════════════════════════════

import type { WorkspaceRuntime, WorkspacePane } from "@/packages/contracts";
import type { DomainId } from "@/packages/contracts";

// ── Types ───────────────────────────────────────────────────────

export interface DelegationControl {
  capabilityId: string;
  domain: DomainId;
  isAutonomous: boolean;
  requiresApproval: boolean;
  delegatedTo?: string;
  maxAmountCents?: number;
  expiresAt?: string;
}

export interface OwnerControlRoomState {
  workspace: WorkspaceRuntime;
  delegations: DelegationControl[];
  pendingApprovals: number;
  trustOverview: {
    overallScore: number;
    flaggedEntities: number;
    recentViolations: number;
  };
  activeWorkflows: number;
  mode: "owner" | "admin" | "viewer";
}

// ── Service ─────────────────────────────────────────────────────

export class OwnerControlRoomService {
  private delegations = new Map<string, DelegationControl>();
  private workspace: WorkspaceRuntime;
  private mode: OwnerControlRoomState["mode"] = "owner";
  private pendingApprovals = 0;
  private activeWorkflows = 0;
  private trustOverview: OwnerControlRoomState["trustOverview"] = {
    overallScore: 100,
    flaggedEntities: 0,
    recentViolations: 0,
  };

  constructor(userId: string) {
    this.workspace = {
      workspaceId: `ws-${userId}`,
      userId,
      layout: [],
      activePane: "",
      commandPaletteHistory: [],
      recentEntities: [],
      preferences: {},
      savedAt: new Date().toISOString(),
    };
  }

  setMode(mode: OwnerControlRoomState["mode"]): void {
    this.mode = mode;
  }

  addPane(pane: WorkspacePane): void {
    this.workspace.layout.push(pane);
  }

  setActivePane(paneId: string): void {
    this.workspace.activePane = paneId;
    for (const p of this.workspace.layout) {
      p.isActive = p.paneId === paneId;
    }
  }

  addDelegation(delegation: DelegationControl): void {
    this.delegations.set(delegation.capabilityId, delegation);
  }

  revokeDelegation(capabilityId: string): void {
    this.delegations.delete(capabilityId);
  }

  getDelegation(capabilityId: string): DelegationControl | undefined {
    return this.delegations.get(capabilityId);
  }

  getAutonomousDelegations(): DelegationControl[] {
    return Array.from(this.delegations.values()).filter(d => d.isAutonomous);
  }

  updateTrustOverview(overview: OwnerControlRoomState["trustOverview"]): void {
    this.trustOverview = overview;
  }

  setPendingApprovals(count: number): void {
    this.pendingApprovals = count;
  }

  setActiveWorkflows(count: number): void {
    this.activeWorkflows = count;
  }

  addRecentEntity(entity: WorkspaceRuntime["recentEntities"][0]): void {
    this.workspace.recentEntities = [
      entity,
      ...this.workspace.recentEntities.filter(e => e.id !== entity.id),
    ].slice(0, 20);
  }

  addCommandToHistory(command: string): void {
    this.workspace.commandPaletteHistory = [
      command,
      ...this.workspace.commandPaletteHistory.filter(c => c !== command),
    ].slice(0, 50);
  }

  saveWorkspace(): void {
    this.workspace.savedAt = new Date().toISOString();
  }

  evaluate(): OwnerControlRoomState {
    return {
      workspace: { ...this.workspace },
      delegations: Array.from(this.delegations.values()),
      pendingApprovals: this.pendingApprovals,
      trustOverview: { ...this.trustOverview },
      activeWorkflows: this.activeWorkflows,
      mode: this.mode,
    };
  }
}

// ── Personal Operating Model (merged from personal-operating-model) ─────────

export type RhythmType = "morning-routine" | "deep-work" | "meetings" | "admin" | "wind-down" | "break";

export interface DailyRhythm {
  hour: number;
  type: RhythmType;
  label: string;
  confidence: number;
}

export interface WorkPattern {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  averageDurationMinutes: number;
  preferredTimeSlot: { startHour: number; endHour: number };
  lastObserved: string;
}

export class PersonalOperatingModel {
  private rhythms: DailyRhythm[] = [];
  private patterns = new Map<string, WorkPattern>();

  setDailyRhythm(rhythms: DailyRhythm[]): void { this.rhythms = rhythms; }
  getDailyRhythm(): DailyRhythm[] { return [...this.rhythms]; }
  getCurrentRhythm(): DailyRhythm | null {
    const hour = new Date().getHours();
    return this.rhythms.find(r => r.hour === hour) ?? null;
  }

  recordPattern(pattern: WorkPattern): void { this.patterns.set(pattern.id, pattern); }
  getPatterns(): WorkPattern[] { return Array.from(this.patterns.values()); }
  getPatternByName(name: string): WorkPattern | undefined {
    return Array.from(this.patterns.values()).find(p => p.name === name);
  }
}

// ── Personalization Engine (merged from personalization-engine) ──────────────

export type UIDensity = "compact" | "comfortable" | "spacious";
export type ContentRanking = "recency" | "relevance" | "frequency" | "priority";

export interface PersonalizationProfile {
  uiDensity: UIDensity;
  contentRanking: ContentRanking;
  pinnedModules: string[];
  hiddenModules: string[];
  dashboardLayout: string[];
  colorAccent?: string;
  reducedMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
}

export class PersonalizationEngine {
  private profile: PersonalizationProfile = {
    uiDensity: "comfortable", contentRanking: "relevance",
    pinnedModules: [], hiddenModules: [], dashboardLayout: [],
    reducedMotion: false, largeText: false, highContrast: false,
  };

  setProfile(updates: Partial<PersonalizationProfile>): void { Object.assign(this.profile, updates); }
  getProfile(): PersonalizationProfile { return { ...this.profile }; }

  pinModule(moduleId: string): void {
    if (!this.profile.pinnedModules.includes(moduleId)) this.profile.pinnedModules.push(moduleId);
    this.profile.hiddenModules = this.profile.hiddenModules.filter(m => m !== moduleId);
  }
  hideModule(moduleId: string): void {
    if (!this.profile.hiddenModules.includes(moduleId)) this.profile.hiddenModules.push(moduleId);
    this.profile.pinnedModules = this.profile.pinnedModules.filter(m => m !== moduleId);
  }
  isModuleVisible(moduleId: string): boolean { return !this.profile.hiddenModules.includes(moduleId); }
}

// ── Sita Modes (merged from sita-modes) ─────────────────────────────────────

export type SitaMode = "calm" | "focus" | "urgent" | "default";

export interface SitaModeConfig {
  mode: SitaMode;
  notificationsEnabled: boolean;
  ambientSoundEnabled: boolean;
  autoAdvanceWorkflows: boolean;
  dimNonEssential: boolean;
  description: string;
}

const MODE_DEFAULTS: Record<SitaMode, Omit<SitaModeConfig, "mode">> = {
  calm: { notificationsEnabled: false, ambientSoundEnabled: true, autoAdvanceWorkflows: false, dimNonEssential: true, description: "Minimal interruptions, ambient atmosphere" },
  focus: { notificationsEnabled: false, ambientSoundEnabled: false, autoAdvanceWorkflows: true, dimNonEssential: true, description: "Deep work mode, auto-advance low-risk workflows" },
  urgent: { notificationsEnabled: true, ambientSoundEnabled: false, autoAdvanceWorkflows: true, dimNonEssential: false, description: "All alerts active, maximum responsiveness" },
  default: { notificationsEnabled: true, ambientSoundEnabled: false, autoAdvanceWorkflows: false, dimNonEssential: false, description: "Standard operating mode" },
};

export class SitaModes {
  private currentMode: SitaMode = "default";
  private overrides: Partial<SitaModeConfig> = {};

  setMode(mode: SitaMode): SitaModeConfig {
    this.currentMode = mode;
    this.overrides = {};
    return this.getConfig();
  }

  getMode(): SitaMode { return this.currentMode; }

  getConfig(): SitaModeConfig {
    return { mode: this.currentMode, ...MODE_DEFAULTS[this.currentMode], ...this.overrides };
  }

  override(overrides: Partial<Omit<SitaModeConfig, "mode">>): SitaModeConfig {
    Object.assign(this.overrides, overrides);
    return this.getConfig();
  }

  getAvailableModes(): Array<{ mode: SitaMode; description: string }> {
    return (Object.entries(MODE_DEFAULTS) as Array<[SitaMode, typeof MODE_DEFAULTS[SitaMode]]>)
      .map(([mode, config]) => ({ mode, description: config.description }));
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createOwnerControlRoomService(userId: string): OwnerControlRoomService {
  return new OwnerControlRoomService(userId);
}

export function createPersonalOperatingModel(): PersonalOperatingModel {
  return new PersonalOperatingModel();
}

export function createPersonalizationEngine(): PersonalizationEngine {
  return new PersonalizationEngine();
}

export function createSitaModes(): SitaModes {
  return new SitaModes();
}
