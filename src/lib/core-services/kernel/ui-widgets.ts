// ═══════════════════════════════════════════════════════════════
// SITA OS — Extended UI Widgets
// ScrollView, ListView (recycling), MultiLineText, WidgetStates,
// and Input Widgets (TextInput, Checkbox, Slider, Toggle)
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";
import type { Color } from "./software-rasterizer";
import {
  ViewNode,
  type ViewNodeType,
  type MeasureResult,
  type DrawContext,
  type ViewHitTestResult,
} from "./view-tree";
import type { UITheme } from "./ui-theme";

// ── Helpers ─────────────────────────────────────────────────

function resolvePadding(p?: number | [number, number, number, number]): [number, number, number, number] {
  if (p === undefined) return [0, 0, 0, 0];
  if (typeof p === "number") return [p, p, p, p];
  return p;
}

function clampSize(value: number, style: { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number }, isHeight = false): number {
  const min = isHeight ? (style.minHeight ?? 0) : (style.minWidth ?? 0);
  const max = isHeight ? (style.maxHeight ?? Infinity) : (style.maxWidth ?? Infinity);
  return Math.max(min, Math.min(max, value));
}

// ═════════════════════════════════════════════════════════════
// 1. Widget State System
// ═════════════════════════════════════════════════════════════

export type WidgetState = "normal" | "hovered" | "pressed" | "focused" | "disabled";

export interface WidgetStateColors {
  background: Color;
  foreground: Color;
  border: Color;
}

export interface StatefulWidgetConfig {
  normal: WidgetStateColors;
  hovered: WidgetStateColors;
  pressed: WidgetStateColors;
  focused: WidgetStateColors;
  disabled: WidgetStateColors;
}

const DEFAULT_STATE_CONFIG: StatefulWidgetConfig = {
  normal:   { background: { r: 59, g: 130, b: 246, a: 255 }, foreground: { r: 255, g: 255, b: 255, a: 255 }, border: { r: 59, g: 130, b: 246, a: 255 } },
  hovered:  { background: { r: 96, g: 165, b: 250, a: 255 }, foreground: { r: 255, g: 255, b: 255, a: 255 }, border: { r: 96, g: 165, b: 250, a: 255 } },
  pressed:  { background: { r: 37, g: 99, b: 235, a: 255 }, foreground: { r: 255, g: 255, b: 255, a: 255 }, border: { r: 37, g: 99, b: 235, a: 255 } },
  focused:  { background: { r: 59, g: 130, b: 246, a: 255 }, foreground: { r: 255, g: 255, b: 255, a: 255 }, border: { r: 147, g: 197, b: 253, a: 255 } },
  disabled: { background: { r: 148, g: 163, b: 184, a: 128 }, foreground: { r: 255, g: 255, b: 255, a: 128 }, border: { r: 148, g: 163, b: 184, a: 128 } },
};

/** Mixin class for stateful widgets */
export abstract class StatefulWidget extends ViewNode {
  private _state: WidgetState = "normal";
  stateConfig: StatefulWidgetConfig = { ...DEFAULT_STATE_CONFIG };

  get widgetState(): WidgetState { return this._state; }

  setState(state: WidgetState): void {
    if (this._state === state) return;
    this._state = state;
    this.markDirty();
  }

  get currentColors(): WidgetStateColors {
    return this.stateConfig[this._state];
  }

  /** Simulate pointer events for state transitions */
  handlePointerEnter(): void { if (this._state !== "disabled") this.setState("hovered"); }
  handlePointerLeave(): void { if (this._state !== "disabled") this.setState("normal"); }
  handlePointerDown(): void { if (this._state !== "disabled") this.setState("pressed"); }
  handlePointerUp(): void { if (this._state !== "disabled") this.setState("hovered"); }
  handleFocus(): void { if (this._state !== "disabled") this.setState("focused"); }
  handleBlur(): void { if (this._state !== "disabled") this.setState("normal"); }
}

// ═════════════════════════════════════════════════════════════
// 2. ScrollView
// ═════════════════════════════════════════════════════════════

export class ScrollViewNode extends ViewNode {
  readonly type: ViewNodeType = "scroll-view" as ViewNodeType;

  /** Current scroll offset (pixels) */
  scrollX = 0;
  scrollY = 0;

  /** Content size (computed during layout) */
  contentWidth = 0;
  contentHeight = 0;

  /** Scroll bar visibility */
  showHorizontalBar = false;
  showVerticalBar = true;
  scrollBarWidth = 6;
  scrollBarColor: Color = { r: 128, g: 128, b: 128, a: 128 };

  constructor(id?: string) {
    super(id);
    this.style.overflow = "hidden";
  }

  /** Scroll to absolute position, clamped to bounds */
  scrollTo(x: number, y: number): void {
    const maxX = Math.max(0, this.contentWidth - this.resolvedBounds.width);
    const maxY = Math.max(0, this.contentHeight - this.resolvedBounds.height);
    const newX = Math.max(0, Math.min(maxX, x));
    const newY = Math.max(0, Math.min(maxY, y));
    if (newX !== this.scrollX || newY !== this.scrollY) {
      this.scrollX = newX;
      this.scrollY = newY;
      this.markDirty();
    }
  }

  /** Scroll by relative delta */
  scrollBy(dx: number, dy: number): void {
    this.scrollTo(this.scrollX + dx, this.scrollY + dy);
  }

  /** Viewport rect in content space */
  get viewport(): Rect {
    return {
      x: this.scrollX,
      y: this.scrollY,
      width: this.resolvedBounds.width,
      height: this.resolvedBounds.height,
    };
  }

  /** Whether content overflows vertically */
  get canScrollVertically(): boolean {
    return this.contentHeight > this.resolvedBounds.height;
  }

  /** Whether content overflows horizontally */
  get canScrollHorizontally(): boolean {
    return this.contentWidth > this.resolvedBounds.width;
  }

  measure(maxWidth: number, maxHeight: number): MeasureResult {
    const w = this.style.width ?? maxWidth;
    const h = this.style.height ?? maxHeight;
    // Measure children to determine content size
    let cw = 0, ch = 0;
    for (const c of this.children) {
      const cm = c.measure(maxWidth, Infinity); // unconstrained height for scroll
      cw = Math.max(cw, cm.width);
      ch += cm.height;
    }
    this.contentWidth = cw;
    this.contentHeight = ch;
    return { width: clampSize(w, this.style), height: clampSize(h, this.style, true) };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
    // Layout children in a column, offset by scroll
    let cy = y - this.scrollY;
    for (const c of this.children) {
      if (c.style.visible === false) continue;
      const cm = c.measure(width, Infinity);
      c.layout(x - this.scrollX, cy, cm.width, cm.height);
      cy += cm.height;
    }
    this.contentHeight = cy - (y - this.scrollY);
  }

  draw(ctx: DrawContext): void {
    const b = this.resolvedBounds;
    // Clip to viewport
    ctx.setClipRect(b);

    // Draw visible children
    for (const c of this.children) {
      if (c.style.visible === false) continue;
      const cb = c.resolvedBounds;
      // Skip if fully outside viewport
      if (cb.y + cb.height < b.y || cb.y > b.y + b.height) continue;
      if (cb.x + cb.width < b.x || cb.x > b.x + b.width) continue;
      c.draw(ctx);
    }

    // Draw scroll bars
    if (this.showVerticalBar && this.canScrollVertically) {
      const trackH = b.height;
      const thumbRatio = b.height / this.contentHeight;
      const thumbH = Math.max(20, trackH * thumbRatio);
      const maxScroll = this.contentHeight - b.height;
      const thumbY = maxScroll > 0 ? (this.scrollY / maxScroll) * (trackH - thumbH) : 0;
      ctx.fillRoundedRect(
        b.x + b.width - this.scrollBarWidth - 2, b.y + thumbY,
        this.scrollBarWidth, thumbH,
        [3, 3, 3, 3], this.scrollBarColor
      );
    }

    if (this.showHorizontalBar && this.canScrollHorizontally) {
      const trackW = b.width;
      const thumbRatio = b.width / this.contentWidth;
      const thumbW = Math.max(20, trackW * thumbRatio);
      const maxScroll = this.contentWidth - b.width;
      const thumbX = maxScroll > 0 ? (this.scrollX / maxScroll) * (trackW - thumbW) : 0;
      ctx.fillRoundedRect(
        b.x + thumbX, b.y + b.height - this.scrollBarWidth - 2,
        thumbW, this.scrollBarWidth,
        [3, 3, 3, 3], this.scrollBarColor
      );
    }

    ctx.clearClip();
  }

  /** Override hit test to account for scroll offset */
  hitTest(x: number, y: number, depth = 0): ViewHitTestResult | null {
    if (this.style.visible === false) return null;
    const b = this.resolvedBounds;
    if (x < b.x || x > b.x + b.width || y < b.y || y > b.y + b.height) return null;

    // Test children (already offset by scroll in layout)
    for (let i = this.children.length - 1; i >= 0; i--) {
      const result = this.children[i].hitTest(x, y, depth + 1);
      if (result) return result;
    }

    return { nodeId: this.id, localX: x - b.x, localY: y - b.y, depth };
  }
}

// ═════════════════════════════════════════════════════════════
// 3. ListView with View Recycling
// ═════════════════════════════════════════════════════════════

export interface ListItemFactory {
  /** Create or update a ViewNode for the given index */
  createItem(index: number, recycled?: ViewNode): ViewNode;
  /** Return the height of item at index */
  getItemHeight(index: number): number;
}

export interface ListViewStats {
  totalItems: number;
  visibleItems: number;
  recycledCount: number;
  mountedNodes: number;
}

export class ListViewNode extends ViewNode {
  readonly type: ViewNodeType = "list-view" as ViewNodeType;

  private _factory: ListItemFactory;
  private _itemCount = 0;
  private _recyclePool: ViewNode[] = [];
  private _mountedItems = new Map<number, ViewNode>(); // index → node
  private _scrollOffset = 0;
  private _stats: ListViewStats = { totalItems: 0, visibleItems: 0, recycledCount: 0, mountedNodes: 0 };

  /** Buffer zone above/below viewport (pixels) for smoother scrolling */
  overscan = 50;

  constructor(id: string, factory: ListItemFactory, itemCount: number) {
    super(id);
    this._factory = factory;
    this._itemCount = itemCount;
    this.style.overflow = "hidden";
  }

  get itemCount(): number { return this._itemCount; }

  setItemCount(count: number): void {
    this._itemCount = count;
    this.markDirty();
  }

  get scrollOffset(): number { return this._scrollOffset; }

  scrollTo(offset: number): void {
    const maxOffset = Math.max(0, this._totalContentHeight() - this.resolvedBounds.height);
    this._scrollOffset = Math.max(0, Math.min(maxOffset, offset));
    this.markDirty();
  }

  scrollBy(delta: number): void {
    this.scrollTo(this._scrollOffset + delta);
  }

  /** Get total content height */
  private _totalContentHeight(): number {
    let total = 0;
    for (let i = 0; i < this._itemCount; i++) {
      total += this._factory.getItemHeight(i);
    }
    return total;
  }

  /** Determine visible range [startIndex, endIndex) */
  private _visibleRange(): { start: number; end: number } {
    const viewH = this.resolvedBounds.height;
    const topEdge = this._scrollOffset - this.overscan;
    const bottomEdge = this._scrollOffset + viewH + this.overscan;

    let y = 0;
    let start = 0;
    let end = this._itemCount;
    let foundStart = false;

    for (let i = 0; i < this._itemCount; i++) {
      const h = this._factory.getItemHeight(i);
      if (!foundStart && y + h > topEdge) {
        start = i;
        foundStart = true;
      }
      if (y > bottomEdge) {
        end = i;
        break;
      }
      y += h;
    }

    return { start, end };
  }

  /** Recycle unmounted items back to pool */
  private _recycleUnmounted(visStart: number, visEnd: number): void {
    for (const [idx, node] of this._mountedItems) {
      if (idx < visStart || idx >= visEnd) {
        this._recyclePool.push(node);
        this._mountedItems.delete(idx);
        this._stats.recycledCount++;
      }
    }
  }

  /** Ensure items in visible range are mounted */
  private _mountVisible(visStart: number, visEnd: number): void {
    for (let i = visStart; i < visEnd; i++) {
      if (!this._mountedItems.has(i)) {
        const recycled = this._recyclePool.pop();
        const node = this._factory.createItem(i, recycled);
        this._mountedItems.set(i, node);
        node.parent = this;
      }
    }
  }

  measure(maxWidth: number, _maxHeight: number): MeasureResult {
    const w = this.style.width ?? maxWidth;
    const h = this.style.height ?? 300;
    return { width: clampSize(w, this.style), height: clampSize(h, this.style, true) };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };

    const { start, end } = this._visibleRange();
    this._recycleUnmounted(start, end);
    this._mountVisible(start, end);

    // Position visible items
    let itemY = 0;
    for (let i = 0; i < start; i++) {
      itemY += this._factory.getItemHeight(i);
    }

    // Build children array from mounted items in order
    this.children = [];
    for (let i = start; i < end; i++) {
      const node = this._mountedItems.get(i);
      if (node) {
        const h = this._factory.getItemHeight(i);
        node.layout(x, y + itemY - this._scrollOffset, width, h);
        this.children.push(node);
        itemY += h;
      }
    }

    this._stats.totalItems = this._itemCount;
    this._stats.visibleItems = end - start;
    this._stats.mountedNodes = this._mountedItems.size;
  }

  draw(ctx: DrawContext): void {
    const b = this.resolvedBounds;
    ctx.setClipRect(b);
    for (const c of this.children) {
      const cb = c.resolvedBounds;
      if (cb.y + cb.height < b.y || cb.y > b.y + b.height) continue;
      c.draw(ctx);
    }
    ctx.clearClip();
  }

  getListStats(): ListViewStats {
    return { ...this._stats };
  }
}

// ═════════════════════════════════════════════════════════════
// 4. Multi-Line Text Widget
// ═════════════════════════════════════════════════════════════

export interface TextLine {
  text: string;
  y: number;
  width: number;
}

export class MultiLineTextNode extends ViewNode {
  readonly type: ViewNodeType = "multiline-text" as ViewNodeType;

  text = "";
  fontSize = 14;
  lineHeight = 1.5;
  color: Color = { r: 0, g: 0, b: 0, a: 255 };
  wordWrap = true;

  /** Computed layout lines */
  private _lines: TextLine[] = [];

  constructor(id?: string, text?: string) {
    super(id);
    if (text) this.text = text;
  }

  /** Break text into lines respecting maxWidth */
  private _wrapText(maxWidth: number): TextLine[] {
    if (!this.text) return [];
    const charW = this.fontSize * 0.6;
    const lineH = this.fontSize * this.lineHeight;
    const maxChars = this.wordWrap ? Math.max(1, Math.floor(maxWidth / charW)) : Infinity;

    const paragraphs = this.text.split("\n");
    const lines: TextLine[] = [];
    let y = 0;

    for (const para of paragraphs) {
      if (!para) {
        lines.push({ text: "", y, width: 0 });
        y += lineH;
        continue;
      }

      const words = para.split(" ");
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length > maxChars && currentLine) {
          lines.push({ text: currentLine, y, width: currentLine.length * charW });
          y += lineH;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push({ text: currentLine, y, width: currentLine.length * charW });
        y += lineH;
      }
    }

    return lines;
  }

  get lineCount(): number { return this._lines.length; }
  get lines(): ReadonlyArray<TextLine> { return this._lines; }

  measure(maxWidth: number, _maxHeight: number): MeasureResult {
    const pad = resolvePadding(this.style.padding);
    const innerW = (this.style.width ?? maxWidth) - pad[1] - pad[3];
    this._lines = this._wrapText(innerW);
    const lineH = this.fontSize * this.lineHeight;
    const textH = this._lines.length * lineH;
    return {
      width: clampSize(this.style.width ?? (maxWidth), this.style),
      height: clampSize(this.style.height ?? (textH + pad[0] + pad[2]), this.style, true),
    };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
    const pad = resolvePadding(this.style.padding);
    const innerW = width - pad[1] - pad[3];
    this._lines = this._wrapText(innerW);
  }

  draw(ctx: DrawContext): void {
    const b = this.resolvedBounds;
    const pad = resolvePadding(this.style.padding);
    for (const line of this._lines) {
      ctx.drawText(b.x + pad[3], b.y + pad[0] + line.y + this.fontSize, line.text, this.fontSize, this.color);
    }
  }
}

// ═════════════════════════════════════════════════════════════
// 5. Input Widgets
// ═════════════════════════════════════════════════════════════

// ── TextInput ───────────────────────────────────────────────

export class TextInputNode extends StatefulWidget {
  readonly type: ViewNodeType = "text-input" as ViewNodeType;

  value = "";
  placeholder = "";
  fontSize = 14;
  maxLength = 256;
  cursorPosition = 0;
  private _selectionStart = 0;
  private _selectionEnd = 0;

  onChange?: (value: string) => void;

  constructor(id?: string, placeholder?: string) {
    super(id);
    if (placeholder) this.placeholder = placeholder;
    this.style = {
      padding: [8, 12, 8, 12],
      borderRadius: 6,
      border: { width: 1, color: { r: 203, g: 213, b: 225, a: 255 } },
      background: { type: "solid", r: 255, g: 255, b: 255, a: 255 },
    };
  }

  /** Insert text at cursor */
  insertText(text: string): void {
    if (this.widgetState === "disabled") return;
    const before = this.value.slice(0, this.cursorPosition);
    const after = this.value.slice(this.cursorPosition);
    const newVal = (before + text + after).slice(0, this.maxLength);
    this.value = newVal;
    this.cursorPosition = Math.min(before.length + text.length, this.maxLength);
    this.onChange?.(this.value);
    this.markDirty();
  }

  /** Delete character before cursor */
  deleteBack(): void {
    if (this.widgetState === "disabled" || this.cursorPosition === 0) return;
    this.value = this.value.slice(0, this.cursorPosition - 1) + this.value.slice(this.cursorPosition);
    this.cursorPosition--;
    this.onChange?.(this.value);
    this.markDirty();
  }

  /** Set selection range */
  setSelection(start: number, end: number): void {
    this._selectionStart = Math.max(0, Math.min(start, this.value.length));
    this._selectionEnd = Math.max(0, Math.min(end, this.value.length));
  }

  get selectionRange(): [number, number] {
    return [this._selectionStart, this._selectionEnd];
  }

  measure(_maxWidth: number, _maxHeight: number): MeasureResult {
    const pad = resolvePadding(this.style.padding);
    const w = this.style.width ?? 200;
    const h = this.fontSize * 1.4 + pad[0] + pad[2];
    return { width: clampSize(w, this.style), height: clampSize(h, this.style, true) };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
  }

  draw(ctx: DrawContext): void {
    const b = this.resolvedBounds;
    const colors = this.currentColors;
    const pad = resolvePadding(this.style.padding);

    // Background
    ctx.fillRoundedRect(b.x, b.y, b.width, b.height, [6, 6, 6, 6], colors.background);

    // Border
    const borderColor = this.widgetState === "focused" ? colors.border : this.stateConfig.normal.border;
    const bw = 1;
    ctx.fillRect(b.x, b.y, b.width, bw, borderColor);
    ctx.fillRect(b.x, b.y + b.height - bw, b.width, bw, borderColor);
    ctx.fillRect(b.x, b.y + bw, bw, b.height - 2 * bw, borderColor);
    ctx.fillRect(b.x + b.width - bw, b.y + bw, bw, b.height - 2 * bw, borderColor);

    // Text or placeholder
    const displayText = this.value || this.placeholder;
    const textColor = this.value ? colors.foreground : { r: 148, g: 163, b: 184, a: 200 };
    ctx.drawText(b.x + pad[3], b.y + pad[0] + this.fontSize, displayText, this.fontSize, textColor);

    // Cursor (when focused)
    if (this.widgetState === "focused") {
      const charW = this.fontSize * 0.6;
      const cursorX = b.x + pad[3] + this.cursorPosition * charW;
      ctx.fillRect(cursorX, b.y + pad[0], 1, this.fontSize * 1.2, colors.foreground);
    }
  }
}

// ── Checkbox ────────────────────────────────────────────────

export class CheckboxNode extends StatefulWidget {
  readonly type: ViewNodeType = "checkbox" as ViewNodeType;

  checked = false;
  label = "";
  fontSize = 14;
  boxSize = 18;
  onChange?: (checked: boolean) => void;

  checkColor: Color = { r: 255, g: 255, b: 255, a: 255 };
  uncheckedBg: Color = { r: 255, g: 255, b: 255, a: 255 };
  checkedBg: Color = { r: 59, g: 130, b: 246, a: 255 };
  borderColor: Color = { r: 203, g: 213, b: 225, a: 255 };

  constructor(id?: string, label?: string) {
    super(id);
    if (label) this.label = label;
  }

  toggle(): void {
    if (this.widgetState === "disabled") return;
    this.checked = !this.checked;
    this.onChange?.(this.checked);
    this.markDirty();
  }

  measure(_maxWidth: number, _maxHeight: number): MeasureResult {
    const charW = this.fontSize * 0.6;
    const labelW = this.label ? this.label.length * charW + 8 : 0;
    return {
      width: clampSize(this.boxSize + labelW, this.style),
      height: clampSize(Math.max(this.boxSize, this.fontSize * 1.4), this.style, true),
    };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
  }

  draw(ctx: DrawContext): void {
    const b = this.resolvedBounds;
    const boxY = b.y + (b.height - this.boxSize) / 2;

    // Box background
    const bg = this.checked ? this.checkedBg : this.uncheckedBg;
    ctx.fillRoundedRect(b.x, boxY, this.boxSize, this.boxSize, [3, 3, 3, 3], bg);

    // Border
    if (!this.checked) {
      const bw = 1;
      ctx.fillRect(b.x, boxY, this.boxSize, bw, this.borderColor);
      ctx.fillRect(b.x, boxY + this.boxSize - bw, this.boxSize, bw, this.borderColor);
      ctx.fillRect(b.x, boxY + bw, bw, this.boxSize - 2 * bw, this.borderColor);
      ctx.fillRect(b.x + this.boxSize - bw, boxY + bw, bw, this.boxSize - 2 * bw, this.borderColor);
    }

    // Checkmark (simplified as a small filled rect)
    if (this.checked) {
      const inset = 4;
      ctx.fillRect(b.x + inset, boxY + inset, this.boxSize - inset * 2, this.boxSize - inset * 2, this.checkColor);
    }

    // Label
    if (this.label) {
      const colors = this.currentColors;
      ctx.drawText(b.x + this.boxSize + 8, b.y + (b.height + this.fontSize) / 2 - 2, this.label, this.fontSize, colors.foreground);
    }
  }
}

// ── Slider ──────────────────────────────────────────────────

export class SliderNode extends StatefulWidget {
  readonly type: ViewNodeType = "slider" as ViewNodeType;

  value = 0.5;
  min = 0;
  max = 1;
  step = 0;
  trackHeight = 4;
  thumbSize = 16;
  onChange?: (value: number) => void;

  trackColor: Color = { r: 226, g: 232, b: 240, a: 255 };
  fillColor: Color = { r: 59, g: 130, b: 246, a: 255 };
  thumbColor: Color = { r: 255, g: 255, b: 255, a: 255 };
  thumbBorderColor: Color = { r: 59, g: 130, b: 246, a: 255 };

  constructor(id?: string) {
    super(id);
  }

  /** Set value from a pointer X position in local coordinates */
  setValueFromX(localX: number): void {
    if (this.widgetState === "disabled") return;
    const b = this.resolvedBounds;
    const trackW = b.width - this.thumbSize;
    const ratio = Math.max(0, Math.min(1, (localX - this.thumbSize / 2) / trackW));
    let newVal = this.min + ratio * (this.max - this.min);
    if (this.step > 0) {
      newVal = Math.round(newVal / this.step) * this.step;
    }
    newVal = Math.max(this.min, Math.min(this.max, newVal));
    if (newVal !== this.value) {
      this.value = newVal;
      this.onChange?.(this.value);
      this.markDirty();
    }
  }

  /** Normalized 0-1 position */
  get normalizedValue(): number {
    return this.max > this.min ? (this.value - this.min) / (this.max - this.min) : 0;
  }

  measure(_maxWidth: number, _maxHeight: number): MeasureResult {
    const w = this.style.width ?? 200;
    return {
      width: clampSize(w, this.style),
      height: clampSize(Math.max(this.thumbSize, 24), this.style, true),
    };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
  }

  draw(ctx: DrawContext): void {
    const b = this.resolvedBounds;
    const trackY = b.y + (b.height - this.trackHeight) / 2;
    const trackW = b.width - this.thumbSize;
    const ratio = this.normalizedValue;

    // Track background
    ctx.fillRoundedRect(b.x + this.thumbSize / 2, trackY, trackW, this.trackHeight, [2, 2, 2, 2], this.trackColor);

    // Fill
    const fillW = trackW * ratio;
    if (fillW > 0) {
      ctx.fillRoundedRect(b.x + this.thumbSize / 2, trackY, fillW, this.trackHeight, [2, 2, 2, 2], this.fillColor);
    }

    // Thumb
    const thumbX = b.x + ratio * trackW;
    const thumbY = b.y + (b.height - this.thumbSize) / 2;
    ctx.fillRoundedRect(thumbX, thumbY, this.thumbSize, this.thumbSize, [8, 8, 8, 8], this.thumbColor);
    // Thumb border
    const bw = 2;
    ctx.fillRoundedRect(thumbX, thumbY, this.thumbSize, bw, [8, 8, 0, 0], this.thumbBorderColor);
    ctx.fillRoundedRect(thumbX, thumbY + this.thumbSize - bw, this.thumbSize, bw, [0, 0, 8, 8], this.thumbBorderColor);
  }
}

// ── Toggle ──────────────────────────────────────────────────

export class ToggleNode extends StatefulWidget {
  readonly type: ViewNodeType = "toggle" as ViewNodeType;

  on = false;
  trackWidth = 44;
  trackHeight = 24;
  thumbSize = 20;
  onChange?: (on: boolean) => void;

  onColor: Color = { r: 59, g: 130, b: 246, a: 255 };
  offColor: Color = { r: 203, g: 213, b: 225, a: 255 };
  thumbColor: Color = { r: 255, g: 255, b: 255, a: 255 };

  constructor(id?: string) {
    super(id);
  }

  toggle(): void {
    if (this.widgetState === "disabled") return;
    this.on = !this.on;
    this.onChange?.(this.on);
    this.markDirty();
  }

  measure(_maxWidth: number, _maxHeight: number): MeasureResult {
    return {
      width: clampSize(this.trackWidth, this.style),
      height: clampSize(this.trackHeight, this.style, true),
    };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
  }

  draw(ctx: DrawContext): void {
    const b = this.resolvedBounds;
    const trackColor = this.on ? this.onColor : this.offColor;

    // Track
    ctx.fillRoundedRect(b.x, b.y, this.trackWidth, this.trackHeight, [12, 12, 12, 12], trackColor);

    // Thumb
    const thumbPad = (this.trackHeight - this.thumbSize) / 2;
    const thumbX = this.on
      ? b.x + this.trackWidth - this.thumbSize - thumbPad
      : b.x + thumbPad;
    const thumbY = b.y + thumbPad;
    ctx.fillRoundedRect(thumbX, thumbY, this.thumbSize, this.thumbSize, [10, 10, 10, 10], this.thumbColor);
  }
}
