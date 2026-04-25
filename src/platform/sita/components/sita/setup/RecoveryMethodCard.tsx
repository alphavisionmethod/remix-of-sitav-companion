import { Key, Mail, Smartphone, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const METHODS = [
  { key: "email", icon: Mail, title: "Recovery Email", desc: "Send recovery link to your email" },
  { key: "phone", icon: Smartphone, title: "Phone Number", desc: "SMS or call for account recovery" },
  { key: "recovery-key", icon: Key, title: "Recovery Key", desc: "Download an encrypted recovery key" },
];

interface RecoveryMethodCardProps {
  selected: string;
  onSelect: (method: string) => void;
}

export function RecoveryMethodCard({ selected, onSelect }: RecoveryMethodCardProps) {
  return (
    <div className="space-y-2">
      {METHODS.map(m => (
        <button key={m.key} onClick={() => onSelect(m.key)}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
            selected === m.key ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20"
          )}>
          <m.icon className={cn("h-4 w-4", selected === m.key ? "text-primary" : "text-muted-foreground")} />
          <div className="flex-1">
            <p className="text-xs font-semibold text-foreground">{m.title}</p>
            <p className="text-[11px] text-muted-foreground">{m.desc}</p>
          </div>
          {selected === m.key && <Check className="h-4 w-4 text-primary" />}
        </button>
      ))}
    </div>
  );
}
