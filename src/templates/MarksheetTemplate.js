"use client";

import React from "react";
import appConfig from "@/config/appConfig";
import { formatDate, calculateGrade, formatPercentage } from "@/lib/formatters";
import { GRADING_SCALE } from "@/lib/constants";

/**
 * High-Fidelity Printable Marksheet Template
 * Designed for standard A4 physical document printing and PDF export.
 */
export default function MarksheetTemplate({
  student,
  examinationName = "Annual Examination",
  academicSession = "2026-27",
  marks = [],
  teacherRemarks = "",
  school: customSchool,
}) {
  const school = customSchool || appConfig.school;

  const totalMax = marks.reduce((sum, m) => sum + Number(m.maxMarks || 100), 0);
  const totalObtained = marks.reduce((sum, m) => sum + (m.isAbsent ? 0 : Number(m.marksObtained || 0)), 0);
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const overallEvaluation = calculateGrade(percentage);

  return (
    <div
      id="printable-document"
      className="printable-document bg-white text-black p-8 max-w-[210mm] mx-auto border-4 border-double border-slate-800 shadow-md print:shadow-none print:border-2 print:border-black font-sans leading-normal"
    >
      {/* School Header Banner */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
        {school.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={school.logoUrl}
            alt="School Logo"
            className="w-16 h-16 mx-auto mb-2 object-contain"
          />
        )}
        <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-sm mb-2 print:bg-black">
          Official Academic Progress Report
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">
          {school.name}
        </h1>
        <p className="text-xs text-slate-700 font-medium italic mt-0.5">
          {school.tagline}
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          {school.address} | Phone: {school.phone} | Email: {school.email}
        </p>
        <div className="text-[11px] font-semibold text-slate-800 mt-1">
          Affiliation No: {school.affiliationNo} | School Code: {school.schoolCode}
        </div>
      </div>

      {/* Examination Title */}
      <div className="text-center mb-5">
        <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900 underline underline-offset-4">
          Report Card & Marksheet — {examinationName} ({academicSession})
        </h2>
      </div>

      {/* Student Details Grid */}
      <div className="border border-slate-800 rounded-sm p-3 mb-5 text-xs bg-slate-50/50 print:bg-transparent">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
          <div>
            <span className="text-slate-600">Student Name:</span>
            <div className="font-bold text-slate-950 text-sm">{student?.studentName || "—"}</div>
          </div>
          <div>
            <span className="text-slate-600">Admission No:</span>
            <div className="font-bold text-slate-950 font-mono">{student?.admissionNumber || "—"}</div>
          </div>
          <div>
            <span className="text-slate-600">Class & Section:</span>
            <div className="font-bold text-slate-950">
              {student?.className} - {student?.section}
            </div>
          </div>
          <div>
            <span className="text-slate-600">Roll Number:</span>
            <div className="font-bold text-slate-950 font-mono">{student?.rollNumber || "—"}</div>
          </div>
          <div>
            <span className="text-slate-600">Father&apos;s Name:</span>
            <div className="font-semibold text-slate-900">{student?.fatherName || "—"}</div>
          </div>
          <div>
            <span className="text-slate-600">Mother&apos;s Name:</span>
            <div className="font-semibold text-slate-900">{student?.motherName || "—"}</div>
          </div>
          <div>
            <span className="text-slate-600">Date of Birth:</span>
            <div className="font-semibold text-slate-900">{formatDate(student?.dateOfBirth)}</div>
          </div>
          <div>
            <span className="text-slate-600">Academic Session:</span>
            <div className="font-semibold text-slate-900">{academicSession}</div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Marks Table */}
      <table className="w-full text-left text-xs border-collapse border border-slate-900 mb-5">
        <thead>
          <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-900 text-slate-900 font-bold uppercase text-[11px]">
            <th className="border border-slate-900 px-3 py-2 text-center w-12">Sl.</th>
            <th className="border border-slate-900 px-3 py-2">Subject Name</th>
            <th className="border border-slate-900 px-3 py-2 text-center w-24">Max Marks</th>
            <th className="border border-slate-900 px-3 py-2 text-center w-24">Pass Marks</th>
            <th className="border border-slate-900 px-3 py-2 text-center w-28">Marks Obtained</th>
            <th className="border border-slate-900 px-3 py-2 text-center w-20">Grade</th>
            <th className="border border-slate-900 px-3 py-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {marks.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-800">
              <td className="border border-slate-900 px-3 py-2 text-center font-mono">{idx + 1}</td>
              <td className="border border-slate-900 px-3 py-2 font-semibold text-slate-950">
                {row.subject}
              </td>
              <td className="border border-slate-900 px-3 py-2 text-center font-mono">{row.maxMarks}</td>
              <td className="border border-slate-900 px-3 py-2 text-center font-mono">{row.passMarks}</td>
              <td className="border border-slate-900 px-3 py-2 text-center font-mono font-bold text-sm">
                {row.isAbsent ? <span className="text-red-600">AB (Absent)</span> : row.marksObtained}
              </td>
              <td className="border border-slate-900 px-3 py-2 text-center font-bold">
                {row.grade || "—"}
              </td>
              <td className="border border-slate-900 px-3 py-2 text-slate-700 italic">
                {row.remarks || "Good"}
              </td>
            </tr>
          ))}

          {/* Grand Total Row */}
          <tr className="bg-slate-100 print:bg-slate-200 font-bold border-t-2 border-slate-900 text-xs">
            <td colSpan={2} className="border border-slate-900 px-3 py-2 text-right uppercase">
              Grand Total:
            </td>
            <td className="border border-slate-900 px-3 py-2 text-center font-mono text-sm">{totalMax}</td>
            <td className="border border-slate-900 px-3 py-2 text-center font-mono text-sm">
              {Math.round(totalMax * 0.33)}
            </td>
            <td className="border border-slate-900 px-3 py-2 text-center font-mono text-base font-extrabold text-blue-900 print:text-black">
              {totalObtained}
            </td>
            <td className="border border-slate-900 px-3 py-2 text-center text-sm font-extrabold">
              {overallEvaluation.grade}
            </td>
            <td className="border border-slate-900 px-3 py-2 font-bold uppercase text-emerald-800 print:text-black">
              Result: {overallEvaluation.isPassed ? "PASSED" : "NEEDS IMPROVEMENT"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Summary Box: Percentage & Result */}
      <div className="grid grid-cols-3 border border-slate-900 p-3 mb-5 text-center text-xs bg-slate-50 print:bg-transparent">
        <div>
          <span className="text-slate-600 block text-[11px] uppercase">Percentage</span>
          <span className="text-base font-extrabold text-slate-950 font-mono">
            {formatPercentage(percentage)}
          </span>
        </div>
        <div className="border-x border-slate-300">
          <span className="text-slate-600 block text-[11px] uppercase">Overall Grade</span>
          <span className="text-base font-extrabold text-blue-900 print:text-black">
            {overallEvaluation.grade} ({overallEvaluation.remark})
          </span>
        </div>
        <div>
          <span className="text-slate-600 block text-[11px] uppercase">Final Result</span>
          <span
            className={`text-base font-extrabold ${overallEvaluation.isPassed ? "text-emerald-700" : "text-red-700"
              } print:text-black`}
          >
            {overallEvaluation.isPassed ? "PASSED & PROMOTED" : "NEEDS IMPROVEMENT"}
          </span>
        </div>
      </div>

      {/* Teacher Remarks */}
      <div className="border border-slate-800 p-3 mb-6 text-xs">
        <span className="font-bold uppercase tracking-wider text-slate-900 block mb-1">
          Teacher&apos;s Comprehensive Remarks:
        </span>
        <p className="text-slate-800 italic">
          &ldquo;{teacherRemarks || marks[0]?.remarks || "Aarav shows steady academic dedication, excellent conduct, and enthusiasm for extracurricular initiatives. Promoted with honors."}&rdquo;
        </p>
      </div>

      {/* Grading Scale Legend */}
      <div className="border border-slate-400 p-2 mb-8 text-[10px] text-slate-600">
        <div className="font-bold text-slate-800 uppercase mb-1">Grading Scale (CBSE Standard):</div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center font-mono">
          {GRADING_SCALE.map((g) => (
            <div key={g.grade} className="border border-slate-200 p-0.5 rounded bg-white">
              <strong className="text-slate-900">{g.grade}</strong>: {g.minPercentage}-{Math.floor(g.maxPercentage)}%
            </div>
          ))}
        </div>
      </div>

      {/* Official Signatures */}
      <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs font-semibold text-slate-800 border-t border-slate-300">
        <div>
          <div className="h-10"></div>
          <div className="border-t border-slate-900 pt-1 font-bold">Class Teacher Signature</div>
          <span className="text-[10px] text-slate-500">Date: {new Date().toLocaleDateString("en-GB")}</span>
        </div>
        <div>
          <div className="h-10 flex items-center justify-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 border border-dashed border-slate-400 px-3 py-1 rounded">
              Institutional Seal
            </span>
          </div>
          <div className="border-t border-slate-900 pt-1 font-bold">Exam Controller Signature</div>
          <span className="text-[10px] text-slate-500">{school.name} Examination Board</span>
        </div>
        <div>
          <div className="h-10"></div>
          <div className="border-t border-slate-900 pt-1 font-bold">{school.principalName}</div>
          <span className="text-[10px] text-slate-500">{school.principalSignTitle}</span>
        </div>
      </div>
    </div>
  );
}
