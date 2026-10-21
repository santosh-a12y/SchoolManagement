"use client";

import React from "react";
import { Loader2 } from "lucide-react";

/**
 * LoadingSpinner and Skeleton Components
 */
export default function LoadingSpinner({
  size = "md",
  message = "Loading...",
  className = "",
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 text-slate-500 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-blue-600`} />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full animate-pulse divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-4 px-4">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-4 bg-slate-200 rounded flex-1"
              style={{ maxWidth: cIdx === 0 ? "18%" : "25%" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
