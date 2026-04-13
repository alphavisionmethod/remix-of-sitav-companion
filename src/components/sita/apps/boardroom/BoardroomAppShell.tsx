import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Presentation, Briefcase, TrendingUp, Users,
  Brain, CheckSquare, FlaskConical, History, Crown,
  Eye, GitBranch, Globe, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BoardroomHeader } from "./BoardroomHeader";
import { BoardroomSessionBar } from "./BoardroomSessionBar";
import { BoardroomEvidencePanel } from "./BoardroomEvidencePanel";
import { BoardroomExecutiveView } from "./BoardroomExecutiveView";
import { BoardroomPulseView } from "./BoardroomPulseView";
import { BoardroomSynthesisView } from "./BoardroomSynthesisView";
import { BoardroomSimulationView } from "./BoardroomSimulationView";
import { BoardroomApprovalView } from "./BoardroomApprovalView";
import { BoardroomDecisionMemory } from "./BoardroomDecisionMemory";
import { BoardroomAdvisorCouncil } from "./BoardroomAdvisorCouncil";
import { BoardroomDiscussionThread } from "./BoardroomDiscussionThread";
import { BoardroomLineageView } from "./BoardroomLineageView";
import { BoardroomCrossAppImpact } from "./BoardroomCrossAppImpact";
import { BoardroomExplainability } from "./BoardroomExplainability";
import { useBoardroomSession } from "@/hooks/useBoardroomSession";

const MODULES = [
  { id: "executive", label: "Executive Review", icon: Presentation },
  { id: "pulse", label: "Domain Pulse", icon: Briefcase },
  { id: "synthesis", label: "Advisor Synthesis", icon: Brain },
  { id: "council", label: "Advisor Council", icon: Crown },
  { id: "simulation", label: "Simulation", icon: FlaskConical },
  { id: "approvals", label: "Approvals & Seals", icon: CheckSquare },
  { id: "lineage", label: "Decision Lineage", icon: GitBranch },
  { id: "impact", label: "Cross-App Impact", icon: Globe },
  { id: "explainability", label: "Explainability", icon: HelpCircle },
  { id: "memory", label: "Decision Memory", icon: History },
];

type SessionScope = "global" | "business" | "finance" | "concierge";
type SessionMode = "review" | "simulation" | "approval";

const MODULE_SESSION_MODE: Record<string, SessionMode> = {
  executive: "review",
  pulse: "review",
  synthesis: "review",
  council: "review",
  simulation: "simulation",
  approvals: "approval",
  lineage: "review",
  impact: "review",
  explainability: "review",
  memory: "review",
};

const MODULE_AMBIENT: Record<string, string> = {
  executive: "hsl(280 40% 15% / 0.25)",
  pulse: "hsl(280 40% 15% / 0.2)",
  synthesis: "hsl(260 40% 18% / 0.2)",
  council: "hsl(300 35% 15% / 0.2)",
  simulation: "hsl(40 50% 15% / 0.25)",
  approvals: "hsl(145 40% 12% / 0.25)",
  lineage: "hsl(200 40% 15% / 0.2)",
  impact: "hsl(320 40% 15% / 0.2)",
  explainability: "hsl(240 40% 15% / 0.2)",
  memory: "hsl(220 40% 15% / 0.2)",
};

export function BoardroomAppShell() {
  const [activeModule, setActiveModule] = useState("executive");
  const [scope, setScope] = useState<SessionScope>("global");
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const {
    session, elapsed, stageIndex, stages,
    openSession, advanceStage, adjournSession, pauseSession, resumeSession,
  } = useBoardroomSession(scope);

  const sessionMode = MODULE_SESSION_MODE[activeModule] || "review";
  const viewProps = { scope, onNavigate: setActiveModule };
  const ambientColor = MODULE_AMBIENT[activeModule] || MODULE_AMBIENT.executive;

  const renderView = () => {
    switch (activeModule) {
      case "executive": return <BoardroomExecutiveView {...viewProps} />;
      case "pulse": return <BoardroomPulseView {...viewProps} />;
      case "synthesis": return <BoardroomSynthesisView {...viewProps} />;
      case "council": return (
        <div className="p-6 space-y-6">
          <BoardroomAdvisorCouncil scope={scope} onSelectAdvisor={() => setActiveModule("synthesis")} />
          <BoardroomDiscussionThread scope={scope} />
        </div>
      );
      case "simulation": return <BoardroomSimulationView {...viewProps} />;
      case "approvals": return <BoardroomApprovalView {...viewProps} />;
      case "lineage": return <BoardroomLineageView />;
      case "impact": return <BoardroomCrossAppImpact scope={scope} />;
      case "explainability": return <BoardroomExplainability scope={scope} />;
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
      {/* Dynamic ambient spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        animate={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${ambientColor}, transparent 70%)`,
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Sidebar */}
      <div className="w-[180px] shrink-0 border-r border-[hsl(0_0%_100%/0.05)] bg-[hsl(220_18%_3%/0.9)] flex flex-col py-4 px-2 gap-1 z-10 backdrop-blur-xl overflow-y-auto scrollbar-thin scrollbar-thumb-[hsl(0_0%_100%/0.06)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[hsl(280_60%_60%/0.5)] px-3 mb-4">
          Boardroom
        </p>
        {MODULES.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveModule(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200 outline-none text-left relative",
                isActive
                  ? "bg-[hsl(280_40%_50%/0.1)] text-[hsl(280_50%_75%)] shadow-[inset_3px_0_0_hsl(280_50%_55%)]"
                  : "text-[hsl(0_0%_100%/0.35)] hover:bg-[hsl(0_0%_100%/0.04)] hover:text-[hsl(0_0%_100%/0.65)]",
              )}
            >
              <item.icon size={15} />
              {item.label}
              {isActive && (
                <>
                  <motion.div
                    layoutId="boardroom-active"
                    className="absolute inset-0 rounded-xl bg-[hsl(280_40%_50%/0.06)] -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <motion.div
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-[hsl(280_50%_55%)]"
                    layoutId="sidebar-glow"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{ boxShadow: "0 0 8px 2px hsl(280 50% 55% / 0.4)" }}
                  />
                </>
              )}
            </button>
          );
        })}

        {/* Evidence panel trigger */}
        <div className="mt-4 pt-4 border-t border-[hsl(0_0%_100%/0.05)]">
          <button
            onClick={() => setEvidenceOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium text-[hsl(0_0%_100%/0.35)] hover:bg-[hsl(0_0%_100%/0.04)] hover:text-[hsl(0_0%_100%/0.65)] transition-all w-full text-left"
          >
            <Eye size={15} /> Show Evidence
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <BoardroomHeader scope={scope} onScopeChange={setScope} sessionMode={sessionMode} />
        <BoardroomSessionBar
          status={session.status}
          elapsed={elapsed}
          stageIndex={stageIndex}
          stages={stages}
          advisorCount={session.participatingAdvisors.length}
          onOpen={openSession}
          onAdvance={advanceStage}
          onPause={pauseSession}
          onResume={resumeSession}
          onAdjourn={adjournSession}
          sessionMode={session.sessionMode}
        />
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[hsl(0_0%_100%/0.06)] scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Evidence Panel */}
      <BoardroomEvidencePanel open={evidenceOpen} onClose={() => setEvidenceOpen(false)} />
    </motion.div>
  );
}
