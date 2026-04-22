import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Rocket, RefreshCw, CheckCircle, AlertTriangle, Play, Pause,
  RotateCcw, BarChart3, GitBranch, Zap, Eye, TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const RELEASE_INFO = {
  currentVersion: "v2.13.4",
  nextVersion: "v2.14.0-rc3",
  channel: "Beta",
  rolloutPercent: 25,
  canaryHealth: 97,
  updateSuccessRate: 99.1,
  crashDelta: -0.02,
  perfDelta: +1.4,
  releaseScore: 92,
  migrationStatus: "complete",
};

const ROLLOUT_STAGES = [
  { ring: "Ring 0 — Internal", percent: 100, status: "complete", users: 24 },
  { ring: "Ring 1 — Beta", percent: 100, status: "complete", users: 342 },
  { ring: "Ring 2 — Early Access", percent: 25, status: "active", users: 1205 },
  { ring: "Ring 3 — General", percent: 0, status: "waiting", users: 3286 },
];

const BLOCKED_CLASSES = [
  { device: "Android 12 (API 31)", reason: "Sync regression detected", blocked: true },
  { device: "ChromeOS < v120", reason: "Missing WebRTC support", blocked: true },
];

const MCReleasesUpdates = () => {
  ;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Releases & Updates</h1>
          <p className="text-sm text-muted-foreground mt-1">Rollout control, canary health, and version management</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs h-6 gap-1.5 px-3 text-primary bg-primary/10 border-primary/20">
            <GitBranch className="h-3 w-3" /> {RELEASE_INFO.nextVersion}
          </Badge>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh</Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Key Metrics */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Rollout", value: `${RELEASE_INFO.rolloutPercent}%`, icon: Rocket, color: "text-primary" },
            { label: "Canary Health", value: `${RELEASE_INFO.canaryHealth}%`, icon: CheckCircle, color: "text-emerald-400" },
            { label: "Update Success", value: `${RELEASE_INFO.updateSuccessRate}%`, icon: Zap, color: "text-emerald-400" },
            { label: "Release Score", value: String(RELEASE_INFO.releaseScore), icon: BarChart3, color: "text-primary" },
            { label: "Crash Delta", value: `${RELEASE_INFO.crashDelta}%`, icon: TrendingUp, color: "text-emerald-400" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Rollout Stages */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Rocket className="h-4 w-4 text-primary" /> Rollout Progress — {RELEASE_INFO.nextVersion}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ROLLOUT_STAGES.map((stage, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-48 shrink-0">
                    <span className="text-xs font-medium text-foreground">{stage.ring}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">({stage.users.toLocaleString()} users)</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={stage.percent} className="h-2" />
                  </div>
                  <Badge variant="outline" className={`text-[9px] h-4 w-20 justify-center ${
                    stage.status === "complete" ? "text-emerald-400 border-emerald-500/20" :
                    stage.status === "active" ? "text-blue-400 border-blue-500/20" : "text-muted-foreground"
                  }`}>{stage.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Blocked Device Classes */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Blocked Device Classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {BLOCKED_CLASSES.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/10 bg-amber-500/5">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-foreground">{b.device}</span>
                    <p className="text-[10px] text-muted-foreground">{b.reason}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">Unblock</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Start Canary", icon: Play },
                { label: "Pause Rollout", icon: Pause },
                { label: "Expand to Next Ring", icon: Rocket },
                { label: "Trigger Rollback", icon: RotateCcw },
                { label: "Compare Versions", icon: Eye },
                { label: "Simulate Release", icon: BarChart3 },
              ].map(a => (
                <Button key={a.label} variant="outline" size="sm" className="h-8 text-xs gap-1.5"><a.icon className="h-3 w-3" /> {a.label}</Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MCReleasesUpdates;
