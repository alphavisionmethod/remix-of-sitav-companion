// ═══════════════════════════════════════════════════════════════
// SITA OS — War Room Entry Ceremony
// Cinematic multi-phase entry with scanning animation, 
// ambient particles, threat-level assessment, and advisor lineup
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Brain, Users, Crosshair, Activity, Lock, Zap, Eye } from "lucide-react";

interface WarRoomEntryCeremonyProps {
  boardroomType: string;
  onComplete: () => void;
}

const THREAT_LEVELS = ["LOW", "GUARDED", "ELEVATED", "HIGH", "SEVERE"] as const;

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-[2px] pointer-events-none"
      style={{ background: "linear-gradient(90deg, transparent 0%, hsl(265 55% 58% / 0.6) 50%, transparent 100%)" }}
      initial={{ top: 0, opacity: 0 }}
      animate={{ top: ["0%", "100%", "0%"], opacity: [0, 0.8, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
    />
  );
}

function Particle({ delay }: { delay: number }) {
  const x = Math.random() * 100;
  const duration = 3 + Math.random() * 4;
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-[hsl(265_55%_58%/0.4)]"
      style={{ left: `${x}%`, bottom: -4 }}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 0.6, 0], y: -300 - Math.random() * 200 }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

function HexGrid() {
  const cells = useMemo(() => {
    const items: { x: number; y: number; delay: number }[] = [];
    for (let i = 0; i < 40; i++) {
      items.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      });
    }
    return items;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cells.map((cell, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 border border-[hsl(265_55%_58%/0.08)] rotate-45"
          style={{ left: `${cell.x}%`, top: `${cell.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0, 1, 0.5] }}
          transition={{ duration: 3, delay: cell.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export function WarRoomEntryCeremony({ boardroomType, onComplete }: WarRoomEntryCeremonyProps) {
  const [phase, setPhase] = useState(0);
  const [threatLevel, setThreatLevel] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  const advisors = [
    { icon: Brain, name: "Strategic Intelligence", color: "hsl(265, 55%, 58%)", status: "ACTIVE" },
    { icon: Shield, name: "Risk & Trust", color: "hsl(152, 55%, 48%)", status: "MONITORING" },
    { icon: Users, name: "Advisory Council", color: "hsl(38, 85%, 58%)", status: "STANDBY" },
    { icon: Activity, name: "Operations", color: "hsl(210, 60%, 55%)", status: "NOMINAL" },
    { icon: Eye, name: "Threat Assessment", color: "hsl(0, 70%, 55%)", status: "SCANNING" },
  ];

  useEffect(() => {
    // Phase 0: Initial blackout (200ms)
    // Phase 1: Scan line + hex grid (200ms)
    // Phase 2: Ring pulse + logo (800ms)
    // Phase 3: Threat assessment (1400ms)
    // Phase 4: Advisor lineup (2200ms)
    // Phase 5: Status readout (3000ms)
    // Phase 6: Fade out (3800ms)
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2200),
      setTimeout(() => setPhase(5), 3000),
      setTimeout(() => setPhase(6), 3800),
      setTimeout(() => onComplete(), 4400),
    ];

    // Scan progress
    const scanInterval = setInterval(() => {
      setScanProgress(p => Math.min(100, p + 2));
    }, 30);

    // Threat level escalation
    const threatTimers = [
      setTimeout(() => setThreatLevel(1), 1600),
      setTimeout(() => setThreatLevel(2), 2000),
      setTimeout(() => setThreatLevel(1), 2400), // Settle back
    ];

    return () => {
      timers.forEach(clearTimeout);
      threatTimers.forEach(clearTimeout);
      clearInterval(scanInterval);
    };
  }, [onComplete]);

  const threatColor = threatLevel >= 3 ? "hsl(0, 70%, 55%)" : threatLevel >= 2 ? "hsl(38, 85%, 58%)" : "hsl(152, 55%, 48%)";

  return (
    <AnimatePresence>
      {phase < 6 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
          style={{ background: "hsl(0 0% 2%)" }}
        >
          {/* Background hex grid */}
          {phase >= 1 && <HexGrid />}

          {/* Scan line */}
          {phase >= 1 && phase < 5 && <ScanLine />}

          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <Particle key={i} delay={i * 0.15} />
            ))}
          </div>

          {/* Concentric threat rings */}
          {phase >= 2 && (
            <>
              {[300, 400, 500].map((size, i) => (
                <motion.div
                  key={size}
                  className="absolute rounded-full border"
                  style={{
                    width: size,
                    height: size,
                    borderColor: `${threatColor}${i === 0 ? "40" : i === 1 ? "20" : "10"}`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [1, 1.05 + i * 0.02, 1],
                    opacity: [0.3 - i * 0.08, 0.6 - i * 0.12, 0.3 - i * 0.08],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                />
              ))}
            </>
          )}

          {/* Central content */}
          <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">
            {/* War Room icon with crosshair */}
            {phase >= 2 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 14 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(265_55%_58%)] to-[hsl(0_0%_8%)] flex items-center justify-center shadow-2xl shadow-[hsl(265_55%_58%/0.4)] border border-[hsl(265_55%_58%/0.3)]">
                  <Crosshair className="h-10 w-10 text-white" />
                </div>
                {/* Rotating crosshair corners */}
                <motion.div
                  className="absolute -inset-3 border-2 border-[hsl(265_55%_58%/0.3)] rounded-3xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{ borderStyle: "dashed" }}
                />
              </motion.div>
            )}

            {/* Title with typewriter */}
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="text-center"
              >
                <WarRoomTypewriter text="WAR ROOM ACTIVE" className="text-xl font-mono font-bold text-white tracking-[0.25em]" />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-[10px] text-[hsl(0_0%_40%)] mt-2 uppercase tracking-[0.3em] font-mono"
                >
                  {boardroomType.replace(/-/g, " ")} · SESSION INITIALIZING
                </motion.p>
              </motion.div>
            )}

            {/* Threat assessment bar */}
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 280 }}
                transition={{ duration: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[hsl(0_0%_40%)] font-mono uppercase tracking-wider">Threat Assessment</span>
                  <motion.span
                    className="text-[10px] font-mono font-bold"
                    style={{ color: threatColor }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {THREAT_LEVELS[threatLevel]}
                  </motion.span>
                </div>
                <div className="h-1 bg-[hsl(0_0%_15%)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: threatColor }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </div>
                <div className="flex justify-between">
                  {THREAT_LEVELS.map((level, i) => (
                    <span
                      key={level}
                      className="text-[7px] font-mono"
                      style={{ color: i <= threatLevel ? threatColor : "hsl(0 0% 25%)" }}
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Advisor lineup */}
            {phase >= 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                {advisors.map((advisor, i) => (
                  <motion.div
                    key={advisor.name}
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border"
                      style={{
                        background: `${advisor.color}15`,
                        borderColor: `${advisor.color}30`,
                      }}
                    >
                      <advisor.icon className="h-4 w-4" style={{ color: advisor.color }} />
                    </div>
                    <span className="text-[7px] font-mono uppercase tracking-wider" style={{ color: advisor.color }}>
                      {advisor.status}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Status readout */}
            {phase >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-2 rounded-lg border border-[hsl(152_55%_48%/0.2)] bg-[hsl(152_55%_48%/0.05)]"
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-[hsl(152_55%_48%)]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-[10px] font-mono text-[hsl(152_55%_48%)] tracking-wider">
                  ALL SYSTEMS OPERATIONAL · ENTERING WAR ROOM
                </span>
                <Lock className="h-3 w-3 text-[hsl(152_55%_48%/0.6)]" />
              </motion.div>
            )}
          </div>

          {/* Corner decorations */}
          {phase >= 1 && (
            <>
              <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-[hsl(265_55%_58%/0.2)] rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-[hsl(265_55%_58%/0.2)] rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-[hsl(265_55%_58%/0.2)] rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-[hsl(265_55%_58%/0.2)] rounded-br-lg" />
            </>
          )}

          {/* Top status bar */}
          {phase >= 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <span className="text-[8px] font-mono text-[hsl(0_0%_25%)] tracking-widest">
                SITA OS v3.2 · WAR ROOM PROTOCOL · ENCRYPTED
              </span>
            </div>
          )}

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
              style={{ background: `radial-gradient(circle, ${threatColor}08 0%, transparent 70%)` }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── War Room Typewriter ──
function WarRoomTypewriter({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 500);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className={className}>
      {displayed}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="inline-block w-[3px] h-[1em] bg-[hsl(265_55%_58%)] ml-1 align-middle"
        />
      )}
    </p>
  );
}
