import { Upload, Check, Users, FileText, ShoppingCart, Calendar, Star, BarChart3, Target, DollarSign, Megaphone } from "lucide-react";
import { ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";
import { useCallback } from "react";

const importTypes = [
  { id: "contacts", label: "Contacts CSV", icon: Users },
  { id: "leads", label: "Leads CSV", icon: Target },
  { id: "customers", label: "Customers CSV", icon: Users },
  { id: "bookings", label: "Bookings export", icon: Calendar },
  { id: "proposals", label: "Proposals / quotes", icon: FileText },
  { id: "reviews", label: "Reviews export", icon: Star },
  { id: "products", label: "Products / offers", icon: ShoppingCart },
  { id: "campaigns", label: "Campaign lists", icon: Megaphone },
  { id: "pipeline", label: "Pipeline spreadsheet", icon: BarChart3 },
  { id: "transactions", label: "Transaction records", icon: DollarSign },
];

export default function FileImportScreen({ state, setState }: ScreenProps) {
  
  const toggle = useCallback((v: string) => {
    setState(p => ({ ...p, importedFiles: p.importedFiles.includes(v) ? p.importedFiles.filter(x => x !== v) : [...p.importedFiles, v] }));
  }, [setState]);

  return (
    <div className="space-y-6">
      
      <ScreenHeader icon={Upload} title="Import your business data" subtitle="Select file types you have — mapping and deduplication happen automatically" color="text-emerald-400" />
      <div className="grid md:grid-cols-2 gap-2">
        {importTypes.map(t => (
          <button key={t.id} onClick={() => toggle(t.id)}
            className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${state.importedFiles.includes(t.id) ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/20"}`}>
            <div className={`p-2 rounded-lg ${state.importedFiles.includes(t.id) ? "bg-primary/20" : "bg-muted"}`}>
              <t.icon className={`h-4 w-4 ${state.importedFiles.includes(t.id) ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <span className="text-sm font-medium text-foreground flex-1">{t.label}</span>
            {state.importedFiles.includes(t.id) && <Check className="h-4 w-4 text-primary" />}
            <div className="px-2 py-1 rounded-md bg-muted text-[9px] text-muted-foreground">Drop file</div>
          </button>
        ))}
      </div>
      {state.importedFiles.length > 0 && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">{state.importedFiles.length} import type{state.importedFiles.length !== 1 ? "s" : ""} selected</p>
          <p>SITA will auto-map fields, detect duplicates, identify lifecycle stages, and flag missing critical data during reconciliation.</p>
        </div>
      )}
    </div>
  );
}
