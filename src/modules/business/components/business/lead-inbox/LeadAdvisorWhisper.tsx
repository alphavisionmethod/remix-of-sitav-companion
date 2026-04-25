import { Sparkles } from "lucide-react";

export const LeadAdvisorWhisper = ({ suggestion }: { suggestion?: string | null }) => {
  if (!suggestion) return null;
  return (
    <div className="flex items-start gap-1.5 mt-1.5">
      <Sparkles className="h-3 w-3 text-accent shrink-0 mt-0.5" />
      <p className="text-[11px] text-accent/80 leading-tight line-clamp-2">{suggestion}</p>
    </div>
  );
};
