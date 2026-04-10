import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Rocket, Users, Target, FileText, Phone, Star, Search, Upload, RefreshCw, TrendingUp, Check } from "lucide-react";
import { ChapterBanner } from "../primitives";
import type { ScreenProps } from "../types";

const BASE_VALUES: Record<string, number> = {
  lead_followup: 8200, no_shows: 4800, reactivation: 3200, reviews: 2400, upsells: 5600,
};

export default function FirstWinScreen({ state, setState }: ScreenProps) {
  const wins = useMemo(() => {
    const leakMultiplier = state.growthBottlenecks.length > 3 ? 1.3 : 1;
    return [
      { id: "stale_leads", label: "Recover stale leads", desc: "Find and re-engage leads that went quiet", icon: Users,
        impact: `$${Math.round((BASE_VALUES.lead_followup || 8200) * leakMultiplier).toLocaleString()}/mo`, relevant: state.growthBottlenecks.includes("lead_followup") || state.leadSources.length > 0 },
      { id: "journey_twin", label: "Build Customer Journey Twin", desc: "Live model of how customers move through your business", icon: Target,
        impact: "Strategic clarity", relevant: !!state.journeyTemplate },
      { id: "quote_automation", label: "Create quote automation", desc: "Auto-generate proposals and follow up", icon: FileText,
        impact: `$${Math.round(4800 * leakMultiplier).toLocaleString()}/mo`, relevant: state.revenueSources.includes("proposals") },
      { id: "noshow_rescue", label: "Build no-show recovery", desc: "Rescue missed appointments with automated rebooking", icon: Phone,
        impact: `+${state.growthBottlenecks.includes("no_shows") ? "28" : "22"}% show rate`, relevant: state.growthBottlenecks.includes("no_shows") },
      { id: "review_workflow", label: "Launch review requests", desc: "Ask happy clients for reviews at the perfect moment", icon: Star,
        impact: `+${state.businessTypes.includes("local") ? "18" : "12"} reviews/mo`, relevant: state.postSaleSlips.includes("reviews") || state.businessTypes.includes("local") },
      { id: "leak_detection", label: "Find biggest revenue leak", desc: "Scan your journey for the #1 place money is lost", icon: Search,
        impact: `$${Math.round(15000 * leakMultiplier).toLocaleString()}/mo`, relevant: true },
      { id: "import_contacts", label: "Import and unify contacts", desc: "Bring contacts into a unified CRM", icon: Upload,
        impact: "Foundation", relevant: state.connectedSystems.length > 0 || state.importedFiles.length > 0 },
      { id: "reactivation", label: "Reactivation campaign", desc: "Re-engage past customers who went cold", icon: RefreshCw,
        impact: `$${Math.round((BASE_VALUES.reactivation || 3200) * leakMultiplier).toLocaleString()}/mo`, relevant: state.growthBottlenecks.includes("reactivation") },
      { id: "upsell", label: "Surface upsell opportunities", desc: "Find clients ready for additional services", icon: TrendingUp,
        impact: `$${Math.round((BASE_VALUES.upsells || 5600) * leakMultiplier).toLocaleString()}/mo`, relevant: state.postSaleSlips.includes("upsells") },
    ].sort((a, b) => (b.relevant ? 1 : 0) - (a.relevant ? 1 : 0));
  }, [state]);

  const toggleWin = (id: string) => {
    setState(p => {
      const arr = p.selectedFirstWins;
      if (arr.includes(id)) return { ...p, selectedFirstWins: arr.filter(v => v !== id) };
      if (arr.length >= 3) return p;
      return { ...p, selectedFirstWins: [...arr, id] };
    });
  };

  return (
    <div className="space-y-6">
      <ChapterBanner chapter="Chapter 7: Launch" subtitle="Choose what SITA should do for you right now" />
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-foreground">Your first wins</h2>
        <p className="text-sm text-muted-foreground mt-1">Select up to 3 — SITA will start working on these immediately</p>
      </div>
      <div className="space-y-2">
        {wins.map(fw => (
          <button key={fw.id} onClick={() => toggleWin(fw.id)}
            className={`w-full p-4 rounded-xl border text-left transition-all ${state.selectedFirstWins.includes(fw.id) ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/20"}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.selectedFirstWins.includes(fw.id) ? "bg-primary/20" : "bg-muted"}`}>
                <fw.icon className={`h-4 w-4 ${state.selectedFirstWins.includes(fw.id) ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{fw.label}</p>
                  {fw.relevant && <Badge className="bg-amber-500/10 text-amber-400 text-[8px]">Recommended</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{fw.desc}</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{fw.impact}</Badge>
              {state.selectedFirstWins.includes(fw.id) && <Check className="h-4 w-4 text-primary ml-1" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
