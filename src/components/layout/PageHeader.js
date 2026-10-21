"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * PageHeader Component
 * Provides clean title hierarchy, breadcrumb navigation, and page action buttons.
 */
export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [], // [{ label: 'Students', href: '/students' }, { label: 'New Admission' }]
  actions,
  className = "",
}) {
  return (
    <div className={`mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print ${className}`}>
      <div>
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Link href="/dashboard" className="hover:text-slate-800 transition-colors">
              Dashboard
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label || idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-slate-800 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-800 font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Buttons Slot */}
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
