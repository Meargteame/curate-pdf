import React from 'react';
import { cn } from '../../utils/cn';

interface LogoProps {
  variant?: 'full' | 'icon' | 'monochrome' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withBadge?: boolean;
}

export const LogoSymbol: React.FC<{ size?: number; monochrome?: boolean; dark?: boolean }> = ({ 
  size = 30, 
  monochrome = false,
  dark = false 
}) => {
  const gradId = `logo-grad-${dark ? 'dark' : 'light'}-${size}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor={dark ? "#1C6047" : "#134B38"} />
          <stop offset="1" stopColor={dark ? "#09241B" : "#0A241B"} />
        </linearGradient>
      </defs>
      
      {/* Outer rounded squircle with subtle inner border */}
      <rect 
        width="32" 
        height="32" 
        rx="8" 
        fill={monochrome ? (dark ? '#FFFFFF' : '#1F2937') : `url(#${gradId})`} 
      />
      <rect 
        x="0.5" 
        y="0.5" 
        width="31" 
        height="31" 
        rx="7.5" 
        stroke={dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.15)"} 
        strokeWidth="1" 
      />

      {/* Background document sheet */}
      <rect x="7" y="10" width="13" height="15" rx="2" fill={dark ? "#174E3C" : "#2E6B53"} opacity="0.6" />

      {/* Primary foreground document sheet */}
      <rect x="10" y="7" width="15" height="18" rx="2" fill="#FAF9F5" />

      {/* Precision corner fold in signature mint accent */}
      <path d="M19 7L25 13H20.5C19.6716 13 19 12.3284 19 11.5V7Z" fill="#A7C957" />

      {/* Structured data lines */}
      <line x1="13" y1="12" x2="16.5" y2="12" stroke="#0F3D2E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="15.5" x2="22" y2="15.5" stroke="#3A7D5F" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="19" x2="19.5" y2="19" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className,
  withBadge = false,
}) => {
  const pixelSizes = {
    sm: 22,
    md: 28,
    lg: 32,
    xl: 38,
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-2xl sm:text-3xl',
  };

  const isDark = variant === 'dark';
  const isMono = variant === 'monochrome';

  if (variant === 'icon') {
    return <LogoSymbol size={pixelSizes[size]} monochrome={isMono} dark={isDark} />;
  }

  return (
    <div className={cn("inline-flex items-center gap-2 tracking-tight select-none", className)}>
      <LogoSymbol size={pixelSizes[size]} monochrome={isMono} dark={isDark} />
      <div className={cn("font-display font-extrabold flex items-baseline leading-none", textSizes[size])}>
        <span className={cn(isDark ? "text-white" : "text-ink")}>
          Curate
        </span>
        <span className={cn(
          "font-black ml-0.5",
          isDark ? "text-mint" : "text-forest"
        )}>
          PDF
        </span>
      </div>
      {withBadge && (
        <span className={cn(
          "text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-2xs ml-1 hidden xs:inline-block",
          isDark 
            ? "bg-white/10 text-mint border border-white/15" 
            : "bg-forest-50 text-forest border border-forest-200/80"
        )}>
          v2.0
        </span>
      )}
    </div>
  );
};
