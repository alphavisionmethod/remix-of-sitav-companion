// SITA OS — CRM React Query Hooks (Complete)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCRMContacts, fetchCRMCompanies, fetchCRMOpportunities,
  fetchCRMTasks, fetchCRMCommunications, fetchCRMNotes,
  fetchCRMPipelineStages, fetchCRMSegments, fetchCRMImportJobs,
  fetchCRMTags, fetchCRMContactCompanyLinks, fetchCRMAutomations,
  createCRMContact, updateCRMContact, deleteCRMContact,
  createCRMCompany, updateCRMCompany, deleteCRMCompany,
  createCRMOpportunity, updateCRMOpportunity, deleteCRMOpportunity,
  createCRMTask, updateCRMTask, deleteCRMTask,
  createCRMCommunication, deleteCRMCommunication,
  createCRMNote, updateCRMNote, deleteCRMNote,
  createCRMPipelineStage, updateCRMPipelineStage, deleteCRMPipelineStage,
  createCRMSegment, updateCRMSegment, deleteCRMSegment,
  createCRMTag, deleteCRMTag,
  createCRMImportJob, updateCRMImportJob,
  createCRMMergeLog,
  createCRMContactCompanyLink, deleteCRMContactCompanyLink,
  createCRMAutomation, updateCRMAutomation, deleteCRMAutomation,
} from "@/data/repositories/crm-data-service";
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

export function useCRMContacts(mode: RealityModeKey = "demo") { return useCRMQuery("contacts", fetchCRMContacts, mode); }
export function useCRMCompanies(mode: RealityModeKey = "demo") { return useCRMQuery("companies", fetchCRMCompanies, mode); }
export function useCRMOpportunities(mode: RealityModeKey = "demo") { return useCRMQuery("opportunities", fetchCRMOpportunities, mode); }
export function useCRMTasks(mode: RealityModeKey = "demo") { return useCRMQuery("tasks", fetchCRMTasks, mode); }
export function useCRMCommunications(mode: RealityModeKey = "demo") { return useCRMQuery("communications", fetchCRMCommunications, mode); }
export function useCRMNotes(mode: RealityModeKey = "demo") { return useCRMQuery("notes", fetchCRMNotes, mode); }
export function useCRMPipelineStages(mode: RealityModeKey = "demo") { return useCRMQuery("pipeline-stages", fetchCRMPipelineStages, mode); }
export function useCRMSegments(mode: RealityModeKey = "demo") { return useCRMQuery("segments", fetchCRMSegments, mode); }
export function useCRMImportJobs(mode: RealityModeKey = "demo") { return useCRMQuery("import-jobs", fetchCRMImportJobs, mode); }
export function useCRMTags(mode: RealityModeKey = "demo") { return useCRMQuery("tags", fetchCRMTags, mode); }
export function useCRMContactCompanyLinks(mode: RealityModeKey = "demo") { return useCRMQuery("contact-company-links", fetchCRMContactCompanyLinks, mode); }

// ─── Contact Mutations ──────────────────────────────────────
export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMContact, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contacts"] }) });
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
  return useMutation({ mutationFn: deleteCRMContact, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contacts"] }) });
}

// ─── Company Mutations ──────────────────────────────────────
export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMCompany, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "companies"] }) });
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
  return useMutation({ mutationFn: deleteCRMCompany, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "companies"] }) });
}

// ─── Opportunity Mutations ──────────────────────────────────
export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMOpportunity, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "opportunities"] }) });
}
export function useUpdateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMOpportunity>[1] }) => updateCRMOpportunity(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "opportunities"] }),
  });
}
export function useDeleteOpportunity() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteCRMOpportunity, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "opportunities"] }) });
}

// ─── Task Mutations ─────────────────────────────────────────
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMTask, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tasks"] }) });
}
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMTask>[1] }) => updateCRMTask(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tasks"] }),
  });
}
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteCRMTask, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tasks"] }) });
}

// ─── Communication Mutations ────────────────────────────────
export function useCreateCommunication() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMCommunication, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "communications"] }) });
}
export function useDeleteCommunication() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteCRMCommunication, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "communications"] }) });
}

// ─── Note Mutations ─────────────────────────────────────────
export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMNote, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "notes"] }) });
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
  return useMutation({ mutationFn: deleteCRMNote, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "notes"] }) });
}

// ─── Pipeline Stage Mutations ───────────────────────────────
export function useCreatePipelineStage() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMPipelineStage, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "pipeline-stages"] }) });
}
export function useUpdatePipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMPipelineStage>[1] }) => updateCRMPipelineStage(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "pipeline-stages"] }),
  });
}
export function useDeletePipelineStage() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteCRMPipelineStage, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "pipeline-stages"] }) });
}

// ─── Segment Mutations ──────────────────────────────────────
export function useCreateSegment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMSegment, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "segments"] }) });
}
export function useUpdateSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMSegment>[1] }) => updateCRMSegment(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "segments"] }),
  });
}
export function useDeleteSegment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteCRMSegment, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "segments"] }) });
}

// ─── Tag Mutations ──────────────────────────────────────────
export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMTag, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tags"] }) });
}
export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteCRMTag, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tags"] }) });
}

// ─── Import Job Mutations ───────────────────────────────────
export function useCreateImportJob() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMImportJob, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "import-jobs"] }) });
}
export function useUpdateImportJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMImportJob>[1] }) => updateCRMImportJob(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "import-jobs"] }),
  });
}

// ─── Merge Log ──────────────────────────────────────────────
export function useCreateMergeLog() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMMergeLog, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm"] }) });
}

// ─── Contact-Company Link Mutations ─────────────────────────
export function useCreateContactCompanyLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCRMContactCompanyLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contact-company-links"] }),
  });
}
export function useDeleteContactCompanyLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCRMContactCompanyLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contact-company-links"] }),
  });
}

// ─── CRM Automation Hooks ───────────────────────────────────
export function useCRMAutomations(mode: RealityModeKey = "demo") { return useCRMQuery("automations", fetchCRMAutomations, mode); }

export function useCreateAutomation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCRMAutomation, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "automations"] }) });
}
export function useUpdateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMAutomation>[1] }) => updateCRMAutomation(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "automations"] }),
  });
}
export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteCRMAutomation, onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "automations"] }) });
}
