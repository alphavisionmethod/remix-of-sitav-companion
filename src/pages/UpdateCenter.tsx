// ═══════════════════════════════════════════════════════════════
// SITA OS — Update Center
// Update channel, available updates, history
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, CheckCircle, Clock, RefreshCw, Shield, ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const UPDATE_HISTORY = [
  { version: "v2.8.1", date: "2026-04-07", type: "Patch", highlights: ["Security fixes", "Connector stability improvements", "Proof chain performance"], status: "installed" },
  { version: "v2.8.0", date: "2026-03-28", type: "Minor", highlights: ["New Boardroom weekly review", "Communication inbox", "Calm/focus mode"], status: "installed" },
  { version: "v2.7.9", date: "2026-03-15", type: "Patch", highlights: ["Mobile trust device improvements", "Search performance"], status: "installed" },
  { version: "v2.7.0", date: "2026-02-20", type: "Minor", highlights: ["AI governance workspace", "Enhanced approval flows", "Desktop surface redesign"], status: "installed" },
];

const CHANNELS = [
  { id: "stable", label: "Stable", description: "Production-ready, fully tested", active: true },
  { id: "beta", label: "Beta", description: "Preview features, may have rough edges", active: false },
  { id: "canary", label: "Canary", description: "Bleeding edge, for testing only", active: false },
];

export default function UpdateCenter() {
  const { isDemoMode } = useDataMode();

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <SitaPageHeader
        icon={<Download className="h-6 w-6" />}
        title="Update Center"
        subtitle="Manage update channels, view available updates, and review update history"
      />
      {isDemoMode && <DemoModeBadge />}

      {/* Current Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--trust-safe))]/10 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-[hsl(var(--trust-safe))]" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">Your system is up to date</p>
              <p className="text-sm text-muted-foreground">Running v2.8.1 on Stable channel • Last checked 2 hours ago</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              <RefreshCw className="h-4 w-4" /> Check Now
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Update Channel */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Update Channel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CHANNELS.map(ch => (
            <Card key={ch.id} className={cn("cursor-pointer transition-colors", ch.active ? "ring-1 ring-primary/30 border-primary/30" : "hover:border-primary/20")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{ch.label}</p>
                  {ch.active && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Active</span>}
                </div>
                <p className="text-[11px] text-muted-foreground">{ch.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Update History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Update History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {UPDATE_HISTORY.map(update => (
            <div key={update.version} className="flex items-start gap-3 py-3 px-3 rounded-lg bg-muted/30">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--trust-safe))]/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold font-mono">{update.version}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{update.type}</span>
                  <span className="text-[10px] text-muted-foreground">{update.date}</span>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {update.highlights.map((h, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <ArrowRight className="h-2.5 w-2.5 shrink-0" /> {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Auto-Update Policy */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Automatic Updates</p>
              <p className="text-[11px] text-muted-foreground">
                Security patches are applied automatically. Feature updates require approval. OTA agent runs daily at 03:00.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
