"use client";

import React from "react";

/**
 * Base Skeleton Element with smooth pulse animation
 */
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-md ${className}`}
      {...props}
    />
  );
}

/**
 * Table Skeleton: Renders realistic shimmering table rows matching DataTable columns
 */
export function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <div className="w-full divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-3.5 px-4 animate-pulse">
          {/* Avatar / Icon circle for first column */}
          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />

          {/* Primary name + subtext */}
          <div className="space-y-1.5 flex-1 max-w-[200px]">
            <div className="h-3.5 bg-slate-200 rounded w-3/4" />
            <div className="h-2.5 bg-slate-100 rounded w-1/2" />
          </div>

          {/* Column 2: Badge or category */}
          <div className="h-5 bg-slate-200/80 rounded-md w-24 hidden sm:block" />

          {/* Column 3: Medium text */}
          <div className="h-3.5 bg-slate-200/70 rounded w-16 hidden md:block" />

          {/* Column 4: Contact / Session */}
          <div className="space-y-1 flex-1 hidden lg:block max-w-[140px]">
            <div className="h-3 bg-slate-200/70 rounded w-full" />
            <div className="h-2.5 bg-slate-100 rounded w-2/3" />
          </div>

          {/* Column 5: Status badge */}
          <div className="h-5 bg-slate-200/80 rounded-full w-16 shrink-0" />

          {/* Actions: small icons */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <div className="w-7 h-7 bg-slate-200/60 rounded-md" />
            <div className="w-7 h-7 bg-slate-200/60 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Skeleton: Complete administrative overview shimmer
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cloud Banner Skeleton */}
      <div className="h-16 bg-slate-100 border border-slate-200 rounded-xl" />

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-slate-200 rounded w-24" />
              <div className="w-9 h-9 rounded-lg bg-slate-200" />
            </div>
            <div className="h-7 bg-slate-300 rounded w-28" />
            <div className="h-3 bg-slate-100 rounded w-36" />
          </div>
        ))}
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-20 bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-slate-200 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Split Content: Recent Activity & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-36" />
            <div className="h-4 bg-slate-100 rounded w-20" />
          </div>
          <TableSkeleton rows={5} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 rounded w-20" />
                  <div className="h-3 bg-slate-200 rounded w-12" />
                </div>
                <div className="h-2 bg-slate-100 rounded-full w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Student Profile Skeleton: Detailed student view placeholder
 */
export function StudentProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-2">
              <div className="h-6 bg-slate-300 rounded w-48" />
              <div className="flex items-center gap-2">
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded w-20" />
              </div>
              <div className="h-3.5 bg-slate-100 rounded w-32" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 bg-slate-200 rounded-lg w-24" />
            <div className="h-8 bg-slate-200 rounded-lg w-24" />
            <div className="h-8 bg-slate-200 rounded-lg w-24" />
          </div>
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <div className="h-8 bg-blue-100 rounded-lg w-28" />
        <div className="h-8 bg-slate-100 rounded-lg w-28" />
        <div className="h-8 bg-slate-100 rounded-lg w-28" />
        <div className="h-8 bg-slate-100 rounded-lg w-28" />
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-slate-50">
                <div className="h-3.5 bg-slate-100 rounded w-28" />
                <div className="h-3.5 bg-slate-200 rounded w-36" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-slate-50">
                <div className="h-3.5 bg-slate-100 rounded w-28" />
                <div className="h-3.5 bg-slate-200 rounded w-36" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card Grid Skeleton: for examinations or cards list
 */
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-32" />
            <div className="h-5 bg-slate-100 rounded-full w-16" />
          </div>
          <div className="h-3 bg-slate-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
