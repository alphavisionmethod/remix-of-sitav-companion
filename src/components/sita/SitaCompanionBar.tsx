import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ChevronUp, ChevronDown, Send, X, CalendarPlus, Lightbulb, Shield, AlertTriangle, Clock, FileText, Activity, Wifi, Zap, Bug, MessageSquare, ArrowRight, Mic, MicOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompanion } from "@/hooks/use-companion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { InlineBookingFlow } from "./InlineBookingFlow";
import { FeatureProposalPanel } from "./FeatureProposalPanel";
import type { NLPResult } from "@/lib/core-services/nlp-companion";
import { toast } from "sonner";

export const SitaCompanionBar = () => {
  const {
    context,
    suggestions,
    healthPulse,
    pendingProposalCount,
    obligations,
    dailyBriefing,
    manifestSnapshot,
    fleetStatus,
    errorPatrolReport,
    syncStatus,
    learningInsights,
    dismissSuggestion,
    generateProposals,
    processNLP,
    nlpSuggestions,
  } = useCompanion();

  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [showProposals, setShowProposals] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [nlpResponse, setNlpResponse] = useState<NLPResult | null>(null);

  // ── Voice Input (Web Speech API) ──────────────────────────
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoice = useCallback(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setQuery(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition error");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setExpanded(true);
  }, []);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const statusColor = {
    idle: "bg-trust-safe",
    listening: "bg-sita-purple",
    thinking: "bg-sita-gold",
    acting: "bg-trust-approval",
    error: "bg-destructive",
  }[healthPulse.status] || "bg-muted";

  const urgentObligations = obligations.filter(
    (o) => (o.urgency === "high" || o.urgency === "critical") && o.status !== "completed"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const result = processNLP(query);
    setNlpResponse(result);

    // Auto-navigate if the intent is navigation
    if (result.suggestedAction?.type === "navigate" && result.suggestedAction.route) {
      navigate(result.suggestedAction.route);
    }
    // Auto-open booking
    if (result.suggestedAction?.command === "quick-book") {
      setShowBooking(true);
    }

    setQuery("");
  };

  const handleProposals = () => {
    generateProposals();
    setShowProposals(true);
  };

  return (
    <>
      <motion.div
        className={cn(
          "fixed left-0 right-0 z-30 border-t border-border/50 backdrop-blur-xl",
          "bg-card/90 transition-colors md:left-[var(--sidebar-width,0px)]",
          "bottom-[calc(3rem+env(safe-area-inset-bottom,0px))] md:bottom-0"
        )}
        animate={{ height: expanded ? "auto" : 40 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {/* Collapsed strip */}
        <div
          className="flex items-center h-10 px-3 gap-3 cursor-pointer select-none"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Status pulse */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn("w-2 h-2 rounded-full animate-pulse", statusColor)} />
            <Brain className="w-3.5 h-3.5 text-sita-purple" />
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
              SITA
            </span>
          </div>

          {/* Quick input (collapsed) */}
          {!expanded && (
            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 min-w-0" onClick={(e) => e.stopPropagation()}>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask SITA anything…"
                className="h-7 text-xs bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-sita-purple/30"
                onFocus={() => setExpanded(true)}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); isListening ? stopVoice() : startVoice(); }}
                className={cn("shrink-0 rounded-full p-1 transition-all", isListening ? "bg-destructive/20 text-destructive animate-pulse" : "text-muted-foreground hover:text-foreground")}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </form>
          )}

          {/* Right side indicators */}
          <div className="flex items-center gap-2 shrink-0">
            {errorPatrolReport.openIssues > 0 && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <Bug className="w-3 h-3" />
                {errorPatrolReport.openIssues}
              </span>
            )}
            {urgentObligations.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <AlertTriangle className="w-3 h-3" />
                {urgentObligations.length}
              </span>
            )}
            {suggestions.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-sita-gold">
                <Lightbulb className="w-3 h-3" />
                {suggestions.length}
              </span>
            )}
            {pendingProposalCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-sita-purple">
                <Sparkles className="w-3 h-3" />
                {pendingProposalCount}
              </span>
            )}
            <span className={cn("flex items-center gap-1 text-xs", syncStatus.connected ? "text-trust-safe" : "text-destructive")}>
              <Wifi className="w-3 h-3" />
            </span>
            <span className="flex items-center gap-1 text-xs text-trust-safe">
              <Shield className="w-3 h-3" />
              {Math.round(healthPulse.trustScore * 100)}%
            </span>
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 pb-3 space-y-3"
            >
              {/* Input area */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Ask about ${context.module}…`}
                  className="h-9 text-sm bg-secondary/50 border-border/30"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={isListening ? stopVoice : startVoice}
                  className={cn(
                    "shrink-0 rounded-full p-2 transition-all",
                    isListening ? "bg-destructive/20 text-destructive animate-pulse" : "text-muted-foreground hover:text-sita-purple hover:bg-sita-purple/10"
                  )}
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <Button type="submit" size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-sita-purple hover:text-sita-purple-light">
                  <Send className="w-4 h-4" />
                </Button>
              </form>

              {/* NLP Response */}
              {nlpResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-sita-purple/5 border border-sita-purple/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3 h-3 text-sita-purple" />
                      <span className="text-[10px] uppercase tracking-wider text-sita-purple font-semibold">SITA</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sita-purple/20 text-sita-purple">
                        {nlpResponse.intent} · {Math.round(nlpResponse.confidence * 100)}%
                      </span>
                      {nlpResponse.sentiment !== "neutral" && (
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full",
                          nlpResponse.sentiment === "urgent" ? "bg-destructive/20 text-destructive" :
                          nlpResponse.sentiment === "negative" ? "bg-sita-gold/20 text-sita-gold" :
                          "bg-trust-safe/20 text-trust-safe"
                        )}>
                          {nlpResponse.sentiment}
                        </span>
                      )}
                    </div>
                    <button onClick={() => setNlpResponse(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-foreground">{nlpResponse.responseText}</p>
                  {nlpResponse.suggestedAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] gap-1 border-sita-purple/30 text-sita-purple"
                      onClick={() => {
                        if (nlpResponse.suggestedAction?.type === "navigate" && nlpResponse.suggestedAction.route) {
                          navigate(nlpResponse.suggestedAction.route);
                        }
                        if (nlpResponse.suggestedAction?.command === "quick-book") setShowBooking(true);
                        if (nlpResponse.suggestedAction?.command === "quick-add") {/* handled by wizard */}
                      }}
                    >
                      <ArrowRight className="w-3 h-3" />
                      {nlpResponse.suggestedAction.label}
                    </Button>
                  )}
                  {nlpResponse.entities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {nlpResponse.entities.slice(0, 5).map((e, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {e.type}: {e.value}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Predictive Suggestions */}
              {!nlpResponse && nlpSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {nlpSuggestions.slice(0, 4).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(s.text);
                      }}
                      className="text-[10px] px-2 py-1 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title={s.basedOn}
                    >
                      {s.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Daily Briefing (collapsed) */}
              {showBriefing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-3 rounded-lg bg-sita-purple/5 border border-sita-purple/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-sita-purple">Daily Briefing</span>
                    <button onClick={() => setShowBriefing(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-foreground">{dailyBriefing.headline}</p>
                  {dailyBriefing.moneyAlert && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {dailyBriefing.moneyAlert}
                    </p>
                  )}
                  {dailyBriefing.businessHighlight && (
                    <p className="text-[11px] text-muted-foreground">{dailyBriefing.businessHighlight}</p>
                  )}
                  {dailyBriefing.householdNote && (
                    <p className="text-[11px] text-muted-foreground">{dailyBriefing.householdNote}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {dailyBriefing.timingSummary}
                  </p>
                  {dailyBriefing.recommendations.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-border/20">
                      {dailyBriefing.recommendations.slice(0, 3).map((rec, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground">• {rec}</p>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Suggestions
                  </span>
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                    >
                      <Lightbulb className={cn(
                        "w-3.5 h-3.5 mt-0.5 shrink-0",
                        s.priority === "high" ? "text-sita-gold" : "text-muted-foreground"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{s.description}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {s.actionLabel && (
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-sita-purple">
                            {s.actionLabel}
                          </Button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); dismissSuggestion(s.id); }}
                          className="p-0.5 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] gap-1.5 border-border/30"
                  onClick={() => setShowBriefing(!showBriefing)}
                >
                  <FileText className="w-3 h-3" />
                  Daily Brief
                  {urgentObligations.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive text-[9px] font-bold">
                      {urgentObligations.length}
                    </span>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] gap-1.5 border-border/30"
                  onClick={() => setShowBooking(true)}
                >
                  <CalendarPlus className="w-3 h-3" />
                  Quick Book
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] gap-1.5 border-border/30"
                  onClick={handleProposals}
                >
                  <Sparkles className="w-3 h-3" />
                  Propose Features
                  {pendingProposalCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-sita-purple/20 text-sita-purple text-[9px] font-bold">
                      {pendingProposalCount}
                    </span>
                  )}
                </Button>
              </div>

              {/* Status bar */}
              <div className="flex items-center gap-4 pt-1 border-t border-border/20 flex-wrap">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Fleet: <span className={cn("font-medium", fleetStatus.error > 0 ? "text-destructive" : "text-trust-safe")}>{fleetStatus.active}/{fleetStatus.totalAgents}</span>
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Bug className="w-3 h-3" />
                  Patrol: <span className={cn("font-medium", errorPatrolReport.overallHealth === "critical" ? "text-destructive" : errorPatrolReport.overallHealth === "degraded" ? "text-sita-gold" : "text-trust-safe")}>{errorPatrolReport.overallHealth}</span>
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Sync: <span className={cn("font-medium", syncStatus.connected ? "text-trust-safe" : "text-destructive")}>v{syncStatus.version}</span>
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Learning: <span className="text-foreground">{(learningInsights.overallSuccessRate * 100).toFixed(0)}%</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Trust: <span className="text-trust-safe">{Math.round(healthPulse.trustScore * 100)}%</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Module: <span className="text-foreground capitalize">{context.module}</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Services: <span className="text-foreground">{manifestSnapshot.activeCapabilities}/{manifestSnapshot.totalCapabilities}</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Inline Booking Overlay */}
      {showBooking && <InlineBookingFlow onClose={() => setShowBooking(false)} />}

      {/* Feature Proposals Panel */}
      {showProposals && <FeatureProposalPanel onClose={() => setShowProposals(false)} />}
    </>
  );
};
