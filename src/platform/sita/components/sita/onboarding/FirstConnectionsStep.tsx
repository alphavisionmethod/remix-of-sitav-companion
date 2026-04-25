// ═══════════════════════════════════════════════════════════════
// SITA OS — First Connections Step (Phase 2.14) — Rewrite
// World-model-based recommendations with value previews
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Calendar, CreditCard, BarChart3, MessageSquare, Home,
  FileText, Bell, Users, Cloud, ChevronRight, Check, Loader2,
  Shield, Plug, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Connector {
  id: string;
  name: string;
  icon: typeof Mail;
  desc: string;
  provider: string;
  categories: string[];
  benefit: string;
  whyNow: Record<string, string>;
  whatSitaDoes: string;
  trustBoundary: string;
}

const CONNECTORS: Connector[] = [
  {
    id: "calendar", name: "Calendar", icon: Calendar,
    desc: "Scheduling, conflicts, prep reminders",
    provider: "google", categories: ["family", "personal", "business", "full"],
    benefit: "SITA can now detect scheduling conflicts and prep your day",
    whyNow: { family: "Unify family schedules immediately", personal: "Build your daily pulse", business: "Prep for meetings automatically", full: "Foundation for scheduling intelligence" },
    whatSitaDoes: "Read your events, detect conflicts, prepare daily briefings, suggest optimizations",
    trustBoundary: "Read-only access. SITA never creates or modifies events without approval.",
  },
  {
    id: "email", name: "Email", icon: Mail,
    desc: "Email triage, action items, follow-ups",
    provider: "google", categories: ["business", "full"],
    benefit: "SITA can now detect overdue follow-ups",
    whyNow: { business: "Surface missed follow-ups and action items", full: "Triage across all domains" },
    whatSitaDoes: "Scan for action items, flag overdue responses, identify important threads",
    trustBoundary: "Read-only access. SITA drafts responses but never sends without approval.",
  },
  {
    id: "files", name: "Files & Documents", icon: FileText,
    desc: "Document search, organization, context",
    provider: "gdrive", categories: ["business", "full"],
    benefit: "SITA can now reference your documents for context",
    whyNow: { business: "Quick access to proposals and contracts", full: "Universal document intelligence" },
    whatSitaDoes: "Index documents for contextual search, suggest relevant files during tasks",
    trustBoundary: "Read-only access. SITA indexes metadata and content but never modifies files.",
  },
  {
    id: "bank", name: "Bank & Finance", icon: CreditCard,
    desc: "Balances, transactions, spending pulse",
    provider: "plaid", categories: ["money", "full"],
    benefit: "SITA can now monitor your spending and build your bill calendar",
    whyNow: { money: "Build your bill calendar and spending pulse", full: "Complete financial picture" },
    whatSitaDoes: "Track balances, categorize spending, detect anomalies, forecast cashflow",
    trustBoundary: "Read-only access. SITA never initiates transactions or transfers.",
  },
  {
    id: "crm", name: "CRM & Leads", icon: BarChart3,
    desc: "Pipeline, contacts, revenue tracking",
    provider: "crm", categories: ["business", "full"],
    benefit: "SITA can now track your pipeline and recover missed leads",
    whyNow: { business: "Recover stale leads and track pipeline health", full: "Business intelligence layer" },
    whatSitaDoes: "Analyze pipeline, score leads, detect follow-up gaps, forecast revenue",
    trustBoundary: "Read-only access. SITA suggests actions but never modifies CRM records.",
  },
  {
    id: "messaging", name: "Messaging", icon: MessageSquare,
    desc: "Team messages, action items, alerts",
    provider: "slack", categories: ["business", "full"],
    benefit: "SITA can now surface team action items",
    whyNow: { business: "Don't miss important team requests", full: "Cross-channel communication intelligence" },
    whatSitaDoes: "Surface action items from messages, flag urgent requests, summarize threads",
    trustBoundary: "Read-only access. SITA reads messages but never posts on your behalf.",
  },
  {
    id: "household", name: "Household Tools", icon: Home,
    desc: "Groceries, tasks, shared lists",
    provider: "household", categories: ["family", "personal", "full"],
    benefit: "SITA can now coordinate household tasks",
    whyNow: { family: "Unify shared responsibilities", personal: "Optimize home management", full: "Complete household coordination" },
    whatSitaDoes: "Sync shared lists, coordinate tasks, optimize errands, manage household rhythm",
    trustBoundary: "Read-write for shared lists. Purchases require approval.",
  },
  {
    id: "notes", name: "Notes & Reminders", icon: Bell,
    desc: "Notes, to-dos, reminders",
    provider: "notes", categories: ["personal", "family", "full"],
    benefit: "SITA can now track your reminders and to-dos",
    whyNow: { personal: "Never miss a reminder", family: "Shared family reminders", full: "Unified task intelligence" },
    whatSitaDoes: "Sync reminders, detect slipping tasks, suggest prioritization",
    trustBoundary: "Read-only. SITA never creates reminders without approval.",
  },
  {
    id: "contacts", name: "Contacts", icon: Users,
    desc: "Address book, relationships, context",
    provider: "contacts", categories: ["business", "family", "full"],
    benefit: "SITA can now enrich interactions with contact context",
    whyNow: { business: "Rich client context for follow-ups", family: "Family and friend network", full: "Universal relationship context" },
    whatSitaDoes: "Enrich interactions with contact history, suggest connections, identify VIPs",
    trustBoundary: "Read-only access. SITA never modifies or shares contact data.",
  },
  {
    id: "cloud-storage", name: "Cloud Storage", icon: Cloud,
    desc: "Dropbox, Google Drive, OneDrive",
    provider: "cloud", categories: ["business", "full"],
    benefit: "SITA can now search across your cloud files",
    whyNow: { business: "Instant access to business documents", full: "Universal file intelligence" },
    whatSitaDoes: "Index cloud storage for intelligent search, surface relevant documents",
    trustBoundary: "Read-only access. SITA never uploads, modifies, or deletes files.",
  },
];

interface FirstConnectionsStepProps {
  enabledDomains: string[];
  primaryUseMode: string;
  onConnectedChange?: (count: number) => void;
  onDeferredChange?: (deferred: string[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function FirstConnectionsStep({ enabledDomains, primaryUseMode, onConnectedChange, onDeferredChange, onNext, onPrev }: FirstConnectionsStepProps) {
  const { user } = useAuth();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [deferred, setDeferred] = useState<Set<string>>(new Set());

  // Filter and sort based on primaryUseMode
  const mode = primaryUseMode || "personal";
  const recommended = CONNECTORS
    .filter(c => c.categories.includes(mode))
    .sort((a, b) => {
      const aHasWhy = !!a.whyNow[mode];
      const bHasWhy = !!b.whyNow[mode];
      if (aHasWhy && !bHasWhy) return -1;
      if (!aHasWhy && bHasWhy) return 1;
      return 0;
    });

  const handleConnect = async (connector: Connector) => {
    if (!user || connected.has(connector.id)) return;
    setConnecting(connector.id);

    try {
      const { error } = await fromTable("connector_configs").upsert({
        user_id: user.id,
        service: connector.id,
        status: "pending_auth",
        config: {
          name: connector.name,
          provider: connector.provider,
          connected_at: new Date().toISOString(),
          setup_source: "onboarding",
        },
      }, { onConflict: "user_id,service" });

      if (error) throw error;

      await new Promise(r => setTimeout(r, 1200));

      await fromTable("connector_configs")
        .update({ status: "connected" })
        .eq("user_id", user.id)
        .eq("service", connector.id);

      setConnected(prev => {
        const next = new Set([...prev, connector.id]);
        onConnectedChange?.(next.size);
        return next;
      });
    } catch (err) {
      console.error("Connection error:", err);
      toast.error(`Could not connect ${connector.name}. You can try again later.`, {
        action: {
          label: "Retry",
          onClick: () => handleConnect(connector),
        },
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleDefer = (id: string) => {
    setDeferred(prev => {
      const next = new Set([...prev, id]);
      onDeferredChange?.([...next]);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
          <Plug className="h-7 w-7 text-primary-foreground" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-foreground">Connect what matters first</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start with the systems that will help SITA support you immediately
        </p>
      </div>

      {/* Trust note */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/20 px-4 py-3">
        <Shield className="h-4 w-4 text-[hsl(var(--trust-safe))] shrink-0" />
        <p className="text-xs text-muted-foreground">
          SITA uses read-only access by default. You approve all actions.
        </p>
      </div>

      {/* Connector cards */}
      <div className="space-y-2.5">
        {recommended.map((c, i) => {
          const isConnected = connected.has(c.id);
          const isConnecting = connecting === c.id;
          const isDeferred = deferred.has(c.id);
          const whyNow = c.whyNow[mode] || c.whyNow[Object.keys(c.whyNow)[0]];

          if (isDeferred) return null;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "rounded-xl border overflow-hidden transition-all duration-300",
                isConnected
                  ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5"
                  : "border-border bg-card hover:border-primary/20"
              )}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-xl p-2.5 transition-colors",
                    isConnected ? "bg-[hsl(var(--trust-safe))]/15" : "bg-secondary"
                  )}>
                    <c.icon className={cn("h-5 w-5",
                      isConnected ? "text-[hsl(var(--trust-safe))]" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isConnected && !isConnecting && (
                      <button onClick={() => handleDefer(c.id)}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        Later
                      </button>
                    )}
                    <button
                      onClick={() => handleConnect(c)}
                      disabled={isConnected || isConnecting}
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                        isConnected
                          ? "bg-[hsl(var(--trust-safe))]/15 text-[hsl(var(--trust-safe))] cursor-default"
                          : isConnecting
                            ? "bg-primary/10 text-primary cursor-wait"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {isConnected ? (
                        <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Connected</span>
                      ) : isConnecting ? (
                        <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…</span>
                      ) : "Connect"}
                    </button>
                  </div>
                </div>

                {/* Why now + what SITA does */}
                {!isConnected && (
                  <div className="mt-3 pl-12 space-y-1.5">
                    <p className="text-[10px] text-primary font-medium">Why now: {whyNow}</p>
                    <p className="text-[10px] text-muted-foreground">{c.whatSitaDoes}</p>
                    <div className="flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5 text-muted-foreground" />
                      <p className="text-[9px] text-muted-foreground">{c.trustBoundary}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Connected value preview */}
              <AnimatePresence>
                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/3 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-[hsl(var(--trust-safe))]" />
                      <p className="text-xs text-[hsl(var(--trust-safe))] font-medium">{c.benefit}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Deferred count */}
      {deferred.size > 0 && (
        <p className="text-center text-[10px] text-muted-foreground">
          {deferred.size} deferred — available in Settings anytime
        </p>
      )}

      {/* Connected count */}
      {connected.size > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground">
          {connected.size} system{connected.size !== 1 ? "s" : ""} connected
        </motion.p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        <div className="flex items-center gap-3">
          {connected.size === 0 && (
            <button onClick={onNext} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Skip for now
            </button>
          )}
          <button onClick={onNext}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2">
            Continue <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
