// ═══════════════════════════════════════════════════════════════
// Nova SDK — Input Service
// Event pipeline, gesture detection, hotkeys, accessibility
// ═══════════════════════════════════════════════════════════════

import type { SystemService, ServiceStatus } from "./service-manager";
import { NovaEvents } from "../input/events";

export interface ModifierState {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean; // Cmd on macOS, Win on Windows
}

export interface HotkeyBinding {
  id: string;
  key: string;
  modifiers: Partial<ModifierState>;
  handler: () => void;
  description: string;
  global: boolean;
}

export interface GestureState {
  type: "none" | "tap" | "double-tap" | "long-press" | "drag" | "pinch" | "swipe";
  startX: number; startY: number;
  currentX: number; currentY: number;
  startTime: number;
  velocity: { x: number; y: number };
  scale?: number; // pinch
  direction?: "up" | "down" | "left" | "right"; // swipe
}

export interface InputRecording {
  id: string;
  events: Array<{ type: string; timestamp: number; data: unknown }>;
  startedAt: number;
  duration: number;
}

export interface AccessibilityConfig {
  stickyKeys: boolean;
  slowKeys: boolean;
  slowKeyDelay: number;
  mouseKeys: boolean;
  highContrastFocus: boolean;
}

const DOUBLE_CLICK_THRESHOLD = 300;
const DRAG_THRESHOLD = 5;
const LONG_PRESS_DELAY = 500;
const SWIPE_MIN_DISTANCE = 50;
const SWIPE_MAX_TIME = 500;

class InputServiceClass implements SystemService {
  id = "InputService";
  status: ServiceStatus = "stopped";

  private modifiers: ModifierState = { ctrl: false, alt: false, shift: false, meta: false };
  private hotkeys = new Map<string, HotkeyBinding>();
  private gestureState: GestureState = this.emptyGesture();
  private lastClickTime = 0;
  private lastClickX = 0;
  private lastClickY = 0;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private recording: InputRecording | null = null;
  private recordings: InputRecording[] = [];
  private accessibility: AccessibilityConfig = {
    stickyKeys: false, slowKeys: false, slowKeyDelay: 300,
    mouseKeys: false, highContrastFocus: false,
  };
  private eventCount = 0;
  private cleanups: (() => void)[] = [];

  boot(): void {
    this.status = "starting";
    this.attachDOMListeners();
    this.registerDefaultHotkeys();
    this.status = "running";
  }

  shutdown(): void {
    for (const cleanup of this.cleanups) cleanup();
    this.cleanups = [];
    this.hotkeys.clear();
    this.recording = null;
    this.status = "stopped";
  }

  // ── Hotkey Management ──

  registerHotkey(binding: HotkeyBinding): () => void {
    const key = this.hotkeyId(binding.key, binding.modifiers);
    this.hotkeys.set(key, binding);
    return () => this.hotkeys.delete(key);
  }

  unregisterHotkey(id: string): void {
    for (const [key, binding] of this.hotkeys) {
      if (binding.id === id) { this.hotkeys.delete(key); break; }
    }
  }

  getHotkeys(): HotkeyBinding[] {
    return [...this.hotkeys.values()];
  }

  // ── Modifier State ──

  getModifiers(): Readonly<ModifierState> { return { ...this.modifiers }; }

  // ── Gesture State ──

  getGestureState(): Readonly<GestureState> { return { ...this.gestureState }; }

  // ── Recording ──

  startRecording(id: string): void {
    this.recording = { id, events: [], startedAt: Date.now(), duration: 0 };
  }

  stopRecording(): InputRecording | null {
    if (!this.recording) return null;
    this.recording.duration = Date.now() - this.recording.startedAt;
    this.recordings.push(this.recording);
    const rec = this.recording;
    this.recording = null;
    return rec;
  }

  getRecordings(): InputRecording[] { return [...this.recordings]; }

  // ── Accessibility ──

  setAccessibility(config: Partial<AccessibilityConfig>): void {
    Object.assign(this.accessibility, config);
    NovaEvents.emit("app:state-change", { event: "accessibility:changed", config: this.accessibility });
  }

  getAccessibility(): AccessibilityConfig { return { ...this.accessibility }; }

  // ── Stats ──

  getStats() {
    return {
      eventCount: this.eventCount,
      hotkeyCount: this.hotkeys.size,
      recordingCount: this.recordings.length,
      isRecording: !!this.recording,
      modifiers: this.modifiers,
      accessibility: this.accessibility,
    };
  }

  getDiagnostics() {
    return {
      ...this.getStats(),
      hotkeys: [...this.hotkeys.values()].map(h => ({
        id: h.id, key: h.key, description: h.description, global: h.global,
      })),
      gestureState: this.gestureState.type,
    };
  }

  reset(): void {
    this.shutdown();
    this.eventCount = 0;
    this.recordings = [];
  }

  // ── Private: DOM Listeners ──

  private attachDOMListeners(): void {
    if (typeof window === "undefined") return;

    const onKeyDown = (e: KeyboardEvent) => {
      this.eventCount++;
      this.updateModifiers(e);
      this.recordEvent("keydown", { key: e.key, code: e.code, modifiers: { ...this.modifiers } });

      // Check hotkeys
      const hotkeyKey = this.hotkeyId(e.key.toLowerCase(), this.modifiers);
      const binding = this.hotkeys.get(hotkeyKey);
      if (binding) {
        e.preventDefault();
        binding.handler();
      }

      NovaEvents.emit("key:down", { key: e.key, code: e.code, modifiers: { ...this.modifiers } });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      this.eventCount++;
      this.updateModifiers(e);
      NovaEvents.emit("key:up", { key: e.key, code: e.code });
    };

    const onPointerDown = (e: PointerEvent) => {
      this.eventCount++;
      const now = Date.now();

      // Double-click detection
      const dx = e.clientX - this.lastClickX;
      const dy = e.clientY - this.lastClickY;
      const isDoubleClick = now - this.lastClickTime < DOUBLE_CLICK_THRESHOLD
        && Math.abs(dx) < 10 && Math.abs(dy) < 10;

      this.lastClickTime = now;
      this.lastClickX = e.clientX;
      this.lastClickY = e.clientY;

      // Start gesture tracking
      this.gestureState = {
        type: "none", startX: e.clientX, startY: e.clientY,
        currentX: e.clientX, currentY: e.clientY,
        startTime: now, velocity: { x: 0, y: 0 },
      };

      // Long press timer
      this.longPressTimer = setTimeout(() => {
        if (this.gestureState.type === "none") {
          this.gestureState.type = "long-press";
          NovaEvents.emit("gesture:longpress", { x: e.clientX, y: e.clientY });
        }
      }, LONG_PRESS_DELAY);

      if (isDoubleClick) {
        this.gestureState.type = "double-tap";
        NovaEvents.emit("gesture:tap", { x: e.clientX, y: e.clientY, count: 2 });
      }

      NovaEvents.emit("mouse:down", { x: e.clientX, y: e.clientY, button: e.button });
      this.recordEvent("pointerdown", { x: e.clientX, y: e.clientY });
    };

    const onPointerMove = (e: PointerEvent) => {
      this.eventCount++;
      if (this.gestureState.startTime > 0) {
        const dx = e.clientX - this.gestureState.startX;
        const dy = e.clientY - this.gestureState.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.gestureState.currentX = e.clientX;
        this.gestureState.currentY = e.clientY;

        if (dist > DRAG_THRESHOLD && this.gestureState.type !== "drag") {
          this.gestureState.type = "drag";
          if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
          NovaEvents.emit("gesture:drag", { x: e.clientX, y: e.clientY, dx, dy, phase: "start" });
        } else if (this.gestureState.type === "drag") {
          const dt = (Date.now() - this.gestureState.startTime) / 1000;
          this.gestureState.velocity = { x: dx / dt, y: dy / dt };
          NovaEvents.emit("gesture:drag", { x: e.clientX, y: e.clientY, dx, dy, phase: "move" });
        }
      }
      NovaEvents.emit("mouse:move", { x: e.clientX, y: e.clientY });
    };

    const onPointerUp = (e: PointerEvent) => {
      this.eventCount++;
      if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }

      const dx = e.clientX - this.gestureState.startX;
      const dy = e.clientY - this.gestureState.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = Date.now() - this.gestureState.startTime;

      // Swipe detection
      if (dist > SWIPE_MIN_DISTANCE && elapsed < SWIPE_MAX_TIME) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const direction = absDx > absDy
          ? (dx > 0 ? "right" : "left")
          : (dy > 0 ? "down" : "up");
        this.gestureState.type = "swipe";
        this.gestureState.direction = direction;
        NovaEvents.emit("gesture:tap", { x: e.clientX, y: e.clientY, swipe: true, direction });
      } else if (this.gestureState.type === "none" && dist < DRAG_THRESHOLD) {
        this.gestureState.type = "tap";
        NovaEvents.emit("gesture:tap", { x: e.clientX, y: e.clientY, count: 1 });
      }

      if (this.gestureState.type === "drag") {
        NovaEvents.emit("gesture:drag", { x: e.clientX, y: e.clientY, dx, dy, phase: "end" });
      }

      this.gestureState = this.emptyGesture();
      NovaEvents.emit("mouse:up", { x: e.clientX, y: e.clientY, button: e.button });
      this.recordEvent("pointerup", { x: e.clientX, y: e.clientY });
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    this.cleanups.push(
      () => window.removeEventListener("keydown", onKeyDown),
      () => window.removeEventListener("keyup", onKeyUp),
      () => window.removeEventListener("pointerdown", onPointerDown),
      () => window.removeEventListener("pointermove", onPointerMove),
      () => window.removeEventListener("pointerup", onPointerUp),
    );
  }

  private registerDefaultHotkeys(): void {
    // Default system hotkeys
    this.registerHotkey({ id: "sys:spotlight", key: "k", modifiers: { meta: true }, handler: () => NovaEvents.emit("app:state-change", { event: "spotlight:toggle" }), description: "Toggle Spotlight", global: true });
    this.registerHotkey({ id: "sys:close-window", key: "w", modifiers: { meta: true }, handler: () => NovaEvents.emit("app:state-change", { event: "window:close-focused" }), description: "Close Window", global: true });
    this.registerHotkey({ id: "sys:minimize", key: "m", modifiers: { meta: true }, handler: () => NovaEvents.emit("app:state-change", { event: "window:minimize-focused" }), description: "Minimize Window", global: true });
    this.registerHotkey({ id: "sys:fullscreen", key: "f", modifiers: { meta: true, ctrl: true }, handler: () => NovaEvents.emit("app:state-change", { event: "window:fullscreen-focused" }), description: "Toggle Fullscreen", global: true });
  }

  private updateModifiers(e: KeyboardEvent): void {
    this.modifiers.ctrl = e.ctrlKey;
    this.modifiers.alt = e.altKey;
    this.modifiers.shift = e.shiftKey;
    this.modifiers.meta = e.metaKey;
  }

  private hotkeyId(key: string, mods: Partial<ModifierState>): string {
    const parts: string[] = [];
    if (mods.meta) parts.push("meta");
    if (mods.ctrl) parts.push("ctrl");
    if (mods.alt) parts.push("alt");
    if (mods.shift) parts.push("shift");
    parts.push(key.toLowerCase());
    return parts.join("+");
  }

  private emptyGesture(): GestureState {
    return { type: "none", startX: 0, startY: 0, currentX: 0, currentY: 0, startTime: 0, velocity: { x: 0, y: 0 } };
  }

  private recordEvent(type: string, data: unknown): void {
    if (this.recording) {
      this.recording.events.push({ type, timestamp: Date.now(), data });
    }
  }
}

export const InputService = new InputServiceClass();
