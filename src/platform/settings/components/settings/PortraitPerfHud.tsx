// ═══════════════════════════════════════════════════════════════
// SITA OS — Portrait Performance HUD
// Floating overlay that shows real-time portrait loading telemetry.
// Toggle via Settings or window.__SITA_PERF_HUD = true
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { isPerfHudActive, getSnapshot, type PerfSnapshot } from "@/lib/advisors/portrait-perf-metrics";
import { Activity, X, Image, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function PortraitPerfHud() {
  const [visible, setVisible] = useState(false);
  const [snap, setSnap] = useState<PerfSnapshot | null>(null);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const check = () => setVisible(isPerfHudActive());
    check();
    const id = setInterval(check, 2000);
    return () => clearInterval(id);
  }, []);

  // Refresh metrics every second while visible
  useEffect(() => {
    if (!visible) return;
    const refresh = () => setSnap(getSnapshot());
    refresh();
    const id = setInterval(refresh, 1000);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible || !snap) return null;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-[9999] h-10 w-10 rounded-full bg-card/90 border border-border/40 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-accent/40 transition-colors"
        title="Expand Performance HUD"
      >
        <Activity className="h-4 w-4 text-primary" />
      </button>
    );
  }

  const jankColor = snap.totalJankFrames === 0
    ? "text-emerald-500"
    : snap.totalJankFrames < 5
      ? "text-amber-500"
      : "text-destructive";

  const loadColor = snap.avgLoadMs < 200
    ? "text-emerald-500"
    : snap.avgLoadMs < 600
      ? "text-amber-500"
      : "text-destructive";

  const recentLoads = snap.loads.slice(-6).reverse();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-72 rounded-xl bg-card/95 border border-border/40 backdrop-blur-md shadow-2xl text-xs font-mono">
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Activity className="h-3 w-3 text-primary" />
          <span className="font-semibold text-foreground">Portrait Perf</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setMinimized(true)} className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent/40 text-muted-foreground">
            <span className="text-[10px]">─</span>
          </button>
          <button onClick={() => setVisible(false)} className="h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-px bg-border/20 border-b border-border/30">
        <Stat icon={Clock} label="Avg Load" value={`${Math.round(snap.avgLoadMs)}ms`} color={loadColor} />
        <Stat icon={Image} label="Avg Decode" value={snap.avgDecodeMs ? `${Math.round(snap.avgDecodeMs)}ms` : "–"} color="text-muted-foreground" />
        <Stat icon={Zap} label="Jank" value={`${snap.totalJankFrames}`} color={jankColor} />
      </div>

      {/* Recent loads */}
      <div className="px-3 py-2 max-h-36 overflow-y-auto space-y-1">
        {recentLoads.length === 0 ? (
          <p className="text-muted-foreground text-center py-2">No portrait loads yet</p>
        ) : recentLoads.map((l, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <span className="w-14 truncate text-muted-foreground" title={l.domain}>{l.domain}</span>
            <span className={cn("tabular-nums", l.loadTimeMs > 500 ? "text-amber-500" : "text-foreground")}>
              {l.loadTimeMs}ms
            </span>
            <span className="text-muted-foreground/60">
              dec:{l.decodeTimeMs !== null ? `${l.decodeTimeMs}ms` : "–"}
            </span>
            {l.retryCount > 0 && (
              <span className="text-destructive">r{l.retryCount}</span>
            )}
          </div>
        ))}
      </div>

      {/* Jank waterfall */}
      {snap.jankFrames.length > 0 && (
        <div className="px-3 py-2 border-t border-border/30">
          <p className="text-[9px] text-muted-foreground mb-1">Recent Jank Frames</p>
          <div className="flex items-end gap-[2px] h-5">
            {snap.jankFrames.slice(-20).map((j, i) => (
              <div
                key={i}
                className={cn(
                  "w-[3px] rounded-t-sm",
                  j.durationMs > 100 ? "bg-destructive" : "bg-amber-500/70",
                )}
                style={{ height: `${Math.min(100, (j.durationMs / 200) * 100)}%` }}
                title={`${j.durationMs}ms`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-card px-2 py-2 text-center">
      <Icon className={cn("h-3 w-3 mx-auto mb-0.5", color)} />
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className={cn("text-[11px] font-semibold tabular-nums", color)}>{value}</p>
    </div>
  );
}