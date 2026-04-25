import { Link2, Upload, FileText, Globe, ArrowRight } from "lucide-react";
import { Toggle, ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";
import { useCallback } from "react";

const paths = [
  { id: "connect", label: "Connect live tools", desc: "CRM, calendar, email, booking, payments, store", icon: Link2 },
  { id: "import", label: "Import files", desc: "CSV contacts, leads, products, pipeline sheets", icon: Upload },
  { id: "artifacts", label: "Upload business materials", desc: "Price sheets, SOPs, proposals, call scripts", icon: FileText },
  { id: "urls", label: "Paste website / page URLs", desc: "SITA inspects structure to infer your model", icon: Globe },
];

export default function IntakeHubScreen({ state, setState }: ScreenProps) {
  
  const toggle = useCallback((v: string) => {
    setState(p => ({ ...p, intakePaths: p.intakePaths.includes(v) ? p.intakePaths.filter(x => x !== v) : [...p.intakePaths, v] }));
  }, [setState]);

  return (
    <div className="space-y-6">
      
      <ScreenHeader icon={Link2} title="Bring in what your business already uses" subtitle="SITA adapts to your existing world instead of replacing it" color="text-blue-400" />
      <div className="grid md:grid-cols-2 gap-3">
        {paths.map(p => <Toggle key={p.id} label={p.label} desc={p.desc} icon={p.icon} selected={state.intakePaths.includes(p.id)} onToggle={() => toggle(p.id)} />)}
      </div>
      {state.intakePaths.length === 0 && (
        <button onClick={() => setState(p => ({ ...p, intakePaths: ["skip"] }))}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto">
          Skip for now <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
