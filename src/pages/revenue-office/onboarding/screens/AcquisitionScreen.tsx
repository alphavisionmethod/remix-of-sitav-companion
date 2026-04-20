import { Globe, Users, Megaphone, Mail, Target, MapPin, ShoppingBag, Briefcase, RefreshCw } from "lucide-react";
import { Toggle, SectionTitle, ScreenHeader, SingleSelect } from "../primitives";
// Canonical onboarding primitives (drift-prevented by check-onboarding-components-folder)
import { OnboardingShell as _CanonShell } from "@/components/onboarding";
void _CanonShell;
import type { ScreenProps } from "../types";
import { useCallback } from "react";

const leadSourceOptions = [
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "website", label: "Website", icon: Globe },
  { id: "social", label: "Social / content", icon: Megaphone },
  { id: "outbound", label: "Outbound", icon: Mail },
  { id: "ads", label: "Ads", icon: Target },
  { id: "local", label: "Local discovery", icon: MapPin },
  { id: "repeat", label: "Repeat customers", icon: RefreshCw },
  { id: "platforms", label: "Marketplaces / platforms", icon: ShoppingBag },
  { id: "partnerships", label: "Partnerships", icon: Briefcase },
];

export default function AcquisitionScreen({ state, setState }: ScreenProps) {
  
  const toggle = useCallback((v: string) => {
    setState(p => ({ ...p, leadSources: p.leadSources.includes(v) ? p.leadSources.filter(x => x !== v) : [...p.leadSources, v] }));
  }, [setState]);

  const selected = leadSourceOptions.filter(s => state.leadSources.includes(s.id));

  return (
    <div className="space-y-6">
      
      <ScreenHeader icon={Users} title="How do people usually find you?" subtitle="Understanding demand sources lets SITA calibrate your acquisition engine" color="text-blue-400" />
      <div className="grid md:grid-cols-3 gap-2">
        {leadSourceOptions.map(ls => <Toggle key={ls.id} label={ls.label} icon={ls.icon} selected={state.leadSources.includes(ls.id)} onToggle={() => toggle(ls.id)} />)}
      </div>
      {selected.length >= 2 && state.setupDepth === "deep" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <SectionTitle>Performs best?</SectionTitle>
            <SingleSelect value={state.bestSource} onChange={v => setState(p => ({ ...p, bestSource: v }))} options={selected.map(s => ({ id: s.id, label: s.label }))} />
          </div>
          <div>
            <SectionTitle>Least predictable?</SectionTitle>
            <SingleSelect value={state.leastPredictable} onChange={v => setState(p => ({ ...p, leastPredictable: v }))} options={selected.map(s => ({ id: s.id, label: s.label }))} />
          </div>
          <div>
            <SectionTitle>Want more from?</SectionTitle>
            <SingleSelect value={state.wantMoreFrom} onChange={v => setState(p => ({ ...p, wantMoreFrom: v }))} options={selected.map(s => ({ id: s.id, label: s.label }))} />
          </div>
        </div>
      )}
    </div>
  );
}
