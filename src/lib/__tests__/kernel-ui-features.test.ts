// ═══════════════════════════════════════════════════════════════
// Unit Tests — 8 Missing Features
// Hit Testing, ScrollView, ListView Recycling, Multi-Line Text,
// Widget States, Input Widgets, Theme System, Animation Groups
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  ViewTree, ContainerNode, ColumnNode, RowNode, TextWidget, ButtonWidget,
  type DrawContext,
} from "@/lib/core-services/kernel/view-tree";
import {
  ScrollViewNode, ListViewNode, MultiLineTextNode,
  TextInputNode, CheckboxNode, SliderNode, ToggleNode,
  type ListItemFactory,
} from "@/lib/core-services/kernel/ui-widgets";
import {
  ThemeManager, LIGHT_THEME, DARK_THEME,
} from "@/lib/core-services/kernel/ui-theme";
import {
  AnimationEngine, type AnimationDef,
} from "@/lib/core-services/kernel/animation-engine";
import type { Color } from "@/lib/core-services/kernel/software-rasterizer";

// ── Mock DrawContext ────────────────────────────────────────

function mockCtx(): DrawContext {
  return {
    fillRect: vi.fn(),
    fillRoundedRect: vi.fn(),
    drawText: vi.fn(),
    drawImage: vi.fn(),
    fillGradient: vi.fn(),
    setClipRect: vi.fn(),
    clearClip: vi.fn(),
    setOpacity: vi.fn(),
    resetOpacity: vi.fn(),
  };
}

// ═════════════════════════════════════════════════════════════
// 1. Hit Testing
// ═════════════════════════════════════════════════════════════

describe("Hit Testing", () => {
  let tree: ViewTree;
  let ctx: DrawContext;

  beforeEach(() => {
    tree = new ViewTree();
    ctx = mockCtx();
  });

  it("hits a leaf node within bounds", () => {
    const root = new ContainerNode("root");
    root.style = { width: 200, height: 200 };
    const btn = new ButtonWidget("btn", "Click");
    root.addChild(btn);
    tree.setRoot(root);
    tree.layoutPass(200, 200);

    const hit = tree.hitTest(10, 10);
    expect(hit).not.toBeNull();
    expect(hit!.nodeId).toBe("btn");
  });

  it("returns null for points outside all nodes", () => {
    const root = new ContainerNode("root");
    root.style = { width: 100, height: 100 };
    tree.setRoot(root);
    tree.layoutPass(100, 100);

    const hit = tree.hitTest(150, 150);
    expect(hit).toBeNull();
  });

  it("front-to-back: later children hit first", () => {
    const root = new ContainerNode("root");
    root.style = { width: 200, height: 200 };
    const a = new ButtonWidget("a", "A");
    const b = new ButtonWidget("b", "B");
    root.addChild(a);
    root.addChild(b);
    tree.setRoot(root);
    tree.layoutPass(200, 200);

    // Both overlap at origin; b is in front (later child)
    const hit = tree.hitTest(5, 5);
    expect(hit!.nodeId).toBe("b");
  });

  it("provides local coordinates", () => {
    const root = new ContainerNode("root");
    root.style = { width: 200, height: 200, padding: 20 };
    const btn = new ButtonWidget("btn", "Click");
    root.addChild(btn);
    tree.setRoot(root);
    tree.layoutPass(200, 200);

    const hit = tree.hitTest(25, 25);
    expect(hit).not.toBeNull();
    expect(hit!.localX).toBeGreaterThanOrEqual(0);
    expect(hit!.localY).toBeGreaterThanOrEqual(0);
  });

  it("hidden nodes are not hit", () => {
    const root = new ContainerNode("root");
    root.style = { width: 200, height: 200 };
    const btn = new ButtonWidget("btn", "Click");
    btn.style.visible = false;
    root.addChild(btn);
    tree.setRoot(root);
    tree.layoutPass(200, 200);

    const hit = tree.hitTest(5, 5);
    // Should hit root, not the hidden button
    expect(hit?.nodeId).toBe("root");
  });

  it("dispatchAtPoint fires event handlers", () => {
    const root = new ContainerNode("root");
    root.style = { width: 200, height: 200 };
    const btn = new ButtonWidget("btn", "Click");
    root.addChild(btn);
    tree.setRoot(root);
    tree.layoutPass(200, 200);

    const handler = vi.fn();
    tree.addEventListener("btn", "click", handler);
    tree.dispatchAtPoint(5, 5, "click");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("events bubble from child to parent", () => {
    const root = new ContainerNode("root");
    root.style = { width: 200, height: 200 };
    const btn = new ButtonWidget("btn", "Click");
    root.addChild(btn);
    tree.setRoot(root);
    tree.layoutPass(200, 200);

    const rootHandler = vi.fn();
    tree.addEventListener("root", "click", rootHandler);
    tree.dispatchAtPoint(5, 5, "click");
    expect(rootHandler).toHaveBeenCalledTimes(1);
  });
});

// ═════════════════════════════════════════════════════════════
// 2. ScrollView
// ═════════════════════════════════════════════════════════════

describe("ScrollView", () => {
  it("clips content to viewport", () => {
    const sv = new ScrollViewNode("sv");
    sv.style = { width: 200, height: 100 };
    // Add tall content
    for (let i = 0; i < 10; i++) {
      const text = new TextWidget(`t${i}`, `Item ${i}`);
      text.style = { height: 40 };
      sv.addChild(text);
    }

    sv.measure(200, 100);
    sv.layout(0, 0, 200, 100);

    expect(sv.contentHeight).toBeGreaterThan(100);
    expect(sv.canScrollVertically).toBe(true);
  });

  it("scrollTo clamps to bounds", () => {
    const sv = new ScrollViewNode("sv");
    sv.style = { width: 200, height: 100 };
    const text = new TextWidget("t", "Content");
    text.style = { height: 400 };
    sv.addChild(text);
    sv.measure(200, 100);
    sv.layout(0, 0, 200, 100);

    sv.scrollTo(0, 999);
    expect(sv.scrollY).toBeLessThanOrEqual(sv.contentHeight - 100);
    expect(sv.scrollY).toBeGreaterThan(0);

    sv.scrollTo(0, -100);
    expect(sv.scrollY).toBe(0);
  });

  it("scrollBy adjusts offset relatively", () => {
    const sv = new ScrollViewNode("sv");
    sv.style = { width: 200, height: 100 };
    const text = new TextWidget("t", "Content");
    text.style = { height: 400 };
    sv.addChild(text);
    sv.measure(200, 100);
    sv.layout(0, 0, 200, 100);

    sv.scrollBy(0, 50);
    expect(sv.scrollY).toBe(50);
    sv.scrollBy(0, 30);
    expect(sv.scrollY).toBe(80);
  });

  it("viewport reports correct region", () => {
    const sv = new ScrollViewNode("sv");
    sv.style = { width: 200, height: 100 };
    const text = new TextWidget("t", "Content");
    text.style = { height: 400 };
    sv.addChild(text);
    sv.measure(200, 100);
    sv.layout(0, 0, 200, 100);
    sv.scrollTo(0, 60);

    const vp = sv.viewport;
    expect(vp.y).toBe(60);
    expect(vp.height).toBe(100);
  });

  it("draws scrollbar when content overflows", () => {
    const sv = new ScrollViewNode("sv");
    sv.style = { width: 200, height: 100 };
    const text = new TextWidget("t", "Content");
    text.style = { height: 400 };
    sv.addChild(text);
    sv.measure(200, 100);
    sv.layout(0, 0, 200, 100);

    const ctx = mockCtx();
    sv.draw(ctx);
    // Should call fillRoundedRect for scrollbar thumb
    expect(ctx.fillRoundedRect).toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════
// 3. ListView Recycling
// ═════════════════════════════════════════════════════════════

describe("ListView Recycling", () => {
  const factory: ListItemFactory = {
    createItem: (index, recycled) => {
      const node = recycled ?? new TextWidget(`item-${index}`, `Item ${index}`);
      if (node instanceof TextWidget) node.text = `Item ${index}`;
      return node;
    },
    getItemHeight: () => 40,
  };

  it("only mounts items in visible range", () => {
    const lv = new ListViewNode("lv", factory, 100);
    lv.style = { width: 300, height: 200 };
    lv.measure(300, 200);
    lv.layout(0, 0, 300, 200);

    const stats = lv.getListStats();
    expect(stats.totalItems).toBe(100);
    // visible: 200px / 40px = 5 items, plus overscan
    expect(stats.visibleItems).toBeLessThan(20);
    expect(stats.visibleItems).toBeGreaterThanOrEqual(5);
  });

  it("recycles nodes when scrolling", () => {
    const lv = new ListViewNode("lv", factory, 100);
    lv.style = { width: 300, height: 200 };
    lv.measure(300, 200);
    lv.layout(0, 0, 300, 200);

    const statsBefore = lv.getListStats();
    const mountedBefore = statsBefore.mountedNodes;

    // Scroll far down
    lv.scrollTo(2000);
    lv.layout(0, 0, 300, 200);

    const statsAfter = lv.getListStats();
    expect(statsAfter.recycledCount).toBeGreaterThan(0);
    // Mounted count should be similar (recycled, not growing)
    expect(statsAfter.mountedNodes).toBeLessThanOrEqual(mountedBefore + 5);
  });

  it("scrollTo clamps to content bounds", () => {
    const lv = new ListViewNode("lv", factory, 10);
    lv.style = { width: 300, height: 200 };
    lv.measure(300, 200);
    lv.layout(0, 0, 300, 200);

    lv.scrollTo(99999);
    // Total content = 10 * 40 = 400. Max scroll = 400 - 200 = 200
    expect(lv.scrollOffset).toBeLessThanOrEqual(200);
  });

  it("setItemCount updates total", () => {
    const lv = new ListViewNode("lv", factory, 50);
    lv.setItemCount(200);
    expect(lv.itemCount).toBe(200);
  });
});

// ═════════════════════════════════════════════════════════════
// 4. Multi-Line Text
// ═════════════════════════════════════════════════════════════

describe("MultiLineText", () => {
  it("wraps long text into multiple lines", () => {
    const mlt = new MultiLineTextNode("mlt", "This is a long paragraph that should wrap across multiple lines when rendered");
    mlt.fontSize = 14;
    mlt.measure(100, 500);
    expect(mlt.lineCount).toBeGreaterThan(1);
  });

  it("respects explicit newlines", () => {
    const mlt = new MultiLineTextNode("mlt", "Line 1\nLine 2\nLine 3");
    mlt.measure(500, 500);
    expect(mlt.lineCount).toBe(3);
  });

  it("single short line doesn't wrap", () => {
    const mlt = new MultiLineTextNode("mlt", "Short");
    mlt.measure(500, 500);
    expect(mlt.lineCount).toBe(1);
  });

  it("empty text produces no lines", () => {
    const mlt = new MultiLineTextNode("mlt", "");
    mlt.measure(500, 500);
    expect(mlt.lineCount).toBe(0);
  });

  it("draws each line", () => {
    const mlt = new MultiLineTextNode("mlt", "Line 1\nLine 2");
    mlt.measure(500, 500);
    mlt.layout(0, 0, 500, 100);

    const ctx = mockCtx();
    mlt.draw(ctx);
    expect(ctx.drawText).toHaveBeenCalledTimes(2);
  });

  it("wordWrap=false doesn't break mid-paragraph", () => {
    const mlt = new MultiLineTextNode("mlt", "One continuous line without any breaks");
    mlt.wordWrap = false;
    mlt.measure(50, 500); // narrow width
    expect(mlt.lineCount).toBe(1);
  });
});

// ═════════════════════════════════════════════════════════════
// 5. Widget States
// ═════════════════════════════════════════════════════════════

describe("Widget States", () => {
  it("starts in normal state", () => {
    const input = new TextInputNode("inp");
    expect(input.widgetState).toBe("normal");
  });

  it("transitions through hover → press → hover → normal", () => {
    const input = new TextInputNode("inp");
    input.handlePointerEnter();
    expect(input.widgetState).toBe("hovered");
    input.handlePointerDown();
    expect(input.widgetState).toBe("pressed");
    input.handlePointerUp();
    expect(input.widgetState).toBe("hovered");
    input.handlePointerLeave();
    expect(input.widgetState).toBe("normal");
  });

  it("disabled state blocks transitions", () => {
    const input = new TextInputNode("inp");
    input.setState("disabled");
    input.handlePointerEnter();
    expect(input.widgetState).toBe("disabled");
    input.handlePointerDown();
    expect(input.widgetState).toBe("disabled");
  });

  it("focus/blur transitions work", () => {
    const input = new TextInputNode("inp");
    input.handleFocus();
    expect(input.widgetState).toBe("focused");
    input.handleBlur();
    expect(input.widgetState).toBe("normal");
  });

  it("currentColors reflect active state", () => {
    const input = new TextInputNode("inp");
    const normalBg = input.currentColors.background;
    input.handlePointerEnter();
    const hoverBg = input.currentColors.background;
    // They should be different (default config has different hover colors)
    expect(normalBg).not.toEqual(hoverBg);
  });
});

// ═════════════════════════════════════════════════════════════
// 6. Input Widgets
// ═════════════════════════════════════════════════════════════

describe("TextInput", () => {
  it("inserts text at cursor", () => {
    const input = new TextInputNode("inp");
    input.insertText("Hello");
    expect(input.value).toBe("Hello");
    expect(input.cursorPosition).toBe(5);
  });

  it("deleteBack removes character", () => {
    const input = new TextInputNode("inp");
    input.insertText("ABC");
    input.deleteBack();
    expect(input.value).toBe("AB");
    expect(input.cursorPosition).toBe(2);
  });

  it("respects maxLength", () => {
    const input = new TextInputNode("inp");
    input.maxLength = 5;
    input.insertText("1234567890");
    expect(input.value.length).toBe(5);
  });

  it("disabled blocks input", () => {
    const input = new TextInputNode("inp");
    input.setState("disabled");
    input.insertText("X");
    expect(input.value).toBe("");
  });

  it("fires onChange callback", () => {
    const input = new TextInputNode("inp");
    const cb = vi.fn();
    input.onChange = cb;
    input.insertText("A");
    expect(cb).toHaveBeenCalledWith("A");
  });

  it("selection range can be set", () => {
    const input = new TextInputNode("inp");
    input.insertText("Hello World");
    input.setSelection(0, 5);
    expect(input.selectionRange).toEqual([0, 5]);
  });
});

describe("Checkbox", () => {
  it("toggles checked state", () => {
    const cb = new CheckboxNode("cb", "Accept");
    expect(cb.checked).toBe(false);
    cb.toggle();
    expect(cb.checked).toBe(true);
    cb.toggle();
    expect(cb.checked).toBe(false);
  });

  it("fires onChange", () => {
    const cb = new CheckboxNode("cb");
    const fn = vi.fn();
    cb.onChange = fn;
    cb.toggle();
    expect(fn).toHaveBeenCalledWith(true);
  });

  it("disabled blocks toggle", () => {
    const cb = new CheckboxNode("cb");
    cb.setState("disabled");
    cb.toggle();
    expect(cb.checked).toBe(false);
  });
});

describe("Slider", () => {
  it("starts at default value", () => {
    const s = new SliderNode("sl");
    expect(s.value).toBe(0.5);
    expect(s.normalizedValue).toBeCloseTo(0.5);
  });

  it("setValueFromX updates value", () => {
    const s = new SliderNode("sl");
    s.style = { width: 200 };
    s.measure(200, 24);
    s.layout(0, 0, 200, 24);

    // Midpoint
    s.setValueFromX(100);
    expect(s.value).toBeGreaterThan(0);
    expect(s.value).toBeLessThanOrEqual(1);
  });

  it("respects min/max", () => {
    const s = new SliderNode("sl");
    s.min = 10;
    s.max = 20;
    s.value = 15;
    expect(s.normalizedValue).toBeCloseTo(0.5);
  });

  it("step quantizes value", () => {
    const s = new SliderNode("sl");
    s.min = 0;
    s.max = 100;
    s.step = 25;
    s.layout(0, 0, 200, 24);

    // Move to ~30% → should snap to 25
    s.setValueFromX(60);
    expect(s.value % 25).toBe(0);
  });

  it("disabled blocks value changes", () => {
    const s = new SliderNode("sl");
    s.setState("disabled");
    s.layout(0, 0, 200, 24);
    s.setValueFromX(100);
    expect(s.value).toBe(0.5); // unchanged
  });
});

describe("Toggle", () => {
  it("toggles on/off", () => {
    const t = new ToggleNode("tg");
    expect(t.on).toBe(false);
    t.toggle();
    expect(t.on).toBe(true);
  });

  it("fires onChange", () => {
    const t = new ToggleNode("tg");
    const fn = vi.fn();
    t.onChange = fn;
    t.toggle();
    expect(fn).toHaveBeenCalledWith(true);
  });

  it("disabled blocks toggle", () => {
    const t = new ToggleNode("tg");
    t.setState("disabled");
    t.toggle();
    expect(t.on).toBe(false);
  });

  it("draws different track color for on/off", () => {
    const t = new ToggleNode("tg");
    t.measure(44, 24);
    t.layout(0, 0, 44, 24);

    const ctx1 = mockCtx();
    t.draw(ctx1);
    const offCall = (ctx1.fillRoundedRect as any).mock.calls[0];

    t.toggle();
    const ctx2 = mockCtx();
    t.draw(ctx2);
    const onCall = (ctx2.fillRoundedRect as any).mock.calls[0];

    // Track color (5th arg) should differ
    expect(offCall[5]).not.toEqual(onCall[5]);
  });
});

// ═════════════════════════════════════════════════════════════
// 7. Theme System
// ═════════════════════════════════════════════════════════════

describe("ThemeManager", () => {
  let tm: ThemeManager;

  beforeEach(() => {
    tm = new ThemeManager();
  });

  it("starts with dark theme by default", () => {
    expect(tm.active.id).toBe("dark");
    expect(tm.isDark).toBe(true);
  });

  it("switches to light theme", () => {
    tm.setTheme("light");
    expect(tm.active.id).toBe("light");
    expect(tm.isDark).toBe(false);
  });

  it("toggleDarkMode switches between light and dark", () => {
    tm.toggleDarkMode();
    expect(tm.active.id).toBe("light");
    tm.toggleDarkMode();
    expect(tm.active.id).toBe("dark");
  });

  it("fires change listeners", () => {
    const listener = vi.fn();
    tm.onChange(listener);
    tm.setTheme("light");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(LIGHT_THEME);
  });

  it("unsubscribe works", () => {
    const listener = vi.fn();
    const unsub = tm.onChange(listener);
    unsub();
    tm.setTheme("light");
    expect(listener).not.toHaveBeenCalled();
  });

  it("derive creates a custom theme", () => {
    const custom = tm.derive("dark", {
      id: "midnight",
      name: "Midnight",
      colors: { primary: { r: 200, g: 0, b: 200, a: 255 } } as any,
    });
    expect(custom.id).toBe("midnight");
    expect(custom.colors.primary.r).toBe(200);
    // Inherits other tokens from dark base
    expect(custom.colors.background).toEqual(DARK_THEME.colors.background);
  });

  it("custom theme can be activated", () => {
    tm.derive("dark", { id: "custom", name: "Custom" });
    const ok = tm.setTheme("custom");
    expect(ok).toBe(true);
    expect(tm.active.id).toBe("custom");
  });

  it("setTheme returns false for unknown id", () => {
    expect(tm.setTheme("nonexistent")).toBe(false);
  });

  it("color/space/fontSize/radius resolve from active theme", () => {
    tm.setTheme("light");
    expect(tm.color("primary")).toEqual(LIGHT_THEME.colors.primary);
    expect(tm.space("md")).toBe(12);
    expect(tm.fontSize("body")).toBe(14);
    expect(tm.radius("md")).toBe(6);
  });

  it("listThemes includes built-in and custom", () => {
    tm.derive("dark", { id: "custom", name: "Custom" });
    const list = tm.listThemes();
    expect(list).toContain("light");
    expect(list).toContain("dark");
    expect(list).toContain("custom");
  });

  it("register adds external theme", () => {
    const theme = { ...LIGHT_THEME, id: "external", name: "External" };
    tm.register(theme);
    expect(tm.getTheme("external")).toBeDefined();
  });
});

// ═════════════════════════════════════════════════════════════
// 8. Animation Groups (Enhanced)
// ═════════════════════════════════════════════════════════════

describe("AnimationGroup Enhanced", () => {
  let engine: AnimationEngine;

  function makeAnim(id: string, duration = 100): AnimationDef {
    return {
      id,
      tracks: [{ property: "opacity", keyframes: [{ offset: 0, value: 0 }, { offset: 1, value: 1 }] }],
      durationMs: duration,
    };
  }

  beforeEach(() => {
    engine = new AnimationEngine();
  });

  it("parallel mode plays all animations immediately", () => {
    engine.create(makeAnim("a1"));
    engine.create(makeAnim("a2"));
    const group = engine.createGroup("g1", ["a1", "a2"], { playMode: "parallel" });
    group.play();

    expect(engine.get("a1")?.state).toBe("running");
    expect(engine.get("a2")?.state).toBe("running");
  });

  it("sequence mode plays one at a time", () => {
    engine.create(makeAnim("a1", 100));
    engine.create(makeAnim("a2", 100));
    const group = engine.createGroup("g1", ["a1", "a2"], { playMode: "sequence" });
    group.play();

    expect(engine.get("a1")?.state).toBe("running");
    expect(engine.get("a2")?.state).toBe("idle");
  });

  it("sequence advances after first finishes", () => {
    engine.create(makeAnim("a1", 50));
    engine.create(makeAnim("a2", 500)); // longer so it survives the next tick
    const group = engine.createGroup("g1", ["a1", "a2"], { playMode: "sequence" });
    group.play();

    // Tick past first animation
    engine.tick(0, 60);
    expect(engine.get("a1")?.state).toBe("finished");
    // a2 was started by the onFinish callback, tick again with small dt
    engine.tick(60, 10);
    expect(engine.get("a2")?.state).toBe("running");
  });

  it("stagger mode sets incremental delays", () => {
    engine.create(makeAnim("a1"));
    engine.create(makeAnim("a2"));
    engine.create(makeAnim("a3"));
    const group = engine.createGroup("g1", ["a1", "a2", "a3"], {
      playMode: "stagger",
      staggerDelay: 50,
    });
    group.play();

    // All start running but with different delays
    expect(engine.get("a1")?.state).toBe("running");
    expect(engine.get("a2")?.def.delay).toBe(50);
    expect(engine.get("a3")?.def.delay).toBe(100);
  });

  it("pause/resume affects all animations", () => {
    engine.create(makeAnim("a1"));
    engine.create(makeAnim("a2"));
    const group = engine.createGroup("g1", ["a1", "a2"], { playMode: "parallel" });
    group.play();
    group.pause();

    expect(engine.get("a1")?.state).toBe("paused");
    expect(engine.get("a2")?.state).toBe("paused");

    group.resume();
    expect(engine.get("a1")?.state).toBe("running");
  });

  it("cancel stops everything", () => {
    engine.create(makeAnim("a1"));
    engine.create(makeAnim("a2"));
    const group = engine.createGroup("g1", ["a1", "a2"]);
    group.play();
    group.cancel();

    expect(engine.get("a1")).toBeUndefined();
    expect(group.isPlaying).toBe(false);
  });

  it("onGroupFinish fires when all complete", () => {
    engine.create(makeAnim("a1", 50));
    const cb = vi.fn();
    const group = engine.createGroup("g1", ["a1"], {
      playMode: "parallel",
      onGroupFinish: cb,
    });
    group.play();
    engine.tick(0, 60);

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("onAnimationFinish fires per animation", () => {
    engine.create(makeAnim("a1", 50));
    engine.create(makeAnim("a2", 100));
    const perAnim = vi.fn();
    const group = engine.createGroup("g1", ["a1", "a2"], {
      playMode: "parallel",
      onAnimationFinish: perAnim,
    });
    group.play();
    engine.tick(0, 60);

    expect(perAnim).toHaveBeenCalledWith("a1");
  });

  it("progress reports fraction of finished animations", () => {
    engine.create(makeAnim("a1", 50));
    engine.create(makeAnim("a2", 200));
    const group = engine.createGroup("g1", ["a1", "a2"], { playMode: "parallel" });
    group.play();
    engine.tick(0, 60);

    expect(group.progress).toBeCloseTo(0.5);
  });

  it("add/remove modifies group membership", () => {
    engine.create(makeAnim("a1"));
    engine.create(makeAnim("a3"));
    const group = engine.createGroup("g1", ["a1"]);
    group.add("a3");
    expect(group.animationIds).toContain("a3");
    group.remove("a1");
    expect(group.animationIds).not.toContain("a1");
  });

  it("iterations repeats the group", () => {
    engine.create(makeAnim("a1", 50));
    const finishCb = vi.fn();
    const group = engine.createGroup("g1", ["a1"], {
      playMode: "parallel",
      iterations: 2,
      onGroupFinish: finishCb,
    });
    group.play();

    // First iteration
    engine.tick(0, 60);
    expect(finishCb).not.toHaveBeenCalled(); // should restart
  });
});
