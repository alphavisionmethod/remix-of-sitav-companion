import { cn } from "@/lib/utils";
import { BookOpen, Code2 } from "lucide-react";
import { useExplainSimply } from "./ExplainSimplyProvider";

interface ExplainSimplyToggleProps {
  className?: string;
}

export function ExplainSimplyToggle({ className }: ExplainSimplyToggleProps) {
  const { isSimple, toggle } = useExplainSimply();

  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border",
        isSimple
          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
          : "bg-muted/20 text-muted-foreground border-border/20 hover:bg-muted/30",
        className
      )}
      title={isSimple ? "Switch to technical view" : "Switch to simple view"}
    >
      {isSimple ? (
        <>
          <BookOpen className="h-3 w-3" />
          Simple View
        </>
      ) : (
        <>
          <Code2 className="h-3 w-3" />
          Technical View
        </>
      )}
    </button>
  );
}
