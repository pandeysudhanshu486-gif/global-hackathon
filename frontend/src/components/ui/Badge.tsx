import React, { type HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] leading-3',
    md: 'px-2.5 py-0.5 text-xs leading-4',
  };

  const variantStyles = {
    default: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    secondary: 'bg-zinc-100 text-zinc-700 border border-zinc-200/80',
    outline: 'bg-transparent text-zinc-700 border border-zinc-300',
    success: 'bg-green-50 text-green-700 border border-green-200/60',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    error: 'bg-red-50 text-red-700 border border-red-200/60',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/60',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
