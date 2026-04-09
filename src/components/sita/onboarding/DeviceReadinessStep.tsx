import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Download, Monitor, Battery, Fingerprint, Wifi, HardDrive, Check, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Update {
  id: string;
  name: string;
  category: "critical" | "background";
  size: string;
  progress: number;
  status: "pending" | "downloading" | "applying" | "done";
}

interface ReadinessCheck {
  id: string;
  label: string;
  icon: typeof Monitor;
  status: "checking" | "ready" | "warning" | "unavailable";
}

const CRITICAL_UPDATES: Update[] = [
  { id: "sec-1", name: "Security patch 2026.04", category: "critical", size: "12 MB", progress: 0, status: "pending" },
  { id: "sec-2", name: "Boot recovery essentials", category: "critical", size: "8 MB", progress: 0, status: "pending" },
  { id: "sec-3", name: "Compatibility fix pack", category: "critical", size: "4 MB", progress: 0, status: "pending" },
];

const BACKGROUND_UPDATES: Update[] = [
  { id: "bg-1", name: "Visual enhancements", category: "background", size: "22 MB", progress: 0, status: "pending" },
  { id: "bg-2", name: "Optional language packs", category: "background", size: "35 MB", progress: 0, status: "pending" },
  { id: "bg-3", name: "Performance optimizations", category: "background", size: "15 MB", progress: 0, status: "pending" },
];

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export function DeviceReadinessStep({ onNext, onPrev }: Props) {
  const [criticalUpdates, setCriticalUpdates] = useState(CRITICAL_UPDATES);
  const [readinessChecks, setReadinessChecks] = useState<ReadinessCheck[]>([
    { id: "display", label: "Display & input readiness", icon: Monitor, status: "checking" },
    { id: "battery", label: "Battery & power", icon: Battery, status: "checking" },
    { id: "biometric", label: "Biometric detection", icon: Fingerprint, status: "checking" },
    { id: "network", label: "Network stack stability", icon: Wifi, status: "checking" },
    { id: "recovery", label: "Recovery environment", icon: HardDrive, status: "checking" },
  ]);
  const [allCriticalDone, setAllCriticalDone] = useState(false);

  // Simulate critical updates
  useEffect(() => {
    let idx = 0;
    const runNext = () => {
      if (idx >= CRITICAL_UPDATES.length) {
        setAllCriticalDone(true);
        return;
      }
      const currentIdx = idx;
      setCriticalUpdates(prev => prev.map((u, i) => i === currentIdx ? { ...u, status: "downloading" } : u));
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15 + Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setCriticalUpdates(prev => prev.map((u, i) => i === currentIdx ? { ...u, progress: 100, status: "done" } : u));
          idx++;
          setTimeout(runNext, 200);
        } else {
          setCriticalUpdates(prev => prev.map((u, i) => i === currentIdx ? { ...u, progress } : u));
        }
      }, 300);
    };
    const timer = setTimeout(runNext, 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulate readiness checks
  useEffect(() => {
    readinessChecks.forEach((check, i) => {
      setTimeout(() => {
        setReadinessChecks(prev => prev.map((c, j) => j === i ? {
          ...c,
          status: c.id === "biometric" ? (Math.random() > 0.5 ? "ready" : "unavailable") : "ready"
        } : c));
      }, 1500 + i * 600);
    });
  }, []);

  const criticalProgress = Math.round(criticalUpdates.reduce((s, u) => s + u.progress, 0) / criticalUpdates.length);
  const checksComplete = readinessChecks.every(c => c.status !== "checking");

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="p-8 pb-0">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
            <Download className="h-7 w-7 text-primary-foreground" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Bringing your system up to date</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">We're applying the essentials so everything starts smoothly and securely</p>
        </div>

        <div className="p-8 pt-6 space-y-6">
          {/* Critical Updates */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Critical now</span>
              <span className="ml-auto text-xs text-muted-foreground">{criticalProgress}%</span>
            </div>
            <div className="space-y-2">
              {criticalUpdates.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="rounded-lg border border-border bg-secondary/20 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    {u.status === "done" ? <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> :
                      u.status === "downloading" ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Download className="h-3.5 w-3.5 text-primary" /></motion.div> :
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className="text-sm text-foreground flex-1">{u.name}</span>
                    <span className="text-[10px] text-muted-foreground">{u.size}</span>
                  </div>
                  {u.status === "downloading" && <Progress value={u.progress} className="h-1" />}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Background Updates */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Background later</span>
            </div>
            <div className="space-y-1.5">
              {BACKGROUND_UPDATES.map((u, i) => (
                <div key={u.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-muted" />
                  <span className="text-xs flex-1">{u.name}</span>
                  <span className="text-[10px]">{u.size}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">These will install silently in the background after setup</p>
          </div>

          {/* Readiness Checks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Device readiness</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {readinessChecks.map(check => (
                <div key={check.id} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2.5">
                  {check.status === "checking" ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <check.icon className="h-3.5 w-3.5 text-primary" />
                    </motion.div>
                  ) : check.status === "ready" ? (
                    <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
                  ) : check.status === "unavailable" ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--trust-warn))]" />
                  )}
                  <span className={cn("text-xs", check.status === "unavailable" ? "text-muted-foreground" : "text-foreground")}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Low battery prompt */}
          {readinessChecks.find(c => c.id === "battery" && c.status === "warning") && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
                <span className="text-sm font-medium text-foreground">Battery is low</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Consider connecting to power before continuing. Heavy updates will be deferred to protect your session.
              </p>
            </motion.div>
          )}

          {/* Reboot required notice (simulated — shows when all critical done) */}
          {allCriticalDone && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">All updates applied</span>
              </div>
              <p className="text-xs text-muted-foreground">
                If a restart is ever needed, SITA will save your progress automatically and resume exactly where you left off — no setup lost.
              </p>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
            <button onClick={onNext} disabled={!allCriticalDone}
              className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
                allCriticalDone ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
              )}>
              Continue <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
