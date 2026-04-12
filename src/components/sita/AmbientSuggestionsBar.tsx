// ═══════════════════════════════════════════════════════════════
// SITA OS — Ambient Suggestions Bar
// Floating contextual suggestions from the Ambient Context Engine
// Shows 2-3 top suggestions, appears contextually, dismissible
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ambientContext, type AmbientSuggestion } from "@/lib/services/ambient-context-engine";

const MAX_VISIBLE = 3;
const HIDE_AFTER_MS = 30_000; // auto-hide after 30s

export function AmbientSuggestionsBar() {
  const [suggestions, setSuggestions] = useState<AmbientSuggestion[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = ambientContext.subscribe((s) => {
      setSuggestions(s.slice(0, MAX_VISIBLE));
      if (s.length > 0) setDismissed(false);
    });
    return unsub;
  }, []);

  // Auto-hide timer
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
      default:
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
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/15">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary/60" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
                  Suggestions
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
              {suggestions.map((s, i) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAccept(s)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-primary/8 transition-all duration-150 group"
                >
                  <span className="text-base shrink-0">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{s.title}</p>
                    {s.subtitle && (
                      <p className="text-[11px] text-muted-foreground/60 truncate">{s.subtitle}</p>
                    )}
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
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AmbientSuggestionsBar;
