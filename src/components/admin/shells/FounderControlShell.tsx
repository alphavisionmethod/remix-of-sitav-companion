import { useState } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { GlobalCommandBar } from "./GlobalCommandBar";
import { FounderSidebar } from "./FounderSidebar";
import { AITransparencyPanel } from "./AITransparencyPanel";
import { FounderMobileNav } from "./FounderMobileNav";
import { StatusStrip } from "./StatusStrip";
import { SafeModeProvider } from "./SafeModeProvider";
import { ExplainSimplyProvider } from "./ExplainSimplyProvider";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface FounderControlShellProps {
  showDegradedBanner?: boolean;
  degradedMessage?: string;
}

export function FounderControlShell({
  showDegradedBanner = false,
  degradedMessage,
}: FounderControlShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelCollapsed, setAiPanelCollapsed] = useState(false);

  return (
    <SafeModeProvider>
      <ExplainSimplyProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Degraded banner */}
        {showDegradedBanner && (
          <div className="bg-destructive/5 border-b border-destructive/20 px-4 py-1.5 flex items-center gap-2 text-[11px] text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">{degradedMessage || "Some platform services are operating in degraded mode."}</span>
          </div>
        )}

        {/* Top Global Command Bar */}
        <GlobalCommandBar />

        {/* Status Strip — replaces old trust ribbon */}
        <StatusStrip />

        {/* Three-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar — hidden on mobile */}
          <div className="hidden md:block">
            <FounderSidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(c => !c)}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <Outlet />
          </main>

          {/* Right AI Transparency Panel — hidden on mobile */}
          <div className="hidden lg:block">
            <AITransparencyPanel
              collapsed={aiPanelCollapsed}
              onToggle={() => setAiPanelCollapsed(c => !c)}
            />
          </div>
        </div>

        {/* Mobile bottom nav */}
        <FounderMobileNav />
      </div>
      </ExplainSimplyProvider>
    </SafeModeProvider>
  );
}
