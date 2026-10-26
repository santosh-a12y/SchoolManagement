"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, Plus, Cloud, Database, UserCheck, ShieldCheck, ChevronDown, Check, Users, Shield, LogOut } from "lucide-react";
import appConfig from "@/config/appConfig";
import useSchoolSettings from "@/hooks/useSchoolSettings";
import { useAuth } from "@/context/AuthContext";

export default function AppHeader({ onOpenSidebar }) {
  const { settings } = useSchoolSettings();
  const { currentUser, users, switchUser, logout, hasPermission } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Handle outside click for user menu dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

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

        {/* Quick Action Button: New Admission (Filtered by permission) */}
        {hasPermission("students.manage") && (
          <Link
            href="/students/new"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Admission</span>
          </Link>
        )}

        {/* Staff Profile / Switcher Dropdown */}
        <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
            title="Switch User Role & Profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser?.name || "Admin Staff"}
              </div>
              <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                {currentUser?.role || "Super Admin"}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Profile & Switcher Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  Active User Profile
                </p>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{currentUser?.name}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {currentUser?.role}
                  </span>
                  {currentUser?.permissions?.includes("*") ? (
                    <span className="text-[10px] text-emerald-600 font-medium">All Permissions</span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {currentUser?.permissions?.length || 0} permissions granted
                    </span>
                  )}
                </div>
              </div>

              {/* Fast Profile Switcher */}
              <div className="p-2 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1.5">
                  Switch Active Role
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser?.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchUser(u.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          isSelected
                            ? "bg-blue-50 text-blue-900 font-bold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <div className="truncate font-medium">{u.name}</div>
                          <div className="text-[10px] text-slate-500">{u.role}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Manage Users Link */}
              <div className="p-2 border-b border-slate-100">
                <Link
                  href="/settings/users"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Manage Users & Permissions</span>
                </Link>
              </div>

              {/* Sign Out / Lock Portal */}
              <div className="p-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out / Lock Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
