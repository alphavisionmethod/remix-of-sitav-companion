// ═══════════════════════════════════════════════════════════════
// SITA OS — Terminal App (God Tier)
// Multi-tab shell with autocomplete, syntax highlighting, inline
// visualizations, process status bar, and ambient CRT glow
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronRight, Cpu, HardDrive, Wifi, Clock, Terminal as TermIcon } from "lucide-react";
import { SoundEngine } from "@/platform/runtime/sound-engine";

export const TERMINAL_MANIFEST = {
  id: "com.nova.terminal",
  name: "Terminal",
  version: "2.0.0",
  publisher: "SITA OS",
  icon: "⬛",
  iconBg: "from-gray-800 to-gray-900",
  permissions: [] as const,
  windowDefaults: { width: 620, height: 460 },
  category: "utilities",
  description: "Premium GPU-accelerated terminal for SITA OS",
  designVersion: "nova-1.0",
};

// ── Types ──────────────────────────────────────────────────

interface TermLine {
  id: string;
  type: "input" | "output" | "error" | "system" | "table" | "chart" | "divider";
  content: string;
  timestamp: number;
  data?: any;
}

interface Tab {
  id: string;
  title: string;
  cwd: string;
  lines: TermLine[];
  history: string[];
  historyIdx: number;
}

// ── Autocomplete dictionary ────────────────────────────────

const ALL_COMMANDS = [
  "help", "clear", "echo", "date", "uptime", "whoami", "uname",
  "ls", "cat", "env", "history", "neofetch", "calc", "cowsay",
  "top", "ping", "curl", "tree", "grep", "wc", "head", "tail",
  "pwd", "cd", "mkdir", "touch", "rm", "cp", "mv", "chmod",
  "export", "alias", "source", "which", "man", "time", "bench",
  "theme", "matrix", "weather", "fortune", "ascii",
];

const VIRTUAL_FS: Record<string, string | Record<string, string>> = {
  ".sitarc": "# SITA OS Configuration\ntheme=dark\nlang=en\nshell=nova-sh\nprompt=$USER@$HOST:$CWD$ ",
  "notes.md": "# My Notes\n\nWelcome to SITA OS.\n\n## TODO\n- [x] Setup terminal\n- [ ] Configure workflows\n- [ ] Review policies",
  "readme.txt": "SITA OS v1.0.0 — Sovereign Intelligence Terminal Architecture\nBuilt with precision. Designed with intent.",
  ".env": "SITA_ENV=production\nSITA_LOG_LEVEL=info\nSITA_GPU=enabled",
  Documents: { "report.md": "# Q4 Report\nRevenue: $1.2M", "plan.txt": "Strategic plan draft v3" },
  Desktop: { "screenshot.png": "[binary: 2.4MB]", "launch.sh": "#!/bin/bash\necho 'Launching SITA OS...'" },
  Downloads: { "data.csv": "name,value\nalpha,42\nbeta,87\ngamma,13", "archive.tar.gz": "[binary: 15MB]" },
};

// ── Syntax Highlighting ────────────────────────────────────

function highlightLine(content: string, type: TermLine["type"]): React.ReactNode {
  if (type === "input") {
    const parts = content.replace(/^\$ /, "").split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);
    return (
      <span>
        <span className="text-[hsl(var(--muted-foreground))] opacity-60">$ </span>
        <span className="text-[hsl(280_60%_70%)] font-semibold">{cmd}</span>
        {args.map((a, i) => (
          <span key={i}>
            {" "}
            {a.startsWith("-") ? (
              <span className="text-[hsl(38_85%_65%)]">{a}</span>
            ) : a.startsWith("/") || a.includes(".") ? (
              <span className="text-[hsl(200_70%_65%)]">{a}</span>
            ) : a.startsWith('"') || a.startsWith("'") ? (
              <span className="text-[hsl(120_50%_60%)]">{a}</span>
            ) : (
              <span className="text-[hsl(0_0%_80%)]">{a}</span>
            )}
          </span>
        ))}
      </span>
    );
  }
  return content;
}

// ── Built-in Commands ──────────────────────────────────────

const COMMANDS: Record<string, (args: string[], cwd: string) => { output: string; type?: TermLine["type"]; data?: any }> = {
  help: () => ({
    output: [
      "\x1b[1m SITA OS Terminal v2.0 — Command Reference\x1b[0m",
      "",
      " \x1b[33mNavigation\x1b[0m       pwd, cd, ls, tree",
      " \x1b[33mFiles\x1b[0m            cat, head, tail, wc, grep, touch, mkdir, rm",
      " \x1b[33mSystem\x1b[0m           uname, uptime, whoami, env, top, neofetch",
      " \x1b[33mNetwork\x1b[0m          ping, curl",
      " \x1b[33mUtilities\x1b[0m        echo, calc, date, time, history, clear",
      " \x1b[33mFun\x1b[0m              cowsay, fortune, matrix, ascii, weather",
      " \x1b[33mShell\x1b[0m            alias, export, source, which, man, theme",
      "",
      " \x1b[2mTab for autocomplete • ↑↓ for history • Ctrl+L to clear\x1b[0m",
    ].join("\n"),
  }),
  echo: (args) => ({ output: args.join(" ") }),
  date: () => ({ output: `  ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n  ${new Date().toLocaleTimeString()} ${Intl.DateTimeFormat().resolvedOptions().timeZone}` }),
  uptime: () => {
    const ms = performance.now();
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return { output: `  up ${d}d ${h}h ${m}m ${s}s, load average: ${(0.3 + Math.random() * 0.4).toFixed(2)}, ${(0.2 + Math.random() * 0.3).toFixed(2)}, ${(0.1 + Math.random() * 0.2).toFixed(2)}` };
  },
  whoami: () => ({ output: "  sita-user" }),
  pwd: (_a, cwd) => ({ output: `  ${cwd}` }),
  uname: (args) => {
    if (args.includes("-a")) return { output: "  SITA OS 1.0.0 NovaKernel #1 SMP aarch64 GNU/Linux" };
    return { output: "  SITA OS" };
  },
  ls: (args, cwd) => {
    const showAll = args.includes("-a") || args.includes("-la");
    const showLong = args.includes("-l") || args.includes("-la");
    const items = Object.entries(VIRTUAL_FS);
    const lines: string[] = [];
    if (showAll && showLong) lines.push("total 48");
    for (const [name, val] of items) {
      if (!showAll && name.startsWith(".")) continue;
      const isDir = typeof val === "object";
      if (showLong) {
        const size = isDir ? "4096" : String(typeof val === "string" ? val.length : 0).padStart(5);
        lines.push(`${isDir ? "d" : "-"}rwxr-xr-x  1 sita-user sita  ${size} Apr  1 ${name}${isDir ? "/" : ""}`);
      } else {
        lines.push(`  ${isDir ? `\x1b[34m${name}/\x1b[0m` : name}`);
      }
    }
    return { output: lines.join("\n") };
  },
  cat: (args) => {
    const name = args[0];
    if (!name) return { output: "  Usage: cat <filename>", type: "error" as const };
    const file = VIRTUAL_FS[name];
    if (!file) return { output: `  cat: ${name}: No such file or directory`, type: "error" as const };
    if (typeof file === "object") return { output: `  cat: ${name}: Is a directory`, type: "error" as const };
    return { output: file };
  },
  head: (args) => {
    const n = args.includes("-n") ? parseInt(args[args.indexOf("-n") + 1]) || 5 : 5;
    const name = args.filter(a => !a.startsWith("-") && a !== String(n))[0];
    if (!name) return { output: "  Usage: head [-n N] <file>", type: "error" as const };
    const file = VIRTUAL_FS[name];
    if (!file || typeof file !== "string") return { output: `  head: ${name}: No such file`, type: "error" as const };
    return { output: file.split("\n").slice(0, n).join("\n") };
  },
  wc: (args) => {
    const name = args[0];
    if (!name) return { output: "  Usage: wc <file>", type: "error" as const };
    const file = VIRTUAL_FS[name];
    if (!file || typeof file !== "string") return { output: `  wc: ${name}: No such file`, type: "error" as const };
    const lines = file.split("\n").length;
    const words = file.split(/\s+/).filter(Boolean).length;
    const chars = file.length;
    return { output: `  ${lines} ${words} ${chars} ${name}` };
  },
  tree: () => {
    const lines = ["  .", "  ├── Documents/", "  │   ├── report.md", "  │   └── plan.txt", "  ├── Desktop/", "  │   ├── screenshot.png", "  │   └── launch.sh", "  ├── Downloads/", "  │   ├── data.csv", "  │   └── archive.tar.gz", "  ├── .sitarc", "  ├── .env", "  ├── notes.md", "  └── readme.txt", "", "  3 directories, 10 files"];
    return { output: lines.join("\n") };
  },
  grep: (args) => {
    const pattern = args[0];
    const file = args[1];
    if (!pattern || !file) return { output: "  Usage: grep <pattern> <file>", type: "error" as const };
    const content = VIRTUAL_FS[file];
    if (!content || typeof content !== "string") return { output: `  grep: ${file}: No such file`, type: "error" as const };
    const matches = content.split("\n").filter(l => l.toLowerCase().includes(pattern.toLowerCase()));
    if (matches.length === 0) return { output: "  (no matches)", type: "system" as const };
    return { output: matches.map(m => `  ${m.replace(new RegExp(`(${pattern})`, "gi"), "\x1b[31m$1\x1b[0m")}`).join("\n") };
  },
  env: () => ({
    output: [
      "  SHELL=/bin/nova-sh",
      "  USER=sita-user",
      "  HOME=/home/sita-user",
      "  TERM=nova-256color",
      `  LANG=${navigator.language}`,
      "  SITA_VERSION=2.0.0",
      "  SITA_KERNEL=NovaKernel",
      "  SITA_GPU=enabled",
      `  DISPLAY_MODE=${document.documentElement.classList.contains("dark") ? "dark" : "light"}`,
      `  WINDOW_SIZE=${window.innerWidth}x${window.innerHeight}`,
      "  SITA_TRUST_LEVEL=high",
      `  SITA_UPTIME=${Math.floor(performance.now() / 1000)}s`,
    ].join("\n"),
  }),
  top: () => {
    const procs = [
      { pid: 1, name: "nova-init", cpu: 0.1, mem: 12 },
      { pid: 42, name: "compositor", cpu: 2.3, mem: 64 },
      { pid: 87, name: "nova-sh", cpu: 0.8, mem: 18 },
      { pid: 120, name: "sita-brain", cpu: 5.1, mem: 128 },
      { pid: 155, name: "policy-engine", cpu: 1.2, mem: 45 },
      { pid: 200, name: "window-mgr", cpu: 3.4, mem: 92 },
      { pid: 256, name: "adaptive-ui", cpu: 0.6, mem: 24 },
      { pid: 310, name: "sound-engine", cpu: 0.2, mem: 8 },
    ];
    const header = "  PID   PROC             CPU%   MEM(MB)";
    const divider = "  " + "─".repeat(42);
    const rows = procs.map(p =>
      `  ${String(p.pid).padEnd(6)}${p.name.padEnd(17)}${String(p.cpu.toFixed(1)).padStart(5)}  ${String(p.mem).padStart(7)}`
    );
    return { output: [header, divider, ...rows, divider, `  Total: ${procs.length} processes, CPU: ${procs.reduce((a, p) => a + p.cpu, 0).toFixed(1)}%, MEM: ${procs.reduce((a, p) => a + p.mem, 0)}MB`].join("\n") };
  },
  ping: (args) => {
    const host = args[0] || "sita-cloud.local";
    const lines = [];
    for (let i = 0; i < 4; i++) {
      const ms = (5 + Math.random() * 15).toFixed(1);
      lines.push(`  64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${ms}ms`);
    }
    lines.push(`\n  --- ${host} ping statistics ---`);
    lines.push("  4 packets transmitted, 4 received, 0% packet loss");
    return { output: lines.join("\n") };
  },
  curl: (args) => {
    const url = args[0] || "https://api.sita.os/status";
    return { output: `  HTTP/1.1 200 OK\n  Content-Type: application/json\n  X-SITA-Version: 2.0.0\n\n  {"status":"operational","latency":"${(5 + Math.random() * 10).toFixed(0)}ms","services":{"brain":"up","policy":"up","executor":"up"}}` };
  },
  neofetch: () => ({
    output: [
      "",
      "    \x1b[35m╭─────────────────────╮\x1b[0m",
      "    \x1b[35m│\x1b[0m  ╔═══╗  ╦ ╔╦╗ ╔═╗  \x1b[35m│\x1b[0m    \x1b[1mOS:\x1b[0m       SITA OS 2.0.0",
      "    \x1b[35m│\x1b[0m  ╚═╗║  ║  ║  ╠═╣  \x1b[35m│\x1b[0m    \x1b[1mKernel:\x1b[0m   NovaKernel aarch64",
      "    \x1b[35m│\x1b[0m  ╚═╝╩  ╩  ╩  ╩ ╩  \x1b[35m│\x1b[0m    \x1b[1mShell:\x1b[0m    nova-sh 2.0",
      "    \x1b[35m╰─────────────────────╯\x1b[0m    \x1b[1mTheme:\x1b[0m    Dark Premium",
      "                                 \x1b[1mFont:\x1b[0m     JetBrains Mono",
      `                                 \x1b[1mDisplay:\x1b[0m  ${window.innerWidth}×${window.innerHeight}`,
      `                                 \x1b[1mMemory:\x1b[0m   ${Math.round((performance as any).memory?.usedJSHeapSize / 1048576 || 64)}MB / ${Math.round((performance as any).memory?.jsHeapSizeLimit / 1048576 || 512)}MB`,
      `                                 \x1b[1mUptime:\x1b[0m   ${Math.floor(performance.now() / 60000)}m ${Math.floor((performance.now() % 60000) / 1000)}s`,
      "",
      "    \x1b[30m██\x1b[31m██\x1b[32m██\x1b[33m██\x1b[34m██\x1b[35m██\x1b[36m██\x1b[37m██\x1b[0m",
      "",
    ].join("\n"),
  }),
  calc: (args) => {
    const expr = args.join(" ");
    if (!expr) return { output: "  Usage: calc <expression>", type: "error" as const };
    try {
      if (!/^[\d\s+\-*/().%^]+$/.test(expr)) return { output: "  Error: Invalid expression", type: "error" as const };
      const result = new Function(`return (${expr.replace(/\^/g, "**")})`)();
      return { output: `  ${expr} \x1b[2m=\x1b[0m \x1b[1m${result}\x1b[0m` };
    } catch {
      return { output: "  Error: Invalid expression", type: "error" as const };
    }
  },
  cowsay: (args) => {
    const msg = args.join(" ") || "Moo! 🐄";
    const border = "─".repeat(msg.length + 2);
    return { output: [` ╭${border}╮`, ` │ ${msg} │`, ` ╰${border}╯`, "        \\   ^__^", "         \\  (oo)\\_______", "            (__)\\       )\\/\\", "                ||----w |", "                ||     ||"].join("\n") };
  },
  fortune: () => {
    const fortunes = [
      "The best OS doesn't feel like software — it feels like it understands you.",
      "Trust is not given; it is continuously proven.",
      "Every action deserves a receipt.",
      "The sovereign mind does not hallucinate — it reasons with evidence.",
      "Calm is a feature, not the absence of features.",
      "Zero-knowledge proof: the system knows, but doesn't reveal.",
      "In the silence between keystrokes, intelligence prepares.",
    ];
    return { output: `\n  "${fortunes[Math.floor(Math.random() * fortunes.length)]}"\n\n  \x1b[2m— SITA OS Fortune Cookie\x1b[0m\n` };
  },
  weather: () => {
    const temp = Math.round(15 + Math.random() * 15);
    return { output: [
      "",
      "    \\  /       Partly Cloudy",
      `  _ /\"\".-.     ${temp}°C (${Math.round(temp * 9/5 + 32)}°F)`,
      `    \\_(   ).   Wind: ${Math.round(5 + Math.random() * 20)} km/h`,
      `    /(___(__)  Humidity: ${Math.round(40 + Math.random() * 40)}%`,
      "",
    ].join("\n") };
  },
  matrix: () => {
    const chars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789";
    const lines: string[] = [""];
    for (let row = 0; row < 6; row++) {
      let line = "  ";
      for (let col = 0; col < 40; col++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      lines.push(line);
    }
    lines.push("");
    return { output: lines.join("\n") };
  },
  ascii: () => ({
    output: [
      "",
      "    ███████╗██╗████████╗ █████╗ ",
      "    ██╔════╝██║╚══██╔══╝██╔══██╗",
      "    ███████╗██║   ██║   ███████║",
      "    ╚════██║██║   ██║   ██╔══██║",
      "    ███████║██║   ██║   ██║  ██║",
      "    ╚══════╝╚═╝   ╚═╝   ╚═╝  ╚═╝",
      "    \x1b[2mSovereign Intelligence Terminal Architecture\x1b[0m",
      "",
    ].join("\n"),
  }),
  time: (args) => {
    const cmd = args.join(" ");
    if (!cmd) return { output: "  Usage: time <command>", type: "error" as const };
    const start = performance.now();
    const elapsed = (Math.random() * 10 + 1).toFixed(3);
    return { output: `  real    0m${elapsed}s\n  user    0m${(parseFloat(elapsed) * 0.6).toFixed(3)}s\n  sys     0m${(parseFloat(elapsed) * 0.4).toFixed(3)}s` };
  },
  bench: () => {
    const results = [
      { test: "CPU (integer)", score: Math.round(8500 + Math.random() * 1500) },
      { test: "CPU (float)", score: Math.round(7200 + Math.random() * 1200) },
      { test: "Memory (seq)", score: Math.round(12000 + Math.random() * 3000) },
      { test: "Memory (rand)", score: Math.round(6800 + Math.random() * 2000) },
      { test: "GPU (render)", score: Math.round(15000 + Math.random() * 5000) },
    ];
    const header = "  Test             Score";
    const div = "  " + "─".repeat(30);
    const rows = results.map(r => `  ${r.test.padEnd(17)} ${String(r.score).padStart(6)}`);
    return { output: ["\n  ⚡ SITA Benchmark v2.0\n", header, div, ...rows, div, `  Overall: ${Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)}\n`].join("\n") };
  },
  man: (args) => {
    if (!args[0]) return { output: "  Usage: man <command>", type: "error" as const };
    const cmd = args[0];
    if (!COMMANDS[cmd]) return { output: `  No manual entry for ${cmd}`, type: "error" as const };
    return { output: `\n  \x1b[1m${cmd.toUpperCase()}(1)\x1b[0m — SITA OS Command\n\n  \x1b[1mNAME\x1b[0m\n    ${cmd} — built-in SITA terminal command\n\n  \x1b[1mSYNOPSIS\x1b[0m\n    ${cmd} [options] [arguments]\n\n  \x1b[1mDESCRIPTION\x1b[0m\n    Part of the SITA OS Terminal v2.0 built-in command suite.\n    Type 'help' for a full list of available commands.\n` };
  },
  theme: (args) => {
    const themes = ["dark", "light", "midnight", "solarized", "monokai"];
    if (!args[0]) return { output: `  Current: dark\n  Available: ${themes.join(", ")}` };
    if (themes.includes(args[0])) return { output: `  Theme set to: ${args[0]}` };
    return { output: `  Unknown theme: ${args[0]}`, type: "error" as const };
  },
};

// ── ANSI Color Parser ──────────────────────────────────────

function parseAnsi(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\x1b\[(\d+)m/g;
  let lastIndex = 0;
  let match;
  let currentClass = "";

  const codeToClass: Record<string, string> = {
    "0": "", "1": "font-bold", "2": "opacity-50",
    "30": "text-[hsl(0_0%_20%)]", "31": "text-[hsl(0_70%_65%)]",
    "32": "text-[hsl(120_50%_60%)]", "33": "text-[hsl(38_85%_65%)]",
    "34": "text-[hsl(210_70%_65%)]", "35": "text-[hsl(280_60%_70%)]",
    "36": "text-[hsl(180_50%_60%)]", "37": "text-[hsl(0_0%_80%)]",
  };

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex} className={currentClass}>{text.slice(lastIndex, match.index)}</span>);
    }
    currentClass = codeToClass[match[1]] || "";
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={lastIndex} className={currentClass}>{text.slice(lastIndex)}</span>);
  }
  return parts.length > 0 ? parts : [text];
}

// ── Component ──────────────────────────────────────────────

function createTab(id?: string): Tab {
  return {
    id: id || `tab-${Date.now()}`,
    title: "nova-sh",
    cwd: "/home/sita-user",
    lines: [
      { id: "welcome", type: "system", content: "\n  \x1b[35m⬛ SITA OS Terminal v2.0\x1b[0m — \x1b[2mType 'help' for commands, Tab for autocomplete\x1b[0m\n", timestamp: Date.now() },
    ],
    history: [],
    historyIdx: -1,
  };
}

export function TerminalWindow() {
  const [tabs, setTabs] = useState<Tab[]>([createTab("main")]);
  const [activeTabId, setActiveTabId] = useState("main");
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId)!;

  // Autocomplete
  useEffect(() => {
    if (input.length > 0) {
      const parts = input.split(/\s+/);
      const current = parts[parts.length - 1];
      if (parts.length === 1) {
        const matches = ALL_COMMANDS.filter(c => c.startsWith(current) && c !== current);
        setSuggestions(matches.slice(0, 6));
      } else {
        // File completion
        const files = Object.keys(VIRTUAL_FS).filter(f => f.startsWith(current) && f !== current);
        setSuggestions(files.slice(0, 6));
      }
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const updateTab = useCallback((id: string, updater: (tab: Tab) => Tab) => {
    setTabs(prev => prev.map(t => t.id === id ? updater(t) : t));
  }, []);

  const addLine = useCallback((type: TermLine["type"], content: string) => {
    updateTab(activeTabId, tab => ({
      ...tab,
      lines: [...tab.lines, { id: `l-${Date.now()}-${Math.random()}`, type, content, timestamp: Date.now() }],
    }));
  }, [activeTabId, updateTab]);

  const executeCommand = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    SoundEngine.click();
    addLine("input", `$ ${trimmed}`);
    updateTab(activeTabId, tab => ({
      ...tab,
      history: [...tab.history, trimmed],
      historyIdx: -1,
    }));

    const [cmd, ...args] = trimmed.split(/\s+/);

    if (cmd === "clear") {
      updateTab(activeTabId, tab => ({ ...tab, lines: [] }));
      return;
    }

    if (cmd === "history") {
      const tab = tabs.find(t => t.id === activeTabId)!;
      const output = tab.history.map((h, i) => `  ${String(i + 1).padStart(4)}  ${h}`).join("\n");
      addLine("output", output || "  (no history)");
      return;
    }

    const handler = COMMANDS[cmd];
    if (handler) {
      const result = handler(args, activeTab.cwd);
      addLine(result.type || "output", result.output);
    } else {
      addLine("error", `  nova-sh: command not found: ${cmd}\n  \x1b[2mTry 'help' for a list of commands\x1b[0m`);
      SoundEngine.error();
    }
  }, [addLine, updateTab, activeTabId, tabs, activeTab]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (suggestions.length > 0) {
        const parts = input.split(/\s+/);
        parts[parts.length - 1] = suggestions[selectedSuggestion];
        setInput(parts.join(" ") + " ");
        setSuggestions([]);
        SoundEngine.click();
      }
      return;
    }
    if (e.key === "Enter") {
      setSuggestions([]);
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestion(i => Math.max(0, i - 1));
      } else if (activeTab.history.length > 0) {
        const idx = activeTab.historyIdx === -1 ? activeTab.history.length - 1 : Math.max(0, activeTab.historyIdx - 1);
        updateTab(activeTabId, t => ({ ...t, historyIdx: idx }));
        setInput(activeTab.history[idx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestion(i => Math.min(suggestions.length - 1, i + 1));
      } else if (activeTab.historyIdx >= 0) {
        const idx = activeTab.historyIdx + 1;
        if (idx >= activeTab.history.length) {
          updateTab(activeTabId, t => ({ ...t, historyIdx: -1 }));
          setInput("");
        } else {
          updateTab(activeTabId, t => ({ ...t, historyIdx: idx }));
          setInput(activeTab.history[idx]);
        }
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      updateTab(activeTabId, t => ({ ...t, lines: [] }));
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      addLine("system", `  ^C`);
      setInput("");
    } else if (e.key === "t" && e.ctrlKey) {
      e.preventDefault();
      addTab();
    } else if (e.key === "w" && e.ctrlKey) {
      e.preventDefault();
      closeTab(activeTabId);
    }
  }, [input, executeCommand, activeTab, suggestions, selectedSuggestion, activeTabId, updateTab, addLine]);

  const addTab = useCallback(() => {
    const tab = createTab();
    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
    SoundEngine.click();
  }, []);

  const closeTab = useCallback((id: string) => {
    if (tabs.length <= 1) return;
    const idx = tabs.findIndex(t => t.id === id);
    setTabs(prev => prev.filter(t => t.id !== id));
    if (id === activeTabId) {
      setActiveTabId(tabs[idx > 0 ? idx - 1 : 1].id);
    }
  }, [tabs, activeTabId]);

  // Auto-scroll
  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [activeTab.lines.length]);

  // Auto-focus
  useEffect(() => { inputRef.current?.focus(); }, [activeTabId]);

  // Status bar metrics
  const cpuUsage = useMemo(() => (2 + Math.random() * 8).toFixed(1), [activeTab.lines.length]);
  const memUsage = useMemo(() => Math.round(40 + Math.random() * 30), [activeTab.lines.length]);

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(0_0%_15%)] to-[hsl(0_0%_25%)]">
      <div
        className="flex flex-col h-full min-h-[340px] bg-[hsl(220_15%_4%)] cursor-text relative overflow-hidden"
        onClick={() => inputRef.current?.focus()}
      >
        {/* CRT ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.03) 0%, transparent 60%)",
        }} />

        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(220_15%_6%)] relative z-10 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium font-mono transition-all duration-100 border-r border-[hsl(0_0%_100%/0.04)] group min-w-0",
                tab.id === activeTabId
                  ? "bg-[hsl(220_15%_4%)] text-[hsl(0_0%_80%)]"
                  : "bg-[hsl(220_15%_8%)] text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_60%)] hover:bg-[hsl(220_15%_7%)]"
              )}
            >
              <TermIcon className="w-3 h-3 flex-shrink-0 text-[hsl(var(--primary))]" />
              <span className="truncate">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 rounded hover:bg-[hsl(0_0%_100%/0.1)]"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </button>
          ))}
          <button
            onClick={addTab}
            className="px-2 py-1.5 text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_65%)] transition-colors"
            title="New tab (Ctrl+T)"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Output area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin relative z-10">
          <AnimatePresence initial={false}>
            {activeTab.lines.map(line => (
              <motion.pre
                key={line.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1 }}
                className={cn(
                  "text-[12px] leading-[1.7] whitespace-pre-wrap break-all font-mono",
                  line.type === "input" ? "text-[hsl(0_0%_80%)]" : "",
                  line.type === "output" ? "text-[hsl(120_40%_72%)]" : "",
                  line.type === "error" ? "text-[hsl(0_65%_65%)]" : "",
                  line.type === "system" ? "text-[hsl(0_0%_50%)]" : "",
                )}
              >
                {line.type === "input" ? highlightLine(line.content, line.type) : parseAnsi(line.content)}
              </motion.pre>
            ))}
          </AnimatePresence>
        </div>

        {/* Autocomplete dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.1 }}
              className="absolute bottom-10 left-3 z-20 bg-[hsl(220_15%_10%)] border border-[hsl(0_0%_100%/0.1)] rounded-lg shadow-2xl backdrop-blur-xl overflow-hidden min-w-[160px]"
            >
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  onClick={() => {
                    const parts = input.split(/\s+/);
                    parts[parts.length - 1] = s;
                    setInput(parts.join(" ") + " ");
                    setSuggestions([]);
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-mono transition-colors",
                    i === selectedSuggestion
                      ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                      : "text-[hsl(0_0%_65%)] hover:bg-[hsl(0_0%_100%/0.05)]"
                  )}
                >
                  <ChevronRight className="w-2.5 h-2.5 opacity-40" />
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input line */}
        <div className="flex items-center gap-2 px-3 py-2 border-t border-[hsl(0_0%_100%/0.06)] bg-[hsl(220_15%_5%)] relative z-10 flex-shrink-0">
          <span className="text-[11px] font-mono text-[hsl(var(--primary))] font-semibold select-none flex items-center gap-1">
            <span className="text-[hsl(120_50%_55%)]">sita</span>
            <span className="text-[hsl(0_0%_40%)]">:</span>
            <span className="text-[hsl(210_70%_65%)]">~</span>
            <span className="text-[hsl(0_0%_50%)]">$</span>
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[12px] font-mono text-[hsl(0_0%_88%)] outline-none placeholder:text-[hsl(0_0%_25%)] caret-[hsl(var(--primary))]"
            placeholder=""
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-[hsl(var(--primary)/0.08)] border-t border-[hsl(var(--primary)/0.15)] text-[10px] font-mono text-[hsl(var(--primary)/0.7)] relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5" /> {cpuUsage}%
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-2.5 h-2.5" /> {memUsage}MB
            </span>
            <span className="flex items-center gap-1">
              <Wifi className="w-2.5 h-2.5" /> Connected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>{activeTab.history.length} cmds</span>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>
    </AppStateWrapper>
  );
}
