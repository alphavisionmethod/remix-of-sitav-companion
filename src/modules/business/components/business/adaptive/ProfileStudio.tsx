// ═══════════════════════════════════════════════════════════════
// Profile Studio — The Premium Business Identity & Adaptation Center
// Combines profile editing, module emphasis, advisor config,
// boardroom focus, templates, and evolution into one tabbed layout.
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Sparkles, LayoutDashboard, Bot, Crosshair,
  Palette, Clock, Package, Eye, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import ProfileEditorStudio from "./ProfileEditorStudio";
import ModuleEmphasisPanel from "./ModuleEmphasisPanel";
import AdvisorConfigPanel from "./AdvisorConfigPanel";
import BoardroomFocusEditor from "./BoardroomFocusEditor";
import ProfileTemplateGallery from "./ProfileTemplateGallery";
import ProfileEvolutionTimeline from "./ProfileEvolutionTimeline";
import LiveHomePreview from "./LiveHomePreview";

const TABS = [
  { id: "profile", label: "Business Profile", icon: Settings, description: "Weights & operating mode" },
  { id: "modules", label: "Module Emphasis", icon: LayoutDashboard, description: "Which areas matter most" },
  { id: "advisors", label: "Advisor Config", icon: Bot, description: "Who advises you & how" },
  { id: "boardroom", label: "Boardroom Focus", icon: Crosshair, description: "Strategic priorities" },
  { id: "templates", label: "Template Packs", icon: Package, description: "Starter kits & templates" },
  { id: "evolution", label: "Profile Evolution", icon: Clock, description: "How your profile shifts" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProfileStudio() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [showPreview, setShowPreview] = useState(false);
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className={cn("flex-1 flex flex-col overflow-hidden", showPreview && "max-w-[65%]")}>
        {/* Studio header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[hsl(0_0%_100%/0.06)]"
        >
          <div>
            <h1 className="text-[16px] font-bold text-foreground/90 flex items-center gap-2">
              <Palette size={16} style={{ color: `hsl(${identity.accentColor})` }} />
              Profile Studio
            </h1>
            <p className="text-[11px] text-foreground/40 mt-0.5">
              Shape how Business OS adapts to your reality
            </p>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all",
              showPreview
                ? "bg-[hsl(var(--sita-purple))]/15 text-[hsl(var(--sita-purple))] border border-[hsl(var(--sita-purple))]/20"
                : "border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] text-foreground/50 hover:bg-[hsl(0_0%_100%/0.06)]"
            )}
          >
            <Eye size={10} />
            {showPreview ? "Hide Preview" : "Live Preview"}
          </button>
        </motion.div>

        {/* Tab navigation */}
        <div className="px-5 pt-3 flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-[hsl(0_0%_100%/0.08)] text-foreground/80 border border-[hsl(0_0%_100%/0.1)]"
                    : "text-foreground/35 hover:text-foreground/55 hover:bg-[hsl(0_0%_100%/0.03)]"
                )}
              >
                <Icon size={11} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "profile" && <ProfileEditorStudio />}
              {activeTab === "modules" && <ModuleEmphasisPanel />}
              {activeTab === "advisors" && <AdvisorConfigPanel />}
              {activeTab === "boardroom" && <BoardroomFocusEditor />}
              {activeTab === "templates" && <ProfileTemplateGallery />}
              {activeTab === "evolution" && <ProfileEvolutionTimeline />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Live preview sidebar */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "35%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-l border-[hsl(0_0%_100%/0.06)] overflow-hidden"
          >
            <LiveHomePreview />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
