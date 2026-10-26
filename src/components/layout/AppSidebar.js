"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Search,
  Calendar,
  GraduationCap,
  Award,
  FileSpreadsheet,
  CreditCard,
  Receipt,
  FileText,
  FileCheck,
  Settings,
  Upload,
  ChevronDown,
  School,
  X,
  BadgeDollarSign,
  AlertCircle,
} from "lucide-react";
import appConfig from "@/config/appConfig";
import useSchoolSettings from "@/hooks/useSchoolSettings";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck } from "lucide-react";

export default function AppSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { settings } = useSchoolSettings();
  const { hasPermission } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState({
    students: true,
    academics: true,
    fees: true,
    documents: true,
  });

  const toggleSubmenu = (menu) => {
    setOpenSubmenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isLinkActive = (path) => {
    if (path === "/dashboard" && (pathname === "/" || pathname === "/dashboard")) return true;
    return pathname === path || pathname.startsWith(path + "/");
  };

  const navGroups = [
    {
      title: "Core",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Student Management",
      key: "students",
      items: [
        { label: "All Students", href: "/students", icon: Users, permission: "students.view" },
        { label: "New Admission", href: "/students/new", icon: UserPlus, permission: "students.manage" },
        { label: "Search & Profile", href: "/students/search", icon: Search, permission: "students.view" },
      ],
    },
    {
      title: "Academics & Exams",
      key: "academics",
      items: [
        { label: "Academic Sessions", href: "/academics/sessions", icon: Calendar, permission: "academics.view" },
        { label: "Classes & Sections", href: "/academics/classes", icon: School, permission: "academics.view" },
        { label: "Examinations", href: "/academics/examinations", icon: Award, permission: "academics.view" },
        { label: "Marksheets", href: "/marksheets", icon: GraduationCap, permission: "marksheets.view" },
      ],
    },
    {
      title: "Student Cards & Passes",
      items: [
        { label: "Student ID Cards", href: "/id-cards", icon: CreditCard, permission: "documents.cards" },
        { label: "Admit Cards", href: "/admit-cards", icon: FileCheck, permission: "documents.cards" },
      ],
    },
    {
      title: "Fee Management",
      key: "fees",
      items: [
        { label: "Fee Structures", href: "/fees", icon: BadgeDollarSign, permission: "fees.manage" },
        { label: "Record Payment", href: "/fees/payments", icon: Receipt, permission: "fees.collect" },
        { label: "Pending Fees", href: "/fees/pending", icon: AlertCircle, permission: "fees.view" },
        { label: "Fee Receipts", href: "/fees/receipts", icon: FileText, permission: "fees.view" },
      ],
    },
    {
      title: "School Documents",
      key: "documents",
      items: [
        { label: "Admission Form", href: "/documents/admission-form", icon: FileText, permission: "documents.certificates" },
        { label: "Certificates", href: "/documents/certificates", icon: Award, permission: "documents.certificates" },
      ],
    },
    {
      title: "System & Tools",
      items: [
        { label: "Users & Permissions", href: "/settings/users", icon: ShieldCheck, permission: "system.users" },
        { label: "Excel Import / Export", href: "/excel", icon: Upload, permission: "system.excel" },
        { label: "Settings & Cloud Sync", href: "/settings", icon: Settings, permission: "system.settings" },
      ],
    },
  ];

  const permittedGroups = navGroups
    .map((group) => {
      const permittedItems = group.items.filter((item) => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
      });
      return { ...group, items: permittedItems };
    })
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden no-print"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 no-print
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand / Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={settings.name || "School Logo"}
                className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 shadow-sm border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm group-hover:bg-blue-500 transition-colors shrink-0">
                {settings.logoText || "OXFORD"}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                {settings.name || "OXFORD Academy of Excellence"}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Admin Portal</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {permittedGroups.map((group, gIdx) => (
            <div key={group.title || gIdx}>
              <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors
                        ${
                          active
                            ? "bg-blue-600 text-white font-semibold shadow-xs"
                            : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                        }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info: Current Session & School Code */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-400 flex items-center justify-between">
          <div>
            <div className="text-white font-medium">Session: {settings.activeSession || appConfig.defaultSession}</div>
            <div className="text-[10px] text-slate-400">Affiliation: {settings.affiliationNo || settings.schoolCode || appConfig.school.schoolCode}</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
        </div>
      </aside>
    </>
  );
}
