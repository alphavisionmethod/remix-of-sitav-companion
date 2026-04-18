// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Abuse Detection Service
// Mass-change detection, ransomware patterns, quarantine — real DB with demo fallback
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

export interface AbuseEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  severity: string;
  description: string;
  pattern_data: Record<string, unknown>;
  device_id: string | null;
  ip_address: string | null;
  action_taken: string;
  resolved: boolean;
  created_at: string;
}

export interface AbuseSummary {
  total_events: number;
  unresolved: number;
  critical: number;
  by_type: Record<string, number>;
}

class CloudAbuseService {
  private static instance: CloudAbuseService;
  static getInstance() {
    if (!this.instance) this.instance = new CloudAbuseService();
    return this.instance;
  }

  async getEvents(limit = 50): Promise<AbuseEvent[]> {
    try {
      const { data } = await fromTable("cloud_abuse_events").select("*").order("created_at", { ascending: false }).limit(limit);
      if (data?.length) return data;
    } catch {}
    return this.getDemoEvents();
  }

  async getSummary(): Promise<AbuseSummary> {
    const events = await this.getEvents(200);
    const unresolved = events.filter(e => !e.resolved);
    const critical = events.filter(e => e.severity === "critical");
    const byType: Record<string, number> = {};
    events.forEach(e => { byType[e.event_type] = (byType[e.event_type] || 0) + 1; });
    return { total_events: events.length, unresolved: unresolved.length, critical: critical.length, by_type: byType };
  }

  getDemoEvents(): AbuseEvent[] {
    return [
      { id: "ae1", user_id: "u1", event_type: "mass_deletion", severity: "high", description: "450 files deleted in 2 minutes", pattern_data: { count: 450, window_seconds: 120 }, device_id: null, ip_address: "203.0.113.42", action_taken: "rate_limited", resolved: false, created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: "ae2", user_id: "u2", event_type: "ransomware_pattern", severity: "critical", description: "Rapid file rewrites with encrypted extensions", pattern_data: { rewrite_count: 200, pattern: "*.encrypted" }, device_id: null, ip_address: "198.51.100.7", action_taken: "quarantine", resolved: true, created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: "ae3", user_id: null, event_type: "api_abuse", severity: "medium", description: "API rate limit exceeded from single IP", pattern_data: { requests_per_minute: 500 }, device_id: null, ip_address: "192.0.2.100", action_taken: "throttled", resolved: false, created_at: new Date(Date.now() - 7200000).toISOString() },
    ];
  }

  getSeverityColor(severity: string): string {
    const map: Record<string, string> = { low: "text-blue-400", medium: "text-amber-400", high: "text-orange-400", critical: "text-red-500" };
    return map[severity] || "text-muted-foreground";
  }

  getEventTypeLabel(type: string): string {
    const map: Record<string, string> = {
      mass_deletion: "Mass Deletion", ransomware_pattern: "Ransomware Pattern",
      api_abuse: "API Abuse", bot_upload: "Bot Upload", storage_exhaustion: "Storage Exhaustion",
      credential_stuffing: "Credential Stuffing", share_abuse: "Share Abuse", device_flood: "Device Flood",
    };
    return map[type] || type;
  }
}

export const cloudAbuseService = CloudAbuseService.getInstance();
