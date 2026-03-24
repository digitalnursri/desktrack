import React from 'react';
import { cn } from './Button';

export const Badge = ({ children, variant = "default", className }) => {
  const variants = {
    default: "bg-slate-100 text-slate-600 border-slate-200",
    primary: "bg-primary-50 text-primary-700 border-primary-200",
    success: "bg-success-50 text-success-700 border-success-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-alert-50 text-alert-700 border-alert-200",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
