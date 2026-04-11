// ═══════════════════════════════════════════════════════════════
// SITA OS — Input Event Pipeline
// Keyboard, mouse, touch, and gesture event processing with
// focus chain, event bubbling, modifier tracking, global hotkeys,
// and multi-touch gesture recognition.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export type InputEventType =
  | "keydown" | "keyup" | "keypress"
  | "mousemove" | "mousedown" | "mouseup" | "click" | "dblclick" | "contextmenu"
  | "scroll" | "dragstart" | "drag" | "dragend"
  | "touchstart" | "touchmove" | "touchend" | "touchcancel"
  | "gesture";

export type MouseButton = "left" | "middle" | "right" | "back" | "forward";
export type GestureType = "pinch" | "rotate" | "swipe" | "pan" | "longpress";
export type SwipeDirection = "up" | "down" | "left" | "right";

export interface ModifierState {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
  capsLock: boolean;
  numLock: boolean;
}

export interface KeyboardEvent {
  type: "keydown" | "keyup" | "keypress";
  key: string;
  code: string;
  repeat: boolean;
  modifiers: ModifierState;
  timestamp: number;
}

export interface MouseEvent {
  type: "mousemove" | "mousedown" | "mouseup" | "click" | "dblclick" | "contextmenu";
  x: number;
  y: number;
  button: MouseButton;
  buttons: number; // bitmask of pressed buttons
  modifiers: ModifierState;
  timestamp: number;
}

export interface ScrollEvent {
  type: "scroll";
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  modifiers: ModifierState;
  timestamp: number;
}

export interface DragEvent {
  type: "dragstart" | "drag" | "dragend";
  x: number;
  y: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  button: MouseButton;
  modifiers: ModifierState;
  timestamp: number;
}

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  pressure: number;
  radiusX: number;
  radiusY: number;
}

export interface TouchEvent {
  type: "touchstart" | "touchmove" | "touchend" | "touchcancel";
  touches: TouchPoint[];
  changedTouches: TouchPoint[];
  modifiers: ModifierState;
  timestamp: number;
}

export interface GestureEvent {
  type: "gesture";
  gesture: GestureType;
  x: number;
  y: number;
  scale?: number;       // pinch
  rotation?: number;    // rotate (degrees)
  direction?: SwipeDirection; // swipe
  velocity?: number;    // swipe/pan speed px/ms
  deltaX?: number;
  deltaY?: number;
  timestamp: number;
}

export type InputEvent = KeyboardEvent | MouseEvent | ScrollEvent | DragEvent | TouchEvent | GestureEvent;

export interface HotkeyBinding {
  id: string;
  key: string;
  modifiers: Partial<ModifierState>;
  action: () => void;
  description: string;
}

export interface InputFocusTarget {
  id: string;
  acceptsKeyboard: boolean;
  acceptsMouse: boolean;
  acceptsTouch: boolean;
}

export interface InputSystemStats {
  eventsProcessed: number;
  hotkeysRegistered: number;
  activePointers: number;
  gesturesRecognized: number;
  focusTargetId: string | null;
  modifiers: ModifierState;
  dragActive: boolean;
}

type InputEventHandler = (event: InputEvent, consumed: boolean) => boolean | void;

// ── Constants ────────────────────────────────────────────────

const DOUBLE_CLICK_MS = 400;
const DOUBLE_CLICK_DIST = 5;
const DRAG_THRESHOLD = 5;
const LONG_PRESS_MS = 500;
const SWIPE_MIN_VELOCITY = 0.3; // px/ms
const SWIPE_MIN_DIST = 30;

const EMPTY_MODIFIERS: ModifierState = {
  shift: false, ctrl: false, alt: false, meta: false,
  capsLock: false, numLock: false,
};

// ═════════════════════════════════════════════════════════════

export class InputSystem {
  private _handlers: InputEventHandler[] = [];
  private _hotkeys = new Map<string, HotkeyBinding>();
  private _modifiers: ModifierState = { ...EMPTY_MODIFIERS };
  private _eventsProcessed = 0;
  private _gesturesRecognized = 0;

  // Mouse state
  private _mouseX = 0;
  private _mouseY = 0;
  private _mouseButtons = 0;
  private _lastClickTime = 0;
  private _lastClickX = 0;
  private _lastClickY = 0;

  // Drag state
  private _dragActive = false;
  private _dragStartX = 0;
  private _dragStartY = 0;
  private _dragButton: MouseButton = "left";
  private _pendingDrag = false;
  private _pendingDragButton: MouseButton = "left";
  private _pendingDragX = 0;
  private _pendingDragY = 0;

  // Touch state
  private _activeTouches = new Map<number, TouchPoint>();
  private _touchStartTime = 0;
  private _touchStartPoints: TouchPoint[] = [];
  private _longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private _initialPinchDist = 0;
  private _initialPinchAngle = 0;

  // Focus
  private _focusTarget: InputFocusTarget | null = null;

  // ── Event dispatch ─────────────────────────────────────────

  addHandler(handler: InputEventHandler): () => void {
    this._handlers.push(handler);
    return () => { this._handlers = this._handlers.filter((h) => h !== handler); };
  }

  private _dispatch(event: InputEvent): boolean {
    this._eventsProcessed++;
    let consumed = false;
    for (const handler of this._handlers) {
      const result = handler(event, consumed);
      if (result === true) consumed = true;
    }
    return consumed;
  }

  // ── Keyboard ───────────────────────────────────────────────

  injectKeyDown(key: string, code: string, repeat = false): void {
    this._updateModifiersFromKey(key, true);
    const evt: KeyboardEvent = { type: "keydown", key, code, repeat, modifiers: { ...this._modifiers }, timestamp: performance.now() };

    // Check hotkeys
    if (this._tryHotkey(key)) return;

    this._dispatch(evt);
  }

  injectKeyUp(key: string, code: string): void {
    this._updateModifiersFromKey(key, false);
    const evt: KeyboardEvent = { type: "keyup", key, code, repeat: false, modifiers: { ...this._modifiers }, timestamp: performance.now() };
    this._dispatch(evt);
  }

  injectKeyPress(key: string, code: string): void {
    const evt: KeyboardEvent = { type: "keypress", key, code, repeat: false, modifiers: { ...this._modifiers }, timestamp: performance.now() };
    this._dispatch(evt);
  }

  // ── Mouse ──────────────────────────────────────────────────

  injectMouseMove(x: number, y: number): void {
    this._mouseX = x;
    this._mouseY = y;

    // Check if pending drag should activate
    if (this._pendingDrag) {
      const dx = x - this._pendingDragX;
      const dy = y - this._pendingDragY;
      if (Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD) {
        this._dragActive = true;
        this._dragStartX = this._pendingDragX;
        this._dragStartY = this._pendingDragY;
        this._dragButton = this._pendingDragButton;
        this._pendingDrag = false;
        this._dispatch({
          type: "dragstart", x: this._dragStartX, y: this._dragStartY,
          startX: this._dragStartX, startY: this._dragStartY,
          deltaX: 0, deltaY: 0, button: this._dragButton,
          modifiers: { ...this._modifiers }, timestamp: performance.now(),
        });
      }
    }

    if (this._dragActive) {
      this._dispatch({
        type: "drag", x, y,
        startX: this._dragStartX, startY: this._dragStartY,
        deltaX: x - this._dragStartX, deltaY: y - this._dragStartY,
        button: this._dragButton,
        modifiers: { ...this._modifiers }, timestamp: performance.now(),
      });
    } else {
      this._dispatch({
        type: "mousemove", x, y, button: "left", buttons: this._mouseButtons,
        modifiers: { ...this._modifiers }, timestamp: performance.now(),
      });
    }
  }

  injectMouseDown(x: number, y: number, button: MouseButton = "left"): void {
    this._mouseX = x;
    this._mouseY = y;
    this._mouseButtons |= this._buttonBit(button);
    this._pendingDrag = true;
    this._pendingDragX = x;
    this._pendingDragY = y;
    this._pendingDragButton = button;

    this._dispatch({
      type: "mousedown", x, y, button, buttons: this._mouseButtons,
      modifiers: { ...this._modifiers }, timestamp: performance.now(),
    });
  }

  injectMouseUp(x: number, y: number, button: MouseButton = "left"): void {
    this._mouseX = x;
    this._mouseY = y;
    this._mouseButtons &= ~this._buttonBit(button);
    this._pendingDrag = false;

    if (this._dragActive) {
      this._dragActive = false;
      this._dispatch({
        type: "dragend", x, y,
        startX: this._dragStartX, startY: this._dragStartY,
        deltaX: x - this._dragStartX, deltaY: y - this._dragStartY,
        button: this._dragButton,
        modifiers: { ...this._modifiers }, timestamp: performance.now(),
      });
    } else {
      this._dispatch({
        type: "mouseup", x, y, button, buttons: this._mouseButtons,
        modifiers: { ...this._modifiers }, timestamp: performance.now(),
      });

      // Click / double-click detection
      const now = performance.now();
      const dist = Math.sqrt((x - this._lastClickX) ** 2 + (y - this._lastClickY) ** 2);
      if (now - this._lastClickTime < DOUBLE_CLICK_MS && dist < DOUBLE_CLICK_DIST) {
        this._dispatch({
          type: "dblclick", x, y, button, buttons: this._mouseButtons,
          modifiers: { ...this._modifiers }, timestamp: now,
        });
        this._lastClickTime = 0;
      } else {
        this._dispatch({
          type: "click", x, y, button, buttons: this._mouseButtons,
          modifiers: { ...this._modifiers }, timestamp: now,
        });
        this._lastClickTime = now;
        this._lastClickX = x;
        this._lastClickY = y;
      }
    }
  }

  injectScroll(x: number, y: number, deltaX: number, deltaY: number, deltaZ = 0): void {
    this._dispatch({
      type: "scroll", x, y, deltaX, deltaY, deltaZ,
      modifiers: { ...this._modifiers }, timestamp: performance.now(),
    });
  }

  injectContextMenu(x: number, y: number): void {
    this._dispatch({
      type: "contextmenu", x, y, button: "right", buttons: this._mouseButtons,
      modifiers: { ...this._modifiers }, timestamp: performance.now(),
    });
  }

  // ── Touch ──────────────────────────────────────────────────

  injectTouchStart(touches: TouchPoint[]): void {
    for (const t of touches) this._activeTouches.set(t.id, { ...t });
    this._touchStartTime = performance.now();
    this._touchStartPoints = touches.map((t) => ({ ...t }));

    // Long press detection
    if (this._activeTouches.size === 1) {
      this._longPressTimer = setTimeout(() => {
        if (this._activeTouches.size === 1) {
          const pt = this._activeTouches.values().next().value!;
          this._gesturesRecognized++;
          this._dispatch({
            type: "gesture", gesture: "longpress",
            x: pt.x, y: pt.y, timestamp: performance.now(),
          });
        }
      }, LONG_PRESS_MS);
    } else {
      this._clearLongPress();
    }

    // Track initial pinch state for 2-finger gestures
    if (this._activeTouches.size === 2) {
      const pts = Array.from(this._activeTouches.values());
      this._initialPinchDist = this._dist(pts[0], pts[1]);
      this._initialPinchAngle = this._angle(pts[0], pts[1]);
    }

    this._dispatch({
      type: "touchstart",
      touches: Array.from(this._activeTouches.values()),
      changedTouches: touches,
      modifiers: { ...this._modifiers }, timestamp: performance.now(),
    });
  }

  injectTouchMove(touches: TouchPoint[]): void {
    for (const t of touches) this._activeTouches.set(t.id, { ...t });
    this._clearLongPress();

    // Gesture recognition for 2 fingers
    if (this._activeTouches.size === 2) {
      const pts = Array.from(this._activeTouches.values());
      const dist = this._dist(pts[0], pts[1]);
      const angle = this._angle(pts[0], pts[1]);

      const scale = dist / (this._initialPinchDist || 1);
      const rotation = angle - this._initialPinchAngle;
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;

      if (Math.abs(scale - 1) > 0.05) {
        this._gesturesRecognized++;
        this._dispatch({
          type: "gesture", gesture: "pinch",
          x: cx, y: cy, scale, timestamp: performance.now(),
        });
      }
      if (Math.abs(rotation) > 5) {
        this._gesturesRecognized++;
        this._dispatch({
          type: "gesture", gesture: "rotate",
          x: cx, y: cy, rotation, timestamp: performance.now(),
        });
      }
    }

    this._dispatch({
      type: "touchmove",
      touches: Array.from(this._activeTouches.values()),
      changedTouches: touches,
      modifiers: { ...this._modifiers }, timestamp: performance.now(),
    });
  }

  injectTouchEnd(touches: TouchPoint[]): void {
    // Swipe detection on single-finger lift
    if (this._activeTouches.size === 1 && this._touchStartPoints.length === 1) {
      const start = this._touchStartPoints[0];
      const end = touches[0] ?? start;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = performance.now() - this._touchStartTime;
      const velocity = elapsed > 0 ? dist / elapsed : 0;

      if (dist >= SWIPE_MIN_DIST && velocity >= SWIPE_MIN_VELOCITY) {
        const direction: SwipeDirection = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? "right" : "left")
          : (dy > 0 ? "down" : "up");
        this._gesturesRecognized++;
        this._dispatch({
          type: "gesture", gesture: "swipe",
          x: end.x, y: end.y, direction, velocity,
          deltaX: dx, deltaY: dy, timestamp: performance.now(),
        });
      }
    }

    for (const t of touches) this._activeTouches.delete(t.id);
    this._clearLongPress();

    this._dispatch({
      type: "touchend",
      touches: Array.from(this._activeTouches.values()),
      changedTouches: touches,
      modifiers: { ...this._modifiers }, timestamp: performance.now(),
    });
  }

  injectTouchCancel(touches: TouchPoint[]): void {
    for (const t of touches) this._activeTouches.delete(t.id);
    this._clearLongPress();
    this._dispatch({
      type: "touchcancel",
      touches: Array.from(this._activeTouches.values()),
      changedTouches: touches,
      modifiers: { ...this._modifiers }, timestamp: performance.now(),
    });
  }

  // ── Hotkeys ────────────────────────────────────────────────

  registerHotkey(binding: HotkeyBinding): () => void {
    this._hotkeys.set(binding.id, binding);
    return () => { this._hotkeys.delete(binding.id); };
  }

  getHotkeys(): HotkeyBinding[] {
    return Array.from(this._hotkeys.values());
  }

  // ── Focus ──────────────────────────────────────────────────

  setFocusTarget(target: InputFocusTarget | null): void {
    this._focusTarget = target;
  }

  getFocusTarget(): InputFocusTarget | null {
    return this._focusTarget;
  }

  // ── Stats ──────────────────────────────────────────────────

  getStats(): InputSystemStats {
    return {
      eventsProcessed: this._eventsProcessed,
      hotkeysRegistered: this._hotkeys.size,
      activePointers: this._activeTouches.size + (this._mouseButtons > 0 ? 1 : 0),
      gesturesRecognized: this._gesturesRecognized,
      focusTargetId: this._focusTarget?.id ?? null,
      modifiers: { ...this._modifiers },
      dragActive: this._dragActive,
    };
  }

  // ── Internal ───────────────────────────────────────────────

  private _updateModifiersFromKey(key: string, down: boolean): void {
    switch (key) {
      case "Shift": this._modifiers.shift = down; break;
      case "Control": this._modifiers.ctrl = down; break;
      case "Alt": this._modifiers.alt = down; break;
      case "Meta": this._modifiers.meta = down; break;
      case "CapsLock": if (down) this._modifiers.capsLock = !this._modifiers.capsLock; break;
      case "NumLock": if (down) this._modifiers.numLock = !this._modifiers.numLock; break;
    }
  }

  private _tryHotkey(key: string): boolean {
    for (const hk of this._hotkeys.values()) {
      if (hk.key !== key) continue;
      const m = hk.modifiers;
      if (m.shift !== undefined && m.shift !== this._modifiers.shift) continue;
      if (m.ctrl !== undefined && m.ctrl !== this._modifiers.ctrl) continue;
      if (m.alt !== undefined && m.alt !== this._modifiers.alt) continue;
      if (m.meta !== undefined && m.meta !== this._modifiers.meta) continue;
      hk.action();
      return true;
    }
    return false;
  }

  private _buttonBit(button: MouseButton): number {
    switch (button) {
      case "left": return 1;
      case "right": return 2;
      case "middle": return 4;
      case "back": return 8;
      case "forward": return 16;
    }
  }

  private _dist(a: TouchPoint, b: TouchPoint): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  private _angle(a: TouchPoint, b: TouchPoint): number {
    return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
  }

  private _clearLongPress(): void {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  }
}
