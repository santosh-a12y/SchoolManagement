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

export default function AppSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
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
        { label: "All Students", href: "/students", icon: Users },
        { label: "New Admission", href: "/students/new", icon: UserPlus },
        { label: "Search & Profile", href: "/students/search", icon: Search },
      ],
    },
    {
      title: "Academics & Exams",
      key: "academics",
      items: [
        { label: "Academic Sessions", href: "/academics/sessions", icon: Calendar },
        { label: "Classes & Sections", href: "/academics/classes", icon: School },
        { label: "Examinations", href: "/academics/examinations", icon: Award },
        { label: "Marksheets", href: "/marksheets", icon: GraduationCap },
      ],
    },
    {
      title: "Student Cards & Passes",
      items: [
        { label: "Student ID Cards", href: "/id-cards", icon: CreditCard },
        { label: "Admit Cards", href: "/admit-cards", icon: FileCheck },
      ],
    },
    {
      title: "Fee Management",
      key: "fees",
      items: [
        { label: "Fee Structures", href: "/fees", icon: BadgeDollarSign },
        { label: "Record Payment", href: "/fees/payments", icon: Receipt },
        { label: "Pending Fees", href: "/fees/pending", icon: AlertCircle },
        { label: "Fee Receipts", href: "/fees/receipts", icon: FileText },
      ],
    },
    {
      title: "School Documents",
      key: "documents",
      items: [
        { label: "Admission Form", href: "/documents/admission-form", icon: FileText },
        { label: "Certificates", href: "/documents/certificates", icon: Award },
      ],
    },
    {
      title: "System & Tools",
      items: [
        { label: "Excel Import / Export", href: "/excel", icon: Upload },
        { label: "Settings & Cloud Sync", href: "/settings", icon: Settings },
      ],
    },
  ];

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
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm group-hover:bg-blue-500 transition-colors">
              {appConfig.school.logoText || "SMS"}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight line-clamp-1">
                {appConfig.school.name}
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
          {navGroups.map((group, gIdx) => (
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
            <div className="text-white font-medium">Session: {appConfig.defaultSession}</div>
            <div className="text-[10px] text-slate-400">Affiliation: {appConfig.school.schoolCode}</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
        </div>
      </aside>
    </>
  );
}
