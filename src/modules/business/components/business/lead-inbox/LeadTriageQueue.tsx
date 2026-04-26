import { AnimatePresence, motion } from "framer-motion";
import { LeadTriageCard } from "./LeadTriageCard";
import { LeadEmptyState } from "./LeadEmptyStates";
import type { InboxItem } from "./mock-inbox-data";
import type { InboxFilter } from "./useLeadInbox";
import type { LeadScoreResult } from "@/domains/business";

interface Props {
  items: InboxItem[];
  allItems: InboxItem[];
  filter: InboxFilter;
  selectedId: string | null;
  checkedIds: Set<string>;
  scoreMap: Map<string, LeadScoreResult>;
  onSelect: (id: string) => void;
  onCheck: (id: string, checked: boolean) => void;
  onAccept: (id: string) => void;
  onRoute: (id: string, dest: string) => void;
  onReject: (id: string) => void;
  onSnooze: (id: string) => void;
  onFlag: (id: string) => void;
  onExplain?: (id: string) => void;
  onAddLead?: () => void;
  onImport?: () => void;
  newCount: number;
}

export const LeadTriageQueue = ({
  items, allItems, filter, selectedId, checkedIds, scoreMap,
  onSelect, onCheck, onAccept, onRoute, onReject, onSnooze, onFlag, onExplain,
  onAddLead, onImport, newCount,
}: Props) => {
  if (items.length === 0) {
    return (
      <LeadEmptyState
        variant={allItems.length === 0 ? "first-use" : newCount === 0 && filter === "all" ? "caught-up" : "no-results"}
        onAddLead={onAddLead}
        onImport={onImport}
      />
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100, transition: { duration: 0.25 } }}
          transition={{ delay: i * 0.03 }}
        >
          <LeadTriageCard
            item={item}
            score={scoreMap.get(item.id)}
            selected={selectedId === item.id}
            checked={checkedIds.has(item.id)}
            onSelect={() => onSelect(item.id)}
            onCheck={(c) => onCheck(item.id, c)}
            onAccept={() => onAccept(item.id)}
            onRoute={(dest) => onRoute(item.id, dest)}
            onReject={() => onReject(item.id)}
            onSnooze={() => onSnooze(item.id)}
            onFlag={() => onFlag(item.id)}
            onExplain={() => onExplain?.(item.id)}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
