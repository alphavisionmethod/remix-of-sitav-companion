import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { BUSINESS_ADVISOR_LIST } from "@/lib/ai-platform/runtime";

export default function MobileBusinessAdvisors() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="px-4 pt-6 pb-3">
        <h1 className="text-xl font-semibold">Business Advisors</h1>
        <p className="text-xs text-muted-foreground mt-1">Nine specialised advisors. Tap to consult.</p>
      </header>
      <div className="divide-y divide-border border-y border-border">
        {BUSINESS_ADVISOR_LIST.map((a) => (
          <Link
            key={a.id}
            to={`/mobile/business-advisors/${a.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 active:bg-accent"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{a.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{a.tagline}</p>
              <div className="flex gap-1.5 mt-1.5">
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">{a.authority}</Badge>
                <Badge
                  variant={a.sensitive ? "destructive" : "secondary"}
                  className="text-[10px] h-4 px-1.5"
                >
                  {a.riskTier}
                </Badge>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}