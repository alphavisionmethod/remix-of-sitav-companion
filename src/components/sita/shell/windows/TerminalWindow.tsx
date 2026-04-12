// ═══════════════════════════════════════════════════════════════
// SITA OS — Terminal App
// Interactive shell emulator with command history and built-in commands
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "@/lib/nova-sdk/ui/layout";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { cn } from "@/lib/utils";
import { APP_TYPE } from "@/lib/design-system/app-window-system";

export const TERMINAL_MANIFEST = {
  id: "com.nova.terminal",
  name: "Terminal",
  version: "1.0.0",
  publisher: "SITA OS",
  icon: "⬛",
  iconBg: "from-gray-800 to-gray-900",
  permissions: [] as const,
  windowDefaults: { width: 560, height: 400 },
  category: "utilities",
  description: "Command-line interface for SITA OS",
};

interface TermLine {
  id: string;
  type: "input" | "output" | "error" | "system";
  content: string;
  timestamp: number;
}

const WELCOME = `SITA OS Terminal v1.0.0
Type "help" for available commands.\n`;

const BUILTIN_COMMANDS: Record<string, (args: string[]) => string> = {
  help: () => [
    "Available commands:",
    "  help        — Show this message",
    "  clear       — Clear terminal",
    "  echo <msg>  — Print message",
    "  date        — Current date/time",
    "  uptime      — System uptime",
    "  whoami      — Current user",
    "  uname       — System info",
    "  ls          — List virtual files",
    "  cat <file>  — Read virtual file",
    "  env         — Environment variables",
    "  history     — Command history",
    "  neofetch    — System info banner",
    "  calc <expr> — Calculator",
    "  cowsay <m>  — 🐄",
  ].join("\n"),
  echo: (args) => args.join(" "),
  date: () => new Date().toLocaleString(),
  uptime: () => {
    const ms = performance.now();
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const hrs = Math.floor(mins / 60);
    return `up ${hrs}h ${mins % 60}m ${secs % 60}s`;
  },
  whoami: () => "sita-user",
  uname: () => "SITA OS 1.0.0 (NovaKernel) aarch64",
  ls: () => [
    "drwxr-xr-x  Documents/",
    "drwxr-xr-x  Desktop/",
    "drwxr-xr-x  Downloads/",
    "-rw-r--r--  .sitarc",
    "-rw-r--r--  notes.md",
  ].join("\n"),
  cat: (args) => {
    const files: Record<string, string> = {
      ".sitarc": "# SITA OS Configuration\ntheme=dark\nlang=en\nshell=nova-sh",
      "notes.md": "# My Notes\n\nWelcome to SITA OS. This is a virtual file.",
    };
    const name = args[0];
    if (!name) return "Usage: cat <filename>";
    return files[name] || `cat: ${name}: No such file or directory`;
  },
  env: () => [
    "SHELL=/bin/nova-sh",
    "USER=sita-user",
    "HOME=/home/sita-user",
    "TERM=nova-256color",
    `LANG=${navigator.language}`,
    "SITA_VERSION=1.0.0",
    `DISPLAY_MODE=${document.documentElement.classList.contains("dark") ? "dark" : "light"}`,
  ].join("\n"),
  neofetch: () => [
    "        ╭───────────╮",
    "  ╭─────┤  SITA OS  ├─────╮",
    "  │     ╰───────────╯     │    OS: SITA OS 1.0.0",
    "  │    ┌─────────────┐    │    Kernel: NovaKernel",
    "  │    │  ◉  ◉  ◉    │    │    Shell: nova-sh",
    "  │    │              │    │    Theme: Dark Premium",
    "  │    │   ████████   │    │    Font: JetBrains Mono",
    "  │    │              │    │    Resolution: " + window.innerWidth + "x" + window.innerHeight,
    "  │    └─────────────┘    │    Memory: Adaptive",
    "  ╰───────────────────────╯    Uptime: " + Math.floor(performance.now() / 1000) + "s",
  ].join("\n"),
  calc: (args) => {
    const expr = args.join(" ");
    if (!expr) return "Usage: calc <expression>";
    try {
      // Safe math evaluation — only numbers and operators
      if (!/^[\d\s+\-*/().%]+$/.test(expr)) return "Error: Invalid expression";
      const result = new Function(`return (${expr})`)();
      return `= ${result}`;
    } catch {
      return "Error: Invalid expression";
    }
  },
  cowsay: (args) => {
    const msg = args.join(" ") || "Moo!";
    const border = "─".repeat(msg.length + 2);
    return [
      ` ╭${border}╮`,
      ` │ ${msg} │`,
      ` ╰${border}╯`,
      "        \\   ^__^",
      "         \\  (oo)\\_______",
      "            (__)\\       )\\/\\",
      "                ||----w |",
      "                ||     ||",
    ].join("\n");
  },
};

export function TerminalWindow() {
  const [lines, setLines] = useState<TermLine[]>([
    { id: "welcome", type: "system", content: WELCOME, timestamp: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLine = useCallback((type: TermLine["type"], content: string) => {
    setLines(prev => [...prev, { id: `l-${Date.now()}-${Math.random()}`, type, content, timestamp: Date.now() }]);
  }, []);

  const executeCommand = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    addLine("input", `$ ${trimmed}`);
    setHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    const [cmd, ...args] = trimmed.split(/\s+/);

    if (cmd === "clear") {
      setLines([]);
      return;
    }

    if (cmd === "history") {
      const histOutput = history.map((h, i) => `  ${i + 1}  ${h}`).join("\n") + `\n  ${history.length + 1}  ${trimmed}`;
      addLine("output", histOutput);
      return;
    }

    const handler = BUILTIN_COMMANDS[cmd];
    if (handler) {
      addLine("output", handler(args));
    } else {
      addLine("error", `nova-sh: command not found: ${cmd}`);
    }
  }, [addLine, history]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx >= 0) {
        const idx = historyIdx + 1;
        if (idx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(idx);
          setInput(history[idx]);
        }
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }, [input, executeCommand, history, historyIdx]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const lineColor: Record<TermLine["type"], string> = {
    input: "text-[hsl(var(--primary))]",
    output: "text-[hsl(120_60%_65%)]",
    error: "text-[hsl(0_70%_65%)]",
    system: "text-[hsl(var(--muted-foreground))]",
  };

  return (
    <AppStateWrapper
      state="ready"
      accentGradient="from-[hsl(0_0%_15%)] to-[hsl(0_0%_25%)]"
    >
      <div
        className="flex flex-col h-full min-h-[300px] bg-[hsl(0_0%_4%)] font-mono cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Output area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-thin">
          {lines.map(line => (
            <pre
              key={line.id}
              className={cn(
                "text-[12px] leading-[1.6] whitespace-pre-wrap break-all font-mono",
                lineColor[line.type]
              )}
            >
              {line.content}
            </pre>
          ))}
        </div>

        {/* Input line */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-[hsl(0_0%_100%/0.06)]">
          <span className="text-[12px] font-mono text-[hsl(var(--primary))] font-medium select-none">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[12px] font-mono text-[hsl(0_0%_90%)] outline-none placeholder:text-[hsl(0_0%_30%)] caret-[hsl(var(--primary))]"
            placeholder="Type a command..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </AppStateWrapper>
  );
}
