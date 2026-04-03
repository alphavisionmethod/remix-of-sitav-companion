import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaPath?: string;
  onAction?: () => void;
}

export const EmptyStateCard = ({ icon: Icon, title, description, ctaLabel, ctaPath, onAction }: EmptyStateCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 px-6 py-12 text-center">
      <div className="rounded-xl bg-primary/8 p-3 mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      {ctaLabel && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 text-xs"
          onClick={() => {
            if (onAction) onAction();
            else if (ctaPath) navigate(ctaPath);
          }}
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  );
};
