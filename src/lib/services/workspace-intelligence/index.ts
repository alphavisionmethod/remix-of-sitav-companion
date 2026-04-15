// ═══════════════════════════════════════════════════════════════
// SITA OS — Workspace Intelligence
// Context-aware workspace policies, automations, and suggestions
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";

const SERVICE_KEY = "workspace-intelligence";

// ── Types ────────────────────────────────────────────────────────

export type WorkspaceId = "work" | "finance" | "personal" | "focus" | "travel" | "creative" | "default";

export interface WorkspacePolicy {
  workspaceId: WorkspaceId;
  notifications: "all" | "critical-only" | "none";
  allowedApps: string[];
  blockedApps: string[];
  focusMode: boolean;
  networkRestrictions: "none" | "vpn-required" | "offline-ok";
  securityOverlay: "standard" | "elevated" | "paranoid";
  memoryRules: { learnPatterns: boolean; retainHistory: boolean; crossWorkspaceSharing: boolean };
  automationsEnabled: boolean;
  pinnedFiles: string[];
  activeDevices: string[];
}

export interface WorkspaceAutomation {
  id: string;
  workspaceId: WorkspaceId;
  trigger: "enter" | "exit" | "time" | "event" | "context_change";
  triggerCondition: string;
  actions: Array<{ type: string; params: Record<string, unknown> }>;
  enabled: boolean;
  lastTriggered: string | null;
  executionCount: number;
}

export interface WorkspaceSuggestion {
  suggestedWorkspace: WorkspaceId;
  confidence: number;
  reason: string;
  contextSignals: string[];
  timestamp: string;
}

export interface WorkspaceIntelligenceService {
  getWorkspacePolicy(workspaceId: WorkspaceId): WorkspacePolicy;
  setWorkspacePolicy(workspaceId: WorkspaceId, policy: Partial<WorkspacePolicy>): void;
  suggestWorkspace(context: { timeOfDay: number; dayOfWeek: number; activeApps: string[]; mode: string; cognitiveLoad: number }): WorkspaceSuggestion;
  getWorkspaceAutomations(workspaceId: WorkspaceId): WorkspaceAutomation[];
  addAutomation(automation: Omit<WorkspaceAutomation, "id" | "lastTriggered" | "executionCount">): string;
  removeAutomation(automationId: string): void;
  toggleAutomation(automationId: string, enabled: boolean): void;
  applyWorkspaceContext(workspaceId: WorkspaceId): { applied: boolean; policiesActivated: string[]; automationsTriggered: string[] };
  getAvailableWorkspaces(): WorkspaceId[];
  getWorkspaceUsageStats(): Record<WorkspaceId, { totalTime: number; entries: number; lastEntry: string | null }>;
  recordWorkspaceEntry(workspaceId: WorkspaceId): void;
  recordWorkspaceExit(workspaceId: WorkspaceId): void;
  loadPersistedState(): Promise<void>;
}

// ── Default Policies ─────────────────────────────────────────────

const DEFAULT_POLICIES: Record<WorkspaceId, WorkspacePolicy> = {
  work: {
    workspaceId: "work", notifications: "critical-only", allowedApps: ["business", "crm", "email", "tasks", "calendar"],
    blockedApps: [], focusMode: false, networkRestrictions: "none", securityOverlay: "standard",
    memoryRules: { learnPatterns: true, retainHistory: true, crossWorkspaceSharing: false },
    automationsEnabled: true, pinnedFiles: [], activeDevices: [],
  },
  finance: {
    workspaceId: "finance", notifications: "critical-only", allowedApps: ["finance", "banking", "investments", "tax"],
    blockedApps: [], focusMode: true, networkRestrictions: "vpn-required", securityOverlay: "elevated",
    memoryRules: { learnPatterns: true, retainHistory: true, crossWorkspaceSharing: false },
    automationsEnabled: true, pinnedFiles: [], activeDevices: [],
  },
  personal: {
    workspaceId: "personal", notifications: "all", allowedApps: ["concierge", "photos", "notes", "calendar"],
    blockedApps: ["crm"], focusMode: false, networkRestrictions: "none", securityOverlay: "standard",
    memoryRules: { learnPatterns: true, retainHistory: true, crossWorkspaceSharing: false },
    automationsEnabled: true, pinnedFiles: [], activeDevices: [],
  },
  focus: {
    workspaceId: "focus", notifications: "none", allowedApps: [],
    blockedApps: [], focusMode: true, networkRestrictions: "none", securityOverlay: "standard",
    memoryRules: { learnPatterns: false, retainHistory: false, crossWorkspaceSharing: false },
    automationsEnabled: false, pinnedFiles: [], activeDevices: [],
  },
  travel: {
    workspaceId: "travel", notifications: "critical-only", allowedApps: ["concierge", "maps", "bookings", "documents"],
    blockedApps: [], focusMode: false, networkRestrictions: "offline-ok", securityOverlay: "elevated",
    memoryRules: { learnPatterns: true, retainHistory: true, crossWorkspaceSharing: true },
    automationsEnabled: true, pinnedFiles: [], activeDevices: [],
  },
  creative: {
    workspaceId: "creative", notifications: "none", allowedApps: ["notes", "design", "files"],
    blockedApps: ["email", "crm"], focusMode: true, networkRestrictions: "none", securityOverlay: "standard",
    memoryRules: { learnPatterns: true, retainHistory: true, crossWorkspaceSharing: false },
    automationsEnabled: false, pinnedFiles: [], activeDevices: [],
  },
  default: {
    workspaceId: "default", notifications: "all", allowedApps: [],
    blockedApps: [], focusMode: false, networkRestrictions: "none", securityOverlay: "standard",
    memoryRules: { learnPatterns: true, retainHistory: true, crossWorkspaceSharing: true },
    automationsEnabled: true, pinnedFiles: [], activeDevices: [],
  },
};

// ── Implementation ───────────────────────────────────────────────

export function createWorkspaceIntelligence(): WorkspaceIntelligenceService {
  const policies = new Map<WorkspaceId, WorkspacePolicy>(
    Object.entries(DEFAULT_POLICIES).map(([k, v]) => [k as WorkspaceId, { ...v }])
  );
  const automations: WorkspaceAutomation[] = [];
  const usageStats = new Map<WorkspaceId, { totalTime: number; entries: number; lastEntry: string | null }>();
  const activeEntry = new Map<WorkspaceId, number>(); // entry timestamps

  function getWorkspacePolicy(workspaceId: WorkspaceId): WorkspacePolicy {
    return policies.get(workspaceId) ?? DEFAULT_POLICIES.default;
  }

  function setWorkspacePolicy(workspaceId: WorkspaceId, policy: Partial<WorkspacePolicy>) {
    const current = getWorkspacePolicy(workspaceId);
    policies.set(workspaceId, { ...current, ...policy, workspaceId });
    persist();
  }

  function suggestWorkspace(context: { timeOfDay: number; dayOfWeek: number; activeApps: string[]; mode: string; cognitiveLoad: number }): WorkspaceSuggestion {
    const signals: string[] = [];
    let best: WorkspaceId = "default";
    let bestScore = 0;

    // Time-based scoring
    const isWorkHours = context.dayOfWeek >= 1 && context.dayOfWeek <= 5 && context.timeOfDay >= 9 && context.timeOfDay <= 17;
    const isEvening = context.timeOfDay >= 18;
    const isMorning = context.timeOfDay >= 6 && context.timeOfDay <= 9;

    const candidates: Array<{ ws: WorkspaceId; score: number; reasons: string[] }> = [
      { ws: "work", score: isWorkHours ? 0.8 : 0.2, reasons: isWorkHours ? ["Work hours (9-5, Mon-Fri)"] : [] },
      { ws: "personal", score: isEvening ? 0.7 : 0.2, reasons: isEvening ? ["Evening hours"] : [] },
      { ws: "focus", score: context.cognitiveLoad > 70 ? 0.85 : 0.1, reasons: context.cognitiveLoad > 70 ? ["High cognitive load"] : [] },
      { ws: "finance", score: context.activeApps.some(a => ["finance", "banking"].includes(a)) ? 0.9 : 0.1, reasons: [] },
    ];

    // Boost based on active apps
    for (const c of candidates) {
      const policy = getWorkspacePolicy(c.ws);
      const matchingApps = context.activeApps.filter(a => policy.allowedApps.includes(a));
      if (matchingApps.length > 0) {
        c.score += matchingApps.length * 0.15;
        c.reasons.push(`Active apps match: ${matchingApps.join(", ")}`);
      }
    }

    // Mode boost
    if (context.mode === "focus") {
      const fc = candidates.find(c => c.ws === "focus");
      if (fc) { fc.score += 0.3; fc.reasons.push("Focus mode active"); }
    }
    if (context.mode === "executive" || context.mode === "founder") {
      const wc = candidates.find(c => c.ws === "work");
      if (wc) { wc.score += 0.2; wc.reasons.push(`${context.mode} mode active`); }
    }

    for (const c of candidates) {
      if (c.score > bestScore) {
        bestScore = c.score;
        best = c.ws;
        signals.push(...c.reasons);
      }
    }

    return {
      suggestedWorkspace: best,
      confidence: Math.min(bestScore, 1.0),
      reason: signals[0] ?? "Default workspace",
      contextSignals: signals,
      timestamp: new Date().toISOString(),
    };
  }

  function getWorkspaceAutomations(workspaceId: WorkspaceId): WorkspaceAutomation[] {
    return automations.filter(a => a.workspaceId === workspaceId);
  }

  function addAutomation(auto: Omit<WorkspaceAutomation, "id" | "lastTriggered" | "executionCount">): string {
    const id = `wauto_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    automations.push({ ...auto, id, lastTriggered: null, executionCount: 0 });
    persist();
    return id;
  }

  function removeAutomation(automationId: string) {
    const idx = automations.findIndex(a => a.id === automationId);
    if (idx >= 0) { automations.splice(idx, 1); persist(); }
  }

  function toggleAutomation(automationId: string, enabled: boolean) {
    const auto = automations.find(a => a.id === automationId);
    if (auto) { auto.enabled = enabled; persist(); }
  }

  function applyWorkspaceContext(workspaceId: WorkspaceId) {
    const policy = getWorkspacePolicy(workspaceId);
    const policiesActivated: string[] = [];
    const automationsTriggered: string[] = [];

    if (policy.focusMode) policiesActivated.push("focus_mode");
    if (policy.notifications !== "all") policiesActivated.push(`notifications_${policy.notifications}`);
    if (policy.securityOverlay !== "standard") policiesActivated.push(`security_${policy.securityOverlay}`);
    if (policy.networkRestrictions !== "none") policiesActivated.push(`network_${policy.networkRestrictions}`);

    // Trigger enter automations
    const enterAutos = automations.filter(a => a.workspaceId === workspaceId && a.trigger === "enter" && a.enabled);
    for (const a of enterAutos) {
      a.lastTriggered = new Date().toISOString();
      a.executionCount++;
      automationsTriggered.push(a.id);
    }

    recordWorkspaceEntry(workspaceId);
    persist();

    return { applied: true, policiesActivated, automationsTriggered };
  }

  function getAvailableWorkspaces(): WorkspaceId[] {
    return Array.from(policies.keys());
  }

  function getWorkspaceUsageStats(): Record<WorkspaceId, { totalTime: number; entries: number; lastEntry: string | null }> {
    const result: Record<string, { totalTime: number; entries: number; lastEntry: string | null }> = {};
    for (const ws of policies.keys()) {
      result[ws] = usageStats.get(ws) ?? { totalTime: 0, entries: 0, lastEntry: null };
    }
    return result as Record<WorkspaceId, { totalTime: number; entries: number; lastEntry: string | null }>;
  }

  function recordWorkspaceEntry(workspaceId: WorkspaceId) {
    activeEntry.set(workspaceId, Date.now());
    const stats = usageStats.get(workspaceId) ?? { totalTime: 0, entries: 0, lastEntry: null };
    stats.entries++;
    stats.lastEntry = new Date().toISOString();
    usageStats.set(workspaceId, stats);
  }

  function recordWorkspaceExit(workspaceId: WorkspaceId) {
    const entryTime = activeEntry.get(workspaceId);
    if (entryTime) {
      const duration = Date.now() - entryTime;
      const stats = usageStats.get(workspaceId) ?? { totalTime: 0, entries: 0, lastEntry: null };
      stats.totalTime += duration;
      usageStats.set(workspaceId, stats);
      activeEntry.delete(workspaceId);
    }

    // Trigger exit automations
    const exitAutos = automations.filter(a => a.workspaceId === workspaceId && a.trigger === "exit" && a.enabled);
    for (const a of exitAutos) {
      a.lastTriggered = new Date().toISOString();
      a.executionCount++;
    }
    persist();
  }

  function persist() {
    debouncedSaveServiceState(SERVICE_KEY, {
      policies: Object.fromEntries(policies),
      automations,
      usageStats: Object.fromEntries(usageStats),
    });
  }

  async function loadPersistedState() {
    const saved = await loadServiceState(SERVICE_KEY);
    if (saved?.policies) {
      for (const [k, v] of Object.entries(saved.policies as Record<string, WorkspacePolicy>)) {
        policies.set(k as WorkspaceId, v);
      }
    }
    if (saved?.automations) {
      automations.push(...(saved.automations as WorkspaceAutomation[]));
    }
    if (saved?.usageStats) {
      for (const [k, v] of Object.entries(saved.usageStats as Record<string, { totalTime: number; entries: number; lastEntry: string | null }>)) {
        usageStats.set(k as WorkspaceId, v);
      }
    }
  }

  return {
    getWorkspacePolicy, setWorkspacePolicy, suggestWorkspace,
    getWorkspaceAutomations, addAutomation, removeAutomation, toggleAutomation,
    applyWorkspaceContext, getAvailableWorkspaces, getWorkspaceUsageStats,
    recordWorkspaceEntry, recordWorkspaceExit, loadPersistedState,
  };
}
