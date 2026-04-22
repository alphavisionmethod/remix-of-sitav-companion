import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain, ChevronRight, Loader2, CheckCircle, AlertTriangle, Clock,
  Eye, EyeOff, Sparkles, ArrowRight, HelpCircle, BarChart3, Zap,
  PanelRightClose, PanelRight, Users, MessageSquare
} from "lucide-react";
import { MultiAITeamPanel } from "./MultiAITeamPanel";
import { AIConversationMode } from "./AIConversationMode";
import { useDataMode } from "@/contexts/DataModeContext";

interface AITask {
  id: string;
  label: string;
  status: "analyzing" | "running" | "done" | "waiting" | "blocked";
  confidence?: number;
  detail?: string;
  risk?: "low" | "medium" | "high";
}

interface AISuggestion {
  id: string;
  text: string;
  domain: string;
  confidence: number;
  impact: "low" | "medium" | "high";
}

const DEMO_TASKS: AITask[] = [
  { id: "t1", label: "Analyzing sync failure patterns", status: "done", confidence: 94, detail: "Found bottleneck in upload finalization path" },
  { id: "t2", label: "Preparing optimization fix", status: "running", confidence: 87, detail: "Generating retry logic improvements" },
  { id: "t3", label: "Running regression tests", status: "waiting", detail: "Waiting for fix preparation" },
  { id: "t4", label: "Canary deployment preparation", status: "waiting", detail: "Depends on test validation" },
];

const DEMO_SUGGESTIONS: AISuggestion[] = [
  { id: "s1", text: "Delay rollout by 6 hours — beta crash rate is trending upward", domain: "releases", confidence: 89, impact: "high" },
  { id: "s2", text: "Storage costs rose 8% due to aggressive preview generation", domain: "costs", confidence: 92, impact: "medium" },
  { id: "s3", text: "Sync performance can improve 12% by optimizing retry backoff", domain: "sync", confidence: 85, impact: "medium" },
  { id: "s4", text: "Trust prompts appear too often for new user cohort", domain: "trust", confidence: 78, impact: "low" },
];

const statusIcon = {
  analyzing: <Loader2 className="h-3 w-3 animate-spin text-primary" />,
  running: <Loader2 className="h-3 w-3 animate-spin text-blue-400" />,
  done: <CheckCircle className="h-3 w-3 text-emerald-400" />,
  waiting: <Clock className="h-3 w-3 text-muted-foreground" />,
  blocked: <AlertTriangle className="h-3 w-3 text-red-400" />,
};

const impactColor = { low: "text-emerald-400", medium: "text-amber-400", high: "text-red-400" };

type PanelTab = "tasks" | "team" | "chat";

export function AITransparencyPanel({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [mode, setMode] = useState<"summary" | "detailed">("summary");
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>("tasks");

  if (collapsed) {
    return (
      <div className="w-10 border-l border-border/30 bg-card/20 backdrop-blur-xl flex flex-col items-center py-3 gap-2 shrink-0">
        <button onClick={onToggle} className="p-1.5 hover:bg-muted/40 rounded-lg transition-colors" title="Open AI Panel">
          <PanelRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
          <Brain className="h-3 w-3 text-primary" />
        </div>
        <span className="text-[8px] text-muted-foreground writing-mode-vertical" style={{ writingMode: "vertical-rl" }}>AI Active</span>
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-border/30 bg-card/20 backdrop-blur-xl flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">AI Activity</span>
        </div>
        <div className="flex items-center gap-1">
          {activeTab === "tasks" && (
            <button
              onClick={() => setMode(m => m === "summary" ? "detailed" : "summary")}
              className="p-1 hover:bg-muted/40 rounded transition-colors"
              title={mode === "summary" ? "Show details" : "Show summary"}
            >
              {mode === "summary" ? <Eye className="h-3 w-3 text-muted-foreground" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
            </button>
          )}
          <button onClick={onToggle} className="p-1 hover:bg-muted/40 rounded transition-colors">
            <PanelRightClose className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="px-3 py-1.5 border-b border-border/10 flex items-center gap-1">
        {([
          { key: "tasks" as const, label: "Tasks", icon: Sparkles },
          { key: "team" as const, label: "AI Team", icon: Users },
          { key: "chat" as const, label: "Chat", icon: MessageSquare },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
              activeTab === tab.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
            )}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Badge — only for Tasks tab */}
      {activeTab === "tasks" && (
        <div className="px-3 py-2 border-b border-border/10">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">System Active · 4 tasks in progress</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "team" && (
          <div className="px-3 py-2">
            <MultiAITeamPanel />
          </div>
        )}

        {activeTab === "chat" && (
          <AIConversationMode />
        )}

        {activeTab === "tasks" && (
          <>
            {/* Active Tasks */}
            <div className="px-3 py-2">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Active Tasks</span>
            </div>
            <div className="px-3 space-y-1.5 pb-3">
              {DEMO_TASKS.map(task => (
                <div key={task.id} className="p-2 rounded-lg bg-muted/10 border border-border/10 space-y-1">
                  <div className="flex items-center gap-2">
                    {statusIcon[task.status]}
                    <span className="text-[11px] text-foreground flex-1">{task.label}</span>
                  </div>
                  {mode === "detailed" && (
                    <div className="pl-5 space-y-0.5">
                      {task.detail && <p className="text-[10px] text-muted-foreground">{task.detail}</p>}
                      {task.confidence && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-muted-foreground">Confidence:</span>
                          <div className="h-1 w-16 bg-muted/30 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${task.confidence}%` }} />
                          </div>
                          <span className="text-[9px] text-primary">{task.confidence}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Suggestions */}
            <div className="px-3 py-2 border-t border-border/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Suggestions</span>
                <Sparkles className="h-3 w-3 text-primary/50" />
              </div>
            </div>
            <div className="px-3 space-y-1.5 pb-3">
              {DEMO_SUGGESTIONS.map(suggestion => (
                <div key={suggestion.id} className="group">
                  <button
                    onClick={() => setExpandedSuggestion(expandedSuggestion === suggestion.id ? null : suggestion.id)}
                    className="w-full p-2 rounded-lg bg-muted/5 border border-border/10 hover:bg-muted/20 transition-colors text-left"
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      <span className="text-[11px] text-foreground leading-relaxed">{suggestion.text}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 pl-5">
                      <Badge variant="outline" className="text-[8px] h-3.5">{suggestion.domain}</Badge>
                      <span className={cn("text-[9px]", impactColor[suggestion.impact])}>
                        {suggestion.impact} impact
                      </span>
                      <span className="text-[9px] text-muted-foreground">{suggestion.confidence}% conf.</span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedSuggestion === suggestion.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-2 py-1.5 flex items-center gap-1 flex-wrap">
                          <Button variant="outline" size="sm" className="h-5 text-[9px] px-2 gap-1">
                            <HelpCircle className="h-2.5 w-2.5" /> Why?
                          </Button>
                          <Button variant="outline" size="sm" className="h-5 text-[9px] px-2 gap-1">
                            <BarChart3 className="h-2.5 w-2.5" /> Simulate
                          </Button>
                          <Button size="sm" className="h-5 text-[9px] px-2 gap-1">
                            <Zap className="h-2.5 w-2.5" /> Apply Fix
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Reasoning Trace (detailed mode) */}
            {mode === "detailed" && (
              <div className="px-3 py-2 border-t border-border/10">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Reasoning Trace</span>
                <div className="mt-2 space-y-1">
                  {[
                    { time: "12:01", text: "Detected sync failure rate increase (2.3% → 4.1%)" },
                    { time: "12:02", text: "Correlated with deploy v2.14.0-rc3 (24h window)" },
                    { time: "12:03", text: "Identified upload finalization timeout as root cause" },
                    { time: "12:04", text: "Generated retry backoff optimization proposal" },
                    { time: "12:05", text: "Estimated fix confidence: 87% based on historical patterns" },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px]">
                      <span className="text-muted-foreground shrink-0 w-10 font-mono">{entry.time}</span>
                      <span className="text-foreground/80">{entry.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border/20 text-center">
        <span className="text-[9px] text-muted-foreground">AI budget: $0.42 today · 847 tokens/min</span>
      </div>
    </div>
  );
}
