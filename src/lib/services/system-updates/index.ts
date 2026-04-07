// ═══════════════════════════════════════════════════════════════
// SITA OS — Client System Update Service
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";

export interface UpdateRelease {
  id: string;
  version: string;
  channel: string;
  release_notes: string | null;
  download_url: string | null;
  checksum_sha256: string | null;
  size_bytes: number | null;
  is_critical: boolean;
  created_at: string;
}

export interface UpdateDevice {
  id: string;
  device_id: string;
  hostname: string | null;
  current_version: string;
  channel: string;
  hardware_profile: Record<string, unknown>;
  auto_update_enabled: boolean;
  last_check_at: string | null;
  last_update_at: string | null;
}

export interface UpdateLogEntry {
  id: string;
  from_version: string | null;
  to_version: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
}

const APP_VERSION = '1.0.0';

function getDeviceId(): string {
  let id = localStorage.getItem('sita-device-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sita-device-id', id);
  }
  return id;
}

export const SystemUpdateService = {
  async checkForUpdates(channel = 'stable'): Promise<UpdateRelease | null> {
    const { data } = await supabase.from('system_update_releases')
      .select('*')
      .eq('channel', channel)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!data || data.version === APP_VERSION) return null;
    return data as UpdateRelease;
  },

  async getDevices(): Promise<UpdateDevice[]> {
    const { data } = await supabase.from('system_update_devices').select('*').order('last_check_at', { ascending: false });
    return (data || []) as UpdateDevice[];
  },

  async registerDevice(hostname?: string): Promise<UpdateDevice | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const deviceId = getDeviceId();
    const profile = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cores: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || 0,
    };

    const { data } = await supabase.from('system_update_devices').upsert({
      user_id: user.id,
      device_id: deviceId,
      hostname: hostname || window.location.hostname,
      current_version: APP_VERSION,
      hardware_profile: profile,
      last_check_at: new Date().toISOString(),
    }, { onConflict: 'user_id,device_id' }).select().single();

    return data as UpdateDevice | null;
  },

  async setUpdateChannel(deviceId: string, channel: 'stable' | 'beta' | 'canary') {
    await supabase.from('system_update_devices').update({ channel }).eq('id', deviceId);
  },

  async setAutoUpdate(deviceId: string, enabled: boolean) {
    await supabase.from('system_update_devices').update({ auto_update_enabled: enabled }).eq('id', deviceId);
  },

  async getUpdateHistory(): Promise<UpdateLogEntry[]> {
    const { data } = await supabase.from('system_update_log').select('*').order('created_at', { ascending: false }).limit(50);
    return (data || []) as UpdateLogEntry[];
  },

  async logUpdate(toVersion: string, status: string, error?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('system_update_log').insert({
      user_id: user.id,
      from_version: APP_VERSION,
      to_version: toVersion,
      status,
      error: error || null,
      completed_at: status === 'success' || status === 'failed' ? new Date().toISOString() : null,
    });
  },

  getAppVersion: () => APP_VERSION,
};
