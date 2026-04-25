import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LucideIcon } from "lucide-react";

interface Chapter {
  key: string;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

interface WorldModelConversationPanelsProps {
  chapters: Chapter[];
  activeChapter?: string;
  onChapterChange?: (key: string) => void;
}

export function WorldModelConversationPanels({ chapters, activeChapter, onChapterChange }: WorldModelConversationPanelsProps) {
  const [local, setLocal] = useState(activeChapter || chapters[0]?.key || "");
  const active = activeChapter ?? local;
  const reduced = useReducedMotion();

  const toggle = (key: string) => {
    const next = active === key ? "" : key;
    setLocal(next);
    onChapterChange?.(next);
  };

  return (
    <div className="space-y-1.5">
      {chapters.map((ch, i) => {
        const isActive = active === ch.key;
        return (
          <motion.div key={ch.key}
            initial={reduced ? {} : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.04 }}
            className={cn("rounded-xl border transition-all", isActive ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/20")}
          >
            <button onClick={() => toggle(ch.key)}
              className="w-full flex items-center gap-3 p-3.5 text-left">
              <ch.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-xs font-semibold flex-1", isActive ? "text-foreground" : "text-muted-foreground")}>{ch.title}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isActive && "rotate-180")} />
            </button>
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={reduced ? { height: "auto" } : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? {} : { height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 pb-4 pt-0">{ch.children}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
