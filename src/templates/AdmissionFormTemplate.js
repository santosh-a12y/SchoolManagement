"use client";

import React from "react";
import appConfig from "@/config/appConfig";
import { formatDate } from "@/lib/formatters";
import { User } from "lucide-react";

/**
 * High-Fidelity Printable Admission Form Template
 */
export default function AdmissionFormTemplate({ student }) {
  const school = appConfig.school;

  return (
    <div
      id="printable-document"
      className="printable-document bg-white text-black p-8 max-w-[210mm] mx-auto border-2 border-slate-900 shadow-md print:shadow-none print:border-2 print:border-black font-sans leading-normal"
    >
      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-950">
          {school.name}
        </h1>
        <p className="text-xs text-slate-600 font-medium">{school.address}</p>
        <p className="text-[11px] text-slate-500">
          Affiliation No: {school.affiliationNo} | Phone: {school.phone}
        </p>
        <div className="inline-block mt-2 px-4 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider print:bg-black">
          Official Student Admission & Registration Form
        </div>
      </div>

      {/* Top Meta Details & Photos */}
      <div className="flex items-start justify-between gap-4 mb-4 border border-slate-900 p-3 bg-slate-50/50 print:bg-transparent text-xs">
        <div className="space-y-1">
          <div>
            <span className="text-slate-500">Admission Number:</span>{" "}
            <strong className="text-sm font-mono text-blue-900 print:text-black">
              {student?.admissionNumber || "—"}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Academic Session:</span>{" "}
            <strong>{student?.academicSession || appConfig.defaultSession}</strong>
          </div>
          <div>
            <span className="text-slate-500">Class Admitted To:</span>{" "}
            <strong>{student?.className} - Section {student?.section}</strong>
          </div>
          <div>
            <span className="text-slate-500">Admission Date:</span>{" "}
            <strong>{formatDate(student?.admissionDate)}</strong>
          </div>
        </div>

        {/* 3 Photos: Student, Father, Mother */}
        <div className="flex items-center gap-2">
          {/* Student */}
          <div className="text-center">
            <div className="w-16 h-20 border border-slate-900 bg-slate-100 flex items-center justify-center overflow-hidden">
              {student?.studentPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.studentPhoto} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <span className="text-[9px] font-bold block mt-0.5">Student</span>
          </div>

          {/* Father */}
          <div className="text-center">
            <div className="w-16 h-20 border border-slate-900 bg-slate-100 flex items-center justify-center overflow-hidden">
              {student?.fatherPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.fatherPhoto} alt="Father" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <span className="text-[9px] font-bold block mt-0.5">Father</span>
          </div>

          {/* Mother */}
          <div className="text-center">
            <div className="w-16 h-20 border border-slate-900 bg-slate-100 flex items-center justify-center overflow-hidden">
              {student?.motherPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.motherPhoto} alt="Mother" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <span className="text-[9px] font-bold block mt-0.5">Mother</span>
          </div>
        </div>
      </div>

      {/* Part 1: Student Particulars */}
      <div className="border border-slate-900 p-3 mb-4 text-xs">
        <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 text-[11px]">
          1. Student Particulars
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
          <div>
            <span className="text-slate-500">Full Name:</span>
            <div className="font-bold text-slate-950 text-sm">{student?.studentName || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500">Date of Birth:</span>
            <div className="font-semibold">{formatDate(student?.dateOfBirth)}</div>
          </div>
          <div>
            <span className="text-slate-500">Gender:</span>
            <div className="font-semibold">{student?.gender || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500">Blood Group:</span>
            <div className="font-semibold">{student?.bloodGroup || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500">Contact Number:</span>
            <div className="font-semibold">{student?.contactNumber || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500">Email:</span>
            <div className="font-semibold truncate">{student?.email || "—"}</div>
          </div>
          <div className="sm:col-span-3">
            <span className="text-slate-500">Residential Address:</span>
            <div className="font-semibold">{student?.residentialAddress || "—"}</div>
          </div>
        </div>
      </div>

      {/* Part 2: Parent / Guardian Particulars */}
      <div className="border border-slate-900 p-3 mb-4 text-xs">
        <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 text-[11px]">
          2. Parent & Guardian Particulars
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
          <div>
            <span className="text-slate-500">Father&apos;s Name:</span>
            <div className="font-bold text-slate-950">{student?.fatherName || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500">Father&apos;s Occupation:</span>
            <div className="font-semibold">{student?.fatherOccupation || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500">Parent Mobile:</span>
            <div className="font-semibold">{student?.parentContact || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500">Mother&apos;s Name:</span>
            <div className="font-bold text-slate-950">{student?.motherName || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500">Mother&apos;s Occupation:</span>
            <div className="font-semibold">{student?.motherOccupation || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500">Parent Email:</span>
            <div className="font-semibold truncate">{student?.parentEmail || "—"}</div>
          </div>
          <div className="sm:col-span-3">
            <span className="text-slate-500">Emergency Contact Person & Phone:</span>
            <div className="font-semibold">{student?.emergencyContact || student?.parentContact || "—"}</div>
          </div>
        </div>
      </div>

      {/* Part 3: Declaration of Parent / Guardian */}
      <div className="border border-slate-900 p-3 mb-5 text-[11px] bg-slate-50/50 print:bg-transparent">
        <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-1">
          3. Declaration by Parent / Legal Guardian
        </h3>
        <p className="text-slate-700 leading-snug">
          I hereby certify that the information given above is true, complete, and correct to the best of my knowledge.
          I agree to abide by all the rules, discipline regulations, fee schedules, and codes of conduct of {school.name}.
        </p>
        <div className="flex justify-between items-end pt-8 mt-2">
          <div className="text-slate-500 text-[10px]">Date: {new Date().toLocaleDateString("en-GB")}</div>
          <div className="text-center">
            <div className="w-48 border-t border-slate-900 pt-1 font-bold text-xs">
              Signature of Parent / Guardian
            </div>
          </div>
        </div>
      </div>

      {/* Part 4: For Office Use Only */}
      <div className="border-2 border-dashed border-slate-900 p-3 text-xs">
        <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-2 text-[10px]">
          FOR OFFICE / ADMINISTRATIVE USE ONLY
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center pt-4">
          <div>
            <div className="border-t border-slate-900 pt-1 font-bold text-[11px]">Documents Verified By</div>
            <span className="text-[10px] text-slate-500">Admissions Clerk</span>
          </div>
          <div>
            <div className="border-t border-slate-900 pt-1 font-bold text-[11px]">Fee Deposit Verified</div>
            <span className="text-[10px] text-slate-500">Accounts Officer</span>
          </div>
          <div>
            <div className="border-t border-slate-900 pt-1 font-bold text-[11px]">{school.principalName}</div>
            <span className="text-[10px] text-slate-500">{school.principalSignTitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
