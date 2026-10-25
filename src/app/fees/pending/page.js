"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import feeService from "@/services/feeService";
import { formatCurrency } from "@/lib/formatters";
import { SCHOOL_CLASSES, ACADEMIC_SESSIONS } from "@/lib/constants";
import { AlertCircle, Receipt, CheckCircle2, Download } from "lucide-react";

export default function PendingFeesPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSession, setSelectedSession] = useState("2026-27");
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPendingReport = async () => {
    setIsLoading(true);
    try {
      const data = await feeService.getPendingReport(selectedSession, selectedClass);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingReport();
  }, [selectedClass, selectedSession]);

  const summary = report?.summary || {
    totalStudents: 0,
    totalApplicable: 0,
    totalCollected: 0,
    totalDiscounts: 0,
    totalPending: 0,
  };

  const studentRows = (report?.data || []).map((item) => ({
    admissionNumber: item.student.admissionNumber,
    studentName: item.student.studentName,
    className: item.student.className,
    section: item.student.section,
    rollNumber: item.student.rollNumber,
    parentContact: item.student.parentContact,
    totalApplicable: item.totalApplicable,
    totalPaid: item.totalPaid,
    totalDiscount: item.totalDiscount || 0,
    outstandingBalance: item.outstandingBalance,
    isFullyPaid: item.isFullyPaid,
  }));

  const columns = [
    {
      key: "studentName",
      label: "Student",
      sortable: true,
      render: (val, row) => (
        <div>
          <Link
            href={`/students/${row.admissionNumber}`}
            className="font-semibold text-blue-600 hover:underline block"
          >
            {val}
          </Link>
          <span className="text-xs text-slate-500 font-mono">{row.admissionNumber}</span>
        </div>
      ),
    },
    {
      key: "className",
      label: "Class & Sec",
      sortable: true,
      render: (val, row) => (
        <span className="font-medium text-slate-800">
          {val} - {row.section}
        </span>
      ),
    },
    {
      key: "parentContact",
      label: "Contact",
      render: (val) => <span className="text-xs text-slate-600">{val || "—"}</span>,
    },
    {
      key: "totalApplicable",
      label: "Total Fees",
      sortable: true,
      render: (val) => <span className="font-mono text-slate-800">{formatCurrency(val)}</span>,
    },
    {
      key: "totalPaid",
      label: "Amount Paid",
      sortable: true,
      render: (val) => (
        <span className="font-mono font-semibold text-emerald-700">{formatCurrency(val)}</span>
      ),
    },
    {
      key: "totalDiscount",
      label: "Discounts Given",
      sortable: true,
      render: (val) =>
        Number(val) > 0 ? (
          <span className="inline-block font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-200">
            - {formatCurrency(val)}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      key: "outstandingBalance",
      label: "Pending Balance",
      sortable: true,
      render: (val, row) => (
        <div>
          <span
            className={`font-mono font-bold ${
              val > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {formatCurrency(val)}
          </span>
          <div className="mt-0.5">
            <Badge variant={row.isFullyPaid ? "emerald" : "amber"} size="sm">
              {row.isFullyPaid ? "Cleared" : "Pending"}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: "action",
      label: "Collect",
      className: "text-right",
      render: (_, row) => (
        <Link href={`/fees/payments?admissionNumber=${row.admissionNumber}`}>
          <Button variant="primary" size="sm" icon={Receipt}>
            Record Fee
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Pending Fees & Collection Report"
        subtitle="Analyze fee collections, identify overdue accounts, and initiate recovery workflows"
        breadcrumbs={[
          { label: "Fees", href: "/fees" },
          { label: "Pending Fees" },
        ]}
        actions={
          <a href="/api/excel/export?type=fees" download>
            <Button variant="outline" size="sm" icon={Download}>
              Export Fee Records
            </Button>
          </a>
        }
      />

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Students
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {summary.totalStudents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active enrolled pupils</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Applicable
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {formatCurrency(summary.totalApplicable)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Annual standard fee revenue</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Total Collected
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {formatCurrency(summary.totalCollected)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Bank, UPI & cash deposits</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Total Discounts
          </span>
          <div className="text-2xl font-bold text-amber-800 mt-1 font-mono">
            {formatCurrency(summary.totalDiscounts || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Early-bird & full-pay incentives</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Pending Balance
          </span>
          <div className="text-2xl font-bold text-rose-700 mt-1 font-mono">
            {formatCurrency(summary.totalPending)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Outstanding unpaid tuition</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center gap-4">
        <div className="w-56">
          <Select
            label="Academic Session"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            options={ACADEMIC_SESSIONS.map((s) => ({ value: s.id, label: s.name }))}
          />
        </div>
        <div className="w-56">
          <Select
            label="Filter by Class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={[{ value: "", label: "All Classes" }, ...SCHOOL_CLASSES]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={studentRows}
        isLoading={isLoading}
        searchPlaceholder="Search student name, admission number, contact..."
        emptyTitle="No fee accounts found"
      />
    </AppLayout>
  );
}
