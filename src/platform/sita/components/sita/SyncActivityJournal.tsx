// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Activity Journal (User-Facing)
// Timeline of sync events, device activity, restore points
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity, RefreshCw, Share2, Trash2, RotateCcw, AlertTriangle,
  Smartphone, Shield, Settings, UserPlus, Search, Clock,
  Filter, ChevronDown, Undo2, HardDrive, Globe, Image
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JournalCategory, JournalSeverity } from "@/platform/sync-engine/collaboration/activity-journal";
import { useDataMode } from "@/contexts/DataModeContext";

// ─── Demo Data ───────────────────────────────────────────────

const ENTRIES = [
  { id: "j1", category: "sync" as JournalCategory, severity: "info" as JournalSeverity, title: "Pulled 14 objects", description: "Sync pull from MacBook Pro", deviceName: "MacBook Pro", timestamp: new Date(Date.now() - 120000).toISOString(), undoable: false },
  { id: "j2", category: "share" as JournalCategory, severity: "info" as JournalSeverity, title: "Shared with Alex", description: "Q4 Business Plan shared with edit access", deviceName: "iPhone 16", timestamp: new Date(Date.now() - 900000).toISOString(), undoable: true },
  { id: "j3", category: "settings" as JournalCategory, severity: "info" as JournalSeverity, title: "Theme changed", description: "Dark mode enabled across devices", deviceName: "iPad Air", timestamp: new Date(Date.now() - 3600000).toISOString(), undoable: true },
  { id: "j4", category: "delete" as JournalCategory, severity: "warning" as JournalSeverity, title: "Moved to trash", description: "Old meeting notes in files.documents", deviceName: "MacBook Pro", timestamp: new Date(Date.now() - 7200000).toISOString(), undoable: true },
  { id: "j5", category: "conflict" as JournalCategory, severity: "warning" as JournalSeverity, title: "Conflict resolved", description: "Budget spreadsheet — kept latest version", deviceName: "iPhone 16", timestamp: new Date(Date.now() - 14400000).toISOString(), undoable: false },
  { id: "j6", category: "device" as JournalCategory, severity: "info" as JournalSeverity, title: "Device enrolled", description: "iPad Air joined sync ecosystem", deviceName: "iPad Air", timestamp: new Date(Date.now() - 86400000).toISOString(), undoable: false },
  { id: "j7", category: "security" as JournalCategory, severity: "warning" as JournalSeverity, title: "Trust level changed", description: "Old Laptop downgraded to limited trust", deviceName: "Old Laptop", timestamp: new Date(Date.now() - 172800000).toISOString(), undoable: false },
  { id: "j8", category: "restore" as JournalCategory, severity: "success" as JournalSeverity, title: "Restored v3", description: "Family Budget reverted to previous version", deviceName: "MacBook Pro", timestamp: new Date(Date.now() - 259200000).toISOString(), undoable: false },
  { id: "j9", category: "sync" as JournalCategory, severity: "info" as JournalSeverity, title: "Pushed 8 objects", description: "Settings sync to all devices", deviceName: "MacBook Pro", timestamp: new Date(Date.now() - 345600000).toISOString(), undoable: false },
  { id: "j10", category: "media" as JournalCategory, severity: "info" as JournalSeverity, title: "Photos uploaded", description: "42 photos synced from iPhone", deviceName: "iPhone 16", timestamp: new Date(Date.now() - 432000000).toISOString(), undoable: false },
];

const CATEGORY_CONFIG: Record<string, { icon: typeof Activity; color: string; label: string }> = {
  sync: { icon: RefreshCw, color: "text-primary", label: "Sync" },
  share: { icon: Share2, color: "text-blue-400", label: "Share" },
  delete: { icon: Trash2, color: "text-amber-400", label: "Delete" },
  restore: { icon: RotateCcw, color: "text-emerald-400", label: "Restore" },
  conflict: { icon: AlertTriangle, color: "text-amber-400", label: "Conflict" },
  device: { icon: Smartphone, color: "text-cyan-400", label: "Device" },
  security: { icon: Shield, color: "text-red-400", label: "Security" },
  settings: { icon: Settings, color: "text-purple-400", label: "Settings" },
  enrollment: { icon: UserPlus, color: "text-emerald-400", label: "Enrollment" },
  recovery: { icon: RotateCcw, color: "text-amber-400", label: "Recovery" },
  quota: { icon: HardDrive, color: "text-orange-400", label: "Quota" },
  workspace: { icon: Globe, color: "text-blue-400", label: "Workspace" },
  migration: { icon: Globe, color: "text-cyan-400", label: "Migration" },
  media: { icon: Image, color: "text-pink-400", label: "Media" },
  "app-state": { icon: Activity, color: "text-primary", label: "App State" },
};

const SEVERITY_STYLES: Record<JournalSeverity, string> = {
  info: "border-l-blue-400/50",
  warning: "border-l-amber-400/50",
  critical: "border-l-red-400/50",
  success: "border-l-emerald-400/50",
};

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

interface SyncActivityJournalProps {
  compact?: boolean;
  maxEntries?: number;
}

export function SyncActivityJournal({ compact = false, maxEntries = 10 }: SyncActivityJournalProps) {
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showUndoableOnly, setShowUndoableOnly] = useState(false);

  const filteredEntries = useMemo(() => {
    let entries = [...ENTRIES];
    if (searchText) {
      const s = searchText.toLowerCase();
      entries = entries.filter(e => e.title.toLowerCase().includes(s) || e.description.toLowerCase().includes(s));
    }
    if (categoryFilter) entries = entries.filter(e => e.category === categoryFilter);
    if (showUndoableOnly) entries = entries.filter(e => e.undoable);
    return entries.slice(0, maxEntries);
  }, [searchText, categoryFilter, showUndoableOnly, maxEntries]);

  if (compact) {
    return (
      <div className="space-y-1.5">
        {filteredEntries.slice(0, 5).map(entry => {
          const config = CATEGORY_CONFIG[entry.category] ?? CATEGORY_CONFIG.sync;
          const Icon = config.icon;
          return (
            <div key={entry.id} className="flex items-center gap-2 py-1.5">
              <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", config.color)} />
              <span className="text-xs truncate flex-1">{entry.title}</span>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatRelativeTime(entry.timestamp)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Activity Journal
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showUndoableOnly ? "default" : "outline"}
              className="text-xs h-7"
              onClick={() => setShowUndoableOnly(!showUndoableOnly)}
            >
              <Undo2 className="h-3 w-3 mr-1" /> Undoable
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            <Button
              size="sm" variant={!categoryFilter ? "default" : "outline"}
              className="text-xs h-8 px-2.5" onClick={() => setCategoryFilter(null)}
            >All</Button>
            {["sync", "share", "delete", "device", "security"].map(cat => (
              <Button
                key={cat}
                size="sm" variant={categoryFilter === cat ? "default" : "outline"}
                className="text-xs h-8 px-2.5 capitalize"
                onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
              >{cat}</Button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-1">
          {filteredEntries.map(entry => {
            const config = CATEGORY_CONFIG[entry.category] ?? CATEGORY_CONFIG.sync;
            const Icon = config.icon;
            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 border-l-2 hover:bg-muted/30 transition-colors",
                  SEVERITY_STYLES[entry.severity]
                )}
              >
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", config.color, "bg-current/10")}>
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{entry.title}</p>
                    {entry.undoable && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-primary border-primary/30">
                        Undoable
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <Smartphone className="h-3 w-3" />
                    <span>{entry.deviceName}</span>
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(entry.timestamp)}</span>
                  </div>
                </div>
                {entry.undoable && (
                  <Button size="sm" variant="ghost" className="text-xs h-7 px-2 flex-shrink-0">
                    <Undo2 className="h-3 w-3 mr-1" /> Undo
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No matching activity found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
