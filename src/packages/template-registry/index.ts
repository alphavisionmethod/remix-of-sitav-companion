// ═══════════════════════════════════════════════════════════════
// SITA OS — Template Registry Package
// ═══════════════════════════════════════════════════════════════

export type TemplateType = "document" | "report" | "invoice" | "proposal" | "email" | "workflow" | "dashboard" | "boardroom-packet";

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  domain: "business" | "finance" | "concierge" | "system";
  schema: TemplateField[];
  defaultValues: Record<string, unknown>;
  version: string;
  createdAt: number;
}

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "rich-text" | "table" | "image";
  required: boolean;
  defaultValue?: unknown;
  options?: string[];
}

export interface TemplateInstance {
  id: string;
  templateId: string;
  values: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  status: "draft" | "completed" | "sent" | "archived";
}

const registry = new Map<string, Template>();

export const registerTemplate = (template: Template): void => { registry.set(template.id, template); };
export const getTemplate = (id: string): Template | undefined => registry.get(id);
export const getTemplatesByType = (type: TemplateType): Template[] =>
  Array.from(registry.values()).filter(t => t.type === type);
export const getTemplatesByDomain = (domain: string): Template[] =>
  Array.from(registry.values()).filter(t => t.domain === domain);
export const getAllTemplates = (): Template[] => Array.from(registry.values());

export const instantiateTemplate = (templateId: string, overrides: Record<string, unknown> = {}): TemplateInstance | null => {
  const template = registry.get(templateId);
  if (!template) return null;
  return {
    id: crypto.randomUUID(),
    templateId,
    values: { ...template.defaultValues, ...overrides },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "draft",
  };
};
