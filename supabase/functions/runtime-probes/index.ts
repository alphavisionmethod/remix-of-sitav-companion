const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ProbeResult {
  probe_id: string;
  name: string;
  target: string;
  status: 'pass' | 'fail' | 'degraded';
  latency_ms: number;
  error?: string;
  snapshot?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const results: ProbeResult[] = [];

  // ── Probe 1: Database Health ──
  try {
    const t = Date.now();
    const { data, error } = await supabase.from('scheduled_jobs').select('id').limit(1);
    results.push({
      probe_id: 'db-health',
      name: 'Database Connectivity',
      target: 'supabase-postgres',
      status: error ? 'fail' : 'pass',
      latency_ms: Date.now() - t,
      error: error?.message,
    });
  } catch (e) {
    results.push({
      probe_id: 'db-health',
      name: 'Database Connectivity',
      target: 'supabase-postgres',
      status: 'fail',
      latency_ms: 0,
      error: e.message,
    });
  }

  // ── Probe 2: Auth System Health ──
  try {
    const t = Date.now();
    const resp = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: Deno.env.get('SUPABASE_ANON_KEY')! },
    });
    results.push({
      probe_id: 'auth-health',
      name: 'Auth System',
      target: 'supabase-auth',
      status: resp.ok ? 'pass' : 'fail',
      latency_ms: Date.now() - t,
      error: resp.ok ? undefined : `HTTP ${resp.status}`,
    });
    await resp.text();
  } catch (e) {
    results.push({
      probe_id: 'auth-health',
      name: 'Auth System',
      target: 'supabase-auth',
      status: 'fail',
      latency_ms: 0,
      error: e.message,
    });
  }

  // ── Probe 3: Storage Health ──
  try {
    const t = Date.now();
    const { data, error } = await supabase.storage.listBuckets();
    results.push({
      probe_id: 'storage-health',
      name: 'Storage System',
      target: 'supabase-storage',
      status: error ? 'fail' : 'pass',
      latency_ms: Date.now() - t,
      error: error?.message,
      snapshot: { bucket_count: data?.length ?? 0 },
    });
  } catch (e) {
    results.push({
      probe_id: 'storage-health',
      name: 'Storage System',
      target: 'supabase-storage',
      status: 'fail',
      latency_ms: 0,
      error: e.message,
    });
  }

  // ── Probe 4: Scheduler Health ──
  try {
    const t = Date.now();
    const { data, error } = await supabase
      .from('scheduled_jobs')
      .select('id, status')
      .eq('status', 'active')
      .limit(5);
    results.push({
      probe_id: 'scheduler-health',
      name: 'Scheduler System',
      target: 'scheduled_jobs',
      status: error ? 'fail' : 'pass',
      latency_ms: Date.now() - t,
      error: error?.message,
      snapshot: { active_jobs: data?.length ?? 0 },
    });
  } catch (e) {
    results.push({
      probe_id: 'scheduler-health',
      name: 'Scheduler System',
      target: 'scheduled_jobs',
      status: 'fail',
      latency_ms: 0,
      error: e.message,
    });
  }

  // ── Probe 5: Kill Switch Safety ──
  try {
    const t = Date.now();
    const { data, error } = await supabase
      .from('automation_kill_switches')
      .select('id, scope, enabled')
      .eq('enabled', true)
      .limit(10);
    const activeKills = data?.length ?? 0;
    results.push({
      probe_id: 'killswitch-safety',
      name: 'Kill Switch Status',
      target: 'automation_kill_switches',
      status: error ? 'fail' : activeKills > 0 ? 'degraded' : 'pass',
      latency_ms: Date.now() - t,
      error: error?.message,
      snapshot: { active_kill_switches: activeKills },
    });
  } catch (e) {
    results.push({
      probe_id: 'killswitch-safety',
      name: 'Kill Switch Status',
      target: 'automation_kill_switches',
      status: 'fail',
      latency_ms: 0,
      error: e.message,
    });
  }

  // ── Summary ──
  const passing = results.filter((r) => r.status === 'pass').length;
  const failing = results.filter((r) => r.status === 'fail').length;
  const degraded = results.filter((r) => r.status === 'degraded').length;
  const totalLatency = Date.now() - startTime;

  const summary = {
    timestamp: new Date().toISOString(),
    total_probes: results.length,
    passing,
    failing,
    degraded,
    overall_status: failing > 0 ? 'unhealthy' : degraded > 0 ? 'degraded' : 'healthy',
    total_latency_ms: totalLatency,
    launch_eligible: failing === 0,
    probes: results,
  };

  return new Response(JSON.stringify(summary), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
