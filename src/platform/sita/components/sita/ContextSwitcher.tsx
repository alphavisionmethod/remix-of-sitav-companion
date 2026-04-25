// ═══════════════════════════════════════════════════════════════
// SITA OS — Context Switcher (Top Bar dropdown)
// ═══════════════════════════════════════════════════════════════

import { useEntityContext } from "@/contexts/EntityContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const ContextSwitcher = () => {
  const { current, entities, switchEntity } = useEntityContext();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors hover:bg-secondary/60 border border-border/30">
          <span className="text-sm">{current.icon}</span>
          <span className="text-muted-foreground hidden sm:inline">{current.name}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start" sideOffset={8}>
        <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
          Switch Context
        </p>
        <div className="space-y-0.5">
          {entities.map(e => (
            <button
              key={e.id}
              onClick={() => { switchEntity(e.id); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                current.id === e.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-secondary/60 text-foreground"
              )}
            >
              <span className="text-base shrink-0">{e.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium">{e.name}</p>
                {e.members && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Users className="h-2.5 w-2.5" /> {e.members} members
                  </p>
                )}
              </div>
              {current.id === e.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
