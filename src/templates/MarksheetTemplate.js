"use client";

import React from "react";
import appConfig from "@/config/appConfig";
import { formatDate, calculateGrade, formatPercentage } from "@/lib/formatters";
import { GRADING_SCALE, getNextSchoolClass } from "@/lib/constants";
import { parseBoolean } from "@/lib/utils";

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

  const isAnnualExam =
    examinationName?.toLowerCase().includes("annual") ||
    examinationName?.toLowerCase().includes("final");
  const nextClass = getNextSchoolClass(student?.className);

  let totalMax = 0;
  let totalPass = 0;
  let totalRawObtained = 0;
  let totalGrace = 0;
  let hasFailedSubject = false;
  let hasGraceApplied = false;

  const processedMarks = marks.map((m) => {
    const maxMarks = Number(m.maxMarks) || 100;
    const passMarks = Number(m.passMarks) || 33;
    const isAbsent = parseBoolean(m.isAbsent);
    const marksObtained = isAbsent ? 0 : Number(m.marksObtained) || 0;
    const graceMarks = Number(m.graceMarks) || 0;
    const isGrace = parseBoolean(m.isGrace) || graceMarks > 0;
    const effectiveMarks = marksObtained + graceMarks;

    totalMax += maxMarks;
    totalPass += passMarks;
    totalRawObtained += marksObtained;
    totalGrace += graceMarks;

    const isPassed = !isAbsent && effectiveMarks >= passMarks;
    if (!isPassed) hasFailedSubject = true;
    if (isGrace && graceMarks > 0) hasGraceApplied = true;

    return {
      ...m,
      maxMarks,
      passMarks,
      marksObtained,
      graceMarks,
      isGrace,
      isAbsent,
      effectiveMarks,
      isPassed,
    };
  });

  const totalEffective = totalRawObtained + totalGrace;
  const percentage = totalMax > 0 ? (totalEffective / totalMax) * 100 : 0;
  const overallEvaluation = calculateGrade(percentage);

  // Student is officially passed only if EVERY subject is passed (effective >= passMarks and not absent)
  const isStudentPassed = processedMarks.length > 0 && !hasFailedSubject;

  // Annual promotion text
  let promotionStatusText = "";
  let finalResultBadgeText = "";

  if (isAnnualExam) {
    if (isStudentPassed) {
      finalResultBadgeText = hasGraceApplied ? "PASSED WITH GRACE" : "PASSED";
      promotionStatusText = nextClass
        ? `PROMOTED TO ${nextClass.toUpperCase()}`
        : "COURSE COMPLETED / GRADUATED";
    } else {
      finalResultBadgeText = "FAILED";
      promotionStatusText = `FAILED TO PROMOTE (DETAINED IN ${(
        student?.className || "CURRENT CLASS"
      ).toUpperCase()})`;
    }
  } else {
    // Non-annual exam (e.g. Term 1, Unit Test)
    if (isStudentPassed) {
      finalResultBadgeText = hasGraceApplied ? "PASSED WITH GRACE" : "PASSED";
      promotionStatusText = "SATISFACTORY PROGRESS";
    } else {
      finalResultBadgeText = "NEEDS IMPROVEMENT";
      promotionStatusText = "REMEDIAL SUPPORT REQUIRED";
    }
  }

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
            <th className="border border-slate-900 px-3 py-2 text-center w-32">Marks Obtained</th>
            <th className="border border-slate-900 px-3 py-2 text-center w-20">Grade</th>
            <th className="border border-slate-900 px-3 py-2">Status / Remarks</th>
          </tr>
        </thead>
        <tbody>
          {processedMarks.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-800">
              <td className="border border-slate-900 px-3 py-2 text-center font-mono">{idx + 1}</td>
              <td className="border border-slate-900 px-3 py-2 font-semibold text-slate-950">
                {row.subject}
              </td>
              <td className="border border-slate-900 px-3 py-2 text-center font-mono">{row.maxMarks}</td>
              <td className="border border-slate-900 px-3 py-2 text-center font-mono">{row.passMarks}</td>
              <td className="border border-slate-900 px-3 py-2 text-center font-mono">
                {row.isAbsent ? (
                  <span className="text-red-600 font-bold">AB (Absent)</span>
                ) : row.isGrace && row.graceMarks > 0 ? (
                  <div>
                    <span className="font-extrabold text-sm text-slate-950">
                      {row.marksObtained} + {row.graceMarks}*
                    </span>
                    <span className="text-[10px] block text-slate-600 font-semibold">
                      (= {row.effectiveMarks})
                    </span>
                  </div>
                ) : row.marksObtained < row.passMarks ? (
                  <div>
                    <span className="font-extrabold text-sm text-red-600 print:text-black">
                      {row.marksObtained}
                    </span>
                    <span className="text-[10px] block text-red-600 font-bold print:text-black">
                      (Fail)
                    </span>
                  </div>
                ) : (
                  <span className="font-extrabold text-sm text-slate-950">
                    {row.marksObtained}
                  </span>
                )}
              </td>
              <td className="border border-slate-900 px-3 py-2 text-center font-bold">
                {row.isGrace && row.graceMarks > 0 ? (
                  <span>{row.grade}*</span>
                ) : row.marksObtained < row.passMarks && !row.isAbsent ? (
                  <span className="text-red-600 print:text-black font-extrabold">{row.grade}</span>
                ) : (
                  <span>{row.grade || "—"}</span>
                )}
              </td>
              <td className="border border-slate-900 px-3 py-2 text-xs">
                {row.isAbsent ? (
                  <span className="text-red-700 font-semibold italic">Absent in Exam</span>
                ) : row.isGrace && row.graceMarks > 0 ? (
                  <span className="text-amber-900 print:text-black font-bold italic">
                    Passed with Grace (+{row.graceMarks})
                  </span>
                ) : row.marksObtained < row.passMarks ? (
                  <span className="text-red-700 print:text-black font-bold italic">
                    Failed ({row.passMarks - row.marksObtained} marks short)
                  </span>
                ) : (
                  <span className="text-emerald-800 print:text-black font-medium italic">
                    Passed {row.remarks ? `— ${row.remarks}` : ""}
                  </span>
                )}
              </td>
            </tr>
          ))}

          {/* Grand Total Row */}
          <tr className="bg-slate-100 print:bg-slate-200 font-bold border-t-2 border-slate-900 text-xs">
            <td colSpan={2} className="border border-slate-900 px-3 py-2 text-right uppercase">
              Grand Total:
            </td>
            <td className="border border-slate-900 px-3 py-2 text-center font-mono text-sm">{totalMax}</td>
            <td className="border border-slate-900 px-3 py-2 text-center font-mono text-sm">{totalPass}</td>
            <td className="border border-slate-900 px-3 py-2 text-center font-mono text-base font-extrabold text-slate-950">
              {totalGrace > 0 ? (
                <div>
                  <span>{totalRawObtained} + {totalGrace}*</span>
                  <span className="text-[10px] block text-slate-600 font-normal">(= {totalEffective})</span>
                </div>
              ) : (
                totalRawObtained
              )}
            </td>
            <td className="border border-slate-900 px-3 py-2 text-center text-sm font-extrabold">
              {overallEvaluation.grade}
            </td>
            <td className="border border-slate-900 px-3 py-2 font-bold uppercase text-slate-900">
              {isStudentPassed ? (
                <span className="text-emerald-800 print:text-black">
                  RESULT: {hasGraceApplied ? "PASSED (WITH GRACE)" : "PASSED"}
                </span>
              ) : (
                <span className="text-red-700 print:text-black">
                  RESULT: FAILED
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Summary Box: Percentage, Grade, Result & Annual Promotion Status */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-4 border-2 border-slate-900 p-3 mb-4 text-center text-xs ${
          isStudentPassed ? "bg-slate-50 print:bg-transparent" : "bg-red-50/60 print:bg-transparent"
        }`}
      >
        <div className="py-1">
          <span className="text-slate-600 block text-[11px] uppercase font-semibold">Total Percentage</span>
          <span className="text-lg font-black text-slate-950 font-mono">
            {formatPercentage(percentage)}
          </span>
        </div>
        <div className="py-1 border-t sm:border-t-0 sm:border-l border-slate-300">
          <span className="text-slate-600 block text-[11px] uppercase font-semibold">Overall Grade</span>
          <span className="text-lg font-black text-slate-900">
            {overallEvaluation.grade} <span className="text-xs font-normal text-slate-600">({overallEvaluation.remark})</span>
          </span>
        </div>
        <div className="py-1 border-t sm:border-t-0 sm:border-l border-slate-300">
          <span className="text-slate-600 block text-[11px] uppercase font-semibold">Examination Result</span>
          <span
            className={`text-base font-black ${
              isStudentPassed
                ? hasGraceApplied
                  ? "text-amber-800"
                  : "text-emerald-700"
                : "text-red-700"
            } print:text-black block`}
          >
            {finalResultBadgeText}
          </span>
        </div>
        <div className="py-1 border-t sm:border-t-0 sm:border-l border-slate-300">
          <span className="text-slate-600 block text-[11px] uppercase font-semibold">
            {isAnnualExam ? "Annual Promotion Status" : "Academic Progression"}
          </span>
          <span
            className={`text-sm font-black ${
              isStudentPassed ? "text-emerald-800" : "text-red-700"
            } print:text-black block leading-tight`}
          >
            {promotionStatusText}
          </span>
        </div>
      </div>

      {/* Notice / Footnotes for Grace and Promotion */}
      {hasGraceApplied && (
        <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-300 rounded p-2 mb-4 font-medium print:bg-transparent print:border-slate-400 print:text-black">
          <strong>* Grace Marks Notice:</strong> Asterisk (*) denotes subjects where Grace Marks were awarded to meet the mandatory passing threshold. The student is qualified for official academic promotion.
        </div>
      )}
      {!isStudentPassed && isAnnualExam && (
        <div className="text-[11px] text-red-900 bg-red-50 border border-red-300 rounded p-2 mb-4 font-semibold print:bg-transparent print:border-slate-400 print:text-black">
          <strong>Notice of Non-Promotion:</strong> The student has failed to secure the minimum pass marks in one or more required subjects and has failed to promote to the next class. The student is detained in {student?.className || "the current grade"}.
        </div>
      )}

      {/* Teacher Remarks */}
      <div className="border border-slate-800 p-3 mb-6 text-xs">
        <span className="font-bold uppercase tracking-wider text-slate-900 block mb-1">
          Teacher&apos;s Comprehensive Remarks:
        </span>
        <p className="text-slate-800 italic">
          &ldquo;
          {teacherRemarks ||
            marks[0]?.remarks ||
            (isStudentPassed
              ? "Shows steady academic dedication, excellent conduct, and enthusiasm for extracurricular initiatives. Promoted."
              : "Needs focused academic improvement and personalized guidance in deficit subjects.")}
          &rdquo;
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
