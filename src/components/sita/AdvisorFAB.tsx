import { MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const AdvisorFAB = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={cn(
      "fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
      "hover:scale-110 hover:shadow-xl",
      isOpen
        ? "bg-muted text-muted-foreground hover:bg-muted/80"
        : "bg-primary text-primary-foreground hover:bg-primary/90"
    )}
    title={isOpen ? "Close Advisor" : "Ask SITA"}
  >
    {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
    {!isOpen && (
      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
    )}
  </button>
);
