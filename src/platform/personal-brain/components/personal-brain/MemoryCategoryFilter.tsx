import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MEMORY_CATEGORIES, type PbMemoryCategory } from "./hooks/usePbMemories";

interface Props {
  value: PbMemoryCategory | "all";
  onChange: (v: PbMemoryCategory | "all") => void;
  counts?: Partial<Record<PbMemoryCategory | "all", number>>;
}

export function MemoryCategoryFilter({ value, onChange, counts }: Props) {
  const items: { id: PbMemoryCategory | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...MEMORY_CATEGORIES,
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const active = value === item.id;
        const count = counts?.[item.id];
        return (
          <Button
            key={item.id}
            variant={active ? "default" : "outline"}
            size="sm"
            className={cn("h-7 rounded-full px-3 text-[11px]", !active && "bg-background")}
            onClick={() => onChange(item.id)}
          >
            {item.label}
            {typeof count === "number" && count > 0 && (
              <span className="ml-1.5 text-[10px] opacity-70">{count}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
