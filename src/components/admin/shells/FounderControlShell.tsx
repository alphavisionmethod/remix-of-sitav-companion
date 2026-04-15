import { useState } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { GlobalCommandBar } from "./GlobalCommandBar";
import { FounderSidebar } from "./FounderSidebar";
import { AITransparencyPanel } from "./AITransparencyPanel";
import { TrustRibbon } from "@/components/sita/admin/TrustRibbon";
import { RolloutStatusBanner } from "./RolloutStatusBanner";
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

      {/* Trust ribbon (compact) */}
      <div className="px-4 py-1.5 border-b border-border/20 bg-card/20">
        <div className="flex items-center justify-between">
          <TrustRibbon />
          <RolloutStatusBanner />
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <FounderSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Right AI Transparency Panel */}
        <AITransparencyPanel
          collapsed={aiPanelCollapsed}
          onToggle={() => setAiPanelCollapsed(c => !c)}
        />
      </div>
    </div>
  );
}
