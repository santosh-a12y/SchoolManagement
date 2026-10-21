"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/formatters";
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
} from "lucide-react";

export default function DashboardPage() {
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

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner message="Calculating dashboard analytics..." />
      </AppLayout>
    );
  }

  const isGoogleConnected = data?.status?.mode === "google_sheets";

  return (
    <AppLayout>
      <PageHeader
        title="Administrative Dashboard"
        subtitle="Real-time school performance metrics, fee collections, and student management actions"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/students/search">
              <Button variant="outline" size="sm" icon={Search}>
                Quick Search
              </Button>
            </Link>
            <Link href="/students/new">
              <Button variant="primary" size="sm" icon={UserPlus}>
                Add Student
              </Button>
            </Link>
          </div>
        }
      />

      {/* Cloud Sync Status Banner */}
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

      {/* Top 5 Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Enrolled</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{data?.totalStudents}</div>
            <span className="text-[11px] text-slate-500 font-medium">All registered students</span>
          </div>
        </div>

        {/* Active Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Students</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-700">{data?.activeStudents}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Currently attending</span>
          </div>
        </div>

        {/* Academic Session */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Academic Session</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-purple-900 font-mono">{data?.activeSession}</div>
            <span className="text-[11px] text-slate-500 font-medium">Current active cycle</span>
          </div>
        </div>

        {/* Total Fee Collection */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Fee Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              {formatCurrency(data?.totalCollected)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Verified deposits</span>
          </div>
        </div>

        {/* Total Pending Fees */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Fees</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-700 font-mono">
              {formatCurrency(data?.totalPending)}
            </div>
            <span className="text-[11px] text-amber-600 font-medium">Outstanding balance</span>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Administrative Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link
            href="/students/new"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Student</span>
          </Link>

          <Link
            href="/students/search"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Search Student</span>
          </Link>

          <Link
            href="/fees/payments"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Record Fee</span>
          </Link>

          <Link
            href="/marksheets"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Marksheets</span>
          </Link>

          <Link
            href="/id-cards"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-500 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Generate ID Card</span>
          </Link>

          <Link
            href="/admit-cards"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Admit Cards</span>
          </Link>
        </div>
      </div>

      {/* Bottom 2 Grid Columns: Recent Payments & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Fee Payments (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Fee Payments</h3>
            <Link
              href="/fees/payments"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
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
                {data?.recentPayments?.map((pay) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Class Enrollment Breakdown (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Enrollment by Class</h3>
            <span className="text-xs text-slate-500">Active Session</span>
          </div>

          <div className="space-y-3">
            {Object.entries(data?.classDistribution || {}).map(([cls, count]) => {
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
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
