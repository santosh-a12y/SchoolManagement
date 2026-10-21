"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useStudents } from "@/hooks/useStudents";
import { SCHOOL_CLASSES, SECTIONS, ACADEMIC_SESSIONS, STUDENT_STATUSES } from "@/lib/constants";
import { UserPlus, Upload, Download, Eye, Edit, CreditCard, Receipt, User } from "lucide-react";

export default function StudentsPage() {
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { students, isLoading, refetch } = useStudents({
    session: selectedSession,
    className: selectedClass,
    section: selectedSection,
    status: selectedStatus,
  });

  const columns = [
    {
      key: "studentName",
      label: "Student",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {row.studentPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.studentPhoto} alt={val} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <Link
              href={`/students/${row.admissionNumber}`}
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline block"
            >
              {val}
            </Link>
            <span className="text-xs text-slate-500 font-mono">{row.admissionNumber}</span>
          </div>
        </div>
      ),
    },
    {
      key: "className",
      label: "Class & Section",
      sortable: true,
      render: (val, row) => (
        <span className="font-medium text-slate-800">
          {val} - {row.section}
        </span>
      ),
    },
    {
      key: "rollNumber",
      label: "Roll No",
      sortable: true,
      render: (val) => <span className="font-mono text-slate-700">{val || "—"}</span>,
    },
    {
      key: "academicSession",
      label: "Session",
      sortable: true,
      render: (val) => <span className="text-xs text-slate-600">{val}</span>,
    },
    {
      key: "parentContact",
      label: "Parent Details",
      render: (val, row) => (
        <div>
          <div className="text-xs font-medium text-slate-800">{row.fatherName || row.motherName || "—"}</div>
          <div className="text-[11px] text-slate-500">{val || "—"}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val) => {
        const variant =
          val === "Active"
            ? "emerald"
            : val === "Inactive"
            ? "slate"
            : val === "Transferred"
            ? "amber"
            : "blue";
        return <Badge variant={variant}>{val || "Active"}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/students/${row.admissionNumber}`}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
            title="View Profile"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/id-cards?admissionNumber=${row.admissionNumber}`}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors"
            title="Print ID Card"
          >
            <CreditCard className="w-4 h-4" />
          </Link>
          <Link
            href={`/fees/payments?admissionNumber=${row.admissionNumber}`}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-emerald-600 transition-colors"
            title="Record Fee Payment"
          >
            <Receipt className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  const filterComponents = (
    <>
      <select
        value={selectedSession}
        onChange={(e) => setSelectedSession(e.target.value)}
        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
      >
        <option value="">All Sessions</option>
        {ACADEMIC_SESSIONS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
      >
        <option value="">All Classes</option>
        {SCHOOL_CLASSES.map((cls) => (
          <option key={cls} value={cls}>
            {cls}
          </option>
        ))}
      </select>

      <select
        value={selectedSection}
        onChange={(e) => setSelectedSection(e.target.value)}
        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
      >
        <option value="">All Sections</option>
        {SECTIONS.map((sec) => (
          <option key={sec} value={sec}>
            Sec {sec}
          </option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
      >
        <option value="">All Statuses</option>
        {STUDENT_STATUSES.map((st) => (
          <option key={st.value} value={st.value}>
            {st.label}
          </option>
        ))}
      </select>
    </>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Student Directory"
        subtitle="Manage student admissions, profiles, academic records, and status"
        breadcrumbs={[{ label: "Students" }]}
        actions={
          <>
            <Link href="/excel">
              <Button variant="outline" size="sm" icon={Upload}>
                Import Excel
              </Button>
            </Link>
            <a href="/api/excel/export?type=students" download>
              <Button variant="outline" size="sm" icon={Download}>
                Export List
              </Button>
            </a>
            <Link href="/students/new">
              <Button variant="primary" size="sm" icon={UserPlus}>
                New Admission
              </Button>
            </Link>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={students}
        searchPlaceholder="Search by admission no, name, phone, roll..."
        filterComponents={filterComponents}
        onRowClick={(row) => router.push(`/students/${row.admissionNumber}`)}
      />
    </AppLayout>
  );
}
