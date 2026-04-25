import { motion } from "framer-motion";
import { Landmark, CreditCard, Building2, Users, FileSpreadsheet, Link2, ShieldCheck, Activity, Wallet, Globe, Coins } from "lucide-react";
import { SetupStageHeader } from "@/platform/sita/components/sita/setup/SetupStageHeader";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { ConnectedAccountStub } from "./types";

const ACCOUNT_TYPES: { type: ConnectedAccountStub["type"]; icon: typeof Landmark; label: string; desc: string }[] = [
  { type: "bank", icon: Landmark, label: "Banks", desc: "Checking & savings accounts" },
  { type: "card", icon: CreditCard, label: "Credit Cards", desc: "All credit card accounts" },
  { type: "loan", icon: Link2, label: "Loans & Mortgages", desc: "Debt accounts & terms" },
  { type: "business", icon: Building2, label: "Business Accounts", desc: "Business checking & operations" },
  { type: "household", icon: Users, label: "Household / Shared", desc: "Joint or shared accounts" },
  { type: "csv", icon: FileSpreadsheet, label: "CSV / Manual Import", desc: "Upload transaction files" },
  { type: "accounting", icon: Link2, label: "Accounting / Payment", desc: "QuickBooks, Stripe, PayPal…" },
  { type: "credit_monitor", icon: Activity, label: "Credit Monitoring", desc: "Score tracking sources" },
  { type: "crypto_wallet", icon: Wallet, label: "Crypto Wallets", desc: "MetaMask, Phantom, Ledger…" },
  { type: "crypto_exchange", icon: Coins, label: "Crypto Exchanges", desc: "Coinbase, Binance, Kraken…" },
  { type: "defi", icon: Link2, label: "DeFi Protocols", desc: "Uniswap, Aave, dYdX…" },
  { type: "forex", icon: Globe, label: "Forex / Intl Trading", desc: "OANDA, IG, eToro…" },
];

interface Props {
  connected: ConnectedAccountStub[];
  onToggle: (type: ConnectedAccountStub["type"]) => void;
  onContinue: () => void;
}

export function ConnectAccountsStep({ connected, onToggle, onContinue }: Props) {
  const reduced = useReducedMotion();
  const isConnected = (t: ConnectedAccountStub["type"]) => connected.some((c) => c.type === t && c.connected);

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <SetupStageHeader title="Connect Accounts" subtitle="Connect your financial sources. You can add more later." icon={ShieldCheck} />

      <div className="grid grid-cols-2 gap-2">
        {ACCOUNT_TYPES.map((a, i) => {
          const active = isConnected(a.type);
          return (
            <motion.button
              key={a.type}
              initial={reduced ? {} : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.04 }}
              onClick={() => onToggle(a.type)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                active
                  ? "border-trust-safe/50 bg-trust-safe/8"
                  : "border-border bg-secondary/20 hover:border-primary/20"
              )}
            >
              <a.icon className={cn("h-4 w-4 mb-1.5", active ? "text-trust-safe" : "text-muted-foreground")} />
              <p className="text-xs font-semibold text-foreground">{a.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
              {active && (
                <span className="mt-1.5 inline-block rounded-full bg-trust-safe/15 px-2 py-0.5 text-[9px] text-trust-safe font-medium">
                  Connected
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-secondary/10 p-3 text-[11px] text-muted-foreground">
        <ShieldCheck className="inline h-3.5 w-3.5 mr-1 text-trust-safe" />
        All connections are encrypted, scoped to read-only, and governed by your trust settings.
      </div>

      <button onClick={onContinue} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        {connected.length > 0 ? "Continue" : "Skip for now"}
      </button>
    </div>
  );
}
