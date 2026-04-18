// ═══════════════════════════════════════════════════════════════
// Nova SDK — UI Component Library
// Design-system-enforced components for all Nova apps
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { cn } from "@/lib/utils";
import { APP_COMPONENTS, APP_TYPE, SPACE } from "@/lib/design-system/app-window-system";

// ── NovaText ─────────────────────────────────────────────────

type TextVariant = "label" | "body" | "title" | "heading";

interface NovaTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TextVariant;
  muted?: boolean;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
}

export const NovaText = React.forwardRef<HTMLElement, NovaTextProps>(
  ({ variant = "body", muted, as: Tag = "span", className, ...props }, ref) => (
    <Tag
      ref={ref as any}
      className={cn(
        APP_TYPE[variant],
        muted && "text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)]",
        !muted && "text-[hsl(0_0%_15%)] dark:text-[hsl(0_0%_85%)]",
        className
      )}
      {...props}
    />
  )
);
NovaText.displayName = "NovaText";

// ── NovaButton ───────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost";

interface NovaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
}

export const NovaButton = React.forwardRef<HTMLButtonElement, NovaButtonProps>(
  ({ variant = "primary", icon, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(APP_COMPONENTS.button.base, APP_COMPONENTS.button[variant], className)}
      {...props}
    >
      {icon && <span className="mr-1.5 inline-flex">{icon}</span>}
      {children}
    </button>
  )
);
NovaButton.displayName = "NovaButton";

// ── NovaInput ────────────────────────────────────────────────

interface NovaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const NovaInput = React.forwardRef<HTMLInputElement, NovaInputProps>(
  ({ icon, className, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)]">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(APP_COMPONENTS.input.base, icon && "pl-8", className)}
        {...props}
      />
    </div>
  )
);
NovaInput.displayName = "NovaInput";

// ── NovaCard ─────────────────────────────────────────────────

interface NovaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const NovaCard = React.forwardRef<HTMLDivElement, NovaCardProps>(
  ({ hoverable, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        APP_COMPONENTS.card.base,
        hoverable && "transition-all duration-150 hover:shadow-md hover:border-[hsl(0_0%_0%/0.10)] dark:hover:border-[hsl(0_0%_100%/0.10)]",
        className
      )}
      {...props}
    />
  )
);
NovaCard.displayName = "NovaCard";

// ── NovaList ─────────────────────────────────────────────────

interface NovaListItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface NovaListProps {
  items: NovaListItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export const NovaList: React.FC<NovaListProps> = ({ items, activeId, onSelect, className }) => (
  <div className={cn("space-y-0.5", className)}>
    {items.map(item => (
      <button
        key={item.id}
        onClick={() => onSelect?.(item.id)}
        className={cn(
          APP_COMPONENTS.listItem.base,
          activeId === item.id ? APP_COMPONENTS.listItem.active : APP_COMPONENTS.listItem.inactive,
          "w-full justify-between"
        )}
      >
        <span className="flex items-center gap-2">
          {item.icon}
          {item.label}
        </span>
        {item.badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.08)]">
            {item.badge}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ── NovaModal ────────────────────────────────────────────────

interface NovaModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const NovaModal: React.FC<NovaModalProps> = ({ open, onClose, title, children, className }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-[hsl(0_0%_0%/0.4)] backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative z-10 rounded-2xl border border-[hsl(0_0%_100%/0.15)] bg-[hsl(0_0%_100%/0.85)] dark:bg-[hsl(0_0%_8%/0.90)] backdrop-blur-2xl shadow-2xl",
        "max-w-md w-full mx-4",
        className
      )} style={{ padding: SPACE.section }}>
        {title && <NovaText variant="title" className="mb-4 block">{title}</NovaText>}
        {children}
      </div>
    </div>
  );
};

// ── NovaSidebar ──────────────────────────────────────────────

interface NovaSidebarProps {
  width?: number;
  children: React.ReactNode;
  className?: string;
}

export const NovaSidebar: React.FC<NovaSidebarProps> = ({ width = 160, children, className }) => (
  <div
    className={cn(
      "border-r border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] flex-shrink-0",
      className
    )}
    style={{ width, padding: SPACE.tight }}
  >
    {children}
  </div>
);

// ── NovaSectionLabel ─────────────────────────────────────────

export const NovaSectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn(APP_TYPE.label, "text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)] uppercase tracking-widest px-2 mb-2", className)}>
    {children}
  </p>
);

// ── NovaToggle ───────────────────────────────────────────────

interface NovaToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const NovaToggle: React.FC<NovaToggleProps> = ({ checked, onChange, disabled, className }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={cn(
      "relative w-9 h-5 rounded-full transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[hsl(210_80%_55%/0.5)]",
      checked
        ? "bg-[hsl(210_80%_55%)] shadow-[0_0_8px_hsl(210_80%_55%/0.3)]"
        : "bg-[hsl(0_0%_75%)] dark:bg-[hsl(0_0%_30%)]",
      disabled && "opacity-40 cursor-not-allowed",
      !disabled && "cursor-pointer",
      className
    )}
  >
    <div className={cn(
      "absolute top-0.5 w-4 h-4 rounded-full bg-[hsl(0_0%_100%)] shadow-sm transition-transform duration-150",
      checked ? "left-[18px]" : "left-0.5"
    )} />
  </button>
);

// ── NovaSlider ───────────────────────────────────────────────

interface NovaSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

export const NovaSlider: React.FC<NovaSliderProps> = ({
  value, onChange, min = 0, max = 100, step = 1, label, showValue = true, disabled, className
}) => (
  <div className={cn("space-y-1", className)} style={{ marginBottom: SPACE.tight }}>
    {(label || showValue) && (
      <div className="flex items-center justify-between">
        {label && <span className={cn(APP_TYPE.label, "text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)]")}>{label}</span>}
        {showValue && <span className={cn(APP_TYPE.label, "font-semibold text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]")}>{value}{max === 100 ? "%" : ""}</span>}
      </div>
    )}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={e => onChange(Number(e.target.value))}
      className={cn(
        "w-full h-1 rounded-full appearance-none cursor-pointer",
        "bg-[hsl(0_0%_80%)] dark:bg-[hsl(0_0%_25%)] accent-[hsl(210_80%_55%)]",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    />
  </div>
);

// ── NovaTextArea ─────────────────────────────────────────────

interface NovaTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const NovaTextArea = React.forwardRef<HTMLTextAreaElement, NovaTextAreaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        APP_TYPE.body,
        "w-full bg-transparent border-none outline-none resize-none",
        "text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)] placeholder:text-[hsl(0_0%_50%)]",
        "focus:ring-0",
        className
      )}
      {...props}
    />
  )
);
NovaTextArea.displayName = "NovaTextArea";

// ── NovaToolbar ──────────────────────────────────────────────

interface NovaToolbarProps {
  title?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}

export const NovaToolbar: React.FC<NovaToolbarProps> = ({ title, leading, trailing, className }) => (
  <div className={cn("flex items-center justify-between w-full", className)}>
    <div className="flex items-center gap-2">
      {leading}
      {title && <NovaText variant="label" className="font-semibold">{title}</NovaText>}
    </div>
    {trailing && <div className="flex items-center gap-1">{trailing}</div>}
  </div>
);

// ── NovaBadge ────────────────────────────────────────────────

interface NovaBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const BADGE_COLORS = {
  default: "bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)]",
  success: "bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_35%)] dark:text-[hsl(152_55%_60%)]",
  warning: "bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_40%)] dark:text-[hsl(38_85%_60%)]",
  danger: "bg-[hsl(0_65%_50%/0.12)] text-[hsl(0_65%_40%)] dark:text-[hsl(0_65%_60%)]",
  info: "bg-[hsl(210_80%_55%/0.12)] text-[hsl(210_80%_40%)] dark:text-[hsl(210_80%_60%)]",
};

export const NovaBadge: React.FC<NovaBadgeProps> = ({ children, variant = "default", className }) => (
  <span className={cn(
    "inline-flex items-center rounded-full px-2 py-0.5",
    APP_TYPE.label,
    BADGE_COLORS[variant],
    className
  )}>
    {children}
  </span>
);

// ── NovaAvatar ───────────────────────────────────────────────

interface NovaAvatarProps {
  icon?: string;
  image?: string;
  size?: number;
  gradient?: string;
  className?: string;
}

export const NovaAvatar: React.FC<NovaAvatarProps> = ({
  icon, image, size = 32, gradient = "from-[hsl(265_55%_58%)] to-[hsl(210_80%_55%)]", className
}) => (
  <div
    className={cn(
      "flex items-center justify-center rounded-full bg-gradient-to-br text-[hsl(0_0%_100%)] font-semibold shrink-0 overflow-hidden",
      gradient,
      className
    )}
    style={{ width: size, height: size, fontSize: size * 0.4 }}
  >
    {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : icon || "?"}
  </div>
);
