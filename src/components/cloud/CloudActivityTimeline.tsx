import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload, Download, FolderEdit, Share2, Trash2, RotateCcw, Smartphone,
  AlertTriangle, CheckCircle, Clock, File
} from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ActivityEvent {
  id: string;
  event_type: string;
  object_name: string | null;
  device_name: string | null;
  created_at: string;
  details: Record<string, unknown>;
}

const EVENT_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  upload: { icon: Upload, label: "Uploaded", color: "text-emerald-400" },
  download: { icon: Download, label: "Downloaded", color: "text-blue-400" },
  rename: { icon: FolderEdit, label: "Renamed", color: "text-amber-400" },
  move: { icon: FolderEdit, label: "Moved", color: "text-amber-400" },
  share: { icon: Share2, label: "Shared", color: "text-purple-400" },
  delete: { icon: Trash2, label: "Deleted", color: "text-red-400" },
  restore: { icon: RotateCcw, label: "Restored", color: "text-emerald-400" },
  version_restore: { icon: RotateCcw, label: "Version Restored", color: "text-cyan-400" },
  sync: { icon: CheckCircle, label: "Synced", color: "text-emerald-400" },
  conflict: { icon: AlertTriangle, label: "Conflict", color: "text-amber-400" },
  device_added: { icon: Smartphone, label: "Device Added", color: "text-blue-400" },
  device_removed: { icon: Smartphone, label: "Device Removed", color: "text-red-400" },
};

export function CloudActivityTimeline() {
  const { user, isDemo } = useAuth();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !isDemo) { setLoading(false); return; }

    if (isDemo) {
      setEvents(getDemoEvents());
      setLoading(false);
      return;
    }

    fromTable("cloud_activity_journal")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }: any) => {
        setEvents(data?.length ? data : getDemoEvents());
        setLoading(false);
      })
      .catch(() => { setEvents(getDemoEvents()); setLoading(false); });
  }, [user, isDemo]);

  const groupByDate = (events: ActivityEvent[]) => {
    const groups: Record<string, ActivityEvent[]> = {};
    events.forEach(e => {
      const date = new Date(e.created_at).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    });
    return groups;
  };

  const grouped = groupByDate(events);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped).map(([date, evts]) => (
          <div key={date}>
            <p className="text-xs font-medium text-muted-foreground mb-2">{date}</p>
            <div className="space-y-1">
              {evts.map(e => {
                const cfg = EVENT_CONFIG[e.event_type] || { icon: File, label: e.event_type, color: "text-muted-foreground" };
                const Icon = cfg.icon;
                return (
                  <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <Icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        <span className={cn("font-medium", cfg.color)}>{cfg.label}</span>
                        {e.object_name && <span className="text-foreground"> {e.object_name}</span>}
                      </p>
                      {e.device_name && (
                        <p className="text-xs text-muted-foreground">from {e.device_name}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {events.length === 0 && !loading && (
          <p className="text-center text-sm text-muted-foreground py-6">No activity yet</p>
        )}
      </CardContent>
    </Card>
  );
}

function getDemoEvents(): ActivityEvent[] {
  const now = Date.now();
  return [
    { id: "a1", event_type: "upload", object_name: "Q4-Report.pdf", device_name: "MacBook Pro", created_at: new Date(now - 300000).toISOString(), details: {} },
    { id: "a2", event_type: "sync", object_name: "Settings", device_name: "iPhone 15", created_at: new Date(now - 600000).toISOString(), details: {} },
    { id: "a3", event_type: "share", object_name: "Design-Assets/", device_name: null, created_at: new Date(now - 1800000).toISOString(), details: {} },
    { id: "a4", event_type: "rename", object_name: "old-name.txt → new-name.txt", device_name: "MacBook Pro", created_at: new Date(now - 3600000).toISOString(), details: {} },
    { id: "a5", event_type: "download", object_name: "logo.svg", device_name: "iPad Pro", created_at: new Date(now - 7200000).toISOString(), details: {} },
    { id: "a6", event_type: "delete", object_name: "temp-file.tmp", device_name: "MacBook Pro", created_at: new Date(now - 86400000).toISOString(), details: {} },
    { id: "a7", event_type: "restore", object_name: "important-doc.docx", device_name: null, created_at: new Date(now - 86400000 - 3600000).toISOString(), details: {} },
    { id: "a8", event_type: "conflict", object_name: "shared-notes.md", device_name: "iPhone 15", created_at: new Date(now - 172800000).toISOString(), details: {} },
  ];
}
