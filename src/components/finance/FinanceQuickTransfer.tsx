import { useState } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RECIPIENTS = [
  { name: "Alice M.", initials: "AM", color: "bg-violet-500/30 text-violet-300" },
  { name: "Jake R.", initials: "JR", color: "bg-emerald-500/30 text-emerald-300" },
  { name: "Nina K.", initials: "NK", color: "bg-amber-500/30 text-amber-300" },
  { name: "Omar T.", initials: "OT", color: "bg-cyan-500/30 text-cyan-300" },
];

export function FinanceQuickTransfer() {
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState(0);

  return (
    <div className="rounded-2xl p-5 bg-[#12121e] border border-[#1a1a2e] space-y-4">
      <p className="text-sm font-semibold text-white/80">Quick Transfer</p>

      {/* Account type */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-white/40">Account:</span>
        <select className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white/70 outline-none">
          <option>Debit ••4285</option>
          <option>Credit ••7812</option>
        </select>
      </div>

      {/* Recipients */}
      <div className="flex gap-2">
        {RECIPIENTS.map((r, i) => (
          <button
            key={r.name}
            onClick={() => setSelected(i)}
            className={`flex flex-col items-center gap-1 transition-transform ${
              selected === i ? "scale-110" : "opacity-60 hover:opacity-80"
            }`}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className={`text-[11px] font-semibold ${r.color}`}>
                {r.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-[9px] text-white/50">{r.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="pl-7 bg-white/[0.04] border-white/10 text-white placeholder:text-white/20"
        />
      </div>

      <Button className="w-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0">
        <Send className="h-4 w-4 mr-2" />
        Send Money
      </Button>
    </div>
  );
}
