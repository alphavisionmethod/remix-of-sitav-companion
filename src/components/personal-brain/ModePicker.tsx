import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRAIN_MODES, type BrainModeId } from "./BRAIN_MODES";

interface ModePickerProps {
  value: BrainModeId;
  onChange: (mode: BrainModeId) => void;
  variant?: "compact" | "grid";
  className?: string;
}

export function ModePicker({ value, onChange, variant = "compact", className }: ModePickerProps) {
  if (variant === "grid") {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-2", className)}>
        {BRAIN_MODES.map((m) => {
          const Icon = m.icon;
          const active = value === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                active
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-card hover:bg-accent/50",
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{m.label}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{m.short}</p>
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {BRAIN_MODES.map((m) => {
        const Icon = m.icon;
        const active = value === m.id;
        return (
          <Button
            key={m.id}
            variant={active ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(m.id)}
            className="h-8 gap-1.5 px-2.5"
            title={m.short}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{m.label}</span>
          </Button>
        );
      })}
    </div>
  );
}