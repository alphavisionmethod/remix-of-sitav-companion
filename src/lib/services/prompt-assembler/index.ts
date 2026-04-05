// SITA OS — Prompt Assembler (merge: brain-core)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface PromptTemplate { id: string; name: string; domain: string; template: string; variables: string[]; version: string; }
export interface AssembledPrompt { templateId: string; content: string; tokenEstimate: number; assembledAt: string; }
export class PromptAssemblerService {
  private templates: Map<string, PromptTemplate> = new Map();
  register(template: PromptTemplate): void { this.templates.set(template.id, template); }
  assemble(templateId: string, variables: Record<string, string>): AssembledPrompt {
    const t = this.templates.get(templateId);
    if (!t) throw new Error(`Template ${templateId} not found`);
    let content = t.template;
    for (const [k, v] of Object.entries(variables)) content = content.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    return { templateId, content, tokenEstimate: Math.ceil(content.length / 4), assembledAt: new Date().toISOString() };
  }
  listTemplates(): PromptTemplate[] { return [...this.templates.values()]; }
  getTemplate(id: string): PromptTemplate | undefined { return this.templates.get(id); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("prompt-assembler", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      templates: Array.from(this.templates.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.templates) this.templates = new Map(state.templates as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("prompt-assembler");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createPromptAssembler = () => new PromptAssemblerService();
