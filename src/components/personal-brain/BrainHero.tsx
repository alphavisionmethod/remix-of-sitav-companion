import { Button } from "@/components/ui/button";
import { Brain, Mic, Plus, Radio, Settings, Wrench } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type BrainScope = "personal" | "business";

interface BrainHeroProps {
  greeting: string;
  scope: BrainScope;
  onScopeChange: (scope: BrainScope) => void;
  onNewChat: () => void;
  onVoice?: () => void;
  onSettings?: () => void;
  onTools?: () => void;
  sentinelOn?: boolean;
  onToggleSentinel?: () => void;
}

export function BrainHero({
  greeting,
  scope,
  onScopeChange,
  onNewChat,
  onVoice,
  onSettings,
  onTools,
  sentinelOn = false,
  onToggleSentinel,
}: BrainHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-card to-accent/10 p-5 shadow-xl shadow-primary/5 sm:p-7">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-primary/30 blur-3xl opacity-40 animate-pulse" style={{ animationDuration: "6s" }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-accent/20 blur-3xl opacity-30" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40 ring-1 ring-primary/40">
            <Brain className="h-6 w-6 text-primary-foreground" />
            <span className="absolute inset-0 rounded-2xl bg-primary/30 blur-md animate-pulse" style={{ animationDuration: "3s" }} aria-hidden />
          </div>
          <div className="animate-fade-in">
            <h1 className="bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-2xl font-bold leading-tight text-transparent sm:text-3xl">
              {greeting}
            </h1>
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
            className="rounded-lg border border-border/60 bg-background/60 p-0.5 backdrop-blur"
          >
            <ToggleGroupItem value="personal" className="h-8 px-3 text-xs">
              Personal
            </ToggleGroupItem>
            <ToggleGroupItem value="business" className="h-8 px-3 text-xs">
              Business
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm" onClick={onVoice} disabled={!onVoice} title="Open voice mode" className="backdrop-blur">
            <Mic className="h-4 w-4" />
            Voice
          </Button>
          {onTools && (
            <Button data-tour="brain-tools" variant="outline" size="sm" onClick={onTools} title="External tools" className="backdrop-blur">
              <Wrench className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Tools</span>
            </Button>
          )}
          {onSettings && (
            <Button variant="outline" size="sm" onClick={onSettings} title="Brain settings" className="backdrop-blur">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          )}
          <Button size="sm" onClick={onNewChat} className="bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03]">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>
    </div>
  );
}