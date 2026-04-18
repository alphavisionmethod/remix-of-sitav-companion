// ═══════════════════════════════════════════════════════════════
// SITA OS — App Lifecycle Model
// Full 12-state lifecycle for managed applications
// ═══════════════════════════════════════════════════════════════

export type AppState =
  | 'available' | 'installing' | 'installed' | 'verifying'
  | 'first_launch' | 'awaiting_permission' | 'running' | 'focused'
  | 'suspended' | 'crashed' | 'quarantined' | 'disabled'
  | 'pending_update' | 'updating' | 'uninstalling' | 'terminated';

export type AppTransition =
  | 'install' | 'verify' | 'launch' | 'grant_permission' | 'focus'
  | 'blur' | 'suspend' | 'resume' | 'crash' | 'recover'
  | 'quarantine' | 'release' | 'disable' | 'enable'
  | 'begin_update' | 'finish_update' | 'uninstall' | 'terminate'
  | 'force_stop';

export interface AppInstance {
  appId: string;
  displayName: string;
  state: AppState;
  version: string;
  installedAt?: number;
  lastLaunchedAt?: number;
  crashCount: number;
  permissions: string[];
  pendingPermissions: string[];
  quarantineReason?: string;
  updateVersion?: string;
  retainDataOnUninstall: boolean;
  backgroundAllowed: boolean;
  startupApp: boolean;
  resourceUsage: { memoryMB: number; cpuPercent: number };
}

// Valid transitions map
const VALID_TRANSITIONS: Record<AppState, AppTransition[]> = {
  available: ['install'],
  installing: ['verify'],
  installed: ['launch', 'uninstall', 'disable'],
  verifying: ['launch', 'quarantine'],
  first_launch: ['grant_permission', 'terminate'],
  awaiting_permission: ['grant_permission', 'terminate'],
  running: ['focus', 'suspend', 'crash', 'terminate', 'force_stop', 'begin_update'],
  focused: ['blur', 'suspend', 'crash', 'terminate', 'force_stop'],
  suspended: ['resume', 'terminate', 'uninstall', 'begin_update'],
  crashed: ['recover', 'quarantine', 'terminate', 'uninstall'],
  quarantined: ['release', 'uninstall'],
  disabled: ['enable', 'uninstall'],
  pending_update: ['begin_update', 'terminate'],
  updating: ['finish_update', 'crash'],
  uninstalling: [],
  terminated: ['launch', 'uninstall'],
};

const NEXT_STATE: Record<AppTransition, AppState> = {
  install: 'installing',
  verify: 'verifying',
  launch: 'running',
  grant_permission: 'running',
  focus: 'focused',
  blur: 'running',
  suspend: 'suspended',
  resume: 'running',
  crash: 'crashed',
  recover: 'running',
  quarantine: 'quarantined',
  release: 'installed',
  disable: 'disabled',
  enable: 'installed',
  begin_update: 'updating',
  finish_update: 'installed',
  uninstall: 'uninstalling',
  terminate: 'terminated',
  force_stop: 'terminated',
};

type LifecycleListener = (appId: string, from: AppState, to: AppState, transition: AppTransition) => void;

class AppLifecycleManager {
  private apps = new Map<string, AppInstance>();
  private listeners: LifecycleListener[] = [];
  private transitionLog: { appId: string; from: AppState; to: AppState; transition: AppTransition; at: number }[] = [];

  register(app: AppInstance): void {
    this.apps.set(app.appId, app);
  }

  transition(appId: string, t: AppTransition): { success: boolean; error?: string } {
    const app = this.apps.get(appId);
    if (!app) return { success: false, error: `App not found: ${appId}` };

    const valid = VALID_TRANSITIONS[app.state];
    if (!valid.includes(t)) {
      return { success: false, error: `Invalid transition ${t} from state ${app.state}` };
    }

    // Crash-loop detection
    if (t === 'crash') {
      app.crashCount++;
      if (app.crashCount >= 5) {
        const from = app.state;
        app.state = 'quarantined';
        app.quarantineReason = 'Crash loop detected (5+ crashes)';
        this.log(appId, from, 'quarantined', 'quarantine');
        return { success: true };
      }
    }
    if (t === 'recover') app.crashCount = 0;

    const from = app.state;
    const to = NEXT_STATE[t];
    app.state = to;

    if (t === 'launch') app.lastLaunchedAt = Date.now();
    if (t === 'install') app.installedAt = Date.now();

    this.log(appId, from, to, t);
    return { success: true };
  }

  private log(appId: string, from: AppState, to: AppState, transition: AppTransition) {
    this.transitionLog.push({ appId, from, to, transition, at: Date.now() });
    this.listeners.forEach(l => { try { l(appId, from, to, transition); } catch {} });
  }

  getApp(appId: string): AppInstance | undefined { return this.apps.get(appId); }
  allApps(): AppInstance[] { return [...this.apps.values()]; }
  getByState(state: AppState): AppInstance[] { return this.allApps().filter(a => a.state === state); }
  getTransitionLog(appId?: string) { return appId ? this.transitionLog.filter(e => e.appId === appId) : [...this.transitionLog]; }

  subscribe(listener: LifecycleListener): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  stats() {
    const apps = this.allApps();
    const byState: Partial<Record<AppState, number>> = {};
    apps.forEach(a => { byState[a.state] = (byState[a.state] ?? 0) + 1; });
    return { total: apps.length, byState, crashLoops: apps.filter(a => a.state === 'quarantined').length };
  }
}

export const appLifecycle = new AppLifecycleManager();
