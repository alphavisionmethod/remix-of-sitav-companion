import { Check, ArrowRight, Clock, Ban, Star, FileText, Calendar, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  onAccept: () => void;
  onRoute: (dest: string) => void;
  onReject: () => void;
  onSnooze: () => void;
  onFlag: () => void;
  visible?: boolean;
  className?: string;
}

const ActionBtn = ({ icon: Icon, label, onClick, variant = "default" }: {
  icon: typeof Check; label: string; onClick: () => void;
  variant?: "default" | "success" | "danger" | "accent" | "gold";
}) => {
  const colors = {
    default: "hover:bg-secondary/80 text-muted-foreground hover:text-foreground",
    success: "hover:bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
    danger: "hover:bg-destructive/10 text-destructive",
    accent: "hover:bg-accent/10 text-accent",
    gold: "hover:bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]",
  };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all",
        colors[variant]
      )}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export const LeadQuickActions = ({ onAccept, onRoute, onReject, onSnooze, onFlag, visible, className }: QuickActionProps) => (
  <div className={cn(
    "flex items-center gap-0.5 transition-opacity duration-200",
    visible ? "opacity-100" : "opacity-0 group-hover:opacity-100",
    className
  )}>
    <ActionBtn icon={Check} label="Accept" onClick={onAccept} variant="success" />
    <ActionBtn icon={Calendar} label="Consult" onClick={() => onRoute("consult")} variant="accent" />
    <ActionBtn icon={FileText} label="Quote" onClick={() => onRoute("quote")} variant="default" />
    <ActionBtn icon={Clock} label="Snooze" onClick={onSnooze} variant="default" />
    <ActionBtn icon={Star} label="Flag" onClick={onFlag} variant="gold" />
    <ActionBtn icon={Ban} label="Reject" onClick={onReject} variant="danger" />
  </div>
);
