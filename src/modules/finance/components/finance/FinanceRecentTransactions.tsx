import { ShoppingCart, Utensils, Zap, Briefcase, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TRANSACTIONS = [
  { id: 1, name: "Grocery Store", category: "Shopping", icon: ShoppingCart, iconColor: "bg-emerald-500/20 text-emerald-400", amount: -124.50, date: "Today", status: "success" },
  { id: 2, name: "Restaurant Luna", category: "Dining", icon: Utensils, iconColor: "bg-amber-500/20 text-amber-400", amount: -68.00, date: "Today", status: "success" },
  { id: 3, name: "Electric Bill", category: "Utilities", icon: Zap, iconColor: "bg-cyan-500/20 text-cyan-400", amount: -142.30, date: "Yesterday", status: "pending" },
  { id: 4, name: "Client Payment", category: "Income", icon: Briefcase, iconColor: "bg-violet-500/20 text-violet-400", amount: 4800.00, date: "Yesterday", status: "success" },
  { id: 5, name: "Subscription Renew", category: "Services", icon: CreditCard, iconColor: "bg-rose-500/20 text-rose-400", amount: -14.99, date: "2 days ago", status: "failed" },
];

const statusStyles: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  failed: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

export function FinanceRecentTransactions() {
  return (
    <div className="rounded-2xl p-5 card-vibrant card-vibrant-cyan">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-foreground">Recent Transactions</p>
        <button className="text-[11px] text-trust-safe hover:text-trust-verified transition-colors">View all</button>
      </div>

      <div className="space-y-1">
        {TRANSACTIONS.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.iconColor}`}>
              <tx.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground/90 font-medium truncate">{tx.name}</p>
              <p className="text-[10px] text-muted-foreground">{tx.category} · {tx.date}</p>
            </div>
            <p className={`text-sm font-semibold tabular-nums ${tx.amount > 0 ? "text-trust-safe" : "text-foreground/70"}`}>
              {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
            </p>
            <Badge className={`text-[9px] px-1.5 py-0 h-4 ${statusStyles[tx.status]}`}>
              {tx.status === "success" ? "Done" : tx.status === "pending" ? "Pending" : "Failed"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
