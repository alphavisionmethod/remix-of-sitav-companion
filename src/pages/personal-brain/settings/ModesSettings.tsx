import { Card, CardContent } from "@/components/ui/card";
import { BRAIN_MODES } from "@/components/personal-brain/BRAIN_MODES";
import { Badge } from "@/components/ui/badge";

export default function ModesSettings() {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Modes & Behavior</h2>
          <p className="text-xs text-muted-foreground">Per-mode defaults that shape every reply.</p>
        </div>
        <div className="space-y-2">
          {BRAIN_MODES.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
                <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-4 w-4 text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><p className="text-sm font-medium capitalize">{m.label}</p><Badge variant="outline" className="text-[10px]">{m.behavior.verbosity}</Badge></div>
                  <p className="text-xs text-muted-foreground">{m.short}</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-1">Tone: {m.behavior.tone} · Memory: {m.behavior.memoryWeight} · Voice: {m.behavior.voiceFriendly ? "yes" : "no"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
