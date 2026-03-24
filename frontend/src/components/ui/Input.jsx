import React from 'react';
import { cn } from './Button';

export const Input = React.forwardRef(({ className, icon: Icon, type = "text", error, ...props }, ref) => {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "w-full px-4 py-2.5 rounded-xl border bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-800 placeholder-slate-400",
            Icon && "pl-10",
            error ? "border-alert-500 focus:border-alert-500 focus:ring-alert-500/20" : "border-slate-200",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-alert-500 px-1">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
