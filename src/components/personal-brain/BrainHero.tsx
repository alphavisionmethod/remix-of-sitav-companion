import { Button } from "@/components/ui/button";
import { Brain, Mic, Plus, Settings } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type BrainScope = "personal" | "business";

interface BrainHeroProps {
  greeting: string;
  scope: BrainScope;
  onScopeChange: (scope: BrainScope) => void;
  onNewChat: () => void;
  onVoice?: () => void;
  onSettings?: () => void;
}

export function BrainHero({
  greeting,
  scope,
  onScopeChange,
  onNewChat,
  onVoice,
  onSettings,
}: BrainHeroProps) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{greeting}</h1>
            <p className="text-sm text-muted-foreground">
              Your adaptive Brain — for thinking, learning, building, and creating.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            value={scope}
            onValueChange={(v) => v && onScopeChange(v as BrainScope)}
            className="rounded-lg border border-border bg-card p-0.5"
          >
            <ToggleGroupItem value="personal" className="h-8 px-3 text-xs">
              Personal
            </ToggleGroupItem>
            <ToggleGroupItem value="business" className="h-8 px-3 text-xs">
              Business
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm" onClick={onVoice} disabled={!onVoice} title="Open voice mode">
            <Mic className="h-4 w-4" />
            Voice
          </Button>
          {onSettings && (
            <Button variant="outline" size="sm" onClick={onSettings} title="Brain settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          )}
          <Button size="sm" onClick={onNewChat}>
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>
    </div>
  );
}