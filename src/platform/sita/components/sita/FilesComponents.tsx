import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { TrustBadge, TrustLevel } from "./TrustBadge";
import { StateBadge, ExecutionState } from "./StateBadge";
import {
  Upload, FileText, Image, File, FileSpreadsheet, Mic, Camera, Copy, Mail,
  Eye, Shield, Brain, Link2, Sparkles, CheckCircle, AlertTriangle, Clock,
  Search, ArrowRight, Loader2, Lock, Globe, Users, Trash2, RotateCcw,
  Bookmark, Zap, ShieldCheck, XCircle
} from "lucide-react";
import { SitaButton } from "./SitaCard";

/* =============== FILE TYPE ICON =============== */
export const fileTypeIcon = (type: string) => {
  const map: Record<string, { icon: typeof File; color: string }> = {
    pdf: { icon: FileText, color: "text-red-400" },
    doc: { icon: FileText, color: "text-blue-400" },
    docx: { icon: FileText, color: "text-blue-400" },
    xls: { icon: FileSpreadsheet, color: "text-green-400" },
    xlsx: { icon: FileSpreadsheet, color: "text-green-400" },
    csv: { icon: FileSpreadsheet, color: "text-green-400" },
    image: { icon: Image, color: "text-purple-400" },
    png: { icon: Image, color: "text-purple-400" },
    jpg: { icon: Image, color: "text-purple-400" },
    screenshot: { icon: Camera, color: "text-amber-400" },
    voice: { icon: Mic, color: "text-pink-400" },
    receipt: { icon: FileText, color: "text-orange-400" },
    invoice: { icon: FileText, color: "text-accent" },
    contract: { icon: File, color: "text-primary" },
    statement: { icon: FileSpreadsheet, color: "text-emerald-400" },
    form: { icon: FileText, color: "text-cyan-400" },
    email: { icon: Mail, color: "text-muted-foreground" },
    text: { icon: Copy, color: "text-muted-foreground" },
  };
  const m = map[type] || { icon: File, color: "text-muted-foreground" };
  const Icon = m.icon;
  return <Icon className={cn("h-5 w-5", m.color)} />;
};

/* =============== PROCESSING STAGE =============== */
export type ProcessingStage = "uploaded" | "scanning" | "ocr" | "parsing" | "classifying" | "sensitivity-review" | "extraction-complete" | "review-needed" | "linked" | "workflow-ready" | "boardroom-ready" | "failed" | "needs-correction";

const stageConfig: Record<ProcessingStage, { label: string; color: string; icon: typeof Clock }> = {
  uploaded: { label: "Uploaded", color: "text-muted-foreground bg-muted/50", icon: Upload },
  scanning: { label: "Scanning", color: "text-blue-400 bg-blue-400/10", icon: Loader2 },
  ocr: { label: "OCR", color: "text-cyan-400 bg-cyan-400/10", icon: Eye },
  parsing: { label: "Parsing", color: "text-violet-400 bg-violet-400/10", icon: Brain },
  classifying: { label: "Classifying", color: "text-amber-400 bg-amber-400/10", icon: Sparkles },
  "sensitivity-review": { label: "Sensitivity Review", color: "text-orange-400 bg-orange-400/10", icon: Shield },
  "extraction-complete": { label: "Extraction Complete", color: "text-trust-safe bg-trust-safe/10", icon: CheckCircle },
  "review-needed": { label: "Review Needed", color: "text-trust-review bg-trust-review/10", icon: AlertTriangle },
  linked: { label: "Linked", color: "text-primary bg-primary/10", icon: Link2 },
  "workflow-ready": { label: "Workflow Ready", color: "text-accent bg-accent/10", icon: Zap },
  "boardroom-ready": { label: "Boardroom Ready", color: "text-trust-verified bg-trust-verified/10", icon: Bookmark },
  failed: { label: "Failed", color: "text-destructive bg-destructive/10", icon: XCircle },
  "needs-correction": { label: "Needs Correction", color: "text-urgency-high bg-urgency-high/10", icon: RotateCcw },
};

export const ProcessingStageBadge = ({ stage, className }: { stage: ProcessingStage; className?: string }) => {
  const c = stageConfig[stage];
  const Icon = c.icon;
  const isAnimated = stage === "scanning" || stage === "ocr" || stage === "parsing" || stage === "classifying";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium", c.color, className)}>
      <Icon className={cn("h-3 w-3", isAnimated && "animate-spin")} />
      {c.label}
    </span>
  );
};

/* =============== SENSITIVITY BADGE =============== */
export type SensitivityLevel = "public" | "internal" | "confidential" | "restricted" | "governed";

export const SensitivityBadge = ({ level, className }: { level: SensitivityLevel; className?: string }) => {
  const config: Record<SensitivityLevel, { icon: typeof Globe; label: string; cls: string }> = {
    public: { icon: Globe, label: "Public", cls: "text-trust-safe bg-trust-safe/10 border-trust-safe/20" },
    internal: { icon: Users, label: "Internal", cls: "text-muted-foreground bg-muted/50 border-border" },
    confidential: { icon: Lock, label: "Confidential", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    restricted: { icon: Shield, label: "Restricted", cls: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
    governed: { icon: ShieldCheck, label: "Governed", cls: "text-red-400 bg-red-400/10 border-red-400/20" },
  };
  const c = config[level];
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", c.cls, className)}>
      <Icon className="h-2.5 w-2.5" /> {c.label}
    </span>
  );
};

/* =============== CONFIDENCE CHIP =============== */
export const ConfidenceChip = ({ value, className }: { value: number; className?: string }) => (
  <span className={cn(
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
    value >= 90 ? "text-trust-safe bg-trust-safe/10" :
    value >= 70 ? "text-trust-review bg-trust-review/10" :
    "text-urgency-high bg-urgency-high/10",
    className
  )}>
    {value}% confidence
  </span>
);

/* =============== EXTRACTED FACT CHIP =============== */
export const ExtractedFactChip = ({ label, value, type, className }: {
  label: string; value: string; type?: "date" | "amount" | "entity" | "obligation" | "deadline"; className?: string;
}) => {
  const colors: Record<string, string> = {
    date: "border-blue-400/20 bg-blue-400/5 text-blue-400",
    amount: "border-green-400/20 bg-green-400/5 text-green-400",
    entity: "border-purple-400/20 bg-purple-400/5 text-purple-400",
    obligation: "border-orange-400/20 bg-orange-400/5 text-orange-400",
    deadline: "border-red-400/20 bg-red-400/5 text-red-400",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px]", colors[type || "entity"] || "border-border bg-secondary/50 text-muted-foreground", className)}>
      <span className="font-medium text-foreground">{label}:</span> {value}
    </span>
  );
};

/* =============== UNIVERSAL INTAKE BOX =============== */
export const UniversalIntakeBox = ({ onUpload, className }: { onUpload?: () => void; className?: string }) => (
  <div className={cn(
    "relative rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] p-8 text-center transition-all hover:border-primary/40 hover:from-primary/[0.06] hover:to-accent/[0.06] group cursor-pointer",
    className
  )} onClick={onUpload}>
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8 group-hover:bg-primary/12 transition-colors">
      <Upload className="h-7 w-7 text-primary" />
    </div>
    <h3 className="mt-4 font-display text-base font-semibold text-foreground">Drop anything here</h3>
    <p className="mt-1.5 text-sm text-muted-foreground">PDFs, receipts, screenshots, voice notes, contracts, statements, forms</p>
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      {["PDF", "Image", "Receipt", "Contract", "Statement", "Voice", "Screenshot"].map(t => (
        <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{t}</span>
      ))}
    </div>
    <p className="mt-4 text-[11px] text-muted-foreground/60">Click, paste, or drag & drop · Max 50MB</p>
  </div>
);

/* =============== PROCESSING CARD =============== */
export const ProcessingCard = ({ name, fileType, stage, domain, sensitivity, confidence, highlights, className }: {
  name: string; fileType: string; stage: ProcessingStage; domain?: string; sensitivity?: SensitivityLevel; confidence?: number; highlights?: string[]; className?: string;
}) => (
  <div className={cn("rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover", className)}>
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-secondary p-2.5 shrink-0">{fileTypeIcon(fileType)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <ProcessingStageBadge stage={stage} />
          {domain && <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{domain}</span>}
          {sensitivity && <SensitivityBadge level={sensitivity} />}
          {confidence !== undefined && <ConfidenceChip value={confidence} />}
        </div>
        {highlights && highlights.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {highlights.map((h, i) => <span key={i} className="text-[10px] text-muted-foreground bg-secondary/80 rounded px-1.5 py-0.5">{h}</span>)}
          </div>
        )}
      </div>
    </div>
  </div>
);

/* =============== CLASSIFICATION CARD =============== */
export const ClassificationCard = ({ name, fileType, inferredDomain, inferredType, confidence, reason, sensitivity, onConfirm, onEdit, className }: {
  name: string; fileType: string; inferredDomain: string; inferredType: string; confidence: number; reason: string; sensitivity: SensitivityLevel; onConfirm?: () => void; onEdit?: () => void; className?: string;
}) => (
  <div className={cn("rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover", className)}>
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-secondary p-2.5 shrink-0">{fileTypeIcon(fileType)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-16">Domain</span>
            <span className="text-xs font-medium text-foreground bg-primary/8 px-2 py-0.5 rounded">{inferredDomain}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-16">Type</span>
            <span className="text-xs font-medium text-foreground bg-secondary px-2 py-0.5 rounded">{inferredType}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-16">Why</span>
            <span className="text-[11px] text-muted-foreground italic">{reason}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <ConfidenceChip value={confidence} />
          <SensitivityBadge level={sensitivity} />
        </div>
        <div className="mt-3 flex gap-2">
          <SitaButton variant="primary" size="sm" onClick={onConfirm}><CheckCircle className="h-3 w-3" /> Confirm</SitaButton>
          <SitaButton variant="ghost" size="sm" onClick={onEdit}>Edit Classification</SitaButton>
        </div>
      </div>
    </div>
  </div>
);

/* =============== EXTRACTION REVIEW CARD =============== */
export const ExtractionReviewCard = ({ name, fileType, facts, onConfirmAll, className }: {
  name: string; fileType: string; facts: { label: string; value: string; type: "date" | "amount" | "entity" | "obligation" | "deadline"; confirmed?: boolean }[]; onConfirmAll?: () => void; className?: string;
}) => (
  <div className={cn("rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover", className)}>
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-secondary p-2.5 shrink-0">{fileTypeIcon(fileType)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {facts.map((f, i) => (
            <div key={i} className="relative">
              <ExtractedFactChip label={f.label} value={f.value} type={f.type} />
              {f.confirmed && <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-trust-safe" />}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <SitaButton variant="primary" size="sm" onClick={onConfirmAll}><CheckCircle className="h-3 w-3" /> Confirm All Extractions</SitaButton>
        </div>
      </div>
    </div>
  </div>
);

/* =============== WORKFLOW SUGGESTION CARD =============== */
export const WorkflowSuggestionCard = ({ title, reason, domain, affectsWho, confidence, needsApproval, onAccept, onDismiss, className }: {
  title: string; reason: string; domain: string; affectsWho: string; confidence: number; needsApproval?: boolean; onAccept?: () => void; onDismiss?: () => void; className?: string;
}) => (
  <div className={cn("rounded-xl border border-accent/20 bg-accent/[0.03] p-4 transition-all hover:shadow-card-hover", className)}>
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-accent/10 p-2.5 shrink-0"><Sparkles className="h-5 w-5 text-accent" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{reason}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{domain}</span>
          <span className="text-[10px] text-muted-foreground">Affects: {affectsWho}</span>
          <ConfidenceChip value={confidence} />
          {needsApproval && <TrustBadge level="approval" size="sm" />}
        </div>
        <div className="mt-3 flex gap-2">
          <SitaButton variant="accent" size="sm" onClick={onAccept}><Zap className="h-3 w-3" /> Accept</SitaButton>
          <SitaButton variant="ghost" size="sm" onClick={onDismiss}>Dismiss</SitaButton>
        </div>
      </div>
    </div>
  </div>
);

/* =============== LINKED ENTITY CARD =============== */
export const LinkedEntityCard = ({ entityType, entityName, relationship, linkedVia, className }: {
  entityType: string; entityName: string; relationship: string; linkedVia: string; className?: string;
}) => (
  <div className={cn("flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:shadow-card-hover", className)}>
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
      <Link2 className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-foreground truncate">{entityName}</p>
      <p className="text-[10px] text-muted-foreground">{entityType} · {relationship}</p>
    </div>
    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0">{linkedVia}</span>
  </div>
);

/* =============== MEMORY REVIEW CARD =============== */
export const MemoryReviewCard = ({ learned, source, writtenTo, canCorrect, canForget, className }: {
  learned: string; source: string; writtenTo: string; canCorrect?: boolean; canForget?: boolean; className?: string;
}) => (
  <div className={cn("rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover", className)}>
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-purple-400/10 p-2.5 shrink-0"><Brain className="h-5 w-5 text-purple-400" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{learned}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Source: {source}</span>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">→ {writtenTo}</span>
        </div>
        <div className="mt-3 flex gap-2">
          {canCorrect && <SitaButton variant="ghost" size="sm"><RotateCcw className="h-3 w-3" /> Correct</SitaButton>}
          {canForget && <SitaButton variant="danger" size="sm"><Trash2 className="h-3 w-3" /> Forget</SitaButton>}
        </div>
      </div>
    </div>
  </div>
);

/* =============== PRIVACY SCOPE CARD =============== */
export const PrivacyScopeCard = ({ fileName, sensitivity, visibility, retention, memoryWrite, workflowTrigger, className }: {
  fileName: string; sensitivity: SensitivityLevel; visibility: string; retention: string; memoryWrite: boolean; workflowTrigger: boolean; className?: string;
}) => (
  <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
    <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
    <div className="mt-3 grid grid-cols-2 gap-2">
      <div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">Sensitivity</span></div>
      <SensitivityBadge level={sensitivity} />
      <div className="flex items-center gap-2"><Eye className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">Visible to</span></div>
      <span className="text-[11px] text-foreground">{visibility}</span>
      <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">Retention</span></div>
      <span className="text-[11px] text-foreground">{retention}</span>
      <div className="flex items-center gap-2"><Brain className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">Memory write</span></div>
      <span className={cn("text-[11px]", memoryWrite ? "text-trust-safe" : "text-muted-foreground")}>{memoryWrite ? "Enabled" : "Disabled"}</span>
      <div className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">Workflow trigger</span></div>
      <span className={cn("text-[11px]", workflowTrigger ? "text-trust-safe" : "text-muted-foreground")}>{workflowTrigger ? "Allowed" : "Blocked"}</span>
    </div>
  </div>
);

/* =============== RETRIEVAL RESULT CARD =============== */
export const RetrievalResultCard = ({ name, fileType, matchReason, extractedFacts, sensitivity, linkedEntities, className }: {
  name: string; fileType: string; matchReason: string; extractedFacts: string[]; sensitivity: SensitivityLevel; linkedEntities: string[]; className?: string;
}) => (
  <div className={cn("rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover cursor-pointer", className)}>
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-secondary p-2.5 shrink-0">{fileTypeIcon(fileType)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="mt-1 text-xs text-primary italic">{matchReason}</p>
        {extractedFacts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {extractedFacts.map((f, i) => <span key={i} className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground">{f}</span>)}
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <SensitivityBadge level={sensitivity} />
          {linkedEntities.map((e, i) => <span key={i} className="text-[10px] text-primary bg-primary/8 px-1.5 py-0.5 rounded">{e}</span>)}
        </div>
      </div>
    </div>
  </div>
);

/* =============== BOARDROOM ATTACHMENT CARD =============== */
export const BoardroomAttachmentCard = ({ fileName, boardroom, whyItMatters, keyFacts, className }: {
  fileName: string; boardroom: string; whyItMatters: string; keyFacts: string[]; className?: string;
}) => (
  <div className={cn("rounded-xl border border-primary/15 bg-primary/[0.02] p-4 transition-all hover:shadow-card-hover", className)}>
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-primary/8 p-2.5 shrink-0"><Bookmark className="h-5 w-5 text-primary" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{boardroom}</span>
        <p className="mt-1.5 text-xs text-muted-foreground">{whyItMatters}</p>
        {keyFacts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {keyFacts.map((f, i) => <span key={i} className="text-[10px] bg-secondary px-2 py-0.5 rounded text-foreground">{f}</span>)}
          </div>
        )}
      </div>
    </div>
  </div>
);

/* =============== CONNECTOR STATUS CARD =============== */
export const ConnectorStatusCard = ({ name, status, lastSync, className }: {
  name: string; status: "connected" | "disconnected" | "syncing" | "error"; lastSync?: string; className?: string;
}) => {
  const colors: Record<string, string> = {
    connected: "text-trust-safe",
    disconnected: "text-muted-foreground",
    syncing: "text-blue-400",
    error: "text-destructive",
  };
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border border-border bg-card p-3", className)}>
      <span className={cn("h-2 w-2 rounded-full", status === "connected" ? "bg-trust-safe" : status === "error" ? "bg-destructive" : status === "syncing" ? "bg-blue-400 animate-pulse" : "bg-muted-foreground")} />
      <div className="flex-1">
        <p className="text-xs font-medium text-foreground">{name}</p>
        {lastSync && <p className="text-[10px] text-muted-foreground">Last sync: {lastSync}</p>}
      </div>
      <span className={cn("text-[10px] font-medium capitalize", colors[status])}>{status}</span>
    </div>
  );
};
