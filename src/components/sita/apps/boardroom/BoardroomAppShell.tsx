import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Presentation, Briefcase, TrendingUp, Users,
  Brain, CheckSquare, FlaskConical, History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BoardroomHeader } from "./BoardroomHeader";
import { BoardroomExecutiveView } from "./BoardroomExecutiveView";
import { BoardroomPulseView } from "./BoardroomPulseView";
import { BoardroomSynthesisView } from "./BoardroomSynthesisView";
import { BoardroomSimulationView } from "./BoardroomSimulationView";
import { BoardroomApprovalView } from "./BoardroomApprovalView";
import { BoardroomDecisionMemory } from "./BoardroomDecisionMemory";

const MODULES = [
  { id: "executive", label: "Executive Review", icon: Presentation },
  { id: "pulse", label: "Domain Pulse", icon: Briefcase },
  { id: "synthesis", label: "Advisor Synthesis", icon: Brain },
  { id: "simulation", label: "Simulation", icon: FlaskConical },
  { id: "approvals", label: "Approvals & Seals", icon: CheckSquare },
  { id: "memory", label: "Decision Memory", icon: History },
];

type SessionScope = "global" | "business" | "finance" | "concierge";

export function BoardroomAppShell() {
  const [activeModule, setActiveModule] = useState("executive");
  const [scope, setScope] = useState<SessionScope>("global");

  const viewProps = { scope, onNavigate: setActiveModule };

  const renderView = () => {
    switch (activeModule) {
      case "executive": return <BoardroomExecutiveView {...viewProps} />;
      case "pulse": return <BoardroomPulseView {...viewProps} />;
      case "synthesis": return <BoardroomSynthesisView {...viewProps} />;
      case "simulation": return <BoardroomSimulationView {...viewProps} />;
      case "approvals": return <BoardroomApprovalView {...viewProps} />;
      case "memory": return <BoardroomDecisionMemory />;
      default: return <BoardroomExecutiveView {...viewProps} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex h-full w-full bg-[hsl(220_18%_4%)] relative overflow-hidden"
    >
      {/* Ambient spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 40%, hsl(280 40% 15% / 0.25), transparent 70%)",
        }}
      />

      {/* Sidebar */}
      <div className="w-[180px] shrink-0 border-r border-[hsl(0_0%_100%/0.05)] bg-[hsl(220_18%_3%/0.9)] flex flex-col py-4 px-2 gap-1 z-10 backdrop-blur-xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[hsl(280_60%_60%/0.5)] px-3 mb-4">
          Boardroom
        </p>
        {MODULES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveModule(item.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200 outline-none text-left relative",
              activeModule === item.id
                ? "bg-[hsl(280_40%_50%/0.1)] text-[hsl(280_50%_75%)] shadow-[inset_3px_0_0_hsl(280_50%_55%)]"
                : "text-[hsl(0_0%_100%/0.35)] hover:bg-[hsl(0_0%_100%/0.04)] hover:text-[hsl(0_0%_100%/0.65)]",
            )}
          >
            <item.icon size={15} />
            {item.label}
            {activeModule === item.id && (
              <motion.div
                layoutId="boardroom-active"
                className="absolute inset-0 rounded-xl bg-[hsl(280_40%_50%/0.06)] -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <BoardroomHeader scope={scope} onScopeChange={setScope} />
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[hsl(0_0%_100%/0.06)] scrollbar-track-transparent">
          {renderView()}
        </div>
      </div>
    </motion.div>
  );
}
