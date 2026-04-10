import { motion } from "framer-motion";
import { Crown, ArrowRight, Zap, BarChart3, Target, Brain, Search, FileText, Phone, TrendingUp, Layers, Sparkles, Shield, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CHAPTERS, type ScreenProps } from "../types";

const floatingNodes = [
  { icon: BarChart3, label: "Boardroom", x: -80, y: -60, delay: 1.2 },
  { icon: Target, label: "Journey", x: 80, y: -40, delay: 1.4 },
  { icon: Brain, label: "Advisors", x: -70, y: 50, delay: 1.6 },
  { icon: Search, label: "Leaks", x: 90, y: 60, delay: 1.8 },
  { icon: FileText, label: "Quotes", x: -40, y: -90, delay: 2.0 },
  { icon: Phone, label: "Calls", x: 50, y: 90, delay: 2.2 },
  { icon: TrendingUp, label: "Growth", x: 0, y: -100, delay: 2.4 },
];

const depthOptions = [
  { id: "deep" as const, label: "Deep Setup", desc: "Full business formation — every signal, every module", time: "~12 min", icon: Layers, primary: true },
  { id: "balanced" as const, label: "Balanced Setup", desc: "Core business model + key integrations + advisors", time: "~8 min", icon: Shield, primary: false },
  { id: "quick" as const, label: "Faster Setup", desc: "Essentials only — refine later inside Revenue Office", time: "~5 min", icon: Zap, primary: false },
];

const previewModules = [
  { label: "Revenue Boardroom", icon: BarChart3, status: "waiting" },
  { label: "Customer Journey Twin", icon: Target, status: "waiting" },
  { label: "Growth Advisor Board", icon: Brain, status: "waiting" },
  { label: "Revenue Leak Detector", icon: Search, status: "waiting" },
  { label: "Automation Office", icon: Activity, status: "waiting" },
  { label: "Opportunity Engine", icon: TrendingUp, status: "waiting" },
];

export default function CeremonyScreen({ state, setState, onNext }: ScreenProps) {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      {/* Main Content */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center py-8 max-w-lg mx-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center z-10">
              <Crown className="h-10 w-10 text-primary" />
            </div>
            {floatingNodes.map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: [0, 0.7, 0.5], scale: [0, 1, 0.9], x: node.x, y: node.y }}
                transition={{ delay: node.delay, duration: 1.2, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/15">
                  <node.icon className="h-3 w-3 text-primary/60" />
                </div>
                <span className="text-[7px] text-muted-foreground/50">{node.label}</span>
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: node.delay + 0.3, duration: 0.8 }}
                  className="absolute w-px h-8 bg-gradient-to-t from-primary/20 to-transparent"
                  style={{ top: node.y > 0 ? "-2rem" : "auto", bottom: node.y <= 0 ? "-2rem" : "auto" }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <h1 className="text-2xl font-bold text-foreground mb-2">Let's shape your business office</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            SITA will learn how your business actually grows, sells, delivers, and retains — then build Revenue Office around that reality.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            By the end, your Revenue Office will be fully personalized: advisors activated, automations calibrated, leaks identified, and your first win ready.
          </p>
        </motion.div>

        {/* Chapter Preview */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="space-y-5">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-[10px] text-muted-foreground mb-4">
            {CHAPTERS.map((ch, i) => (
              <motion.div
                key={ch}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + i * 0.08 }}
                className="p-2.5 rounded-lg bg-card/50 border border-border/30"
              >
                <span className="text-primary font-semibold">{i + 1}.</span> {ch}
              </motion.div>
            ))}
          </div>

          {/* Depth Selection */}
          <div className="space-y-2">
            {depthOptions.map((opt, i) => (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                onClick={() => { setState(p => ({ ...p, setupDepth: opt.id })); onNext(); }}
                className={`w-full p-3.5 rounded-xl border text-left transition-all group hover:border-primary/30 ${
                  opt.primary
                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    : "bg-card/50 border-border/50 hover:bg-card/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${opt.primary ? "bg-primary/20" : "bg-muted"}`}>
                    <opt.icon className={`h-4 w-4 ${opt.primary ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${opt.primary ? "text-foreground" : "text-foreground/80"}`}>{opt.label}</p>
                      {opt.primary && <Badge className="bg-primary/10 text-primary text-[8px]">Recommended</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{opt.time}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Right Panel — Live Revenue Office Preview */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="hidden lg:block"
      >
        <div className="sticky top-8 space-y-4">
          <Card className="bg-card/40 border-border/30 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-[11px] font-semibold text-foreground">Revenue Office Preview</p>
                <Badge className="bg-muted text-muted-foreground text-[8px] ml-auto">Waiting</Badge>
              </div>

              {/* Mini boardroom wireframe */}
              <div className="rounded-xl border border-border/30 bg-muted/20 p-3 mb-4">
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 2 + i * 0.2 }}
                      className="h-10 rounded-lg bg-primary/5 border border-primary/10" />
                  ))}
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 2.6 }}
                  className="h-16 rounded-lg bg-primary/5 border border-primary/10 mb-1.5" />
                <div className="grid grid-cols-2 gap-1.5">
                  {[...Array(2)].map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 2.8 + i * 0.15 }}
                      className="h-8 rounded-lg bg-muted/30 border border-border/20" />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {previewModules.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.8 + i * 0.12 }}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/10"
                  >
                    <div className="p-1 rounded bg-muted/30">
                      <m.icon className="h-3 w-3 text-muted-foreground/40" />
                    </div>
                    <p className="text-[10px] text-muted-foreground/50 flex-1">{m.label}</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary/50" />
                <p className="text-[9px] text-muted-foreground/60 leading-relaxed">
                  This preview will transform as you answer — modules activate, advisors appear, and your commercial office takes shape in real time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
