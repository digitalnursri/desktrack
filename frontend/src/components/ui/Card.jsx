import React from 'react';
import { cn } from './Button';

export const Card = ({ children, className, noPadding = false, ...props }) => {
  return (
    <div 
      className={cn("bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden", className)}
      {...props}
    >
      <div className={cn(!noPadding && "p-6")}>
        {children}
      </div>
    </div>
  );
};
