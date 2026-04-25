import { motion } from "framer-motion";
import { ArrowRight, Zap, BarChart3, Target, Brain, Search, FileText, Phone, TrendingUp, Layers, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CHAPTERS, type ScreenProps } from "../types";
import sitaLogo from "@/assets/logo.webp";

const floatingNodes = [
  { icon: BarChart3, label: "Boardroom", x: -80, y: -60, delay: 1.2, accent: "from-violet-500/20 to-blue-500/20" },
  { icon: Target, label: "Journey", x: 80, y: -40, delay: 1.4, accent: "from-emerald-500/20 to-teal-500/20" },
  { icon: Brain, label: "Advisors", x: -70, y: 50, delay: 1.6, accent: "from-rose-500/20 to-pink-500/20" },
  { icon: Search, label: "Leaks", x: 90, y: 60, delay: 1.8, accent: "from-amber-500/20 to-orange-500/20" },
  { icon: FileText, label: "Quotes", x: -40, y: -90, delay: 2.0, accent: "from-cyan-500/20 to-sky-500/20" },
  { icon: Phone, label: "Calls", x: 50, y: 90, delay: 2.2, accent: "from-blue-500/20 to-indigo-500/20" },
  { icon: TrendingUp, label: "Growth", x: 0, y: -100, delay: 2.4, accent: "from-yellow-500/20 to-amber-500/20" },
];

const depthOptions = [
  { id: "deep" as const, label: "Deep Setup", desc: "Full business formation — every signal, every module", time: "~12 min", icon: Layers, primary: true, gradient: "from-violet-500 to-blue-500" },
  { id: "balanced" as const, label: "Balanced Setup", desc: "Core business model + key integrations + advisors", time: "~8 min", icon: Shield, primary: false, gradient: "from-blue-500 to-cyan-500" },
  { id: "quick" as const, label: "Faster Setup", desc: "Essentials only — refine later inside Revenue Office", time: "~5 min", icon: Zap, primary: false, gradient: "from-amber-500 to-yellow-500" },
];

export default function CeremonyScreen({ state, setState, onNext }: ScreenProps) {
  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center py-8 max-w-lg mx-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-blue-500/20 rounded-2xl blur-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 rounded-2xl flex items-center justify-center z-10">
              <img src={sitaLogo} alt="SITA" className="h-12 w-12 object-contain" />
            </div>
            {floatingNodes.map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: [0, 0.7, 0.5], scale: [0, 1, 0.9], x: node.x, y: node.y }}
                transition={{ delay: node.delay, duration: 1.2, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5"
              >
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${node.accent} border border-primary/15`}>
                  <node.icon className="h-3 w-3 text-foreground/60" />
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
                className="p-2.5 rounded-lg bg-card/50 border border-border/30 hover:border-primary/30 transition-colors"
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
                className={`w-full p-3.5 rounded-xl border text-left transition-all group hover:shadow-lg hover:-translate-y-0.5 ${
                  opt.primary
                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:shadow-violet-500/10"
                    : "bg-card/50 border-border/50 hover:bg-card/80 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${opt.primary ? "bg-gradient-to-br from-violet-500/20 to-blue-500/20" : "bg-muted"}`}>
                    <opt.icon className={`h-4 w-4 ${opt.primary ? "text-violet-400" : "text-muted-foreground"}`} />
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
  );
}
