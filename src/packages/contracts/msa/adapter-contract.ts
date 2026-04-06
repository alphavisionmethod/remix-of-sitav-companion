// ═══════════════════════════════════════════════════════════════
// SITA OS — MSA Contract: Surface Adapters
// Navigation, interaction, notification grammars per surface
// ═══════════════════════════════════════════════════════════════

export interface NavigationGrammar {
  type: "route_based" | "stack_based" | "tab_panel" | "spatial_anchored" | "voice_menu";
  pattern: string;
  supportsDeepLinks: boolean;
  supportsBackNavigation: boolean;
  maxDepth?: number;
}

export interface InteractionGrammar {
  primary: string;
  secondary?: string;
  tertiary?: string;
  supportsDrag: boolean;
  supportsHaptic: boolean;
  supportsMultiWindow: boolean;
  gestureLibrary?: string[];
}

export interface NotificationGrammar {
  channel: string;
  urgencyLevels: string[];
  deliveryMethods: string[];
  supportsGrouping: boolean;
  supportsActions: boolean;
}

export interface TrustPresentation {
  trustElement: string;
  renderingStrategy: string;
  componentPattern?: string;
  verified: boolean;
}

export interface ReceiptPresentation {
  receiptType: string;
  renderingStrategy: string;
  componentPattern?: string;
  supportsPrint: boolean;
  supportsExport: boolean;
}

export interface SurfaceAdapterRecord {
  id: string;
  surfaceId: string;
  adapterName: string;
  shellType: string;
  status: "active" | "planned" | "deprecated";
  navigationGrammar: NavigationGrammar;
  interactionGrammar: InteractionGrammar;
  notificationGrammar: NotificationGrammar;
  performanceProfile?: Record<string, unknown>;
}
