// ═══════════════════════════════════════════════════════════════
// SITA OS — User App Shell
// Calm, elegant, assistive daily-use experience
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { useRealityModeSafe } from "@/lib/dual-reality";
import { RealityStateBanner } from "@/components/user-app/RealityStateBanner";

interface UserAppShellProps {
  children: React.ReactNode;
  title?: string;
  showRealityBanner?: boolean;
}

export function UserAppShell({ children, title, showRealityBanner = true }: UserAppShellProps) {
  const { mode, isDemo } = useRealityModeSafe();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Reality Banner — subtle, user-friendly */}
      {showRealityBanner && isDemo && <RealityStateBanner />}

      {/* Main content — spacious, premium */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
