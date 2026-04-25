// ═══════════════════════════════════════════════════════════════
// SITA OS — Nova Terminal (Canvas-Rendered)
// Built entirely on Nova SDK primitives:
//   • NovaContext — canvas 2D drawing for every glyph
//   • NovaEvents  — keyboard/focus input via SDK event bus
//   • useNovaApp  — lifecycle hooks (launch/focus/blur/exit)
//   • NovaBridge   — sound & theme queries via system bridge
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback, useState } from "react";
import { NovaContext, type NovaColor } from "@/platform/nova-sdk/graphics/context";
import { NovaEvents } from "@/platform/nova-sdk/input/events";
import { lifecycleManager, type NovaAppLifecycle } from "@/platform/nova-sdk/runtime/lifecycle";
import { NovaBridge } from "@/platform/nova-sdk/system/bridge";
import { AppStateWrapper } from "@/platform/sita/components/sita/shell/AppStateWrapper";

// ── Manifest ──────────────────────────────────────────────

export const NOVA_TERMINAL_MANIFEST = {
  id: "com.nova.canvas-terminal",
  name: "Nova Terminal",
  version: "1.0.0",
  publisher: "SITA OS",
  icon: "▣",
  iconBg: "from-[hsl(265_55%_30%)] to-[hsl(265_55%_18%)]",
  permissions: [] as const,
  windowDefaults: { width: 640, height: 440 },
  category: "utilities" as const,
  description: "GPU-canvas terminal rendered via NovaContext",
  designVersion: "nova-1.0",
};

// ── Color palette (NovaColor HSL objects) ──────────────────

const C = {
  bg:         { h: 220, s: 18, l: 6 },
  bgGlow:     { h: 265, s: 40, l: 12, a: 0.35 },
  prompt:     { h: 120, s: 50, l: 60 },
  promptHost: { h: 210, s: 65, l: 65 },
  promptSym:  { h: 0, s: 0, l: 45 },
  text:       { h: 0, s: 0, l: 82 },
  textDim:    { h: 0, s: 0, l: 52 },
  cmd:        { h: 280, s: 55, l: 68 },
  flag:       { h: 38, s: 80, l: 62 },
  path:       { h: 200, s: 65, l: 62 },
  string:     { h: 120, s: 45, l: 60 },
  error:      { h: 0, s: 65, l: 62 },
  accent:     { h: 265, s: 55, l: 58 },
  cursor:     { h: 265, s: 55, l: 65 },
  statusBg:   { h: 265, s: 30, l: 10 },
  statusText: { h: 265, s: 40, l: 55 },
  divider:    { h: 0, s: 0, l: 100, a: 0.06 },
  tabActive:  { h: 220, s: 18, l: 6 },
  tabInactive:{ h: 220, s: 15, l: 10 },
  tabText:    { h: 0, s: 0, l: 55 },
  tabTextAct: { h: 0, s: 0, l: 80 },
};

// ── Terminal layout constants ──────────────────────────────

const FONT_SIZE = 13;
const LINE_HEIGHT = 20;
const CHAR_WIDTH = 7.8; // approximate for monospace 13px
const PAD_X = 12;
const PAD_Y = 8;
const TAB_HEIGHT = 28;
const STATUS_HEIGHT = 22;

// ── Line types ─────────────────────────────────────────────

interface TermLine {
  type: "input" | "output" | "error" | "system";
  text: string;
}

// ── Virtual FS ─────────────────────────────────────────────

const VIRT_FS: Record<string, string> = {
  ".sitarc": "# SITA OS Config\ntheme=dark\nshell=nova-sh",
  "readme.md": "# SITA OS\nSovereign Intelligence Terminal Architecture",
  "notes.txt": "Remember to ship the canvas terminal.",
  ".env": "SITA_VERSION=2.0\nSITA_GPU=enabled",
};

// ── Built-in commands ──────────────────────────────────────

type CmdFn = (args: string[]) => { text: string; type?: TermLine["type"] };

const CMDS: Record<string, CmdFn> = {
  help: () => ({
    text: [
      " Nova Terminal — Command Reference",
      "",
      "  help       Show this message",
      "  echo       Print text",
      "  date       Current date/time",
      "  uptime     Session uptime",
      "  whoami     Current user",
      "  uname      System info",
      "  ls         List files",
      "  cat        Read file",
      "  pwd        Working directory",
      "  env        Environment vars",
      "  neofetch   System art",
      "  calc       Evaluate math",
      "  clear      Clear screen",
      "  history    Command history",
      "  cowsay     ASCII cow",
      "  fortune    Random wisdom",
      "  bench      Run benchmark",
      "",
      "  Tab: autocomplete · ↑↓: history · Ctrl+L: clear",
    ].join("\n"),
  }),
  echo: (a) => ({ text: " " + a.join(" ") }),
  date: () => ({ text: " " + new Date().toLocaleString() }),
  uptime: () => {
    const s = Math.floor(performance.now() / 1000);
    return { text: ` up ${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s` };
  },
  whoami: () => ({ text: " sita-user" }),
  pwd: () => ({ text: " /home/sita-user" }),
  uname: (a) => a.includes("-a")
    ? { text: " SITA OS 1.0.0 NovaKernel aarch64" }
    : { text: " SITA OS" },
  ls: () => ({ text: Object.keys(VIRT_FS).map(f => "  " + f).join("\n") }),
  cat: (a) => {
    if (!a[0]) return { text: " Usage: cat <file>", type: "error" };
    const f = VIRT_FS[a[0]];
    if (!f) return { text: ` cat: ${a[0]}: not found`, type: "error" };
    return { text: f };
  },
  env: () => ({
    text: [
      " SHELL=/bin/nova-sh", " USER=sita-user", " HOME=/home/sita-user",
      " TERM=nova-canvas-256", ` DISPLAY=${window.innerWidth}×${window.innerHeight}`,
      " SITA_VERSION=2.0.0", " SITA_GPU=canvas-2d",
    ].join("\n"),
  }),
  neofetch: () => ({
    text: [
      "",
      "   ╔═══╗  ╦ ╔╦╗ ╔═╗    OS:      SITA OS 2.0",
      "   ╚═╗║  ║  ║  ╠═╣    Kernel:  NovaKernel",
      "   ╚═╝╩  ╩  ╩  ╩ ╩    Shell:   nova-sh",
      `                        Display: ${window.innerWidth}×${window.innerHeight}`,
      `                        Uptime:  ${Math.floor(performance.now() / 60000)}m`,
      "",
    ].join("\n"),
  }),
  calc: (a) => {
    const expr = a.join(" ");
    if (!expr) return { text: " Usage: calc <expr>", type: "error" };
    try {
      if (!/^[\d\s+\-*/().%^]+$/.test(expr)) throw 0;
      const r = new Function(`return (${expr.replace(/\^/g, "**")})`)();
      return { text: ` ${expr} = ${r}` };
    } catch { return { text: " Error: invalid expression", type: "error" }; }
  },
  history: () => ({ text: " (see ↑↓ keys)" }),
  cowsay: (a) => {
    const m = a.join(" ") || "Moo!";
    const b = "─".repeat(m.length + 2);
    return {
      text: [` ╭${b}╮`, ` │ ${m} │`, ` ╰${b}╯`, "      \\   ^__^", "       \\  (oo)\\_______", "          (__)\\       )\\/\\", "              ||----w |", "              ||     ||"].join("\n"),
    };
  },
  fortune: () => {
    const f = [
      "Trust is proven, not granted.",
      "Calm is a feature.",
      "The sovereign mind reasons with evidence.",
      "Every action deserves a receipt.",
    ];
    return { text: `\n  "${f[Math.floor(Math.random() * f.length)]}"\n\n  — SITA Fortune Cookie\n` };
  },
  bench: () => {
    const scores = [
      ["CPU (int)", Math.round(8500 + Math.random() * 1500)],
      ["CPU (flt)", Math.round(7200 + Math.random() * 1200)],
      ["Memory",    Math.round(12000 + Math.random() * 3000)],
      ["GPU (2D)",  Math.round(15000 + Math.random() * 5000)],
    ] as [string, number][];
    const rows = scores.map(([n, s]) => `  ${n.padEnd(12)} ${String(s).padStart(6)}`).join("\n");
    const avg = Math.round(scores.reduce((a, [, s]) => a + s, 0) / scores.length);
    return { text: `\n  ⚡ Nova Bench v1.0\n\n  Test          Score\n  ${"─".repeat(24)}\n${rows}\n  ${"─".repeat(24)}\n  Average: ${avg}\n` };
  },
};

const ALL_CMDS = Object.keys(CMDS);

// ── Component ──────────────────────────────────────────────

export function NovaTerminal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<NovaContext | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // State kept as refs for canvas render loop performance
  const linesRef = useRef<TermLine[]>([
    { type: "system", text: "\n  ▣ Nova Terminal v1.0 — canvas-rendered via NovaContext\n  Type 'help' for commands\n" },
  ]);
  const inputRef = useRef("");
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const scrollRef = useRef(0);
  const cursorVisRef = useRef(true);
  const focusedRef = useRef(true);
  const suggestionsRef = useRef<string[]>([]);
  const selectedSugRef = useRef(0);

  // Force re-render trigger for React overlay (status bar)
  const [tick, setTick] = useState(0);
  const redraw = useCallback(() => setTick(t => t + 1), []);

  // ── Lifecycle hooks via SDK ──────────────────────────────

  useEffect(() => {
    const lifecycle: NovaAppLifecycle = {
      onLaunch: () => { focusedRef.current = true; },
      onFocus: () => { focusedRef.current = true; },
      onBlur: () => { focusedRef.current = false; },
      onExit: () => { cancelAnimationFrame(rafRef.current); },
    };
    lifecycleManager.registerHooks(NOVA_TERMINAL_MANIFEST.id, lifecycle);
    return () => lifecycleManager.unregisterHooks(NOVA_TERMINAL_MANIFEST.id);
  }, []);

  // ── Canvas init + render loop ────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // HiDPI setup
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight - STATUS_HEIGHT;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctxRef.current = new NovaContext(canvas);
      ctxRef.current.raw.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    // Cursor blink
    const cursorInterval = setInterval(() => {
      cursorVisRef.current = !cursorVisRef.current;
    }, 530);

    // Render loop
    const render = () => {
      const ctx = ctxRef.current;
      if (!ctx) { rafRef.current = requestAnimationFrame(render); return; }
      const canvas = canvasRef.current!;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;

      ctx.clear();

      // Background
      ctx.fillRect(0, 0, W, H, C.bg);

      // Subtle CRT glow at top
      ctx.drawGradient(0, 0, W, 60, C.bgGlow, { ...C.bg, a: 0 }, 180);

      // Render lines
      const lines = linesRef.current;
      const maxVisibleLines = Math.floor((H - PAD_Y * 2 - LINE_HEIGHT) / LINE_HEIGHT);
      const totalLines = countRenderedLines(lines);
      const scroll = Math.max(0, totalLines - maxVisibleLines);
      scrollRef.current = scroll;

      let y = PAD_Y;
      let lineCounter = 0;

      for (const line of lines) {
        const subLines = line.text.split("\n");
        for (const sub of subLines) {
          if (lineCounter >= scroll) {
            if (y > H - PAD_Y - LINE_HEIGHT * 2) break;
            drawLine(ctx, sub, y, line.type, W);
            y += LINE_HEIGHT;
          }
          lineCounter++;
        }
        if (y > H - PAD_Y - LINE_HEIGHT * 2) break;
      }

      // Input line
      const inputY = H - PAD_Y - LINE_HEIGHT;
      drawPrompt(ctx, inputY);
      const promptWidth = getPromptWidth();
      drawInputText(ctx, inputRef.current, PAD_X + promptWidth, inputY);

      // Cursor
      if (focusedRef.current && cursorVisRef.current) {
        const curX = PAD_X + promptWidth + inputRef.current.length * CHAR_WIDTH;
        ctx.fillRect(curX, inputY + 2, 2, FONT_SIZE, C.cursor);
      }

      // Autocomplete popup
      const suggestions = suggestionsRef.current;
      if (suggestions.length > 0) {
        const popX = PAD_X + promptWidth;
        const popY = inputY - suggestions.length * LINE_HEIGHT - 4;
        const popW = 160;
        const popH = suggestions.length * LINE_HEIGHT + 4;
        ctx.drawRoundedRect(popX, popY, popW, popH, 6, { h: 220, s: 15, l: 10, a: 0.95 });
        // border
        ctx.drawRoundedRect(popX, popY, popW, 1, 0, C.divider);

        for (let i = 0; i < suggestions.length; i++) {
          const sy = popY + 2 + i * LINE_HEIGHT;
          if (i === selectedSugRef.current) {
            ctx.drawRoundedRect(popX + 2, sy, popW - 4, LINE_HEIGHT, 4, { h: 265, s: 55, l: 58, a: 0.15 });
          }
          const col = i === selectedSugRef.current ? C.accent : C.textDim;
          ctx.drawText("› " + suggestions[i], popX + 8, sy + 4, col, 11);
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(cursorInterval);
      ro.disconnect();
    };
  }, []);

  // ── Keyboard input via NovaEvents ────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!focusedRef.current) return;

      const key = e.key;

      if (key === "Tab") {
        e.preventDefault();
        const sugs = suggestionsRef.current;
        if (sugs.length > 0) {
          const parts = inputRef.current.split(/\s+/);
          parts[parts.length - 1] = sugs[selectedSugRef.current];
          inputRef.current = parts.join(" ") + " ";
          suggestionsRef.current = [];
          NovaBridge.send("sound:play", { type: "click" });
        }
        redraw();
        return;
      }

      if (key === "Enter") {
        e.preventDefault();
        executeCommand(inputRef.current);
        suggestionsRef.current = [];
        redraw();
        return;
      }

      if (key === "Backspace") {
        e.preventDefault();
        inputRef.current = inputRef.current.slice(0, -1);
        updateSuggestions();
        redraw();
        return;
      }

      if (key === "ArrowUp") {
        e.preventDefault();
        if (suggestionsRef.current.length > 0) {
          selectedSugRef.current = Math.max(0, selectedSugRef.current - 1);
        } else {
          const hist = historyRef.current;
          if (hist.length > 0) {
            const idx = historyIdxRef.current === -1 ? hist.length - 1 : Math.max(0, historyIdxRef.current - 1);
            historyIdxRef.current = idx;
            inputRef.current = hist[idx];
          }
        }
        redraw();
        return;
      }

      if (key === "ArrowDown") {
        e.preventDefault();
        if (suggestionsRef.current.length > 0) {
          selectedSugRef.current = Math.min(suggestionsRef.current.length - 1, selectedSugRef.current + 1);
        } else {
          const hist = historyRef.current;
          if (historyIdxRef.current >= 0) {
            const idx = historyIdxRef.current + 1;
            if (idx >= hist.length) { historyIdxRef.current = -1; inputRef.current = ""; }
            else { historyIdxRef.current = idx; inputRef.current = hist[idx]; }
          }
        }
        redraw();
        return;
      }

      if (key === "l" && e.ctrlKey) {
        e.preventDefault();
        linesRef.current = [];
        redraw();
        return;
      }

      if (key === "c" && e.ctrlKey) {
        e.preventDefault();
        linesRef.current = [...linesRef.current, { type: "system", text: "  ^C" }];
        inputRef.current = "";
        suggestionsRef.current = [];
        redraw();
        return;
      }

      // Printable character
      if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        inputRef.current += key;
        updateSuggestions();
        redraw();
      }
    };

    // Emit through NovaEvents so other SDK components can observe
    const wrappedHandler = (e: KeyboardEvent) => {
      NovaEvents.emit("key:down", { key: e.key, ctrl: e.ctrlKey, meta: e.metaKey, shift: e.shiftKey, alt: e.altKey }, NOVA_TERMINAL_MANIFEST.id);
      handleKey(e);
    };

    document.addEventListener("keydown", wrappedHandler);
    return () => document.removeEventListener("keydown", wrappedHandler);
  }, [redraw]);

  // ── Focus tracking via NovaEvents ────────────────────────

  useEffect(() => {
    const unsubFocus = NovaEvents.on("focus:change", (ev) => {
      if (ev.target === NOVA_TERMINAL_MANIFEST.id) {
        focusedRef.current = ev.payload?.focused ?? true;
      }
    });
    return unsubFocus;
  }, []);

  // ── Autocomplete ─────────────────────────────────────────

  const updateSuggestions = useCallback(() => {
    const val = inputRef.current;
    if (!val) { suggestionsRef.current = []; return; }
    const parts = val.split(/\s+/);
    const current = parts[parts.length - 1];
    if (parts.length === 1) {
      suggestionsRef.current = ALL_CMDS.filter(c => c.startsWith(current) && c !== current).slice(0, 5);
    } else {
      suggestionsRef.current = Object.keys(VIRT_FS).filter(f => f.startsWith(current) && f !== current).slice(0, 5);
    }
    selectedSugRef.current = 0;
  }, []);

  // ── Command execution ────────────────────────────────────

  const executeCommand = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    NovaBridge.send("sound:play", { type: "click" });
    linesRef.current = [...linesRef.current, { type: "input", text: `$ ${trimmed}` }];
    historyRef.current = [...historyRef.current, trimmed];
    historyIdxRef.current = -1;
    inputRef.current = "";

    const [cmd, ...args] = trimmed.split(/\s+/);

    if (cmd === "clear") {
      linesRef.current = [];
      return;
    }

    if (cmd === "history") {
      const text = historyRef.current.map((h, i) => `  ${String(i + 1).padStart(4)}  ${h}`).join("\n");
      linesRef.current = [...linesRef.current, { type: "output", text: text || "  (empty)" }];
      return;
    }

    const handler = CMDS[cmd];
    if (handler) {
      const result = handler(args);
      linesRef.current = [...linesRef.current, { type: result.type || "output", text: result.text }];
    } else {
      linesRef.current = [...linesRef.current, { type: "error", text: `  nova-sh: command not found: ${cmd}` }];
    }
  }, []);

  // ── Canvas helpers ───────────────────────────────────────

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(265_55%_30%)] to-[hsl(265_55%_18%)]">
      <div
        ref={containerRef}
        className="flex flex-col h-full min-h-[300px] bg-[hsl(220_18%_6%)] relative overflow-hidden cursor-text select-none"
        tabIndex={0}
        onFocus={() => { focusedRef.current = true; NovaEvents.emit("focus:change", { focused: true }, NOVA_TERMINAL_MANIFEST.id); }}
        onBlur={() => { focusedRef.current = false; NovaEvents.emit("focus:change", { focused: false }, NOVA_TERMINAL_MANIFEST.id); }}
      >
        {/* Canvas fills the main area */}
        <canvas ref={canvasRef} className="flex-1 outline-none" />

        {/* Status bar — thin React overlay for live metrics */}
        <div
          className="flex items-center justify-between px-3 flex-shrink-0"
          style={{ height: STATUS_HEIGHT, background: "hsl(265 30% 10%)", borderTop: "1px solid hsl(0 0% 100% / 0.06)" }}
        >
          <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: "hsl(265 40% 55%)" }}>
            <span>NovaContext</span>
            <span>•</span>
            <span>canvas-2d</span>
            <span>•</span>
            <span>{historyRef.current.length} cmds</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: "hsl(265 40% 55%)" }}>
            <span>{linesRef.current.length} lines</span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>
    </AppStateWrapper>
  );
}

// ── Drawing helpers ────────────────────────────────────────

function countRenderedLines(lines: TermLine[]): number {
  return lines.reduce((n, l) => n + l.text.split("\n").length, 0);
}

function drawPrompt(ctx: NovaContext, y: number) {
  let x = PAD_X;
  ctx.drawText("sita", x, y, C.prompt, FONT_SIZE);
  x += 4 * CHAR_WIDTH;
  ctx.drawText(":", x, y, C.promptSym, FONT_SIZE);
  x += CHAR_WIDTH;
  ctx.drawText("~", x, y, C.promptHost, FONT_SIZE);
  x += CHAR_WIDTH;
  ctx.drawText("$", x, y, C.promptSym, FONT_SIZE);
  x += CHAR_WIDTH;
  ctx.drawText(" ", x, y, C.text, FONT_SIZE);
}

function getPromptWidth(): number {
  // "sita:~$ " = 8 chars
  return 8 * CHAR_WIDTH;
}

function drawInputText(ctx: NovaContext, text: string, x: number, y: number) {
  // Syntax highlight inline: first word = command color, flags, paths, strings
  const parts = text.split(/(\s+)/);
  let cx = x;
  let isFirst = true;
  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      cx += part.length * CHAR_WIDTH;
      continue;
    }
    let color: NovaColor;
    if (isFirst) { color = C.cmd; isFirst = false; }
    else if (part.startsWith("-")) color = C.flag;
    else if (part.includes("/") || part.includes(".")) color = C.path;
    else if (part.startsWith('"') || part.startsWith("'")) color = C.string;
    else color = C.text;

    ctx.drawText(part, cx, y, color, FONT_SIZE);
    cx += part.length * CHAR_WIDTH;
  }
}

function drawLine(ctx: NovaContext, text: string, y: number, type: TermLine["type"], _w: number) {
  let color: NovaColor;
  switch (type) {
    case "input": color = C.text; break;
    case "error": color = C.error; break;
    case "system": color = C.textDim; break;
    default: color = C.string; break;
  }

  if (type === "input" && text.startsWith("$ ")) {
    // Draw with syntax highlighting
    ctx.drawText("$ ", PAD_X, y, C.promptSym, FONT_SIZE);
    drawInputText(ctx, text.slice(2), PAD_X + 2 * CHAR_WIDTH, y);
    return;
  }

  ctx.drawText(text, PAD_X, y, color, FONT_SIZE);
}
