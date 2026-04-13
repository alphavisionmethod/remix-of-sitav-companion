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
  const [entered, setEntered] = useState(false);

  const {
    session, elapsed, stageIndex, stages,
    openSession, advanceStage, adjournSession, pauseSession, resumeSession,
  } = useBoardroomSession(scope);

  const sessionMode = MODULE_SESSION_MODE[activeModule] || "review";
  const viewProps = { scope, onNavigate: setActiveModule };
  const ambientColor = MODULE_AMBIENT[activeModule] || MODULE_AMBIENT.executive;

  // Entry ceremony trigger
  React.useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 300);
    return () => clearTimeout(timer);
  }, []);

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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full w-full bg-[hsl(220_18%_4%)] relative overflow-hidden"
    >
      {/* Entry ceremony overlay — "the room settles in" */}
      <AnimatePresence>
        {!entered && (
          <motion.div
            className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse 50% 40% at 50% 50%, hsl(280 50% 15% / 0.9), hsl(220 18% 4%))" }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative z-10 text-center"
            >
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(280_50%_55%)] to-[hsl(280_60%_35%)] flex items-center justify-center mx-auto mb-3 shadow-2xl"
                animate={{ boxShadow: ["0 0 20px hsl(280 50% 55% / 0.3)", "0 0 40px hsl(280 50% 55% / 0.5)", "0 0 20px hsl(280 50% 55% / 0.3)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Brain size={20} className="text-white" />
              </motion.div>
              <p className="text-[11px] font-bold text-[hsl(0_0%_100%/0.6)] tracking-[0.3em] uppercase">
                Boardroom Assembling
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic ambient spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        animate={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${ambientColor}, transparent 70%)`,
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        className="w-[180px] shrink-0 border-r border-[hsl(0_0%_100%/0.05)] bg-[hsl(220_18%_3%/0.9)] flex flex-col py-4 px-2 gap-1 z-10 backdrop-blur-xl overflow-y-auto scrollbar-thin scrollbar-thumb-[hsl(0_0%_100%/0.06)]"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[hsl(280_60%_60%/0.5)] px-3 mb-4">
          Boardroom
        </p>
        {MODULES.map((item, i) => {
          const isActive = activeModule === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.04 }}
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
            </motion.button>
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
      </motion.div>

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
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
