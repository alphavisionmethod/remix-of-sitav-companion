// ═══════════════════════════════════════════════════════════════
// Admin OS — System Status Bar
// Compact diagnostic strip showing key system health
// ═══════════════════════════════════════════════════════════════

import { Activity, Database, Cpu, Wifi } from "lucide-react";

export function SystemStatusBar() {
  return (
    <div className="border-b border-border/40 bg-muted/30 px-4 py-1 flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
      <span className="flex items-center gap-1">
        <Activity className="h-3 w-3 text-emerald-400" />
        Runtime: OK
      </span>
      <span className="flex items-center gap-1">
        <Database className="h-3 w-3 text-blue-400" />
        DB: Connected
      </span>
      <span className="flex items-center gap-1">
        <Cpu className="h-3 w-3 text-purple-400" />
        AI Gateway: Standby
      </span>
      <span className="flex items-center gap-1">
        <Wifi className="h-3 w-3 text-amber-400" />
        Connectors: 0 live
      </span>
    </div>
  );
}
