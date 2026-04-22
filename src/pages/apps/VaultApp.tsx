import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Lock, Plus, Search, Eye, EyeOff, Copy, Shield, AlertTriangle, Key, Globe, CreditCard, Server, Smartphone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVaultItems } from "@/hooks/use-apps-data";
import { DEMO_ENTRIES } from "@/data/seed/apps";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

interface VaultEntry {
  id: string;
  name: string;
  username: string;
  url: string;
  category: "login" | "card" | "note" | "api";
  lastUsed: string;
  strength: "strong" | "medium" | "weak";
  breached: boolean;
}

const categoryIcons: Record<string, React.ElementType> = { login: Globe, card: CreditCard, api: Server, note: Key };
const strengthColors: Record<string, string> = { strong: "text-emerald-500", medium: "text-amber-500", weak: "text-red-500" };

export default function VaultApp() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useVaultItems();
  const [search, setSearch] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const filtered = DEMO_ENTRIES.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()));
  const breachedCount = DEMO_ENTRIES.filter(e => e.breached).length;
  const weakCount = DEMO_ENTRIES.filter(e => e.strength === "weak").length;

  const toggleShow = (id: string) => setShowPasswords(p => ({ ...p, [id]: !p[id] }));
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard securely" });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
<div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Password Vault</h1>
        </div>
        <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Entry</Button>
      </div>

      {/* Security alerts */}
      {(breachedCount > 0 || weakCount > 0) && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <div className="text-sm">
              {breachedCount > 0 && <span className="text-red-500 font-medium">{breachedCount} breached credential{breachedCount > 1 ? "s" : ""}</span>}
              {breachedCount > 0 && weakCount > 0 && <span className="text-muted-foreground"> · </span>}
              {weakCount > 0 && <span className="text-amber-500 font-medium">{weakCount} weak password{weakCount > 1 ? "s" : ""}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{DEMO_ENTRIES.length}</p><p className="text-[10px] text-muted-foreground">Total Entries</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-500">{DEMO_ENTRIES.filter(e => e.strength === "strong").length}</p><p className="text-[10px] text-muted-foreground">Strong</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">256-bit</p><p className="text-[10px] text-muted-foreground">Encryption</p></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search vault..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {filtered.map(entry => {
          const Icon = categoryIcons[entry.category];
          return (
            <Card key={entry.id} className={entry.breached ? "border-red-500/30" : ""}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${entry.breached ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{entry.name}</span>
                    {entry.breached && <Badge variant="destructive" className="text-[9px] h-4">Breached</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{entry.username}</span>
                    <span className={`text-[10px] font-medium ${strengthColors[entry.strength]}`}>● {entry.strength}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleShow(entry.id)}>
                    {showPasswords[entry.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(entry.username)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
