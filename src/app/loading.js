"use client";

import { TableSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="h-8 bg-slate-200/80 rounded-lg w-48 animate-pulse" />
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}
