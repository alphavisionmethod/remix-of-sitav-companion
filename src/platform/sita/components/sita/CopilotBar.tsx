import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, X, Loader2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

export const CopilotBar = () => {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setExpanded(true);
    setResponse("");

    try {
      const { data } = await supabase.functions.invoke("personal-brain", {
        body: { intent: query, context: { source: "copilot-bar" } },
      });
      setResponse(data?.recommendation || data?.response || "I couldn't process that right now.");
    } catch {
      setResponse("Connection issue — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => {
    setExpanded(false);
    setResponse("");
    setQuery("");
  };

  return (
    <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] md:bottom-20 left-1/2 -translate-x-1/2 z-[200] w-full max-w-xl px-4">
      <AnimatePresence>
        {expanded && response && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="mb-2 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl p-4 max-h-48 overflow-y-auto scrollbar-thin"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">SITA Brain</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => navigate("/brain")} className="p-1 rounded hover:bg-secondary transition-colors" title="Open full Brain">
                  <Maximize2 className="h-3 w-3 text-muted-foreground" />
                </button>
                <button onClick={dismiss} className="p-1 rounded hover:bg-secondary transition-colors">
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="prose prose-sm prose-invert max-w-none text-xs text-foreground">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input strip */}
      <div className="flex items-center gap-2 rounded-full border border-border/40 bg-card/90 backdrop-blur-xl shadow-lg px-4 py-2">
        <Brain className="h-4 w-4 text-primary shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ask SITA anything…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
        {loading ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!query.trim()}
            className={cn(
              "rounded-full p-1.5 transition-colors",
              query.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
