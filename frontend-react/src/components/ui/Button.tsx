import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-text-primary text-background hover:bg-text-secondary border border-transparent',
    secondary: 'bg-surface text-text-primary hover:bg-surfaceHighlight border border-border',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-8 py-3.5',
    icon: 'p-2 w-9 h-9',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

