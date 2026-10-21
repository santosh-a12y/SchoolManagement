"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import studentService from "@/services/studentService";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Search,
  User,
  CreditCard,
  GraduationCap,
  FileCheck,
  Receipt,
  FileText,
  Award,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function StudentSearchPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    studentService.getStudents().then(setStudents).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedAdmissionNo) {
      setStudentDetails(null);
      return;
    }
    setIsLoading(true);
    studentService
      .getStudentByAdmissionNumber(selectedAdmissionNo)
      .then(setStudentDetails)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedAdmissionNo]);

  const studentOptions = students.map((s) => ({
    value: s.admissionNumber,
    label: s.studentName,
    subtitle: `${s.className}-${s.section} (Roll: ${s.rollNumber || "—"})`,
  }));

  const student = studentDetails?.student;
  const feeSummary = studentDetails?.feeSummary;

  return (
    <AppLayout>
      <PageHeader
        title="Student Search & Quick Profile"
        subtitle="Lookup students by admission number or name to access instant records and generate school documents"
        breadcrumbs={[
          { label: "Students", href: "/students" },
          { label: "Search" },
        ]}
      />

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs mb-8">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
          Find Student by Admission Number or Name
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchableSelect
              value={selectedAdmissionNo}
              onChange={setSelectedAdmissionNo}
              options={studentOptions}
              placeholder="Start typing admission number (e.g. ADM-2026-001) or student name..."
            />
          </div>
          {selectedAdmissionNo && (
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={() => router.push(`/students/${selectedAdmissionNo}`)}
            >
              Full Profile
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-slate-500 text-sm">
          Loading student details...
        </div>
      )}

      {!isLoading && !student && (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300">
          <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">
            No Student Selected
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Use the search box above to select a student. Their personal information, parent details, academic marks, and fee status will appear here.
          </p>
        </div>
      )}

      {!isLoading && student && (
        <div className="space-y-6">
          {/* Main Selected Student Snapshot */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                {student.studentPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={student.studentPhoto} alt={student.studentName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{student.studentName}</h3>
                  <Badge variant={student.status === "Active" ? "emerald" : "slate"}>
                    {student.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Admission No: <strong className="text-blue-600 font-semibold">{student.admissionNumber}</strong>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Class: <strong>{student.className}-{student.section}</strong> | Roll: <strong>{student.rollNumber || "—"}</strong> | Session: <strong>{student.academicSession}</strong>
                </div>
              </div>
            </div>

            {/* Fee Status Card */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Pending Balance</span>
                <div className="text-base font-bold text-slate-900">
                  {formatCurrency(feeSummary?.outstandingBalance || 0)}
                </div>
              </div>
              <Badge variant={feeSummary?.outstandingBalance === 0 ? "emerald" : "amber"}>
                {feeSummary?.outstandingBalance === 0 ? "All Fees Paid" : "Pending"}
              </Badge>
            </div>
          </div>

          {/* Quick Action Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <Link
              href={`/students/${student.admissionNumber}`}
              className="p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col items-center gap-1.5"
            >
              <User className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-semibold text-slate-800">View Profile</span>
            </Link>

            <Link
              href={`/fees/payments?admissionNumber=${student.admissionNumber}`}
              className="p-3 bg-white rounded-lg border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all text-center flex flex-col items-center gap-1.5"
            >
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">Record Fee</span>
            </Link>

            <Link
              href={`/marksheets?admissionNumber=${student.admissionNumber}`}
              className="p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-500 hover:shadow-xs transition-all text-center flex flex-col items-center gap-1.5"
            >
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-800">Marksheet</span>
            </Link>

            <Link
              href={`/id-cards?admissionNumber=${student.admissionNumber}`}
              className="p-3 bg-white rounded-lg border border-slate-200 hover:border-purple-500 hover:shadow-xs transition-all text-center flex flex-col items-center gap-1.5"
            >
              <CreditCard className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-semibold text-slate-800">ID Card</span>
            </Link>

            <Link
              href={`/admit-cards?admissionNumber=${student.admissionNumber}`}
              className="p-3 bg-white rounded-lg border border-slate-200 hover:border-amber-500 hover:shadow-xs transition-all text-center flex flex-col items-center gap-1.5"
            >
              <FileCheck className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-semibold text-slate-800">Admit Card</span>
            </Link>

            <Link
              href={`/documents/admission-form?admissionNumber=${student.admissionNumber}`}
              className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-500 hover:shadow-xs transition-all text-center flex flex-col items-center gap-1.5"
            >
              <FileText className="w-5 h-5 text-slate-700" />
              <span className="text-xs font-semibold text-slate-800">Admission Form</span>
            </Link>
          </div>

          {/* Quick Info Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-800 border-b pb-2">
                Student & Contact Details
              </h4>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact: <strong>{student.contactNumber || student.parentContact}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email: <strong>{student.email || student.parentEmail || "—"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Address: <strong>{student.residentialAddress}</strong></span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-800 border-b pb-2">
                Family & Guardians
              </h4>
              <p>Father: <strong className="text-slate-900">{student.fatherName}</strong> ({student.fatherOccupation || "—"})</p>
              <p>Mother: <strong className="text-slate-900">{student.motherName}</strong> ({student.motherOccupation || "—"})</p>
              <p>Emergency Contact: <strong className="text-slate-900">{student.emergencyContact || student.parentContact}</strong></p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
