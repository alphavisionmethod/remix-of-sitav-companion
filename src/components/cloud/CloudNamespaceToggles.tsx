import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Radio, Lock, Database, Search, Download, Shield } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NamespaceEntry {
  id: string;
  namespace: string;
  display_name: string;
  encryption_class: string;
  retention_class: string;
  conflict_strategy: string;
  searchable: boolean;
  exportable: boolean;
  status: string;
}

const ENCRYPTION_COLORS: Record<string, string> = {
  standard: "text-muted-foreground",
  "encrypted-at-rest": "text-blue-400",
  e2ee: "text-emerald-400",
  "device-bound": "text-amber-400",
};

export function CloudNamespaceToggles() {
  const [namespaces, setNamespaces] = useState<NamespaceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fromTable("cloud_namespace_registry")
      .select("*")
      .order("created_at")
      .then(({ data }: any) => {
        setNamespaces(data?.length ? data : getDemoNamespaces());
        setLoading(false);
      })
      .catch(() => { setNamespaces(getDemoNamespaces()); setLoading(false); });
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" /> Sync Namespace Governance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground mb-3">
          Control encryption, retention, and sync behavior per namespace
        </p>
        {namespaces.map(ns => (
          <div key={ns.id} className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{ns.display_name}</p>
              </div>
              <Badge variant={ns.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{ns.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={cn("text-xs", ENCRYPTION_COLORS[ns.encryption_class] || "text-muted-foreground")}>
                <Lock className="h-3 w-3 mr-1" /> {ns.encryption_class}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" /> {ns.retention_class}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {ns.conflict_strategy}
              </Badge>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Search className="h-3 w-3" /> Searchable
                <Switch checked={ns.searchable} onCheckedChange={() => toast.info(`Toggled searchable for ${ns.display_name}`)} />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Download className="h-3 w-3" /> Exportable
                <Switch checked={ns.exportable} onCheckedChange={() => toast.info(`Toggled exportable for ${ns.display_name}`)} />
              </label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function getDemoNamespaces(): NamespaceEntry[] {
  return [
    { id: "ns1", namespace: "files.documents", display_name: "Documents", encryption_class: "encrypted-at-rest", retention_class: "standard", conflict_strategy: "last-write-wins", searchable: true, exportable: true, status: "active" },
    { id: "ns2", namespace: "files.photos", display_name: "Photos & Media", encryption_class: "standard", retention_class: "extended", conflict_strategy: "keep-both", searchable: true, exportable: true, status: "active" },
    { id: "ns3", namespace: "settings.preferences", display_name: "Settings & Preferences", encryption_class: "e2ee", retention_class: "default", conflict_strategy: "last-write-wins", searchable: false, exportable: true, status: "active" },
    { id: "ns4", namespace: "session.continuity", display_name: "Session Continuity", encryption_class: "device-bound", retention_class: "ephemeral", conflict_strategy: "device-priority", searchable: false, exportable: false, status: "active" },
    { id: "ns5", namespace: "vault.credentials", display_name: "Secure Vault", encryption_class: "e2ee", retention_class: "permanent", conflict_strategy: "manual-resolve", searchable: false, exportable: false, status: "active" },
  ];
}
