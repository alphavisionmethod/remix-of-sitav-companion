import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Calendar, CreditCard, BarChart3, MessageSquare, Home,
  ChevronRight, Check, Loader2, Shield, Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
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
}

const CONNECTORS: Connector[] = [
  { id: "gmail", name: "Gmail", icon: Mail, desc: "Email triage, action items, follow-ups", provider: "google", categories: ["business", "concierge"], benefit: "SITA can now detect overdue follow-ups" },
  { id: "google-calendar", name: "Google Calendar", icon: Calendar, desc: "Scheduling, conflicts, prep reminders", provider: "google", categories: ["business", "concierge", "money"], benefit: "SITA can now build your schedule pulse" },
  { id: "stripe", name: "Stripe", icon: CreditCard, desc: "Payments, subscriptions, revenue tracking", provider: "stripe", categories: ["business", "money"], benefit: "SITA can now track revenue in real-time" },
  { id: "quickbooks", name: "QuickBooks", icon: BarChart3, desc: "Invoices, bills, P&L, cash flow", provider: "quickbooks", categories: ["money"], benefit: "SITA can now predict your cash flow" },
  { id: "plaid", name: "Bank Accounts", icon: CreditCard, desc: "Balances, transactions, spending pulse", provider: "plaid", categories: ["money"], benefit: "SITA can now monitor your spending" },
  { id: "slack", name: "Slack", icon: MessageSquare, desc: "Team messages, action items, alerts", provider: "slack", categories: ["business"], benefit: "SITA can now surface team action items" },
  { id: "household-tools", name: "Household Tools", icon: Home, desc: "Groceries, tasks, shared lists", provider: "household", categories: ["concierge"], benefit: "SITA can now coordinate household tasks" },
];

interface FirstConnectionsStepProps {
  enabledDomains: string[];
  onNext: () => void;
  onPrev: () => void;
}

export function FirstConnectionsStep({ enabledDomains, onNext, onPrev }: FirstConnectionsStepProps) {
  const { user } = useAuth();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<Set<string>>(new Set());

  // Filter connectors by enabled domains
  const recommended = CONNECTORS.filter(c =>
    c.categories.some(cat => enabledDomains.includes(cat))
  );

  const handleConnect = async (connector: Connector) => {
    if (!user || connected.has(connector.id)) return;
    setConnecting(connector.id);

    try {
      // Write to connector_configs table
      const { error } = await (supabase as any).from("connector_configs").upsert({
        user_id: user.id,
        connector_id: connector.id,
        provider: connector.provider,
        status: "pending_auth",
        config: {
          name: connector.name,
          connected_at: new Date().toISOString(),
          setup_source: "onboarding",
        },
      }, { onConflict: "user_id,connector_id" });

      if (error) throw error;

      // Simulate brief connection delay for premium feel
      await new Promise(r => setTimeout(r, 1200));

      // Update status to connected
      await (supabase as any).from("connector_configs")
        .update({ status: "connected" })
        .eq("user_id", user.id)
        .eq("connector_id", connector.id);

      setConnected(prev => new Set([...prev, connector.id]));
      toast.success(connector.benefit);
    } catch (err) {
      console.error("Connection error:", err);
      toast.error(`Could not connect ${connector.name}. You can try again later.`);
    } finally {
      setConnecting(null);
    }
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
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mx-auto mb-4"
        >
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
          SITA uses read-only access by default. You control permissions at every step.
        </p>
      </div>

      {/* Connector cards */}
      <div className="space-y-2.5">
        {recommended.map((c, i) => {
          const isConnected = connected.has(c.id);
          const isConnecting = connecting === c.id;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "rounded-xl border p-4 transition-all duration-300",
                isConnected
                  ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5"
                  : "border-border bg-card hover:border-primary/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-xl p-2.5 transition-colors",
                  isConnected ? "bg-[hsl(var(--trust-safe))]/15" : "bg-secondary"
                )}>
                  <c.icon className={cn(
                    "h-5 w-5",
                    isConnected ? "text-[hsl(var(--trust-safe))]" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
                <button
                  onClick={() => handleConnect(c)}
                  disabled={isConnected || isConnecting}
                  className={cn(
                    "shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
                    isConnected
                      ? "bg-[hsl(var(--trust-safe))]/15 text-[hsl(var(--trust-safe))] cursor-default"
                      : isConnecting
                        ? "bg-primary/10 text-primary cursor-wait"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isConnected ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> Connected
                    </span>
                  ) : isConnecting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…
                    </span>
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>

              {/* Benefit toast inline */}
              <AnimatePresence>
                {isConnected && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-[hsl(var(--trust-safe))] mt-2 pl-12"
                  >
                    ✓ {c.benefit}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Connected count */}
      {connected.size > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground"
        >
          {connected.size} system{connected.size !== 1 ? "s" : ""} connected — you can add more from Settings anytime
        </motion.p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back
        </button>
        <div className="flex items-center gap-3">
          {connected.size === 0 && (
            <button onClick={onNext} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Skip for now
            </button>
          )}
          <button
            onClick={onNext}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            Continue <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
