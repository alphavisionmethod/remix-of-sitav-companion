// ═══════════════════════════════════════════════════════════════
// SITA OS — Productivity Engine
// Task orchestration, focus modes, display density, cross-domain
// productivity coordination
// ═══════════════════════════════════════════════════════════════

export type DisplayDensity = "calm" | "standard" | "focus" | "analyst" | "presentation";
export type ProductivityContext = "business" | "finance" | "concierge" | "boardroom" | "workspace";

export interface FocusSession {
  id: string;
  context: ProductivityContext;
  density: DisplayDensity;
  activeDocumentId?: string;
  startedAt: number;
  endedAt?: number;
  tasksCompleted: number;
  distractionBlocks: number;
}

export interface ProductivityMetric {
  date: string;
  focusMinutes: number;
  tasksCompleted: number;
  documentsEdited: number;
  approvalsProcessed: number;
  context: ProductivityContext;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  domain: ProductivityContext;
  icon: string;
  action: string;
  shortcut?: string;
  pinned: boolean;
}

export interface WorkspaceLayout {
  id: string;
  name: string;
  density: DisplayDensity;
  panels: { id: string; type: string; position: "primary" | "detail" | "auxiliary"; visible: boolean }[];
  isDefault: boolean;
}

// ── Productivity Engine ─────────────────────────────────────────

export class ProductivityEngine {
  private activeSessions = new Map<string, FocusSession>();
  private completedSessions: FocusSession[] = [];
  private metrics: ProductivityMetric[] = [];
  private quickActions: QuickAction[] = [];
  private layouts = new Map<string, WorkspaceLayout>();
  private currentDensity: DisplayDensity = "standard";

  constructor() {
    this.initializeQuickActions();
    this.initializeLayouts();
  }

  // ── Focus Sessions ─────────────────────────────────────────────

  startFocusSession(context: ProductivityContext, density: DisplayDensity = "focus"): FocusSession {
    const session: FocusSession = {
      id: `focus-${Date.now()}`,
      context, density,
      startedAt: Date.now(),
      tasksCompleted: 0,
      distractionBlocks: 0,
    };
    this.activeSessions.set(session.id, session);
    this.currentDensity = density;
    return session;
  }

  endFocusSession(sessionId: string): FocusSession | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    session.endedAt = Date.now();
    this.activeSessions.delete(sessionId);
    this.completedSessions.push(session);
    this.currentDensity = "standard";
    return session;
  }

  getActiveSession(): FocusSession | null {
    const sessions = Array.from(this.activeSessions.values());
    return sessions[0] ?? null;
  }

  recordTaskCompletion(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) session.tasksCompleted++;
  }

  // ── Display Density ────────────────────────────────────────────

  setDensity(density: DisplayDensity): void {
    this.currentDensity = density;
  }

  getDensity(): DisplayDensity {
    return this.currentDensity;
  }

  getDensityConfig(density: DisplayDensity): {
    fontSize: string; spacing: string; maxColumns: number;
    showMetrics: boolean; showProof: boolean; animationsEnabled: boolean;
  } {
    const configs: Record<DisplayDensity, ReturnType<typeof this.getDensityConfig>> = {
      calm: { fontSize: "lg", spacing: "relaxed", maxColumns: 1, showMetrics: false, showProof: false, animationsEnabled: true },
      standard: { fontSize: "base", spacing: "normal", maxColumns: 2, showMetrics: true, showProof: true, animationsEnabled: true },
      focus: { fontSize: "base", spacing: "normal", maxColumns: 1, showMetrics: false, showProof: false, animationsEnabled: false },
      analyst: { fontSize: "sm", spacing: "compact", maxColumns: 3, showMetrics: true, showProof: true, animationsEnabled: false },
      presentation: { fontSize: "xl", spacing: "relaxed", maxColumns: 1, showMetrics: true, showProof: false, animationsEnabled: true },
    };
    return configs[density];
  }

  // ── Quick Actions ──────────────────────────────────────────────

  getQuickActions(context?: ProductivityContext): QuickAction[] {
    const all = this.quickActions;
    return context ? all.filter(a => a.domain === context || a.pinned) : all;
  }

  pinAction(actionId: string): void {
    const action = this.quickActions.find(a => a.id === actionId);
    if (action) action.pinned = true;
  }

  // ── Layouts ────────────────────────────────────────────────────

  getLayouts(): WorkspaceLayout[] {
    return Array.from(this.layouts.values());
  }

  getLayout(id: string): WorkspaceLayout | undefined {
    return this.layouts.get(id);
  }

  // ── Metrics ────────────────────────────────────────────────────

  recordMetric(metric: ProductivityMetric): void {
    this.metrics.push(metric);
  }

  getMetrics(context?: ProductivityContext, days = 7): ProductivityMetric[] {
    return this.metrics.filter(m =>
      (!context || m.context === context)
    ).slice(-days);
  }

  getProductivityScore(): { score: number; trend: "up" | "down" | "stable"; focusHoursThisWeek: number } {
    const recent = this.completedSessions.filter(s => s.endedAt && s.endedAt > Date.now() - 7 * 86_400_000);
    const focusMinutes = recent.reduce((sum, s) => sum + (s.endedAt! - s.startedAt) / 60_000, 0);
    return {
      score: Math.min(100, Math.round(focusMinutes / 3)),
      trend: focusMinutes > 300 ? "up" : focusMinutes < 100 ? "down" : "stable",
      focusHoursThisWeek: Math.round(focusMinutes / 60 * 10) / 10,
    };
  }

  getHealth(): { status: "healthy"; activeSessions: number; completedSessions: number } {
    return {
      status: "healthy",
      activeSessions: this.activeSessions.size,
      completedSessions: this.completedSessions.length,
    };
  }

  // ── Private Init ───────────────────────────────────────────────

  private initializeQuickActions(): void {
    this.quickActions = [
      { id: "qa-new-doc", label: "New Document", description: "Create a blank document", domain: "workspace", icon: "FileText", action: "create-doc", shortcut: "Ctrl+N", pinned: true },
      { id: "qa-new-proposal", label: "New Proposal", description: "Create from proposal template", domain: "business", icon: "FileSignature", action: "create-proposal", pinned: true },
      { id: "qa-new-invoice", label: "New Invoice", description: "Generate invoice", domain: "business", icon: "Receipt", action: "create-invoice", pinned: false },
      { id: "qa-boardroom", label: "Start Boardroom", description: "Launch boardroom session", domain: "boardroom", icon: "Users", action: "start-boardroom", shortcut: "Ctrl+B", pinned: true },
      { id: "qa-budget-review", label: "Budget Review", description: "Open budget analysis", domain: "finance", icon: "PiggyBank", action: "open-budget", pinned: false },
      { id: "qa-travel-plan", label: "Plan Travel", description: "Create travel itinerary", domain: "concierge", icon: "Plane", action: "plan-travel", pinned: false },
      { id: "qa-focus-mode", label: "Focus Mode", description: "Enter distraction-free focus", domain: "workspace", icon: "Target", action: "start-focus", shortcut: "Ctrl+Shift+F", pinned: true },
      { id: "qa-daily-pulse", label: "Daily Pulse", description: "View today's summary", domain: "workspace", icon: "Activity", action: "open-pulse", shortcut: "Ctrl+D", pinned: true },
      { id: "qa-approvals", label: "Pending Approvals", description: "Review awaiting actions", domain: "workspace", icon: "CheckSquare", action: "open-approvals", pinned: true },
      { id: "qa-search", label: "Search Everything", description: "Global search across all data", domain: "workspace", icon: "Search", action: "global-search", shortcut: "Ctrl+K", pinned: true },
    ];
  }

  private initializeLayouts(): void {
    const layouts: WorkspaceLayout[] = [
      {
        id: "layout-standard", name: "Standard", density: "standard", isDefault: true,
        panels: [
          { id: "sidebar", type: "navigation", position: "auxiliary", visible: true },
          { id: "content", type: "main", position: "primary", visible: true },
          { id: "detail", type: "detail-panel", position: "detail", visible: false },
        ],
      },
      {
        id: "layout-analyst", name: "Analyst", density: "analyst", isDefault: false,
        panels: [
          { id: "sidebar", type: "navigation", position: "auxiliary", visible: true },
          { id: "content", type: "main", position: "primary", visible: true },
          { id: "detail", type: "detail-panel", position: "detail", visible: true },
          { id: "metrics", type: "metrics-strip", position: "auxiliary", visible: true },
        ],
      },
      {
        id: "layout-focus", name: "Focus", density: "focus", isDefault: false,
        panels: [
          { id: "content", type: "main", position: "primary", visible: true },
        ],
      },
      {
        id: "layout-presentation", name: "Presentation", density: "presentation", isDefault: false,
        panels: [
          { id: "content", type: "main", position: "primary", visible: true },
        ],
      },
    ];

    layouts.forEach(l => this.layouts.set(l.id, l));
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createProductivityEngine(): ProductivityEngine {
  return new ProductivityEngine();
}
