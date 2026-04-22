// ═══════════════════════════════════════════════════════════════
// Nova OS — Code Editor Window App
// Syntax highlighting, file tree, tabs, minimap
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  FileCode, Folder, FolderOpen, ChevronRight, ChevronDown,
  X, Circle, Terminal, Settings, Search, GitBranch
} from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
  content?: string;
}

const MOCK_FILES: FileNode[] = [
  {
    name: "src", type: "folder", children: [
      {
        name: "components", type: "folder", children: [
          { name: "App.tsx", type: "file", language: "tsx", content: `import { useState } from "react";\nimport { Header } from "./Header";\nimport { Dashboard } from "./Dashboard";\n\nexport function App() {\n  const [user, setUser] = useState(null);\n  const [theme, setTheme] = useState("dark");\n\n  return (\n    <div className="app">\n      <Header user={user} theme={theme} />\n      <Dashboard />\n    </div>\n  );\n}` },
          { name: "Header.tsx", type: "file", language: "tsx", content: `interface HeaderProps {\n  user: User | null;\n  theme: string;\n}\n\nexport function Header({ user, theme }: HeaderProps) {\n  return (\n    <header className="h-14 border-b">\n      <h1>SITA OS</h1>\n    </header>\n  );\n}` },
          { name: "Dashboard.tsx", type: "file", language: "tsx", content: `import { useEffect, useState } from "react";\n\nexport function Dashboard() {\n  const [metrics, setMetrics] = useState([]);\n\n  useEffect(() => {\n    fetchMetrics().then(setMetrics);\n  }, []);\n\n  return (\n    <div className="grid grid-cols-3 gap-4 p-6">\n      {metrics.map(m => (\n        <MetricCard key={m.id} {...m} />\n      ))}\n    </div>\n  );\n}` },
        ]
      },
      {
        name: "lib", type: "folder", children: [
          { name: "utils.ts", type: "file", language: "ts", content: `import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}` },
          { name: "api.ts", type: "file", language: "ts", content: `const BASE_URL = "/api/v1";\n\nexport async function fetchMetrics() {\n  const res = await fetch(\`\${BASE_URL}/metrics\`);\n  return res.json();\n}\n\nexport async function updateConfig(config: Config) {\n  return fetch(\`\${BASE_URL}/config\`, {\n    method: "PUT",\n    body: JSON.stringify(config),\n  });\n}` },
        ]
      },
      { name: "main.tsx", type: "file", language: "tsx", content: `import { createRoot } from "react-dom/client";\nimport {
import { useDataMode } from "@/contexts/DataModeContext"; App } from "./components/App";\nimport "./index.css";\n\ncreateRoot(\n  document.getElementById("root")!\n).render(<App />);` },
    ]
  },
  { name: "package.json", type: "file", language: "json", content: `{\n  "name": "nova-project",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}` },
  { name: "tsconfig.json", type: "file", language: "json", content: `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "ESNext",\n    "strict": true\n  }\n}` },
];

// Simple syntax colorizer
function colorize(line: string, lang: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const keywords = /\b(import|export|from|const|let|var|function|return|if|else|async|await|interface|type|class|extends|new|typeof|void)\b/g;
  const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
  const comments = /(\/\/.*$)/gm;
  const types = /\b(string|number|boolean|null|undefined|any|React|useState|useEffect)\b/g;

  // Simple approach: just colorize the whole line
  let html = line
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(comments, '<span class="text-[hsl(0_0%_35%)]">$1</span>')
    .replace(strings, '<span class="text-[hsl(35_80%_60%)]">$&</span>')
    .replace(keywords, '<span class="text-[hsl(265_55%_70%)]">$1</span>')
    .replace(types, '<span class="text-[hsl(190_60%_60%)]">$1</span>');

  return [<span key="l" dangerouslySetInnerHTML={{ __html: html }} />];
}

function FileTreeItem({ node, depth = 0, activeFile, onSelect }: {
  node: FileNode; depth?: number; activeFile: string; onSelect: (n: FileNode) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isFolder = node.type === "folder";
  const isActive = node.name === activeFile;

  return (
    <div>
      <button
        onClick={() => isFolder ? setOpen(!open) : onSelect(node)}
        className={cn(
          "w-full text-left flex items-center gap-1 py-0.5 px-1 rounded text-[11px] transition-colors",
          isActive ? "bg-[hsl(265_55%_55%/0.15)] text-[hsl(0_0%_90%)]" : "text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_15%)]"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        {isFolder ? (
          open ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />
        ) : <FileCode className="h-3 w-3 shrink-0 text-[hsl(190_50%_55%)]" />}
        {isFolder ? (
          open ? <FolderOpen className="h-3 w-3 shrink-0 text-[hsl(35_70%_55%)]" /> : <Folder className="h-3 w-3 shrink-0 text-[hsl(35_70%_55%)]" />
        ) : null}
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && open && node.children?.map(c => (
        <FileTreeItem key={c.name} node={c} depth={depth + 1} activeFile={activeFile} onSelect={onSelect} />
      ))}
    </div>
  );
}

export function CodeEditorWindow() {
  const { isDemoMode } = useDataMode();
  const [openFiles, setOpenFiles] = useState<FileNode[]>([
    MOCK_FILES[0].children![0].children![0], // App.tsx
  ]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);

  const activeFile = openFiles[activeIdx];
  const lines = (activeFile?.content || "").split("\n");

  const openFile = (node: FileNode) => {
    if (node.type === "folder") return;
    const existing = openFiles.findIndex(f => f.name === node.name);
    if (existing >= 0) { setActiveIdx(existing); return; }
    setOpenFiles([...openFiles, node]);
    setActiveIdx(openFiles.length);
  };

  const closeTab = (idx: number) => {
    const next = openFiles.filter((_, i) => i !== idx);
    setOpenFiles(next);
    if (activeIdx >= next.length) setActiveIdx(Math.max(0, next.length - 1));
    else if (idx < activeIdx) setActiveIdx(activeIdx - 1);
  };

  return (
    <div className="flex h-[450px] bg-[hsl(0_0%_7%)] text-[hsl(0_0%_85%)] rounded-b-xl overflow-hidden">
      {/* File Tree */}
      <div className="w-44 border-r border-[hsl(0_0%_12%)] flex flex-col">
        <div className="p-2 flex items-center gap-2 border-b border-[hsl(0_0%_12%)]">
          <Search className="h-3 w-3 text-[hsl(0_0%_35%)]" />
          <span className="text-[10px] text-[hsl(0_0%_35%)] uppercase tracking-wider font-semibold">Explorer</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-1">
          {(isDemoMode ? MOCK_FILES : [] as typeof MOCK_FILES).map(f => (
            <FileTreeItem key={f.name} node={f} activeFile={activeFile?.name || ""} onSelect={openFile} />
          ))}
        </div>
        {/* Bottom bar */}
        <div className="p-2 border-t border-[hsl(0_0%_12%)] flex items-center gap-2">
          <GitBranch className="h-3 w-3 text-[hsl(0_0%_40%)]" />
          <span className="text-[10px] text-[hsl(0_0%_40%)]">main</span>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <div className="flex items-center border-b border-[hsl(0_0%_12%)] overflow-x-auto scrollbar-thin">
          {openFiles.map((f, i) => (
            <button
              key={f.name}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[11px] border-r border-[hsl(0_0%_12%)] shrink-0 transition-colors group",
                i === activeIdx
                  ? "bg-[hsl(0_0%_10%)] text-[hsl(0_0%_85%)] border-t-2 border-t-[hsl(265_55%_55%)]"
                  : "bg-[hsl(0_0%_7%)] text-[hsl(0_0%_45%)] hover:bg-[hsl(0_0%_9%)] border-t-2 border-t-transparent"
              )}
            >
              <FileCode className="h-3 w-3 text-[hsl(190_50%_55%)]" />
              <span>{f.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); closeTab(i); }}
                className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-[hsl(0_0%_20%)] rounded p-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </button>
          ))}
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto scrollbar-thin font-mono text-[12px] leading-[20px]">
          {activeFile ? lines.map((line, i) => (
            <div key={i} className="flex hover:bg-[hsl(0_0%_10%)]">
              <span className="w-10 text-right pr-3 text-[hsl(0_0%_25%)] select-none shrink-0">{i + 1}</span>
              <pre className="flex-1 whitespace-pre overflow-x-auto pr-4">
                {colorize(line, activeFile.language || "ts")}
              </pre>
            </div>
          )) : (
            <div className="flex items-center justify-center h-full text-[hsl(0_0%_25%)]">
              <p className="text-sm">Open a file to start editing</p>
            </div>
          )}
        </div>

        {/* Terminal Pane */}
        {showTerminal && (
          <div className="h-28 border-t border-[hsl(0_0%_12%)] bg-[hsl(0_0%_5%)]">
            <div className="flex items-center px-3 py-1 border-b border-[hsl(0_0%_12%)]">
              <Terminal className="h-3 w-3 text-[hsl(0_0%_40%)] mr-2" />
              <span className="text-[10px] text-[hsl(0_0%_40%)]">Terminal</span>
              <button onClick={() => setShowTerminal(false)} className="ml-auto"><X className="h-3 w-3 text-[hsl(0_0%_35%)]" /></button>
            </div>
            <div className="p-2 font-mono text-[11px] text-[hsl(0_0%_55%)]">
              <p><span className="text-[hsl(152_55%_55%)]">~/nova-project $</span> npm run dev</p>
              <p className="text-[hsl(0_0%_40%)]">  VITE v5.4.19  ready in 234 ms</p>
              <p className="text-[hsl(0_0%_40%)]">  ➜  Local:   http://localhost:5173/</p>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-0.5 bg-[hsl(265_55%_45%)] text-[9px] text-[hsl(0_0%_95%)]">
          <div className="flex items-center gap-3">
            <span>UTF-8</span>
            <span>{activeFile?.language?.toUpperCase() || "TEXT"}</span>
            <span>Ln {lines.length}, Col 1</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowTerminal(!showTerminal)} className="hover:underline flex items-center gap-1">
              <Terminal className="h-3 w-3" /> Terminal
            </button>
            <span>Spaces: 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
