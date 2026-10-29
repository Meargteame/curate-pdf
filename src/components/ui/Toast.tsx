import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

export const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/70',
    error: 'border-rose-200 bg-rose-50/70',
    info: 'border-sky-200 bg-sky-50/70',
  };

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-lg shadow-lg border text-left bg-white transition-all duration-200 min-w-[300px] max-w-sm",
        borders[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-sm font-semibold text-ink leading-tight">{toast.title}</h4>
        {toast.message && <p className="text-xs text-ink-muted mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-ink shrink-0 p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export interface TabsProps {
  tabs: Array<{ id: string; label: string; count?: number; icon?: React.ReactNode }>;
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  if (variant === 'segmented') {
    return (
      <div className={cn("inline-flex p-1 bg-paper-subtle rounded-lg border border-paper-border", className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150",
                isActive
                  ? "bg-white text-forest shadow-sm"
                  : "text-ink-muted hover:text-ink hover:bg-white/50"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", isActive ? "bg-forest-100 text-forest" : "bg-slate-200 text-slate-700")}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-6 border-b border-paper-border overflow-x-auto", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              isActive
                ? "border-forest text-forest font-semibold"
                : "border-transparent text-ink-muted hover:text-ink hover:border-slate-300"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                isActive ? "bg-forest-50 text-forest border border-forest-200" : "bg-slate-100 text-slate-600"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, description, action, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-paper-border rounded-xl bg-white/50 max-w-lg mx-auto">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-paper-subtle flex items-center justify-center text-forest mb-4 border border-paper-border">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-ink text-base">{title}</h3>
      <p className="text-xs text-ink-muted mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn("animate-pulse bg-slate-200 rounded", className)} />;
};
