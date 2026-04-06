// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Shell
// Dense, diagnostic, truth-aware operator experience
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { useRealityModeSafe } from "@/lib/dual-reality";
import { RealityModeIndicator } from "@/components/admin-os/RealityModeIndicator";
import { SystemStatusBar } from "@/components/admin-os/SystemStatusBar";
import { LaunchTruthIndicator } from "@/components/admin-os/LaunchTruthIndicator";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  showSystemBar?: boolean;
}

export function AdminShell({ children, title, showSystemBar = true }: AdminShellProps) {
  const { mode, isDemo } = useRealityModeSafe();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Admin Top Bar — dense, diagnostic */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
              SITA Admin OS
            </span>
            {title && (
              <>
                <span className="text-muted-foreground/40">›</span>
                <span className="text-sm font-medium">{title}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LaunchTruthIndicator />
            <RealityModeIndicator />
          </div>
        </div>
      </header>

      {/* System Status Bar */}
      {showSystemBar && <SystemStatusBar />}

      {/* Demo warning banner */}
      {isDemo && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center">
          <span className="text-xs font-mono text-amber-400">
            ⚠ DEMO MODE ACTIVE — Side effects blocked, data is scenario-seeded
          </span>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
