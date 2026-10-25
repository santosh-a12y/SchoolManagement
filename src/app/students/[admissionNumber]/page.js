"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { StudentProfileSkeleton } from "@/components/ui/Skeleton";
import StudentForm from "@/components/students/StudentForm";
import studentService from "@/services/studentService";
import { formatCurrency, formatDate, calculateGrade } from "@/lib/formatters";
import { parseBoolean } from "@/lib/utils";
import {
  User,
  CreditCard,
  GraduationCap,
  FileCheck,
  Receipt,
  FileText,
  Award,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function StudentProfilePage({ params }) {
  const unwrappedParams = use(params);
  const admissionNumber = unwrappedParams.admissionNumber;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'academics' | 'fees' | 'documents'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadStudentData = async () => {
    if (!admissionNumber || admissionNumber === "undefined") {
      setError("No valid student admission number was specified.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await studentService.getStudentByAdmissionNumber(admissionNumber);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load student details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [admissionNumber]);

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader
          title="Student Profile"
          subtitle={`Loading records for admission number ${admissionNumber}...`}
          breadcrumbs={[
            { label: "Students", href: "/students" },
            { label: admissionNumber },
          ]}
        />
        <StudentProfileSkeleton />
      </AppLayout>
    );
  }

  if (error || !data?.student) {
    return (
      <AppLayout>
        <div className="p-8 text-center bg-white rounded-xl border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Student Not Found</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-1 mb-6">
            {error || `No record found for admission number ${admissionNumber}`}
          </p>
          <Link href="/students">
            <Button variant="primary">Return to Student Directory</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { student, marks, feeSummary } = data;

  // Group marks by examination name
  const examGroups = marks.reduce((acc, m) => {
    const exam = m.examinationName || "General";
    if (!acc[exam]) acc[exam] = [];
    acc[exam].push(m);
    return acc;
  }, {});

  return (
    <AppLayout>
      <PageHeader
        title={student.studentName}
        subtitle={`Admission No: ${student.admissionNumber} | Class: ${student.className}-${student.section} | Session: ${student.academicSession}`}
        breadcrumbs={[
          { label: "Students", href: "/students" },
          { label: student.admissionNumber },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Details
            </Button>
            <Link href={`/fees/payments?admissionNumber=${student.admissionNumber}`}>
              <Button variant="outline" size="sm" icon={Receipt}>
                Record Fee
              </Button>
            </Link>
            <Link href={`/id-cards?admissionNumber=${student.admissionNumber}`}>
              <Button variant="outline" size="sm" icon={CreditCard}>
                ID Card
              </Button>
            </Link>
            <Link href={`/marksheets?admissionNumber=${student.admissionNumber}`}>
              <Button variant="primary" size="sm" icon={GraduationCap}>
                Marksheet
              </Button>
            </Link>
          </div>
        }
      />

      {/* Student Profile Hero Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Student Photo */}
            <div className="w-20 h-24 rounded-lg border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {student.studentPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.studentPhoto}
                  alt={student.studentName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{student.studentName}</h2>
                <Badge variant={student.status === "Active" ? "emerald" : "slate"}>
                  {student.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400">Class & Sec:</span>{" "}
                  <strong className="text-slate-800">
                    {student.className} - {student.section}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Roll No:</span>{" "}
                  <strong className="text-slate-800">{student.rollNumber || "—"}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Blood Group:</span>{" "}
                  <strong className="text-slate-800">{student.bloodGroup || "—"}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Date of Birth:</span>{" "}
                  <strong className="text-slate-800">{formatDate(student.dateOfBirth)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Balance Snapshot Pill */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg w-full md:w-auto shrink-0 flex items-center gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Fee Balance
              </span>
              <div className="text-lg font-bold text-slate-900">
                {formatCurrency(feeSummary?.outstandingBalance || 0)}
              </div>
            </div>
            <Badge
              variant={feeSummary?.outstandingBalance === 0 ? "emerald" : "amber"}
              size="md"
            >
              {feeSummary?.outstandingBalance === 0 ? "Fees Cleared" : "Pending Balance"}
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-4 text-xs font-semibold">
          {[
            { id: "profile", label: "Personal & Parents", icon: User },
            { id: "academics", label: "Academic & Marks", icon: GraduationCap },
            { id: "fees", label: "Fee History & Balance", icon: Receipt },
            { id: "documents", label: "Documents & Cards", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  active
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT 1: PERSONAL & PARENTS */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Personal Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-y-3 text-xs">
              <div className="text-slate-500">Gender</div>
              <div className="font-semibold text-slate-800">{student.gender}</div>

              <div className="text-slate-500">Date of Birth</div>
              <div className="font-semibold text-slate-800">{formatDate(student.dateOfBirth)}</div>

              <div className="text-slate-500">Blood Group</div>
              <div className="font-semibold text-slate-800">{student.bloodGroup || "—"}</div>

              <div className="text-slate-500">Admission Date</div>
              <div className="font-semibold text-slate-800">{formatDate(student.admissionDate)}</div>

              <div className="text-slate-500">Student Contact</div>
              <div className="font-semibold text-slate-800">{student.contactNumber || "—"}</div>

              <div className="text-slate-500">Student Email</div>
              <div className="font-semibold text-slate-800">{student.email || "—"}</div>

              <div className="text-slate-500">Residential Address</div>
              <div className="font-semibold text-slate-800">{student.residentialAddress}</div>
            </div>
          </div>

          {/* Parent & Guardian Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              Parent & Family Information
            </h3>

            {/* Father */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {student.fatherPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={student.fatherPhoto} alt="Father" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="text-xs">
                <div className="text-slate-400">Father&apos;s Name</div>
                <div className="font-bold text-slate-900">{student.fatherName}</div>
                <div className="text-slate-600">{student.fatherOccupation || "Occupation not stated"}</div>
              </div>
            </div>

            {/* Mother */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {student.motherPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={student.motherPhoto} alt="Mother" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="text-xs">
                <div className="text-slate-400">Mother&apos;s Name</div>
                <div className="font-bold text-slate-900">{student.motherName}</div>
                <div className="text-slate-600">{student.motherOccupation || "Occupation not stated"}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-xs pt-2">
              <div className="text-slate-500">Parent Contact</div>
              <div className="font-semibold text-slate-800">{student.parentContact}</div>

              <div className="text-slate-500">Parent Email</div>
              <div className="font-semibold text-slate-800">{student.parentEmail || "—"}</div>

              <div className="text-slate-500">Emergency Phone</div>
              <div className="font-semibold text-slate-800">{student.emergencyContact || student.parentContact}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ACADEMIC & MARKS */}
      {activeTab === "academics" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Examination Performance & Marksheets
            </h3>
            <Link href={`/marksheets?admissionNumber=${student.admissionNumber}`}>
              <Button variant="primary" size="sm" icon={GraduationCap}>
                Generate Printable Marksheet
              </Button>
            </Link>
          </div>

          {Object.keys(examGroups).length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
              No examination marks recorded yet for {student.studentName}.
            </div>
          ) : (
            Object.entries(examGroups).map(([examName, subjectList]) => {
              const totalMax = subjectList.reduce((sum, s) => sum + Number(s.maxMarks || 100), 0);
              const totalObt = subjectList.reduce((sum, s) => sum + (parseBoolean(s.isAbsent) ? 0 : Number(s.marksObtained || 0)), 0);
              const percentage = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
              const { grade, remark, isPassed } = calculateGrade(percentage);

              return (
                <div key={examName} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{examName}</h4>
                      <p className="text-xs text-slate-500">Session: {student.academicSession}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="text-slate-500">Total:</span>{" "}
                        <strong className="text-slate-900">
                          {totalObt} / {totalMax}
                        </strong>{" "}
                        ({percentage.toFixed(1)}%)
                      </div>
                      <Badge variant={isPassed ? "emerald" : "red"}>
                        Grade: {grade} ({isPassed ? "PASSED" : "FAILED"})
                      </Badge>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50/60 border-b border-slate-100 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-2.5">Subject</th>
                        <th className="px-4 py-2.5 text-center">Max Marks</th>
                        <th className="px-4 py-2.5 text-center">Pass Marks</th>
                        <th className="px-4 py-2.5 text-center">Marks Obtained</th>
                        <th className="px-4 py-2.5 text-center">Grade</th>
                        <th className="px-4 py-2.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {subjectList.map((sub, sIdx) => {
                        const isAbsent = parseBoolean(sub.isAbsent);
                        return (
                          <tr key={sIdx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-medium text-slate-900">{sub.subject}</td>
                            <td className="px-4 py-2.5 text-center font-mono">{sub.maxMarks}</td>
                            <td className="px-4 py-2.5 text-center font-mono">{sub.passMarks}</td>
                            <td className="px-4 py-2.5 text-center font-mono font-bold">
                              {isAbsent ? (
                                <span className="text-amber-600">ABSENT</span>
                              ) : (
                                sub.marksObtained
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                                {sub.grade}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-500">{sub.remarks || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT 3: FEE HISTORY & BALANCE */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Applicable Fees
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(feeSummary?.totalApplicable || 0)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Class {student.className} structure</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Total Amount Paid
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {formatCurrency(feeSummary?.totalPaid || 0)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Verified payments received</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Outstanding Balance
              </span>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {formatCurrency(feeSummary?.outstandingBalance || 0)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {feeSummary?.outstandingBalance === 0 ? "No pending fees" : "Action required"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Payment Transactions</h3>
            <Link href={`/fees/payments?admissionNumber=${student.admissionNumber}`}>
              <Button variant="primary" size="sm" icon={Receipt}>
                Record New Payment
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {feeSummary?.payments?.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No payment transactions recorded for this student.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Receipt No</th>
                    <th className="px-4 py-3">Fee Category</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Amount Paid</th>
                    <th className="px-4 py-3">Received By</th>
                    <th className="px-4 py-3 text-right">Receipt Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {feeSummary?.payments?.map((pay) => (
                    <tr key={pay.receiptNumber} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">
                        {pay.receiptNumber}
                      </td>
                      <td className="px-4 py-3 font-medium">{pay.feeCategory}</td>
                      <td className="px-4 py-3">{formatDate(pay.paymentDate)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                          {pay.paymentMode}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">
                        {formatCurrency(pay.amountPaid)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{pay.receivedBy}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/fees/receipts?receiptNumber=${pay.receiptNumber}`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Print Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: DOCUMENTS & CARDS */}
      {activeTab === "documents" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Admission Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Student Admission Form</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Official completed school admission form with student & parent photographs and signed declarations.
              </p>
            </div>
            <Link
              href={`/documents/admission-form?admissionNumber=${student.admissionNumber}`}
              className="mt-4"
            >
              <Button variant="outline" size="sm" className="w-full">
                View & Print Form
              </Button>
            </Link>
          </div>

          {/* Standard ID Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Standard Student ID Card</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Standard CR-80 horizontal identity card (85.6mm × 54mm) with school crest and emergency contact.
              </p>
            </div>
            <Link
              href={`/id-cards?admissionNumber=${student.admissionNumber}&format=standard`}
              className="mt-4"
            >
              <Button variant="outline" size="sm" className="w-full">
                Generate Standard ID
              </Button>
            </Link>
          </div>

          {/* Vertical ID Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Vertical Student ID Badge</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Portrait orientation badge format (54mm × 85.6mm) optimized for lanyard clips and student holders.
              </p>
            </div>
            <Link
              href={`/id-cards?admissionNumber=${student.admissionNumber}&format=vertical`}
              className="mt-4"
            >
              <Button variant="outline" size="sm" className="w-full">
                Generate Vertical ID
              </Button>
            </Link>
          </div>

          {/* Examination Admit Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Examination Admit Card</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Official hall ticket including timetable schedule, exam dates, room numbers, and rules.
              </p>
            </div>
            <Link
              href={`/admit-cards?admissionNumber=${student.admissionNumber}`}
              className="mt-4"
            >
              <Button variant="outline" size="sm" className="w-full">
                Generate Admit Card
              </Button>
            </Link>
          </div>

          {/* Academic Marksheet */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Official Marksheet</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Subject-wise mark report with maximum marks, pass criteria, percentages, and grading scale.
              </p>
            </div>
            <Link
              href={`/marksheets?admissionNumber=${student.admissionNumber}`}
              className="mt-4"
            >
              <Button variant="outline" size="sm" className="w-full">
                Generate Marksheet
              </Button>
            </Link>
          </div>

          {/* Provisional Certificate */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Provisional Certificate</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Formal character, provisional school leaving, or bonafide student institutional certificate.
              </p>
            </div>
            <Link
              href={`/documents/certificates?admissionNumber=${student.admissionNumber}`}
              className="mt-4"
            >
              <Button variant="outline" size="sm" className="w-full">
                Generate Certificate
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student — ${student.studentName}`}
        subtitle={`Admission No: ${student.admissionNumber}`}
        maxWidth="max-w-4xl"
      >
        <StudentForm
          initialData={student}
          isEdit={true}
          onSubmitSuccess={() => {
            setIsEditModalOpen(false);
            loadStudentData();
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </AppLayout>
  );
}
