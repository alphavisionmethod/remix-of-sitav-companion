import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface ContextDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources?: Record<string, unknown> | null;
}

function asArray(v: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(v)) return v as Array<Record<string, unknown>>;
  return [];
}

export function ContextDrawer({ open, onOpenChange, sources }: ContextDrawerProps) {
  const memories = asArray(sources?.memories_used);
  const goals = asArray(sources?.goals_used);
  const advisorFacts = asArray(sources?.advisor_facts);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Context used in this reply</SheetTitle>
          <SheetDescription>
            What memory, goals, and advisor facts informed the Brain's answer.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-5">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Memories
              </h3>
              <Badge variant="outline" className="text-[10px]">
                {memories.length}
              </Badge>
            </div>
            {memories.length === 0 ? (
              <p className="text-xs text-muted-foreground">No memory drawn for this reply.</p>
            ) : (
              <ul className="space-y-2">
                {memories.map((m, i) => (
                  <li key={i} className="rounded-md border border-border bg-card/50 p-2.5">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {String(m.category ?? "general")}
                    </Badge>
                    <p className="mt-1.5 text-xs text-foreground">{String(m.content ?? "")}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Active goals
              </h3>
              <Badge variant="outline" className="text-[10px]">
                {goals.length}
              </Badge>
            </div>
            {goals.length === 0 ? (
              <p className="text-xs text-muted-foreground">No goals referenced.</p>
            ) : (
              <ul className="space-y-1.5 text-xs text-foreground">
                {goals.map((g, i) => (
                  <li key={i}>• {String(g.title ?? "")}</li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Advisor facts
              </h3>
              <Badge variant="outline" className="text-[10px]">
                {advisorFacts.length}
              </Badge>
            </div>
            {advisorFacts.length === 0 ? (
              <p className="text-xs text-muted-foreground">None drawn.</p>
            ) : (
              <ul className="space-y-1.5 text-xs text-foreground">
                {advisorFacts.map((f, i) => (
                  <li key={i}>• {String(f.content ?? "")}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}