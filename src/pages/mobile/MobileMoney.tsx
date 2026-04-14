import { MobileShell } from "@/components/mobile/MobileShell";
import { Wallet, PiggyBank, CreditCard, TrendingDown, ArrowRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const accounts = [
  { label: "Operating", balance: "$24,300", trend: "+$3,200 this month" },
  { label: "Reserves", balance: "$18,500", trend: "Target: $25,000" },
  { label: "Tax Set-Aside", balance: "$6,200", trend: "Next due: Apr 15" },
];

const recentTx = [
  { desc: "Client Payment — Acme Corp", amount: "+$4,800", type: "in", time: "Today" },
  { desc: "Software Subscription", amount: "-$199", type: "out", time: "Today" },
  { desc: "Reserve Auto-Contribution", amount: "-$500", type: "out", time: "Yesterday" },
  { desc: "Freelancer Payment", amount: "-$1,200", type: "out", time: "Yesterday" },
  { desc: "Invoice #1037 Paid", amount: "+$2,100", type: "in", time: "2 days ago" },
];

const MobileMoney = () => {
  return (
    <MobileShell title="Money">
      {/* Safe to spend */}
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Safe to Spend</p>
        <p className="text-3xl font-bold text-primary">$8,240</p>
        <p className="text-xs text-muted-foreground mt-1">After reserves, taxes & obligations</p>
      </div>

      {/* Accounts */}
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Accounts</h2>
      <div className="space-y-1.5 mb-4">
        {accounts.map((a) => (
          <div key={a.label} className="flex items-center justify-between px-3 py-3 rounded-xl border border-border/40 bg-card">
            <div>
              <p className="text-sm font-medium">{a.label}</p>
              <p className="text-[10px] text-muted-foreground">{a.trend}</p>
            </div>
            <p className="text-sm font-semibold">{a.balance}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Transactions</h2>
      <div className="space-y-1">
        {recentTx.map((tx, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/20 bg-card/50">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${tx.type === "in" ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {tx.type === "in" ? <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" /> : <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate">{tx.desc}</p>
              <p className="text-[10px] text-muted-foreground">{tx.time}</p>
            </div>
            <p className={`text-xs font-medium shrink-0 ${tx.type === "in" ? "text-green-500" : "text-red-500"}`}>{tx.amount}</p>
          </div>
        ))}
      </div>
    </MobileShell>
  );
};

export default MobileMoney;
