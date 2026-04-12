// ═══════════════════════════════════════════════════════════════
// SITA OS — Ambient Suggestions Bar v2
// "SITA noticed..." prefix, thinking pulse, confidence bar,
// Lucide icons per suggestion type
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowRight, Sparkles, FileText, Clipboard, RotateCcw,
  Target, Clock, Link2, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ambientContext, type AmbientSuggestion, type SuggestionType } from "@/lib/services/ambient-context-engine";

const MAX_VISIBLE = 3;
const HIDE_AFTER_MS = 30_000;

// Map suggestion types to Lucide icons
function getTypeIcon(type: SuggestionType) {
  switch (type) {
    case "related_entity": return <FileText className="h-3.5 w-3.5" />;
    case "clipboard_action": return <Clipboard className="h-3.5 w-3.5" />;
    case "continue_workflow":
    case "context_restore": return <RotateCcw className="h-3.5 w-3.5" />;
    case "predicted_next": return <Target className="h-3.5 w-3.5" />;
    case "time_pattern": return <Clock className="h-3.5 w-3.5" />;
    case "recent_coaccessed": return <Link2 className="h-3.5 w-3.5" />;
    case "selection_action": return <Search className="h-3.5 w-3.5" />;
    default: return <Sparkles className="h-3.5 w-3.5" />;
  }
}

// Suggestion types that should show "SITA noticed..." prefix
const PROACTIVE_TYPES: SuggestionType[] = [
  "predicted_next", "time_pattern", "related_entity", "context_restore",
];

export function AmbientSuggestionsBar() {
  const [suggestions, setSuggestions] = useState<AmbientSuggestion[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const prevCount = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = ambientContext.subscribe((s) => {
      const visible = s.slice(0, MAX_VISIBLE);
      // Trigger thinking pulse when new suggestions arrive
      if (visible.length > prevCount.current) {
        setIsThinking(true);
        setTimeout(() => setIsThinking(false), 1200);
      }
      prevCount.current = visible.length;
      setSuggestions(visible);
      if (s.length > 0) setDismissed(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (suggestions.length === 0) return;
    const timer = setTimeout(() => setDismissed(true), HIDE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [suggestions]);

  const handleAccept = useCallback((suggestion: AmbientSuggestion) => {
    ambientContext.acceptSuggestion(suggestion.id);

    const [actionType, ...rest] = suggestion.action.split(":");
    const target = rest.join(":");

    switch (actionType) {
      case "navigate":
      case "restore":
        navigate(target);
        break;
      case "open_url":
        window.open(target, "_blank", "noopener");
        break;
      case "search":
        navigate(`/search?q=${encodeURIComponent(target)}`);
        break;
      case "email":
        window.open(`mailto:${target}`);
        break;
    }
  }, [navigate]);

  const handleDismiss = useCallback((id: string) => {
    ambientContext.dismissSuggestion(id);
  }, []);

  const visible = !dismissed && suggestions.length > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "hsl(var(--card) / 0.85)",
              backdropFilter: "blur(40px) saturate(1.6)",
              WebkitBackdropFilter: "blur(40px) saturate(1.6)",
              border: "1px solid hsl(var(--border) / 0.25)",
              boxShadow: "0 16px 60px -8px hsl(0 0% 0% / 0.35), 0 0 0 1px hsl(0 0% 100% / 0.04)",
            }}
          >
            {/* Header with thinking pulse */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/15">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className={cn(
                    "h-3 w-3 text-primary/60 transition-all duration-500",
                    isThinking && "text-primary animate-pulse"
                  )} />
                  {isThinking && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: 1 }}
                      className="absolute inset-0 rounded-full bg-primary/30"
                    />
                  )}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
                  {isThinking ? "SITA is thinking…" : "Suggestions"}
                </span>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 rounded-md hover:bg-muted/30 text-muted-foreground/40 hover:text-foreground/60 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Suggestion items */}
            <div className="py-1.5 px-2">
              {suggestions.map((s, i) => {
                const isProactive = PROACTIVE_TYPES.includes(s.type);
                return (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleAccept(s)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-primary/8 transition-all duration-150 group"
                  >
                    {/* Type-specific icon */}
                    <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary/70">
                      {getTypeIcon(s.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">
                        {isProactive ? `SITA noticed: ${s.title}` : s.title}
                      </p>
                      {s.subtitle && (
                        <p className="text-[11px] text-muted-foreground/60 truncate">{s.subtitle}</p>
                      )}
                      {/* Relevance confidence bar */}
                      <div className="mt-1 h-0.5 w-full rounded-full bg-muted/20 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round(s.relevance * 100)}%` }}
                          transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                          className="h-full rounded-full bg-primary/40"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDismiss(s.id); }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted/40 text-muted-foreground/40 transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <ArrowRight className="h-3 w-3 text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AmbientSuggestionsBar;
