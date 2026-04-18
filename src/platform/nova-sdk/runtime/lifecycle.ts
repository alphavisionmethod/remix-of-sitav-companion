// ═══════════════════════════════════════════════════════════════
// Nova SDK — App Lifecycle Manager
// Formal state machine with lifecycle hooks
// ═══════════════════════════════════════════════════════════════

import { AppRegistry, type AppRuntimeState } from "../core/registry";
import { NovaEvents } from "../input/events";

export interface NovaAppLifecycle {
  onLaunch?: () => void | Promise<void>;
  onFocus?: () => void;
  onBlur?: () => void;
  onSuspend?: () => void;
  onResume?: () => void;
  onExit?: () => void;
}

const VALID_TRANSITIONS: Record<AppRuntimeState, AppRuntimeState[]> = {
  "registered": ["launching"],
  "launching": ["permission-check", "running", "terminated"],
  "permission-check": ["running", "terminated"],
  "running": ["focused", "blurred", "suspending", "terminated"],
  "focused": ["blurred", "suspending", "terminated"],
  "blurred": ["focused", "suspending", "terminated"],
  "suspending": ["registered", "terminated"],
  "terminated": ["registered"],
};

export class LifecycleManager {
  private hooks = new Map<string, NovaAppLifecycle>();

  registerHooks(appId: string, hooks: NovaAppLifecycle): void {
    this.hooks.set(appId, hooks);
  }

  unregisterHooks(appId: string): void {
    this.hooks.delete(appId);
  }

  async transition(appId: string, targetState: AppRuntimeState): Promise<boolean> {
    const app = AppRegistry.getApp(appId);
    if (!app) {
      console.warn(`[Lifecycle] App "${appId}" not found`);
      return false;
    }

    const currentState = app.state;
    const validTargets = VALID_TRANSITIONS[currentState];
    if (!validTargets?.includes(targetState)) {
      console.warn(`[Lifecycle] Invalid transition: ${currentState} → ${targetState} for "${appId}"`);
      return false;
    }

    const hooks = this.hooks.get(appId);

    // Call hooks based on transition
    try {
      switch (targetState) {
        case "running":
          await hooks?.onLaunch?.();
          // Start runtime event loop
          app.runtime?.start();
          break;
        case "focused":
          hooks?.onFocus?.();
          app.runtime?.resume();
          break;
        case "blurred":
          hooks?.onBlur?.();
          break;
        case "suspending":
          hooks?.onSuspend?.();
          // Pause runtime event loop during suspend
          app.runtime?.pause();
          break;
        case "terminated":
          hooks?.onExit?.();
          // Full runtime cleanup
          app.runtime?.destroy();
          break;
      }
    } catch (e) {
      console.error(`[Lifecycle] Hook error during ${currentState}→${targetState} for "${appId}":`, e);
      // Report to error boundary if available
      if (e instanceof Error && app.runtime) {
        app.runtime.errorBoundary.handleError(e);
      }
    }

    AppRegistry.setState(appId, targetState);
    NovaEvents.emit("lifecycle:" + targetState as any, { appId, from: currentState, to: targetState });
    return true;
  }

  getState(appId: string): AppRuntimeState | undefined {
    return AppRegistry.getApp(appId)?.state;
  }
}

export const lifecycleManager = new LifecycleManager();
