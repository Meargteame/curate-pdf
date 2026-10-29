import React from 'react';
import { cn } from '../../utils/cn';
import { DocumentStatus } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'forest' | 'mint' | 'neutral';
  status?: DocumentStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  status, 
  size = 'md',
  className, 
  ...props 
}) => {
  let resolvedVariant = variant;
  if (status) {
    if (status === 'generated') resolvedVariant = 'success';
    else if (status === 'ready') resolvedVariant = 'forest';
    else if (status === 'draft') resolvedVariant = 'neutral';
    else if (status === 'archived') resolvedVariant = 'warning';
  }

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    forest: 'bg-forest-50 text-forest-900 border-forest-200',
    mint: 'bg-mint-subtle text-forest-800 border-mint/40 font-semibold',
    neutral: 'bg-paper-subtle text-ink-subtle border-paper-border',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border tracking-wide",
        variantStyles[resolvedVariant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {status === 'generated' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />}
      {status === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-forest mr-1.5" />}
      {status === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />}
      {children || status}
    </span>
  );
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'sheet' | 'interactive';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default', 
  className, 
  ...props 
}) => {
  const variantStyles = {
    default: 'bg-white border border-paper-border shadow-card rounded-card',
    subtle: 'bg-paper-subtle border border-paper-border rounded-card',
    sheet: 'bg-white border border-slate-200 shadow-sheet rounded-sheet',
    interactive: 'bg-white border border-paper-border shadow-card rounded-card hover:border-slate-300 hover:shadow-card-hover transition-all duration-150 cursor-pointer',
  };

  return (
    <div className={cn(variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
};
