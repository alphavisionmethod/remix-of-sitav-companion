// SITA OS — Business Contracts: Vertical Pack Configuration
export interface VerticalPackConfig {
  id: string;
  verticalName: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  modules: VerticalModule[];
  defaultPipeline: string;
  defaultApprovals: string;
  defaultPlaybook: string;
  commsTemplateIds: string[];
  roleDefaults: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerticalModule {
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  requiredCapabilities: string[];
}
