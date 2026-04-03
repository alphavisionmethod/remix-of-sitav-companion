import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type InspectorEntityType = "lead" | "customer" | "opportunity" | "invoice" | "bill" | "subscription" | "task" | "file" | "workflow" | "advisor" | "booking" | "reserve" | "quote" | "communication" | "proof" | "event" | "generic";

export interface InspectorEntity {
  id: string;
  type: InspectorEntityType;
  title: string;
  subtitle?: string;
  domain: "business" | "finance" | "concierge" | "system";
  status?: string;
  trustLevel?: string;
  details: Record<string, string | number | boolean | null>;
  proofChain?: ProofChainItem[];
  advisorReasoning?: AdvisorReasoning[];
  linkedWorkflows?: LinkedWorkflow[];
  linkedEntities?: LinkedEntity[];
  timeline?: TimelineEntry[];
}

export interface ProofChainItem {
  id: string;
  action: string;
  result: "confirmed" | "partial" | "missing" | "disputed";
  timestamp: string;
  hash?: string;
}

export interface AdvisorReasoning {
  advisor: string;
  recommendation: string;
  confidence: number;
  reasoning: string;
}

export interface LinkedWorkflow {
  id: string;
  name: string;
  status: "active" | "completed" | "paused" | "failed";
  step: string;
}

export interface LinkedEntity {
  id: string;
  type: InspectorEntityType;
  title: string;
  relationship: string;
}

export interface TimelineEntry {
  action: string;
  actor: string;
  timestamp: string;
  detail?: string;
}

interface InspectorContextType {
  entity: InspectorEntity | null;
  isOpen: boolean;
  inspect: (entity: InspectorEntity) => void;
  close: () => void;
}

const InspectorContext = createContext<InspectorContextType>({
  entity: null,
  isOpen: false,
  inspect: () => {},
  close: () => {},
});

export const useInspector = () => useContext(InspectorContext);

export const InspectorProvider = ({ children }: { children: ReactNode }) => {
  const [entity, setEntity] = useState<InspectorEntity | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const inspect = useCallback((e: InspectorEntity) => {
    setEntity(e);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setEntity(null), 300);
  }, []);

  return (
    <InspectorContext.Provider value={{ entity, isOpen, inspect, close }}>
      {children}
    </InspectorContext.Provider>
  );
};
