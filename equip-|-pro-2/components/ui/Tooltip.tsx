import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  className = ''
}) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className={`group relative flex items-center justify-center ${className}`}>
      {children}
      <div className={`
        absolute ${positions[position]}
        px-3 py-1.5 
        bg-surfaceHighlight text-text-primary text-xs font-medium 
        rounded-lg border border-border shadow-xl shadow-black/10 backdrop-blur-md
        opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 
        transition-all duration-200 ease-out pointer-events-none z-[60] whitespace-nowrap
      `}>
        {content}
      </div>
    </div>
  );
};