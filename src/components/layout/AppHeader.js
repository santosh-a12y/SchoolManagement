"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Plus, Cloud, Database, UserCheck, ShieldCheck } from "lucide-react";
import appConfig from "@/config/appConfig";
import useSchoolSettings from "@/hooks/useSchoolSettings";

export default function AppHeader({ onOpenSidebar }) {
  const { settings } = useSchoolSettings();
  const [status, setStatus] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("app_storage_status");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {
      mode: "google_sheets", // Default to cloud sync mode
      isConfigured: true,
      activeSession: appConfig.defaultSession,
    };
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setStatus(data);
            try {
              sessionStorage.setItem("app_storage_status", JSON.stringify(data));
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Could not refresh status in header:", err);
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print">
      {/* Left: Mobile hamburger & Page Title / Breadcrumb Area */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            {settings.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-5 h-5 object-contain rounded shrink-0"
              />
            )}
            <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider truncate max-w-[280px]">
              {settings.name || appConfig.school.name}
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-800">
            Administrative Management System
          </div>
        </div>
      </div>

      {/* Right: Storage Status, Academic Session, Quick Action & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Storage Mode Indicator */}
        <Link
          href="/settings"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            status.mode === "google_sheets"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
          }`}
          title="Click to view storage settings"
        >
          {status.mode === "google_sheets" ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Google Sheets Connected</span>
              <span className="md:hidden">Sheets</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Demo Mode (Local Persistent)</span>
              <span className="md:hidden">Demo</span>
            </>
          )}
        </Link>

        {/* Academic Session Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
          <span className="text-slate-500 font-normal">Session:</span>
          <span>{status.activeSession || appConfig.defaultSession}</span>
        </div>

        {/* Quick Action Button: New Admission */}
        <Link
          href="/students/new"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Admission</span>
        </Link>

        {/* Staff Profile / Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
            AD
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-800">Admin Staff</div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              Principal Office
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
