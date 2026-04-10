// ═══════════════════════════════════════════════════════════════
// SITA OS — Adaptive Interface System
// Context-driven UI adaptation: density, layout, animations
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";

export type InterfaceDensity = "calm" | "standard" | "focus" | "analyst" | "presentation";
export type AnimationLevel = "none" | "subtle" | "standard" | "rich";

export interface InterfaceState {
  density: InterfaceDensity;
  animationLevel: AnimationLevel;
  prioritySections: string[];
  suppressedSections: string[];
  colorTemperature: "warm" | "neutral" | "cool";
  fontSize: "compact" | "standard" | "large";
  informationDepth: "glanceable" | "summary" | "detailed" | "exhaustive";
  interactionMode: "touch" | "keyboard" | "voice" | "mixed";
}

export interface AdaptiveContext {
  surface: string;
  cognitiveLoad: number;
  currentMode: string;
  urgentItemCount: number;
  timeOfDay: number;
  isMoving: boolean;
  trustLevel: string;
  roleMode: string;
}

export class AdaptiveInterfaceService {
  private currentState: InterfaceState = {
    density: "standard", animationLevel: "standard", prioritySections: [],
    suppressedSections: [], colorTemperature: "neutral", fontSize: "standard",
    informationDepth: "summary", interactionMode: "mixed",
  };

  getInterfaceState(ctx: AdaptiveContext): InterfaceState {
    const state = { ...this.currentState };

    // Surface-based
    if (ctx.surface === "watch" || ctx.surface === "wearable") {
      state.density = "calm"; state.informationDepth = "glanceable"; state.fontSize = "large"; state.animationLevel = "none"; state.interactionMode = "touch";
    } else if (ctx.surface === "mobile" || ctx.surface === "capacitor") {
      state.density = "standard"; state.interactionMode = "touch"; state.informationDepth = "summary";
    } else if (ctx.surface === "boardroom" || ctx.surface === "spatial") {
      state.density = "presentation"; state.animationLevel = "rich"; state.informationDepth = "detailed";
    }

    // Cognitive load
    if (ctx.cognitiveLoad > 75) { state.density = "calm"; state.animationLevel = "none"; state.informationDepth = "glanceable"; }
    else if (ctx.cognitiveLoad > 50) { state.animationLevel = "subtle"; }

    // Mode overrides
    if (ctx.currentMode === "focus") { state.density = "focus"; state.suppressedSections.push("notifications", "social"); state.animationLevel = "none"; }
    if (ctx.currentMode === "investor_demo") { state.density = "presentation"; state.animationLevel = "rich"; }
    if (ctx.currentMode === "recovery") { state.density = "calm"; state.colorTemperature = "warm"; state.animationLevel = "subtle"; }

    // Time-based
    if (ctx.timeOfDay >= 21 || ctx.timeOfDay < 6) { state.colorTemperature = "warm"; state.animationLevel = "subtle"; }

    // Movement
    if (ctx.isMoving) { state.fontSize = "large"; state.density = "calm"; state.interactionMode = "touch"; }

    // Urgency
    if (ctx.urgentItemCount > 5) state.prioritySections.push("priority_stack", "approvals");

    this.currentState = state;
    this._persist();
    return state;
  }

  getCurrentState(): InterfaceState { return { ...this.currentState }; }

  private _persist = () => debouncedSaveServiceState("adaptive-interface", { state: this.currentState });
  async loadPersistedState(): Promise<void> { const s = await loadServiceState("adaptive-interface"); if (s && (s as Record<string,unknown>).state) this.currentState = (s as Record<string,unknown>).state as InterfaceState; }
}

export const createAdaptiveInterface = () => new AdaptiveInterfaceService();
