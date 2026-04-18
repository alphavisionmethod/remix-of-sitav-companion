import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Headset, Search, Wrench, Eye, Clock, CheckCircle } from "lucide-react";
import { cloudSupportService } from "@/platform/cloud/cloud-support-service";
import type { SupportSession } from "@/platform/cloud/cloud-support-service";
import { toast } from "sonner";

export function CloudSupportConsole() {
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cloudSupportService.getSessions().then(s => { setSessions(s); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Headset className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support Console</h1>
            <p className="text-sm text-muted-foreground">User lookup, sync trace, safe repair workflows</p>
          </div>
        </div>
        <Button size="sm" onClick={() => toast.info("New support session started")} className="gap-1.5">
          <Headset className="h-3.5 w-3.5" /> New Session
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Active Sessions", value: sessions.filter(s => s.status === "active").length, icon: Clock },
          { label: "Resolved", value: sessions.filter(s => s.status === "resolved").length, icon: CheckCircle },
          { label: "Total", value: sessions.length, icon: Headset },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Lookup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> User / Device Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by user ID, email, or device..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.info("Running diagnostic bundle...")}>
              <Wrench className="h-3.5 w-3.5 mr-1.5" /> Run Diagnostics
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.info("Viewing sync trace...")}>
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Sync Trace
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Headset className="h-4 w-4 text-primary" /> Support Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions Taken</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm font-mono">{s.target_user_id.slice(0, 8)}...</TableCell>
                  <TableCell className="text-sm">{s.reason}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{s.actions_taken.length} actions</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
