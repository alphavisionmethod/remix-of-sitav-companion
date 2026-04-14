// SITA OS — CRM React Query Hooks
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCRMContacts, fetchCRMCompanies, fetchCRMOpportunities,
  fetchCRMTasks, fetchCRMCommunications, fetchCRMNotes,
  fetchCRMPipelineStages, fetchCRMSegments, fetchCRMImportJobs,
  createCRMContact, updateCRMContact, deleteCRMContact,
  createCRMCompany, updateCRMCompany, deleteCRMCompany,
  createCRMOpportunity, updateCRMOpportunity,
  createCRMTask, updateCRMTask,
  createCRMCommunication,
  createCRMNote, updateCRMNote, deleteCRMNote,
} from "@/lib/data-services/crm-data-service";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";

function useCRMQuery<T>(key: string, fetcher: (mode: RealityModeKey) => Promise<{ data: T; source: string }>, mode: RealityModeKey = "demo") {
  return useQuery({
    queryKey: ["crm", key, mode],
    queryFn: async () => {
      const result = await fetcher(mode);
      return result.data;
    },
    staleTime: 30_000,
  });
}

export function useCRMContacts(mode: RealityModeKey = "demo") {
  return useCRMQuery("contacts", fetchCRMContacts, mode);
}

export function useCRMCompanies(mode: RealityModeKey = "demo") {
  return useCRMQuery("companies", fetchCRMCompanies, mode);
}

export function useCRMOpportunities(mode: RealityModeKey = "demo") {
  return useCRMQuery("opportunities", fetchCRMOpportunities, mode);
}

export function useCRMTasks(mode: RealityModeKey = "demo") {
  return useCRMQuery("tasks", fetchCRMTasks, mode);
}

export function useCRMCommunications(mode: RealityModeKey = "demo") {
  return useCRMQuery("communications", fetchCRMCommunications, mode);
}

export function useCRMNotes(mode: RealityModeKey = "demo") {
  return useCRMQuery("notes", fetchCRMNotes, mode);
}

export function useCRMPipelineStages(mode: RealityModeKey = "demo") {
  return useCRMQuery("pipeline-stages", fetchCRMPipelineStages, mode);
}

export function useCRMSegments(mode: RealityModeKey = "demo") {
  return useCRMQuery("segments", fetchCRMSegments, mode);
}

export function useCRMImportJobs(mode: RealityModeKey = "demo") {
  return useCRMQuery("import-jobs", fetchCRMImportJobs, mode);
}

// ─── Mutations ───────────────────────────────────────────────
export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCRMContact,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contacts"] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMContact>[1] }) => updateCRMContact(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contacts"] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCRMContact,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contacts"] }),
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCRMCompany,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "companies"] }),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMCompany>[1] }) => updateCRMCompany(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "companies"] }),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCRMCompany,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "companies"] }),
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCRMOpportunity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "opportunities"] }),
  });
}

export function useUpdateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMOpportunity>[1] }) => updateCRMOpportunity(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "opportunities"] }),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCRMTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMTask>[1] }) => updateCRMTask(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tasks"] }),
  });
}

export function useCreateCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCRMCommunication,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "communications"] }),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCRMNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "notes"] }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMNote>[1] }) => updateCRMNote(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "notes"] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCRMNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "notes"] }),
  });
}
