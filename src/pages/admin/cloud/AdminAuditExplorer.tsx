import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Search, User, Clock } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";

interface AuditEntry {
  id: string;
  actor_user_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  plane: string;
  justification: string | null;
  severity: string;
  created_at: string;
  metadata: any;
}

const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function AdminAuditExplorer() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [planeFilter, setPlaneFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let query = fromTable("admin_action_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (planeFilter !== "all") query = query.eq("plane", planeFilter);
      if (severityFilter !== "all") query = query.eq("severity", severityFilter);

      const { data } = await query;
      setEntries(data || []);
      setLoading(false);
    };
    load();
  }, [planeFilter, severityFilter]);

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      e.action.toLowerCase().includes(s) ||
      e.actor_user_id.toLowerCase().includes(s) ||
      (e.justification || "").toLowerCase().includes(s) ||
      (e.target_type || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Admin Audit Explorer</h2>
        <Badge variant="outline" className="text-[10px]">{filtered.length} entries</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search actions, actors, justifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs bg-muted/30"
          />
        </div>
        <Select value={planeFilter} onValueChange={setPlaneFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Plane" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Planes</SelectItem>
            <SelectItem value="control">Control</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="shared-core">Shared Core</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entries */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="h-48 animate-pulse bg-muted/30 rounded-lg m-4" />
          ) : filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground p-6 text-center">No audit entries found</p>
          ) : (
            <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
              {filtered.map((entry) => (
                <div key={entry.id} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-foreground">{entry.action}</span>
                        <Badge variant="outline" className={`text-[9px] ${SEVERITY_COLORS[entry.severity] || ""}`}>
                          {entry.severity}
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">{entry.plane}</Badge>
                      </div>
                      {entry.justification && (
                        <p className="text-[11px] text-muted-foreground truncate">{entry.justification}</p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                        {entry.target_type && (
                          <span>Target: {entry.target_type}{entry.target_id ? ` #${entry.target_id.slice(0, 8)}` : ""}</span>
                        )}
                        <span className="truncate">Actor: {entry.actor_user_id.slice(0, 8)}…</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
