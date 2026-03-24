import React from 'react';
import { cn } from './Button';

export const Skeleton = ({ className }) => {
  return (
    <div className={cn("animate-pulse bg-slate-200/60 rounded", className)} />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full">
      <div className="flex px-6 py-4 border-b border-slate-100 bg-slate-50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24 mr-8" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex px-6 py-4 border-b border-slate-50">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className={cn("h-4 mr-8", j === 0 ? "w-40" : "w-24")} />
          ))}
        </div>
      ))}
    </div>
  );
};
