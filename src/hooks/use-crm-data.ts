// SITA OS — CRM React Query Hooks (Complete)
// Phase 2 (Business OS Production-Truth Closure):
// Every mutation now flows through emitRegisteredTrustAction so the
// CRM produces a real audit trail (Trust receipts + authority gating).
// Blocked actions short-circuit before the data layer is touched.
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
import { emitRegisteredTrustAction } from "@/platform/trust/registry/emit-registered";
import type { TrustActionKey } from "@/platform/trust/registry/trust-action-registry";

/**
 * Wrap any CRM mutation function so it:
 *  1. Resolves authority via emitRegisteredTrustAction (catalog-driven).
 *  2. Short-circuits with a typed error when the action is blocked.
 *  3. Otherwise runs the mutation and returns its native result.
 * The trust receipt is fire-and-forget for the caller — it is durably
 * recorded by the trust layer and visible from the Trust Center.
 */
function withTrust<TArgs, TResult>(
  action: TrustActionKey,
  fn: (args: TArgs) => Promise<TResult>,
  describe?: (args: TArgs) => string,
) {
  return async (args: TArgs): Promise<TResult> => {
    // Phase 7.2 — derive a normalized entity ref from the action key + args
    // so module proof surfaces (CRMProofTrail, etc.) can filter receipts by
    // entity without parsing args defensively at read time.
    const entityRef = deriveEntityRef(action, args);
    const decision = await emitRegisteredTrustAction(action, {
      payload: {
        args: args as unknown as Record<string, unknown>,
        ...(entityRef ? { entity_ref: entityRef } : {}),
      },
      impactSummary: describe?.(args),
    });
    if (decision.blocked) {
      throw new Error(
        decision.blockedReason ??
          `Action ${action} blocked by trust authority engine.`,
      );
    }
    return fn(args);
  };
}

// ─── Entity-ref derivation (Phase 7.2) ──────────────────────
// CRM action keys follow `crm.<entity>.<verb>` (or
// `business.crm.contact_delete`). We map that prefix to a canonical proof
// entity_type and pull `id` from the mutation args. Pure function — no IO.
const ACTION_KEY_TO_ENTITY: Record<string, string> = {
  "crm.contact": "contact",
  "business.crm.contact_delete": "contact",
  "crm.company": "company",
  "crm.opportunity": "deal",
  "crm.deal": "deal",
  "crm.task": "task",
  "crm.note": "note",
  "crm.communication": "communication",
  "crm.pipeline_stage": "pipeline_stage",
  "crm.segment": "segment",
  "crm.tag": "tag",
  "crm.import_job": "import_job",
  "crm.automation": "automation",
  "crm.merge": "merge",
  "crm.contact_company_link": "link",
};

export function deriveEntityRef(
  action: string,
  args: unknown,
): { entity_type: string; entity_id?: string; related?: Record<string, string> } | null {
  const prefix = Object.keys(ACTION_KEY_TO_ENTITY)
    .filter((k) => action === k || action.startsWith(`${k}.`))
    .sort((a, b) => b.length - a.length)[0];
  if (!prefix) return null;
  const entity_type = ACTION_KEY_TO_ENTITY[prefix];

  const a = (args ?? {}) as Record<string, unknown>;
  const id =
    typeof a.id === "string" ? a.id :
    typeof (a as { entity_id?: unknown }).entity_id === "string" ? (a as { entity_id: string }).entity_id :
    undefined;

  const related: Record<string, string> = {};
  if (typeof a.contact_id === "string") related.contact_id = a.contact_id;
  if (typeof a.company_id === "string") related.company_id = a.company_id;
  if (typeof a.opportunity_id === "string") related.opportunity_id = a.opportunity_id;
  if (typeof a.winner_id === "string") related.winner_id = a.winner_id;
  if (typeof a.loser_id === "string") related.loser_id = a.loser_id;

  return {
    entity_type,
    ...(id ? { entity_id: id } : {}),
    ...(Object.keys(related).length ? { related } : {}),
  };
}

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
  return useMutation({
    mutationFn: withTrust("crm.contact.create", createCRMContact),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contacts"] }),
  });
}
export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "crm.contact.update",
      ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMContact>[1] }) =>
        updateCRMContact(id, updates),
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contacts"] }),
  });
}
export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("business.crm.contact_delete", deleteCRMContact),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contacts"] }),
  });
}

// ─── Company Mutations ──────────────────────────────────────
export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.company.create", createCRMCompany),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "companies"] }),
  });
}
export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "crm.company.update",
      ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMCompany>[1] }) =>
        updateCRMCompany(id, updates),
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "companies"] }),
  });
}
export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.company.delete", deleteCRMCompany),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "companies"] }),
  });
}

// ─── Opportunity Mutations ──────────────────────────────────
export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.opportunity.create", createCRMOpportunity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "opportunities"] }),
  });
}
export function useUpdateOpportunity() {
  const qc = useQueryClient();
  // Stage transitions are domain-significant — route via the existing
  // crm.deal.stage_change preset when the update touches stage_id; otherwise
  // record as a generic opportunity update.
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMOpportunity>[1] }) => {
      const stageTouched =
        updates && typeof updates === "object" && "stage_id" in (updates as Record<string, unknown>);
      const action: TrustActionKey = stageTouched
        ? "crm.deal.stage_change"
        : "crm.opportunity.update";
      return withTrust(
        action,
        (args: { id: string; updates: Parameters<typeof updateCRMOpportunity>[1] }) =>
          updateCRMOpportunity(args.id, args.updates),
      )({ id, updates });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "opportunities"] }),
  });
}
export function useDeleteOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.opportunity.delete", deleteCRMOpportunity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "opportunities"] }),
  });
}

// ─── Task Mutations ─────────────────────────────────────────
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.task.create", createCRMTask),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tasks"] }),
  });
}
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "crm.task.update",
      ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMTask>[1] }) =>
        updateCRMTask(id, updates),
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tasks"] }),
  });
}
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.task.delete", deleteCRMTask),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tasks"] }),
  });
}

// ─── Communication Mutations ────────────────────────────────
export function useCreateCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.communication.log", createCRMCommunication),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "communications"] }),
  });
}
export function useDeleteCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.communication.delete", deleteCRMCommunication),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "communications"] }),
  });
}

// ─── Note Mutations ─────────────────────────────────────────
export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.note.create", createCRMNote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "notes"] }),
  });
}
export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "crm.note.update",
      ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMNote>[1] }) =>
        updateCRMNote(id, updates),
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "notes"] }),
  });
}
export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.note.delete", deleteCRMNote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "notes"] }),
  });
}

// ─── Pipeline Stage Mutations ───────────────────────────────
export function useCreatePipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.pipeline_stage.create", createCRMPipelineStage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "pipeline-stages"] }),
  });
}
export function useUpdatePipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "crm.pipeline_stage.update",
      ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMPipelineStage>[1] }) =>
        updateCRMPipelineStage(id, updates),
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "pipeline-stages"] }),
  });
}
export function useDeletePipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.pipeline_stage.delete", deleteCRMPipelineStage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "pipeline-stages"] }),
  });
}

// ─── Segment Mutations ──────────────────────────────────────
export function useCreateSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.segment.create", createCRMSegment),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "segments"] }),
  });
}
export function useUpdateSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "crm.segment.update",
      ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMSegment>[1] }) =>
        updateCRMSegment(id, updates),
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "segments"] }),
  });
}
export function useDeleteSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.segment.delete", deleteCRMSegment),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "segments"] }),
  });
}

// ─── Tag Mutations ──────────────────────────────────────────
export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.tag.create", createCRMTag),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tags"] }),
  });
}
export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.tag.delete", deleteCRMTag),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tags"] }),
  });
}

// ─── Import Job Mutations ───────────────────────────────────
export function useCreateImportJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.import_job.create", createCRMImportJob),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "import-jobs"] }),
  });
}
export function useUpdateImportJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "crm.import_job.update",
      ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMImportJob>[1] }) =>
        updateCRMImportJob(id, updates),
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "import-jobs"] }),
  });
}

// ─── Merge Log ──────────────────────────────────────────────
export function useCreateMergeLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.merge.execute", createCRMMergeLog),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm"] }),
  });
}

// ─── Contact-Company Link Mutations ─────────────────────────
export function useCreateContactCompanyLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.contact_company_link.create", createCRMContactCompanyLink),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contact-company-links"] }),
  });
}
export function useDeleteContactCompanyLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.contact_company_link.delete", deleteCRMContactCompanyLink),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contact-company-links"] }),
  });
}

// ─── CRM Automation Hooks ───────────────────────────────────
export function useCRMAutomations(mode: RealityModeKey = "demo") { return useCRMQuery("automations", fetchCRMAutomations, mode); }

export function useCreateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.automation.create", createCRMAutomation),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "automations"] }),
  });
}
export function useUpdateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "crm.automation.update",
      ({ id, updates }: { id: string; updates: Parameters<typeof updateCRMAutomation>[1] }) =>
        updateCRMAutomation(id, updates),
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "automations"] }),
  });
}
export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust("crm.automation.delete", deleteCRMAutomation),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "automations"] }),
  });
}
