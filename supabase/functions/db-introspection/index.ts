import { corsHeaders } from '@supabase/supabase-js/cors';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { op } = await req.json();
    const allowed = ['tables', 'policies', 'fk_constraints', 'columns', 'rls_status'];
    if (!allowed.includes(op)) {
      return new Response(JSON.stringify({ error: 'invalid op' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    let query = '';
    if (op === 'tables') {
      query = `SELECT tablename, rowsecurity, hasindexes, hastriggers FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
    } else if (op === 'policies') {
      query = `SELECT tablename, policyname, permissive, cmd, roles::text, qual, with_check FROM pg_catalog.pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname`;
    } else if (op === 'fk_constraints') {
      query = `
        SELECT
          tc.constraint_name,
          tc.table_name AS source_table,
          kcu.column_name AS source_column,
          ccu.table_name AS target_table,
          ccu.column_name AS target_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name
      `;
    } else if (op === 'columns') {
      query = `SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position`;
    } else if (op === 'rls_status') {
      query = `SELECT c.relname AS tablename, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname`;
    }

    const { data, error } = await supabase.rpc('get_db_truth_snapshot', { _op: 'summary' });

    // Use raw SQL via pg
    const result = await fetch(`${supabaseUrl}/rest/v1/rpc/get_db_truth_snapshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
      },
      body: JSON.stringify({ _op: op === 'tables' ? 'schema' : op === 'policies' ? 'policies' : 'summary' }),
    });

    const rpcResult = await result.json();

    return new Response(JSON.stringify({ op, result: rpcResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});