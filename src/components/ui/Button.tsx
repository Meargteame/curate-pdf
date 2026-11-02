import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'mint' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled, 
    leftIcon, 
    rightIcon, 
    children, 
    ...props 
  }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer";
    
    const variants = {
      primary: "bg-gradient-to-b from-forest to-[#0A2B20] text-white hover:from-forest-800 hover:to-forest-950 shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_4px_16px_rgba(15,61,46,0.3)] border border-forest-950/40",
      secondary: "bg-white text-ink border border-paper-border hover:bg-paper-warm hover:border-slate-300 shadow-2xs hover:shadow-xs",
      ghost: "text-ink-subtle hover:text-ink hover:bg-slate-100/80",
      destructive: "bg-gradient-to-b from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-sm border border-red-800/30",
      mint: "bg-gradient-to-b from-mint to-[#96B748] text-forest-950 font-bold hover:brightness-105 shadow-[0_2px_12px_rgba(167,201,87,0.35)] border border-mint-dark/30",
      outline: "border border-forest/25 text-forest bg-transparent hover:bg-forest-50 hover:border-forest/40",
      glass: "bg-white/70 backdrop-blur-md border border-white/60 text-ink hover:bg-white/90 shadow-2xs",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5 font-medium",
      md: "h-9.5 px-4 text-sm rounded-xl gap-2 font-semibold",
      lg: "h-11 px-5 text-base rounded-xl gap-2.5 font-bold",
      icon: "h-9 w-9 rounded-xl p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
