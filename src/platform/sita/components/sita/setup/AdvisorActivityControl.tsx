import { cn } from "@/lib/utils";

const LEVELS = [
  { key: "quiet", label: "Quiet", desc: "Background only" },
  { key: "normal", label: "Normal", desc: "Standard alerts" },
  { key: "active", label: "Active", desc: "Proactive insights" },
] as const;

interface AdvisorActivityControlProps {
  value: string;
  onChange: (level: string) => void;
  compact?: boolean;
}

export function AdvisorActivityControl({ value, onChange, compact }: AdvisorActivityControlProps) {
  return (
    <div className={cn("flex gap-1", compact ? "gap-0.5" : "gap-1")}>
      {LEVELS.map(l => (
        <button key={l.key} onClick={() => onChange(l.key)}
          className={cn(
            "rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all border",
            value === l.key ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/20"
          )}
          title={l.desc}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
