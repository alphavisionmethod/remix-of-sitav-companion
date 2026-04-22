import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Presentation, Briefcase, TrendingUp, Users,
  Brain, CheckSquare, FlaskConical, History, Crown,
  Eye, GitBranch, Globe, HelpCircle, Menu, Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { BoardroomFollowthroughView } from "./BoardroomFollowthroughView";
import { useBoardroomSession } from "@/hooks/useBoardroomSession";

const MODULES = [
  { id: "executive", label: "Executive", icon: Presentation },
  { id: "pulse", label: "Pulse", icon: Briefcase },
  { id: "synthesis", label: "Synthesis", icon: Brain },
  { id: "council", label: "Council", icon: Crown },
  { id: "simulation", label: "Simulation", icon: FlaskConical },
  { id: "approvals", label: "Approvals", icon: CheckSquare },
  { id: "followthrough", label: "Follow-through", icon: Workflow },
  { id: "lineage", label: "Lineage", icon: GitBranch },
  { id: "impact", label: "Impact", icon: Globe },
  { id: "explainability", label: "Explain", icon: HelpCircle },
  { id: "memory", label: "Memory", icon: History },
];

type SessionScope = "global" | "business" | "finance" | "concierge";
type SessionMode = "review" | "simulation" | "approval";

const MODULE_SESSION_MODE: Record<string, SessionMode> = {
  executive: "review", pulse: "review", synthesis: "review", council: "review",
  simulation: "simulation", approvals: "approval", followthrough: "review",
  lineage: "review", impact: "review", explainability: "review", memory: "review",
};

const MODULE_AMBIENT: Record<string, string> = {
  executive: "hsl(280 40% 15% / 0.25)", pulse: "hsl(280 40% 15% / 0.2)",
  synthesis: "hsl(260 40% 18% / 0.2)", council: "hsl(300 35% 15% / 0.2)",
  simulation: "hsl(40 50% 15% / 0.25)", approvals: "hsl(145 40% 12% / 0.25)",
  followthrough: "hsl(170 45% 14% / 0.25)",
  lineage: "hsl(200 40% 15% / 0.2)", impact: "hsl(320 40% 15% / 0.2)",
  explainability: "hsl(240 40% 15% / 0.2)", memory: "hsl(220 40% 15% / 0.2)",
};

// ── Particle Canvas ────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect reduced-motion preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    const COUNT = 16; // reduced from 30 for perf

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 1.5,
        a: 0.1 + Math.random() * 0.15,
      });
    }

    // Throttle to ~30fps for lower GPU load
    let lastTime = 0;
    const FRAME_INTERVAL = 1000 / 30;

    const draw = () => {
      animId = requestAnimationFrame(draw);
      const now = performance.now();
      if (now - lastTime < FRAME_INTERVAL) return;
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        else if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        else if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 140, 255, ${p.a})`;
        ctx.fill();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60"
    />
  );
}

// ── Mobile Bottom Nav ──────────────────────────────────────
function MobileModuleBar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  // Show first 5 modules + a "more" menu
  const primary = MODULES.slice(0, 5);
  const [showMore, setShowMore] = useState(false);
  const secondary = MODULES.slice(5);

  return (
    <>
      {/* More overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-14 left-0 right-0 z-40 bg-[hsl(220_18%_6%/0.97)] border-t border-[hsl(0_0%_100%/0.08)] backdrop-blur-xl p-3 grid grid-cols-5 gap-2"
          >
            {secondary.map((m) => {
              const Icon = m.icon;
              const isActive = active === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => { onSelect(m.id); setShowMore(false); }}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 rounded-lg transition-colors",
                    isActive ? "text-[hsl(280_50%_75%)]" : "text-[hsl(0_0%_100%/0.35)]",
                  )}
                >
                  <Icon size={16} />
                  <span className="text-[8px] font-medium">{m.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="shrink-0 border-t border-[hsl(0_0%_100%/0.06)] bg-[hsl(220_18%_4%/0.95)] backdrop-blur-xl z-30">
        <div className="flex items-center justify-around px-1 py-1.5">
          {primary.map((m) => {
            const Icon = m.icon;
            const isActive = active === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors relative",
                  isActive ? "text-[hsl(280_50%_75%)]" : "text-[hsl(0_0%_100%/0.35)]",
                )}
              >
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.5} />
                <span className="text-[8px] font-medium">{m.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="boardroom-mobile-active"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-[hsl(280_50%_55%)]"
                  />
                )}
              </button>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors",
              showMore ? "text-[hsl(280_50%_75%)]" : "text-[hsl(0_0%_100%/0.35)]",
            )}
          >
            <Menu size={16} />
            <span className="text-[8px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export function BoardroomAppShell() {
  const [activeModule, setActiveModule] = useState("executive");
  const [scope, setScope] = useState<SessionScope>("global");
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const isMobile = useIsMobile();

  const {
    session, elapsed, stageIndex, stages,
    openSession, advanceStage, adjournSession, pauseSession, resumeSession,
  } = useBoardroomSession(scope);

  const sessionMode = MODULE_SESSION_MODE[activeModule] || "review";
  const viewProps = { scope, onNavigate: setActiveModule };
  const ambientColor = MODULE_AMBIENT[activeModule] || MODULE_AMBIENT.executive;

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
        <div className="p-4 md:p-6 space-y-6">
          <BoardroomAdvisorCouncil scope={scope} onSelectAdvisor={() => setActiveModule("synthesis")} />
          <BoardroomDiscussionThread scope={scope} />
        </div>
      );
      case "simulation": return <BoardroomSimulationView {...viewProps} />;
      case "approvals": return <BoardroomApprovalView {...viewProps} />;
      case "followthrough": return <BoardroomFollowthroughView scope={scope} />;
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
      className="flex flex-col md:flex-row h-full w-full bg-[hsl(220_18%_4%)] relative overflow-hidden"
    >
      {/* Entry ceremony overlay */}
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

      {/* Ambient spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        animate={{ background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${ambientColor}, transparent 70%)` }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Desktop Sidebar */}
      {!isMobile && (
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
          <div className="mt-4 pt-4 border-t border-[hsl(0_0%_100%/0.05)]">
            <button
              onClick={() => setEvidenceOpen(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium text-[hsl(0_0%_100%/0.35)] hover:bg-[hsl(0_0%_100%/0.04)] hover:text-[hsl(0_0%_100%/0.65)] transition-all w-full text-left"
            >
              <Eye size={15} /> Show Evidence
            </button>
          </div>
        </motion.div>
      )}

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

        {/* Mobile: Evidence FAB */}
        {isMobile && (
          <button
            onClick={() => setEvidenceOpen(true)}
            className="fixed right-4 bottom-20 z-30 w-11 h-11 rounded-full bg-[hsl(280_50%_50%/0.2)] border border-[hsl(280_50%_50%/0.3)] flex items-center justify-center backdrop-blur-md shadow-lg"
          >
            <Eye size={18} className="text-[hsl(280_50%_75%)]" />
          </button>
        )}
      </div>

      {/* Evidence Panel */}
      <BoardroomEvidencePanel open={evidenceOpen} onClose={() => setEvidenceOpen(false)} />

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <MobileModuleBar active={activeModule} onSelect={setActiveModule} />
      )}
    </motion.div>
  );
}
