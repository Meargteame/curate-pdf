import React from 'react';
import { cn } from '../../utils/cn';

interface LogoProps {
  variant?: 'full' | 'icon' | 'monochrome' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LogoSymbol: React.FC<{ size?: number; monochrome?: boolean; dark?: boolean }> = ({ 
  size = 32, 
  monochrome = false,
  dark = false 
}) => {
  const bgFill = monochrome ? (dark ? '#FFFFFF' : '#1F2937') : (dark ? '#174E3C' : '#0F3D2E');
  const pageBack = monochrome ? (dark ? '#D1D5DB' : '#4B5563') : '#3A7D5F';
  const pageFront = monochrome ? (dark ? '#1F2937' : '#F3F4F6') : '#F7F6F2';
  const foldColor = monochrome ? (dark ? '#9CA3AF' : '#9CA3AF') : '#A7C957';
  const line1 = monochrome ? (dark ? '#E5E7EB' : '#1F2937') : '#0F3D2E';
  const line2 = monochrome ? (dark ? '#D1D5DB' : '#4B5563') : '#3A7D5F';
  const line3 = monochrome ? (dark ? '#9CA3AF' : '#6B7280') : '#6B7280';

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <rect width="32" height="32" rx="8" fill={bgFill} />
      {/* Background document sheet */}
      <rect x="7" y="10" width="13" height="15" rx="2" fill={pageBack} opacity={monochrome ? 0.4 : 0.7} />
      {/* Primary foreground document sheet */}
      <rect x="10" y="7" width="15" height="18" rx="2.5" fill={pageFront} />
      {/* Precision corner fold / bookmark accent */}
      <path d="M19 7L25 13H20.5C19.6716 13 19 12.3284 19 11.5V7Z" fill={foldColor} />
      {/* Structured data lines */}
      <line x1="13" y1="12" x2="16.5" y2="12" stroke={line1} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="15.5" x2="22" y2="15.5" stroke={line2} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="19" x2="19.5" y2="19" stroke={line3} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className,
}) => {
  const pixelSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const isDark = variant === 'dark';
  const isMono = variant === 'monochrome';

  if (variant === 'icon') {
    return <LogoSymbol size={pixelSizes[size]} monochrome={false} dark={false} />;
  }

  return (
    <div className={cn("inline-flex items-center gap-2.5 tracking-tight select-none", className)}>
      <LogoSymbol size={pixelSizes[size]} monochrome={isMono} dark={isDark} />
      <div className={cn("font-display font-bold flex items-center leading-none", textSizes[size])}>
        <span className={cn(isDark ? "text-white" : "text-forest")}>
          Curate
        </span>
        <span className={cn(
          "font-semibold ml-0.5 px-1 py-0.5 rounded text-[0.8em]",
          isDark 
            ? "bg-forest-700 text-mint" 
            : "bg-forest text-mint"
        )}>
          PDF
        </span>
      </div>
    </div>
  );
};
