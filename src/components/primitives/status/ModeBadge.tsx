import { StatusBadge, type StatusSize } from "./StatusBadge";

/**
 * ModeBadge — canonical mode indicator (Demo / Live / Sandbox).
 * Class: PRIMITIVE.
 */
export type Mode = "demo" | "live" | "sandbox" | "preview";

const MODE_TONES: Record<Mode, "info" | "success" | "warning" | "muted"> = {
  demo:    "warning",
  live:    "success",
  sandbox: "info",
  preview: "muted",
};

const MODE_LABELS: Record<Mode, string> = {
  demo:    "Demo",
  live:    "Live",
  sandbox: "Sandbox",
  preview: "Preview",
};

export interface ModeBadgeProps {
  mode: Mode;
  size?: StatusSize;
  className?: string;
}

export function ModeBadge({ mode, size = "sm", className }: ModeBadgeProps) {
  return (
    <StatusBadge tone={MODE_TONES[mode]} size={size} dot className={className}>
      {MODE_LABELS[mode]}
    </StatusBadge>
  );
}
