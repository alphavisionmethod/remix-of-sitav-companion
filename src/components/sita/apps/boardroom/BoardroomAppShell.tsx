import React, { useState } from "react";
import {
  Presentation, Briefcase, TrendingUp, Users,
  Brain, CheckSquare, AlertTriangle, History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODULES = [
  { id: "executive", label: "Executive Review", icon: Presentation },
  { id: "business-pulse", label: "Business Pulse", icon: Briefcase },
  { id: "finance-pulse", label: "Finance Pulse", icon: TrendingUp },
  { id: "concierge-pulse", label: "Concierge Pulse", icon: Users },
  { id: "synthesis", label: "Advisor Synthesis", icon: Brain },
  { id: "actions", label: "Action Tracker", icon: CheckSquare },
  { id: "risks", label: "Risk & Disagreement", icon: AlertTriangle },
  { id: "decisions", label: "Decision Memory", icon: History },
];

export function BoardroomAppShell() {
  const [activeModule, setActiveModule] = useState("executive");

  return (
    <div className="flex h-full w-full bg-[hsl(220_15%_6%)]">
      {/* Sidebar */}
      <div className="w-[200px] shrink-0 border-r border-[hsl(0_0%_100%/0.06)] bg-[hsl(220_15%_5%)] flex flex-col py-4 px-2 gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(290_60%_65%/0.6)] px-3 mb-3">
          Boardroom
        </p>
        {MODULES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveModule(item.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none text-left",
              activeModule === item.id
                ? "bg-[hsl(290_50%_50%/0.1)] text-[hsl(290_50%_70%)] border border-[hsl(290_50%_50%/0.2)] shadow-[inset_3px_0_0_hsl(290_50%_55%)]"
                : "text-[hsl(0_0%_100%/0.5)] hover:bg-[hsl(0_0%_100%/0.05)] hover:text-[hsl(0_0%_100%/0.8)] border border-transparent"
            )}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-11 shrink-0 border-b border-[hsl(0_0%_100%/0.06)] flex items-center px-5 bg-[hsl(220_15%_6%/0.8)]">
          <span className="text-sm font-semibold text-[hsl(290_50%_70%/0.9)]">
            {MODULES.find((m) => m.id === activeModule)?.label}
          </span>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-[hsl(0_0%_100%/0.2)] uppercase tracking-[0.2em] text-lg font-medium select-none">
            {activeModule.toUpperCase()} DATA CANVAS
          </div>
        </div>
      </div>
    </div>
  );
}
