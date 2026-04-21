// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Money (wired to transactions table)
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { useMobileMoneyAccounts, useMobileMoneyTransactions } from "@/hooks/use-mobile-data";

const MobileMoney = () => {
  const accountData = useMobileMoneyAccounts();
  const txData = useMobileMoneyTransactions();

  const isLoading = accountData.isLoading || txData.isLoading;
  const { safeToSpend, accounts } = accountData.data;
  const transactions = txData.data;

  return (
    <MobileShell title="Money">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Safe to spend */}
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Safe to Spend</p>
        <p className="text-3xl font-bold text-primary">{safeToSpend}</p>
        <p className="text-xs text-muted-foreground mt-1">After reserves, taxes & obligations</p>
      </div>

      {accountData.isDemo && (
        <p className="text-[10px] text-muted-foreground text-center mb-3 italic">Demo data — sign in for real balances</p>
      )}

      {/* Accounts */}
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Accounts</h2>
      <div className="space-y-1.5 mb-4">
        {accounts.map((a) => (
          <div key={a.label} className="flex items-center justify-between px-3 py-3 rounded-xl border border-border/40 bg-card">
            <div>
              <p className="text-sm font-medium">{a.label}</p>
              {a.trend && <p className="text-[10px] text-muted-foreground">{a.trend}</p>}
            </div>
            <p className="text-sm font-semibold">{a.balance}</p>
          </div>
        ))}
        {!isLoading && accounts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No accounts yet</p>
        )}
      </div>

      {/* Transactions */}
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Transactions</h2>
      <div className="space-y-1">
        {transactions.map((tx, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/20 bg-card/50">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${tx.type === "in" ? "bg-[hsl(var(--trust-safe))]/10" : "bg-destructive/10"}`}>
              {tx.type === "in" ? <ArrowDownLeft className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> : <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate">{tx.desc}</p>
              <p className="text-[10px] text-muted-foreground">{tx.time}</p>
            </div>
            <p className={`text-xs font-medium shrink-0 ${tx.type === "in" ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>{tx.amount}</p>
          </div>
        ))}
        {!isLoading && transactions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No transactions yet</p>
        )}
      </div>
    </MobileShell>
  );
};

export default MobileMoney;
