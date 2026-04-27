// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Integration Protocol Data Hooks
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";

const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ─── Feature Intake ───
export const useFeatureIntakes = () => useQuery({
  queryKey: ['fip', 'intakes'],
  queryFn: async () => {
    const { data, error } = await fromTable('feature_intake_records').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as never[];
  }
});

export const useCreateIntake = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (intake: Record<string, any>) => {
      const user = await getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await fromTable('feature_intake_records').insert({ ...intake, user_id: user.id } as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fip'] }); toast.success('Feature intake created'); },
    onError: (e: any) => toast.error(e.message),
  });
};

// ─── Capability Registry ───
export const useCapabilities = () => useQuery({
  queryKey: ['fip', 'capabilities'],
  queryFn: async () => {
    const { data, error } = await fromTable('capability_registry').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as never[];
  }
});

export const useCreateCapability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cap: Record<string, any>) => {
      const user = await getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await fromTable('capability_registry').insert({ ...cap, user_id: user.id } as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fip'] }); toast.success('Capability registered'); },
    onError: (e: any) => toast.error(e.message),
  });
};

// ─── Feature Specs ───
export const useFeatureSpecs = () => useQuery({
  queryKey: ['fip', 'specs'],
  queryFn: async () => {
    const { data, error } = await fromTable('feature_spec_records').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as never[];
  }
});

export const useCreateSpec = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (spec: Record<string, any>) => {
      const user = await getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await fromTable('feature_spec_records').insert({ ...spec, user_id: user.id } as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fip'] }); toast.success('Feature spec created'); },
    onError: (e: any) => toast.error(e.message),
  });
};

// ─── Owner Decisions ───
export const useOwnerDecisions = () => useQuery({
  queryKey: ['fip', 'owners'],
  queryFn: async () => {
    const { data, error } = await fromTable('feature_owner_decisions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as never[];
  }
});

export const useCreateOwnerDecision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dec: Record<string, any>) => {
      const user = await getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await fromTable('feature_owner_decisions').insert({ ...dec, user_id: user.id } as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fip'] }); toast.success('Owner decision recorded'); },
    onError: (e: any) => toast.error(e.message),
  });
};

// ─── Compliance Records ───
export const useComplianceRecords = () => useQuery({
  queryKey: ['fip', 'compliance'],
  queryFn: async () => {
    const { data, error } = await fromTable('feature_compliance_records').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as never[];
  }
});

// ─── Execution Paths ───
export const useExecutionPaths = () => useQuery({
  queryKey: ['fip', 'execution-paths'],
  queryFn: async () => {
    const { data, error } = await fromTable('feature_execution_paths').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as never[];
  }
});

export const useCreateExecutionPath = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (path: Record<string, any>) => {
      const user = await getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await fromTable('feature_execution_paths').insert({ ...path, user_id: user.id } as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fip'] }); toast.success('Execution path saved'); },
    onError: (e: any) => toast.error(e.message),
  });
};

// ─── Rollout Records ───
export const useRolloutRecords = () => useQuery({
  queryKey: ['fip', 'rollouts'],
  queryFn: async () => {
    const { data, error } = await fromTable('feature_rollout_records').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as never[];
  }
});

export const useCreateRollout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rollout: Record<string, any>) => {
      const user = await getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await fromTable('feature_rollout_records').insert({ ...rollout, user_id: user.id } as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fip'] }); toast.success('Rollout plan saved'); },
    onError: (e: any) => toast.error(e.message),
  });
};

// ─── Deprecation Records ───
export const useDeprecationRecords = () => useQuery({
  queryKey: ['fip', 'deprecations'],
  queryFn: async () => {
    const { data, error } = await fromTable('feature_deprecation_records').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as never[];
  }
});

export const useCreateDeprecation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dep: Record<string, any>) => {
      const user = await getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await fromTable('feature_deprecation_records').insert({ ...dep, user_id: user.id } as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fip'] }); toast.success('Deprecation record created'); },
    onError: (e: any) => toast.error(e.message),
  });
};

// ─── Readiness Gates ───
export const useReadinessGates = () => useQuery({
  queryKey: ['fip', 'readiness'],
  queryFn: async () => {
    const { data, error } = await fromTable('feature_readiness_gates').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as never[];
  }
});

// ─── Generated Truth Impacts ───
export const useGeneratedTruthImpacts = () => useQuery({
  queryKey: ['fip', 'truth-impacts'],
  queryFn: async () => {
    const { data, error } = await fromTable('feature_generated_truth_impacts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as never[];
  }
});
