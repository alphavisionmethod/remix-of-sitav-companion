// ═══════════════════════════════════════════════════════════════
// Nova SDK — Event System
// Typed event bus with gesture recognition
// ═══════════════════════════════════════════════════════════════

export type NovaEventType =
  | "mouse:down" | "mouse:up" | "mouse:move"
  | "key:press" | "key:down" | "key:up"
  | "focus:change"
  | "gesture:tap" | "gesture:longpress" | "gesture:drag" | "gesture:pinch"
  | "lifecycle:launch" | "lifecycle:focus" | "lifecycle:blur" | "lifecycle:exit"
  | "app:state-change"
  | "custom";

export interface NovaEvent<T = any> {
  type: NovaEventType;
  target?: string;
  payload: T;
  timestamp: number;
  bubbles?: boolean;
}

type EventHandler<T = any> = (event: NovaEvent<T>) => void;

class NovaEventsClass {
  private listeners = new Map<string, Set<EventHandler>>();

  on<T = any>(type: NovaEventType, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler as EventHandler);
    return () => this.listeners.get(type)?.delete(handler as EventHandler);
  }

  once<T = any>(type: NovaEventType, handler: EventHandler<T>): () => void {
    const wrapper: EventHandler<T> = (event) => {
      handler(event);
      this.listeners.get(type)?.delete(wrapper as EventHandler);
    };
    return this.on(type, wrapper);
  }

  emit<T = any>(type: NovaEventType, payload: T, target?: string): void {
    const event: NovaEvent<T> = {
      type,
      payload,
      target,
      timestamp: Date.now(),
      bubbles: true,
    };
    this.listeners.get(type)?.forEach(h => {
      try { h(event); } catch (e) { console.error(`[NovaEvents] Error in handler for "${type}":`, e); }
    });
  }

  off(type: NovaEventType, handler: EventHandler): void {
    this.listeners.get(type)?.delete(handler);
  }

  clear(): void {
    this.listeners.clear();
  }

  // Gesture detection helper — long-press
  detectLongPress(element: HTMLElement, callback: () => void, delay = 500): () => void {
    let timer: ReturnType<typeof setTimeout>;
    const down = () => { timer = setTimeout(() => { callback(); this.emit("gesture:longpress", { element }); }, delay); };
    const up = () => clearTimeout(timer);
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointerleave", up);
    return () => {
      clearTimeout(timer);
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointerleave", up);
    };
  }
}

export const NovaEvents = new NovaEventsClass();
