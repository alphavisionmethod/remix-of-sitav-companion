// SITA OS — Business Contracts: Vertical Playbook
export interface VerticalPlaybook {
  id: string;
  verticalId: string;
  name: string;
  description: string;
  triggerEvent: string;
  steps: PlaybookStep[];
  expectedOutcome: string;
  successMetric: string;
  avgCompletionDays: number;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaybookStep {
  order: number;
  action: string;
  channel?: string;
  templateId?: string;
  assignTo?: string;
  waitDays?: number;
  condition?: string;
  exitIf?: string;
  automatable: boolean;
}
