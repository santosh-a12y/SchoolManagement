"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  UserCheck,
  CreditCard,
  Receipt,
  GraduationCap,
  FileCheck,
  UserPlus,
  Search,
  Calendar,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Database,
  Cloud,
  CheckCircle2,
  Shield,
  Lock,
} from "lucide-react";

export default function DashboardPage() {
  const { currentUser, hasPermission } = useAuth();
  const [data, setData] = useState({
    status: { mode: "google_sheets" },
    totalStudents: 0,
    activeStudents: 0,
    activeSession: "2026-27",
    totalCollected: 0,
    totalPending: 0,
    totalApplicable: 0,
    recentPayments: [],
    recentStudents: [],
    classDistribution: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  // Permission guards for dashboard components
  const canViewStudents = hasPermission("students.view");
  const canManageStudents = hasPermission("students.manage");
  const canViewFees = hasPermission("fees.view");
  const canCollectFees = hasPermission("fees.collect");
  const canViewAcademics = hasPermission("academics.view");
  const canManageMarks = hasPermission("marks.manage") || hasPermission("marksheets.view");
  const canViewDocs = hasPermission("documents.cards");
  const canViewSettings = hasPermission("system.settings");

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fast consolidated dashboard API (1 single HTTP roundtrip)
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          return;
        }
      }
      throw new Error("Fallback to individual endpoints");
    } catch {
      // 2. Resilient fallback using Promise.allSettled to never hang
      try {
        const [statusRes, studentsRes, feeRes, paymentsRes] = await Promise.allSettled([
          fetch("/api/status").then((r) => r.json()),
          fetch("/api/students").then((r) => r.json()),
          fetch("/api/fees/pending").then((r) => r.json()),
          fetch("/api/fees/payments").then((r) => r.json()),
        ]);

        const status = statusRes.status === "fulfilled" ? statusRes.value : {};
        const students = studentsRes.status === "fulfilled" ? studentsRes.value.data || [] : [];
        const payments = paymentsRes.status === "fulfilled" ? paymentsRes.value.data || [] : [];
        const feeSummary = feeRes.status === "fulfilled" ? feeRes.value.summary || {} : {};

        const activeStudents = students.filter((s) => s.status === "Active");
        const classMap = {};
        students.forEach((s) => {
          classMap[s.className] = (classMap[s.className] || 0) + 1;
        });

        setData({
          status,
          totalStudents: students.length,
          activeStudents: activeStudents.length,
          activeSession: status.activeSession || "2026-27",
          totalCollected: feeSummary.totalCollected || 0,
          totalPending: feeSummary.totalPending || 0,
          totalApplicable: feeSummary.totalApplicable || 0,
          recentPayments: payments.slice(0, 5),
          recentStudents: students.slice(-5).reverse(),
          classDistribution: classMap,
        });
      } catch (fallbackErr) {
        console.error("Dashboard fallback error:", fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Header quick action buttons filtered by permissions
  const renderHeaderActions = () => {
    return (
      <div className="flex items-center gap-2">
        {canViewStudents && (
          <Link href="/students/search">
            <Button variant="outline" size="sm" icon={Search}>
              Quick Search
            </Button>
          </Link>
        )}
        {canManageStudents && (
          <Link href="/students/new">
            <Button variant="primary" size="sm" icon={UserPlus}>
              Add Student
            </Button>
          </Link>
        )}
        {!canManageStudents && canCollectFees && (
          <Link href="/fees/payments">
            <Button variant="primary" size="sm" icon={Receipt}>
              Record Fee
            </Button>
          </Link>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader
          title="Dashboard"
          subtitle="Real-time school performance metrics and administrative actions"
          actions={renderHeaderActions()}
        />
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  const isGoogleConnected = data?.status?.mode === "google_sheets";

  // Construct metric tiles based STRICTLY on accessed data permissions
  const metricTiles = [];

  if (canViewStudents) {
    metricTiles.push({
      id: "total-students",
      label: "Total Enrolled",
      value: data?.totalStudents,
      sublabel: "All registered students",
      icon: Users,
      bgIcon: "bg-blue-50 text-blue-600",
      valueClass: "text-slate-900 font-bold text-2xl",
    });
    metricTiles.push({
      id: "active-students",
      label: "Active Students",
      value: data?.activeStudents,
      sublabel: "Currently attending",
      icon: UserCheck,
      bgIcon: "bg-emerald-50 text-emerald-600",
      valueClass: "text-emerald-700 font-bold text-2xl",
    });
  }

  // Academic Cycle (General info or for teachers/admins)
  metricTiles.push({
    id: "session",
    label: "Academic Session",
    value: data?.activeSession,
    sublabel: "Current active cycle",
    icon: Calendar,
    bgIcon: "bg-purple-50 text-purple-600",
    valueClass: "text-purple-900 font-bold text-xl font-mono",
  });

  if (canViewFees) {
    metricTiles.push({
      id: "fees-collected",
      label: "Fee Collected",
      value: formatCurrency(data?.totalCollected),
      sublabel: "Verified deposits",
      icon: TrendingUp,
      bgIcon: "bg-emerald-50 text-emerald-600",
      valueClass: "text-emerald-700 font-bold text-2xl font-mono",
    });
    metricTiles.push({
      id: "fees-pending",
      label: "Pending Fees",
      value: formatCurrency(data?.totalPending),
      sublabel: "Outstanding balance",
      icon: AlertCircle,
      bgIcon: "bg-amber-50 text-amber-600",
      valueClass: "text-amber-700 font-bold text-2xl font-mono",
    });
  }

  // Dynamic grid cols for metric tiles
  const getGridColsClass = (count) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2";
    if (count === 3) return "grid-cols-1 sm:grid-cols-3";
    if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5";
  };

  // Quick Action Tiles filtered by permissions
  const quickActions = [
    {
      label: "Add Student",
      href: "/students/new",
      icon: UserPlus,
      color: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      hoverBorder: "hover:border-blue-500",
      allowed: canManageStudents,
    },
    {
      label: "Search Student",
      href: "/students/search",
      icon: Search,
      color: "bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white",
      hoverBorder: "hover:border-blue-500",
      allowed: canViewStudents,
    },
    {
      label: "Record Fee",
      href: "/fees/payments",
      icon: Receipt,
      color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
      hoverBorder: "hover:border-emerald-500",
      allowed: canCollectFees,
    },
    {
      label: "Marksheets",
      href: "/marksheets",
      icon: GraduationCap,
      color: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
      hoverBorder: "hover:border-indigo-500",
      allowed: canManageMarks,
    },
    {
      label: "Generate ID Card",
      href: "/id-cards",
      icon: CreditCard,
      color: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
      hoverBorder: "hover:border-purple-500",
      allowed: canViewDocs,
    },
    {
      label: "Admit Cards",
      href: "/admit-cards",
      icon: FileCheck,
      color: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
      hoverBorder: "hover:border-amber-500",
      allowed: canViewDocs || canViewAcademics,
    },
  ].filter((a) => a.allowed);

  return (
    <AppLayout>
      <PageHeader
        title={`${currentUser?.role || "Staff"} Dashboard`}
        subtitle={`Welcome, ${currentUser?.name || "Staff Member"}. Viewing data permitted for ${currentUser?.role || "your role"}.`}
        actions={renderHeaderActions()}
      />

      {/* Cloud Sync Status Banner (Only visible to Administrators with Settings permission) */}
      {canViewSettings && (
        <div
          className={`p-4 rounded-xl mb-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
            isGoogleConnected
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {isGoogleConnected ? (
              <Cloud className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Database className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div className="text-xs">
              <div className="font-bold">
                {isGoogleConnected
                  ? "Google Sheets Live Cloud Sync Active"
                  : "Running in Offline / Demo Mode (Server Persistent JSON)"}
              </div>
              <div className="text-slate-600 mt-0.5">
                {isGoogleConnected
                  ? `All student data, marks, and fees are synchronized with spreadsheet ${data?.status?.sheetId}`
                  : "All records are permanently stored locally. Connect your Google Sheets service account in Settings to sync to the cloud."}
              </div>
            </div>
          </div>

          <Link href="/settings">
            <Button
              variant={isGoogleConnected ? "outline" : "secondary"}
              size="sm"
            >
              {isGoogleConnected ? "View Connection" : "Connect Google Sheets"}
            </Button>
          </Link>
        </div>
      )}

      {/* Dynamic Summary Metrics Cards - Only Showing Permitted Data */}
      {metricTiles.length > 0 && (
        <div className={`grid ${getGridColsClass(metricTiles.length)} gap-4 mb-8`}>
          {metricTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">{tile.label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tile.bgIcon}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className={tile.valueClass}>{tile.value}</div>
                  <span className="text-[11px] text-slate-500 font-medium">{tile.sublabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Action Hub - Filtered by User Permissions */}
      {quickActions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Permitted Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {quickActions.map((act) => {
              const Icon = act.icon;
              return (
                <Link
                  key={act.href}
                  href={act.href}
                  className={`p-4 bg-white rounded-xl border border-slate-200 ${act.hoverBorder} hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${act.color} transition-colors flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">{act.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Data Section: Only Showing Permitted Tables/Visualizations */}
      {(canViewFees || canViewStudents) ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Fee Payments (Visible only if user has fee access) */}
          {canViewFees && (
            <div
              className={`${
                canViewStudents ? "lg:col-span-2" : "lg:col-span-3"
              } bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden`}
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Fee Collections</h3>
                  <p className="text-[11px] text-slate-500">Real-time payment logs and receipts</p>
                </div>
                <Link
                  href="/fees/payments"
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>View All Payments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Receipt</th>
                      <th className="px-4 py-2.5">Student Name</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {data?.recentPayments?.length > 0 ? (
                      data?.recentPayments?.map((pay) => (
                        <tr key={pay.receiptNumber} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-mono font-bold text-blue-600">
                            {pay.receiptNumber}
                          </td>
                          <td className="px-4 py-2.5 font-medium">{pay.studentName}</td>
                          <td className="px-4 py-2.5 text-slate-600">{pay.feeCategory}</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-emerald-700">
                            {formatCurrency(pay.amountPaid)}
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">{formatDate(pay.paymentDate)}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Link
                              href={`/fees/receipts?receiptNumber=${pay.receiptNumber}`}
                              className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                              Print
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                          No recent fee collections recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Class Enrollment Breakdown (Visible only if user has student access) */}
          {canViewStudents && (
            <div
              className={`${
                canViewFees ? "lg:col-span-1" : "lg:col-span-3"
              } bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4`}
            >
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Enrollment by Class</h3>
                  <p className="text-[11px] text-slate-500">Distribution of enrolled students</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {data?.activeSession}
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(data?.classDistribution || {}).length > 0 ? (
                  Object.entries(data?.classDistribution || {}).map(([cls, count]) => {
                    const total = data?.totalStudents || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={cls} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-800">{cls}</span>
                          <span className="text-slate-500">
                            <strong>{count}</strong> students ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No student records found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback for staff roles without student or fee access (e.g. specialized academic staff) */
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Welcome to your Staff Workspace</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            You are logged in as <strong>{currentUser?.name}</strong> with role <strong>{currentUser?.role}</strong>. Use the navigation sidebar or permitted quick links above to access your assigned academic modules.
          </p>
        </div>
      )}
    </AppLayout>
  );
}
