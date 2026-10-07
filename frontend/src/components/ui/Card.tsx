import React, { type HTMLAttributes } from 'react';

export const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-5 pb-3 border-b border-zinc-100 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`text-base font-semibold text-zinc-900 leading-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-xs text-zinc-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
