import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-surface/50 backdrop-blur-xl border border-border rounded-3xl
        ${hoverEffect ? 'hover:bg-surface/80 transition-all duration-500 hover:scale-[1.01] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

