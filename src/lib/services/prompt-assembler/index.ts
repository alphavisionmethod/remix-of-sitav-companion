// SITA OS — Prompt Assembler (merge: brain-core)
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
}
export const createPromptAssembler = () => new PromptAssemblerService();
