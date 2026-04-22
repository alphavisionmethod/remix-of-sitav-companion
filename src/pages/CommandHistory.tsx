// ═══════════════════════════════════════════════════════════════
// SITA OS — Command History
// Browsable command history with replay and filters
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Search, Play, Clock, ArrowRight, Trash2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

interface CommandRecord {
  id: string;
  query: string;
  mode: "search" | "action" | "capture" | "navigate";
  result: string;
  timestamp: string;
  domain?: string;
}

const MOCK_HISTORY: CommandRecord[] = [
  { id: "cmd-1", query: "Enter Boardroom", mode: "action", result: "Navigated to /boardroom", timestamp: "2026-04-09T08:30:00Z" },
  { id: "cmd-2", query: "Johnson account", mode: "search", result: "Found: Johnson & Co. (Lead)", timestamp: "2026-04-09T08:15:00Z", domain: "business" },
  { id: "cmd-3", query: "note: Follow up on Q2 proposal", mode: "capture", result: "Note captured", timestamp: "2026-04-09T07:50:00Z" },
  { id: "cmd-4", query: "Review approvals", mode: "action", result: "Navigated to /approvals", timestamp: "2026-04-08T17:00:00Z" },
  { id: "cmd-5", query: "invoice Baker Corp", mode: "search", result: "Found: Invoice #1042 ($4,200)", timestamp: "2026-04-08T14:30:00Z", domain: "finance" },
  { id: "cmd-6", query: "Schedule callback", mode: "action", result: "Navigated to callback scheduler", timestamp: "2026-04-08T11:00:00Z", domain: "business" },
  { id: "cmd-7", query: "safe to spend", mode: "navigate", result: "Navigated to /money", timestamp: "2026-04-08T09:00:00Z", domain: "finance" },
  { id: "cmd-8", query: "task: prepare board deck", mode: "capture", result: "Task created", timestamp: "2026-04-07T16:00:00Z" },
];

const MODE_STYLES = {
  search: { label: "Search", color: "bg-primary/10 text-primary" },
  action: { label: "Action", color: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" },
  capture: { label: "Capture", color: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" },
  navigate: { label: "Navigate", color: "bg-muted text-muted-foreground" },
};

export default function CommandHistory() {
  const isDemoMode = false;
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (isDemoMode ? MOCK_HISTORY : [] as typeof MOCK_HISTORY).filter(r => {
    if (filter !== "all" && r.mode !== filter) return false;
    if (searchQuery && !r.query.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <SitaPageHeader
        icon={<Terminal className="h-6 w-6" />}
        title="Command History"
        subtitle="Browse, replay, and manage your command surface history"
      >
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
          <Trash2 className="h-4 w-4" /> Clear History
        </button>
      </SitaPageHeader>
      

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search command history..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1">
          {["all", "search", "action", "capture", "navigate"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
              {f === "all" ? "All" : MODE_STYLES[f as keyof typeof MODE_STYLES]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{filtered.length} commands</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {filtered.map(record => {
            const style = MODE_STYLES[record.mode];
            return (
              <div key={record.id} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/30 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono truncate">{record.query}</code>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0", style.color)}>{style.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <ArrowRight className="h-2.5 w-2.5" />
                    <span>{record.result}</span>
                    <span>•</span>
                    <span>{new Date(record.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-primary/10 transition-all" title="Replay">
                  <Play className="h-3.5 w-3.5 text-primary" />
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
