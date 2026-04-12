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
